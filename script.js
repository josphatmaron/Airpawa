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
  console.error("Canvas with ID 'game-bg' not found or context not supported.");
}
let rotationAngle = 0;

function resizeCanvas() {
  if (canvas) {
    const parent = canvas.parentElement;
    canvas.width = parent ? parent.offsetWidth : window.innerWidth * 0.9;
    canvas.height = parent ? parent.offsetHeight : window.innerHeight * 0.5;
    if (canvas.width === 0 || canvas.height === 0) {
      console.warn("Canvas has zero dimensions. Using fallback sizes.");
      canvas.width = window.innerWidth * 0.9;
      canvas.height = window.innerHeight * 0.5;
    }
    console.log(`Canvas resized to ${canvas.width}x${canvas.height}`);
  } else {
    console.error("Canvas with ID 'game-bg' not found.");
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
  if (!ctx) return;
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
  try {
    rotationAngle += 0.003;
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
let betCounter = 0; // For generating unique bet IDs
let isExiting = false; // Track if plane is flying away
let exitStartTime = null; // Timestamp when fly-away starts
const exitDuration = 300; // Very fast fly-away duration (300ms)

const trail = [];

function getNextCrashPoint() {
  if (crashIndex >= crashPointList.length) {
    crashIndex = 0; // Reset if we reach the end
  }
  const point = crashPointList[crashIndex];
  crashIndex++;
  return point;
}

function resetRound() {
  try {
    console.log("resetRound called");
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
    } else {
      console.error("Element with ID 'multiplier' not found.");
    }
    if (crashMessage) {
      crashMessage.style.display = "none";
    } else {
      console.error("Element with ID 'crash-message' not found.");
    }

    gameRunning = true;
    animationFrame = requestAnimationFrame(animate);
  } catch (error) {
    console.error("Error in resetRound:", error);
  }
}

function animate(timestamp) {
  try {
    console.log(`Animating at timestamp ${timestamp}, multiplier: ${multiplier.toFixed(2)}`);
    if (!startTime) startTime = timestamp;
    const elapsed = (timestamp - startTime) / 1000;

    multiplier = 1 + (elapsed / 3.5);
    const multiplierElement = document.getElementById("multiplier");
    if (multiplierElement) {
      multiplierElement.textContent = multiplier.toFixed(2) + "x";
    } else {
      console.error("Element with ID 'multiplier' not found.");
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
  } catch (error) {
    console.error("Error in animate:", error);
  }
}

function crashGame() {
  try {
    console.log(`Game crashed at multiplier ${multiplier.toFixed(2)}x, crashPoint: ${crashPoint}`);
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
      const betIndex1 = betHistoryData.findIndex(
        item => item.panelId === 1 && item.betId === userBetId1
      );
      if (betIndex1 !== -1) {
        betHistoryData[betIndex1].multiplier = multiplier.toFixed(2) + 'x';
        betHistoryData[betIndex1].cashout = null;
        delete betHistoryData[betIndex1].panelId;
        delete betHistoryData[betIndex1].betId;
      }
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
      const betIndex2 = betHistoryData.findIndex(
        item => item.panelId === 2 && item.betId === userBetId2
      );
      if (betIndex2 !== -1) {
        betHistoryData[betIndex2].multiplier = multiplier.toFixed(2) + 'x';
        betHistoryData[betIndex2].cashout = null;
        delete betHistoryData[betIndex2].panelId;
        delete betHistoryData[betIndex2].betId;
      }
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

    document.dispatchEvent(new Event('gameCrash'));

    console.log("Scheduling resetRound in 3 seconds");
    setTimeout(() => {
      console.log("Executing resetRound");
      resetRound();
    }, 3000);
  } catch (error) {
    console.error("Error in crashGame:", error);
  }
}

function resetGameUI() {
  try {
    userHasBet1 = false;
    userBetAmount1 = 0;
    userBetId1 = null;
    userHasBet2 = false;
    userBetAmount2 = 0;
    userBetId2 = null;

    const cashoutSection1 = document.getElementById("cashout-section-1");
    const cashoutSection2 = document.getElementById("cashout-section-2");
    if (!userHasBet1 && cashoutSection1) {
      cashoutSection1.style.display = "none";
    }
    if (!userHasBet2 && cashoutSection2) {
      cashoutSection2.style.display = "none";
    }

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
  } catch (error) {
    console.error("Error in resetGameUI:", error);
  }
}

function updateActivePlayers() {
  try {
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
  } catch (error) {
    console.error("Error in updateActivePlayers:", error);
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
  if (!ctx) return;
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
planeImage.src = 'plane pink.png'; // Adjust path as needed 
planeImage.onload = () => {
  console.log("Plane image loaded successfully");
};
planeImage.onerror = () => {
  console.error("Failed to load plane image. Check path: 'plane pink.png'");
};

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
    console.warn("Plane image not loaded; using fallback rectangle.");
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
  } catch (error) {
    console.error("Error in updateTotalBets:", error);
  }
}

updateTotalBets();

function startGame(panelId) {
  try {
    console.log(`startGame called for panel ${panelId} at ${new Date().toISOString()}`);
    const betInput = document.getElementById(`bet-amount-${panelId}`);
    if (!betInput) {
      console.error(`Bet input for panel ${panelId} not found.`);
      return;
    }
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
    if (existingBet) {
      console.warn(`Bet already exists for panel ${panelId}. Skipping duplicate.`);
      return;
    }

    setBalance(balance - bet);
    const betId = `bet-${betCounter++}`;
    if (panelId === 1) {
      userHasBet1 = true;
      userBetAmount1 = bet;
      userBetId1 = betId;
      console.log(`Bet placed on panel 1: ${bet} MZN, betId: ${betId}`);
    } else {
      userHasBet2 = true;
      userBetAmount2 = bet;
      userBetId2 = betId;
      console.log(`Bet placed on panel 2: ${bet} MZN, betId: ${betId}`);
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
    else console.error(`Bet button for panel ${panelId} not found.`);
    if (cashoutSection) cashoutSection.style.display = "flex";
    else console.error(`Cashout section for panel ${panelId} not found.`);
  } catch (error) {
    console.error(`Error in startGame for panel ${panelId}:`, error);
  }
}

function cashOut(panelId) {
  try {
    console.log(`cashOut called for panel ${panelId}`);
    const hasBet = panelId === 1 ? userHasBet1 : userHasBet2;
    const betAmount = panelId === 1 ? userBetAmount1 : userBetAmount2;
    const betId = panelId === 1 ? userBetId1 : userBetId2;
    if (!hasBet || !gameRunning) {
      console.log(`Cashout aborted for panel ${panelId}: No bet or game not running.`);
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
    } else {
      console.warn(`No matching bet found for panel ${panelId} with betId ${betId} in betHistoryData`);
    }

    if (panelId === 1) {
      userHasBet1 = false;
      userBetAmount1 = 0;
      userBetId1 = null;
      console.log(`Cashout successful for panel 1: ${winnings} MZN`);
    } else {
      userHasBet2 = false;
      userBetAmount2 = 0;
      userBetId2 = null;
      console.log(`Cashout successful for panel 2: ${winnings} MZN`);
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
      console.log(`Cashout banner displayed for panel ${panelId}: ${winnings} MZN`);

      setTimeout(() => {
        banner.style.display = "none";
      }, 2000);
    } else {
      console.error("Cashout banner or win amount element not found.");
    }

    const cashoutSection = document.getElementById(`cashout-section-${panelId}`);
    const betButton = document.getElementById(`place-bet-button-${panelId}`);
    if (cashoutSection) {
      cashoutSection.style.display = "none";
    } else {
      console.error(`Cashout section for panel ${panelId} not found.`);
    }
    if (betButton) {
      betButton.style.display = "flex";
    } else {
      console.error(`Bet button for panel ${panelId} not found.`);
    }
  } catch (error) {
    console.error(`Error in cashOut for panel ${panelId}:`, error);
  }
}

// =========================
// BALANCE FUNCTIONS
// =========================
const refreshButton = document.getElementById("refresh-balance");
if (refreshButton) {
  refreshButton.addEventListener("click", () => {
    try {
      const newBalance = (Math.random() * 10000).toFixed(2);
      const userBalance = document.getElementById("user-balance");
      if (userBalance) {
        userBalance.textContent = `MZN ${newBalance}`;
      }
    } catch (error) {
      console.error("Error in refreshBalance:", error);
    }
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
    console.error("Error in getBalance:", error);
    return 0;
  }
}

function setBalance(amount) {
  try {
    const userBalance = document.getElementById("user-balance");
    if (userBalance) {
      userBalance.textContent = `MZN ${amount.toFixed(2)}`;
    }
  } catch (error) {
    console.error("Error in setBalance:", error);
  }
}

// =========================
// DOM READY
// =========================
document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log("DOMContentLoaded: Initializing game and top bar");
    const betButton1 = document.getElementById("place-bet-button-1");
    const cashoutButton1 = document.getElementById("cashout-button-1");
    const betInput1 = document.getElementById("bet-amount-1");
    const betButton2 = document.getElementById("place-bet-button-2");
    const cashoutButton2 = document.getElementById("cashout-button-2");
    const betInput2 = document.getElementById("bet-amount-2");

    console.log("Initializing bet panels");
    if (betButton1) console.log("Found bet-button-1");
    if (cashoutButton1) console.log("Found cashout-button-1");
    if (betInput1) console.log("Found bet-amount-1");
    if (betButton2) console.log("Found bet-button-2");
    if (cashoutButton2) console.log("Found cashout-button-2");
    if (betInput2) console.log("Found bet-amount-2");

    document.querySelectorAll('.bet-panel').forEach(panel => {
      const autoOptions = panel.querySelector('.auto-bet-cashout-options');
      const betBtn = panel.querySelector('.toggle-bet');
      const autoBtn = panel.querySelector('.toggle-auto');

      if (betBtn && autoBtn && autoOptions) {
        if (betBtn.classList.contains('active')) {
          autoOptions.style.display = 'none';
        } else if (autoBtn.classList.contains('active')) {
          autoOptions.style.display = 'block';
        }
      }
    });

    if (betButton1) {
      betButton1.replaceWith(betButton1.cloneNode(true));
      document.getElementById("place-bet-button-1").addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("Bet button 1 clicked");
        startGame(1);
      });
    } else {
      console.error("Bet button 1 not found.");
    }

    if (cashoutButton1) {
      cashoutButton1.replaceWith(cashoutButton1.cloneNode(true));
      document.getElementById("cashout-button-1").addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("Cashout button 1 clicked");
        cashOut(1);
      });
    } else {
      console.error("Cashout button 1 not found.");
    }

    if (betButton2) {
      betButton2.replaceWith(betButton2.cloneNode(true));
      document.getElementById("place-bet-button-2").addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("Bet button 2 clicked");
        startGame(2);
      });
    } else {
      console.error("Bet button 2 not found.");
    }

    if (cashoutButton2) {
      cashoutButton2.replaceWith(cashoutButton2.cloneNode(true));
      document.getElementById("cashout-button-2").addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("Cashout button 2 clicked");
        cashOut(2);
      });
    } else {
      console.error("Cashout button 2 not found.");
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
    console.log("Calling resetRound");
    resetRound();
    updateTopBar();
  } catch (error) {
    console.error("Error in DOMContentLoaded:", error);
  }
});

