import { fetchData, getSaved, setSaved } from './api.js';

// redirect to login if no user session
if (!localStorage.getItem('user')) {
  window.location.href = 'login.html';
}

document.getElementById('nav-user').textContent = localStorage.getItem('user') || '';

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('user');
  document.cookie = 'authorized=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
  window.location.href = 'login.html';
});

// --- State ---
// keep your application state as an array of objects
let savedItems = getSaved();

function showLoading() {}

function showError(message) {}

function renderResults(items) {
  // create a card element for each item
  // the click handler inside forEach closes over the item — this is your closure
  items.forEach(item => {
    const card = document.createElement('article');
    // build and append card content here
    document.getElementById('results-grid').appendChild(card);
  });
}

document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  // validate, call fetchData, call showLoading/showError, call renderResults
});
