$(document).ready(function() {
    
    // GameState class to manage global state variables
    class GameState {
        constructor() {
            this.totalScore = 0;
            this.timeLeft = 60;
            this.timerId = null;
            this.submittedWords = new Set();
        }
    }
    
    const gameState = new GameState();
    
    const $timer = $("#timer");
    const $form = $("form");
    const $resultMessage = $("#result-message");
    const $totalScore = $("#total-score");
    const $userGuessInput = $("input[name='user_guess']");
    const $highestScore = $("#highest-score");
    const $timesPlayed = $("#times-played");

    $form.on("submit", handleSubmit);
    startTimer();
    console.log("Script loaded!");

    function handleSubmit(e) {
        e.preventDefault();
        let userGuess = $userGuessInput.val();
        submitGuess(userGuess);
    }

    function submitGuess(userGuess) {
        axios.post('/user_guess', { user_guess: userGuess })
            .then(response => handleResponse(response, userGuess))
            .catch(error => handleError(error));
    }

    function handleResponse(response, userGuess) {
        let result = response.data.result;
        let message = "";
        const lowerCaseUserGuess = userGuess.toLowerCase();

        if (result === "ok") {
            console.log("Before:", gameState.submittedWords);
            if (gameState.submittedWords.has(lowerCaseUserGuess)) {
                message = "Word has already been submitted";
            } else {
                message = "Word is valid and is on the board";
                gameState.totalScore += userGuess.length;
                gameState.submittedWords.add(lowerCaseUserGuess);
            }
            console.log("After:", gameState.submittedWords);
        } else if (result === "not-on-board") {
            message = "Word is valid but is not on the board";
        } else if (result === "not-word") {
            message = "Word is not valid";
        }

        $resultMessage.text(message);
        $totalScore.text(`Total Score:${gameState.totalScore}`);
    }

    function handleError(error) {
        console.log(error);
        $resultMessage.text("Something went wrong!");
    }

    function updateTimerText() {
        $timer.text(`Time Remaining: ${gameState.timeLeft}`);
    }

    function startTimer() {
        updateTimerText();

        gameState.timerId = setInterval(() => {
            gameState.timeLeft -= 1;
            updateTimerText();

            if (gameState.timeLeft <= 0) {
                clearInterval(gameState.timerId);
                $form.hide();
                $resultMessage.text("Game Over!");
                submitFinalScore();
            }
        }, 1000);
    }

    function submitFinalScore() {
        axios.post('/final_score', { final_score: gameState.totalScore })
            .then(response => handleFinalScoreResponse(response))
            .catch(error => handleError(error));
    }

    function handleFinalScoreResponse(response) {
        const highestScore = response.data.highest_score;
        const timesPlayed = response.data.times_played;

        $highestScore.text(`Highest Score: ${highestScore}`);
        $timesPlayed.text(`Times Played: ${timesPlayed}`);
    }
});
