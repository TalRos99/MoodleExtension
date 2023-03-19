const onOffBtn = document.querySelector('.slider');

async function setButtonState(btn) {
  const onOff = await chrome.storage.local
    .get(['trigger'])
    .then((res) => res.trigger);
  const classesObj = onOff
    ? { addClass: 'enabled', removeClass: 'disabled' }
    : { addClass: 'disabled', removeClass: 'enabled' };
  onOffBtn.innerHTML = onOff ? 'On' : 'Off';
  onOffBtn.classList.add(classesObj.addClass);
  onOffBtn.classList.remove(classesObj.removeClass);
}

setButtonState(onOffBtn);
onOffBtn.onclick = async function () {
  const onOff = await chrome.storage.local
    .get(['trigger'])
    .then((res) => res.trigger);
  onOffBtn.innerHTML = !onOff ? 'On' : 'Off';
  chrome.storage.local.set({ trigger: !onOff });
  var port = chrome.runtime.connect({
    name: 'popup',
  });
  port.postMessage(!onOff);
  port.onMessage.addListener(function (msg) {
    onOffBtn.classList.add(msg.addClass);
    onOffBtn.classList.remove(msg.removeClass);
  });
};
