// -------------------- MENU & DROPDOWN LOGIC --------------------
const menuToggle = document.getElementById('menu-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');

// Toggle menu visibility on button click
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdownMenu.style.display === 'flex';
    dropdownMenu.style.display = isVisible ? 'none' : 'flex';
  });
}

// Close menu only if clicking outside of specific safe zones
document.addEventListener('click', (e) => {
  const safeZones = [
    menuToggle,
    dropdownMenu,
    document.getElementById('cashout-section-1'),
    document.getElementById('place-bet-button-1'),
    document.getElementById('cashout-section-2'),
    document.getElementById('place-bet-button-2')
  ].filter(zone => zone);

  const clickedInsideSafeZone = safeZones.some(zone => zone && zone.contains(e.target));

  if (!clickedInsideSafeZone && dropdownMenu) {
    dropdownMenu.style.display = 'none';
  }
});

// -------------------- TOP BAR LOGIN BUTTON LOGIC --------------------
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

function updateTopBar() {
  const topBar = document.getElementById('top-bar-button');
  if (!topBar) return;
  topBar.innerHTML = '';

  const link = document.createElement('a');
  link.style.color = 'white';
  link.style.textDecoration = 'none';
  link.style.cursor = 'pointer';
  link.tabIndex = 0;

  if (isLoggedIn) {
    link.textContent = 'Click to deposit';
    link.onclick = function() {
      openModal('depositModal'); // If you have a deposit modal, adjust id accordingly
      return false;
    };
  } else {
    link.textContent = 'Login to play';
    link.onclick = function() {
      openModal('login-modal');
      return false;
    };
  }

  topBar.appendChild(link);
}
document.addEventListener('DOMContentLoaded', updateTopBar);

