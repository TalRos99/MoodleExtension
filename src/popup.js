'use strict';

const onOffBtn = document.querySelector('.slider');

onOffBtn.onclick = async (e) => {
  let queryOptions = { active: true, currentWindow: true };
  let tabs = await chrome.tabs.query(queryOptions);
  const port = chrome.tabs.connect(tabs[0].id, {
    name: 'PORTRAIL',
  });
  port.postMessage({ data: 'test' });
  port.onMessage.addListener(function (msg) {
    if (msg.data) {
      onOffBtn.style.backgroundColor = 'green';
    } else {
      onOffBtn.style.backgroundColor = 'red';
    }
  });
};
