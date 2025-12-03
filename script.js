// 数据存储
let questions = [];
let rewardImages = [];
let currentQuestionIndex = 0;
let score = 0;
let quizActive = false;

// 粒子效果
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 6 - 3;
        this.speedY = Math.random() * 6 - 3;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.life = 100;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 2;
        this.size *= 0.97;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 100;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function createParticles(x, y, count = 50) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateParticles();

// 本地存储
function saveData() {
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
    localStorage.setItem('rewardImages', JSON.stringify(rewardImages));
}

function loadData() {
    const savedQuestions = localStorage.getItem('quizQuestions');
    const savedImages = localStorage.getItem('rewardImages');
    
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
    } else {
        // 默认题目
        questions = [
            {
                type: 'multiple',
                question: '以下哪个是JavaScript的数据类型？',
                options: ['String', 'Number', 'Boolean', '以上都是'],
                correctAnswer: 3
            },
            {
                type: 'boolean',
                question: 'HTML是一种编程语言。',
                correctAnswer: false
            },
            {
                type: 'multiple',
                question: '中国的首都是哪里？',
                options: ['上海', '北京', '广州', '深圳'],
                correctAnswer: 1
            }
        ];
    }
    
    if (savedImages) {
        rewardImages = JSON.parse(savedImages);
    } else {
        // 默认奖励图片
        rewardImages = [
            'https://images.unsplash.com/photo-1513151233558-d860c5398176',
            'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'
        ];
    }
    
    saveData();
}

// 模式切换
function showQuizMode() {
    document.getElementById('mode-selector').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('rewards-section').classList.add('hidden');
}

function showAdminMode() {
    document.getElementById('mode-selector').classList.add('hidden');
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('hidden');
    document.getElementById('rewards-section').classList.add('hidden');
    displayQuestions();
    displayImages();
}

function backToMode() {
    document.getElementById('mode-selector').classList.remove('hidden');
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('rewards-section').classList.add('hidden');
}

// 答题功能
function startQuiz() {
    if (questions.length === 0) {
        alert('暂无题目，请先在管理模式中添加题目！');
        return;
    }
    
    currentQuestionIndex = 0;
    score = 0;
    quizActive = true;
    
    document.getElementById('start-btn').classList.add('hidden');
    document.getElementById('question-container').style.display = 'block';
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('score').textContent = score;
    document.getElementById('total-questions').textContent = questions.length;
    
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = question.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    if (question.type === 'multiple') {
        question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.textContent = option;
            btn.onclick = () => checkAnswer(index);
            optionsContainer.appendChild(btn);
        });
    } else if (question.type === 'boolean') {
        const trueBtn = document.createElement('button');
        trueBtn.className = 'option-btn';
        trueBtn.textContent = '正确';
        trueBtn.onclick = () => checkAnswer(true);
        optionsContainer.appendChild(trueBtn);
        
        const falseBtn = document.createElement('button');
        falseBtn.className = 'option-btn';
        falseBtn.textContent = '错误';
        falseBtn.onclick = () => checkAnswer(false);
        optionsContainer.appendChild(falseBtn);
    }
    
    document.getElementById('next-btn').classList.add('hidden');
}

function checkAnswer(answer) {
    const question = questions[currentQuestionIndex];
    const isCorrect = answer === question.correctAnswer;
    
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => btn.classList.add('disabled'));
    
    if (isCorrect) {
        score++;
        document.getElementById('score').textContent = score;
        
        // 触发粒子效果
        const rect = canvas.getBoundingClientRect();
        createParticles(window.innerWidth / 2, window.innerHeight / 2, 100);
        
        // 标记正确答案
        if (question.type === 'multiple') {
            optionBtns[answer].classList.add('correct');
        } else {
            optionBtns[answer ? 0 : 1].classList.add('correct');
        }
    } else {
        // 标记错误答案和正确答案
        if (question.type === 'multiple') {
            optionBtns[answer].classList.add('wrong');
            optionBtns[question.correctAnswer].classList.add('correct');
        } else {
            optionBtns[answer ? 0 : 1].classList.add('wrong');
            optionBtns[question.correctAnswer ? 0 : 1].classList.add('correct');
        }
    }
    
    document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function showResults() {
    document.getElementById('question-container').style.display = 'none';
    document.getElementById('result-section').classList.remove('hidden');
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('max-score').textContent = questions.length;
    
    const percentage = (score / questions.length) * 100;
    let message = '';
    
    if (percentage === 100) {
        message = '完美！你答对了所有题目！🎉';
    } else if (percentage >= 80) {
        message = '太棒了！你表现得很好！👏';
    } else if (percentage >= 60) {
        message = '不错！继续加油！💪';
    } else {
        message = '再接再厉，下次会更好！📚';
    }
    
    document.getElementById('result-message').textContent = message;
    
    // 答题完成的粒子效果
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createParticles(
                Math.random() * window.innerWidth,
                Math.random() * window.innerHeight,
                30
            );
        }, i * 200);
    }
}

