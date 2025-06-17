function logoutUser() {
  localStorage.setItem('isLoggedIn', 'false');
  const dropdownMenu = document.getElementById('dropdown-menu');
  if (dropdownMenu) dropdownMenu.style.display = 'none';
  alert('You have been logged out!');
  updateTopBar();
  updateAuthButtons();
  location.reload();
}

function updateAuthButtons() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const dropdownMenu = document.getElementById('dropdown-menu');
  const menuToggle = document.getElementById('menu-toggle');

  if (loginBtn) loginBtn.style.display = isLoggedIn ? 'none' : '';
  if (signupBtn) signupBtn.style.display = isLoggedIn ? 'none' : '';
  if (dropdownMenu) dropdownMenu.style.display = 'none'; // Start hidden
}

function showCrashMessage(msg, color = "white", duration = 1500) {
  const crashMessage = document.getElementById("crash-message");
  if (crashMessage) {
    crashMessage.textContent = msg;
    crashMessage.style.display = msg ? "block" : "none";
    crashMessage.style.color = color + " !important";
    if (duration > 0 && msg) {
      setTimeout(() => crashMessage.style.display = "none", duration);
    }
  }
}

const menuToggle = document.getElementById('menu-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
  });
}
document.addEventListener('click', (e) => {
  const safeZones = [
    menuToggle,
    dropdownMenu,
    document.getElementById('cashout-section-1'),
    document.getElementById('place-bet-button-1'),
    document.getElementById('cashout-section-2'),
    document.getElementById('place-bet-button-2')
  ].filter(zone => zone);
  if (!safeZones.some(zone => zone.contains(e.target)) && dropdownMenu) {
    dropdownMenu.style.display = 'none';
  }
});

const canvas = document.getElementById("game-bg");
const ctx = canvas ? canvas.getContext("2d") : null;
if (ctx) {
  ctx.imageSmoothingEnabled = true;
} else {
  console.error("Canvas or context not available. Check if <canvas id='game-bg'> exists in HTML.");
}
let rotationAngle = 0;

function resizeCanvas() {
  if (canvas && ctx) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    console.log(`Canvas resized: ${canvas.width}x${canvas.height}`);
  } else {
    console.error("Cannot resize canvas: canvas or ctx missing.");
  }
}

function calculateMaxRadius(centerX, centerY) {
  if (!canvas) return 0;
  const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
  const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
  return Math.max(...[
    { x: 0, y: 0 },
    { x: logicalWidth, y: 0 },
    { x: 0, y: logicalHeight },
    { x: logicalWidth, y: logicalHeight }
  ].map(corner => Math.sqrt((corner.x - centerX) ** 2 + (corner.y - centerY) ** 2)));
}

function drawRadiatingLines() {
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const logicalHeight = canvas.height / dpr;
  const centerX = -100;
  const centerY = logicalHeight + 50;
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
  try {
    if (!ctx || !canvas) return;
    rotationAngle += 0.003;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRadiatingLines();
    requestAnimationFrame(animateBackground);
  } catch (error) {
    console.error("Error in animateBackground:", error);
  }
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
  if (crashIndex >= crashPointList.length) crashIndex = 0;
  const point = crashPointList[crashIndex++];
  return point;
}

function resetRound() {
  try {
    multiplier = 1.0;
    crashPoint = getNextCrashPoint();
    startTime = null;
    trail.length = 0;
    bounceStartTime = null;
    isBouncing = false;
    isExiting = false;
    exitStartTime = null;
    showCrashMessage("", "white", 0);
    const multiplierContainer = document.querySelector(".multiplier-container");
    const multiplierElement = document.getElementById("multiplier");
    if (!multiplierElement) {
      console.error("Multiplier element not found");
      return;
    }
    multiplierElement.textContent = "1.00x";
    if (multiplierContainer) multiplierContainer.classList.remove("crashed");
    gameRunning = true;
    if (ctx) resizeCanvas();
    else console.error("Canvas context not available in resetRound");
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(animate);
    console.log("Game round reset");
  } catch (error) {
    console.error("Error in resetRound:", error);
  }
}

