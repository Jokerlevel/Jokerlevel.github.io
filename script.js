// ======================================================
// Supabase 初始化
// ======================================================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ★★★ 把下面两行改成你自己的项目配置 ★★★
const supabaseUrl = "https://hhabcapddorjuhwxouwt.supabase.co"; // Project URL
const supabaseAnonKey = "sb_publishable_Yw0qjmTciWxdWMF3Z3zb1Q__E54t4eK"; // anon public key
// ★★★ 填好即可 ★★★

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ======================================================
// 通用：页面切换 & 首页按钮跳转
// ======================================================
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

document.querySelectorAll(".primary-btn[data-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    document
      .querySelector(`.nav-btn[data-target="${targetId}"]`)
      ?.click();
  });
});

// ======================================================
// ① 回忆相册：使用 Supabase Storage + memories 表
// ======================================================
const albumGrid = document.getElementById("albumGrid");
const albumImageInput = document.getElementById("albumImageInput");
const albumDateInput = document.getElementById("albumDateInput");
const albumTextInput = document.getElementById("albumTextInput");
const addMemoryBtn = document.getElementById("addMemoryBtn");

const MEMORIES_TABLE = "memories";
const BUCKET_NAME = "love-images";

// 渲染来自数据库的动态相册卡片
function renderDynamicMemories(list) {
  // 先删掉旧的动态卡片
  albumGrid.querySelectorAll(".memory-card.dynamic").forEach((el) => el.remove());

  list.forEach((m) => {
    const card = document.createElement("div");
    card.className = "memory-card dynamic";
    card.innerHTML = `
      <div class="memory-img-wrap">
        <img src="${m.img_url}" alt="我们的回忆" />
      </div>
      <div class="memory-info">
        <div class="memory-date">${m.taken_at || "某一天"}</div>
        <div class="memory-text">${m.description || ""}</div>
      </div>
    `;
    albumGrid.appendChild(card);
  });
}

// 从 Supabase 读取相册
async function loadMemories() {
  const { data, error } = await supabase
    .from(MEMORIES_TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("加载相册失败：", error);
    return;
  }
  renderDynamicMemories(data || []);
}

