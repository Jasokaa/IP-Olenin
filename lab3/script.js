// Mental Arithmetic Test JavaScript

// DOM Elements
const operationButtons = document.querySelectorAll('.operation-btn');
const rangeButtons = document.querySelectorAll('.range-btn');
const numberButtons = document.querySelectorAll('.num-btn');
const problemElement = document.getElementById('problem');
const answerFieldElement = document.getElementById('answer-field');
const correctCountElement = document.getElementById('correct-count');
const totalCountElement = document.getElementById('total-count');
const percentageElement = document.getElementById('percentage');
const feedbackElement = document.getElementById('feedback');

// Application State
let state = {
    currentOperation: '*', // Default to multiplication for this lab
    currentRange: 27,     // Default to 27 (20 + 7) for variant 7
    currentAnswer: '',
    expectedAnswer: 0,
    currentNum1: 0,
    currentNum2: 0,
    correctCount: 0,
    totalCount: 0
};

// Initialize the application
function init() {
    selectOperation('multiply-op');
    selectRange('range-27');
    generateNewProblem();
    addEventListeners();
}

// Add all event listeners
function addEventListeners() {
    // Operation selection
    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectOperation(button.id);
            generateNewProblem();
        });
    });

    // Range selection
    rangeButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectRange(button.id);
            generateNewProblem();
        });
    });

    // Number buttons
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleNumberInput(button.getAttribute('data-value'));
        });
    });

    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
}

// Handle operation selection
function selectOperation(operationId) {
    // Remove selected class from all operation buttons
    operationButtons.forEach(button => {
        button.classList.remove('selected');
    });

    // Add selected class to clicked button
    document.getElementById(operationId).classList.add('selected');

    // Update current operation
    switch (operationId) {
        case 'add-op':
            state.currentOperation = '+';
            break;
        case 'subtract-op':
            state.currentOperation = '-';
            break;
        case 'multiply-op':
            state.currentOperation = '*';
            break;
    }
}

// Handle range selection
function selectRange(rangeId) {
    // Remove selected class from all range buttons
    rangeButtons.forEach(button => {
        button.classList.remove('selected');
    });

    // Add selected class to clicked button
    document.getElementById(rangeId).classList.add('selected');

    // Update current range
    switch (rangeId) {
        case 'range-10':
            state.currentRange = 10;
            break;
        case 'range-27':
            state.currentRange = 27;
            break;
        case 'range-50':
            state.currentRange = 50;
            break;
        case 'range-100':
            state.currentRange = 100;
            break;
    }
}

// Generate a new arithmetic problem
function generateNewProblem() {
    // Generate random numbers within the selected range
    state.currentNum1 = Math.floor(Math.random() * (state.currentRange + 1));
    state.currentNum2 = Math.floor(Math.random() * (state.currentRange + 1));

    // For subtraction, ensure num1 >= num2 to avoid negative results
    if (state.currentOperation === '-' && state.currentNum1 < state.currentNum2) {
        [state.currentNum1, state.currentNum2] = [state.currentNum2, state.currentNum1];
    }

    // Calculate the expected answer
    switch (state.currentOperation) {
        case '+':
            state.expectedAnswer = state.currentNum1 + state.currentNum2;
            break;
        case '-':
            state.expectedAnswer = state.currentNum1 - state.currentNum2;
            break;
        case '*':
            state.expectedAnswer = state.currentNum1 * state.currentNum2;
            break;
    }

    // Display the problem
    problemElement.textContent = `${state.currentNum1} ${state.currentOperation} ${state.currentNum2} = ?`;
    
    // Reset the answer field
    state.currentAnswer = '';
    answerFieldElement.textContent = '_';
    
    // Clear feedback
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
}

// Handle number input (from button clicks)
function handleNumberInput(value) {
    if (value === 'C') {
        // Clear the answer
        state.currentAnswer = '';
        answerFieldElement.textContent = '_';
    } else if (value === '=') {
        // Submit the answer
        checkAnswer();
    } else {
        // Add digit to the answer
        state.currentAnswer += value;
        answerFieldElement.textContent = state.currentAnswer;
    }
}

// Handle keyboard input
function handleKeyboardInput(event) {
    const key = event.key;
    
    // Numbers
    if (/^[0-9]$/.test(key)) {
        handleNumberInput(key);
    } 
    // Enter (submit)
    else if (key === 'Enter') {
        handleNumberInput('=');
    } 
    // Backspace or Delete (clear)
    else if (key === 'Backspace' || key === 'Delete') {
        handleNumberInput('C');
    }
}

// Check the answer
function checkAnswer() {
    if (state.currentAnswer === '') return;
    
    const userAnswer = parseInt(state.currentAnswer);
    state.totalCount++;

    if (userAnswer === state.expectedAnswer) {
        // Correct answer
        state.correctCount++;
        feedbackElement.textContent = 'Correct! 👍';
        feedbackElement.className = 'feedback correct';
    } else {
        // Incorrect answer
        feedbackElement.textContent = `Incorrect. The correct answer is ${state.expectedAnswer}`;
        feedbackElement.className = 'feedback incorrect';
    }

    // Update statistics
    correctCountElement.textContent = state.correctCount;
    totalCountElement.textContent = state.totalCount;
    
    // Calculate and display percentage (with 2 decimal precision)
    const percentage = (state.correctCount / state.totalCount) * 100;
    percentageElement.textContent = `${percentage.toFixed(2)}%`;

    // Generate a new problem after a short delay
    setTimeout(generateNewProblem, 1500);
}

// Initialize the application when page loads
window.addEventListener('DOMContentLoaded', init);