window.addEventListener("resize", resizeCanvas);

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
  } catch (error) {
    console.error("Error in addMultiplierToHistory:", error);
  }
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
  } catch (error) {
    console.error("Error in addBetToTable:", error);
  }
}

// =========================
// BET HISTORY TOGGLE
// =========================
const betHistoryButton = document.getElementById('bet-history-button');
const betHistoryPanel = document.getElementById('bet-history-panel');

if (betHistoryButton && betHistoryPanel) {
  betHistoryButton.addEventListener('click', () => {
    try {
      const isVisible = betHistoryPanel.style.display === 'block';
      betHistoryPanel.style.display = isVisible ? 'none' : 'block';
    } catch (error) {
      console.error("Error in betHistoryButton click:", error);
    }
  });
}

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
  } catch (error) {
    console.error("Error in renderBetHistory:", error);
  }
}

function openBetHistoryModal() {
  try {
    renderBetHistory();
    const modal = document.getElementById('betHistoryModal');
    if (modal) modal.style.display = 'flex';
  } catch (error) {
    console.error("Error in openBetHistoryModal:", error);
  }
}

function closeBetHistoryModal() {
  try {
    const modal = document.getElementById('betHistoryModal');
    if (modal) modal.style.display = 'none';
  } catch (error) {
    console.error("Error in closeBetHistoryModal:", error);
  }
}

