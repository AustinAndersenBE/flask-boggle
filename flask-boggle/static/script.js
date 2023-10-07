$(document).ready(function(){
    let totalScore = 0;
    let timeLeft = 60;
    let timerId;
    let submittedWords = new Set();

    const $timer = $("#timer");
    const $form = $("form");
    const $resultMessage = $("#result-message");
    const $totalScore = $("#total-score");
    const $userGuessInput = $("input[name='user_guess']");
    const $highestScore = $("#highest-score");
    const $timesPlayed = $("#times-played");

    function handleSubmit(e) {
        e.preventDefault();

        let userGuess = $userGuessInput.val();
        submitGuess(userGuess);
    }

    function submitGuess(userGuess) {
        axios.post('/submit_user_guess', { user_guess: userGuess }) //send post request to /submit_user_guess
        .then(response => handleResponse(response, userGuess))
        .catch(error => handleError(error));
    }

    function handleResponse(response, userGuess) {
        // Handle the response from the server
        let result = response.data.result;
        let message = "";
        const lowerCaseUserGuess = userGuess.toLowerCase();

        if (result === "ok") {
            console.log("Before:", submittedWords);
            if (submittedWords.has(lowerCaseUserGuess)) {
                message = "Word has already been submitted";
            } else {
                message = "Word is valid and is on the board";
                totalScore += userGuess.length;
                submittedWords.add(lowerCaseUserGuess);
            }
            console.log("After:", submittedWords);
        } else if (result === "not-on-board") {
            message = "Word is valid but is not on the board";
        } else if (result === "not-word") {
            message = "Word is not valid";
        }

        $resultMessage.text(message);
        $totalScore.text(`Total Score:${totalScore}`);
    }

    function handleError(error) {
        // Handle error
        console.log(error);
        $resultMessage.text("Something went wrong!");
    }

    function updateTimerText() {
        $timer.text(`Time Remaining: ${timeLeft}`);
    }

    function startTimer() {
        updateTimerText();

        timerId = setInterval(() => {
            timeLeft -= 1;
            updateTimerText();

            if (timeLeft <= 0) {
                clearInterval(timerId); //stop timer when timeLeft is 0
                $form.hide();
                $resultMessage.text("Game Over!");
                submitFinalScore();
            }
        }, 1000);
    }

    function submitFinalScore() {
        axios.post('/submit_final_score', { final_score: totalScore }) //send post request to /send_final_score
        .then(response => handleFinalScoreResponse(response))
        .catch(error => handleError(error));
    }

    function handleFinalScoreResponse(response) {
        const highestScore = response.data.highest_score;
        const timesPlayed = response.data.times_played;

        $highestScore.text(`Highest Score: ${highestScore}`);
        $timesPlayed.text(`Times Played: ${timesPlayed}`);


    }


    $form.on("submit", handleSubmit);
    startTimer();
    console.log("Script loaded!")
});
