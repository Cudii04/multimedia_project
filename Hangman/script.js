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

const canvas = document.getElementById("hangman-canvas");
const ctx = canvas.getContext("2d");

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
    drawHangman();
    console.log("Selected word:", selectedWord);
}

function updateWordDisplay() {
    wordDisplay.textContent = selectedWord
        .split("")
        .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
        .join(" ");
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
            animateHangman();
        }
        updateWordDisplay();
        updateLetters();
        drawHangman();
        checkGameOver();
    }
}

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

document.getElementById("new-game").addEventListener("click", initGame);
document.addEventListener("keydown", (e) => {
    const letter = e.key.toLowerCase();
    if (/^[aábcdeéfghiíjklmnoóöőpqrstuúüűvwxyz]$/.test(letter)) {
        guessLetter(letter);
    }
});

// Kirajzolja az akasztófát és az aktuális testrészeket
function drawHangman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Statikus: akasztófa
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;

    // Alap
    ctx.beginPath();
    ctx.moveTo(10, 240);
    ctx.lineTo(190, 240);
    ctx.stroke();

    // Oszlop
    ctx.beginPath();
    ctx.moveTo(50, 240);
    ctx.lineTo(50, 20);
    ctx.lineTo(130, 20);
    ctx.lineTo(130, 40);
    ctx.stroke();

    // Testrészek
    if (wrongGuesses > 0) {
        // Fej
        ctx.beginPath();
        ctx.arc(130, 60, 20, 0, Math.PI * 2);
        ctx.stroke();
    }
    if (wrongGuesses > 1) {
        // Törzs
        ctx.beginPath();
        ctx.moveTo(130, 80);
        ctx.lineTo(130, 140);
        ctx.stroke();
    }
    if (wrongGuesses > 2) {
        // Bal kar
        ctx.beginPath();
        ctx.moveTo(130, 100);
        ctx.lineTo(100, 120);
        ctx.stroke();
    }
    if (wrongGuesses > 3) {
        // Jobb kar
        ctx.beginPath();
        ctx.moveTo(130, 100);
        ctx.lineTo(160, 120);
        ctx.stroke();
    }
    if (wrongGuesses > 4) {
        // Bal láb
        ctx.beginPath();
        ctx.moveTo(130, 140);
        ctx.lineTo(110, 180);
        ctx.stroke();
    }
    if (wrongGuesses > 5) {
        // Jobb láb
        ctx.beginPath();
        ctx.moveTo(130, 140);
        ctx.lineTo(150, 180);
        ctx.stroke();
    }
    if (wrongGuesses > 6) {
        // X szemek
        ctx.beginPath();
        ctx.moveTo(122, 52);
        ctx.lineTo(128, 58);
        ctx.moveTo(128, 52);
        ctx.lineTo(122, 58);
        ctx.moveTo(132, 52);
        ctx.lineTo(138, 58);
        ctx.moveTo(138, 52);
        ctx.lineTo(132, 58);
        ctx.stroke();
    }
}

function animateHangman() {
    canvas.style.transform = "scale(1.1) rotate(5deg)";
    setTimeout(() => {
        canvas.style.transform = "scale(1) rotate(0deg)";
    }, 300);
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