function animate(timestamp) {
  try {
    if (!ctx || !canvas || !gameRunning) {
      console.warn("Animation stopped: ctx, canvas, or gameRunning missing");
      return;
    }
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;
    multiplier = 1 + (elapsed / 3.5);
    const multiplierElement = document.getElementById("multiplier");
    if (multiplierElement) {
      multiplierElement.textContent = multiplier.toFixed(2) + "x";
    } else {
      console.warn("Multiplier element not found in animate");
    }
    updateActivePlayers();
    if (crashPoint && multiplier >= crashPoint && !isExiting) {
      isExiting = true;
      exitStartTime = timestamp;
      trail.length = 0;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRadiatingLines();
    if (!isExiting) drawTrail(multiplier);
    if (!isExiting || (isExiting && timestamp - exitStartTime < exitDuration)) {
      drawPlane(multiplier, timestamp);
    }
    if (isExiting && timestamp - exitStartTime >= exitDuration) {
      crashGame();
      return;
    }
    animationFrame = requestAnimationFrame(animate);
    if (userHasBet1 && gameRunning) {
      const cashoutSection = document.getElementById("cashout-section-1");
      if (cashoutSection) cashoutSection.style.display = "flex";
    }
    if (userHasBet2 && gameRunning) {
      const cashoutSection = document.getElementById("cashout-section-2");
      if (cashoutSection) cashoutSection.style.display = "flex";
    }
    console.log(`Animation frame: multiplier=${multiplier.toFixed(2)}`);
  } catch (error) {
    console.error("Error in animate:", error);
    if (animationFrame) cancelAnimationFrame(animationFrame);
  }
}

function crashGame() {
  try {
    if (animationFrame) cancelAnimationFrame(animationFrame);
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
    const multiplierContainer = document.querySelector(".multiplier-container");
    const multiplierElement = document.getElementById("multiplier");
    if (multiplierElement) multiplierElement.textContent = multiplier.toFixed(2) + "x";
    if (multiplierContainer) {
      multiplierContainer.classList.add("crashed");
      setTimeout(() => multiplierContainer.classList.remove("crashed"), 3000);
    }
    showCrashMessage("FLEW AWAY!", "white", 3000);
    document.dispatchEvent(new Event('gameCrash'));
    setTimeout(() => resetRound(), 3000);
    console.log("Game crashed");
  } catch (error) {
    console.error("Error in crashGame:", error);
  }
}

function resetGameUI() {
  userHasBet1 = false;
  userBetAmount1 = 0;
  userBetId1 = null;
  userHasBet2 = false;
  userBetAmount2 = 0;
  userBetId2 = null;
  const cashoutSection1 = document.getElementById("cashout-section-1");
  const cashoutSection2 = document.getElementById("cashout-section-2");
  if (!userHasBet1 && cashoutSection1) cashoutSection1.style.display = "none";
  if (!userHasBet2 && cashoutSection2) cashoutSection2.style.display = "none";
  const betInput1 = document.getElementById("bet-amount-1");
  const betButton1 = document.getElementById("place-bet-button-1");
  if (betInput1 && betButton1) {
    betButton1.innerHTML = 'Bet<br><span class="bet-amount" id="bet-amount-text-1">8.00 USD</span>';
    betButton1.style.display = "flex";
    const betAmountText1 = document.getElementById("bet-amount-text-1");
    if (betAmountText1) betAmountText1.textContent = `${parseFloat(betInput1.value).toFixed(2)} USD`;
  }
  const betInput2 = document.getElementById("bet-amount-2");
  const betButton2 = document.getElementById("place-bet-button-2");
  if (betInput2 && betButton2) {
    betButton2.innerHTML = 'Bet<br><span class="bet-amount" id="bet-amount-text-2">8.00 USD</span>';
    betButton2.style.display = "flex";
    const betAmountText2 = document.getElementById("bet-amount-text-2");
    if (betAmountText2) betAmountText2.textContent = `${parseFloat(betInput2.value).toFixed(2)} USD`;
  }
}

function updateActivePlayers() {
  if (userHasBet1) {
    const winnings = userBetAmount1 * multiplier;
    const cashoutText = document.getElementById("cashout-amount-text-1");
    if (cashoutText) cashoutText.textContent = `USD ${winnings.toFixed(2)}`;
  }
  if (userHasBet2) {
    const winnings = userBetAmount2 * multiplier;
    const cashoutText = document.getElementById("cashout-amount-text-2");
    if (cashoutText) cashoutText.textContent = `USD ${winnings.toFixed(2)}`;
  }
}

function getPlanePosition(multiplier, timestamp) {
  const dpr = window.devicePixelRatio || 1;
  const logicalHeight = canvas.height / dpr;
  const logicalWidth = canvas.width / dpr;
  const bounceStartMultiplier = 2.01;
  const targetX = logicalWidth * 0.75;
  let x, y;
  if (isExiting && timestamp && exitStartTime) {
    const exitProgress = (timestamp - exitStartTime) / exitDuration;
    x = targetX + (logicalWidth * 2 * exitProgress);
    const bounceMid = (logicalHeight * 0.2 + logicalHeight * 0.6) / 2;
    y = bounceMid;
  } else if (multiplier < bounceStartMultiplier) {
    const progress = Math.min((multiplier - 1) / (bounceStartMultiplier - 1), 1);
    x = progress * targetX;
    const startY = logicalHeight;
    const targetY = logicalHeight * 0.25;
    y = startY - (progress * (startY - targetY));
  } else {
    x = targetX;
    const bounceMin = logicalHeight * 0.2;
    const bounceMax = logicalHeight * 0.6;
    const bounceMid = (bounceMin + bounceMax) / 2;
    const bounceRange = (bounceMax - bounceMin) / 2;
    const elapsed = (performance.now() - startTime) / 1000;
    const bounceFrequency = 1 / 3.5;
    y = clamp(bounceMid + bounceRange * Math.sin(elapsed * 2 * Math.PI * bounceFrequency), bounceMin, bounceMax);
  }
  return { x, y };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function drawTrail(multiplier) {
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const logicalHeight = canvas.height / dpr;
  const bounceStartMultiplier = 2.01;
  if (multiplier < bounceStartMultiplier) {
    const { x, y } = getPlanePosition(multiplier, null);
    trail.push({ x, y });
  }
  if (trail.length === 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, logicalHeight);
  for (let i = 0; i < trail.length; i++) {
    const point = trail[i];
    ctx.lineTo(point.x, point.y);
  }
  ctx.lineTo(trail[trail.length - 1].x, logicalHeight);
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

const planeImage = new Image();
planeImage.src = 'plane pink.png';
planeImage.onload = () => console.log("Plane image loaded successfully");
planeImage.onerror = () => console.error("Failed to load plane image");

function drawPlane(multiplier, timestamp) {
  if (!ctx || !canvas) return;
  const planeSize = 70;
  const { x, y } = getPlanePosition(multiplier, timestamp);
  ctx.save();
  ctx.translate(x, y);
  if (planeImage.complete && planeImage.naturalWidth !== 0) {
    ctx.drawImage(planeImage, 0, -planeSize, planeSize, planeSize);
  } else {
    ctx.fillStyle = "blue";
    ctx.fillRect(-planeSize, -planeSize, planeSize, planeSize);
    console.warn("Drawing fallback blue rectangle for plane");
  }
  ctx.restore();
}

function updateTotalBets() {
  try {
    const bets = document.querySelectorAll('.bets-table .bets-row');
    const totalBetsCount = document.getElementById('total-bets');
    if (totalBetsCount) totalBetsCount.textContent = `Total ${bets.length} Bets: `;
  } catch (error) {
    console.error("Error in updateTotalBets:", error);
  }
}

function startGame(panelId) {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    alert('Please log in to place a bet.');
    openLoginModal();
    return;
  }
  try {
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
    const existingBet = betHistoryData.find(
      item => item.panelId === panelId && item.betId === (panelId === 1 ? userBetId1 : userBetId2)
    );
    if (existingBet) return;
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
    if (betHistoryData.length > 20) betHistoryData.pop();
    renderBetHistory();
    const betButton = document.getElementById(`place-bet-button-${panelId}`);
    const cashoutSection = document.getElementById(`cashout-section-${panelId}`);
    if (betButton) betButton.style.display = "none";
    if (cashoutSection) cashoutSection.style.display = "flex";
  } catch (error) {
    console.error("Error in startGame:", error);
  }
}

function cashOut(panelId) {
  try {
    const hasBet = panelId === 1 ? userHasBet1 : userHasBet2;
    const betAmount = panelId === 1 ? userBetAmount1 : userBetAmount2;
    const betId = panelId === 1 ? userBetId1 : userBetId2;
    if (!hasBet) return;
    if (!gameRunning) return;
    const winnings = betAmount * multiplier;
    setBalance(getBalance() + winnings);
    addBetToTable("You", betAmount, multiplier.toFixed(2), winnings);
    const betIndex = betHistoryData.findIndex(
      item => item.panelId === panelId && item.betId === betId
    );
    if (betIndex !== -1) {
      betHistoryData[betIndex].multiplier = multiplier.toFixed(2) + 'x';
      betHistoryData[betIndex].cashout = winnings;
      delete betHistoryData[betIndex].panelId;
      delete betHistoryData[betIndex].betId;
    }
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
    showCrashMessage("Cashout!", "success");
    const banner = document.getElementById("cashout-banner");
    const winAmountElement = document.getElementById("cashout-amount-amount");
    if (banner && winAmountElement) {
      winAmountElement.textContent = winnings.toFixed(2);
      banner.style.display = "flex";
      banner.style.animation = "none";
      banner.offsetHeight;
      banner.style.animation = "fadeOut 2s forwards";
      setTimeout(() => banner.style.display = "none", 2000);
    }
    const cashoutSection = document.getElementById(`cashout-section-${panelId}`);
    const betButton = document.getElementById(`place-bet-button-${panelId}`);
    if (cashoutSection) cashoutSection.style.display = "none";
    if (betButton) betButton.style.display = "flex";
  } catch (error) {
    console.error("Error in cashOut:", error);
  }
}

function getBalance() {
  try {
    const userBalance = document.getElementById("balance");
    if (userBalance) return parseFloat(userBalance.textContent.replace(/[^0-9.]/g, ''));
    return 0;
  } catch (error) {
    console.error('Error in getBalance:', error);
    return 0;
  }
}

function setBalance(amount) {
  try {
    const userBalance = document.getElementById('balance');
    if (userBalance) userBalance.textContent = `$${amount.toFixed(2)}`;
  } catch (error) {
    console.error('Error in setBalance:', error);
  }
}

const refreshButton = document.getElementById("balance-refresh");
if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    try {
      const newBalance = (Math.random() * 10000).toFixed(2);
      setBalance(newBalance);
    } catch (error) {
      console.error("Error in refreshBalance:", error);
    }
  });
}

