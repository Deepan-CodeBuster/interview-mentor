const questions = [
  // English Proficiency
  {
    question: "Which number should come next in the series, 48, 24, 12, ......?",
    choices: ["8", "6", "4", "2"],
    correctAnswer: 1
  },
  {
    question: "RQP, ONM, _, IHG, FED, find the missing letters.",
    choices: ["CDE", "LKI", "LKJ", "BAC"],
    correctAnswer: 2
  },
  {
    question: "Pointing to a photograph, a man said, I have no brother, and that man's father is my fathers son. Whose photograph was it? ",
    choices: ["His son", "His own", "His father", "His nephew"],
    correctAnswer: 0
  },
  {
    question: "Peter is in the East of Tom and Tom is in the North of John. Mike is in the South of John then in which direction of Peter is Mike?",
    choices: ["South-East", "South-West", "South", "North-East"],
    correctAnswer: 1
  },
  {
    question: "If in a certain language, NOIDA is coded as OPJEB, how is DELHI coded in that language?",
    choices: ["CDKGH", "EFMIJ", "FGNJK", "IHLED"],
    correctAnswer: 1
  },

  // Quantitative Aptitude
  {
    question: "What is the average of first five multiples of 12?",
    choices: ["36", "38", "40", "42"],
    correctAnswer: 0
  },
  {
    question: "What is the difference in the place value of 5 in the numeral 754853?",
    choices: ["49500", "49950", "45000", "49940"],
    correctAnswer: 1
  },
  {
    question: "What is the compound interest on Rs. 2500 for 2 years at rate of interest 4% per annum?",
    choices: ["Rs. 180", "Rs. 204", "Rs. 210", "Rs. 220"],
    correctAnswer: 1
  },
  {
    question: "Sohan started a business with a capital of Rs. 80000. After 6 months Mohan joined as a partner by investing Rs. 65000. After one year they earned total profit Rs. 20000. What is share of Sohan in the profit?",
    choices: ["Rs. 5222.2", "Rs. 5777.7", "Rs. 6222.2", "Rs. 6777.7"],
    correctAnswer: 1
  },
  {
    question: "A mother is twice as old as her son. If 20 years ago, the age of the mother was 10 times the age of the son, what is the present age of the mother?",
    choices: ["38 years", "40 years", "43 years", "45 years"],
    correctAnswer: 3
  },
  
  // Verbal Reasoning
  {
    question: "Choose the odd one out: Dog, Cat, Lion, Carrot",
    choices: ["Dog", "Cat", "Lion", "Carrot"],
    correctAnswer: 3
  },
  {
    question: "What comes next in the sequence: 2, 4, 8, 16, ?",
    choices: ["24", "32", "40", "64"],
    correctAnswer: 1
  },
  {
    question: "Find the missing number: 5, 10, 15, ?, 25",
    choices: ["12", "18", "20", "22"],
    correctAnswer: 2
  },
  {
    question: "If all cats are dogs and some dogs are fish, are all cats fish?",
    choices: ["Yes", "No", "Maybe", "None of the above"],
    correctAnswer: 1
  },
  {
    question: "Find the next term in the series: B, D, F, H, ?",
    choices: ["J", "K", "L", "M"],
    correctAnswer: 0
  }
];

let currentQuestionIndex = 0;
let score = 0;
let timer;
const timeLimitSeconds = 120; // 2 minutes per question

function loadQuestion() {
const currentQuestion = questions[currentQuestionIndex];
document.getElementById("question").innerText = currentQuestion.question;
const choices = document.getElementById("choices");
choices.innerHTML = "";
currentQuestion.choices.forEach((choice, index) => {
  const li = document.createElement("li");
  li.innerHTML = `<label><input type="radio" name="choice" value="${index}"> ${choice}</label>`;
  choices.appendChild(li);
});
startTimer();
}

function startTimer() {
let timeRemaining = timeLimitSeconds;
timer = setInterval(() => {
  timeRemaining--;
  document.getElementById("time").innerText = formatTime(timeRemaining);
  if (timeRemaining <= 0) {
    clearInterval(timer);
    submitAnswer();
  }
}, 1000);
}

function formatTime(seconds) {
const minutes = Math.floor(seconds / 60);
const remainingSeconds = seconds % 60;
return `${minutes}:${remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds}`;
}

function submitAnswer() {
clearInterval(timer);
const selectedChoice = document.querySelector('input[name="choice"]:checked');
if (selectedChoice) {
  const answerIndex = parseInt(selectedChoice.value);
  if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
    score += 2;
  }
}
currentQuestionIndex++;
if (currentQuestionIndex < questions.length) {
  loadQuestion();
} else {
  showResults();
}
}

function showResults() {
document.getElementById("quiz-container").style.display = "none";
document.getElementById("results-container").style.display = "block";
const results = document.getElementById("results");
results.innerText = `You scored ${score} out of ${questions.length * 2} marks.`;

const passingPercentage = 50;
const percentageScore = (score / (questions.length * 2)) * 100;

if (percentageScore >= passingPercentage) {
  const nextRoundButton = document.getElementById("next-round");
  nextRoundButton.style.display = "block";
  nextRoundButton.onclick = function() {
    showLoadingScreen();
    setTimeout(() => {
      window.location.href = "/coding"; // Navigate to /coding page
    }, 2000); // 2-second delay
  };
} else {
  const retryButton = document.getElementById("retry");
  retryButton.style.display = "block";
  retryButton.onclick = function() {
    resetQuiz(); // Restart the quiz
  };
}
}

function resetQuiz() {
currentQuestionIndex = 0;
score = 0;
loadQuestion();
document.getElementById("results-container").style.display = "none";
document.getElementById("quiz-container").style.display = "block";
}

function showLoadingScreen() {
document.getElementById("loading-overlay").style.display = "flex";
}

window.onload = loadQuestion;
