const onOffBtn = document.querySelector('.slider');

onOffBtn.onclick = async function () {
  const onOff = await chrome.storage.local
    .get(['trigger'])
    .then((res) => res.trigger);
  chrome.storage.local.set({ trigger: !onOff });
  var port = chrome.runtime.connect({
    name: 'popup',
  });
  console.log('POST: ', !onOff);
  port.postMessage(!onOff);
  port.onMessage.addListener(function (msg) {
    console.log('RETURNED: ', msg);
    onOffBtn.classList.add(msg.addClass);
    onOffBtn.classList.remove(msg.removeClass);
  });
};