let betHistoryData = [
  { date: '2023-05-21', bet: '1.00', multiplier: 1.09, amount: 1.09 },
  { date: '2023-05-21', bet: '50.00', multiplier: 2.07, amount: 53.50 },
  { date: '2023-05-10', bet: '1.00', multiplier: 1.00, amount: null },
  { date: '2023-09-05', bet: '50.0', multiplier: 2.07, amount: 53.30 },
  { date: '2023-09-25', bet: '20.0', multiplier: 1.31, amount: 26.20 },
  { date: '2023-09-25', bet: '20.0', multiplier: 1.22, amount: 24.40 },
  { date: '2023-09-25', bet: '20.0', multiplier: 1.23, amount: 24.60 },
  { date: '2023-09-25', bet: '20.0', multiplier: 1.57, amount: 31.40 },
  { date: '2023-09-25', bet: '20.0', multiplier: 1.08, amount: null },
  { date: '2023-09-25', bet: '20.0', multiplier: 1.17, amount: null }
];

function renderBetHistory() {
  try {
    const container = document.querySelector('.bet-history-table');
    if (!container) return;
    container.innerHTML = `
      <table class="bet-history-row header">
        <tr><th>Date</th><th>Bet</th><th>Multiplier</th><th>Amount</th></tr>
      </table>
    `;
    betHistoryData.forEach(data => {
      const row = document.createElement('div');
      row.className = 'history-row';
      row.innerHTML = `
        <table><tr>
          <td>${data.date}</td>
          <td>${data.bet}</td>
          <td>${data.multiplier || '0'}</td>
          <td>${data.amount || '0'}</td>
        </tr></table>
      `;
      container.appendChild(row);
    });
  } catch (error) {
    console.error("Error rendering history:", error);
  }
}

