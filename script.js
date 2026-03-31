// Game Variables
let score = 0;
let bestScore = localStorage.getItem('tootaUddBestScore') || 0;
let isPlaying = false;
let isHolding = false;
let releasedThisRound = false;
let currentObject = null;
let roundTimer;
let roundDuration = 1500; // Default 1.5 seconds

// DOM Elements - Menus
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const newGameBtn = document.getElementById('new-game-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const timeSlider = document.getElementById('time-slider');
const timeDisplay = document.getElementById('time-display');

// DOM Elements - Game
const scoreEl = document.getElementById('current-score');
const bestScoreEl = document.getElementById('best-score');
const messageEl = document.getElementById('message-display');
const objectContainer = document.getElementById('object-display');
const emojiEl = document.getElementById('emoji-display');
const nameEl = document.getElementById('name-display');
const actionBtn = document.getElementById('action-btn');

// Object Database with Hindi pronunciation
const objects = [
    { name: "Parrot", hindiName: "Tota", emoji: "🦜", flies: true },
    { name: "Airplane", hindiName: "Hawai jahaj", emoji: "✈️", flies: true },
    { name: "Dog", hindiName: "Kutta", emoji: "🐕", flies: false },
    { name: "Eagle", hindiName: "Cheel", emoji: "🦅", flies: true },
    { name: "Car", hindiName: "Gaadi", emoji: "🚗", flies: false },
    { name: "Cat", hindiName: "Billi", emoji: "🐈", flies: false },
    { name: "House", hindiName: "Ghar", emoji: "🏠", flies: false },
    { name: "Tree", hindiName: "Ped", emoji: "🌳", flies: false },
    { name: "Helicopter", hindiName: "Helicopter", emoji: "🚁", flies: true },
    { name: "Mosquito", hindiName: "Mach-char", emoji: "🦟", flies: true }
];

bestScoreEl.innerText = bestScore;

// --- MENU LOGIC ---
newGameBtn.addEventListener('click', () => {
    mainMenu.style.display = "none";
    gameScreen.style.display = "flex";
    messageEl.innerHTML = "Hold the button to start!";
    objectContainer.style.display = "none";
    messageEl.style.display = "block";
    
    // Tiny speech fix to unlock audio on mobile browsers
    speakText(" ", () => {}); 
});

settingsBtn.addEventListener('click', () => settingsPanel.style.display = "block");
closeSettingsBtn.addEventListener('click', () => settingsPanel.style.display = "none");

timeSlider.addEventListener('input', (e) => {
    timeDisplay.innerText = e.target.value;
    roundDuration = parseFloat(e.target.value) * 1000;
});

// --- TEXT TO SPEECH ---
function speakText(text, callback) {
    window.speechSynthesis.cancel(); // Stop any current speech
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'hi-IN'; // Set language to Hindi
    speech.rate = 1.2; // Slightly faster for gameplay
    
    if (callback) {
        speech.onend = callback; // Run function when talking finishes
    }
    window.speechSynthesis.speak(speech);
}

// --- GAME LOGIC ---
actionBtn.addEventListener('pointerdown', handlePress);
window.addEventListener('pointerup', handleRelease);

function handlePress(e) {
    if (e) e.preventDefault();
    isHolding = true;
    actionBtn.classList.add('btn-pressed');
    actionBtn.innerText = "HOLDING...";

    if (!isPlaying && gameScreen.style.display === "flex") {
        startGame();
    }
}

function handleRelease(e) {
    if (!isHolding) return;
    isHolding = false;
    actionBtn.classList.remove('btn-pressed');
    actionBtn.innerText = "HOLD FINGER HERE";

    if (isPlaying) {
        releasedThisRound = true;
        if (currentObject && !currentObject.flies) {
            triggerGameOver();
        }
    }
}

function startGame() {
    isPlaying = true;
    score = 0;
    updateScore();
    messageEl.style.display = "none";
    objectContainer.style.display = "block";
    setTimeout(nextRound, 500);
}

function nextRound() {
    if (!isPlaying) return;
    releasedThisRound = false;

    const randomIndex = Math.floor(Math.random() * objects.length);
    currentObject = objects[randomIndex];

    // UI Updates
    emojiEl.innerText = currentObject.emoji;
    nameEl.innerText = currentObject.name;
    
    emojiEl.style.animation = 'none';
    emojiEl.offsetHeight; 
    emojiEl.style.animation = null; 

    // Speak Hindi Name + Udd
    speakText(`${currentObject.hindiName} udd`);

    roundTimer = setTimeout(evaluateRound, roundDuration);
}

function evaluateRound() {
    if (!isPlaying) return;

    if (!isHolding) {
        triggerGameOver();
        return;
    }

    if (currentObject.flies) {
        if (releasedThisRound) {
            score++;
            updateScore();
            nextRound();
        } else {
            triggerGameOver();
        }
    } else {
        score++;
        updateScore();
        nextRound();
    }
}

function triggerGameOver() {
    isPlaying = false;
    clearTimeout(roundTimer);

    // Save Score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('tootaUddBestScore', bestScore);
        bestScoreEl.innerText = bestScore;
    }

    // Hide object, show "Game Over" briefly
    objectContainer.style.display = "none";
    messageEl.style.display = "block";
    messageEl.innerHTML = `<span style="color:#e74c3c; font-weight:bold;">GAME OVER!</span>`;

    // Determine voice line and return to menu when finished
    let voiceLine = "";
    if (currentObject) {
        if (currentObject.flies) {
            voiceLine = "Bhai main udd sakta hoon";
        } else {
            voiceLine = "Waah! Mere ko bhi udd ne de";
        }
    } else {
        voiceLine = "Dhyaan se khelo"; // Fallback if they mess up before an object appears
    }

    // Speak and then go back to Main Menu
    speakText(voiceLine, () => {
        // This runs AFTER the talking is completely finished
        gameScreen.style.display = "none";
        mainMenu.style.display = "flex";
        
        // Reset button states
        isHolding = false;
        actionBtn.classList.remove('btn-pressed');
        actionBtn.innerText = "HOLD FINGER HERE";
    });
}

function updateScore() {
    scoreEl.innerText = score;
}