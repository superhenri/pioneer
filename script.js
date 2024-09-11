// Remove any existing quizData array if it's still there

// Modify the loadQuestionsFromCSV function to use Papa Parse
function loadQuestionsFromCSV() {
    console.log('Starting to load questions from CSV');
    Papa.parse('questions.csv', {
        download: true,
        header: true,
        complete: function(results) {
            console.log('CSV parsing complete', results);
            quizData = results.data.map(row => ({
                level: row.level,
                question: row.question,
                choices: [row.choice1, row.choice2, row.choice3, row.choice4],
                correctAnswer: parseInt(row.correctAnswer)
            }));
            shuffleQuestions();
            startGameBtn.disabled = false;
            console.log('Questions loaded and shuffled', quizData);
        },
        error: function(error) {
            console.error('Error loading questions:', error);
        }
    });
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadQuestionsFromCSV();
    startGameBtn.disabled = true; // Disable the start button until questions are loaded
});

// Function to shuffle questions
function shuffleQuestions() {
    for (let i = quizData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [quizData[i], quizData[j]] = [quizData[j], quizData[i]];
    }
}

// Modify the startGame function
function startGame() {
    console.log('Start game button clicked');
    playerName = playerNameEl.value.trim();
    console.log('Player name:', playerName);
    console.log('quizData length:', quizData.length);
    if (playerName && quizData.length > 0) {
        playerFormEl.style.display = "none";
        quizEl.style.display = "block";
        muteButton.style.display = "block";
        currentQuestion = 0;
        score = 0;
        health = 3;
        loadQuestion();
        updateHealth();
        startSound.play().then(() => {
            backgroundMusic.play();
        }).catch(error => console.error('Error playing sound:', error));
    } else if (!playerName) {
        alert("Please enter your name to start the game.");
    } else {
        alert("Questions are still loading. Please try again in a moment.");
    }
}

const playerFormEl = document.getElementById("player-form");
const playerNameEl = document.getElementById("player-name");
const startGameBtn = document.getElementById("start-game");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const submitBtn = document.getElementById("submit");
const quizEl = document.getElementById("quiz");
const resultsEl = document.getElementById("results");
const scoreEl = document.getElementById("score");
const feedbackEl = document.getElementById("feedback");
const healthEl = document.getElementById("health");
const leaderboardEl = document.getElementById("leaderboard");
const leaderboardListEl = document.getElementById("leaderboard-list");
const playAgainBtn = document.getElementById("play-again");

const backgroundMusic = document.getElementById("background-music");
const startSound = document.getElementById("start-sound");
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const gameOverSound = document.getElementById("game-over-sound");

const muteButton = document.getElementById("mute-button");
let isMuted = false;

// Set initial volume for background music (0.3 is 30% volume, adjust as needed)
backgroundMusic.volume = 0.3;

function toggleMute() {
    isMuted = !isMuted;
    [backgroundMusic, startSound, correctSound, wrongSound, gameOverSound].forEach(sound => {
        sound.muted = isMuted;
    });
    muteButton.textContent = isMuted ? "Unmute" : "Mute";
}

function loadQuestion() {
    const question = quizData[currentQuestion];
    questionEl.textContent = `${question.level}: ${question.question}`;

    choicesEl.innerHTML = "";
    question.choices.forEach((choice, index) => {
        const label = document.createElement("label");
        label.innerHTML = `
            <input type="radio" name="answer" value="${index}">
            ${choice}
        `;
        choicesEl.appendChild(label);
    });
    feedbackEl.textContent = "";
}

function checkAnswer() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        const answerIndex = parseInt(selectedAnswer.value);
        if (answerIndex === quizData[currentQuestion].correctAnswer) {
            score++;
            feedbackEl.textContent = "Correct!";
            feedbackEl.style.color = "green";
            correctSound.play();
        } else {
            health--;
            updateHealth();
            feedbackEl.textContent = "Wrong answer.";
            feedbackEl.style.color = "red";
            wrongSound.play();
        }
        
        if (health > 0) {
            currentQuestion++;
            if (currentQuestion < quizData.length) {
                setTimeout(loadQuestion, 1000);
            } else {
                setTimeout(showResults, 1000);
            }
        } else {
            setTimeout(showResults, 1000);
        }
    }
}

function updateHealth() {
    healthEl.textContent = "❤".repeat(health);
}

function showResults() {
    quizEl.style.display = "none";
    resultsEl.style.display = "block";
    scoreEl.textContent = `${score} out of ${quizData.length}`;
    updateLeaderboard();
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    gameOverSound.play();
}

function updateLeaderboard() {
    let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.push({ name: playerName, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10); // Keep only top 10 scores
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

    leaderboardListEl.innerHTML = "";
    leaderboard.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: ${entry.score}`;
        leaderboardListEl.appendChild(li);
    });

    leaderboardEl.style.display = "block";
    playAgainBtn.style.display = "block";
}

function resetGame() {
    currentQuestion = 0;
    score = 0;
    health = 3;
    resultsEl.style.display = "none";
    leaderboardEl.style.display = "none";
    quizEl.style.display = "block";
    loadQuestion();
    updateHealth();
    backgroundMusic.play();
}

submitBtn.addEventListener("click", checkAnswer);
playAgainBtn.addEventListener("click", resetGame);
muteButton.addEventListener("click", toggleMute);

// Ensure background music loops
backgroundMusic.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

startGameBtn.addEventListener("click", startGame);

// Initially hide the mute button until the game starts
muteButton.style.display = "none";

updateHealth();

console.log('Script loaded');