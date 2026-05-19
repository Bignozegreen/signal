const form = document.getElementById('waitlist-form');
const btn = document.getElementById('join-btn');
const confirm = document.getElementById('confirm-message');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  btn.textContent = 'Joining...';
  btn.disabled = true;

  const email = document.getElementById('email-input').value.trim();

  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (data.success) {
      form.style.display = 'none';
      confirm.classList.remove('hidden');
      confirm.classList.add('confirm');
    } else {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  } catch (err) {
    btn.textContent = 'Try again';
    btn.disabled = false;
  }
});
