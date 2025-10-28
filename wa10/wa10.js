let triviaBtn = document.querySelector("#js-new-quote").addEventListener("click", newTrivia);

let current = {
    question: "",
    answer: "",
}

const endpoint = "https://uselessfacts.jsph.pl/api/v2/facts/random";

const XBtn = document.querySelector("#js-X");

async function newTrivia() {
    //console.log("Success");

    try{
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw Error(response.statusText);
        }
        const json = await response.json();
        //console.log(json);
        displayTrivia(json["text"]);
        current.question = json["text"];
        current.answer = json["permalink"]
        //console.log(current.question);
        //console.log(current.answer);
        const answerText = document.querySelector("#js-answer-text");
        answerText.textContent = current.answer;
    } catch(err) {
        console.log(err);
        alert("Failed to get new fact");
    }
}

function displayTrivia(question) {
    const questionText = document.querySelector("#js-quote-text");
    const answerText = document.querySelector("#js-answer-text");
    questionText.textContent = question;
    answerText.textContent = "";
}

function newAnswer() {
    //console.log("Success == answer!");
    const answerText = document.querySelector("#js-answer-text");
    answerText.textContent = current.answer;
}

newTrivia();