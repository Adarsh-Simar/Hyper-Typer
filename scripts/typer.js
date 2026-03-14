import { typingWords } from "./words.js";

// TODO : Correct Word Count is Wrong, Hide WPM and Show it on finish, Modularize The code 

// We will always start with word 0 and character 0 
let currWordIndex = 0, currCharIndex = 0, correctWordCount = 0, timeTaken = 0, timerStarted = false,  currWordChars = [];

const typer = document.getElementById('typingText');
const typerInput = document.getElementById('typingInput');
const correctWordCountEl = document.getElementById('correctWordCount');
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
    currWordIndex = 0, currCharIndex = 0, correctWordCount = 0, timeTaken = 0, timerStarted = false,  currWordChars = [];
    correctWordCountEl.innerText = 0; 
    generatedWords = [];
    wpmEl.innerText = 0; 
    typerInput.innerHTML = '';
    var text = generateTypingParagraph(25);
    typer.innerHTML = text;
    typerInput.focus();
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

function startTimer()
{
    let start = 0; 
    return setInterval(() => {
        timeTaken = start++; 
    },1000);
}

function updateStats()
{
    let wpm = 0; 
    wpm = Math.round((correctWordCount/timeTaken) * 60); 
    wpmEl.innerText = wpm; 
    
}

function debug(e) {
    console.log(e);
}

// Initialize 
initTypingText();


typerInput.addEventListener('input', (e) => {
   
    let WordLength = generatedWords[currWordIndex].length - 1;
    var currWord = document.getElementById(`${currWordIndex}`);
     console.log(currWord,currWordIndex,currCharIndex)
    // Handle Space And Backspace 
    if (e.data == ' ' || e.inputType == 'deleteContentBackward') {
        // Space Handler
        if (e.data == ' ') {
            // Don't Move Caret to next Character until word is typed 
            if (WordLength >= currCharIndex) {
                restrictCursorMovement();
            }
            else {
                // Check if curr Word is correct 
                if (currWordChars.join('') == generatedWords[currWordIndex]) {

                    correctWordCount++;
                    correctWordCountEl.innerText = correctWordCount;
                }
                currWordIndex++;
                currCharIndex = 0;
                currWordChars.length = 0;
            }
            typerInput.focus();

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
                currWord = document.getElementById(`${currWordIndex}`);
            }
            else {
                currWordChars.pop();
                currWord.children[currCharIndex].classList.remove('correctInput');
                currWord.children[currCharIndex].classList.remove('wrongInput');
            }
            typerInput.focus();

        }

    }
    else if (/[a-z]$/i.test(e.data)) {

        var timer;
        if(!timerStarted){
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

            currWordChars.push(e.data);
            currCharIndex++;
            // Check if we are at last word calculate show stats and blur out of input box
            if (currWordIndex == generatedWords.length - 1) {
                if(currCharIndex == generatedWords[currWordIndex].length)
                {
                    typerInput.blur(); 
                    clearInterval(timer);   
                    updateStats(); 
                }
            }
        }

    }

});     

restartBtn.addEventListener('click', () => initTypingText()); 