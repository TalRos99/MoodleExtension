'use-strict';

chrome.storage.local.set({ trigger: true });

const monthDict = {
  ינואר: 1,
  פברואר: 2,
  מרץ: 3,
  אפריל: 4,
  מאי: 5,
  יוני: 6,
  יולי: 7,
  אוגוסט: 8,
  ספטמבר: 9,
  אוקטובר: 10,
  נובמבר: 11,
  דצמבר: 12,
};

function countDown(distance) {
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  let hebDays = 'ימים';
  let hebHours = 'שעות';
  let hebMin = 'דקות';

  return `${days > 0 ? hebDays + ' : ' : ''}${days > 0 ? days + ' | ' : ''}${
    hours > 0 ? hebHours + ' : ' : ''
  }${hours > 0 ? hours : ''}${
    minutes > 0 ? (hours > 0 ? ' | ' : '') + hebMin + ' : ' : ''
  }${minutes > 0 ? minutes : ''} `;
}

async function cleanHtml(html) {
  let dateString = html.match(
    /<th class="cell c0" style="" scope="row">עד לתאריך<\/th>.*?<\/td>/gms
  );
  dateString = dateString[0].replace(/<.*>\n/, '');
  dateString = dateString.replace(/<.*?>/gm, '');
  const date_time = dateString.split(', ');
  const date = date_time[1].split(' ');
  const time = date_time[2].split(' ');
  const ampm = time[1] == 'PM' ? 12 : 0;
  const hh_mm = time[0].split(':');
  const milisec = new Date(
    date[2],
    monthDict[date[1]] - 1,
    date[0],
    Number(hh_mm[0]) + ampm,
    hh_mm[1]
  ).getTime();
  return milisec - new Date().getTime();
}

async function isSubmitted(html) {
  let dateString = html.match(
    /<th class="cell c0" style="" scope="row">מצב ההגשה<\/th>.*?<\/td>/gms
  );
  dateString = dateString[0].replace(/<.*>\n/, '');
  dateString = dateString.replace(/<.*?>/gm, '');
  return dateString.includes('אין');
}
async function getTaskPage(url) {
  const resp = await fetch(url);
  var taskPage = await resp.text();
  taskPage = String(taskPage);
  const tableHtml = taskPage.match(/<tbody.*?>.*<\/tbody>/gms);
  return tableHtml[0];
}

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (port.name === 'popup') {
      chrome.storage.local.set({ trigger: msg });
      port.postMessage(
        msg
          ? { addClass: 'enabled', removeClass: 'disabled' }
          : { addClass: 'disabled', removeClass: 'enabled' }
      );
    }
  });
});

chrome.runtime.onConnect.addListener(async function (port) {
  port.onMessage.addListener(async function (msg) {
    if (port.name === 'content') {
      const html = await getTaskPage(msg.url);
      const submitted = await isSubmitted(html);
      const distance = (await submitted) ? await cleanHtml(html) : null;
      const countDownTime = (await distance) ? countDown(distance) : null;
      port.postMessage({
        submitted: submitted,
        distance: distance,
        countDown: countDownTime,
      });
    }
    if (port.name === 'download') {
      const urlsArray = msg.releventUrls;
      const zip = new JSZip();
      const folder = zip.folder('C:/');
      var i = 1;
      const bolbsArray = [];
      urlsArray.forEach((url) => {
        console.log(url);
        const blobPromise = fetch(url).then((r) => {
          if (r.status === 200) return r.blob();
          return Promise.reject(new Error(r.statusText));
        });
        const name = `pd${i++}.pdf`;
        folder.file(name, blobPromise);
      });

      zip
        .generateAsync({ type: 'blob' })
        .then((blob) => port.postMessage(blob));
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request) {
    if (request.att === 'onOff') {
      const trigger = getTrigger();
      sendResponse({ trigger: trigger });
    }
  }
});
