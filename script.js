let score = 0;
let bestScore = localStorage.getItem('tootaUddBestScore') || 0;
let isPlaying = false;
let isHolding = false;
let releasedThisRound = false;
let currentObject = null;
let roundTimer;
const roundDuration = 1500;

const scoreEl = document.getElementById('current-score');
const bestScoreEl = document.getElementById('best-score');
const messageEl = document.getElementById('message-display');
const objectContainer = document.getElementById('object-display');
const emojiEl = document.getElementById('emoji-display');
const nameEl = document.getElementById('name-display');
const actionBtn = document.getElementById('action-btn');

const objects = [
    { name: "Parrot", emoji: "🦜", flies: true },
    { name: "Airplane", emoji: "✈️", flies: true },
    { name: "Dog", emoji: "🐕", flies: false },
    { name: "Eagle", emoji: "🦅", flies: true },
    { name: "Car", emoji: "🚗", flies: false },
    { name: "Helicopter", emoji: "🚁", flies: true },
    { name: "Cat", emoji: "🐈", flies: false },
    { name: "Butterfly", emoji: "🦋", flies: true },
    { name: "Tree", emoji: "🌳", flies: false },
    { name: "Rocket", emoji: "🚀", flies: true },
    { name: "Elephant", emoji: "🐘", flies: false },
    { name: "Mosquito", emoji: "🦟", flies: true },
    { name: "House", emoji: "🏠", flies: false }
];

bestScoreEl.innerText = bestScore;

actionBtn.addEventListener('pointerdown', handlePress);
window.addEventListener('pointerup', handleRelease);

function handlePress(e) {
    if (e) e.preventDefault();
    isHolding = true;
    actionBtn.classList.add('btn-pressed');
    actionBtn.innerText = "HOLDING...";
    if (!isPlaying) startGame();
}

function handleRelease(e) {
    if (!isHolding) return;
    isHolding = false;
    actionBtn.classList.remove('btn-pressed');
    actionBtn.innerText = "HOLD FINGER HERE";
    if (isPlaying) {
        releasedThisRound = true;
        if (currentObject && !currentObject.flies) gameOver("It doesn't fly!");
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
    
    roundTimer = setTimeout(evaluateRound, roundDuration);
}

function evaluateRound() {
    if (!isPlaying) return;
    if (!isHolding) {
        gameOver("You didn't put your finger back!");
        return;
    }
    if (currentObject.flies) {
        if (releasedThisRound) {
            score++;
            updateScore();
            nextRound();
        } else {
            gameOver("It flies! You should have lifted your finger!");
        }
    } else {
        score++;
        updateScore();
        nextRound();
    }
}

function gameOver(reason) {
    isPlaying = false;
    clearTimeout(roundTimer);
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('tootaUddBestScore', bestScore);
        bestScoreEl.innerText = bestScore;
    }
    objectContainer.style.display = "none";
    messageEl.style.display = "block";
    messageEl.innerHTML = `<span style="color:#e74c3c;">Game Over!</span><br><br>${reason}<br><br>Tap and hold to play again.`;
}

function updateScore() {
    scoreEl.innerText = score;
}