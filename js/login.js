// redirect already-logged-in users straight to the main page
if (localStorage.getItem('user')) {
  window.location.href = 'index.html';
}

document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name-input').value.trim();
  const errorEl = document.getElementById('login-error');

  if (!name) {
    errorEl.textContent = 'Please enter your name.';
    errorEl.hidden = false;
    return;
  }

  errorEl.hidden = true;

  // save user identity to localStorage and set a session cookie
  localStorage.setItem('user', name);
  document.cookie = 'authorized=true; path=/';

  window.location.href = 'index.html';
});
