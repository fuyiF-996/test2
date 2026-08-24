/**
 * 幸运抛硬币 - 主脚本
 * 功能：
 * 1. 根据输入数字生成对应数量的硬币。
 * 2. 特定数字可跳转到彩蛋页面（不对外提示）。
 * 3. 输入任意正整数 N 时，N 枚硬币同时进行抛掷动画并显示正反面结果。
 * 4. 对无效输入给出友好提示。
 */

// ============================
// 配置常量
// ============================
const SAKURA_CODE = 1314;
const MAX_COINS = 50;
const ROMANTIC_POEM = '一生一世，樱你而来。';
const MUSIC_FILE = '樋口秀樹、柳英一朗、西坂恭平 - Endless Story.mp3';
const MUSIC_URL = '/music/' + encodeURIComponent(MUSIC_FILE);

// ============================
// DOM 元素引用
// ============================
const coinStage = document.getElementById('coinStage');
const numberInput = document.getElementById('numberInput');
const flipBtn = document.getElementById('flipBtn');
const messageBox = document.getElementById('messageBox');
const resultArea = document.getElementById('resultArea');
const resultStats = document.getElementById('resultStats');
const resultChart = document.getElementById('resultChart');
const galleryFrame = document.getElementById('galleryFrame');

// ============================
// 状态
// ============================
let coins = []; // 每枚硬币：{ element, rotation, side }