function addBetToTable(username, betAmount, multiplier = null, winAmount = null) {
  try {
    const table = document.querySelector('.bets-table');
    if (!table) return;
    const row = document.createElement("div");
    row.className = "bets-row";
    if (multiplier && winAmount) row.classList.add("highlight");
    row.innerHTML = `
      <table><tr>
        <td>${username}</td>
        <td>${betAmount.toFixed(2)}</td>
        <td>${multiplier || '0'}</td>
        <td>${winAmount ? winAmount.toFixed(2) : '0'}</td>
      </tr></table>
    `;
    table.insertBefore(row, table.children[1]);
    while (table.children.length > 21) table.removeChild(table.lastChild);
  } catch (error) {
    console.error("Error adding to betTable:", error);
  }
}

function addMultiplierToHistory(multiplier) {
  try {
    const history = document.getElementById('multiplier-history');
    if (!history) return;
    const item = document.createElement("div");
    item.className = 'history-item';
    item.style.color = multiplier >= 10 ? "pink" : multiplier <= 2 ? "blue" : "purple";
    item.textContent = `${multiplier.toFixed(2)}x`;
    history.prepend(item);
    if (history.children.length > 100) history.removeChild(history.lastChild);
  } catch (error) {
    console.error("Error adding to history:", error);
  }
}

