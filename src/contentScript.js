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

function isSubmitted(html) {
  let dateString = html.match(
    /<th class="cell c0" style="" scope="row">מצב ההגשה<\/th>.*?<\/td>/gms
  );
  dateString = dateString[0].replace(/<.*>\n/, '');
  dateString = dateString.replace(/<.*?>/gm, '');
  return dateString.includes('אין');
}

async function getTasksTimes() {
  const tasks = getTopElements();
  const timeString = [];
  tasks.forEach(async (task) => {
    const url = task.getElementsByTagName('a')[0]['href'];
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.responseType = 'document';
    xhr.onload = async () => {
      if (xhr.status == 200) {
        const taskPage = await xhr.response;
        const tableHtml = Array.from(taskPage.getElementsByTagName('tbody'));
        const html = String(tableHtml[0].innerHTML);
        if (isSubmitted(html)) {
          const milisec = cleanHtml(html);
          let distance = milisec - new Date().getTime();
          let spanText = task.getElementsByTagName('span');
          const count_down = countDown(distance);
          spanText[0].innerHTML =
            count_down === '' ? 'זמן ההגשה עבר' : count_down;
          if (distance < 86400000) {
            // if the date is smaller than 1 day

            spanText[0].style.backgroundColor = 'red';
            let matlot = Array.from(
              document.getElementsByClassName('dropdown')
            );

            matlot[1].style.backgroundColor = 'red';
            matlot[1].style.borderRadius = '21px';
          }
          spanText[0].style.borderRadius = '8px';
        } else {
        }
      } else {
        console.log('Error: ', xhr.status);
      }
    };
  });

  return timeString;
}

getTasksTimes();

// async function createMilisecTimes() {
//   const timeString = await getTasksTimes(tasks);
//   console.log(timeString);
//   const timeLeft = [];
//   timeString.forEach((taskPage) => {
//     dateString = dateString.match(
//       /<th class="cell c0" style="" scope="row">עד לתאריך<\/th>.*?<\/td>/gms
//     );
//     dateString = dateString[0].replace(/<.*>\n/, '');
//     dateString = dateString.replace(/<.*?>/gm, '');
//     const date_time = dateString.split(', ');
//     const date = date_time[0].split('/');
//     const time = date_time[1].split(':');
//     const date_1 = new Date(
//       date[2],
//       date[1],
//       date[0],
//       time[0],
//       time[1]
//     ).getTime();
//     timeLeft.push(date_1);
//   });
//   return timeLeft;
// }

// async function countDown(timeString) {
//   console.log('COUNT DOWN');
//   await chrome.runtime.sendMessage(
//     {
//       type: 'timeString',
//       timeString: timeString,
//     },
//     async (timeArray) => {
//       await console.log('RESPONSE: ', timeArray);
//     }
//   );
// }

// countDown(timeStrings);

// const xhr = new XMLHttpRequest();
// xhr.open('GET', urlArray[0]);
// xhr.send();
// xhr.responseType = 'document';
// xhr.onload = () => {
//   if (xhr.status == 200) {
//     const taskPage = xhr.response;
//     const tableHtml = Array.from(taskPage.getElementsByTagName('tbody'));
//     let dateString = String(tableHtml[0].innerHTML);
//     dateString = dateString.match(
//       /<th class="cell c0" style="" scope="row">עד לתאריך<\/th>.*?<\/td>/gms
//     );
//     dateString = dateString[0].replace(/<.*>\n/, '');
//     dateString = dateString.replace(/<.*?>/gm, '');
//     const date_time = dateString.split(', ');
//     const date = date_time[0].split('/');
//     const time = date_time[1].split(':');
//     const timeToExpire = new Date(
//       date[2],
//       date[1],
//       date[0],
//       time[0],
//       time[1]
//     ).getTime();
//   } else {
//     console.log(`Error: ${xhr.status}`);
//   }
// };

// tasks.forEach((task) => {
//   urlArray.push(task.getElementsByTagName('a')[0]['href']);
//   let spanText = task.getElementsByTagName('span')[0];
//   // spanText.innerText = 'PUT NEW DATE';
// });

// const url_1 = fetch(urlArray[0])
//   .then((response) => console.log(response))
//   .catch((err) => console.log(err));

// Communicate with background file by sending a message
// chrome.runtime.sendMessage(
//   {
//     type: 'GREETINGS',
//     payload: {
//       message: 'Hello, my name is Con. I am from ContentScript.',
//     },
//   },
//   (response) => {
//     console.log(response);
//   }
// );