// ============================
// 初始化
// ============================
function init() {
    renderCoins(1);

    flipBtn.addEventListener('click', handleSubmit);
    numberInput.addEventListener('keydown', (e) => {
        if (e.code === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    });

    // 监听 iframe 内返回按钮发送的消息
    window.addEventListener('message', handleGalleryMessage);

    // 处理浏览器前进/后退按钮
    window.addEventListener('popstate', handlePopState);

    // 初始化实用小工具面板
    initTools();
}

// ============================
// 渲染指定数量的硬币
// ============================
function renderCoins(count) {
    coinStage.innerHTML = '';
    coins = [];

    for (let i = 0; i < count; i++) {
        const coin = document.createElement('div');
        coin.className = 'coin';

        const front = document.createElement('div');
        front.className = 'coin-face coin-front';
        front.textContent = '正';

        const back = document.createElement('div');
        back.className = 'coin-face coin-back';
        back.textContent = '反';

        coin.appendChild(front);
        coin.appendChild(back);
        coinStage.appendChild(coin);

        coins.push({ element: coin, rotation: 0, side: 'front' });
    }
}

// ============================
// 抛硬币动画
// ============================
function flipCoins(count) {
    // 数量变化时重新渲染，保证展示区始终与输入一致
    if (coins.length !== count) {
        renderCoins(count);
    }

    // 等待下一帧再应用 transform，确保新创建的硬币也能播放过渡动画
    requestAnimationFrame(() => {
        coins.forEach((coin) => {
            const targetSide = Math.random() < 0.5 ? 'front' : 'back';
            const spins = 3 + Math.floor(Math.random() * 3); // 3 ~ 5 圈
            const sideDelta = targetSide !== coin.side ? 180 : 0;

            coin.rotation += spins * 360 + sideDelta;
            coin.side = targetSide;
            coin.element.style.transform = `rotateY(${coin.rotation}deg)`;
        });

        renderResult();
    });
}

// ============================
// 渲染结果统计与饼图
// ============================
function renderResult() {
    let frontCount = 0;
    let backCount = 0;

    coins.forEach((coin) => {
        if (coin.side === 'front') {
            frontCount++;
        } else {
            backCount++;
        }
    });

    const total = frontCount + backCount;
    if (total === 0) return;

    const frontPercent = (frontCount / total) * 100;
    const backPercent = 100 - frontPercent;

    resultArea.classList.add('show');

    resultStats.innerHTML = `
        <div class="stat-item">
            <div class="stat-value front">${frontCount}</div>
            <div class="stat-label">正面</div>
        </div>
        <div class="stat-item">
            <div class="stat-value back">${backCount}</div>
            <div class="stat-label">反面</div>
        </div>
    `;

    const pieChart = document.createElement('div');
    pieChart.className = 'pie-chart';
    pieChart.style.background = `conic-gradient(#ffb347 0% ${frontPercent}%, #c0c0c0 ${frontPercent}% 100%)`;

    resultChart.innerHTML = '';
    resultChart.appendChild(pieChart);
    resultChart.insertAdjacentHTML('beforeend', `
        <div class="chart-legend">
            <div class="legend-item">
                <span class="legend-dot front"></span>
                正面 ${frontPercent.toFixed(1)}%
            </div>
            <div class="legend-item">
                <span class="legend-dot back"></span>
                反面 ${backPercent.toFixed(1)}%
            </div>
        </div>
    `);
}

// ============================
// 浪漫过渡动画：樱花雨 + 诗句 + 光晕跳转
// ============================
function startRomanticTransition() {
    // 禁用交互，隐藏普通结果与提示
    numberInput.disabled = true;
    flipBtn.disabled = true;
    hideMessage();
    resultArea.classList.remove('show');
    document.body.classList.add('is-transitioning');

    // 播放浪漫背景音乐（用户点击按钮后触发，符合浏览器自动播放策略）
    playRomanticMusic();

    // 利用动画时间预加载一张樱花图，跳转后可直接显示
    preloadGalleryImage();

    // 创建全屏过渡容器
    const overlay = document.createElement('div');
    overlay.className = 'romantic-overlay';

    // 创建诗句元素
    const poem = document.createElement('div');
    poem.className = 'romantic-poem';
    poem.textContent = ROMANTIC_POEM;
    overlay.appendChild(poem);

    // 创建最终光晕覆盖层
    const whitewash = document.createElement('div');
    whitewash.className = 'romantic-whitewash';
    overlay.appendChild(whitewash);

    document.body.appendChild(overlay);

    // 强制重排后添加 show 类，触发 CSS 过渡
    void overlay.offsetWidth;
    overlay.classList.add('show');

    // 启动密集樱花雨
    const petalInterval = setInterval(() => {
        createTransitionPetal(overlay);
    }, 80);

    // 时序控制
    setTimeout(() => {
        poem.classList.add('show');
    }, 100);

    setTimeout(() => {
        whitewash.classList.add('show');
    }, 3600);

    setTimeout(() => {
        clearInterval(petalInterval);
        showGalleryFrame();
    }, 4800);
}

/**
 * 创建一片过渡樱花花瓣
 */
function createTransitionPetal(container) {
    const petal = document.createElement('div');
    petal.className = 'romantic-petal';

    const size = Math.random() * 14 + 8;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;

    const startLeft = Math.random() * 120 - 10;
    petal.style.left = `${startLeft}%`;

    const duration = Math.random() * 4 + 4;
    petal.style.animationDuration = `${duration}s`;

    petal.style.opacity = Math.random() * 0.4 + 0.5;
    petal.style.animationDelay = `${Math.random() * 2}s`;

    const hue = Math.floor(Math.random() * 30) + 330;
    petal.style.background = `linear-gradient(135deg, hsl(${hue}, 90%, 88%), hsl(${hue}, 80%, 95%))`;

    container.appendChild(petal);
}

// ============================
// 通过 iframe 展示樱花图集（保持音乐连续播放）
// ============================
function showGalleryFrame() {
    // 清理过渡动画遮罩，避免遮挡 iframe 内容
    document.querySelector('.romantic-overlay')?.remove();

    galleryFrame.src = '/gallery/';
    galleryFrame.classList.add('show');
    document.body.classList.add('gallery-active');

    // 更新地址栏为 /gallery/，支持刷新和分享
    history.pushState({ view: 'gallery' }, '', '/gallery/');
}

function hideGalleryFrame() {
    galleryFrame.classList.remove('show');
    document.body.classList.remove('gallery-active');
    galleryFrame.src = 'about:blank';

    // 恢复硬币页交互
    numberInput.disabled = false;
    flipBtn.disabled = false;
    document.body.classList.remove('is-transitioning');
}

function handleGalleryMessage(event) {
    // 只响应同域 iframe 发来的返回消息
    if (event.origin !== window.location.origin) return;
    if (event.data === 'navigate-back') {
        history.back();
    }
}

function handlePopState() {
    if (history.state && history.state.view === 'gallery') {
        galleryFrame.classList.add('show');
        document.body.classList.add('gallery-active');
    } else {
        hideGalleryFrame();
    }
}

// ============================
// 播放浪漫背景音乐
// ============================
function playRomanticMusic() {
    const audio = document.createElement('audio');
    audio.src = MUSIC_URL;
    audio.volume = 0.3;
    audio.loop = true;
    audio.style.display = 'none';
    document.body.appendChild(audio);

    audio.play().catch((error) => {
        console.warn('[提示] 音乐自动播放被浏览器阻止:', error);
    });
}

// ============================
// 预加载樱花图集图片
// ============================
function preloadGalleryImage() {
    fetch('/images.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error('获取图片列表失败');
            }
            return response.json();
        })
        .then((data) => {
            const images = data.images || [];
            if (images.length === 0) return;

            // 随机选一张预加载，跳转后 gallery 会优先展示这张图
            const preloadedImage = images[Math.floor(Math.random() * images.length)];
            sessionStorage.setItem('preloadedImage', preloadedImage);

            const img = new Image();
            img.src = '/图片tr/' + encodeURIComponent(preloadedImage);
        })
        .catch((error) => {
            console.warn('[提示] 预加载图片失败:', error);
        });
}

