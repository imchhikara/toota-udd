// Game Variables
let score = 0;
let bestScore = localStorage.getItem('tootaUddBestScore') || 0;
let isPlaying = false;
let isHolding = false;
let releasedThisRound = false;
let currentObject = null;
let roundTimer;
let roundDuration = 1500; // Default 1.5 seconds
let speechTimeout; // Safety timer for voice

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

// Object Database
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

// --- VOICE SETUP ---
let hindiVoice = null;
let currentSpeech = null; 

function loadVoices() {
    const voices = window.speechSynthesis.getVoices();
    hindiVoice = voices.find(voice => voice.lang.includes('hi')) || voices[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

// --- TEXT TO SPEECH ---
function speakText(text, callback) {
    if (!window.speechSynthesis) {
        if (callback) callback();
        return;
    }

    window.speechSynthesis.cancel(); 
    clearTimeout(speechTimeout);

    currentSpeech = new SpeechSynthesisUtterance(text);
    if (hindiVoice) currentSpeech.voice = hindiVoice;
    else currentSpeech.lang = 'hi-IN'; 
    
    currentSpeech.rate = 1.0; 
    currentSpeech.volume = 1.0; 

    if (callback) {
        let callbackFired = false;
        
        const safeCallback = () => {
            if (!callbackFired) {
                callbackFired = true;
                clearTimeout(speechTimeout);
                callback();
            }
        };

        currentSpeech.onend = safeCallback;
        currentSpeech.onerror = safeCallback;
        
        // Failsafe: If voice gets stuck, force the game to continue after 2.5 seconds
        speechTimeout = setTimeout(safeCallback, 2500);
    }
    
    window.speechSynthesis.speak(currentSpeech);
}

// --- MENU LOGIC ---
newGameBtn.addEventListener('click', () => {
    mainMenu.style.display = "none";
    gameScreen.style.display = "flex";
    messageEl.innerHTML = "Hold the red button below to start!";
    objectContainer.style.display = "none";
    messageEl.style.display = "block";
    
    speakText(" ", null); 
});

settingsBtn.addEventListener('click', () => settingsPanel.style.display = "block");
closeSettingsBtn.addEventListener('click', () => settingsPanel.style.display = "none");

timeSlider.addEventListener('input', (e) => {
    timeDisplay.innerText = e.target.value;
    roundDuration = parseFloat(e.target.value) * 1000;
});

// --- GAME LOGIC ---
actionBtn.addEventListener('mousedown', handlePress);
actionBtn.addEventListener('touchstart', handlePress, {passive: false});

window.addEventListener('mouseup', handleRelease);
window.addEventListener('touchend', handleRelease);

function handlePress(e) {
    if (e.cancelable) e.preventDefault(); 
    
    if (gameScreen.style.display === "none") return;

    isHolding = true;
    actionBtn.classList.add('btn-pressed');
    actionBtn.innerText = "HOLDING...";

    if (!isPlaying) {
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

    emojiEl.innerText = currentObject.emoji;
    nameEl.innerText = currentObject.name;
    
    emojiEl.style.animation = 'none';
    emojiEl.offsetHeight; 
    emojiEl.style.animation = null; 

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

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('tootaUddBestScore', bestScore);
        bestScoreEl.innerText = bestScore;
    }

    objectContainer.style.display = "none";
    messageEl.style.display = "block";
    messageEl.innerHTML = `<span style="color:#e74c3c; font-weight:bold;">GAME OVER!</span>`;

    let voiceLine = "Dhyaan se khelo"; 
    if (currentObject) {
        if (currentObject.flies) {
            voiceLine = "Main udd sakta hoon! Mujhe uddne do!";
        } else {
            voiceLine = "Waah! Mere ko bhi udda diya. Paaji tussi great ho!";
        }
    }

    speakText(voiceLine, () => {
        gameScreen.style.display = "none";
        mainMenu.style.display = "flex";
        isHolding = false;
        actionBtn.classList.remove('btn-pressed');
        actionBtn.innerText = "HOLD FINGER HERE";
    });
}

function updateScore() {
    scoreEl.innerText = score;
}
