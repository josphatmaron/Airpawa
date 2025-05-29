// Modal open/close logic
function openSignupModal() { document.getElementById('signupModal').style.display = 'flex'; }
function closeSignupModal() { document.getElementById('signupModal').style.display = 'none'; }
function openProfileModal() { document.getElementById('profileModal').style.display = 'flex'; }
function closeProfileModal() { document.getElementById('profileModal').style.display = 'none'; }
function openModal(modalId) { document.getElementById(modalId).style.display = 'block'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }
function openLoginModal() { openModal('login-modal'); }
function closeTicketsModal() { closeModal('ticketsModal'); }
function openTicketsModal() { openModal('ticketsModal'); }
function openBetHistoryModal() { openModal('betHistoryModal'); }
function closeBetHistoryModal() { closeModal('betHistoryModal'); }

// Modal close on outside click (signup/profile/freebets)
window.addEventListener('click', function (event) {
  ['signupModal', 'freeBetsModal', 'profileModal'].forEach(function (id) {
    var modal = document.getElementById(id);
    if (modal && event.target === modal) { closeModal(id); }
  });
});

// ========== SIGNUP + PROFILE JS ==========

let registeredUserId = null;

// SIGNUP: Step 1 (POST to /register with username/email/password)
document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
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
    const response = await fetch('https://backend-4lrl.onrender.com/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, email, password, referralCode })
    });
    const result = await response.json();
    if (response.ok && result.user && result.user._id) {
      registeredUserId = result.user._id;
      closeSignupModal();
      openProfileModal();
    } else {
      errorP.textContent = result.error || "Registration failed.";
    }
  } catch (err) {
    errorP.textContent = "Registration error.";
  }
});

// PROFILE: Step 2 (POST to /complete-profile)
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
    const response = await fetch('https://backend-4lrl.onrender.com/complete-profile', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ userId: registeredUserId, fullName, email, dob, username })
    });
    const result = await response.json();
    if (response.ok && result.user) {
      closeProfileModal();
      alert('Profile completed! You can now play or log in.');
    } else {
      errorP.textContent = result.error || "Profile update failed.";
    }
  } catch (err) {
    errorP.textContent = "Profile update error.";
  }
});