// ============================
// 处理用户提交
// ============================
function handleSubmit() {
    const raw = numberInput.value.trim();

    if (raw === '') {
        showMessage('请先输入一个数字哦', 'error');
        return;
    }

    const num = Number(raw);

    if (!Number.isInteger(num) || Number.isNaN(num)) {
        showMessage('请输入有效的正整数', 'error');
        return;
    }

    if (num === SAKURA_CODE) {
        startRomanticTransition();
        return;
    }

    if (num <= 0) {
        showMessage('请输入正整数', 'error');
        return;
    }

    let count = num;
    if (count > MAX_COINS) {
        count = MAX_COINS;
        showMessage(`一次最多抛 ${MAX_COINS} 枚硬币，已自动为你调整`, 'info');
    } else {
        hideMessage();
    }

    flipCoins(count);
}

// ============================
// 提示信息
// ============================
function showMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = 'show ' + type;
}

function hideMessage() {
    messageBox.className = '';
    messageBox.textContent = '';
}

// ============================
// 页面加载完成后启动
// ============================
// ============================
// 实用小工具面板
// ============================

// 倒计时器状态
let countdownTarget = 0;
let countdownRemaining = 0;
let countdownInterval = null;
let countdownRunning = false;

function initTools() {
    const toolsToggle = document.getElementById('toolsToggle');
    const toolsContent = document.getElementById('toolsContent');
    const toolsArrow = document.getElementById('toolsArrow');

    if (!toolsToggle || !toolsContent) return;

    toolsToggle.addEventListener('click', () => {
        const isExpanded = toolsContent.classList.toggle('show');
        toolsToggle.setAttribute('aria-expanded', String(isExpanded));
        toolsContent.setAttribute('aria-hidden', String(!isExpanded));
        toolsArrow.textContent = isExpanded ? '▲' : '▼';
    });

    // 倒计时器
    document.getElementById('countdownStart').addEventListener('click', handleCountdownStart);
    document.getElementById('countdownPause').addEventListener('click', handleCountdownPause);
    document.getElementById('countdownReset').addEventListener('click', handleCountdownReset);

    // YES / NO
    document.getElementById('yesNoBtn').addEventListener('click', handleYesNo);

    // 随机数字
    document.getElementById('randomNumBtn').addEventListener('click', handleRandomNumber);

    // BMI 计算器
    document.getElementById('bmiCalcBtn').addEventListener('click', handleBMI);
}

/**
 * 在工具结果区显示结果，并支持类型样式
 */
function showToolResult(element, text, type = 'default') {
    element.textContent = text;
    element.className = 'tool-result show ' + type;

    // 移除动画类，强制重排后再添加，触发重新淡入
    element.classList.remove('show');
    void element.offsetWidth;
    element.classList.add('show');
}

