let DB = {};
async function loadDB() {
  try {
    const response = await fetch("questions.json");
    const data = await response.json();
    DB = data;
  } catch (error) {
    console.error("Fel vid laddning av JSON:", error);
  }
}

/***********************   STATE   **********************/
let state = {
  category: "",
  username: "",
  questions: [],
  currentIndex: 0,
  score: 0,
  perQuestionTime: 12, // seconds default
  timerEnabled: false,
  timerId: null,
  timeLeft: 0,
  allowInput: true,
  highScores: [],
};

/***********************   FUNCTIONS   **********************/

/***************   SHUFFLE   **************/
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerDisplay() {
  const t = document.getElementById("timer");
  if (t) t.textContent = `${state.timeLeft}s`;
}

function toggleTimer() {
  const timelimit = document.getElementById("timesec");
  state.timerEnabled = !state.timerEnabled;
  if (state.timerEnabled) {
    timelimit.style.display = "block";
  } else {
    timelimit.style.display = "none";
  }
}

/************   LocalStorage   ***********/
function saveHighScores(cat, user, score) {
  if (!user || user.trim() === "" || user === "Guess") return;
  const highScores = state.highScores.find((h) => h.category === cat);
  if (highScores) {
    highScores.score.push({ user, score });
    highScores.score.sort((a, b) => b.score - a.score);
    highScores.score.splice(3);
  } else {
    state.highScores.push({ category: cat, score: [{ user, score }] });
  }
  localStorage.setItem("quizHighScores", JSON.stringify(state.highScores));
}
function loadHighScores() {
  try {
    const s = JSON.parse(localStorage.getItem("quizHighScores") || "[]");
    state.highScores = s;
    console.log(state.highScores);
  } catch (e) {
    state.highScores = [];
  }
}

/********************  start screen ********************/

async function renderStartPage() {
  state.timerEnabled = false;
  await loadDB();
  loadHighScores();
  app.innerHTML = `
    <div class="main-container">
            <section class="quiz-section">
              <h2>Testa dina kunskaper!</h2>
              <div class="quiz-container">
                <label for="username">Ditt namn</label>
                <input type="text" name="username" id="username"
                  placeholder="Ange ditt namn"
                />
                <label for="catigoryselct">Välj en kategori</label>
                <select name="catigory" id="catigoryselct">
                    ${Object.keys(DB)
                      .map(
                        (c) =>
                          `<option value="${c}">${c} (${DB[c].length} frågor)</option>`
                      )
                      .join("")}
                  
                </select>
                <label for="frågorantal">Antal frågor</label>
                <input type="number" min="5" max="20" name="number"
                  id="frågorantal" placeholder="Antal frågor"
                />
                <div> 
                  <input type="checkbox" name="checkbox" id="checkbox" />
                  <label for="checkbox"
                    > Aktivera timer per fråga (5-120 sekunder)</label>
                </div>
                <input id="timesec" type="number" min="5" max="120" name="timesec"
                placeholder="Tidsgräns i sekunder" value="20"
                />
              </div>
              <button id="start-quiz">Starta Quiz</button>
            </section>
            <section class="point-section">
              <div class="point-container">
                <h2>Högsta poäng </h2>
                <div class="">
                  <ul class="highscores">
                  ${
                    state.highScores.length == 0
                      ? "Inga sparade resultat ännu."
                      : state.highScores
                          .map((cat) => {
                            const topScores = cat.score
                              .sort((a, b) => b.score - a.score)
                              .slice(0, 3);

                            return `
                        <li class="category">
                          <h3  id="category-title" class="category-title" data-category="${
                            cat.category
                          }">
                            ${cat.category}
                          </h3>
                          <ul class="scores hidden" id="scores-${cat.category}">
                            ${topScores
                              .map(
                                (s, i) => `
                                <li>
                                <div>
                                <span class="rank">#${i + 1}</span>
                                <span class="user">${s.user}</span>
                                </div>
                                  <span class="user-score">${s.score}</span>
                                </li>
                              `
                              )
                              .join("")}
                          </ul>
                        </li>
                      `;
                          })
                          .join("")
                  }

                </div>
              </div>
            </section>
          </div>
    `;
  document.querySelectorAll(".category-title").forEach((title) => {
    title.addEventListener("click", () => {
      const category = title.dataset.category;
      console.log(category);
      const scoreList = document.getElementById(`scores-${category}`);
      scoreList.classList.toggle("hidden");
    });
  });
  document.getElementById("checkbox").addEventListener("change", toggleTimer);

  const startQuizBtn = document.getElementById("start-quiz");
  startQuizBtn.addEventListener("click", () => {
    const categorySelect = document.getElementById("catigoryselct").value;
    state.category = categorySelect;
    let qcount = parseInt(document.getElementById("frågorantal").value) || 5;
    const timerEnabled = document.getElementById("checkbox").checked;
    const username = document.getElementById("username").value || "Guess";

    let sec =
      parseInt(document.getElementById("timesec").value) ||
      state.perQuestionTime;
    qcount = Math.max(1, Math.min(qcount, DB[categorySelect].length));
    startQuiz({
      category: categorySelect,
      qcount,
      timerEnabled,
      sec,
      username,
    });
  });
}

/********************** START QUIZ (setup state) **********************/

