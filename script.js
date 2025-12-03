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

// ========== 回忆相册：动态添加 + localStorage ==========
const albumGrid = document.getElementById("albumGrid");
const albumImageInput = document.getElementById("albumImageInput");
const albumDateInput = document.getElementById("albumDateInput");
const albumTextInput = document.getElementById("albumTextInput");
const addMemoryBtn = document.getElementById("addMemoryBtn");

const ALBUM_KEY = "love_album_dynamic";

function loadDynamicMemories() {
  try {
    const raw = localStorage.getItem(ALBUM_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveDynamicMemories(list) {
  try {
    localStorage.setItem(ALBUM_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("保存相册失败：", e);
  }
}

function renderDynamicMemories() {
  const memories = loadDynamicMemories();
  // 先删除之前渲染的动态卡片
  albumGrid
    .querySelectorAll(".memory-card.dynamic")
    .forEach((el) => el.remove());

  memories.forEach((m) => {
    const card = document.createElement("div");
    card.className = "memory-card dynamic";
    card.innerHTML = `
      <div class="memory-img-wrap">
        <img src="${m.img}" alt="我们的回忆" />
      </div>
      <div class="memory-info">
        <div class="memory-date">${m.date || "某一天"}</div>
        <div class="memory-text">${m.text || ""}</div>
      </div>
    `;
    albumGrid.appendChild(card);
  });
}

addMemoryBtn.addEventListener("click", () => {
  const file = albumImageInput.files[0];
  if (!file) {
    alert("先选一张照片吧～");
    return;
  }

  const date = albumDateInput.value;
  const text = albumTextInput.value.trim();

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    const list = loadDynamicMemories();
    list.push({
      img: base64,
      date: date || "某一天",
      text: text || "这一刻很值得被记住。",
      createdAt: Date.now(),
    });
    saveDynamicMemories(list);
    renderDynamicMemories();

    albumImageInput.value = "";
    albumDateInput.value = "";
    albumTextInput.value = "";
  };
  reader.readAsDataURL(file);
});

// 初始化相册
renderDynamicMemories();

// ========== 情侣默契挑战 ==========

const quizQuestions = [
  {
    type: "single",
    question: "我们第一次认真聊天，大概是在哪个阶段？",
    options: ["暑假某一天", "军训那段时间", "开学后的某个晚上", "我忘了（不许选）"],
    answerIndex: 2,
  },
  {
    type: "single",
    question: "Z.Z.L 最有可能突然发来的消息是？",
    options: ["在干嘛", "我好无聊", "你睡了吗", "我去写作业了"],
    answerIndex: 0,
  },
  {
    type: "single",
    question: "如果 LM 突然一天没回信息，Z.Z.L 第一反应是什么？",
    options: ["他又睡过头了", "他去打游戏了", "他在忙实验/写代码", "他不要我了"],
    answerIndex: 2,
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
    quizResultEl.textContent = "答对啦！LM 果然很了解 Z.Z.L 💕";
    triggerHearts();
  } else {
    quizResultEl.textContent = "这题小小扣分，下次一定对～";
  }

  setTimeout(() => {
    currentQuizIndex++;
    if (currentQuizIndex < quizQuestions.length) {
      renderQuizQuestion();
    } else {
      quizQuestionEl.textContent = "挑战结束啦！";
      quizOptionsEl.innerHTML = "";
      const percent = Math.round(
        (quizScore / quizQuestions.length) * 100
      );
      quizProgressEl.textContent = "";
      quizResultEl.textContent = `默契度 ${percent}% ，但在 LM 心里永远是 100% ❤️`;
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

// ========== 愿望清单：可新增 + 打勾 + localStorage ==========
const TODO_KEY = "love_wishes";

const todoListEl = document.getElementById("todoList");
const newWishInput = document.getElementById("newWishInput");
const addWishBtn = document.getElementById("addWishBtn");

const defaultWishes = [
  { text: "一起去海边看一次日出", done: false },
  { text: "看一场只属于我们的烟花", done: false },
  { text: "在某个陌生城市迷路，然后一起找到回去的路", done: false },
  { text: "很多年以后，还能一起打开这个网站回忆今天", done: false },
];

function loadWishes() {
  try {
    const raw = localStorage.getItem(TODO_KEY);
    if (!raw) return defaultWishes;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultWishes;
    }
    return parsed;
  } catch {
    return defaultWishes;
  }
}

let wishes = loadWishes();

function saveWishes() {
  try {
    localStorage.setItem(TODO_KEY, JSON.stringify(wishes));
  } catch (e) {
    console.warn("保存愿望清单失败：", e);
  }
}

function renderWishes() {
  todoListEl.innerHTML = "";
  wishes.forEach((w, index) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!w.done;
    checkbox.addEventListener("change", () => {
      wishes[index].done = checkbox.checked;
      saveWishes();
      renderWishes();
    });

    const span = document.createElement("span");
    span.textContent = w.text;
    if (w.done) span.classList.add("done");

    li.appendChild(checkbox);
    li.appendChild(span);
    todoListEl.appendChild(li);
  });
}

renderWishes();

addWishBtn.addEventListener("click", () => {
  const text = newWishInput.value.trim();
  if (!text) {
    alert("先写下一个小愿望吧～");
    return;
  }
  wishes.push({ text, done: false });
  newWishInput.value = "";
  saveWishes();
  renderWishes();
});

// ========== 追逐小游戏：LM 追 Z.Z.L ==========
const gameCanvas = document.getElementById("gameCanvas");
const gctx = gameCanvas.getContext("2d");
const startGameBtn = document.getElementById("startGameBtn");
const gameStatus = document.getElementById("gameStatus");
const meHeadInput = document.getElementById("meHeadInput");
const herHeadInput = document.getElementById("herHeadInput");

let gameRunning = false;
let lastTime = 0;

let groundY;
let worldSpeed = 140; // 障碍移动速度
let gap; // LM 与 Z.Z.L 之间的距离数值，越小越接近

const ME_HEAD_KEY = "love_me_head";
const HER_HEAD_KEY = "love_her_head";

let meHeadImg = null;
let herHeadImg = null;

// 默认画头像：彩色圆圈 + 字母
function drawDefaultHead(ctx, x, y, r, label) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffb6c1";
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = r * 0.9 + "px system-ui";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y + 1);
  ctx.restore();
}

// 角色对象
const lm = {
  x: 120,
  y: 0,
  vy: 0,
  width: 40,
  height: 60,
  onGround: false,
};

const zl = {
  x: 260,
  y: 0,
  vy: 0,
  width: 40,
  height: 60,
  onGround: false,
};

let obstacles = [];

function resizeGameCanvas() {
  gameCanvas.width = gameCanvas.clientWidth;
  gameCanvas.height = gameCanvas.clientHeight;
  groundY = gameCanvas.height - 40;
}
resizeGameCanvas();
window.addEventListener("resize", resizeGameCanvas);

function resetGame() {
  gameRunning = false;
  lastTime = 0;
  gap = 140; // 初始距离
  lm.y = groundY - lm.height;
  zl.y = groundY - zl.height;
  lm.vy = zl.vy = 0;
  lm.onGround = zl.onGround = true;
  obstacles = [];
  gameStatus.textContent = "准备好了就点“开始游戏”，按空格一起跳跃～";
}

resetGame();

// 生成障碍
function spawnObstacle() {
  const width = 26 + Math.random() * 18;
  const height = 30 + Math.random() * 20;
  obstacles.push({
    x: gameCanvas.width + Math.random() * 80,
    y: groundY - height,
    width,
    height,
    hitLM: false,
  });
}

let obstacleTimer = 0;
const obstacleInterval = 1400; // 毫秒

// 跳跃
function jump() {
  if (lm.onGround) {
    lm.vy = -340;
    lm.onGround = false;
  }
  if (zl.onGround) {
    zl.vy = -340;
    zl.onGround = false;
  }
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    if (gameRunning) jump();
  }
});

// 头像上传与存储
function setupHeadUpload(inputEl, storageKey, setImgCallback) {
  inputEl.addEventListener("change", () => {
    const file = inputEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      const img = new Image();
      img.onload = () => {
        setImgCallback(img);
        try {
          localStorage.setItem(storageKey, src);
        } catch {}
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });

  // 读取已保存的
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const img = new Image();
      img.onload = () => setImgCallback(img);
      img.src = saved;
    }
  } catch {}
}

