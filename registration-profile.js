// =========================
// PASSWORD VALIDATION FUNCTION
// =========================
function isPasswordValid(password) {
  // At least 8 characters, at least one letter and one number
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// =========================
// Modal open/close logic
// =========================
function openSignupModal() { document.getElementById('signupModal').style.display = 'flex'; }
function closeSignupModal() { document.getElementById('signupModal').style.display = 'none'; }
function openLoginModal()   { document.getElementById('login-modal').style.display = 'block'; }
function closeLoginModal()  { document.getElementById('login-modal').style.display = 'none'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }
function openTicketsModal() { document.getElementById('ticketsModal').style.display = 'block'; }
function closeTicketsModal() { document.getElementById('ticketsModal').style.display = 'none'; }
function openBetHistoryModal() { document.getElementById('betHistoryModal').style.display = 'block'; }
function closeBetHistoryModal() { document.getElementById('betHistoryModal').style.display = 'none'; }

// Modal close on outside click (signup/freebets/login)
window.addEventListener('click', function (event) {
  ['signupModal', 'freeBetsModal', 'login-modal'].forEach(function (id) {
    var modal = document.getElementById(id);
    if (modal && event.target === modal) { closeModal(id); }
  });
});

// =========================
// Registration (Signup)
// =========================
document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const usernameInput         = document.getElementById('signup-username');
  const emailInput            = document.getElementById('signup-email');
  const passwordInput         = document.getElementById('signup-password');
  const confirmPasswordInput  = document.getElementById('signup-confirm-password');
  const referralInput         = document.getElementById('signup-referral');
  const errorP                = document.getElementById('signup-error');

  if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput || !referralInput || !errorP) {
    alert('Signup form is not set up correctly. Please check your HTML input IDs.');
    return;
  }

  const username       = usernameInput.value.trim();
  const email          = emailInput.value.trim();
  const password       = passwordInput.value;
  const confirmPassword= confirmPasswordInput.value;
  const referralCode   = referralInput.value.trim();
  errorP.textContent   = '';

  if (!isPasswordValid(password)) {
    errorP.textContent = "Password must be at least 8 characters, include at least one letter and one number.";
    return;
  }
  if (password !== confirmPassword) {
    errorP.textContent = "Passwords don't match.";
    return;
  }

  try {
    const response = await fetch('https://backend-4lrl.onrender.com/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, email, password, referralCode })
    });
    const result = await response.json();
    if (response.ok && result.user && result.user._id) {
      alert('Registration successful! You can now log in.');
      closeSignupModal();
      openLoginModal();
    } else {
      errorP.textContent = result.error || "Registration failed.";
    }
  } catch (err) {
    errorP.textContent = "Registration error.";
  }
});

// =========================
// Login
// =========================
document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const phoneInput    = document.getElementById('login-phone');
  const passwordInput = document.getElementById('login-password');
  // Make sure you have this element in your HTML:
  let errorP = document.getElementById('login-error');
  // If not present, create and append it to the form
  if (!errorP) {
    errorP = document.createElement('p');
    errorP.id = 'login-error';
    errorP.style.color = '#f88';
    const form = document.getElementById('login-form');
    form.appendChild(errorP);
  }
  errorP.textContent  = '';

  if (!phoneInput || !passwordInput || !errorP) {
    alert('Login form is not set up correctly. Please check your HTML input IDs.');
    return;
  }

  const phone    = phoneInput.value.trim();
  const password = passwordInput.value;

  if (!isPasswordValid(password)) {
    errorP.textContent = "Password must be at least 8 characters, include at least one letter and one number.";
    return;
  }

  try {
    const response = await fetch('https://backend-4lrl.onrender.com/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ phone, password })
    });
    const result = await response.json();
    if (response.ok && result.success) {
      // Only log the user in if backend says so!
      localStorage.setItem('isLoggedIn', 'true');
      closeLoginModal();
      // Optionally update UI, reload, or redirect
      alert('Login successful!');
      location.reload();
    } else {
      errorP.textContent = result.error || "Invalid phone or password.";
    }
  } catch (err) {
    errorP.textContent = "Login error.";
  }
});
