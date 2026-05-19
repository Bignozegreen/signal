const btn = document.getElementById('join-btn');
const input = document.getElementById('email-input');
const confirm = document.getElementById('confirm-message');

btn.addEventListener('click', function () {
  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    input.style.borderColor = '#ff6a6a';
    return;
  }
  input.style.borderColor = '#7c6aff';
  btn.disabled = true;
  btn.textContent = 'Joined!';
  confirm.classList.remove('hidden');
  confirm.classList.add('confirm');
});
