// =========================
// PASSWORD VALIDATION FUNCTION
// =========================
function isPasswordValid(password) {
  // At least 8 characters, at least one letter and one number
  const regex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

// =========================
// Registration (Signup)
// =========================
document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const usernameInput         = document.getElementById('signup-username');
  const phoneInput            = document.getElementById('signup-phone');
  const emailInput            = document.getElementById('signup-email');
  const passwordInput         = document.getElementById('signup-password');
  const confirmPasswordInput  = document.getElementById('signup-confirm-password');
  const referralInput         = document.getElementById('signup-referral');
  const errorP                = document.getElementById('signup-error');

  if (!usernameInput || !phoneInput || !emailInput || !passwordInput || !confirmPasswordInput || !referralInput || !errorP) {
    alert('Signup form is not set up correctly. Please check your HTML input IDs.');
    return;
  }

  const username       = usernameInput.value.trim();
  const phone          = phoneInput.value.trim();
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
      body: JSON.stringify({ username, phone, email, password, referralCode })
    });
    const result = await response.json();
    if (response.ok && result.user && result.user._id) {
      alert("Registration successful! You can now log in.");
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
// Login (Signin)
// =========================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  console.log("Login clicked!"); // This will show up in the browser console when you click login
  e.preventDefault();

  const phoneInput = document.getElementById('login-phone');
  const passwordInput = document.getElementById('login-password');
  const errorP = document.getElementById('login-error');

  if (!phoneInput || !passwordInput || !errorP) {
    alert('Login form is not set up correctly. Please check your HTML input IDs.');
    return;
  }

  const phone = phoneInput.value.trim();
  const password = passwordInput.value;
  errorP.textContent = '';

  try {
    const response = await fetch('https://backend-4lrl.onrender.com/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ phone, password })
    });
    const result = await response.json();
    if (response.ok && result.user && result.user._id) {
      errorP.textContent = "Login successful!";
      // You can close the login modal or redirect here
      // closeLoginModal(); // Uncomment if you have this function
      // window.location.href = '/dashboard'; // Example redirect
    } else {
      errorP.textContent = result.error || "Login failed.";
    }
  } catch (err) {
    errorP.textContent = "Login error.";
  }
});
