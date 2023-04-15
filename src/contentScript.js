'use strict';
const JSZip = require('jszip');
const FileSaver = require('file-saver');

function getHighElements() {
  const matalotDropdown = Array.from(
    document.getElementsByClassName('dropdown')
  ).find((el) => el.textContent.includes('מטלות'));
  const timeHtml = Array.from(
    matalotDropdown.getElementsByClassName('dropdown-item')
  );
  return timeHtml.filter((task) => !task.classList.contains('disabled'));
}

async function getTasksTimes() {
  const tasks = getHighElements();
  tasks.forEach(async (task) => {
    const url = task.getElementsByTagName('a')[0]['href'];
    var port = chrome.runtime.connect({
      name: 'content',
    });
    port.postMessage({
      url: url,
      att: 'getTaskPage',
    });
    port.onMessage.addListener(function (msg) {
      const taskSubmitted = msg.submitted;
      if (taskSubmitted) {
        const countDown = msg.countDown;
        const distance = msg.distance;
        let spanText = task.getElementsByTagName('span');
        spanText[0].innerHTML = countDown === '' ? 'זמן ההגשה עבר' : countDown;
        if (distance < 86400000) {
          // if the date is smaller than 1 day

          spanText[0].style.backgroundColor = 'red';
          let matlot = Array.from(document.getElementsByClassName('dropdown'));

          matlot[1].style.backgroundColor = 'red';
          matlot[1].style.borderRadius = '21px';
        }
        spanText[0].style.borderRadius = '8px';
      }
    });
  });
  return 'DONE';
}

async function getContentClass(section) {
  var currSection = [];
  const filesUrls = Array.from(section.getElementsByTagName('a'));
  filesUrls.forEach((fileObj) => {
    var fileName = '';
    try {
      fileName = fileObj
        .getElementsByTagName('span')[0]
        .innerText.split('\n')[0];
    } catch {
      fileName = '';
    }
    if (fileObj.innerHTML.includes('pdf')) {
      currSection.push({ fileName: fileName + '.pdf', url: fileObj['href'] });
    } else if (fileObj.innerHTML.includes('spreadsheet')) {
      currSection.push({ fileName: fileName + '.csv', url: fileObj['href'] });
    } else if (fileObj.innerHTML.includes('powerpoint')) {
      currSection.push({ fileName: fileName + '.ppt', url: fileObj['href'] });
    } else if (fileObj.innerHTML.includes('document')) {
      currSection.push({ fileName: fileName + '.doc', url: fileObj['href'] });
    } else if (fileObj.innerHTML.includes('unknown')) {
      currSection.push({ fileName: fileName + '.txt', url: fileObj['href'] });
    }
  });

  return currSection;
}

async function saveFunc(blob, filename) {
  if (window.showSaveFilePicker) {
    const opts = {
      types: [
        {
          description: 'zipFile',
          accept: { 'application/zip': ['.zip'] },
        },
      ],
      suggestedName: filename,
    };
    var handle = await showSaveFilePicker(opts);
    var writable = await handle.createWritable();
    await writable.write(blob);
    writable.close();
  }
}
const saveZip = async (filename, urlAndNames) => {
  if (!urlAndNames) return;
  const zip = new JSZip();
  var i = 1;
  urlAndNames.forEach((file) => {
    const url = file.url;
    const blobPromise = fetch(url).then((r) => {
      if (r.status === 200) return r.blob();
      return Promise.reject(new Error(r.statusText));
    });
    zip.file(file.fileName, blobPromise);
  });
  zip.generateAsync({ type: 'blob' }).then((blob) => saveFunc(blob, filename));
};

async function getAllReleventSections() {
  var id = 0;
  try {
    const contentClass = Array.from(document.getElementsByClassName('content'));
    const releventPage = contentClass[0].baseURI.startsWith(
      'https://md.hit.ac.il/course'
    );
    if (releventPage) {
      contentClass.forEach(async (section) => {
        const downloadFilesList = Array.from(
          section.getElementsByTagName('ul')
        );
        const urlsArrays = await getContentClass(section);
        if (urlsArrays.length) {
          const sectionName = section.getElementsByTagName('h3')[0].innerText;
          const idSelector = `dbtn${id++}`;
          downloadFilesList[0].innerHTML =
            downloadFilesList[0].innerHTML +
            `<div class="download" id="${idSelector}" title="Downloads the following format: pdf, csv, doc, ppt. \nCode will download in txt format">  <i class="fa fa-download"></i><span>Download All</span>     </div>`;
          const downloadSection = section.getElementsByClassName('download');
          const downloadIcon = downloadSection[0].getElementsByTagName('i');

          downloadSection[0].style.width = '130px';
          downloadSection[0].style.backgroundColor = '#27be48';
          downloadSection[0].style.color = '#fff';
          downloadSection[0].style.padding = '8px';
          downloadSection[0].style.transition = '1s ease';
          downloadSection[0].style.marginTop = '15px';
          downloadSection[0].style.marginRight = '5px';
          downloadSection[0].style.textAlign = 'center';
          downloadSection[0].style.cursor = 'pointer';
          downloadSection[0].style.borderRadius = '15px';

          downloadIcon[0].style.marginLeft = '10px';
          const proptiesObj = {
            urlsArrays: urlsArrays,
            sectionName: sectionName,
          };
          var setObj = {};
          setObj[idSelector] = proptiesObj;
          chrome.storage.local.set(setObj);
          chrome.storage.local.set({ totalBtns: id });
        }
      });
    }
  } catch (e) {
    return;
  }
}
async function setBtnFunctions() {
  const { totalBtns } = await chrome.storage.local.get(['totalBtns']);
  for (var btnId = 0; btnId < totalBtns; btnId++) {
    const downloadBtn = document.getElementById('dbtn' + btnId);
    try {
      downloadBtn.onclick = async function () {
        downloadBtn.style.cursor = 'progress';
        const id = downloadBtn.id;
        await chrome.storage.local.get([id]).then((btnData) => {
          return saveZip(btnData[id].sectionName, btnData[id].urlsArrays);
        });
        downloadBtn.style.cursor = 'pointer';
      };
    } catch (e) {
      return;
    }
  }
}

async function startPause() {
  const { trigger } = await chrome.storage.local.get(['trigger']);
  if (trigger) {
    getTasksTimes();
    getAllReleventSections();
    setBtnFunctions();
  }
}

startPause();