window.addEventListener('click', function (e) {
  try {
    const modal = document.getElementById('betHistoryModal');
    if (e.target === modal) {
      closeBetHistoryModal();
    }
    const freeBetsModal = document.getElementById('freeBetsModal');
    if (e.target === freeBetsModal) {
      closeModal('freeBetsModal');
    }
    const ticketsModal = document.getElementById("ticketsModal");
    if (e.target === ticketsModal) {
      closeModal('ticketsModal');
    }
  } catch (error) {
    console.error("Error in window.onclick:", error);
  }
});

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
  } catch (error) {
    console.error("Error in bet-toggle setup:", error);
  }
});

let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let authMode = 'login';

function openModal(id) {
  try {
    console.log(`openModal called with id: ${id}`);
    let modal;
    if (id === 'login' || id === 'signup') {
      authMode = id;
      modal = document.getElementById('auth-modal');
      if (modal) {
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.background = 'rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '1000';
        modal.style.opacity = '1';
        console.log("auth-modal found and set to display: block");
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) {
          modalTitle.textContent = id === 'login' ? 'Login' : 'Signup';
          console.log(`Modal title set to: ${modalTitle.textContent}`);
        } else {
          console.error("Element with ID 'modal-title' not found.");
        }
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.display = 'block';
          modalContent.style.background = 'white';
          modalContent.style.padding = '20px';
          modalContent.style.margin = '15% auto';
          modalContent.style.width = '300px';
          console.log("Modal content styled and visible");
        } else {
          console.error("Modal content with class 'modal-content' not found in auth-modal.");
        }
      } else {
        console.error("Element with ID 'auth-modal' not found.");
      }
    } else {
      modal = document.getElementById(id + '-modal') || document.getElementById(id);
      if (modal) {
        modal.style.display = id === 'freeBetsModal' ? 'block' : 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '1000';
        modal.style.opacity = '1';
        console.log(`Modal ${id} set to display`);
      } else {
        console.error(`Element with ID '${id}-modal' or '${id}' not found.`);
      }
    }
  } catch (error) {
    console.error(`Error in openModal (${id}):`, error);
  }
}

