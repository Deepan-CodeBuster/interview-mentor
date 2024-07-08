// Initialize CodeMirror editor
var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    mode: "python",
    theme: "ambiance",
    lineNumbers: true
});

// Function to submit user code to the backend for evaluation
function submitCode() {
    var userCode = editor.getValue();
    
    // Fetch POST request to submit user code
    fetch('/submit_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: userCode })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Display output and evaluation results
        var outputText = 'Output:\n' + data.stdout + '\nErrors:\n' + data.stderr +
                         '\nCorrectness: ' + data.correctness +
                         '\nEfficiency: ' + data.efficiency.toFixed(2) + ' seconds\nStyle: \n' + data.style;
        document.getElementById('output').textContent = outputText;

        // Determine visibility of Next and HR Round buttons
        var nextButton = document.getElementById('nextButton');
        var nextRoundButton = document.getElementById('nextRoundButton');

        if (data.correctness && data.stderr === '') {
            fetch('/check_completion')
                .then(response => response.json())
                .then(completionData => {
                    console.log('Completion status:', completionData.completed);
                    if (completionData.completed) {
                        nextButton.style.display = 'none'; // Hide Next button if completed
                        nextRoundButton.style.display = 'inline'; // Show HR Round button if completed
                    } else {
                        nextButton.style.display = 'inline'; // Show Next button if not completed
                        nextRoundButton.style.display = 'none'; // Hide HR Round button if not completed
                    }
                })
                .catch(error => {
                    console.error('Error fetching completion status:', error);
                    // Handle errors appropriately
                });
        } else {
            // Hide both buttons if code is incorrect or has errors
            nextButton.style.display = 'none';
            nextRoundButton.style.display = 'none';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('output').textContent = 'Error occurred while submitting code.';
    });
}

// Function to load the current question from the server
function loadQuestion() {
    fetch('/get_question')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Update question and reset editor
        document.getElementById('question').textContent = 'Question: ' + data.question;
        editor.setValue('# Write your Python code here\n');
        document.getElementById('output').textContent = '';
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('nextRoundButton').style.display = 'none';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('question').textContent = 'Error loading question.';
    });
}

// Function to load the next question from the server
function loadNextQuestion() {
    fetch('/next_question')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Update question and reset editor
        document.getElementById('question').textContent = 'Question: ' + data.question;
        editor.setValue('# Write your Python code here\n');
        document.getElementById('output').textContent = '';
        document.getElementById('nextButton').style.display = 'none';
        document.getElementById('nextRoundButton').style.display = 'none';
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('question').textContent = 'Error loading next question.';
    });
}

// Initialize the page by loading the first question on window load
window.onload = function() {
    loadQuestion(); // Load the first question when the page loads
};
