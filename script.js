const msgEl = document.getElementById('msg');
const guessesEl = document.getElementById('guesses');

// Custom: track guesses, the possible range, and whether the game is over
let guessCount = 0;
let low = 1;
let high = 100;
let gameOver = false;

// Generate random number
function getRandomNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

const randomNum = getRandomNumber();
console.log('Number:', randomNum);

window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = new window.SpeechRecognition();

// Start recognition and game
recognition.start();

// Write what user speaks
function writeMessage(msg) {
  msgEl.innerHTML = '';
  const div = document.createElement('div');
  div.textContent = 'You said: ';
  const span = document.createElement('span');
  span.classList.add('box');
  span.textContent = msg;

  msgEl.append(div, span);
}

// Check msg against the secret number
function checkNumber(msg) {
  // Custom: ignore capital letters and extra spaces
  msg = msg.toLowerCase().trim();

  const wordToNumber = {
    one: 1,
    won: 1,
    two: 2,
    to: 2,
    too: 2,
    three: 3,
    tree: 3,
    four: 4,
    for: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    ate: 8,
    nine: 9,
    ten: 10,
  };

  if (wordToNumber[msg]) {
    console.log(`adjusting ${msg} to ${wordToNumber[msg]}`);
    msg = wordToNumber[msg];
  }

  const num = Number(msg);

  // Check if the spoken content is a valid number
  if (Number.isNaN(num)) {
    const div = document.createElement('div');
    div.textContent = 'That is not a valid number';
    div.classList.add('invalid');
    msgEl.append(div);
    return;
  }

  // Check if it's in range
  if (num < 1 || num > 100) {
    const div = document.createElement('div');
    div.textContent = 'Number must be between 1 and 100';
    div.classList.add('invalid');
    msgEl.append(div);
    return;
  }

  // Custom: count this guess
  guessCount++;
  guessesEl.textContent = `Guesses: ${guessCount}`;

  // Check the number and provide feedback
  if (num === randomNum) {
    // Custom: stop listening once the game is won
    gameOver = true;
    recognition.stop();

    const h2 = document.createElement('h2');
    const word = guessCount === 1 ? 'guess' : 'guesses';
    h2.textContent = `Congrats! You guessed ${num} in ${guessCount} ${word}!`;
    h2.classList.add('correct');

    const button = document.createElement('button');
    button.classList.add('play-again');
    button.id = 'play-again';
    button.textContent = 'Play Again';
    button.addEventListener('click', () => window.location.reload());

    msgEl.append(h2, button);
  } else if (num > randomNum) {
    // Custom: narrow the range so we can show a hint
    high = Math.min(high, num - 1);
    const div = document.createElement('div');
    div.textContent = `GO LOWER (try between ${low} and ${high})`;
    div.classList.add('lower');
    msgEl.append(div);
  } else {
    low = Math.max(low, num + 1);
    const div = document.createElement('div');
    div.textContent = `GO HIGHER (try between ${low} and ${high})`;
    div.classList.add('higher');
    msgEl.append(div);
  }
}

// Capture user speak
function onSpeak(event) {
  if (gameOver) return;
  const msg = event.results[0][0].transcript;
  console.log(msg);
  writeMessage(msg);
  checkNumber(msg);
}

// Speak result
recognition.addEventListener('result', onSpeak);

// Keep listening after each guess, until the game is won
recognition.addEventListener('end', () => {
  if (!gameOver) recognition.start();
});