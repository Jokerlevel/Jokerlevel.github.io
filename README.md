# 趣味答题网站 | Interactive Quiz Website

一个功能完整的中文答题网站，支持选择题、判断题，答对后有炫酷的粒子特效和奖励图片！

A fully functional Chinese quiz website with multiple choice and true/false questions, featuring particle effects and reward images!

## ✨ 主要功能 | Features

- 🎮 **答题模式** - 回答选择题和判断题
- ⚙️ **管理模式** - 添加和管理题目及奖励图片
- 🎆 **粒子特效** - 答对时显示炫酷的粒子动画
- 🎁 **奖励系统** - 完成答题后查看奖励图片
- 💾 **数据持久化** - 使用 localStorage 保存数据
- 📱 **响应式设计** - 完美支持手机和电脑
- 🔒 **安全验证** - 防止 XSS 攻击

## 🚀 快速开始 | Quick Start

1. 访问网站 | Visit: https://jokerlevel.github.io
2. 选择答题模式开始答题 | Choose Quiz Mode to start
3. 或选择管理模式添加自己的题目 | Or choose Admin Mode to add your questions

## 📖 使用说明 | Usage

### 答题模式 | Quiz Mode
1. 点击"答题模式"按钮
2. 点击"开始答题"
3. 选择你认为正确的答案
4. 答对会触发粒子特效！
5. 完成后查看你的分数和奖励图片

### 管理模式 | Admin Mode
1. 点击"管理模式"按钮
2. 添加题目：
   - 选择题目类型（选择题/判断题）
   - 输入题目内容
   - 对于选择题，每行输入一个选项，在正确答案前加 `*`
   - 对于判断题，选择正确或错误
3. 管理奖励图片：
   - 输入图片 URL（支持 .jpg, .png, .gif 等）
   - 支持的域名：unsplash.com, pexels.com, pixabay.com

## 🛠️ 技术栈 | Tech Stack

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **JavaScript (ES6+)** - 交互逻辑
- **Canvas API** - 粒子特效
- **LocalStorage** - 数据持久化

## 🔒 安全特性 | Security

- URL 验证防止 XSS 攻击
- 仅允许 HTTP/HTTPS 协议
- 图片扩展名验证
- 可信域名白名单
- 输入清理和验证

## 📁 文件结构 | File Structure

```
.
├── index.html    # 主页面
├── styles.css    # 样式文件
├── script.js     # 脚本文件
└── README.md     # 说明文档
```

## 🎨 自定义 | Customization

你可以通过管理模式自定义：
- 添加自己的题目
- 设置奖励图片
- 所有数据保存在浏览器本地

You can customize through Admin Mode:
- Add your own questions
- Set reward images
- All data saved in browser

## 📝 许可 | License

MIT License - 自由使用和修改 | Free to use and modify

## 🤝 贡献 | Contributing

欢迎提交 Issue 和 Pull Request！
Welcome to submit Issues and Pull Requests!

---

Made with ❤️ by Jokerlevel
