import { typingWords } from "./words.js";

// TODO: Move Caret to NextLine after we press space after entering last word of the line

// We will always start with word 0 and character 0 
let currWordIndex = 0, currCharIndex = 0, timeTaken = 0, correctWordCount = 0, timerStarted = false, timer = null;

const typer = document.getElementById('typingText');
const typerInputEl = document.getElementById('typingInput');
const correctWordCountEl = document.getElementById('correctWordCount');
const correctWordCountParentEl = document.getElementById('correctWordCountEl');
const wpmComponentEl = document.getElementById('wpmComponent');
const wpmEl = document.getElementById('wpmSpeed');
const restartBtn = document.getElementById('restartBtn');
var generatedWords = [];

function getRandomWord() {
    const word = typingWords[Math.floor(Math.random() * typingWords.length)];
    generatedWords.push(word);
    return word
        .split('')
        .map(char => `<span class="char">${char}</span>`)
        .join('');
}

function generateTypingParagraph(length) {
    let paragraph = [];
    for (let i = 0; i < length; i++) {
        paragraph.push(`<span class="word" id="${i}">${getRandomWord()}</span>`);
    }
    return paragraph.join(" ");
}

function initTypingText() {
    currWordIndex = 0, currCharIndex = 0, correctWordCount = 0, timeTaken = 0, timerStarted = false;
    correctWordCountEl.innerText = 0;
    correctWordCountParentEl.classList.add('d-none');
    generatedWords = [];
    if (timer != null && timer != undefined) {
        clearInterval(timer);
    }
    wpmEl.innerText = 0;
    wpmComponentEl.classList.add('d-none');
    typerInputEl.innerHTML = '';
    let numOfWords = getValue('numberOfWords');
    var text = generateTypingParagraph(numOfWords);
    typer.innerHTML = text;
    typerInputEl.focus();
}

function restrictCursorMovement() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let range = selection.getRangeAt(0);
    // Delete selected content
    range.deleteContents();
    // Move caret backward
    let container = range.startContainer;
    let offset = range.startOffset;
    if (offset > 0) {
        offset -= 1;
    }
    const newRange = document.createRange();
    newRange.setStart(container, offset);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
}

function startTimer() {
    let start = 0;
    return setInterval(() => {
        timeTaken = start++;
    }, 1000);
}

function calculateCorrectWords() {
    let count = 0;
    const sentence = typerInputEl.innerText;
    sentence.split(" ").map((word, index) => {
        if (word === generatedWords[index]) {
            count++;
        }

    });
    return count;
}

function updateStats() {
    // Calculate Correct words 
    let correctWordCount = calculateCorrectWords();
    correctWordCountEl.innerText = correctWordCount;
    correctWordCountParentEl.classList.remove('d-none');
    let wpm = 0;
    wpm = Math.round((correctWordCount / timeTaken) * 60);
    wpmEl.innerText = wpm;
    wpmComponentEl.classList.remove('d-none');
}

function debug(e) {
    console.log(e);
}

// Initialize 
initLocalStorage();
initTypingText();

typerInputEl.addEventListener('input', (e) => {
    let WordLength = generatedWords[currWordIndex].length - 1;
    var currWord = document.getElementById(`${currWordIndex}`);
    // Handle Space And Backspace 
    if (e.data == ' ' || e.inputType == 'deleteContentBackward') {
        // Space Handler
        if (e.data == ' ') {
            // Don't Move Caret to next Character until word is typed 
            if (WordLength >= currCharIndex) {
                restrictCursorMovement();
            }
            else {
                currWordIndex++;
                currCharIndex = 0;
            }
            typerInputEl.focus();
        }
        // Backspace Handler
        else if (e.inputType == 'deleteContentBackward') {
            currCharIndex--;

            if (currCharIndex < 0) {
                currWordIndex--;
                if (currWordIndex < 0) {
                    currWordIndex = 0;
                }
                currCharIndex = generatedWords[currWordIndex].length;
                currWord = document.getElementById(`${currWordIndex}`)
            }
            else {
                currWord.children[currCharIndex].classList.remove('correctInput');
                currWord.children[currCharIndex].classList.remove('wrongInput');
            }
            // Dont run in case of space 
            typerInputEl.focus();
        }

    }
    else {

        if (!timerStarted) {
            timer = startTimer();
            timerStarted = true;
        }

        if (WordLength < currCharIndex) {
            restrictCursorMovement();
        }
        // Wrong Char
        else {
            if (e.data !== generatedWords[currWordIndex][currCharIndex]) {
                currWord.children[currCharIndex].classList.add('wrongInput');
            }
            else {
                currWord.children[currCharIndex].classList.add('correctInput');
            }
            currCharIndex++;

            // Check if we are at last word calculate show stats and blur out of input box
            if (currWordIndex == generatedWords.length - 1) {
                if (currCharIndex == generatedWords[currWordIndex].length) {
                    typerInputEl.blur();
                    clearInterval(timer);
                    updateStats();
                }
            }
        }

    }

});

// Restrict extra words insertion at place of space
typerInputEl.addEventListener("beforeinput", (e) => {
    let WordLength = generatedWords[currWordIndex].length;
    if (WordLength == currCharIndex) {
        if (e.inputType === "insertText" && e.data !== " ") {
            e.preventDefault(); // prevent insertion of anything other than space
        }
    }
});

// Restart Button
restartBtn.addEventListener('click', () => initTypingText());


/*  -------------------------- Settings Handler  -------------------------- */
let playerName = document.getElementById('playerName');
let wordsCount = document.getElementById('wordCount');
const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));

function setValue(key, value) {
    localStorage.setItem(key, value);
}

function getValue(key) {
    return localStorage[key];
}

function initLocalStorage() {
    if (!getValue('playerName')) {
        setValue('playerName', 'Player');
    }
    if (!getValue('numberOfWords')) {
        setValue('numberOfWords', 25);
    }
    if (!getValue('typingSpeed')) {
        setValue('typingSpeed', 0);
    }
}

window.openSettings = function openSettingsModal() {
    playerName.value = getValue('playerName');
    wordsCount.value = getValue('numberOfWords');
    settingsModal.show();
}

window.updateSetting = function UpdateSettings() {
    playerName = document.getElementById('playerName');
    wordsCount = document.getElementById('wordCount');
    setValue('playerName', playerName.value);
    setValue('numberOfWords', wordsCount.value);
    initTypingText();
    settingsModal.hide();
}