function startQuiz({ category, qcount, timerEnabled, sec, username }) {
  state.category = category;
  const pool = DB[category] || [];
  state.username = username;
  // shuffle and slice
  state.questions = shuffle(pool)
    .slice(0, qcount)
    .map((q) => ({ ...q }));
  state.currentIndex = 0;
  state.score = 0;
  state.timerEnabled = !!timerEnabled;
  state.perQuestionTime = Math.max(5, Math.min(120, parseInt(sec) || 20));
  state.timeLeft = state.perQuestionTime;
  state.allowInput = true;
  renderQuestion();
}

/********************** RENDER: question view **********************/
function renderQuestion() {
  clearTimer();
  const i = state.currentIndex;
  const total = state.questions.length;
  if (i >= total) return renderResult();

  // progress percent

  const q = state.questions[state.currentIndex];

  app.innerHTML = `<div class="fråga-container">
        <section class="faq-section">
        ${
          state.timerEnabled
            ? `<div id="progressBarContainer">
  <div id="progressBar"></div>
</div>`
            : ""
        }
          <div class="faq-item">
            <h2>Fråga ${state.currentIndex + 1}
            av ${state.questions.length}</h2>
            <h4 class="point">Poäng: ${state.score} <span id="timer">${
    state.timerEnabled ? state.timeLeft : ""
  }</span></h4>
            <h3>${q.q}</h3>
          </div>
          <div class="alternativ">
            ${q.choices
              .map(
                (choice, i) =>
                  `<div class="frågor-sec" onclick="checkAnswer(${i})">${choice}</div>`
              )
              .join("")}
          </div>
         
        </section>
        <div style="margin-left:auto">
          <button id="quitBtn" >Avbryt</button>
        </div>
      </div>`;

  document.getElementById("quitBtn").addEventListener("click", () => {
    if (confirm("Avbryt quizen och återgå till startsidan?")) renderStartPage();
  });
  const progressBar = document.getElementById("progressBar");
  if (state.timerEnabled) {
    state.timeLeft = state.perQuestionTime;
    updateTimerDisplay();
    state.timerId = setInterval(() => {
      state.timeLeft--;
      updateTimerDisplay();

      const percentLeft = ((state.timeLeft - 1) / state.perQuestionTime) * 100;
      progressBar.style.width = percentLeft + "%";

      // ändra färgen på progressbaren
      const hue = percentLeft * 1.2; // 0 = red, 120 = green
      progressBar.style.backgroundColor = `hsl(${hue}, 100%, 40%)`;

      if (state.timeLeft <= 0) {
        clearTimer();
        // treat as wrong and move on
        checkAnswer(null); // null => no selection => timeout
      }
    }, 1000);
  }
}

/********************** HANDLE ANSWER **********************/

function checkAnswer(selectedIndex) {
  console.log(selectedIndex);
  //if (!state.allowInput) return; // förhindra flera klick
  state.allowInput = false;
  clearTimer();

  const q = state.questions[state.currentIndex];
  const options = document.querySelectorAll(".frågor-sec");

  // inaktivera alla alternativ
  options.forEach((opt) => opt.classList.add("disabled"));

  // om användaren klickar på ett alternativ
  if (selectedIndex !== null) {
    const selectedOption = options[selectedIndex];
    if (selectedIndex === q.a) {
      selectedOption.classList.add("correct");
      state.score++;
    } else {
      selectedOption.classList.add("wrong");
      // visa rätt svar också
      options[q.a].classList.add("correct");
    }
  } else {
    // om ingen svar valdes, gå till rätt svar
    options[q.a].classList.add("correct");
  }

  // gå till nästa fråga efter en korta pausa
  setTimeout(() => {
    state.currentIndex++;
    state.allowInput = false;
    if (state.currentIndex < state.questions.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }, 900);
}

/********************** RENDER: result view **********************/

function renderResult() {
  saveHighScores(state.category, state.username, state.score);
  clearTimer();
  const highscore = state.highScores[state.category] || 0;
  app.innerHTML = `
    <div>
          <section class="result-section">
              <div class="resultat">
                  <h3>Resultatet!</h3>
                  <h4 class="username">Hej ${state.username}</h4>
                  <h5 class="point">Du får: <span> ${state.score} av ${
    state.questions.length
  } </span></h5>
              </div>
              <div style="margin-top:12px">
        <ul class="correct-list">
          ${state.questions
            .map(
              (qq, idx) => `
            <li class="correct-list-item">
              <div><strong>Fråga ${idx + 1}:</strong> ${qq.q}</div>
              <div style="margin-top:6px;color:${
                qq.a === state.questions[idx].a ? "" : "inherit"
              }">
                <strong>Rätt svar:</strong> ${qq.choices[qq.a]}
              </div>
              ${
                qq.explanation
                  ? `<div class="muted expanation" style="margin-top:6px">${qq.explanation}</div>`
                  : ""
              }
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
          
          <div class="btn-restart">
              <button id="retryBtn" class="submit-btn">Spela igen</button>
              <button onclick="renderStartPage()" class="submit-btn">Till startsidan</button>
          </div>
          </section>
    </div>`;

  document.getElementById("retryBtn").addEventListener("click", () => {
    // restart same quiz (reshuffle same category)
    startQuiz({
      category: state.category,
      qcount: state.questions.length,
      timerEnabled: state.timerEnabled,
      sec: state.perQuestionTime,
    });
  });
}



/********************** Init **********************/
document.addEventListener("DOMContentLoaded", () => {
  loadHighScores();
  renderStartPage();
});


document.getElementById("colorPicker").addEventListener("input", (e) => {
  document.documentElement.style.setProperty("--primary", e.target.value);
});