function closeModal(modalId) {
  try {
    const modal = document.getElementById(modalId + '-modal') || document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
      console.log(`Modal ${modalId} closed`);
    } else {
      console.error(`Element with ID '${modalId}-modal' or '${modalId}' not found.`);
    }
  } catch (error) {
    console.error(`Error closing modal (${modalId}):`, error);
  }
}

const authForm = document.getElementById('auth-form');
if (authForm) {
  authForm.addEventListener('submit', async function (e) {
    try {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const response = await fetch(`http://localhost:3000/${authMode}`, {
        method: 'POST',
        headers: { transference: 'Yes', 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();
      alert(result.message);

      if (response.ok) {
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        updateTopBar();
        closeModal('auth');
        openModal('deposit');
      }
    } catch (error) {
      console.error("Error in auth-form submit:", error);
      alert('Error connecting to server. Please try again later.');
    }
  });
}

function logoutUser() {
  try {
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    updateTopBar();
    alert("You have been logged out.");

    setTimeout(() => {
      window.location.href = "logout.php";
    }, 300);
  } catch (error) {
    console.error("Error in logout:", error);
  }
}

function updateTopBar() {
  try {
    console.log("updateTopBar called, isLoggedIn:", isLoggedIn);
    const topBar = document.getElementById('top-bar-button');
    if (!topBar) {
      console.error("Element with ID top-bar-button not found.");
      return;
    }
    console.log("top-bar-button found");
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
        console.log("Deposit link clicked");
        openModal('deposit');
        return false;
      };
    } else {
      link.href = '#';
      link.textContent = 'Login to play';
      link.onclick = function() {
        console.log("Click to login");
        openModal('login');
        return false;
      };
    }

    topBar.appendChild(link);
    console.log(`Top bar updated with link: ${link.textContent}`);
  } catch (error) {
    console.error("Error in updateTopBar:", error);
  }
}

document.addEventListener('DOMContentLoaded', updateTopBar);

const freeBetsMenuItem = document.querySelector('.menu-items li:first-child');
if (freeBetsMenuItem) {
  freeBetsMenuItem.addEventListener('click', function() {
    openModal('freeBetsModal');
  });
}

// Login form submission handler
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const phone = document.getElementById('login-phone').value;
  const password = document.getElementById('login-password').value;

  if (phone && password) {
    console.log('Login attempt:', { phone, password });
    closeModal('login');
    alert('Login successful!');
  } else {
    alert('Please fill in all fields.');
  }
});

function openTicketsModal() {
    document.getElementById("ticketsModal").style.display = "block";
}

function closeTicketsModal() {
    document.getElementById("ticketsModal").style.display = "none";
}
