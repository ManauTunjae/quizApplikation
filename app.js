const DB = {
  Allmänbildning: [
    {
      q: "Vilket land har störst befolkning i världen (2024)?",
      choices: ["Indien", "Kina", "USA", "Indonesien"],
      a: 0,
      explanation: "Indien passerade Kina runt 2023–2024.",
    },
    {
      q: "Vilket år började andra världskriget?",
      choices: ["1937", "1939", "1941", "1945"],
      a: 1,
    },
    {
      q: "Vad heter Sveriges huvudstad?",
      choices: ["Göteborg", "Stockholm", "Malmö", "Uppsala"],
      a: 1,
    },
    {
      q: "Vilken planet kallas den röda planeten?",
      choices: ["Mars", "Venus", "Jupiter", "Saturnus"],
      a: 0,
    },
    {
      q: "Vem skrev 'Romeo och Julia'?",
      choices: ["Shakespeare", "Dante", "Cervantes", "Goethe"],
      a: 0,
    },
    {
      q: "Vilket grundämne har kemisk beteckning O?",
      choices: ["Syre", "Guld", "Kväve", "Kol"],
      a: 0,
    },
  ],
  Programmering: [
    {
      q: "Vilket språk används för webbsidans struktur?",
      choices: ["CSS", "JavaScript", "HTML", "Python"],
      a: 2,
    },
    {
      q: "Vilken metod lägger till en sista post i en JS-array?",
      choices: ["push()", "pop()", "shift()", "unshift()"],
      a: 0,
    },
    {
      q: "Vad betyder 'CSS'?",
      choices: [
        "Coded Style Sheets",
        "Cascading Style Sheets",
        "Computer Style Syntax",
        "Creative Styles",
      ],
      a: 1,
    },
    {
      q: "Vilket av dessa är ett versionshanteringssystem?",
      choices: ["Docker", "Git", "Node", "React"],
      a: 1,
    },
    {
      q: "Vilket format används ofta för API-data?",
      choices: ["XML", "TXT", "JSON", "CSV"],
      a: 2,
    },
    {
      q: "Vilken operator används för strikt likhet i JavaScript?",
      choices: ["=", "==", "===", "!=="],
      a: 2,
    },
  ],
  prog: [
    {
      q: "Vilket språk används för webbsidans struktur?",
      choices: ["CSS", "JavaScript", "HTML", "Python"],
      a: 2,
    },
    {
      q: "Vilken metod lägger till en sista post i en JS-array?",
      choices: ["push()", "pop()", "shift()", "unshift()"],
      a: 0,
    },
    {
      q: "Vad betyder 'CSS'?",
      q: "Vilken metod lägger till en sista post i en JS-array?",
      choices: ["push()", "pop()", "shift()", "unshift()"],
      a: 0,
    },
    {
      q: "Vad betyder 'CSS'?",
      choices: [
        "Coded Style Sheets",
        "Cascading Style Sheets",
        "Computer Style Syntax",
        "Creative Styles",
      ],
      a: 1,
    },
    {
      q: "Vilket av dessa är ett versionshanteringssystem?",
      choices: ["Docker", "Git", "Node", "React"],
      a: 1,
    },
    {
      q: "Vilket format används ofta för API-data?",
      choices: ["XML", "TXT", "JSON", "CSV"],
      a: 2,
    },
    {
      q: "Vilken operator används för strikt likhet i JavaScript?",
      choices: ["=", "==", "===", "!=="],
      a: 2,
    },
  ],
};

let state = {
  category: "",
  questions: [],
  currentIndex: 0,
  score: 0,
  timer: null,
  highScores: {},
};

const main = document.getElementById("main");

window.onload = () => {
  renderStartPage();
};
function renderStartPage() {
  main.innerHTML = `
    <div class="main-container">
            <section class="quiz-section">
              <h2>Testa dina kunskaper!</h2>
              <div class="quiz-container">
                <input
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Ange ditt namn"
                />
                <select name="catigory" id="catigoryselct">
                    ${Object.keys(DB)
                      .map(
                        (c) =>
                          `<option value="${c}">${c} (${DB[c].length} frågor)</option>`
                      )
                      .join("")}
                  
                </select>
                <input
                  type="number"
                  min="5"
                  max="20"
                  name="number"
                  id="frågorantal"
                  placeholder="Antal frågor"
                />
                <div>
                  <input type="checkbox" name="checkbox" id="checkbox" />
                  <label for="checkbox"
                    > Aktivera timer per fråga</label
                  >
                </div>
                <input
                  type="number"
                  min="10"
                  max="120"
                  name="number"
                  id="frågaorlimit"
                  placeholder="Tidsgräns i sekunder"
                />
              </div>
              <button id="start-quiz">Starta Quiz</button>
            </section>
            <section class="point-section">
              <div class="point-container">
                <h2>Högsta poäng</h2>
                <div class="">
                  <p id="result-text"><strong>programiring: </strong> 4/5 (80%)</p>
                  <p id="result-text"><strong>history: </strong> 4/5 (80%)</p>
                  <p id="result-text"><strong>geografi: </strong> 4/5 (80%)</p>
                  <p id="result-text"><strong>matematik: </strong> 4/5 (80%)</p>
                </div>
              </div>
            </section>
          </div>
    `;

  const startQuizBtn = document.getElementById("start-quiz");
  startQuizBtn.addEventListener("click", () => {
    const categorySelect = document.getElementById("catigoryselct").value;
    state.category = categorySelect;
    const antalfrågor = parseInt(document.getElementById("frågorantal").value);

    state.questions = DB[categorySelect].slice(0, antalfrågor); // Limit to first 5 questions for now
    state.currentIndex = 0;
    state.score = 0;

    renderQuestion();
  });
}

function renderQuestion() {
  const q = state.questions[state.currentIndex];
  main.innerHTML = `<div class="fråga-container">
        <section class="faq-section">
          <div class="faq-item">
            <h2>Fråga ${state.currentIndex + 1}</h2>
            <h3>${q.q}</h3>
          </div>
          <div class="alternativ">
            ${q.choices.map(
              (choice, i) =>
                `<div class="frågor-sec" onclick="checkAnswer(${i})">${choice}</div>`
            ).join("")}
          </div>
         
        </section>
      </div>`;
}

function checkAnswer(selectedIndex) {
  const q = state.questions[state.currentIndex];
  if (selectedIndex == q.a) state.score++;
  state.currentIndex++;
  if (state.currentIndex < state.questions.length) {
    renderQuestion();
  } else {
    renderResult();
  }
}


// render result
function renderResult() {
  const highscore = state.highScores[state.category] || 0;


  main.innerHTML = `
      <div>
            <section class="result-section">
                <div class="resultat">
                    <h3>Resultatet!</h3>
                    <h5 class="point">Du får: <span> ${state.score} av ${state.questions.length} </span></h5>
                </div>
            
            <div class="btn-restart">
                <button class="submit-btn">Spela igen</button>
                <button onclick="renderStartPage()" class="submit-btn">Till startsidan</button>
            </div>
            </section>
        </div>`;
}