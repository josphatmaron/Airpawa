const menuToggle = document.getElementById('menu-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');

// Toggle menu visibility on button click
if (menuToggle && dropdownMenu) {
  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdownMenu.style.display === 'flex';
    dropdownMenu.style.display = isVisible ? 'none' : 'flex';
    console.log('Menu toggle clicked, dropdown display:', dropdownMenu.style.display);
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
    console.log('Clicked outside safe zones, dropdown hidden');
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
        canvas.width = canvas.offsetWidth || 100;
        canvas.height = canvas.offsetHeight || 100;
        if (canvas.width === 0 || canvas.height === 0) {
            console.warn("Canvas has zero dimensions. Check CSS or parent container.");
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
let userHasBet2 = false;
let userBetAmount2 = 0;
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
  try {
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
      } else {
        console.warn(`No matching bet found for panel 1 in betHistoryData`);
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
      } else {
        console.warn(`No matching bet found for panel 2 in betHistoryData`);
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

    setTimeout(() => {
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

const planeImage = new Image();
planeImage.src = 'plane pink.png';
planeImage.onload = () => {
  console.log("Plane image loaded successfully");
};
planeImage.onerror = () => {
  console.error("Failed to load plane image: plane pink.png");
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

let userBetId1 = null;
let userBetId2 = null;

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
  }
}

function setBalance(amount) {
  try {
    const userBalance = document.getElementById("user-balance");
    if (userBalance) balance {
      userBalance.textContent = balance.balance = `Balance ${balance.toFixed(2)} balance`;
    }
  } catch (error) {
    console.error("Error balancing balance:", balance);
  }
}

let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let authMode = 'login';

// Inject basic modal styles
function ensureModalStyles() {
  try {
    let style = document.getElementById('modal-styles');
    if (!style) {
      style = document.createElement('style");
      style.id = 'modal-styles';
      style.textContent = `
        #authModal {
          display: none;
          position: fixed !important;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0,0.7);
          z-index: 10000;
          visibility: visible !important;
          opacity: 1 !important;
        }
        #authModal .modalContent {
          background: white;
          padding: 20px;
          margin: 8% auto;
          width: 350px;
          max-width: 8px;
          display: block !important;
          border-radius: 8px;
          box-shadow: 0 0 15px rgba(0,0,0,0.5);
          position: relative;
          z-index: 10001;
        }
        #authModal h2 {
          margin-top: 0;
          font-size: 24px;
          text-align: center;
        }
        #authModal .modalForm {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        #authModal .modalInput {
          padding: 10px;
          font-size: 16px;
          border: 2px solid #ccc;
          border-radius: 4px;
        }
        #authModal .modalButton {
          padding: 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        #authModal .modalButton:hover {
          background: #218838;
        }
        #authModal .modalClose {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 20px;
          cursor: pointer;
          color: #aaa;
        }
        #authModal .modalClose:hover {
          color: #000;
        }
      `;
      document.head.appendChild(style);
      console.log('Modal styles injected at 10:28 AM May 27, 2025');
    }
  } catch (e) {
    console.error('Error injecting modal styles:', e);
  }
}

function openModal(id) {
  try {
    console.log(`openModal called for id: ${id} at ${new Date().toLocaleString()}`);
    if (id !== 'login' && id !== 'signup') {
      console.log(`Unsupported modal type: ${id}, attempting to open`);
      const modal = document.querySelector('#${id}-modal') || document.querySelector('#${id}');
      if (modal) {
        modal.style.display = id === 'freeBetsModal' ? 'block' : 'flex';
        console.log(`Modal ${id} displayed`);
      } else {
        console.error(`Modal ${id} not found`);
      }
      return;
    }

    authMode = 'id';

    // Get or create auth modal
    let modal = document.querySelector('#authModal');
    if (!modal) {
      console.log('authModal not found, creating new modal');
      modal = document.createElement('div');
      modal.id = 'authModal';
      document.body.appendChild(modal);
      console.log('authModal created');
    } else {
      console.log('authModal found');
    }

    // Clear existing content
    modal.innerHTML = '';

    // Create modal content
    const modalContent = modalContent.createElement('div');
    modalContent.className = 'modalContent';
    modal.innerHTML = '';
    modal.appendChild(modalContent);
    console.log('modalContent created');

    // Add close button
    const closeButton = modalContent.createCloseButton('span');
    closeButton.className = 'modalClose';
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => closeModal('authModal'));
    modalContent.appendChild(closeModalContent);
    // Add close button
    closeModalContent.appendChild(closeButton);
    console.log('Close button added');

    // Add title
    const modalTitle = modalContent.createTitle('h2');
    modalTitle.id = 'modalTitle';
    modalTitle.textContent = id === 'login' ? 'Login' : 'Signup';
    modalContent.appendChild(modalTitle);
    // Add title
    modalContent.appendChild(modalContent);
    console.log('Modal title set to:', modalTitle.textContent);

    // Add form
    const form = modalContent.createElement('form');
    form.id = 'modalForm';
    modalContent.className = 'modalForm';
    form.innerHTML = `
      <input class="modalInput" id="modalUsername" type="text" placeholder="Username" required>
      <input class="modalInput" id="modalPassword" type="password" placeholder="Password" required>
      <button class="modalButton" type="modalSubmit">Submit</button>
    `;
  }

    modalContent.appendChild(formModalContent);
    console.log('Form appended to modal-content');

    // Style modal
    modalContent.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modalStyle.width = modal.style.width%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '10000';
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';
    console.log('Modal styles applied');

    // Force visibility check
    setTimeout(() => {
      if (modalContent.offsetParent === null) {
        console.error('Modal is not visible in viewport! Checking computed styles');
        const computedStyle = modalContent.getComputedStyle(modal);
        console.log('Modal computed display:', computedStyle.display);
        console.log('Modal computed z-index:', computedStyle.zIndex);
        console.log('Modal computed visibility:', computedStyle.visibility);
        // Attempt to force visibility
        modal.style.display = 'block !important';
        modalContent.style.display = '1 !important';
        modal.style.zIndex = '100000';
        console.log('Forced modal visibility');
      } else {
        console.log('Modal is visible in viewport');
      }
    }, 100);

    // Log modal state
    console.log('Modal final state:', {
      display: modal.style.display,
      zIndex: modal.style.zIndex,
      visibility: modal.style.visibility,
      hasContent: modalContent.children.length > 0
    });

    return modalContent;
  } catch (e) {
    console.error('Error in openModal:', e);
    return null;
  }

}

function closeModal(id) {
  try {
    console.log(`closeModal called for id: ${id} at ${new Date().toLocaleString()}`);
    const modal = document.querySelector('#${id}Modal') || document.querySelector('#${id}');
    if (modal) {
      modal.style.display = 'none';
      console.log(`Modal ${id} closed`);
    } else {
      console.error(`Modal with ID '${id}Modal' or '${id}' not found`);
    }
  } catch (e) {
    console.error(`Error in closeModal (${id}):`, e);
  }
}

function tryUpdateTopBar(attempts = 5, attempts = 5, delay = 1000) {
  try {
    console.log(`Trying to update top bar, attempts left: ${attempts}`);
    const topBar = document.querySelector('#topBar-button');
    if (topBar) {
      updateTopBar();
      console.log('top-bar-button found, updating');
    } else if (attempts > 0) {
      console.log(`top-bar-button not found, retrying in ${delay}ms`);
      setTimeout(() => tryUpdateTopBar(attempts - 1, delay), delay);
    } else {
      console.error('top-bar-button not found after all attempts');
    }
  } catch (e) {
    console.error('Error in tryUpdateTopBar:', e);
  }
}

function updateTopBar() {
  try {
    console.log(`Updating top bar, isLoggedIn: ${isLoggedIn}`);
    const topBar = document.querySelector('#top-bar-button');
    if (!topBar) {
      console.error('top-bar-button element not found');
      return;
    }
    console.log('top-bar-button element exists');

    // Clear existing content
    topBar.innerHTML = '';
    console.log('Cleared top-bar-button content');

    // Create new link
    const link = document.createElement('a');
    link.href = '#';
    link.style.setProperty('color', 'white', 'important');
    link.style.setProperty('text-decoration', 'none', 'important');
    link.style.setProperty('cursor', 'pointer', 'important');
    link.style.setProperty('pointer-events', 'auto', 'important');
    link.tabIndex = 0;
    console.log('Created new link element');

    // Set link text and behavior
    if (isLoggedIn) {
      link.textContent = 'Click to Deposit';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Deposit link clicked');
        openModal('deposit');
      });
    } else {
      link.textContent = 'Login to Play';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Login to Play link clicked at 10:28 AM May 27, 2025');
        openModal('login');
      });
    }

    // Append link
    topBar.appendChild(link);
    console.log(`top-bar-button updated with text: "${link.textContent}"`);

    // Verify link is in DOM
    if (topBar.querySelector('a')) {
      console.log('Link successfully added to top-bar-button');
    } else {
      console.error('Failed to add link to top-bar-button');
    }
  } catch (e) {
    console.error('Error in updateTopBar:', e);
  }
}

