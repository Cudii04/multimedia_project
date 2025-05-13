let words = {}
let selectedWord = "";
let guessedLetters = [];
let wrongGuesses = 0;
let gameOver = false;
let soundEnabled = false;


const SZAVAKELERESIUTVONALA = "lib/words.json";
const maxWrong = 7;

const wordDisplay = document.getElementById("word");
const lettersContainer = document.getElementById("letters");

const staticCanvas = document.getElementById("static-canvas");
const staticCtx = staticCanvas.getContext("2d");
const dynamicCanvas = document.getElementById("hangman-canvas");
const dynamicCtx = dynamicCanvas.getContext("2d");

const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const startSound = document.getElementById("start-sound");

const themeToggleButton = document.getElementById("themeToggle");
const soundToggleButton = document.getElementById("soundToggle");

function initGame() {
    gameOver = false;
    guessedLetters = [];
    wrongGuesses = 0;

    const difficulty = document.getElementById("difficulty").value;
    const wordList = words[difficulty];
    selectedWord = wordList[Math.floor(Math.random() * wordList.length)];

    if (soundEnabled) {
        startSound.play();
    }
    updateWordDisplay();
    updateLetters();
    drawStaticGallows();
    drawDynamicHangman();
    console.log("Selected word:", selectedWord);
}

document.getElementById("new-game").addEventListener("click", initGame);

function updateWordDisplay() {
    wordDisplay.textContent = selectedWord
        .split("")
        .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
        .join(" ");
}

function guessLetter(letter) {
    if (gameOver) return; // Ha vége a játéknak, ne reagáljon többet
    if (!guessedLetters.includes(letter)) {
        guessedLetters.push(letter);
        if (selectedWord.includes(letter)) {
            if (soundEnabled) {
                correctSound.play();
            }
        } else {
            wrongGuesses++;
            if (soundEnabled) {
                wrongSound.play();
            }
            animateDynamicHangman();
        }
        updateWordDisplay();
        updateLetters();
        drawDynamicHangman();
        checkGameOver();
    }
}

function updateLetters() {
    lettersContainer.innerHTML = "";
    const magyarBetuk = "aábcdeéfghiíjklmnoóöőpqrstuúüűvwxyz".split("");
    magyarBetuk.forEach(char => {
        const button = document.createElement("button");
        button.textContent = char;
        button.disabled = guessedLetters.includes(char);
        button.addEventListener("click", () => guessLetter(char));
        lettersContainer.appendChild(button);
    });
}

document.addEventListener("keydown", (e) => {
    const letter = e.key.toLowerCase();
    if (/^[aábcdeéfghiíjklmnoóöőpqrstuúüűvwxyz]$/.test(letter)) {
        guessLetter(letter);
    }
});

function displayStats() {
    const history = JSON.parse(localStorage.getItem("hangmanHistory") || "[]");
    const totalGames = history.length;
    const wins = history.filter(entry => entry.result === "win").length;
    const losses = history.filter(entry => entry.result === "loss").length;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    document.getElementById("total-games").textContent = totalGames;
    document.getElementById("wins").textContent = wins;
    document.getElementById("losses").textContent = losses;
    document.getElementById("winrate").textContent = winRate;
}

document.addEventListener("DOMContentLoaded", () => {
    displayStats(); // Frissíti a statisztikákat, amikor az oldal betöltődik
});

function storeResult(result) {
    const history = JSON.parse(localStorage.getItem("hangmanHistory") || "[]");
    history.push({word: selectedWord, result, date: new Date().toISOString()});
    localStorage.setItem("hangmanHistory", JSON.stringify(history));
}

function checkGameOver() {
    if (wrongGuesses >= maxWrong) {
        gameOver = true;
        setTimeout(() => alert("Vesztettél! A szó: " + selectedWord), 100);
        storeResult("loss");
    } else if (!wordDisplay.textContent.includes("_")) {
        gameOver = true;
        setTimeout(() => alert("Gratulálok, nyertél!"), 100);
        storeResult("win");
    }
    displayStats();
}

function toggleHelp() {
    document.getElementById("help-text").classList.toggle("hidden");
}

function loadHistory() {
    const history = JSON.parse(localStorage.getItem("hangmanHistory") || "[]");
    console.table(history);
}

