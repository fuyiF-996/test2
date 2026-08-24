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
        window.location.href = '/gallery/';
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
document.addEventListener('DOMContentLoaded', init);