setupHeadUpload(meHeadInput, ME_HEAD_KEY, (img) => {
  meHeadImg = img;
});

setupHeadUpload(herHeadInput, HER_HEAD_KEY, (img) => {
  herHeadImg = img;
});

// 游戏主循环
function updateGame(dt) {
  // 重力
  const g = 900;
  [lm, zl].forEach((ch) => {
    ch.vy += g * dt;
    ch.y += ch.vy * dt;
    if (ch.y + ch.height >= groundY) {
      ch.y = groundY - ch.height;
      ch.vy = 0;
      ch.onGround = true;
    }
  });

  // 障碍移动
  obstacles.forEach((ob) => {
    ob.x -= worldSpeed * dt;
  });
  obstacles = obstacles.filter((ob) => ob.x + ob.width > 0);

  obstacleTimer += dt * 1000;
  if (obstacleTimer > obstacleInterval) {
    obstacleTimer = 0;
    spawnObstacle();
  }

  // 检测 LM 被绊倒
  obstacles.forEach((ob) => {
    if (!ob.hitLM && ob.x < lm.x + lm.width && ob.x + ob.width > lm.x) {
      const lmBottom = lm.y + lm.height;
      if (lmBottom > ob.y + 4) {
        ob.hitLM = true;
        gap += 80; // 被绊倒距离又拉开
        gameStatus.textContent = "LM 被障碍绊了一下，又离 Z.Z.L 远了一点 😭";
      }
    }
  });

  // 追逐进度：LM 略快于 Z.Z.L
  const chaseSpeed = 28; // 每秒缩短的“距离值”
  gap -= chaseSpeed * dt;
  if (gap <= 40) {
    // 追到
    gameStatus.textContent = "LM 终于追到 Z.Z.L 啦，奖励一个大大大拥抱！🤍";
    gameRunning = false;
  }
}