// Kirajzolja az akasztófát és az aktuális testrészeket
function drawStaticGallows() {
    staticCtx.clearRect(0, 0, staticCanvas.width, staticCanvas.height);
    staticCtx.strokeStyle = "#000";
    staticCtx.lineWidth = 2;
    staticCtx.beginPath();
    staticCtx.moveTo(10, 240);
    staticCtx.lineTo(190, 240); // alap
    staticCtx.moveTo(50, 240);
    staticCtx.lineTo(50, 20);   // oszlop
    staticCtx.lineTo(130, 20);
    staticCtx.lineTo(130, 40);
    staticCtx.stroke();
}

function drawDynamicHangman() {
    dynamicCtx.clearRect(0, 0, dynamicCanvas.width, dynamicCanvas.height);
    dynamicCtx.strokeStyle = "#000";
    dynamicCtx.lineWidth = 2;

    // Testrészek
    if (wrongGuesses > 0) {
        // Fej
        dynamicCtx.beginPath();
        dynamicCtx.arc(130, 60, 20, 0, Math.PI * 2);
        dynamicCtx.stroke();
    }
    if (wrongGuesses > 1) {
        // Törzs
        dynamicCtx.beginPath();
        dynamicCtx.moveTo(130, 80);
        dynamicCtx.lineTo(130, 140);
        dynamicCtx.stroke();
    }
    if (wrongGuesses > 2) {
        // Bal kar
        dynamicCtx.beginPath();
        dynamicCtx.moveTo(130, 100);
        dynamicCtx.lineTo(100, 120);
        dynamicCtx.stroke();
    }
    if (wrongGuesses > 3) {
        // Jobb kar
        dynamicCtx.beginPath();
        dynamicCtx.moveTo(130, 100);
        dynamicCtx.lineTo(160, 120);
        dynamicCtx.stroke();
    }
    if (wrongGuesses > 4) {
        // Bal láb
        dynamicCtx.beginPath();
        dynamicCtx.moveTo(130, 140);
        dynamicCtx.lineTo(110, 180);
        dynamicCtx.stroke();
    }
    if (wrongGuesses > 5) {
        // Jobb láb
        dynamicCtx.beginPath();
        dynamicCtx.moveTo(130, 140);
        dynamicCtx.lineTo(150, 180);
        dynamicCtx.stroke();
    }
    if (wrongGuesses > 6) {
        // X szemek
        dynamicCtx.beginPath();
        dynamicCtx.moveTo(122, 52);
        dynamicCtx.lineTo(128, 58);
        dynamicCtx.moveTo(128, 52);
        dynamicCtx.lineTo(122, 58);
        dynamicCtx.moveTo(132, 52);
        dynamicCtx.lineTo(138, 58);
        dynamicCtx.moveTo(138, 52);
        dynamicCtx.lineTo(132, 58);
        dynamicCtx.stroke();
    }
}

function animateDynamicHangman() {
    // Állítsuk be a forgás tengelyét a fej tetejénél
    dynamicCanvas.style.transformOrigin = "130px 40px";
    // Smooth átmenet
    dynamicCanvas.style.transition = "transform 0.5s ease-in-out";

    // 1. Kileng jobbra
    dynamicCanvas.style.transform = "rotate(15deg)";
    // 2. Fél másodperc múlva kileng balra
    setTimeout(() => {
        dynamicCanvas.style.transform = "rotate(-15deg)";
    }, 500);
    // 3. Újabb fél másodperc múlva vissza középre
    setTimeout(() => {
        dynamicCanvas.style.transform = "rotate(0deg)";
    }, 1000);
}

soundToggleButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundToggleButton.textContent = soundEnabled ? "🔊" : "🔇";
});

// Betöltéskor nézd meg, mi volt az utolsó választott téma
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggleButton.textContent = "☀️";
}

themeToggleButton.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    themeToggleButton.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

loadHistory();

fetch(SZAVAKELERESIUTVONALA)
    .then(response => response.json())
    .then(data => {
        words = data;
        initGame(); // Csak akkor indítjuk, ha már megvan a szólista
    })
    .catch(error => {
        console.error("Nem sikerült betölteni a words.json fájlt:", error);
        alert("Hiba történt a szólista betöltésekor.");
    });