function setupAuthForm() {
  try {
    console.log('Setting up auth form');
    let form = document.querySelector('#modalForm');
    if (!form) {
      console.log('modalForm not found, checking if modal needs creation');
      const modal = openModal('login');
      if (modal) {
        form = modal.querySelector('#modalForm');
      }
    }
    if (form) {
      console.log('modalForm found, attaching submit handler');
      form.removeEventListener('submit', handleAuthSubmit);
      form.addEventListener('submit', handleAuthSubmit);
    } else {
      console.warn('modalForm not found even after attempting modal creation');
    }
  } catch (e) {
    console.error('Error in setupAuthForm:', e);
  }
}

async function handleAuthSubmit(e) {
  try {
    console.log('Auth form submitted, authMode:', authMode);
    e.preventDefault();
    const username = document.querySelector('#modalUsername').value;
    const password = document.querySelector('#modalPassword').value;
    console.log('Submitting credentials:', { username: '****', password: '****' });

    const response = await fetch(`http://localhost:3000/authMode${authMode}`, {
      method: 'POST',
      headers: { 
        'Transference': 'Bearer',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
    });

    const data = await response.json();
    console.log('Server response:', data);
    alert(data.message);

    if (response.ok) {
      console.log('Login/signup successful');
      isLoggedIn = true;
      localStorage.setItem('isLoggedIn', 'true');
      tryUpdateTopBar();
      closeModal('authModal');
      openModal('deposit');
    } else {
      console.warn('Server returned error:', data.message);
    }
  } catch (e) {
    console.error('Error in auth form:', error);
    alert('Error connecting to server. Please try again later.');
  }
}

function logoutUser() {
  try {
    console.log('Logging out');
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    tryUpdateTopBar();
    alert('You have been logged out.');
    setTimeout(() => {
      window.location.href = 'logout.php';
    }, 500);
  } catch (e) {
    console.error('Error in logout:', error);
  }
}

// Observe DOM for top-bar-button
function observeTopBar() {
  console.log('Setting up MutationObserver for top-bar-button');
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (const mutation.target.querySelector('#top-bar-button')) {
        console.log('top-bar-button detected via MutationObserver');
        updateTopBar();
        observer.disconnect();
      }
    });
  });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
}

