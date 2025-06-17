document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.getElementById('signupForm');

  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const countryInput = document.getElementById('signup-country');
      const phoneInput = document.getElementById('signup-phone');
      const passwordInput = document.getElementById('signup-password');
      const errorP = document.getElementById('signup-error');

      if (!countryInput || !phoneInput || !passwordInput || !errorP) {
        alert('Signup form setup error. Check input IDs.');
        return;
      }

      const country = countryInput.value.trim();
      const phone = phoneInput.value.trim();
      const password = passwordInput.value;

      errorP.textContent = '';

      if (password.length < 6) {
        errorP.textContent = "Password must be at least 6 characters.";
        return;
      }

      try {
        const response = await fetch('https://your-backend-url/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country, phone, password })
        });

        const result = await response.json();

        if (response.ok && result.user && result.user._id) {
          alert("Registration successful!");
          if (typeof closeSignupModal === "function") closeSignupModal();
          if (typeof openLoginModal === "function") openLoginModal();
        } else {
          errorP.textContent = result.error || "Registration failed.";
        }
      } catch (err) {
        errorP.textContent = "Registration error.";
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const phoneInput = document.getElementById('login-phone');
      const passwordInput = document.getElementById('login-password');
      const errorP = document.getElementById('login-error');

      if (!phoneInput || !passwordInput || !errorP) {
        alert('Login form setup error. Check input IDs.');
        return;
      }

      const phone = phoneInput.value.trim();
      const password = passwordInput.value;

      errorP.textContent = '';

      try {
        const response = await fetch('https://your-backend-url/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        });

        const result = await response.json();

        if (response.ok && result.user && result.user._id) {
          errorP.textContent = "Login successful!";
          localStorage.setItem('isLoggedIn', 'true');
          if (typeof updateAuthButtons === "function") updateAuthButtons();
        } else {
          errorP.textContent = result.error || "Login failed.";
        }
      } catch (err) {
        errorP.textContent = "Login error.";
      }
    });
  }
});
