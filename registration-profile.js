document.addEventListener('DOMContentLoaded', function () {
  // Toggle logic for phone/email
  const togglePhone = document.getElementById('toggle-phone');
  const toggleEmail = document.getElementById('toggle-email');
  const phoneField = document.getElementById('phone-field');
  const emailField = document.getElementById('email-field');
  const phoneLabel = document.querySelector('label[for="toggle-phone"]');
  const emailLabel = document.querySelector('label[for="toggle-email"]');

  if (togglePhone && toggleEmail && phoneField && emailField && phoneLabel && emailLabel) {
    togglePhone.addEventListener('change', () => {
      phoneField.classList.add('active');
      emailField.classList.remove('active');
      phoneLabel.classList.add('active');
      emailLabel.classList.remove('active');
      document.getElementById('signup-phone').required = true;
      document.getElementById('signup-email').required = false;
    });
    toggleEmail.addEventListener('change', () => {
      emailField.classList.add('active');
      phoneField.classList.remove('active');
      emailLabel.classList.add('active');
      phoneLabel.classList.remove('active');
      document.getElementById('signup-email').required = true;
      document.getElementById('signup-phone').required = false;
    });
  }

  // SIGNUP: Handle signup form submission
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const phoneInput = document.getElementById('signup-phone');
      const emailInput = document.getElementById('signup-email');
      const passwordInput = document.getElementById('signup-password');
      const confirmPasswordInput = document.getElementById('signup-confirm-password');
      const referralCodeInput = document.getElementById('signup-referral');
      const togglePhone = document.getElementById('toggle-phone');
      const errorP = document.getElementById('signup-error');
      if (!phoneInput || !emailInput || !passwordInput || !confirmPasswordInput || !togglePhone || !errorP) {
        console.error('Signup form inputs missing');
        return;
      }
      errorP.textContent = '';

      const isPhone = togglePhone.checked;
      const phone = isPhone ? phoneInput.value.trim() : '';
      const email = !isPhone ? emailInput.value.trim() : '';
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;
      const referralCode = referralCodeInput ? referralCodeInput.value.trim() : '';

      if (!phone && !email) {
        errorP.textContent = isPhone ? 'Phone number is required' : 'Email address is required';
        return;
      }
      if (password !== confirmPassword) {
        errorP.textContent = "Passwords don't match";
        return;
      }
      if (isPhone && !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        errorP.textContent = 'Invalid phone number';
        return;
      }
      if (!isPhone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorP.textContent = 'Invalid email address';
        return;
      }

      try {
        const response = await fetch('https://backend-4lrl.onrender.com/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, email, password, referralCode })
        });
        const result = await response.json();
        if (response.ok && result.user && result.user._id) {
          registeredUserId = result.user._id;
          document.getElementById('signupModal').style.display = 'none';
          document.getElementById('profileModal').style.display = 'flex';
        } else {
          errorP.textContent = result.error || 'Registration failed';
        }
      } catch (err) {
        errorP.textContent = 'Registration error: ' + err.message;
      }
    });
  }

  // PROFILE: Handle profile form submission
  let registeredUserId = null;
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const fullNameInput = document.getElementById('profile-fullname');
      const emailInput = document.getElementById('profile-email');
      const dobInput = document.getElementById('profile-dob');
      const usernameInput = document.getElementById('profile-username');
      const errorP = document.getElementById('profile-error');
      if (!fullNameInput || !emailInput || !dobInput || !usernameInput || !errorP) {
        console.error('Profile form inputs missing');
        return;
      }
      errorP.textContent = '';

      const fullName = fullNameInput.value.trim();
      const email = emailInput.value.trim();
      const dob = dobInput.value;
      const username = usernameInput.value.trim();

      if (!registeredUserId) {
        errorP.textContent = 'No user registered';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorP.textContent = 'Invalid email address';
        return;
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
        errorP.textContent = 'Username must be 3-20 characters, alphanumeric or underscore';
        return;
      }

      try {
        const response = await fetch('https://backend-4lrl.onrender.com/complete-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: registeredUserId, fullName, email, dob, username })
        });
        const result = await response.json();
        if (response.ok && result.user) {
          document.getElementById('profileModal').style.display = 'none';
          alert('Profile completed! You can now play or log in.');
          localStorage.setItem('isLoggedIn', 'true');
          updateTopBar(); // Defined in script.js
        } else {
          errorP.textContent = result.error || 'Profile update failed';
        }
      } catch (err) {
        errorP.textContent = 'Profile update error: ' + err.message;
      }
    });
  }

  // Modal close on outside click
  window.addEventListener('click', function (event) {
    ['signupModal', 'freeBetsModal', 'profileModal', 'login-modal', 'deposit'].forEach(function (id) {
      const modal = document.getElementById(id);
      if (modal && event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
});
