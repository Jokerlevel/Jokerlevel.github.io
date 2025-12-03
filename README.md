# 💌 给她的小宇宙 | Our Little Universe

这是一个我为女朋友做的专属恋爱主题网站。  
它不是很复杂，但里面的每一个模块，都是写给她的小心事。

A romantic, single-page website I built for my girlfriend.  
Simple tech, lots of feelings.

在线访问（如果你是我 😏）：  
👉 https://jokerlevel.github.io

---

## ✨ 功能概览 | Features

网站是一个单页应用，通过顶部导航切换不同板块：

### 1. 首页 · 情书 (`#home`)
- 朦胧背景 + 大标题：**“给你的一整个宇宙”**
- 一段简短的告白文字
- 按钮可以一键跳转到回忆相册

### 2. 回忆相册 · Memory Album (`#album`)
- 网格卡片布局的相册区
- 每张照片包含：
  - 图片
  - 时间 / 场景描述
  - 一小句注释（属于我们的小剧场）
- 所有图片本地存储在 `img/` 文件夹中，可随时增删

### 3. 情侣默契挑战 · Couple Quiz (`#quiz`)
- 自定义题库，问题全部是**关于我们**的
- 支持单选题，点击选项立即判定对错
- 答对会触发 **爱心粒子特效**（Canvas 实现）
- 最后根据答对题目数量计算“默契度”

### 4. 抓住我小游戏 · Catch Me Game (`#game`)
- 一个写着“来抓我呀 💗”的小按钮
- 鼠标靠近时会自动乱跑，增加互动感
- 真点到按钮时会显示奖励文案（比如“给你亲亲 😘”）

### 5. 未来清单 · Future TODO List (`#future`)
- 展示几条我们想一起完成的愿望/计划
- 目前展示为静态勾选项（后续可以拓展成可勾选 + 本地存储）

### 6. 在一起的天数 · Days Counter
- 页脚显示：**“已经陪你走过 XX 天啦”**
- 日期来源于 `script.js` 中自定义的起始日期

---

## 📁 项目结构 | File Structure

```text
.
├── index.html      # 主页面结构（Home / Album / Quiz / Game / Future）
├── styles.css      # 样式文件：恋爱配色、布局、响应式
├── script.js       # 前端交互逻辑和小游戏
├── img/            # 图片素材（我们的合照、她的照片等）
└── README.md       # 项目说明（就是你现在看到的这个）
