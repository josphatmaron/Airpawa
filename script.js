// =========================
// LOGOUT FUNCTION (GLOBAL SCOPE)
// =========================
function logoutUser() {
  // Clear login state
  localStorage.setItem('isLoggedIn', 'false');
  // Optionally clear any session/token information here
  // For example: localStorage.removeItem('userToken');
  alert('You have been logged out!');
  location.reload(); // This reloads the page and resets to logged-out state
}

// =========================
// CRASH MESSAGE
// =========================
function showCrashMessage(msg, color = "white", duration = 1500) {
  const crashMessage = document.getElementById("crash-message");
  if (crashMessage) {
    crashMessage.textContent = msg;
    crashMessage.style.display = msg ? "block" : "none";
    crashMessage.style.color = color + " !important";
    if (duration > 0 && msg) {
      setTimeout(() => {
        crashMessage.style.display = "none";
      }, duration);
    }
  }
}

// =========================
// MENU TOGGLE
// =========================
const menuToggle = document.getElementById('menu-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdownMenu.style.display === 'flex';
    dropdownMenu.style.display = isVisible ? 'none' : 'flex';
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
  const clickedInsideSafeZone = safeZones.some(zone => zone.contains(e.target));
  if (!clickedInsideSafeZone && dropdownMenu) {
    dropdownMenu.style.display = 'none';
  }
});

// =========================
// CANVAS BACKGROUND
// =========================
const canvas = document.getElementById("game-bg");
const ctx = canvas ? canvas.getContext("2d") : null;
if (ctx) {
  ctx.imageSmoothingEnabled = true;
} else {
  console.error("Canvas or context not available");
}
let rotationAngle = 0;
function resizeCanvas() {
  if (canvas && ctx) {
    // Always use the rendered size for scaling, for mobile correctness
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform!
    ctx.scale(dpr, dpr);
  }
}
function calculateMaxRadius(centerX, centerY) {
  if (!canvas) return 0;
  const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
  const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
  const corners = [
    { x: 0, y: 0 },
    { x: logicalWidth, y: 0 },
    { x: 0, y: logicalHeight },
    { x: logicalWidth, y: logicalHeight }
  ];
  return Math.max(...corners.map(corner => {
    const dx = corner.x - centerX;
    const dy = corner.y - centerY;
    return Math.sqrt(dx * dx + dy * dy);
  }));
}
function drawRadiatingLines() {
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const logicalHeight = canvas.height / dpr;
  const centerX = 0;
  const centerY = logicalHeight;
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

// =========================
// CRASH POINTS
// =========================
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

  showCrashMessage("", "white", 0);

  const multiplierElement = document.getElementById("multiplier");
  if (multiplierElement) {
    multiplierElement.textContent = "1.00x";
    multiplierElement.style.color = "#ffffff";
  }
  gameRunning = true;
  if (ctx) resizeCanvas();
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = requestAnimationFrame(animate);
}

function animate(timestamp) {
  try {
    if (!ctx || !canvas || !gameRunning) return;
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
    animationFrame = requestAnimationFrame(animate);
    if (userHasBet1 && gameRunning) {
      const cashoutSection = document.getElementById("cashout-section-1");
      if (cashoutSection) cashoutSection.style.display = "flex";
    }
    if (userHasBet2 && gameRunning) {
      const cashoutSection = document.getElementById("cashout-section-2");
      if (cashoutSection) cashoutSection.style.display = "flex";
    }
  } catch (error) {
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
    const multiplierElement = document.getElementById("multiplier");
    if (multiplierElement) {
      multiplierElement.textContent = multiplier.toFixed(2) + "x";
      multiplierElement.style.color = "white";
    }
    showCrashMessage("FLEW AWAY!", "white", 3000);
    document.dispatchEvent(new Event('gameCrash'));
    setTimeout(() => {
      resetRound();
    }, 3000);
  } catch (error) {}
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
    betButton1.innerHTML = 'Bet<br><span class="bet-amount" id="bet-amount-text-1">8.00 MZN</span>';
    betButton1.style.display = "flex";
    const betAmountText1 = document.getElementById("bet-amount-text-1");
    if (betAmountText1) betAmountText1.textContent = `${parseFloat(betInput1.value).toFixed(2)} MZN`;
  }
  const betInput2 = document.getElementById("bet-amount-2");
  const betButton2 = document.getElementById("place-bet-button-2");
  if (betInput2 && betButton2) {
    betButton2.innerHTML = 'Bet<br><span class="bet-amount" id="bet-amount-text-2">8.00 MZN</span>';
    betButton2.style.display = "flex";
    const betAmountText2 = document.getElementById("bet-amount-text-2");
    if (betAmountText2) betAmountText2.textContent = `${parseFloat(betInput2.value).toFixed(2)} MZN`;
  }
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
    y = bounceMid + bounceRange * Math.sin(elapsed * 2 * Math.PI * bounceFrequency);
  }
  return { x, y };
}

// =========================
// TRAIL DRAWING
// =========================
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

// =========================
// PLANE IMAGE & DRAWING
// =========================
const planeImage = new Image();
planeImage.src = 'plane pink.png';
planeImage.onload = () => {};
planeImage.onerror = () => {};
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
    ctx.fillRect(0, -planeSize, planeSize, planeSize);
  }
  ctx.restore();
}

// =========================
// BETTING LOGIC
// =========================
function updateTotalBets() {
  try {
    const bets = document.querySelectorAll('.bets-table .bets-row');
    const totalBetsCount = document.getElementById('total-bets-count');
    if (totalBetsCount) {
      totalBetsCount.textContent = `Total: ${bets.length}`;
    }
  } catch (error) {}
}
updateTotalBets();

