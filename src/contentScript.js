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
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.send();
    xhr.responseType = 'document';
    xhr.onload = async () => {
      if (xhr.status == 200) {
        const taskPage = await xhr.response;
        const tableHtml = Array.from(taskPage.getElementsByTagName('tbody'));
        const html = String(tableHtml[0].innerHTML);
        const submitted = await chrome.runtime.sendMessage({
          html: html,
          att: 'isSubmitted',
        });
        console.log(submitted);
        if (submitted) {
          const countDown = await chrome.runtime.sendMessage({
            html: html,
            att: 'countDown',
          });
          console.log(countDown);
          let spanText = task.getElementsByTagName('span');
          spanText[0].innerHTML =
            countDown === '' ? 'זמן ההגשה עבר' : countDown;
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
}

getTasksTimes();
