'use strict';

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

// async () => {
//   await chrome.runtime.onMessage.addListener(
//     (request, sender, sendResponse) => {
//       // if (request.type === 'GREETINGS') {
//       //   const message = `Hi ${
//       //     sender.tab ? 'Con' : 'Pop'
//       //   }, my name is Bac. I am from Background. It's great to hear from you.`;

//       //   // Log message coming from the `request` parameter
//       //   console.log(request.payload.message);
//       //   // Send a response message
//       //   sendResponse({
//       //     message,
//       //   });
//       // }

//       const urlArray = request.timeString;
//       timeString.forEach(function (taskPage) {
//         const tableHtml = Array.from(taskPage.getElementsByTagName('tbody'));
//         let dateString = String(tableHtml[0].innerHTML);
//         dateString = dateString.match(
//           /<th class="cell c0" style="" scope="row">עד לתאריך<\/th>.*?<\/td>/gms
//         );
//         dateString = dateString[0].replace(/<.*>\n/, '');
//         dateString = dateString.replace(/<.*?>/gm, '');
//         const date_time = dateString.split(', ');
//         const date = date_time[0].split('/');
//         const time = date_time[1].split(':');
//         const date_1 = new Date(
//           date[2],
//           date[1],
//           date[0],
//           time[0],
//           time[1]
//         ).getTime();
//         sendResponse(date_1);
//       });
// console.log('TIMEARRAY: ', timeArray);
// sendResponse(timeArray);
//     }
//   );
// };