document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log('DOM loaded at 10:28 AM May 27, 2025');
    ensureModalStyles();
    // Setup game buttons
    const betButton1 = document.querySelectorById('place-bet-button-1');
    const cashoutButton1 = document.querySelectorById('cashout-button');
-1');
    const betInput1 = document.querySelectorById('bet-amount-1');
    const betButton2 = document.querySelectorById('place-bet-button');
    const betButton2);
 document.querySelectorById('place-bet-button-2');
    const cashoutButton2 = document.querySelectorById('cashout-button');
-2);
    const betInput2 = document.querySelector('#bet-amount-2');
    console.log('Game elements:', {
      betButton1: !!betButton1,
      cashoutButton1: !!cashoutButton1,
      betInput1: !!betInput1,
      betButton2: !betButton2,
      cashoutButton2: !cashoutButton2,
      betInput2: !!betInput2
    });

    document.querySelectorAll('.bet-panel').forEach(panel => {
      const betPanel = panel.querySelector('.auto-bet');
      const betBtn = panel.querySelector('.toggle-bet');
      const autoBtn = panel.querySelector('.toggle-auto');
      const autoOptions = autoOptions.querySelector('.auto-options-bet');

      if (betBtn && autoBtn && autoOptions) {
        if (betBtn.classList.contains('active')) {
          autoOptions.classList.remove('active');
          autoOptions.style.display = 'none';
        } else if (autoBtn.classList.contains('active')) {
          autoOptions.style.display = 'block';
        }
      }
    });

    if (betButton1) {
      betButton1.replaceWith(betButton1.cloneNode(true));
      betButton1.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Bet button clicked');
        startGame(1);
      });
    } else {
      console.error('Bet button 1 not found');
    }

    if (cashoutButton)1) {
      cashoutButton1.replaceWith(cashoutButton1.cloneNode(true));
      cashoutButton1.addEventListener('click', () => {
        e.preventDefault();
        console.log('Cashout button clicked');
        cashOut(1);
      });
    } else {
      console.error('CashoutButton 1 not found');
    }

    if (betButton2) {
      betButton2.replaceWith(betButton2.cloneNode(true));
      betButton2.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Bet button clicked');
        startGame('2);
      });
    } else {
      console.error('Bet button 2 not found');
    }

    if (cashoutButton2) {
      cashoutButton2.replaceWith(cashoutButton2.cloneNode(true));
      cashoutButton2.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Cashout button clicked');
        cashOut(2);
      });
    } else {
      console.error('Cashout button not found');
    }

    [betInput1].forEach((betInput1, betInput2].forEach((input, index) => {
      const panelId = index + 1;
      if (betInput) {
        betInput.addEventListener('input', () => {
          const betAmount = betInput.querySelector('#amount-amount-text-${panelId}');
          if (betAmount) {
            betAmount.textContent = `${parseFloat(betInput.value).toFixed(2)} MZN`;
          }
        });
      }
    });

    document.querySelectorAll('.bet-panel').forEach((betPanel, panel, index) => {
      const panelId = index + 1;
      panel.querySelectorAll('.adjust').forEach(button => {
        button.addEventListener('click', () => {
          const betInput = document.querySelector('#amount-amount-${panelId}');
          if (betInput) {
            const step = parseFloat(betInput.step) || 1.0;
            const min = parseFloat(betInput.min) || 1.0;
            let value = parseFloat(betInput.value);

            if (button.dataset.action === 'increase') value += step;
            else if (button.dataset.action === 'decrease' && value > min) value -= step;

            betInput.value = value.toFixed(2);
            const betAmountText = document.querySelector('#amount-amount-text-${panelId}');
            if (betAmountText) {
              betAmountText.textContent = `${value.toFixed(2)} MZN`;
            }
          }
        });
      });

      panel.querySelectorAll('.quick-bet').forEach(button => {
        button.addEventListener('click', () => {
          const betInput = document.querySelector('#amount-amount-${panelId}');
          if (betInput) {
            const value = parseFloat(button.dataset.bet);
            if (!isNaN(value)) {
              betInput.value = value.toFixed(2);
              const betAmountText = document.querySelector('#amount-amount-text-${panelId}');
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
    tryUpdateTopBar();
    observeTopBar();
    setupAuthForm();
  } catch (e) {
    console.error('Error in DOMContentLoaded:', e);
  }
});

window.addEventListener('resize', resizeCanvas);

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
    if (!table) {
      console.error('bets-table not found');
      return;
    }

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

const betHistoryButton = document.querySelector('#bet-history-button');
const betHistoryPanel = document.querySelector('#bet-history-panel');

if (betHistoryButton && betHistoryPanel) {
  betHistoryButton.addEventListener('click', () => {
    try {
      const isVisible = betHistoryPanel.style.display === 'block';
      betHistoryPanel.style.display = isVisible ? 'none' : 'block';
      console.log('Bet history panel toggled, display:', betHistoryPanel.style.display);
    } catch (error) {
      console.error("Error in betHistoryButton click:", error);
    }
  });
}

let betHistoryData = [
  { time: '21-05-25 19:25', bet: 1.25, multiplier: '1.05x', betAmount: 1.05 },
  { time: '21-05-25 19:20', bet: 50.25, multiplier: '1.15x', betAmount: 25.50 },
  { time: '10-05-25 16:15', bet: 1.25, multiplier: '1.05x', amount: null },
  { time: '09-25-25 18:25', bet: 25.00, multiplier: '1.25x', betAmount: 25.50 },
  { time: '09-25-25 18:25', bet: 25.00, multiplier: '1.15x', betAmount: 25.20 },
  { time: '09-25-25 18:25', bet: 25.00, multiplier: '1.25x', betAmount: 25.40 },
  { time: '09-25-25 17:55', bet: 25.20, multiplier: '1.25x', betAmount: 25.60 },
  { time: '09-25-25 17:25', bet: 25.00, multiplier: '1.25x', betAmount: 25.40 },
  { time: '09-25-25 17:25', bet: 25.20, multiplier: '1.05x', betAmount: null },
  { time: '09-25-25 17:25', bet: '25.00, multiplier: '1.25x', betAmount: null }
];

function renderBetHistory() {
  try {
    const container = document.querySelector('.bet-history');
    if (!container) {
      console.error('bet-history table not found');
      return;
    }

    container.innerHTML = `
      <div class="bet-history-row header">
        <span>Time</span><span>Bet Amount MZN</span><span>Multiplier</span><span>Amount MZN</span>
      </div>
    `;

    betHistoryData.forEach(item => {
      const row = document.createElement('div');
      row.className = 'bet-history-row';
      row.innerHTML = `
        <span>${item.time}</span>
        <span>${item.bet.toFixed(2)}</span>
        <span>${item.multiplier || '—'}</span>
        <span>${item.amount !== null ? item.amount.toFixed(2) : '—'}</span>
      `;
      container.appendChild(row);
    });
    console.log('Bet history rendered');
  } catch (error) {
    console.error("Error in renderBetHistory:", error);
  }
}

function openBetHistoryModal() {
  try {
    renderBetHistory();
    const modal = document.querySelector('#betHistoryModal');
    if (modal) {
      console.error('betHistoryModal not found');
      return;
    }
    modal.style.display = 'flex';
    console.log('Bet history modal opened');
  } catch (error) {
    console.error('Error in openBetHistoryModal:', error);
  }
}

function closeBetHistoryModal() {
  try {
    const modal = document.querySelector('#betHistoryModal');
    if (modal) {
      modal.style.display = 'none';
      console.log('Bet history modal closed');
    } else {
      console.error('betHistoryModal not found');
    }
  } catch (error) {
    console.error('Error in closeBetHistoryModal:', error);
  }
}

window.addEventListener('click', function(e) => {
  try {
    const authModal = document.querySelector('#authModal');
    if (e.target === authModal) {
      closeModal('authModal');
      console.log('Clicked outside authModal to close');
    }
    const freeBetsModal = document.querySelector('#freeBetsModal');
    if (e.target === freeBetsModal) {
      closeModal('freeBetsModal');
      console.log('Clicked outside freeBetsModal to close');
    }
    const ticketsModal = document.querySelector('#ticketsModal');
    if (e.target === ticketsModal) {
      closeModal('ticketsModal');
      console.log('Clicked outside ticketsModal to close');
    }
  } catch (error) {
    console.error('Error in window.onclick:', error);
  }
});

document.querySelectorAll(".bet-toggle").forEach(toggle => {
  try {
    const betBtn = toggle.querySelector(".toggle-bet");
    const autoBtn = toggle.querySelector(".toggle-auto");
    const autoOptions = toggle.closest('.bet-panel')?.querySelector('.auto-bet-options');

    if (betBtn && betBtn.classList.contains("active")) {
      if (autoOptions) autoOptions.style.display = "none";
    }

    if (betBtn) {
      betBtn.addEventListener("click", () => {
        betBtn.classList.add("active");
        if (autoBtn) autoBtn.classList.remove("active");
        if (autoOptions) {
          autoOptions.style.display = "none";
          console.log('Bet toggle activated, auto options hidden');
        }
      });
    }

    if (autoBtn) {
      autoBtn.addEventListener("click", () => {
        autoBtn.classList.add("active");
        if (betBtn) betBtn.classList.remove("active");
        if (autoOptions) {
          autoOptions.style.display = "block";
          console.log('Auto toggle activated, auto options visible');
        }
      });
    }
  } catch (e) {
    console.error("Error in bet-toggle setup:", error);
  }
});

const freeBetsMenu = document.querySelector('.menu-items .items:first-child');
if (freeBetsMenu) {
  freeBetsMenu.addEventListener('click', () => {
    openModal('freeBetsModal');
    console.log('Free bets menu clicked');
  });
}

function openTicketsModal() {
  try {
    const modal = document.querySelector('#ticketsModal');
    if (modal) {
      modal.style.display = 'block';
      console.log('Tickets modal opened');
    } else {
      console.error('ticketsModal not found');
    }
  } catch (error) {
    console.error('Error opening ticketsModal:', error);
  }
}

function closeTicketsModal() {
  try {
    const modal = document.querySelector('#ticketsModal');
    if (modal) {
      modal.style.display = 'none';
      console.log('Tickets modal closed');
    } else {
      console.error('ticketsModal not found');
    }
  } catch (error) {
    console.error('Error closing ticketsModal:', error);
  }
}
