// =========================
// PASSWORD VALIDATION FUNCTION
// =========================
function isPasswordValid(password) {
  // At least 8 characters, at least one letter and one number
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return regex.test(password);
}

// =========================
// Modal open/close logic
// =========================
function openSignupModal() { document.getElementById('signupModal').style.display = 'flex'; }
function closeSignupModal() { document.getElementById('signupModal').style.display = 'none'; }
function openLoginModal() { document.getElementById('login-modal').style.display = 'block'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }
function openTicketsModal() { document.getElementById('ticketsModal').style.display = 'block'; }
function closeTicketsModal() { document.getElementById('ticketsModal').style.display = 'none'; }
function openBetHistoryModal() { document.getElementById('betHistoryModal').style.display = 'block'; }
function closeBetHistoryModal() { document.getElementById('betHistoryModal').style.display = 'none'; }

// Modal close on outside click (signup/freebets)
window.addEventListener('click', function (event) {
  ['signupModal', 'freeBetsModal'].forEach(function (id) {
    var modal = document.getElementById(id);
    if (modal && event.target === modal) { closeModal(id); }
  });
});

// ========== SIGNUP JS ==========

// SIGNUP: POST to /register with username/email/password/referralCode
document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;
  const referralCode = document.getElementById('signup-referral').value;
  const errorP = document.getElementById('signup-error');
  errorP.textContent = '';

  // Password validation
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
      // Optionally open the login modal here:
      // openLoginModal();
    } else {
      errorP.textContent = result.error || "Registration failed.";
    }
  } catch (err) {
    errorP.textContent = "Registration error.";
  }
});
