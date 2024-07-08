from flask import Flask, render_template, request,session, jsonify, redirect, url_for
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
import subprocess
import os
import tempfile
import time
import shutil

app = Flask(__name__)
app.secret_key = 'supersecretkey'

# NLTK setup
nltk.download('punkt')
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# Placeholder for resume details
resume = {}

@app.route('/')
@app.route('/home')
def home():
    return render_template('index.html')

@app.route('/rounds')
def rounds():
    return render_template('rounds.html')

@app.route('/aptitude')
def aptitude():
    return render_template('aptitude.html')

questions = [
    {
        "question": "Write a function to add two numbers.",
        "code": "def add(a, b):\n    return a + b",
        "expected_output": "print(add(2, 3))",
        "expected_result": "5"
    },
    {
        "question": "Write a function to find the factorial of a number.",
        "code": "def factorial(n):\n    return 1 if n == 0 else n * factorial(n-1)",
        "expected_output": "print(factorial(5))",
        "expected_result": "120"
    },
    {
        "question": "Write a function to check if a number is prime.",
        "code": "def is_prime(n):\n    if n <= 1: return False\n    for i in range(2, int(n**0.5)+1):\n        if n % i == 0: return False\n    return True",
        "expected_output": "print(is_prime(7))",
        "expected_result": "True"
    },
    {
        "question": "Write a function to reverse a string.",
        "code": "def reverse_string(s):\n    return s[::-1]",
        "expected_output": "print(reverse_string('hello'))",
        "expected_result": "olleh"
    },
    {
        "question": "Write a function to find the maximum element in a list.",
        "code": "def find_max(lst):\n    return max(lst)",
        "expected_output": "print(find_max([1, 2, 3, 4, 5]))",
        "expected_result": "5"
    }
]

@app.route('/coding')
def index():
    session['current_question'] = 0
    session['completed'] = False
    return render_template('coding.html')

@app.route('/get_question', methods=['GET'])
def get_question():
    current_question = session.get('current_question', 0)
    if current_question < len(questions):
        question = questions[current_question]
    else:
        question = {"question": "No more questions available."}
    return jsonify(question)

@app.route('/next_question', methods=['GET'])
def next_question():
    current_question = session.get('current_question', 0)
    if current_question < len(questions) - 1:
        session['current_question'] = current_question + 1
    return get_question()

@app.route('/submit_code', methods=['POST'])
def submit_code():
    user_code = request.json['code']
    current_question = session.get('current_question', 0)
    question = questions[current_question]
    result = execute_code(user_code, question['expected_output'])
    correctness = evaluate_correctness(result['stdout'], question['expected_result'])
    efficiency = evaluate_efficiency(user_code)
    style = evaluate_style(user_code)
    if correctness and current_question == len(questions) - 1:
        session['completed'] = True
    return jsonify({
        'stdout': result['stdout'],
        'stderr': result['stderr'],
        'correctness': correctness,
        'efficiency': efficiency,
        'style': style
    })

@app.route('/check_completion', methods=['GET'])
def check_completion():
    completed = session.get('completed', False)
    return jsonify({'completed': completed})

 

def execute_code(user_code, expected_output_code):
    with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as temp_file:
        temp_file.write(user_code.encode('utf-8'))
        temp_file.write(b'\n')
        temp_file.write(expected_output_code.encode('utf-8'))
        temp_file_path = temp_file.name

    python_path = shutil.which('python')  # Specify the full path to the Python executable if needed
    if python_path is None:
        return {
            'stdout': '',
            'stderr': 'Python executable not found'
        }

    result = subprocess.run([python_path, temp_file_path], capture_output=True, text=True)
    os.unlink(temp_file_path)
    
    return {
        'stdout': result.stdout,
        'stderr': result.stderr
    }

def evaluate_correctness(output, expected_output):
    return output.strip() == expected_output.strip()

def evaluate_efficiency(code):
    start_time = time.time()
    execute_code(code, '')  # Efficiency evaluation might not need expected output code
    end_time = time.time()
    execution_time = end_time - start_time
    return execution_time

def evaluate_style(code):
    pylint_path = shutil.which('pylint')
    if pylint_path is None:
        return 'pylint not found'

    pylint_opts = ['--disable=all', '--enable=C', '--output-format=text']
    with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as temp_file:
        temp_file.write(code.encode('utf-8'))
        temp_file_path = temp_file.name

    pylint_output = subprocess.run([pylint_path] + pylint_opts + [temp_file_path], capture_output=True, text=True)
    os.unlink(temp_file_path)
    
    return pylint_output.stdout

@app.route('/resume')
def resume_page():
    return render_template('details.html')

@app.route('/submit_resume', methods=['POST'])
def submit_resume():
    global resume
    try:
        resume = {
            'name': request.form['name'],
            'education': request.form['education'],
            'skills': [
                request.form['skill1'],
                request.form['skill2']
            ],
            'internship': request.form['internship'],
            'projects': [
                request.form['project1'],
                request.form['project2'],
                request.form['project3']
            ]
        }
        return redirect(url_for('interview'))
    except Exception as e:
        return f"Error processing form data: {str(e)}"


@app.route('/interview')
def interview():
    global resume
    questions = generate_questions(resume)
    return render_template('interview.html', questions=questions, resume=resume)



@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        response = request.json.get('response')
        tokens = word_tokenize(response.lower())
        filtered_tokens = [word for word in tokens if word.isalnum() and word not in stop_words]

        # Basic analysis: Check for presence of keywords
        positive_keywords = {'experience', 'skill', 'strength', 'success'}
        negative_keywords = {'weakness', 'fail', 'problem', 'difficulty'}

        positive_count = len(set(filtered_tokens) & positive_keywords)
        negative_count = len(set(filtered_tokens) & negative_keywords)

        if positive_count > negative_count:
            feedback = "Your response was quite positive. Good job!"
        elif negative_count > positive_count:
            feedback = "Your response had some negative aspects. Try to focus more on your strengths."
        else:
            feedback = "Your response was neutral. Try to include more positive aspects."

        return jsonify({'feedback': feedback})
    except Exception as e:
        return jsonify({'error': str(e)})

def generate_questions(resume):
    questions = []
    questions.append(f"Hello {resume['name']}, Introduce yourself.")
    questions.append(f"Can you share a few words about your {resume['projects'][0]} project?.")
    questions.append(f"Why did you choose {resume['internship']} internships.")
    # questions.append(f"Tell me about your experience at {resume['experience'][0]['company']}.")
    # questions.append(f"Tell me about your experience at {resume['experience'][0]['company']}.")
    # questions.append(f"How did you utilize your skills in {resume['skills'][0]} at {resume['experience'][0]['company']}?")
    # questions.append(f"Can you elaborate on your project experience during your time at {resume['experience'][1]['company']}?")
    # questions.append(f"What did you learn during your studies at {resume['education']}?")
    questions.append(f"Assume you are hired, then how long would you expect to work for us?")
    questions.append(f"How do you apply your {resume['skills'][1]} skills in your daily work?")
    questions.append(f"Why should we hire you {resume['name']}?")
    questions.append(f"Great! {resume['name']} you have sucessfully completed the interview practice session")
    return questions

if __name__ == "__main__":
    app.run(debug=False,host='0.0.0.0') 

 