function drawGame() {
  gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

  // 地面
  gctx.fillStyle = "#ffe6f0";
  gctx.fillRect(0, groundY, gameCanvas.width, gameCanvas.height - groundY);

  // 绘制障碍
  gctx.fillStyle = "#ffb3c6";
  obstacles.forEach((ob) => {
    gctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  });

  // 画 LM
  drawCharacter(lm, "#ff7b9c", meHeadImg, "LM");

  // 画 Z.Z.L
  drawCharacter(zl, "#ff9bb3", herHeadImg, "ZL");

  // 画追逐距离条
  const barWidth = 200;
  const barHeight = 10;
  const barX = gameCanvas.width - barWidth - 16;
  const barY = 16;
  const maxGap = 160;
  const ratio = Math.max(0, Math.min(1, 1 - gap / maxGap));

  gctx.fillStyle = "rgba(0,0,0,0.1)";
  gctx.fillRect(barX, barY, barWidth, barHeight);
  gctx.fillStyle = "#ff7b9c";
  gctx.fillRect(barX, barY, barWidth * ratio, barHeight);
  gctx.font = "11px system-ui";
  gctx.fillStyle = "#555";
  gctx.fillText("追上进度", barX, barY - 4);
}

function drawCharacter(ch, color, headImg, label) {
  // 身体
  gctx.fillStyle = color;
  gctx.fillRect(ch.x, ch.y, ch.width, ch.height);

  // 头部
  const headRadius = 18;
  const headX = ch.x + ch.width / 2;
  const headY = ch.y - headRadius + 4;

  if (headImg) {
    gctx.save();
    gctx.beginPath();
    gctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    gctx.closePath();
    gctx.clip();
    gctx.drawImage(
      headImg,
      headX - headRadius,
      headY - headRadius,
      headRadius * 2,
      headRadius * 2
    );
    gctx.restore();
  } else {
    drawDefaultHead(gctx, headX, headY, headRadius, label);
  }
}

function gameLoop(timestamp) {
  if (!gameRunning) return;
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  updateGame(dt);
  drawGame();

  requestAnimationFrame(gameLoop);
}

startGameBtn.addEventListener("click", () => {
  resetGame();
  gameRunning = true;
  gameStatus.textContent = "游戏开始！按空格跳跃，不要让 LM 被绊倒～";
  lastTime = 0;
  requestAnimationFrame(gameLoop);
});

// 初始画一次游戏画面
drawGame();

// ========== 在一起的天数 ==========
const startDate = new Date("2023-10-01"); // ★ 把这里改成你们真实的在一起日期

function updateDaysCounter() {
  const now = new Date();
  const diff = now - startDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  document.getElementById(
    "daysCounter"
  ).textContent = `已经陪你走过 ${days} 天啦`;
}
updateDaysCounter();