function updateTopBar() {
  try {
    const topBar = document.getElementById('top-bar-button');
    if (!topBar) {
      console.error("Top bar element (#top-bar-button) not found in HTML.");
      return;
    }
    topBar.innerHTML = '';
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      const link = document.createElement('a');
      link.className = 'deposit-btn';
      link.textContent = 'Deposit';
      link.href = 'https://paystack.com/pay/youtube';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      topBar.appendChild(link);
    } else {
      const loginButton = document.createElement('button');
      loginButton.className = 'login-btn';
      loginButton.textContent = 'Login to Deposit';
      loginButton.addEventListener('click', (e) => {
        e.preventDefault();
        openLoginModal();
      });
      topBar.appendChild(loginButton);
    }
    console.log("Top bar updated:", isLoggedIn ? "Deposit link" : "Login to Deposit button");
  } catch (error) {
    console.error("Error updating topBar:", error);
  }
}

document.addEventListener('click', (e) => {
  const depositBtn = e.target.closest('.deposit-btn');
  if (depositBtn) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      e.preventDefault();
      alert('Please log in to deposit.');
      openLoginModal();
    }
  }
});

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'block';
}
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = 'none';
}
function openLoginModal() { openModal('login-modal'); }
function openSignupModal() { openModal('signupModal'); }
function closeSignupModal() { closeModal('signupModal'); }
function openProfileModal() { openModal('profileModal'); }
function closeProfileModal() { closeModal('profileModal'); }
function openFreeBetsModal() { openModal('freeBetsModal'); }
function closeFreeBetsModal() { closeModal('freeBetsModal'); }
function openTicketsModal() { openModal('ticketsModal'); }
function closeTicketsModal() { closeModal('ticketsModal'); }
function openBetHistoryModal() { openModal('betHistoryModal'); }
function closeBetHistoryModal() { closeModal('betHistoryModal'); }

