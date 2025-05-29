
  // Set your backend base URL once, use everywhere
  const BASE_URL = 'https://backend-4lrl.onrender.com';

  let registeredUserId = null;

  // SIGNUP FORM HANDLER
  document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const referralCode = document.getElementById('signup-referral').value;
    const errorP = document.getElementById('signup-error');
    errorP.textContent = '';

    if (password !== confirmPassword) {
      errorP.textContent = "Passwords don't match.";
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ phone, password, referralCode })
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        errorP.textContent = "Server returned invalid JSON.";
        return;
      }

      if (!response.ok) {
        errorP.textContent = result.error || "Registration failed.";
        return;
      }

      if (result.user && result.user._id) {
        registeredUserId = result.user._id;
        closeSignupModal();
        openProfileModal();
      } else {
        errorP.textContent = result.error || "Registration failed.";
      }
    } catch (err) {
      errorP.textContent = "Registration error: " + err.message;
    }
  });

  // PROFILE COMPLETION FORM HANDLER
  document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fullName = document.getElementById('profile-fullname').value;
    const email = document.getElementById('profile-email').value;
    const dob = document.getElementById('profile-dob').value;
    const username = document.getElementById('profile-username').value;
    const errorP = document.getElementById('profile-error');
    errorP.textContent = '';

    if (!registeredUserId) {
      errorP.textContent = "No user registered.";
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/complete-profile`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ userId: registeredUserId, fullName, email, dob, username })
      });
      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        errorP.textContent = "Server returned invalid JSON.";
        return;
      }

      if (!response.ok) {
        errorP.textContent = result.error || "Profile update failed.";
        return;
      }

      if (result.user) {
        closeProfileModal();
        alert('Profile completed! You can now play or log in.');
      } else {
        errorP.textContent = result.error || "Profile update failed.";
      }
    } catch (err) {
      errorP.textContent = "Profile update error: " + err.message;
    }
  });