function restartQuiz() {
    startQuiz();
}

function viewRewards() {
    document.getElementById('result-section').classList.add('hidden');
    document.getElementById('rewards-section').classList.remove('hidden');
    
    const gallery = document.getElementById('rewards-gallery');
    gallery.innerHTML = '';
    
    if (rewardImages.length === 0) {
        gallery.innerHTML = '<p style="text-align: center; color: #666;">暂无奖励图片</p>';
    } else {
        rewardImages.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = '奖励图片';
            gallery.appendChild(img);
        });
    }
}

function backToResults() {
    document.getElementById('rewards-section').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');
}

// 管理功能
function updateFormFields() {
    const type = document.getElementById('question-type').value;
    const optionsForm = document.getElementById('options-form');
    const booleanForm = document.getElementById('boolean-form');
    
    if (type === 'multiple') {
        optionsForm.classList.remove('hidden');
        booleanForm.classList.add('hidden');
    } else {
        optionsForm.classList.add('hidden');
        booleanForm.classList.remove('hidden');
    }
}

document.getElementById('question-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const type = document.getElementById('question-type').value;
    const content = document.getElementById('question-content').value.trim();
    
    if (!content) {
        alert('请输入题目内容！');
        return;
    }
    
    const newQuestion = {
        type: type,
        question: content
    };
    
    if (type === 'multiple') {
        const optionsText = document.getElementById('question-options').value.trim();
        if (!optionsText) {
            alert('请输入选项！');
            return;
        }
        
        const lines = optionsText.split('\n').filter(line => line.trim());
        const options = [];
        let correctAnswer = -1;
        
        lines.forEach((line, index) => {
            if (line.startsWith('*')) {
                correctAnswer = index;
                options.push(line.substring(1).trim());
            } else {
                options.push(line.trim());
            }
        });
        
        if (correctAnswer === -1) {
            alert('请在正确答案前添加 * 号！');
            return;
        }
        
        if (options.length < 2) {
            alert('至少需要2个选项！');
            return;
        }
        
        newQuestion.options = options;
        newQuestion.correctAnswer = correctAnswer;
    } else {
        newQuestion.correctAnswer = document.getElementById('boolean-answer').value === 'true';
    }
    
    questions.push(newQuestion);
    saveData();
    displayQuestions();
    
    // 清空表单
    document.getElementById('question-content').value = '';
    document.getElementById('question-options').value = '';
    
    alert('题目添加成功！');
});

function displayQuestions() {
    const display = document.getElementById('questions-display');
    display.innerHTML = '';
    
    if (questions.length === 0) {
        display.innerHTML = '<p style="text-align: center; color: #666;">暂无题目</p>';
        return;
    }
    
    questions.forEach((q, index) => {
        const item = document.createElement('div');
        item.className = 'question-item';
        
        let content = `
            <h4>题目 ${index + 1}: ${q.question}</h4>
            <p><strong>类型:</strong> ${q.type === 'multiple' ? '选择题' : '判断题'}</p>
        `;
        
        if (q.type === 'multiple') {
            content += '<p><strong>选项:</strong></p><ul>';
            q.options.forEach((opt, i) => {
                const mark = i === q.correctAnswer ? ' ✓' : '';
                content += `<li>${opt}${mark}</li>`;
            });
            content += '</ul>';
        } else {
            content += `<p><strong>答案:</strong> ${q.correctAnswer ? '正确' : '错误'}</p>`;
        }
        
        item.innerHTML = content;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.onclick = () => deleteQuestion(index);
        item.appendChild(deleteBtn);
        
        display.appendChild(item);
    });
}

function deleteQuestion(index) {
    if (confirm('确定要删除这道题目吗？')) {
        questions.splice(index, 1);
        saveData();
        displayQuestions();
    }
}

function addRewardImage() {
    const url = document.getElementById('image-url').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }
    
    rewardImages.push(url);
    saveData();
    displayImages();
    
    document.getElementById('image-url').value = '';
    alert('图片添加成功！');
}

function displayImages() {
    const display = document.getElementById('images-display');
    display.innerHTML = '';
    
    if (rewardImages.length === 0) {
        display.innerHTML = '<p style="text-align: center; color: #666;">暂无奖励图片</p>';
        return;
    }
    
    rewardImages.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'image-item';
        
        const img = document.createElement('img');
        img.src = url;
        img.alt = `奖励图片 ${index + 1}`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'image-delete-btn';
        deleteBtn.textContent = '删除';
        deleteBtn.onclick = () => deleteImage(index);
        
        item.appendChild(img);
        item.appendChild(deleteBtn);
        display.appendChild(item);
    });
}

function deleteImage(index) {
    if (confirm('确定要删除这张图片吗？')) {
        rewardImages.splice(index, 1);
        saveData();
        displayImages();
    }
}

// 初始化
loadData();
