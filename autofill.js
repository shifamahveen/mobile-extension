const DIGITALOCEAN_URL = 'https://bot.blr1.cdn.digitaloceanspaces.com/json-temp/docket.json';
let jsonData = {};

window.onload = async () => {
  try {
    console.log('Fetching JSON...');
    const res = await fetch(DIGITALOCEAN_URL);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    jsonData = await res.json();
    console.log('JSON loaded:', jsonData);
    generateForm(Object.keys(jsonData));
    setupAutofill();
    registerServiceWorker();
  } catch (err) {
    console.error('Error fetching data:', err);
    document.getElementById('dataForm').innerHTML =
      '<p style="color:red;">Failed to load data from DigitalOcean.</p>';
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
    input.type = 'text';
    input.name = key;
    input.id = key;
    input.autocomplete = 'off';

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
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
      setTimeout(removeSuggestionBox, 150);
    });
  });
}

function showSuggestion(input) {
  const matchValue = findMatch(input.name);
  if (!matchValue) return;

  const suggestion = document.createElement('div');
  suggestion.className = 'suggestion-box';
  suggestion.innerText = matchValue;

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
  document.querySelectorAll('.suggestion-box').forEach(box => box.remove());
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('Service Worker registered'))
      .catch(err => console.error('Service Worker failed:', err));
  }
}
