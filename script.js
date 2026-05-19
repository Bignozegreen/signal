const form = document.getElementById('waitlist-form');
const btn = document.getElementById('join-btn');
const input = document.getElementById('email-input');
const confirm = document.getElementById('confirm-message');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  btn.textContent = 'Joining...';
  btn.disabled = true;

  const response = await fetch('https://formspree.io/f/mjgzkqwb', {
    method: 'POST',
    headers: { 'Accept': 'application/json' },
    body: new FormData(form)
  });

  if (response.ok) {
    form.style.display = 'none';
    confirm.classList.remove('hidden');
    confirm.classList.add('confirm');
  } else {
    btn.textContent = 'Try again';
    btn.disabled = false;
  }
});