// -------------------- MODAL LOGIC --------------------
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal with id '${modalId}' not found.`);
    return;
  }
  modal.style.display = (modalId === 'signupModal' || modalId === 'login-modal') ? 'block' : 'flex';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.zIndex = '1000';
  modal.style.opacity = '1';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}

function openSignupModal() { openModal('signupModal'); }
function closeSignupModal() { closeModal('signupModal'); }
function openLoginModal() { openModal('login-modal'); }
function closeLoginModal() { closeModal('login-modal'); }
function openTicketsModal() { openModal('ticketsModal'); }
function closeTicketsModal() { closeModal('ticketsModal'); }
function openBetHistoryModal() { openModal('betHistoryModal'); }
function closeBetHistoryModal() { closeModal('betHistoryModal'); }

// Modal close on outside click for specific modals
window.addEventListener('click', function (event) {
  ['signupModal', 'freeBetsModal', 'betHistoryModal', 'ticketsModal'].forEach(function (id) {
    const modal = document.getElementById(id);
    if (modal && event.target === modal) { closeModal(id); }
  });
});

// -------------------- LOGIN FORM HANDLER --------------------
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const phone = document.getElementById('login-phone').value;
      const password = document.getElementById('login-password').value;
      if (phone && password) {
        // Here you would call your server for authentication!
        // For demo, just simulate login:
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        updateTopBar();
        closeLoginModal();
        alert('Login successful!');
      } else {
        alert('Please fill in all fields.');
      }
    });
  }
});

// -------------------- LOGOUT HANDLER --------------------
function logoutUser() {
  isLoggedIn = false;
  localStorage.removeItem('isLoggedIn');
  updateTopBar();
  alert("You have been logged out.");
}

// -------------------- FREE BETS MENU --------------------
document.addEventListener('DOMContentLoaded', function () {
  var menu = document.querySelector('.menu-items li:first-child');
  if (menu) menu.addEventListener('click', function () { openModal('freeBetsModal'); });
});

// =========================
// CANVAS BACKGROUND
// =========================
const canvas = document.getElementById("game-bg");
const ctx = canvas ? canvas.getContext("2d") : null;
if (ctx) {
  ctx.imageSmoothingEnabled = true;
}
let rotationAngle = 0;

function resizeCanvas() {
  if (canvas) {
    const parent = canvas.parentElement;
    canvas.width = parent ? parent.offsetWidth : window.innerWidth * 0.9;
    canvas.height = parent ? parent.offsetHeight : window.innerHeight * 0.5;
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.5;
    }
  }
}

function calculateMaxRadius(centerX, centerY) {
  if (!canvas) return 0;
  const corners = [
    { x: 0, y: 0 },
    { x: canvas.width, y: 0 },
    { x: 0, y: canvas.height },
    { x: canvas.width, y: canvas.height }
  ];
  return Math.max(...corners.map(corner => {
    const dx = corner.x - centerX;
    const dy = corner.y - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  }));
}

function drawRadiatingLines() {
  if (!ctx || !canvas) return;
  const offsetX = -100, offsetY = 100;
  const centerX = offsetX;
  const centerY = canvas.height + offsetY;
  const radius = calculateMaxRadius(centerX, centerY);
  const lineCount = 36;
  const angleStep = (2 * Math.PI) / lineCount;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotationAngle);
  ctx.lineWidth = 30;

  for (let i = 0; i < lineCount; i++) {
    const angle = i * angleStep;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
    ctx.strokeStyle = "#222222";
    ctx.stroke();
  }
  ctx.restore();
}

function animateBackground() {
  rotationAngle += 0.003;
  drawRadiatingLines();
  requestAnimationFrame(animateBackground);
}

const crashPointList = [
  1.41, 1.62, 1.28, 4.18, 1.59, 1.22, 1.14, 5.40, 1.23, 1.43,
  1.85, 3.66, 9.50, 1.29, 1.12, 3.95, 1.91, 6.52, 3.55, 1.09,
  4.50, 1.01, 1.21, 1.07, 1.38, 3.33, 1.85, 1.50, 1.50,
  1.04, 2.42, 9.45, 1.14, 1.60, 2.77, 1.00, 1.15, 6.52,
  1.27, 1.39, 1.33, 1.34, 1.11, 5.89, 1.30, 2.15, 2.33,
  1.19, 56.99, 1.13, 7.80, 3.61, 1.85, 1.19, 1.90, 1.31,
  8.60, 1.75, 1.64, 1.54, 1.47, 2.35, 1.80, 3.63, 1.26,
  1.15, 8.63, 1.32, 3.71, 7.39, 2.74, 3.69, 1.45, 1.26, 1.31,
  1.59, 1.75, 1.99, 1.08, 1.60, 1.75, 1.83,
  1.61, 1.75, 1.36, 2.95, 1.77, 5.25, 1.44,
  1.17, 10.75, 1.76, 7.00, 1.46, 3.66, 1.78, 1.67, 1.66, 1.57, 1.84, 1.36, 1.50,
  1.03, 1.21, 1.16, 3.67, 1.15, 2.91, 1.85, 1.20, 1.85, 1.34, 2.50, 1.99, 1.50, 1.93,
  1.06, 4.55, 1.19, 3.21, 1.74, 6.50, 1.84, 3.50, 1.16, 5.81,
  1.07,
  1.65, 1.58, 7.20, 1.05, 14.09,
  1.73, 30.00, 1.40, 3.05, 1.02, 3.95,
  1.10, 1.48, 1.08, 3.37, 1.42, 1.35, 1.03, 1.10, 1.13, 1.93,
  1.06, 1.04, 2.42, 1.55, 1.52, 1.50, 1.20,
  1.79, 1.15, 6.80, 1.24, 3.95,
  1.74, 1.45, 1.23, 1.10, 1.87, 1.88, 1.25, 1.86, 1.70, 1.70
];

let crashIndex = 0;

// =========================
// GAME LOGIC & ANIMATION
// =========================
let multiplier = 1.0;
let crashPoint = getNextCrashPoint();
let animationFrame;
let startTime;
let userHasBet1 = false;
let userBetAmount1 = 0;
let userBetId1 = null;
let userHasBet2 = false;
let userBetAmount2 = 0;
let userBetId2 = null;
let gameRunning = false;
let bounceStartTime = null;
let isBouncing = false;
let betCounter = 0;
let isExiting = false;
let exitStartTime = null;
const exitDuration = 300;

const trail = [];

function getNextCrashPoint() {
  if (crashIndex >= crashPointList.length) {
    crashIndex = 0;
  }
  const point = crashPointList[crashIndex];
  crashIndex++;
  return point;
}

function resetRound() {
  multiplier = 1.0;
  crashPoint = getNextCrashPoint();
  startTime = null;
  trail.length = 0;
  bounceStartTime = null;
  isBouncing = false;
  isExiting = false;
  exitStartTime = null;

  const multiplierElement = document.getElementById("multiplier");
  const crashMessage = document.getElementById("crash-message");
  if (multiplierElement) {
    multiplierElement.textContent = "1.00x";
    multiplierElement.style.color = "#ffffff";
  }
  if (crashMessage) {
    crashMessage.style.display = "none";
  }

  gameRunning = true;
  animationFrame = requestAnimationFrame(animate);
}

function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = (timestamp - startTime) / 1000;

  multiplier = 1 + (elapsed / 3.5);
  const multiplierElement = document.getElementById("multiplier");
  if (multiplierElement) {
    multiplierElement.textContent = multiplier.toFixed(2) + "x";
  }
  updateActivePlayers();

  if (crashPoint && multiplier >= crashPoint && !isExiting) {
    isExiting = true;
    exitStartTime = timestamp;
    trail.length = 0;
  }

  if (ctx) {
    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRadiatingLines();

    if (!isExiting) {
      drawTrail(multiplier);
    }
    if (!isExiting || (isExiting && timestamp - exitStartTime < exitDuration)) {
      drawPlane(multiplier, timestamp);
    }

    if (isExiting && timestamp - exitStartTime >= exitDuration) {
      crashGame();
      return;
    }
  }

  animationFrame = requestAnimationFrame(animate);

  if (userHasBet1 && gameRunning) {
    const cashoutSection = document.getElementById("cashout-section-1");
    if (cashoutSection && cashoutSection.style.display !== "flex") {
      cashoutSection.style.display = "flex";
    }
  }
  if (userHasBet2 && gameRunning) {
    const cashoutSection = document.getElementById("cashout-section-2");
    if (cashoutSection && cashoutSection.style.display !== "flex") {
      cashoutSection.style.display = "flex";
    }
  }
}

function crashGame() {
  cancelAnimationFrame(animationFrame);
  gameRunning = false;
  isExiting = false;
  exitStartTime = null;
  trail.length = 0;

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRadiatingLines();
  }

  if (userHasBet1) {
    addBetToTable("You", userBetAmount1, multiplier.toFixed(2), null);
    userHasBet1 = false;
    userBetAmount1 = 0;
    userBetId1 = null;
    const cashoutSection = document.getElementById("cashout-section-1");
    const betButton = document.getElementById("place-bet-button-1");
    if (cashoutSection) cashoutSection.style.display = "none";
    if (betButton) betButton.style.display = "flex";
  }
  if (userHasBet2) {
    addBetToTable("You", userBetAmount2, multiplier.toFixed(2), null);
    userHasBet2 = false;
    userBetAmount2 = 0;
    userBetId2 = null;
    const cashoutSection = document.getElementById("cashout-section-2");
    const betButton = document.getElementById("place-bet-button-2");
    if (cashoutSection) cashoutSection.style.display = "none";
    if (betButton) betButton.style.display = "flex";
  }

  renderBetHistory();
  addMultiplierToHistory(multiplier);
  const multiplierElement = document.getElementById("multiplier");
  const crashMessage = document.getElementById("crash-message");
  if (multiplierElement) multiplierElement.style.color = "red";
  if (crashMessage) crashMessage.style.display = "block";

  setTimeout(() => {
    resetRound();
  }, 3000);
}

function updateActivePlayers() {
  if (userHasBet1) {
    const winnings = userBetAmount1 * multiplier;
    const cashoutText = document.getElementById("cashout-amount-text-1");
    if (cashoutText) cashoutText.textContent = `MZN ${winnings.toFixed(2)}`;
  }
  if (userHasBet2) {
    const winnings = userBetAmount2 * multiplier;
    const cashoutText = document.getElementById("cashout-amount-text-2");
    if (cashoutText) cashoutText.textContent = `MZN ${winnings.toFixed(2)}`;
  }
}

// =========================
// PLANE POSITION CALCULATION
// =========================
function getPlanePosition(multiplier, timestamp) {
  const bounceStartMultiplier = 2.01;
  const targetX = canvas ? canvas.width * 0.75 : 0;
  let x, y;

  if (isExiting && timestamp && exitStartTime) {
    const exitProgress = (timestamp - exitStartTime) / exitDuration;
    x = targetX + (canvas.width * 2 * exitProgress);
    const bounceMid = (canvas.height * 0.2 + canvas.height * 0.6) / 2;
    y = bounceMid;
  } else if (multiplier < bounceStartMultiplier) {
    const progress = Math.min((multiplier - 1) / (bounceStartMultiplier - 1), 1);
    x = progress * targetX;
    const startY = canvas ? canvas.height : 0;
    const targetY = canvas ? canvas.height * 0.25 : 0;
    y = startY - (progress * (startY - targetY));
  } else {
    x = targetX;
    const bounceMin = canvas ? canvas.height * 0.2 : 0;
    const bounceMax = canvas ? canvas.height * 0.6 : 0;
    const bounceMid = (bounceMin + bounceMax) / 2;
    const bounceRange = (bounceMax - bounceMin) / 2;
    const elapsed = (performance.now() - startTime) / 1000;
    const bounceFrequency = 1 / 3.5;
    y = bounceMid + bounceRange * Math.sin(elapsed * 2 * Math.PI * bounceFrequency);
  }

  return { x, y };
}

// =========================
// TRAIL DRAWING
// =========================
function drawTrail(multiplier) {
  if (!ctx || !canvas) return;
  const bounceStartMultiplier = 2.01;

  if (multiplier < bounceStartMultiplier) {
    const { x, y } = getPlanePosition(multiplier, null);
    trail.push({ x, y });
  }

  if (trail.length === 0) return;

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(trail[0].x, canvas.height);
  for (let i = 0; i < trail.length; i++) {
    const point = trail[i];
    ctx.lineTo(point.x, point.y);
  }
  ctx.lineTo(trail[trail.length - 1].x, canvas.height);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 0, 0, 0.15)";
  ctx.fill();

  ctx.lineWidth = 7;
  ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
  ctx.beginPath();
  for (let i = 0; i < trail.length; i++) {
    const point = trail[i];
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "red";
  ctx.beginPath();
  for (let i = 0; i < trail.length; i++) {
    const point = trail[i];
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();

  ctx.restore();
}

// =========================
// PLANE IMAGE & DRAWING
// =========================
const planeImage = new Image();
planeImage.src = 'assets/plane pink.png'; // Adjust path as needed
planeImage.onload = () => {};
planeImage.onerror = () => {};

function drawPlane(multiplier, timestamp) {
  if (!ctx) return;
  const planeSize = 70;
  const { x, y } = getPlanePosition(multiplier, timestamp);

  ctx.save();
  ctx.translate(x, y);
  if (planeImage.complete && planeImage.naturalWidth !== 0) {
    ctx.drawImage(planeImage, 0, -planeSize, planeSize, planeSize);
  } else {
    ctx.fillStyle = "blue";
    ctx.fillRect(0, -planeSize, planeSize, planeSize);
  }
  ctx.restore();
}

// =========================
// BETTING LOGIC
// =========================
function updateTotalBets() {
  const bets = document.querySelectorAll('.bets-table .bets-row');
  const totalBetsCount = document.getElementById('total-bets-count');
  if (totalBetsCount) {
    totalBetsCount.textContent = `Total: ${bets.length}`;
  }
}

function getBalance() {
  const userBalance = document.getElementById("user-balance");
  if (userBalance) {
    return parseFloat(userBalance.textContent.replace(/[^\d.-]/g, ""));
  }
  return 0;
}

function setBalance(amount) {
  const userBalance = document.getElementById("user-balance");
  if (userBalance) {
    userBalance.textContent = `${amount.toFixed(2)}`;
  }
}

function startGame(panelId) {
  const betInput = document.getElementById(`bet-amount-${panelId}`);
  if (!betInput) return;
  const bet = parseFloat(betInput.value);
  const balance = getBalance();

  if (bet > balance || isNaN(bet)) {
    alert("Invalid or insufficient balance.");
    return;
  }

  if (gameRunning) {
    alert("Game already started. Please wait for the next round.");
    return;
  }

  setBalance(balance - bet);
  const betId = `bet-${betCounter++}`;
  if (panelId === 1) {
    userHasBet1 = true;
    userBetAmount1 = bet;
    userBetId1 = betId;
  } else {
    userHasBet2 = true;
    userBetAmount2 = bet;
    userBetId2 = betId;
  }
  addBetToTable("You", bet, null, null);

  const now = new Date();
  const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getFullYear()).slice(-2)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  betHistoryData.unshift({
    date: dateStr,
    bet: bet,
    multiplier: null,
    cashout: null,
    panelId: panelId,
    betId: betId
  });

  if (betHistoryData.length > 20) {
    betHistoryData.pop();
  }

  renderBetHistory();

  const betButton = document.getElementById(`place-bet-button-${panelId}`);
  const cashoutSection = document.getElementById(`cashout-section-${panelId}`);
  if (betButton) betButton.style.display = "none";
  if (cashoutSection) cashoutSection.style.display = "flex";
}

function cashOut(panelId) {
  const hasBet = panelId === 1 ? userHasBet1 : userHasBet2;
  const betAmount = panelId === 1 ? userBetAmount1 : userBetAmount2;
  const betId = panelId === 1 ? userBetId1 : userBetId2;
  if (!hasBet || !gameRunning) {
    return;
  }

  const winnings = betAmount * multiplier;
  setBalance(getBalance() + winnings);
  addBetToTable("You", betAmount, multiplier.toFixed(2), winnings);

  if (panelId === 1) {
    userHasBet1 = false;
    userBetAmount1 = 0;
    userBetId1 = null;
  } else {
    userHasBet2 = false;
    userBetAmount2 = 0;
    userBetId2 = null;
  }

  renderBetHistory();

  const banner = document.getElementById("cashout-banner");
  const winAmountElement = document.getElementById("cashout-win-amount");
  if (banner && winAmountElement) {
    winAmountElement.textContent = winnings.toFixed(2);
    banner.style.display = "flex";
    banner.style.animation = "none";
    banner.offsetHeight;
    banner.style.animation = "fadeOut 2s forwards";
    setTimeout(() => {
      banner.style.display = "none";
    }, 2000);
  }

  const cashoutSection = document.getElementById(`cashout-section-${panelId}`);
  const betButton = document.getElementById(`place-bet-button-${panelId}`);
  if (cashoutSection) {
    cashoutSection.style.display = "none";
  }
  if (betButton) {
    betButton.style.display = "flex";
  }
}

// =========================
// BET HISTORY LOGIC
// =========================
let betHistoryData = [
  { date: '21-05-25 19:26', bet: 1.00, multiplier: '1.09x', cashout: 1.09 },
  { date: '21-05-25 19:24', bet: 50.00, multiplier: '1.07x', cashout: 53.50 },
  { date: '10-05-25 16:16', bet: 1.00, multiplier: '1.00x', cashout: null },
  { date: '09-05-25 18:26', bet: 50.00, multiplier: '1.07x', cashout: 53.50 },
  { date: '09-05-25 18:26', bet: 20.00, multiplier: '1.31x', cashout: 26.20 },
  { date: '09-05-25 18:26', bet: 20.00, multiplier: '1.22x', cashout: 24.40 },
  { date: '09-05-25 17:55', bet: 20.00, multiplier: '1.23x', cashout: 24.60 },
  { date: '09-05-25 17:52', bet: 20.00, multiplier: '1.57x', cashout: 31.40 },
  { date: '09-05-25 17:51', bet: 20.00, multiplier: '1.08x', cashout: null },
  { date: '09-05-25 17:50', bet: 20.00, multiplier: '1.17x', cashout: null }
];

function renderBetHistory() {
  const container = document.querySelector('.bet-history-table');
  if (!container) return;

  container.innerHTML = `
    <div class="bet-history-row header">
      <span>Date</span><span>Bet MZN</span><span>X</span><span>Cash out MZN</span>
    </div>
  `;

  betHistoryData.forEach(item => {
    const row = document.createElement('div');
    row.className = 'bet-history-row';
    row.innerHTML = `
      <span>${item.date}</span>
      <span>${item.bet.toFixed(2)}</span>
      <span>${item.multiplier || '—'}</span>
      <span>${item.cashout !== null ? item.cashout.toFixed(2) : '—'}</span>
    `;
    container.appendChild(row);
  });
}

function addMultiplierToHistory(multiplier) {
  const history = document.getElementById("multiplier-history");
  if (!history) return;

  const item = document.createElement("div");
  item.className = "multiplier-item";

  if (multiplier >= 10) {
    item.style.color = "rgb(192, 23, 180)";
  } else if (multiplier >= 2) {
    item.style.color = "rgb(145, 62, 248)";
  } else {
    item.style.color = "rgb(52, 180, 255)";
  }

  item.textContent = `${multiplier.toFixed(2)}x`;
  history.prepend(item);

  if (history.children.length > 100) {
    history.removeChild(history.lastChild);
  }
}

function addBetToTable(username, betAmount, multiplier = null, winAmount = null) {
  const table = document.querySelector(".bets-table");
  if (!table) return;

  const row = document.createElement("div");
  row.classList.add("bets-row");
  if (multiplier && winAmount) row.classList.add("highlight");

  row.innerHTML = `
    <span>${username}</span>
    <span>${betAmount.toLocaleString()}</span>
    <span>${multiplier ? multiplier + 'x' : '—'}</span>
    <span>${winAmount ? winAmount.toLocaleString() : '—'}</span>
  `;

  table.insertBefore(row, table.children[1]);

  while (table.children.length > 21) {
    table.removeChild(table.lastChild);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Setup bet/cashout buttons
  const betButton1 = document.getElementById("place-bet-button-1");
  const cashoutButton1 = document.getElementById("cashout-button-1");
  const betInput1 = document.getElementById("bet-amount-1");
  const betButton2 = document.getElementById("place-bet-button-2");
  const cashoutButton2 = document.getElementById("cashout-button-2");
  const betInput2 = document.getElementById("bet-amount-2");

  if (betButton1) {
    betButton1.replaceWith(betButton1.cloneNode(true));
    document.getElementById("place-bet-button-1").addEventListener('click', (e) => {
      e.stopPropagation();
      startGame(1);
    });
  }
  if (cashoutButton1) {
    cashoutButton1.replaceWith(cashoutButton1.cloneNode(true));
    document.getElementById("cashout-button-1").addEventListener('click', (e) => {
      e.stopPropagation();
      cashOut(1);
    });
  }
  if (betButton2) {
    betButton2.replaceWith(betButton2.cloneNode(true));
    document.getElementById("place-bet-button-2").addEventListener('click', (e) => {
      e.stopPropagation();
      startGame(2);
    });
  }
  if (cashoutButton2) {
    cashoutButton2.replaceWith(cashoutButton2.cloneNode(true));
    document.getElementById("cashout-button-2").addEventListener('click', (e) => {
      e.stopPropagation();
      cashOut(2);
    });
  }
  [betInput1, betInput2].forEach((betInput, index) => {
    const panelId = index + 1;
    if (betInput) {
      betInput.addEventListener('input', () => {
        const betAmountText = document.getElementById(`bet-amount-text-${panelId}`);
        if (betAmountText) {
          betAmountText.textContent = `${parseFloat(betInput.value).toFixed(2)} MZN`;
        }
      });
    }
  });
  document.querySelectorAll('.bet-panel').forEach((panel, index) => {
    const panelId = index + 1;
    panel.querySelectorAll('.adjust').forEach(button => {
      button.addEventListener('click', () => {
        const betInput = document.getElementById(`bet-amount-${panelId}`);
        if (betInput) {
          const step = parseFloat(betInput.step) || 1.00;
          const min = parseFloat(betInput.min) || 1.00;
          let value = parseFloat(betInput.value);

          if (button.dataset.action === 'increase') value += step;
          else if (button.dataset.action === 'decrease' && value > min) value -= step;

          betInput.value = value.toFixed(2);
          const betAmountText = document.getElementById(`bet-amount-text-${panelId}`);
          if (betAmountText) {
            betAmountText.textContent = `${value.toFixed(2)} MZN`;
          }
        }
      });
    });
    panel.querySelectorAll('.quick-bet').forEach(button => {
      button.addEventListener('click', () => {
        const betInput = document.getElementById(`bet-amount-${panelId}`);
        if (betInput) {
          const value = parseFloat(button.dataset.bet);
          if (!isNaN(value)) {
            betInput.value = value.toFixed(2);
            const betAmountText = document.getElementById(`bet-amount-text-${panelId}`);
            if (betAmountText) {
              betAmountText.textContent = `${value.toFixed(2)} MZN`;
            }
          }
        }
      });
    });
  });

  resizeCanvas();
  animateBackground();
  resetRound();
  updateTopBar();
  updateTotalBets();
});

window.addEventListener("resize", resizeCanvas);