function startGame(panelId) {
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
    if (betHistoryData.length > 20) {
      betHistoryData.pop();
    }
    renderBetHistory();
    const betButton = document.getElementById(`place-bet-button-${panelId}`);
    const cashoutSection = document.getElementById(`cashout-section-${panelId}`);
    if (betButton) betButton.style.display = "none";
    if (cashoutSection) cashoutSection.style.display = "flex";
  } catch (error) {}
}

function cashOut(panelId) {
  try {
    const hasBet = panelId === 1 ? userHasBet1 : userHasBet2;
    const betAmount = panelId === 1 ? userBetAmount1 : userBetAmount2;
    const betId = panelId === 1 ? userBetId1 : userBetId2;
    if (!hasBet || !gameRunning) {
      return;
    }
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
    showCrashMessage("FLEW AWAY!", "white", 1500);
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
    if (cashoutSection) cashoutSection.style.display = "none";
    if (betButton) betButton.style.display = "flex";
  } catch (error) {}
}

const refreshButton = document.getElementById("refresh-balance");
if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    try {
      const newBalance = (Math.random() * 10000).toFixed(2);
      const userBalance = document.getElementById("user-balance");
      if (userBalance) {
        userBalance.textContent = `MZN ${newBalance}`;
      }
    } catch (error) {}
  });
}
function getBalance() {
  try {
    const userBalance = document.getElementById("user-balance");
    if (userBalance) {
      return parseFloat(userBalance.textContent.replace(/[^\d.-]/g, ""));
    }
    return 0;
  } catch (error) {
    return 0;
  }
}
function setBalance(amount) {
  try {
    const userBalance = document.getElementById("user-balance");
    if (userBalance) {
      userBalance.textContent = `MZN ${amount.toFixed(2)}`;
    }
  } catch (error) {}
}

// =========================
// DOM READY
// =========================
document.addEventListener("DOMContentLoaded", () => {
  try {
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
  } catch (error) {}
});

window.addEventListener("resize", resizeCanvas);

// =========================
// MULTIPLIER HISTORY
// =========================
function addMultiplierToHistory(multiplier) {
  try {
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
  } catch (error) {}
}

function addBetToTable(username, betAmount, multiplier = null, winAmount = null) {
  try {
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
  } catch (error) {}
}

// =========================
// BET HISTORY
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
  try {
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
  } catch (error) {}
}

// =========================
// BET TOGGLE
// =========================
document.querySelectorAll(".bet-toggle").forEach(toggle => {
  try {
    const betBtn = toggle.querySelector(".toggle-bet");
    const autoBtn = toggle.querySelector(".toggle-auto");
    const autoOptions = toggle.closest('.bet-panel')?.querySelector('.auto-bet-cashout-options');
    if (betBtn && betBtn.classList.contains("active") && autoOptions) {
      autoOptions.style.display = "none";
    }
    if (betBtn) {
      betBtn.addEventListener("click", () => {
        betBtn.classList.add("active");
        if (autoBtn) autoBtn.classList.remove("active");
        if (autoOptions) autoOptions.style.display = "none";
      });
    }
    if (autoBtn) {
      autoBtn.addEventListener("click", () => {
        autoBtn.classList.add("active");
        if (betBtn) betBtn.classList.remove("active");
        if (autoOptions) autoOptions.style.display = "block";
      });
    }
  } catch (error) {}
});

// =========================
// TOP BAR LOGIC (Login/Deposit)
// =========================
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let authMode = 'login';

function updateTopBar() {
  try {
    const topBar = document.getElementById('top-bar-button');
    if (!topBar) return;
    topBar.innerHTML = '';
    const link = document.createElement('a');
    link.style.color = 'white';
    link.style.textDecoration = 'none';
    link.style.cursor = 'pointer';
    link.style.pointerEvents = 'auto';
    link.tabIndex = 0;
    if (isLoggedIn) {
      link.href = '#';
      link.textContent = 'Click to deposit';
      link.onclick = function() {
        openModal('deposit');
        return false;
      };
    } else {
      link.href = '#';
      link.textContent = 'Login to play';
      link.onclick = function() {
        openModal('login');
        return false;
      };
    }
    topBar.appendChild(link);
  } catch (error) {}
}
document.addEventListener('DOMContentLoaded', updateTopBar);

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

// Toggle for bet/auto
document.querySelectorAll('.bet-toggle').forEach(toggle => {
  const betButton = toggle.querySelector('.toggle-bet');
  const autoButton = toggle.querySelector('.toggle-auto');
  betButton.addEventListener('click', () => {
    betButton.classList.add('active');
    autoButton.classList.remove('active');
  });
  autoButton.addEventListener('click', () => {
    autoButton.classList.add('active');
    betButton.classList.remove('active');
  });
});

// Free bets menu
document.addEventListener('DOMContentLoaded', function () {
  var menu = document.querySelector('.menu-items li:first-child');
  if (menu) menu.addEventListener('click', function () { openModal('freeBetsModal'); });

  // ========== SIGNUP + PROFILE JS ==========
  let registeredUserId = null;

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
      const response = await fetch('https://backend-4lrl.onrender.com/register', {
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
      if (result.user) {
        closeProfileModal();
        alert('Profile completed! You can now play or log in.');
      } else {
        errorP.textContent = result.error || "Profile update failed.";
      }
    } catch (err) {
      errorP.textContent = "Profile update error.";
    }
  });

  // Modal close on outside click
  window.addEventListener('click', function (event) {
    ['signupModal', 'freeBetsModal', 'profileModal'].forEach(function (id) {
      var modal = document.getElementById(id);
      if (modal && event.target === modal) { closeModal(id); }
    });
  });
});
