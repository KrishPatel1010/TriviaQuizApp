// app.js

const form = document.getElementById("userInputForm");

if (form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Retrieve form values
        const totalQue = document.getElementById("noOfQue").value;
        const category = document.getElementById("category").value;
        const difficulty = document.getElementById("difficulty").value;
        const triviaType = document.getElementById("trivia_type").value;

        // Construct the API URL
        const TRIVIAURL = `https://opentdb.com/api.php?amount=${totalQue}&category=${category}&difficulty=${difficulty}&type=${triviaType}`;

        try {
            const response = await fetch(TRIVIAURL);
            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();

            // Store the trivia data in sessionStorage
            sessionStorage.setItem('triviaData', JSON.stringify(data.results));
            sessionStorage.setItem('currentQuestionIndex', 0); // Store the current question index
            sessionStorage.setItem('score', 0); // Initialize score

            // Redirect to quiz.html after storing data
            window.location.href = `quiz.html`;
        } catch (error) {
            console.error("Error fetching trivia data:", error.message);
            document.getElementById("question-container").innerHTML = `<p>Error loading trivia. Please try again later.</p>`;
        }

        form.reset();
    });
}

// Code for quiz.html retrieval
if (window.location.pathname.endsWith('quiz.html')) {
    const questionContainer = document.getElementById("question-container");
    const feedbackContainer = document.getElementById("feedback"); // Feedback message container
    const backButton = document.getElementById("backButton");
    const nextButton = document.getElementById("nextButton");

    // Retrieve trivia data from sessionStorage
    const triviaData = JSON.parse(sessionStorage.getItem('triviaData'));
    let currentQuestionIndex = parseInt(sessionStorage.getItem('currentQuestionIndex')) || 0;
    let score = parseInt(sessionStorage.getItem('score')) || 0;

    function displayQuestion() {
        feedbackContainer.innerHTML = ''; // Clear previous feedback
        if (currentQuestionIndex < triviaData.length) {
            const questionObj = triviaData[currentQuestionIndex];
            const { question, correct_answer, incorrect_answers } = questionObj;

            // Combine correct and incorrect answers, then shuffle them
            const answers = [correct_answer, ...incorrect_answers].sort(() => Math.random() - 0.5);

            // Display the question and answers with labels (A, B, C, D)
            questionContainer.innerHTML = `
                <p id="question">${question}</p>
                <ul>
                    ${answers.map((answer, index) => {
                        const letter = String.fromCharCode(65 + index); // Convert 0, 1, 2... to A, B, C...
                        return `<li class="answer-option" data-answer="${answer}">${letter}: ${answer}</li>`;
                    }).join('')}
                </ul>
                <button id="nextButton" style="display: none;">Next Question</button>
            `;

            // Add click event listeners to each answer option
            document.querySelectorAll('.answer-option').forEach(option => {
                option.addEventListener('click', function () {
                    const selectedAnswer = this.getAttribute('data-answer');
                    const isCorrect = selectedAnswer === correct_answer;

                    // Feedback to the user
                    if (isCorrect) {
                        this.style.color = 'green'; // Highlight the correct answer
                        score++; // Increment score
                        feedbackContainer.innerHTML = 'Correct!'; // Show correct message
                        feedbackContainer.style.color = 'green'; // Green for correct
                    } else {
                        this.style.color = 'red'; // Highlight the incorrect answer
                        feedbackContainer.innerHTML = 'Incorrect!'; // Show incorrect message
                        feedbackContainer.style.color = 'red'; // Red for incorrect
                        // Highlight the correct answer
                        document.querySelectorAll('.answer-option').forEach(opt => {
                            if (opt.getAttribute('data-answer') === correct_answer) {
                                opt.style.color = 'green'; // Show correct answer
                            }
                        });
                    }

                    // Show the next button
                    nextButton.style.display = 'block';
                });
            });
        } else {
            // No more questions, display score and back button
            questionContainer.innerHTML = `<p>Your score: ${score} out of ${triviaData.length}</p>`;
            nextButton.style.display = 'none'; // Hide next button
            backButton.style.display = 'block'; // Show back button
            sessionStorage.removeItem('triviaData'); // Clear trivia data
            sessionStorage.removeItem('currentQuestionIndex'); // Clear question index
            sessionStorage.removeItem('score'); // Clear score
        }
    }

    // Display the first question
    displayQuestion();

    // Next question button event
    nextButton.addEventListener('click', function () {
        currentQuestionIndex++;
        sessionStorage.setItem('currentQuestionIndex', currentQuestionIndex); // Update index
        sessionStorage.setItem('score', score); // Update score
        displayQuestion(); // Show the next question
    });

    // Back to Home button event
    backButton.addEventListener('click', function () {
        window.location.href = 'index.html'; // Redirect to index.html
    });
}
