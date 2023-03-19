'use strict';

function getTopElements() {
  const higherPart = Array.from(
    document.getElementsByClassName('dropdown')
  ).find((el) => el.textContent.includes('מטלות'));

  const changeTime = Array.from(
    higherPart.getElementsByClassName('dropdown-item')
  );
  return changeTime.filter((task) => !task.classList.contains('disabled'));
}

async function getTasksTimes() {
  const tasks = getTopElements();
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
      const submitted = msg.submitted;
      if (submitted) {
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

async function startPause() {
  const { trigger } = await chrome.storage.local.get(['trigger']);
  trigger ? getTasksTimes() : '';
}

startPause();