document.addEventListener("DOMContentLoaded", () => {
  updateAuthButtons();
  updateTopBar();
  resizeCanvas();
  animateBackground();
  resetRound();
  updateTotalBets();
  console.log("DOM loaded, game initialized");

  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
    "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei",
    "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
    "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji",
    "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
    "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland",
    "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast", "Jamaica",
    "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia",
    "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar",
    "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea",
    "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines",
    "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
    "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
    "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
    "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden",
    "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo",
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
  ];
  const countrySelect = document.getElementById('countrySelect');
  if (countrySelect) {
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  }

  function isPasswordValid(password) {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  function isAtLeast18(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const country = countrySelect.value.trim();
      const phone = document.getElementById('phone').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const dob = document.getElementById('dob').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('signup-password').value;
      const errorP = document.getElementById('signup-error');
      errorP.textContent = '';

      if (!isAtLeast18(dob)) {
        errorP.textContent = "You must be at least 18 years old to register.";
        return;
      }
      if (!isPasswordValid(password)) {
        errorP.textContent = "Password must be at least 8 characters long, including at least one letter and one number.";
        return;
      }
      if (password !== confirmPassword) {
        errorP.textContent = "Passwords do not match.";
        return;
      }

      try {
        const response = await fetch('https://backend-4lrl.onrender.com/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country, email, dob, phone, password })
        });
        const result = await response.json();
        if (response.ok && result.user && result.user._id) {
          alert("Registration successful! You can now log in.");
          signupForm.reset();
          closeModal('signupModal');
        } else {
          errorP.textContent = result.error || "Registration failed.";
        }
      } catch (err) {
        errorP.textContent = 'Registration error.';
      }
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const phone = document.getElementById('login-phone').value;
      const password = document.getElementById('login-password').value;
      const errorP = document.getElementById('login-error');
      errorP.textContent = '';

      try {
        const response = await fetch('https://backend-4lrl.onrender.com/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password })
        });
        const result = await response.json();
        if (response.ok && result.user) {
          localStorage.setItem('isLoggedIn', 'true');
          updateAuthButtons();
          updateTopBar();
          loginForm.reset();
          closeModal('login-modal');
          alert('Successful login!');
        } else {
          errorP.textContent = result.error || 'Login failed.';
        }
      } catch (err) {
        errorP.textContent = 'Login error.';
      }
    });
  }

  let registeredUserId = null;
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const dob = document.getElementById('dob').value;
      const username = document.getElementById('username').value;
      const errorP = document.getElementById('error');
      errorP.textContent = '';

      if (!registeredUserId) {
        errorP.textContent = "Error: no user registered.";
        return;
      }
      try {
        const response = await fetch('https://backend-4lrl.onrender.com/complete-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: registeredUserId, fullName, email, dob, username })
        });
        const result = await response.json();
        if (result.user) {
          closeModal('profileModal');
          alert('Profile completed successfully!');
        } else {
          errorP.textContent = result.error || "Failed to update profile.";
        }
      } catch (err) {
        errorP.textContent = 'Error updating profile.';
      }
    });
  }

  const freeBetsMenu = document.querySelector('.menu-items li');
  if (freeBetsMenu) {
    freeBetsMenu.addEventListener('click', () => openModal('freeBetsModal'));
  }

  window.addEventListener('click', (event) => {
    const modals = ['signupModal', 'freeBetsModal', 'profileModal', 'login-modal', 'ticketsModal', 'betHistoryModal'];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal && event.target === modal) closeModal(modalId);
    });
  });

  const betButton1 = document.getElementById("place-bet-button-1");
  const cashoutButton1 = document.getElementById("cashout-button-1");
  const betInput1 = document.getElementById('bet-amount-1');
  const betButton2 = document.getElementById("place-bet-button-2");
  const cashoutButton2 = document.getElementById("cashout-button-2");
  const betInput2 = document.getElementById("bet-amount-2");

  if (betButton1) {
    betButton1.replaceWith(betButton1.cloneNode(true));
    document.getElementById("place-bet-button-1").addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startGame(1);
    });
  }
  if (cashoutButton1) {
    cashoutButton1.replaceWith(cashoutButton1.cloneNode(true));
    document.getElementById("cashout-button-1").addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cashOut(1);
    });
  }
  if (betButton2) {
    betButton2.replaceWith(betButton2.cloneNode(true));
    document.getElementById("place-bet-button-2").addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      startGame(2);
    });
  }
  if (cashoutButton2) {
    cashoutButton2.replaceWith(cashoutButton2.cloneNode(true));
    document.getElementById("cashout-button-2").addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      cashOut(2);
    });
  }

  [betInput1, betInput2].forEach((betInput, index) => {
    if (betInput) {
      const panelId = index + 1;
      betInput.addEventListener('input', () => {
        const betAmountText = document.getElementById(`bet-amount-text-${panelId}`);
        if (betAmountText) {
          betAmountText.textContent = `${parseFloat(betInput.value || 0).toFixed(2)} USD`;
        }
      });
    }
  });

  document.querySelectorAll('.bet-panel').forEach((panel, index) => {
    const panelId = index + 1;
    panel.querySelectorAll('button.adjust').forEach(button => {
      button.addEventListener('click', () => {
        const betInput = document.getElementById(`bet-amount-${panelId}`);
        if (betInput) {
          const step = parseFloat(betInput.step || 1.00);
          const min = parseFloat(betInput.min || 1.00);
          let value = parseFloat(betInput.value);
          if (button.dataset.action === 'increase') value += step;
          else if (button.dataset.action === 'decrease' && value > min) value -= step;
          betInput.value = value.toFixed(2);
          const betAmountText = document.getElementById(`bet-amount-text-${panelId}`);
          if (betAmountText) betAmountText.textContent = `${value.toFixed(2)} USD`;
        }
      });
    });
    panel.querySelectorAll('button.quick-amount').forEach(button => {
      button.addEventListener('click', () => {
        const betInput = document.getElementById(`bet-amount-${panelId}`);
        if (betInput) {
          const value = parseFloat(button.dataset.bet);
          if (!isNaN(value)) {
            betInput.value = value.toFixed(2);
            const betAmountText = document.getElementById(`bet-amount-text-${panelId}`);
            if (betAmountText) betAmountText.textContent = `${value.toFixed(2)} USD`;
          }
        }
      });
    });
  });

  document.querySelectorAll(".bet-toggle").forEach(toggle => {
    const betBtn = toggle.querySelector("button.toggle-bet");
    const toggleBtn = toggle.querySelector("button.toggle-auto");
    const autoOptions = toggle.closest('.panel').querySelector('.auto-options');
    if (!betBtn || !toggleBtn || !autoOptions) return;
    if (betBtn.classList.contains("active")) autoOptions.style.display = "none";
    else if (toggleBtn.classList.contains("active")) autoOptions.style.display = "block";
    betBtn.addEventListener("click", () => {
      betBtn.classList.add("active");
      toggleBtn.classList.remove("active");
      autoOptions.style.display = "none";
    });
    toggleBtn.addEventListener("click", () => {
      toggleBtn.classList.add("active");
      betBtn.classList.remove("active");
      autoOptions.style.display = "block";
    });
  });
});

window.addEventListener('resize', resizeCanvas);
