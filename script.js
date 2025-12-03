// ======================================================
// Supabase 初始化
// ======================================================
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ======================================================
// 0. 网站密码锁
// ======================================================
const SITE_PASSWORD = "131413141314zzl";

function setupPasswordGate() {
  const authed = localStorage.getItem("love_site_authed");
  if (authed === "ok") return;

  const overlay = document.createElement("div");
  overlay.id = "passwordOverlay";
  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    background: "rgba(0,0,0,0.8)",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  overlay.innerHTML = `
    <div class="pw-modal" style="
      background:#fff;
      padding:24px 28px;
      border-radius:18px;
      max-width:320px;
      width:90%;
      text-align:center;
      box-shadow:0 10px 30px rgba(0,0,0,0.2);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text';
    ">
      <h2 style="margin-bottom:12px;">Hi Z.Z.L 💗</h2>
      <p style="font-size:14px; color:#555; margin-bottom:16px;">
        这是 LM 悄悄给你做的小网站，先输入我们的暗号再进去吧～
      </p>
      <input id="pwInput" type="password" placeholder="输入密码"
        style="width:100%; padding:8px 10px; border-radius:10px; border:1px solid #ddd; margin-bottom:12px;">
      <button id="pwButton" style="
        width:100%; padding:8px 0; border:none; border-radius:999px;
        background:#ff7b9c; color:#fff; font-weight:600; cursor:pointer;
      ">进入我们的世界</button>
      <div id="pwError" style="margin-top:8px; font-size:12px; color:#e44;"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const pwInput = overlay.querySelector("#pwInput");
  const pwButton = overlay.querySelector("#pwButton");
  const pwError = overlay.querySelector("#pwError");

  function tryLogin() {
    if (pwInput.value === SITE_PASSWORD) {
      localStorage.setItem("love_site_authed", "ok");
      overlay.remove();
    } else {
      pwError.textContent = "好像不太对，再想想我们的暗号～";
      pwInput.value = "";
      pwInput.focus();
    }
  }

  pwButton.addEventListener("click", tryLogin);
  pwInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });

  pwInput.focus();
}

setupPasswordGate();


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
  card.dataset.id = m.id;
  card.dataset.path = m.path || "";
  card.innerHTML = `
    <div class="memory-img-wrap">
      <img src="${m.img_url}" alt="我们的回忆" />
    </div>
    <div class="memory-info">
      <div class="memory-date">${m.taken_at || "某一天"}</div>
      <div class="memory-text">${m.description || ""}</div>
      <button class="memory-delete-btn">删除这条回忆</button>
    </div>
  `;
  albumGrid.appendChild(card);
});

}

// 从 Supabase 读取相册
async function loadMemories() {
  const { data, error } = await supabase
  .from(MEMORIES_TABLE)
  .select("id,img_url,taken_at,description,path")
  .order("created_at", { ascending: true });


  if (error) {
    console.error("加载相册失败：", error);
    return;
  }
  renderDynamicMemories(data || []);
}

// 删除相册中的一条回忆（删除数据库记录 + 尝试删除存储文件）
albumGrid.addEventListener("click", async (e) => {
  const btn = e.target.closest(".memory-delete-btn");
  if (!btn) return;

  const card = btn.closest(".memory-card");
  const id = card.dataset.id;
  const path = card.dataset.path;

  if (!id) return;

  if (!confirm("真的要删掉这条回忆吗？删了就回不来了哦～")) return;

  // 1. 先删数据库记录
  const { error: dbError } = await supabase
    .from(MEMORIES_TABLE)
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error(dbError);
    alert("删除失败：" + dbError.message);
    return;
  }

  // 2. 再尝试删 Storage 文件（path 可能为空，老数据就不动）
  if (path) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);
    if (storageError) {
      console.warn("删除存储文件失败，但数据库已删：", storageError);
    }
  }

  // 3. 从页面移除
  card.remove();
});


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
  path: filePath,        // ★ 新增：存储路径
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
// ======================================================
// ② 情侣默契挑战：Supabase 题库 + 排行榜
// ======================================================

// ======================================================
// 4. 情侣默契挑战：套卷制出题 + 答题 + 排行榜
//    对应 <section id="quizPage"> 部分
// ======================================================
const QUIZ_SETS_TABLE = "quiz_sets";
const QUIZ_QUESTIONS_TABLE = "quiz_questions";
const QUIZ_RESULTS_TABLE = "quiz_results";

const quizEditModeBtn = document.getElementById("quizEditModeBtn");
const quizPlayModeBtn = document.getElementById("quizPlayModeBtn");
const quizEditPanel = document.getElementById("quizEditPanel");
const quizPlayPanel = document.getElementById("quizPlayPanel");

// 套卷相关
const quizSetList = document.getElementById("quizSetList");
const quizSetTitleInput = document.getElementById("quizSetTitleInput");
const quizSetAuthorInput = document.getElementById("quizSetAuthorInput");
const quizCreateSetBtn = document.getElementById("quizCreateSetBtn");
const quizCurrentSetLabel = document.getElementById("quizCurrentSetLabel");

// 出题相关
const quizEditInput = document.getElementById("quizEditInput");
const quizAddQuestionBtn = document.getElementById("quizAddQuestionBtn");
const quizQuestionList = document.getElementById("quizQuestionList");

// 答题相关
const quizQuestionEl = document.getElementById("quizQuestion");
const quizOptionsEl = document.getElementById("quizOptions");
const quizProgressEl = document.getElementById("quizProgress");
const quizResultEl = document.getElementById("quizResult");
const quizAfterPanel = document.getElementById("quizAfterPanel");
const quizFinalText = document.getElementById("quizFinalText");
const quizNameInput = document.getElementById("quizNameInput");
const quizSaveResultBtn = document.getElementById("quizSaveResultBtn");
const quizLeaderboardBody = document.getElementById("quizLeaderboard");

let quizSets = [];
let currentSetId = null;       // 正在出题的这套
let currentSetTitle = "";
let currentSetAuthor = "";

let playingSetId = null;       // 当前正在答题的套卷
let playingSetTitle = "";

let quizQuestions = [];
let currentQuizIndex = -1;
let quizScore = 0;
let quizTotal = 0;

// -----------------------------
// 模式切换：出题 / 答题
// -----------------------------
if (quizEditModeBtn && quizPlayModeBtn) {
  quizEditModeBtn.addEventListener("click", () => {
    if (!quizEditPanel || !quizPlayPanel) return;
    quizEditPanel.style.display = "block";
    quizPlayPanel.style.display = "none";
  });

  quizPlayModeBtn.addEventListener("click", async () => {
    if (!quizEditPanel || !quizPlayPanel) return;
    quizEditPanel.style.display = "none";
    quizPlayPanel.style.display = "block";
    await loadQuizSets();
    // 不自动开始任何套卷，需要用户点上面的某一套
    clearQuizPlayArea();
  });
}

// -----------------------------
// 载入 & 渲染套卷列表
// -----------------------------
async function loadQuizSets() {
  if (!quizSetList) return;
  const { data, error } = await supabase
    .from(QUIZ_SETS_TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("加载套卷失败：", error);
    return;
  }
  quizSets = data || [];
  renderQuizSetList();
}

function renderQuizSetList() {
  if (!quizSetList) return;
  quizSetList.innerHTML = "";
  if (!quizSets.length) {
    const empty = document.createElement("div");
    empty.className = "quiz-set-empty";
    empty.textContent = "现在还没有套卷，可以先去上面“出一套新的题”。";
    quizSetList.appendChild(empty);
    return;
  }

  quizSets.forEach((s) => {
    const card = document.createElement("div");
    card.className = "quiz-set-card";

    const mainBtn = document.createElement("button");
    mainBtn.className = "quiz-set-play-btn";
    mainBtn.dataset.setId = s.id;
    mainBtn.innerHTML = `
      <div class="quiz-set-title">${s.title}</div>
      <div class="quiz-set-meta">by ${s.author || "某个神秘出题人"}</div>
    `;

    const delBtn = document.createElement("button");
    delBtn.className = "quiz-set-delete-btn";
    delBtn.dataset.setId = s.id;
    delBtn.textContent = "删除";

    card.appendChild(mainBtn);
    card.appendChild(delBtn);
    quizSetList.appendChild(card);
  });
}

// 套卷列表的点击事件：开始答题 / 删除套卷
if (quizSetList) {
  quizSetList.addEventListener("click", async (e) => {
    const playBtn = e.target.closest(".quiz-set-play-btn");
    const delBtn = e.target.closest(".quiz-set-delete-btn");

    if (playBtn) {
      const setId = playBtn.dataset.setId;
      const set = quizSets.find((s) => s.id === setId);
      if (!set) return;
      playingSetId = setId;
      playingSetTitle = set.title;
      await startQuizForSet(setId);
      return;
    }

    if (delBtn) {
      const setId = delBtn.dataset.setId;
      const set = quizSets.find((s) => s.id === setId);
      if (!set) return;
      if (!confirm(`确认要删除套卷「${set.title}」吗？里面的题目和成绩也会一起删掉哦～`)) return;

      const { error } = await supabase
        .from(QUIZ_SETS_TABLE)
        .delete()
        .eq("id", setId);

      if (error) {
        console.error(error);
        alert("删除套卷失败：" + error.message);
        return;
      }
      if (currentSetId === setId) {
        currentSetId = null;
        currentSetTitle = "";
        currentSetAuthor = "";
        if (quizCurrentSetLabel) quizCurrentSetLabel.textContent = "";
        if (quizQuestionList) quizQuestionList.innerHTML = "";
      }
      if (playingSetId === setId) {
        playingSetId = null;
        playingSetTitle = "";
        clearQuizPlayArea();
      }
      await loadQuizSets();
    }
  });
}

// -----------------------------
// 创建 / 切换当前出题的套卷
// -----------------------------
if (quizCreateSetBtn) {
  quizCreateSetBtn.addEventListener("click", async () => {
    const title = (quizSetTitleInput?.value || "").trim();
    const author = (quizSetAuthorInput?.value || "").trim();
    if (!title) {
      alert("先给这套卷起个名字吧～");
      return;
    }
    // 创建一套新的
    const { data, error } = await supabase
      .from(QUIZ_SETS_TABLE)
      .insert({ title, author })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("创建套卷失败：" + error.message);
      return;
    }

    currentSetId = data.id;
    currentSetTitle = data.title;
    currentSetAuthor = data.author || "";
    if (quizCurrentSetLabel) {
      quizCurrentSetLabel.textContent = `正在出题的套卷：${currentSetTitle} ${
        currentSetAuthor ? `（出题人：${currentSetAuthor}）` : ""
      }`;
    }
    if (quizEditInput) quizEditInput.value = "";
    if (quizQuestionList) quizQuestionList.innerHTML = "";

    await loadQuizSets();
    alert("新套卷创建好了，下面开始一题一题加吧～");
  });
}

// -----------------------------
// 给当前套卷添加题目
// -----------------------------
if (quizAddQuestionBtn) {
  quizAddQuestionBtn.addEventListener("click", async () => {
    if (!currentSetId) {
      alert("先在上面创建一套卷，再开始出题哦～");
      return;
    }
    const raw = (quizEditInput?.value || "").trim();
    if (!raw) {
      alert("先在文本框里写一题吧～");
      return;
    }
    const lines = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (lines.length < 2) {
      alert("至少需要 1 行题目 + 1 行选项");
      return;
    }

    const question = lines[0];
    const options = [];
    let answerIndex = -1;
    lines.slice(1).forEach((line) => {
      if (line.startsWith("*")) {
        options.push(line.slice(1));
        answerIndex = options.length - 1;
      } else {
        options.push(line);
      }
    });
    if (options.length === 0 || answerIndex === -1) {
      alert("选项里至少有一个要用 * 标出正确答案哦～");
      return;
    }

    const { data, error } = await supabase
      .from(QUIZ_QUESTIONS_TABLE)
      .insert({
        set_id: currentSetId,
        question,
        options,
        answer_index: answerIndex,
      })
      .select();

    if (error) {
      console.error(error);
      alert("添加题目失败：" + error.message);
      return;
    }

    if (quizEditInput) quizEditInput.value = "";
    // 在当前套卷题目列表里追加展示
    const q = data[0];
    if (quizQuestionList) {
      const li = document.createElement("li");
      const opts = q.options.join(" / ");
      li.textContent = `${q.question}  [${opts}]  正确：${
        q.options[q.answer_index]
      }`;
      quizQuestionList.appendChild(li);
    }

    alert("这一题已经收进套卷啦～");
  });
}

// -----------------------------
// 答题：加载某套卷并开始作答
// -----------------------------
async function startQuizForSet(setId) {
  const { data, error } = await supabase
    .from(QUIZ_QUESTIONS_TABLE)
    .select("*")
    .eq("set_id", setId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    alert("读取题目失败：" + error.message);
    return;
  }
  if (!data || !data.length) {
    alert("这套卷还没有题目呢，可以先去出题模式里加几题～");
    return;
  }

  quizQuestions = data;
  quizTotal = quizQuestions.length;
  quizScore = 0;
  currentQuizIndex = 0;
  if (quizAfterPanel) quizAfterPanel.style.display = "none";
  clearQuizPlayArea();
  renderCurrentQuizQuestion();
  await loadQuizLeaderboardForSet(setId);
}

function clearQuizPlayArea() {
  if (quizQuestionEl) quizQuestionEl.textContent = "";
  if (quizOptionsEl) quizOptionsEl.innerHTML = "";
  if (quizProgressEl) quizProgressEl.textContent = "";
  if (quizResultEl) quizResultEl.textContent = "";
  if (quizAfterPanel) quizAfterPanel.style.display = "none";
}

// 渲染当前题目
function renderCurrentQuizQuestion() {
  const q = quizQuestions[currentQuizIndex];
  if (!q || !quizQuestionEl || !quizOptionsEl || !quizProgressEl) return;

  quizQuestionEl.textContent = q.question;
  quizOptionsEl.innerHTML = "";
  if (quizResultEl) quizResultEl.textContent = "";
  quizProgressEl.textContent = `第 ${currentQuizIndex + 1} / ${quizTotal} 题`;

  q.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleQuizAnswer(idx));
    quizOptionsEl.appendChild(btn);
  });
}

function handleQuizAnswer(index) {
  const q = quizQuestions[currentQuizIndex];
  if (!q || !quizOptionsEl) return;
  const optionButtons = quizOptionsEl.querySelectorAll(".quiz-option-btn");

  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.answer_index) btn.classList.add("correct");
    if (idx === index && idx !== q.answer_index)
      btn.classList.add("wrong");
  });

  if (index === q.answer_index) {
    quizScore++;
    if (quizResultEl) quizResultEl.textContent = "这题答对啦 💕";
    triggerHearts();
  } else {
    if (quizResultEl) quizResultEl.textContent = "下题一定对～";
  }

  setTimeout(() => {
    currentQuizIndex++;
    if (currentQuizIndex < quizTotal) {
      renderCurrentQuizQuestion();
    } else {
      finishQuiz();
    }
  }, 800);
}

function finishQuiz() {
  if (!quizQuestionEl || !quizOptionsEl || !quizProgressEl || !quizResultEl)
    return;
  quizQuestionEl.textContent = "挑战结束！";
  quizOptionsEl.innerHTML = "";
  quizProgressEl.textContent = "";

  const percent = Math.round((quizScore / quizTotal) * 100);
  quizResultEl.textContent = `本次得分：${quizScore} / ${quizTotal}，默契度 ${percent}%`;
  if (quizAfterPanel) quizAfterPanel.style.display = "block";
  if (quizFinalText) {
    quizFinalText.textContent = playingSetTitle
      ? `这是套卷「${playingSetTitle}」的成绩，写下你的名字存进排行榜吧～`
      : `写下你的名字，把这次的成绩存进排行榜吧～`;
  }
}

// 保存成绩
if (quizSaveResultBtn) {
  quizSaveResultBtn.addEventListener("click", async () => {
    if (!playingSetId) {
      alert("先选一套卷并完成作答噢～");
      return;
    }
    const name = (quizNameInput?.value || "").trim();
    if (!name) {
      alert("写个名字吧～");
      return;
    }
    const { error } = await supabase.from(QUIZ_RESULTS_TABLE).insert({
      set_id: playingSetId,
      name,
      score: quizScore,
      total: quizTotal,
    });
    if (error) {
      console.error(error);
      alert("保存成绩失败：" + error.message);
      return;
    }
    if (quizAfterPanel) quizAfterPanel.style.display = "none";
    if (quizNameInput) quizNameInput.value = "";
    await loadQuizLeaderboardForSet(playingSetId);
  });
}

// 当前套卷的排行榜
async function loadQuizLeaderboardForSet(setId) {
  if (!quizLeaderboardBody) return;
  const { data, error } = await supabase
    .from(QUIZ_RESULTS_TABLE)
    .select("*")
    .eq("set_id", setId)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(20);

  if (error) {
    console.error("加载排行榜失败：", error);
    return;
  }
  quizLeaderboardBody.innerHTML = "";
  (data || []).forEach((row) => {
    const tr = document.createElement("tr");
    const date = new Date(row.created_at);
    const timeStr = date.toLocaleString();
    tr.innerHTML = `
      <td>${row.name}</td>
      <td>${row.score} / ${row.total}</td>
      <td>${timeStr}</td>
    `;
    quizLeaderboardBody.appendChild(tr);
  });
}

// 页面加载时，先加载一次套卷列表
loadQuizSets();

// 默认打开“开始答题”模式
quizPlayModeBtn.click();


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
// ④ 追逐小游戏
// ======================================================
const gameCanvas = document.getElementById("gameCanvas");
const gctx = gameCanvas.getContext("2d");
const startGameBtn = document.getElementById("startGameBtn");
const gameStatus = document.getElementById("gameStatus");

let gameRunning = false;
let lastTime = 0;

let groundY;
let worldSpeed = 140;
let gap;

// 直接用本地图片当头像
let meHeadImg = new Image();
meHeadImg.src = "img/lm.png";   // LM 的头像

let herHeadImg = new Image();
herHeadImg.src = "img/zzl.png"; // Z.Z.L 的头像

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

// ★★ 关键：确保一开始就给 canvas 一个正常尺寸，并算出 groundY
function resizeGameCanvas() {
  if (!gameCanvas) return;
  const rect = gameCanvas.getBoundingClientRect();

  const width =
    rect.width ||
    (gameCanvas.parentElement ? gameCanvas.parentElement.clientWidth : 800) ||
    800;
  const height = rect.height || 260;

  gameCanvas.width = width;
  gameCanvas.height = height;
  groundY = gameCanvas.height - 40;
}

// 进页面就先算一次尺寸
resizeGameCanvas();
// 窗口尺寸变化时也重新适配
window.addEventListener("resize", resizeGameCanvas);

function resetGame() {
  // 防止极端情况：每次重置前再算一次尺寸
  resizeGameCanvas();

  gameRunning = false;
  lastTime = 0;
  gap = 500;
  lm.y = groundY - lm.height;
  zl.y = groundY - zl.height;
  lm.vy = zl.vy = 0;
  lm.onGround = zl.onGround = true;
  obstacles = [];
  gameStatus.textContent = "准备好了就点“开始游戏”，按空格一起跳跃～";
}
resetGame();

function spawnObstacle() {
  const width = 10 + Math.random() * 8;     // 24~32 像素
  const height = 16 + Math.random() * 10;   // 22~32 像素
  obstacles.push({
    x: gameCanvas.width + 40 + Math.random() * 80,
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

  const chaseSpeed = 20;
  gap -= chaseSpeed * dt;
  if (gap <= 40) {
    gameStatus.textContent = "LM 终于追到 Z.Z.L 啦，奖励一个大大大拥抱！🤍";
    gameRunning = false;
  }
}

function drawCharacter(ch, color, headImg, label) {
  const cx = ch.x + ch.width / 2;      // 身体中心 x
  const footY = ch.y + ch.height;      // 脚底 y
  const torsoTop = footY - 40;         // 身体上端
  const torsoMid = (torsoTop + footY) / 2;

  // 画身体（细线）
  gctx.save();
  gctx.strokeStyle = color;
  gctx.lineWidth = 3;

  // 躯干
  gctx.beginPath();
  gctx.moveTo(cx, torsoTop);
  gctx.lineTo(cx, footY - 8);
  gctx.stroke();

  // 手臂（略微张开）
  gctx.beginPath();
  gctx.moveTo(cx, torsoMid);
  gctx.lineTo(cx - 12, torsoMid + 6);
  gctx.moveTo(cx, torsoMid);
  gctx.lineTo(cx + 12, torsoMid + 6);
  gctx.stroke();

  // 双腿
  gctx.beginPath();
  gctx.moveTo(cx, footY - 8);
  gctx.lineTo(cx - 10, footY);
  gctx.moveTo(cx, footY - 8);
  gctx.lineTo(cx + 10, footY);
  gctx.stroke();

  gctx.restore();

  // 头像（用图片裁成圆，不存在时用默认 LM / ZL）
  const headRadius = 18;
  const headX = cx;
  const headY = torsoTop - headRadius + 4;

  if (headImg && headImg.complete) {
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

  // 地面
  gctx.fillStyle = "#ffe6f0";
  gctx.fillRect(0, groundY, gameCanvas.width, gameCanvas.height - groundY);

  // 障碍
  gctx.fillStyle = "#ffb3c6";
  obstacles.forEach((ob) => {
    gctx.fillRect(ob.x, ob.y, ob.width, ob.height);
  });

  // 根据 gap 动态调整两个人在画布上的距离
  const maxGap = 160;                              // 逻辑上的最大“距离”
  const gapClamped = Math.max(0, Math.min(maxGap, gap));
  const distRatio = gapClamped / maxGap;           // gap 越大，distRatio 越接近 1
  const baseGapPx = 80;                            // 最小像素间距
  const extraGapPx = 220;                          // 还能在画布上拉开的最大距离

  // LM 固定在画布左 1/5 处
  lm.x = gameCanvas.width * 0.2;
  // Z.Z.L 的 x 随 gap 变化
  zl.x = lm.x + baseGapPx + extraGapPx * distRatio;

  // 画两个人
  drawCharacter(lm, "#ff7b9c", meHeadImg, "LM");
  drawCharacter(zl, "#ff9bb3", herHeadImg, "ZL");

  // 顶部进度条：gap 越小，追上进度越高
  const barWidth = 200;
  const barHeight = 10;
  const barX = gameCanvas.width - barWidth - 16;
  const barY = 16;
  const catchRatio = 1 - gapClamped / maxGap;      // 0~1

  gctx.fillStyle = "rgba(0,0,0,0.08)";
  gctx.fillRect(barX, barY, barWidth, barHeight);
  gctx.fillStyle = "#ff7b9c";
  gctx.fillRect(barX, barY, barWidth * catchRatio, barHeight);
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

// 初始静态画面
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
