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
const ASSET_VERSION = '20260824-5';
const ROMANTIC_POEM = '一生一世，樱你而来。';
const MUSIC_FILE = '樋口秀樹、柳英一朗、西坂恭平 - Endless Story.mp3';
const MUSIC_URL = '/music/' + encodeURIComponent(MUSIC_FILE) + '?v=' + ASSET_VERSION;

// 今日运势配置
const FORTUNE_COOLDOWN = 5 * 60 * 1000; // 5 分钟
const FORTUNE_STORAGE_KEY = 'lastFortuneTime';
const FORTUNE_DATA = [
    // 大吉（8 组）
    {
        level: '大吉',
        intro: '福星相伴，诸事顺遂，心中所想多有回响，适合推进重要计划。',
        good: ['洽谈沟通', '学习新知识', '整理收纳', '出门散心', '与人分享', '敲定计划', '创作构思'],
        bad: ['冲动大额消费', '与人争执', '熬夜透支身体', '随意爽约'],
        tip: '多和熟人交流，容易收获利好消息，浅色穿搭有助提升气场。'
    },
    {
        level: '大吉',
        intro: '机遇浮现，阻碍消散，行动力更容易带来满意结果。',
        good: ['开工行动', '提交方案', '短途出行', '结交新朋友', '运动锻炼', '规划储蓄'],
        bad: ['拖延搁置要事', '轻信陌生邀约', '盲目跟风投资'],
        tip: '上午时段办事成功率更高。'
    },
    {
        level: '大吉',
        intro: '灵感充沛，思路清晰，创作、思考类事务极易出彩。',
        good: ['写代码 / 文案', '画画设计', '复盘总结', '阅读学习', '整理资料'],
        bad: ['反复纠结小事', '临时推翻完整方案', '长时间独处内耗'],
        tip: '随手记录灵感，避免转瞬遗忘。'
    },
    {
        level: '大吉',
        intro: '贵人运旺盛，容易得到他人帮助与谅解。',
        good: ['求助他人', '协商和解', '拜访亲友', '组队合作', '主动表达想法'],
        bad: ['固执己见', '逞强硬扛', '言语冒犯他人'],
        tip: '待人温和有礼，好运更容易延续。'
    },
    {
        level: '大吉',
        intro: '收支平稳向好，利于规划资产。',
        good: ['记账理财', '选购刚需物品', '回款对账', '制定存钱计划'],
        bad: ['冲动购买奢侈品', '借贷担保', '参与不明理财项目'],
        tip: '守住预算，会有意外小额收获。'
    },
    {
        level: '大吉',
        intro: '情绪安稳，心态松弛，适合维系感情。',
        good: ['陪伴亲友', '聊天谈心', '约会见面', '表达心意'],
        bad: ['冷暴力', '翻旧账', '口无遮拦'],
        tip: '真诚沟通，很多误会能够顺利化解。'
    },
    {
        level: '大吉',
        intro: '难题迎来转机，长久困扰之事有望找到解法。',
        good: ['尝试新方案', '调试项目', '排查问题', '请教前辈'],
        bad: ['直接摆烂放弃', '情绪化处理故障'],
        tip: '换个思路，僵局很快打破。'
    },
    {
        level: '大吉',
        intro: '身心舒畅，精力充足，适合拓展爱好。',
        good: ['尝试新爱好', '练习乐器', '摄影采风', '散步郊游'],
        bad: ['过度劳累', '暴饮暴食', '封闭自己'],
        tip: '接触新鲜事物会带来好心情。'
    },

    // 中吉（8 组）
    {
        level: '中吉',
        intro: '整体平稳向好，稳步推进即可，不宜急于求成。',
        good: ['按计划完成任务', '轻度社交', '居家休整', '资料备份'],
        bad: ['仓促做重大决定', '冒险尝试陌生项目', '超负荷工作'],
        tip: '稳扎稳打，不要追求一步到位。'
    },
    {
        level: '中吉',
        intro: '小有收获，适合沉淀积累，厚积薄发。',
        good: ['技能练习', '刷题进修', '备份文件', '整理图库'],
        bad: ['急于展示成果', '攀比比较', '急于求回报'],
        tip: '今日重在积累，收益会延后显现。'
    },
    {
        level: '中吉',
        intro: '沟通顺畅，适合对接事务，但重大合约建议延后敲定。',
        good: ['线上交流', '咨询问题', '交换意见', '简单协作'],
        bad: ['签订长期重大合同', '口头许诺重要承诺'],
        tip: '重要内容尽量留存文字记录。'
    },
    {
        level: '中吉',
        intro: '财运尚可，适合刚需采购，不适合投机。',
        good: ['购置必需品', '对比商品价格', '清理闲置物品'],
        bad: ['短线投机', '抽奖大额投入', '借钱给他人'],
        tip: '理性消费，避开营销套路。'
    },
    {
        level: '中吉',
        intro: '人际温和，适合浅层社交，不适合深度交心谈判。',
        good: ['聚会闲聊', '线上互动', '礼貌往来'],
        bad: ['争论对错', '深度吐露秘密', '求人办大事'],
        tip: '保持分寸感，相处更加舒适。'
    },
    {
        level: '中吉',
        intro: '适合调试、优化已有项目，不适合从零开荒。',
        good: ['修改代码', '优化页面', '修复 bug', '润色文案'],
        bad: ['立刻启动全新大型项目', '大规模重构'],
        tip: '优化现有内容，收益更高。'
    },
    {
        level: '中吉',
        intro: '健康平稳，适合轻度运动调养。',
        good: ['拉伸散步', '清淡饮食', '早睡休养'],
        bad: ['剧烈透支运动', '重油重盐饮食', '熬夜'],
        tip: '多喝水，减少身体负担。'
    },
    {
        level: '中吉',
        intro: '等待之事慢慢推进，耐心等候反馈。',
        good: ['持续跟进进度', '定期查看消息', '做好备选方案'],
        bad: ['反复催促他人', '频繁追问结果'],
        tip: '给对方一点时间，反馈终将到来。'
    },

    // 吉（8 组）
    {
        level: '吉',
        intro: '运势平顺，日常事务大多可以顺利完成，无明显阻碍。',
        good: ['处理日常琐事', '例行工作', '文件归档', '日常学习'],
        bad: ['高风险尝试', '临时更改全盘计划'],
        tip: '按日常节奏走，平安顺遂。'
    },
    {
        level: '吉',
        intro: '适合独处深耕，安静环境更容易发挥实力。',
        good: ['独立完成任务', '自学研究', '安静创作'],
        bad: ['嘈杂环境下做重要决策', '多人仓促合作'],
        tip: '减少无效社交，专注自身效率更高。'
    },
    {
        level: '吉',
        intro: '适合整理、收纳、清理冗余内容。',
        good: ['清理电脑文件', '整理图片素材', '打扫房间', '删除无用资料'],
        bad: ['误删重要备份', '随意丢弃关键文件'],
        tip: '清理前做好备份，断舍离提升状态。'
    },
    {
        level: '吉',
        intro: '适合休闲放松，调节身心压力。',
        good: ['观看影片', '浏览图集', '听歌放松', '短暂休憩'],
        bad: ['沉迷娱乐耽误正事', '长时间久坐不动'],
        tip: '劳逸结合，娱乐适度。'
    },
    {
        level: '吉',
        intro: '小事易得圆满，大事建议择他日推进。',
        good: ['处理细碎小事', '回复消息', '预约登记'],
        bad: ['签约', '投资', '重大抉择'],
        tip: '今日适合处理琐事，重大事项延后更佳。'
    },
    {
        level: '吉',
        intro: '出行平顺，短途通勤无碍。',
        good: ['日常通勤', '短距离出行', '取件办事'],
        bad: ['长途远行', '自驾去往陌生偏远地区'],
        tip: '出门留意随身物品，避免遗失。'
    },
    {
        level: '吉',
        intro: '适合复盘反思，总结过往得失。',
        good: ['写总结', '回顾项目', '反思不足', '制定短期规划'],
        bad: ['过度自我否定', '陷入负面情绪'],
        tip: '反思是为了优化，不必苛责自己。'
    },
    {
        level: '吉',
        intro: '人际关系平淡安稳，少有矛盾摩擦。',
        good: ['礼貌往来', '简单交流', '保持距离友好相处'],
        bad: ['挑起争端', '打探他人隐私'],
        tip: '保持友善，低调度日。'
    },

    // 平（8 组）
    {
        level: '平',
        intro: '运势中等，好坏取决于自身选择，谨慎行事则无大碍。',
        good: ['维持原有节奏', '保守行事', '观望局势'],
        bad: ['激进冒险', '随意改变路线', '跟风行动'],
        tip: '遇事三思，不要冲动做决定。'
    },
    {
        level: '平',
        intro: '机遇与小阻碍并存，成败在于细节把控。',
        good: ['仔细核对文件', '检查代码', '反复确认信息'],
        bad: ['粗心大意', '忽略报错', '直接交付成果'],
        tip: '多一遍检查，规避踩坑。'
    },
    {
        level: '平',
        intro: '收支持平，无大额进账也无意外破财。',
        good: ['正常消费', '按需购物', '记录开销'],
        bad: ['大额支出', '超前消费', '冲动囤货'],
        tip: '守住收支平衡即可。'
    },
    {
        level: '平',
        intro: '沟通有轻微误会风险，表达尽量简洁直白。',
        good: ['文字留存沟通记录', '说话放缓语速'],
        bad: ['含糊表达', '情绪化发言', '线上吵架'],
        tip: '容易产生理解偏差，重要内容确认两遍。'
    },
    {
        level: '平',
        intro: '适合观望，不要主动推进新计划。',
        good: ['收集资料', '调研参考', '观察局势'],
        bad: ['主动启动新项目', '主动发起谈判'],
        tip: '先收集信息，择机而动。'
    },
    {
        level: '平',
        intro: '精力普通，不适合高强度工作。',
        good: ['完成轻量任务', '分段工作', '定时休息'],
        bad: ['通宵赶工', '长时间高强度用脑'],
        tip: '拆分任务，避免疲劳堆积。'
    },
    {
        level: '平',
        intro: '结果好坏参半，做好两种心理准备。',
        good: ['准备备选方案', '预留容错空间'],
        bad: ['孤注一掷，只规划单一方案'],
        tip: '预留退路，就算结果不如意也可应对。'
    },
    {
        level: '平',
        intro: '人际平淡，无贵人相助，也无小人干扰。',
        good: ['独善其身', '专注自己的事务'],
        bad: ['过度依赖他人帮助', '卷入别人的纠纷'],
        tip: '凡事依靠自己，少掺和他人私事。'
    },

    // 凶（8 组）
    {
        level: '凶',
        intro: '阻碍较多，容易出现失误、疏漏，宜守不宜攻。',
        good: ['保守观望', '保存备份', '简单休整', '推迟重大行动'],
        bad: ['启动新项目', '签约交易', '大额投资', '长途远行'],
        tip: '今日适合防守，任何重大决策尽量延后。'
    },
    {
        level: '凶',
        intro: '容易沟通误会，口舌摩擦概率上升。',
        good: ['少争辩', '减少发言', '文字谨慎编辑'],
        bad: ['与人吵架', '线上对线', '发表激进言论'],
        tip: '少说多做，避免祸从口出。'
    },
    {
        level: '凶',
        intro: '财物易有损耗，谨防遗失、冲动消费。',
        good: ['保管贵重物品', '减少购物', '核对账单'],
        bad: ['借钱给别人', '参与抽奖博彩', '购置贵重物品'],
        tip: '看好随身设备，避免丢件、损坏。'
    },
    {
        level: '凶',
        intro: '精力不济，容易出错、遗漏细节。',
        good: ['休息静养', '暂缓复杂任务', '反复校验文件'],
        bad: ['赶工交付', '编写重要上线代码', '提交关键方案'],
        tip: '复杂工作尽量延后，避免 bug 和失误。'
    },
    {
        level: '凶',
        intro: '合作容易产生分歧，不适合组队协作。',
        good: ['独立处理简单事务', '独自休整'],
        bad: ['组队开发', '合伙交易', '协商合作事宜'],
        tip: '尽量单独行动，减少协作矛盾。'
    },
    {
        level: '凶',
        intro: '出行易遇延误、故障，尽量减少外出。',
        good: ['居家办公', '线上处理事务'],
        bad: ['长途出行', '自驾远行', '外出赴约'],
        tip: '非必要不出门，出门预留充足缓冲时间。'
    },
    {
        level: '凶',
        intro: '情绪容易低落烦躁，内耗加重。',
        good: ['独处静心', '听舒缓音乐', '减少社交'],
        bad: ['深夜胡思乱想', '和他人倾诉负面情绪'],
        tip: '避免熬夜，防止情绪进一步恶化。'
    },
    {
        level: '凶',
        intro: '计划容易临时变动，变数较大。',
        good: ['灵活调整预期', '不要定下硬性目标'],
        bad: ['敲定不可更改的约定', '预定长期安排'],
        tip: '做好计划被打乱的心理准备。'
    }
];

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

    galleryFrame.src = '/gallery/?v=' + ASSET_VERSION;
    galleryFrame.classList.add('show');
    document.body.classList.add('gallery-active');

    // 更新地址栏为 /gallery/，支持刷新和分享
    history.pushState({ view: 'gallery' }, '', '/gallery/?v=' + ASSET_VERSION);
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
    fetch('/images.json?v=' + ASSET_VERSION)
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

    // 今日运势
    document.getElementById('fortuneBtn').addEventListener('click', handleFortune);
    updateFortuneButtonState();
    setInterval(updateFortuneButtonState, 1000);

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
// 今日运势
// ============================
function handleFortune() {
    const now = Date.now();
    const lastTime = Number(localStorage.getItem(FORTUNE_STORAGE_KEY) || 0);
    const cooldownEl = document.getElementById('fortuneCooldown');

    if (lastTime && now - lastTime < FORTUNE_COOLDOWN) {
        const remaining = FORTUNE_COOLDOWN - (now - lastTime);
        cooldownEl.textContent = `请 ${formatFortuneCooldown(remaining)} 后再试`;
        return;
    }

    const fortune = FORTUNE_DATA[Math.floor(Math.random() * FORTUNE_DATA.length)];
    const resultEl = document.getElementById('fortuneResult');

    resultEl.innerHTML = `
        <div class="fortune-level ${fortune.level}">${fortune.level}</div>
        <div class="fortune-intro">${fortune.intro}</div>
        <div class="fortune-section fortune-good">
            <strong>宜</strong>
            <ul>${fortune.good.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="fortune-section fortune-bad">
            <strong>忌</strong>
            <ul>${fortune.bad.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <div class="fortune-tip">💡 小贴士：${fortune.tip}</div>
    `;

    // 触发淡入显示
    resultEl.classList.remove('show');
    void resultEl.offsetWidth;
    resultEl.classList.add('show');

    cooldownEl.textContent = '';
    localStorage.setItem(FORTUNE_STORAGE_KEY, now.toString());
    updateFortuneButtonState();
}

function updateFortuneButtonState() {
    const btn = document.getElementById('fortuneBtn');
    const cooldownEl = document.getElementById('fortuneCooldown');
    if (!btn || !cooldownEl) return;

    const now = Date.now();
    const lastTime = Number(localStorage.getItem(FORTUNE_STORAGE_KEY) || 0);

    if (lastTime && now - lastTime < FORTUNE_COOLDOWN) {
        const remaining = FORTUNE_COOLDOWN - (now - lastTime);
        btn.disabled = true;
        btn.classList.add('disabled');
        btn.textContent = '冷却中';
        cooldownEl.textContent = `请 ${formatFortuneCooldown(remaining)} 后再试`;
    } else {
        btn.disabled = false;
        btn.classList.remove('disabled');
        btn.textContent = '抽取运势';
        cooldownEl.textContent = '';
    }
}

function formatFortuneCooldown(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        return `${minutes} 分 ${String(seconds).padStart(2, '0')} 秒`;
    }
    return `${seconds} 秒`;
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
