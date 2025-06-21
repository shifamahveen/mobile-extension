// Set your public or pre-signed S3 JSON URL here
const S3_URL = 'https://aws-ocr-extraction.s3.ap-south-1.amazonaws.com/final.json?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPH%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCmFwLXNvdXRoLTEiRjBEAiBoUZyrTzuNSG1Jfcw6Q2RU48yTkiALARSjIYtKBGponwIgP8%2FcVbjr5ZqYGCN1tE18PAJgR4v0lYkKpnF5z0HwA1EqhgMI2v%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw1MzA2NTk2ODExMDciDIATxaQCGBTU8iCDdCraAuyguZbSH0Er2SUOqnkCKDTMbXO8CJrdJaxTgvJhRVqwAqcXFzHcIcihaNaQtvRDlWRUxc2MKL5%2FDJJWUzcvHQ0NPODrVIg2U3pzBEIoXo8VZ4FI8YY1XTXTdFe5K2RrEkEfciG2ziRNO0gPU6TpY1NMklIPQlB1Xo3BFlRmAHmnvCu1aXSNg7qP1X8Ki1%2BfvQ3dLQpqh7C7Y8bOlxoTdbAW2BzEFnnHbJ2At4ANK73tNvQwELi6zThdlpHt1Mbl2xJZ7dIzDUAGLZcb%2Bi3wzakIgqpt%2F61cMv70SVWhWhaV6vzqPj%2BokhDJ6o86myEno7ioOYsfK28EQcHZUuFzbG%2BboDHuhvfnvdGMDvbRxjLaFgMfhrSsni2kB5z041cBq7bRZWJ3szC0E6Fx9SNzbAUZPXgpqJwHm1rMzXxyngk4a1ls%2BaDeSJnJ%2BuVcxbd6e1BWFlrjUMPpkUkw577bwgY6kALE6Xug5EVHE2dcb3WtGEq2TfusoMARnf%2FprCrdDtfru%2Fzv4EYXKeLDpKsZi8GQyh2YBIegRrYlPOfloTzNi4JMex%2FldWUzHKcKI%2BTFcsrhbAGIkNOlgXt7%2FC79OOCL6DQde5BcWNSCtMKvpjHgAjlbEIVhGpTvELck9FBqcZD1kr7Y7e5rPBx9a068XBwR88j1W5yY%2Bzsw21VAa7viu3sRRgi8fE9c9tIcNjZfCGa6l1L9VJ7eSa7mF39atbCWEw4pFiBadP0UlHvvyiqKJNk3T1AP1h64UIsdSTwp73xAQvYyciCbLusHKAta6bdwQ0%2BeqM4xly9spRt96osUmuIpQCsvB7WcUOtRdoK1EbfXhQ%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAXXDOIENJ5QDLYTMK%2F20250621%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250621T165152Z&X-Amz-Expires=7200&X-Amz-SignedHeaders=host&X-Amz-Signature=12bc4aa04ed935e3b798dfb43230ae96401edcfcc1969ff78b0bd4730c994584';

let jsonData = {};

window.onload = async () => {
  try {
    const res = await fetch(S3_URL);
    jsonData = await res.json();
    generateForm(Object.keys(jsonData));
    setupAutofill();
    registerServiceWorker();
  } catch (err) {
    console.error('Error fetching data:', err);
    document.getElementById('dataForm').innerHTML = '<p style="color:red;">Failed to load data from S3.</p>';
  }
};

function generateForm(keys) {
  const form = document.getElementById('dataForm');

  keys.forEach(key => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

    const label = document.createElement('label');
    label.setAttribute('for', key);
    label.innerText = formatLabel(key);

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', key);
    input.setAttribute('id', key);
    input.setAttribute('autocomplete', 'off');

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  const submit = document.createElement('button');
  submit.setAttribute('type', 'submit');
  submit.innerText = 'Submit';
  form.appendChild(submit);
}

function formatLabel(key) {
  return key.replace(/[_\-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function setupAutofill() {
  const form = document.getElementById('dataForm');
  const inputs = form.querySelectorAll('input');

  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      removeSuggestionBox();
      showSuggestion(input);
    });

    input.addEventListener('input', () => {
      removeSuggestionBox();
      showSuggestion(input);
    });

    input.addEventListener('blur', () => {
      setTimeout(removeSuggestionBox, 150); // wait to allow click
    });
  });
}

function showSuggestion(input) {
  const matchValue = findMatch(input.name);
  if (!matchValue) return;

  const suggestion = document.createElement('div');
  suggestion.className = 'suggestion-box';
  suggestion.innerText = matchValue;

  suggestion.style.cssText = `
    background: #f0f0f0;
    border: 1px solid #ccc;
    padding: 6px 10px;
    cursor: pointer;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    box-sizing: border-box;
    z-index: 10;
  `;

  // Use mousedown instead of click to prevent blur conflict
  suggestion.addEventListener('mousedown', () => {
    input.value = matchValue;
    removeSuggestionBox();
  });

  input.parentNode.appendChild(suggestion);
}


function findMatch(fieldName) {
  const lowerField = fieldName.toLowerCase();

  for (const key in jsonData) {
    if (
      key.toLowerCase() === lowerField ||
      key.toLowerCase().includes(lowerField) ||
      lowerField.includes(key.toLowerCase())
    ) {
      return jsonData[key];
    }
  }
  return '';
}

function removeSuggestionBox() {
  const boxes = document.querySelectorAll('.suggestion-box');
  boxes.forEach(box => box.remove());
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker failed:', err));
  }
}