// 上传图片 + 写入数据库
addMemoryBtn.addEventListener("click", async () => {
  const file = albumImageInput.files[0];
  if (!file) {
    alert("先选一张照片吧～");
    return;
  }

  const date = albumDateInput.value || null;
  const text = albumTextInput.value.trim() || "这一刻很值得被记住。";

  try {
    // 1. 上传到 Supabase Storage
    const filePath = `memories/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      alert("上传图片失败，可以稍后再试一下～");
      return;
    }

    // 2. 获取公开访问 URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // 3. 插入一条相册记录
    const { error: insertError } = await supabase.from(MEMORIES_TABLE).insert({
      img_url: publicUrl,
      taken_at: date,
      description: text,
    });

    if (insertError) {
      console.error(insertError);
      alert("保存相册记录失败～");
      return;
    }

    // 4. 清空输入 & 重新加载
    albumImageInput.value = "";
    albumDateInput.value = "";
    albumTextInput.value = "";
    await loadMemories();
  } catch (e) {
    console.error(e);
    alert("出现了一点小问题，可以稍后再试试～");
  }
});

// 页面加载时先读一次相册
loadMemories();

// ======================================================
// ② 情侣默契挑战 + 爱心粒子（保留本地逻辑）
// ======================================================
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
    if (idx === q.answerIndex) btn.classList.add("correct");
    if (idx === index && index !== q.answerIndex)
      btn.classList.add("wrong");
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

// 爱心粒子
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
  if (!heartTimer) heartTimer = requestAnimationFrame(drawHearts);
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

// ======================================================
// ③ 愿望清单：Supabase wishes 表
// ======================================================
const todoListEl = document.getElementById("todoList");
const newWishInput = document.getElementById("newWishInput");
const addWishBtn = document.getElementById("addWishBtn");
const WISHES_TABLE = "wishes";

let wishes = [];

function renderWishes() {
  todoListEl.innerHTML = "";
  wishes.forEach((w) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!w.done;
    checkbox.addEventListener("change", async () => {
      const { error } = await supabase
        .from(WISHES_TABLE)
        .update({ done: checkbox.checked })
        .eq("id", w.id);
      if (error) console.error(error);
      else w.done = checkbox.checked;
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

async function loadWishes() {
  const { data, error } = await supabase
    .from(WISHES_TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("加载愿望清单失败：", error);
    return;
  }
  wishes = data || [];
  renderWishes();
}

addWishBtn.addEventListener("click", async () => {
  const text = newWishInput.value.trim();
  if (!text) {
    alert("先写下一个小愿望吧～");
    return;
  }
  const { data, error } = await supabase
    .from(WISHES_TABLE)
    .insert({ text, done: false })
    .select()
    .single();

  if (error) {
    console.error(error);
    alert("添加愿望失败～");
    return;
  }
  newWishInput.value = "";
  wishes.push(data);
  renderWishes();
});

// 初次加载愿望清单
loadWishes();

// ======================================================
// ④ 追逐小游戏：沿用之前的逻辑（本地）
// ======================================================
const gameCanvas = document.getElementById("gameCanvas");
const gctx = gameCanvas.getContext("2d");
const startGameBtn = document.getElementById("startGameBtn");
const gameStatus = document.getElementById("gameStatus");
const meHeadInput = document.getElementById("meHeadInput");
const herHeadInput = document.getElementById("herHeadInput");

let gameRunning = false;
let lastTime = 0;

let groundY;
let worldSpeed = 140;
let gap;

const ME_HEAD_KEY = "love_me_head";
const HER_HEAD_KEY = "love_her_head";

let meHeadImg = null;
let herHeadImg = null;

function drawDefaultHead(ctx2, x, y, r, label) {
  ctx2.save();
  ctx2.beginPath();
  ctx2.arc(x, y, r, 0, Math.PI * 2);
  ctx2.fillStyle = "#ffb6c1";
  ctx2.fill();
  ctx2.fillStyle = "#fff";
  ctx2.font = r * 0.9 + "px system-ui";
  ctx2.textAlign = "center";
  ctx2.textBaseline = "middle";
  ctx2.fillText(label, x, y + 1);
  ctx2.restore();
}

const lm = { x: 120, y: 0, vy: 0, width: 40, height: 60, onGround: false };
const zl = { x: 260, y: 0, vy: 0, width: 40, height: 60, onGround: false };
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
  gap = 140;
  lm.y = groundY - lm.height;
  zl.y = groundY - zl.height;
  lm.vy = zl.vy = 0;
  lm.onGround = zl.onGround = true;
  obstacles = [];
  gameStatus.textContent = "准备好了就点“开始游戏”，按空格一起跳跃～";
}
resetGame();

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
const obstacleInterval = 1400;

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

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const img = new Image();
      img.onload = () => setImgCallback(img);
      img.src = saved;
    }
  } catch {}
}

setupHeadUpload(meHeadInput, ME_HEAD_KEY, (img) => (meHeadImg = img));
setupHeadUpload(herHeadInput, HER_HEAD_KEY, (img) => (herHeadImg = img));

function updateGame(dt) {
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

  obstacles.forEach((ob) => {
    ob.x -= worldSpeed * dt;
  });
  obstacles = obstacles.filter((ob) => ob.x + ob.width > 0);

  obstacleTimer += dt * 1000;
  if (obstacleTimer > obstacleInterval) {
    obstacleTimer = 0;
    spawnObstacle();
  }

  obstacles.forEach((ob) => {
    if (!ob.hitLM && ob.x < lm.x + lm.width && ob.x + ob.width > lm.x) {
      const lmBottom = lm.y + lm.height;
      if (lmBottom > ob.y + 4) {
        ob.hitLM = true;
        gap += 80;
        gameStatus.textContent = "LM 被障碍绊了一下，又离 Z.Z.L 远了一点 😭";
      }
    }
  });

  const chaseSpeed = 28;
  gap -= chaseSpeed * dt;
  if (gap <= 40) {
    gameStatus.textContent = "LM 终于追到 Z.Z.L 啦，奖励一个大大大拥抱！🤍";
    gameRunning = false;
  }
}

function drawCharacter(ch, color, headImg, label) {
  gctx.fillStyle = color;
  gctx.fillRect(ch.x, ch.y, ch.width, ch.height);

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

function drawGame() {
  gctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  gctx.fillStyle = "#ffe6f0";
  gctx.fillRect(0, groundY, gameCanvas.width, gameCanvas.height - groundY);

  gctx.fillStyle = "#ffb3c6";
  obstacles.forEach((ob) => {
    gctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  });

  drawCharacter(lm, "#ff7b9c", meHeadImg, "LM");
  drawCharacter(zl, "#ff9bb3", herHeadImg, "ZL");

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

drawGame();

// ======================================================
// ⑤ 在一起的天数
// ======================================================
const startDate = new Date("2025-04-19"); // ★ 改成你们的在一起日期
function updateDaysCounter() {
  const now = new Date();
  const diff = now - startDate;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const el = document.getElementById("daysCounter");
  if (el) el.textContent = `已经陪你走过 ${days} 天啦`;
}
updateDaysCounter();