// ============================
// 倒计时器
// ============================
function handleCountdownStart() {
    const minInput = document.getElementById('countdownMin');
    const secInput = document.getElementById('countdownSec');
    const display = document.getElementById('countdownDisplay');
    const result = document.getElementById('countdownResult');

    if (!countdownRunning) {
        // 如果没有剩余时间（已结束或被重置），重新读取输入
        if (countdownRemaining <= 0) {
            const minutes = Math.max(0, Number(minInput.value) || 0);
            const seconds = Math.max(0, Math.min(59, Number(secInput.value) || 0));
            countdownRemaining = (minutes * 60 + seconds) * 1000;
        }

        if (countdownRemaining <= 0) {
            showToolResult(result, '请输入有效的时间', 'warning');
            return;
        }

        countdownTarget = Date.now() + countdownRemaining;
        countdownRunning = true;
        showToolResult(result, '倒计时进行中...', 'default');

        countdownInterval = setInterval(() => {
            const left = countdownTarget - Date.now();
            if (left <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                countdownRunning = false;
                countdownRemaining = 0;
                display.textContent = '00:00';
                showToolResult(result, '时间到！', 'success');
            } else {
                countdownRemaining = left;
                display.textContent = formatCountdown(left);
            }
        }, 100);
    }
}

function handleCountdownPause() {
    if (countdownRunning && countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        countdownRunning = false;
        countdownRemaining = Math.max(0, countdownTarget - Date.now());

        const result = document.getElementById('countdownResult');
        showToolResult(result, '已暂停', 'warning');
    }
}

function handleCountdownReset() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    countdownRunning = false;
    countdownRemaining = 0;

    const minInput = document.getElementById('countdownMin');
    const secInput = document.getElementById('countdownSec');
    const display = document.getElementById('countdownDisplay');
    const result = document.getElementById('countdownResult');

    const minutes = Math.max(0, Number(minInput.value) || 0);
    const seconds = Math.max(0, Math.min(59, Number(secInput.value) || 0));
    display.textContent = formatCountdown((minutes * 60 + seconds) * 1000);
    result.textContent = '';
    result.className = 'tool-result';
}

function formatCountdown(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// YES / NO
function handleYesNo() {
    const result = document.getElementById('yesNoResult');
    const answers = [
        { text: '是', type: 'success' },
        { text: '否', type: 'danger' },
        { text: '再想想', type: 'warning' }
    ];
    const answer = answers[Math.floor(Math.random() * answers.length)];
    showToolResult(result, answer.text, answer.type);
}

// 随机数字
function handleRandomNumber() {
    const minInput = document.getElementById('randomMin');
    const maxInput = document.getElementById('randomMax');
    const result = document.getElementById('randomNumResult');

    const min = Number(minInput.value);
    const max = Number(maxInput.value);

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
        showToolResult(result, '请输入有效整数', 'warning');
        return;
    }

    if (min > max) {
        showToolResult(result, '最小值不能大于最大值', 'warning');
        return;
    }

    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    showToolResult(result, `结果：${num}`, 'success');
}

// BMI 计算器
function handleBMI() {
    const heightInput = document.getElementById('bmiHeight');
    const weightInput = document.getElementById('bmiWeight');
    const result = document.getElementById('bmiResult');

    const height = Number(heightInput.value);
    const weight = Number(weightInput.value);

    if (!height || !weight || height <= 0 || weight <= 0) {
        showToolResult(result, '请输入有效的身高和体重', 'warning');
        return;
    }

    const bmi = weight / ((height / 100) ** 2);
    const value = bmi.toFixed(1);

    let category = '';
    let type = 'success';
    if (bmi < 18.5) {
        category = '偏瘦';
        type = 'warning';
    } else if (bmi < 24) {
        category = '正常';
        type = 'success';
    } else if (bmi < 28) {
        category = '偏胖';
        type = 'warning';
    } else {
        category = '肥胖';
        type = 'danger';
    }

    showToolResult(result, `BMI：${value} ${category}`, type);
}

document.addEventListener('DOMContentLoaded', init);
