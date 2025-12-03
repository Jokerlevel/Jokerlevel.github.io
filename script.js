// ========== 页面切换 ==========
document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.target;

    document.querySelectorAll(".nav-btn").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });

    document.querySelectorAll(".page").forEach((page) => {
      page.classList.toggle("page--active", page.id === target);
    });

    // 首页顶部按钮也可以用 data-target
    if (target === "quiz") {
      // 可以根据需要做一些重置
    }
  });
});

// 首页 hero 按钮快捷跳转
document.querySelectorAll(".primary-btn[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    document
      .querySelector(`.nav-btn[data-target="${targetId}"]`)
      ?.click();
  });
});

// ========== 情侣默契挑战 ==========

// 题库示例：你可以随意增删
const quizQuestions = [
  {
    type: "single",
    question: "我们第一次认真聊天，大概是在哪一天？",
    options: ["暑假某一天", "军训那段时间", "开学后的某个晚上", "我忘了（不许选这个）"],
    answerIndex: 2,
  },
  {
    type: "single",
    question: "她最喜欢喝的饮料类型是？",
    options: ["奶茶", "果茶/果汁", "咖啡", "纯净水很健康"],
    answerIndex: 1,
  },
  {
    type: "single",
    question: "如果有一天我突然消失，她第一反应会是什么？",
    options: ["这个人又睡过头了", "他又在忙实验/写代码", "他不要我了", "报警"],
    answerIndex: 1,
  },
];

let currentQuizIndex = -1;
let quizScore = 0;

const quizQuestionEl = document.getElementById("quizQuestion");
const quizOptionsEl = document.getElementById("quizOptions");
const quizProgressEl = document.getElementById("quizProgress");
const quizResultEl = document.getElementById("quizResult");
const startQuizBtn = document.getElementById("startQuizBtn");

function renderQuizQuestion() {
  const q = quizQuestions[currentQuizIndex];
  if (!q) return;

  quizQuestionEl.textContent = q.question;
  quizOptionsEl.innerHTML = "";
  quizResultEl.textContent = "";

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(idx));
    quizOptionsEl.appendChild(btn);
  });

  quizProgressEl.textContent = `第 ${currentQuizIndex + 1} / ${
    quizQuestions.length
  } 题`;
}

function handleQuizAnswer(index) {
  const q = quizQuestions[currentQuizIndex];
  const optionButtons = quizOptionsEl.querySelectorAll(".quiz-option-btn");

  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answerIndex) {
      btn.classList.add("correct");
    }
    if (idx === index && index !== q.answerIndex) {
      btn.classList.add("wrong");
    }
  });

  if (index === q.answerIndex) {
    quizScore++;
    quizResultEl.textContent = "答对啦！我就知道你很懂我 💕";
    triggerHearts();
  } else {
    quizResultEl.textContent = "这题再想想，下次一定对！";
  }

  setTimeout(() => {
    currentQuizIndex++;
    if (currentQuizIndex < quizQuestions.length) {
      renderQuizQuestion();
    } else {
      // 结束
      quizQuestionEl.textContent = "挑战结束啦！";
      quizOptionsEl.innerHTML = "";
      const percent = Math.round(
        (quizScore / quizQuestions.length) * 100
      );
      quizProgressEl.textContent = "";
      quizResultEl.textContent = `你的默契度是 ${percent}% ，不过在我心里永远是 100% ❤️`;
      startQuizBtn.textContent = "再来一轮";
      startQuizBtn.disabled = false;
    }
  }, 1200);
}

startQuizBtn.addEventListener("click", () => {
  currentQuizIndex = 0;
  quizScore = 0;
  startQuizBtn.disabled = true;
  startQuizBtn.textContent = "作答中...";
  renderQuizQuestion();
});

// ========== 爱心粒子（简单版） ==========

const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");
let hearts = [];
let heartTimer = null;

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function triggerHearts() {
  hearts = [];
  for (let i = 0; i < 40; i++) {
    hearts.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 1.5) * 4,
      size: 8 + Math.random() * 6,
      life: 1,
    });
  }

  if (!heartTimer) {
    heartTimer = requestAnimationFrame(drawHearts);
  }
}

function drawHearts() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hearts.forEach((h) => {
    h.x += h.vx;
    h.y += h.vy;
    h.vy += 0.08;
    h.life -= 0.01;

    if (h.life <= 0) return;

    ctx.save();
    ctx.translate(h.x, h.y);
    ctx.scale(h.size * h.life * 0.1, h.size * h.life * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.bezierCurveTo(-2, -4, -5, -1, 0, 3);
    ctx.bezierCurveTo(5, -1, 2, -4, 0, -2);
    ctx.fillStyle = "rgba(255,122,156," + h.life + ")";
    ctx.fill();
    ctx.restore();
  });

  hearts = hearts.filter((h) => h.life > 0);
  if (hearts.length > 0) {
    heartTimer = requestAnimationFrame(drawHearts);
  } else {
    heartTimer = null;
  }
}

// ========== 抓住我小游戏 ==========

const gameArea = document.getElementById("gameArea");
const runBtn = document.getElementById("runBtn");
const gameMsg = document.getElementById("gameMsg");

function moveRunBtnRandom() {
  const rect = gameArea.getBoundingClientRect();
  const btnRect = runBtn.getBoundingClientRect();

  const padding = 10;
  const maxLeft = rect.width - btnRect.width - padding;
  const maxTop = rect.height - btnRect.height - padding;

  const left = padding + Math.random() * maxLeft;
  const top = padding + Math.random() * maxTop;

  runBtn.style.left = left + "px";
  runBtn.style.top = top + "px";
}

// 鼠标靠近时乱跑
runBtn.addEventListener("mouseenter", moveRunBtnRandom);

// 真正点到按钮时
runBtn.addEventListener("click", () => {
  gameMsg.textContent = "被你抓到了，那就奖励你一个亲亲～ 😘";
});

// ========== 天数计数（从在一起那天算起） ==========

// 把这里替换成你们在一起的日期
const startDate = new Date("2025-04-19");

function updateDaysCounter() {
  const now = new Date();
  const diff = now - startDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById(
    "daysCounter"
  ).textContent = `已经陪你走过 ${days} 天啦`;
}
updateDaysCounter();
