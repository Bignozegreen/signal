const SUPABASE_URL = 'https://ysxwnrmnmweklauqdofa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_esJUfowVS-oJWsHpSyYgKA_4mNYCm0l';

let isSignUp = false;

const form = document.getElementById('auth-form');
const submitBtn = document.getElementById('submit-btn');
const toggleLink = document.getElementById('toggle-link');
const errorMsg = document.getElementById('error-msg');
const successMsg = document.getElementById('success-msg');
const authTitle = document.querySelector('.auth-title');
const authSub = document.querySelector('.auth-sub');

toggleLink.addEventListener('click', function (e) {
  e.preventDefault();
  isSignUp = !isSignUp;
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
  if (isSignUp) {
    authTitle.textContent = 'Create your account';
    authSub.textContent = 'Start tracking narrative intelligence';
    submitBtn.textContent = 'Create Account';
    toggleLink.textContent = 'Sign in instead';
  } else {
    authTitle.textContent = 'Welcome back';
    authSub.textContent = 'Sign in to your account';
    submitBtn.textContent = 'Sign In';
    toggleLink.textContent = 'Create one';
  }
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  errorMsg.classList.add('hidden');
  successMsg.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Please wait...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const endpoint = isSignUp ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';

  try {
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (isSignUp && data.id) {
      successMsg.textContent = 'Account created! Check your email to confirm, then sign in.';
      successMsg.classList.remove('hidden');
    } else if (!isSignUp && data.access_token) {
      localStorage.setItem('signal_token', data.access_token);
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = data.error_description || data.msg || 'Something went wrong. Try again.';
      errorMsg.classList.remove('hidden');
    }
  } catch (err) {
    errorMsg.textContent = 'Connection error. Please try again.';
    errorMsg.classList.remove('hidden');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
});
