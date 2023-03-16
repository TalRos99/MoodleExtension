'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

function countDown(distance) {
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

  let hebDays = 'ימים';
  let hebHours = 'שעות';
  let hebMin = 'דקות';

  return `${days > 0 ? hebDays + ' : ' : ''}${days > 0 ? days + ' | ' : ''}${
    hours > 0 ? hebHours + ' : ' : ''
  }${hours > 0 ? hours + ' | ' : ''}${minutes > 0 ? hebMin + ' : ' : ''}${
    minutes > 0 ? minutes : ''
  } `;
}

function cleanHtml(html) {
  let dateString = html.match(
    /<th class="cell c0" style="" scope="row">עד לתאריך<\/th>.*?<\/td>/gms
  );
  dateString = dateString[0].replace(/<.*>\n/, '');
  dateString = dateString.replace(/<.*?>/gm, '');
  const date_time = dateString.split(', ');
  const date = date_time[0].split('/');
  const time = date_time[1].split(':');
  return new Date(
    date[2],
    Number(date[1]) - 1,
    date[0],
    time[0],
    time[1]
  ).getTime();
}

function isSubmitted(html) {
  let dateString = html.match(
    /<th class="cell c0" style="" scope="row">מצב ההגשה<\/th>.*?<\/td>/gms
  );
  dateString = dateString[0].replace(/<.*>\n/, '');
  dateString = dateString.replace(/<.*?>/gm, '');
  return dateString.includes('אין');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request) {
    if (request.att === 'countDown') {
      const milisec = cleanHtml(request.html);
      const distance = milisec - new Date().getTime();
      const countString = countDown(distance);
      sendResponse({ countDown: countString, distance: distance });
    }
    if (request.att === 'isSubmitted') {
      const submitted = isSubmitted(request.html);
      sendResponse(submitted);
    }
  }
});

chrome.tabs.onConnect.addListener(function (port) {
  port.onMessage.addListener(function (msg) {
    if (port.name === 'PORTRAIL') {
      const data = msg;
      console.log('DATA:, ', data);
      postMessage({ data: 'TEST' });
    }
  });
});
