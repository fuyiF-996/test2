/**
 * 樱花图集 - 主脚本
 * 功能：
 * 1. 通过 /api/images 接口获取图片列表
 * 2. 随机展示图片并支持下载
 * 3. 樱花飘落动画
 * 4. 鼠标点击水波纹动画
 */

// ============================
// 全局状态
// ============================
let imageList = [];       // 图片文件名数组
let currentIndex = -1;    // 当前展示图片的索引
let isLoading = false;    // 是否正在加载图片

// 图片文件夹在服务器上的静态资源路径。
// Cloudflare Pages 可能从仓库根目录发布，本地 Express 则映射到 /images。
let imageBaseUrl = '/images';

// ============================
// DOM 元素引用
// ============================
const mainImage = document.getElementById('mainImage');
const imageLoader = document.getElementById('imageLoader');
const imageCounter = document.getElementById('imageCounter');
const btnRandom = document.getElementById('btnRandom');
const btnDownload = document.getElementById('btnDownload');
const sakuraContainer = document.getElementById('sakuraContainer');

// ============================
// 初始化入口
// ============================
async function init() {
    // 启动樱花飘落
    startSakuraFall();

    // 绑定按钮事件
    btnRandom.addEventListener('click', handleRandomClick);
    btnDownload.addEventListener('click', handleDownloadClick);

    // 绑定全局点击水波纹
    document.addEventListener('click', createRipple);

    // 键盘快捷键：空格随机，回车下载
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleRandomClick();
        } else if (e.code === 'Enter') {
            handleDownloadClick();
        }
    });

    // 获取图片列表
    await loadImageList();
}

// ============================
// 图片列表加载
// ============================
async function loadImageList() {
    try {
        const data = await fetchImageManifest();
        imageList = data.images || [];

        if (imageList.length === 0) {
            showError('图片文件夹为空，请先放入图片。');
            return;
        }

        // 首次加载随机展示一张
        showRandomImage();
        updateCounter();
    } catch (error) {
        console.error('加载图片列表失败:', error);
        showError('无法读取图片目录，请通过 node express.js 启动本地服务。');
    }
}

async function fetchImageManifest() {
    const manifestSources = [
        { url: '/images.json', imageBaseUrl: '/图片tr' },
        { url: '/public/images.json', imageBaseUrl: '/public/图片tr' },
        { url: '/api/images', imageBaseUrl: '/images' }
    ];

    for (const source of manifestSources) {
        try {
            const response = await fetch(source.url);
            const contentType = response.headers.get('content-type') || '';

            if (!response.ok || !contentType.includes('application/json')) {
                continue;
            }

            imageBaseUrl = source.imageBaseUrl;
            return await response.json();
        } catch (error) {
            console.warn(`[提示] 无法读取 ${source.url}:`, error);
        }
    }

    throw new Error('无法读取图片清单');
}

// ============================
// 图片展示逻辑
// ============================
function showRandomImage() {
    if (imageList.length === 0 || isLoading) return;

    // 随机选择一张，尽量避免连续抽到同一张
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * imageList.length);
    } while (imageList.length > 1 && newIndex === currentIndex);

    currentIndex = newIndex;
    const imageName = imageList[currentIndex];
    const imageUrl = `${imageBaseUrl}/${encodeURIComponent(imageName)}`;

    loadImage(imageUrl);
    updateCounter();
}

/**
 * 加载单张图片，带淡入效果
 * @param {string} url 图片地址
 */
function loadImage(url) {
    isLoading = true;
    mainImage.classList.remove('loaded');
    imageLoader.classList.add('show');

    const img = new Image();
    img.src = url;

    img.onload = () => {
        mainImage.src = url;
        mainImage.alt = `图片 ${currentIndex + 1}`;
        // 等 DOM 更新后再添加 loaded 类，触发 CSS 淡入
        requestAnimationFrame(() => {
            mainImage.classList.add('loaded');
            imageLoader.classList.remove('show');
            isLoading = false;
        });
    };

    img.onerror = () => {
        imageLoader.classList.remove('show');
        isLoading = false;
        console.error('图片加载失败:', url);
        // 加载失败时自动换一张
        showRandomImage();
    };
}

// ============================
// 下载当前图片
// ============================
async function handleDownloadClick() {
    if (imageList.length === 0 || currentIndex < 0) return;

    const imageName = imageList[currentIndex];
    const imageUrl = `${imageBaseUrl}/${encodeURIComponent(imageName)}`;

    try {
        // 使用 fetch 获取图片 Blob，再创建临时下载链接
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error('下载失败');

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        // 设置下载文件名
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 释放临时 URL
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('下载图片失败:', error);
        alert('下载失败，请检查网络或本地服务是否正常。');
    }
}

function handleRandomClick() {
    // 添加按钮点击反馈动画
    btnRandom.classList.add('btn-active');
    showRandomImage();
    setTimeout(() => btnRandom.classList.remove('btn-active'), 200);
}

// ============================
// 计数器更新
// ============================
function updateCounter() {
    imageCounter.textContent = `${currentIndex + 1} / ${imageList.length}`;
}

// ============================
// 错误提示
// ============================
function showError(message) {
    mainImage.style.display = 'none';
    imageLoader.textContent = message;
    imageLoader.classList.add('show');
    imageCounter.textContent = '0 / 0';
}

// ============================
// 樱花飘落动画
// ============================
function startSakuraFall() {
    // 每 280 毫秒生成一片花瓣，密度适中不遮挡图片
    const interval = 280;

    setInterval(() => {
        createPetal();
    }, interval);
}

/**
 * 创建单个花瓣元素并设置随机属性
 */
function createPetal() {
    const petal = document.createElement('div');
    petal.classList.add('petal');

    // 随机大小：6px ~ 18px
    const size = Math.random() * 12 + 6;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;

    // 随机水平起始位置：-10% ~ 110%，保证全屏覆盖
    const startLeft = Math.random() * 120 - 10;
    petal.style.left = `${startLeft}%`;

    // 随机飘落时长：6s ~ 12s
    const duration = Math.random() * 6 + 6;
    petal.style.animationDuration = `${duration}s`;

    // 随机透明度层次：0.5 ~ 0.9
    petal.style.opacity = Math.random() * 0.4 + 0.5;

    // 随机延迟：让动画更自然
    petal.style.animationDelay = `${Math.random() * 2}s`;

    // 随机粉色深浅
    const hue = Math.floor(Math.random() * 30) + 330; // 330~360 粉到红
    petal.style.background = `linear-gradient(135deg, hsl(${hue}, 90%, 88%), hsl(${hue}, 80%, 95%))`;

    // 绑定飘落动画
    petal.style.animationName = 'fall';
    petal.style.animationTimingFunction = 'linear';
    petal.style.animationIterationCount = '1';
    petal.style.animationFillMode = 'forwards';

    sakuraContainer.appendChild(petal);

    // 动画结束后移除 DOM，避免内存泄漏
    setTimeout(() => {
        if (petal.parentNode) {
            petal.parentNode.removeChild(petal);
        }
    }, (duration + 2) * 1000);
}

// ============================
// 鼠标点击水波纹特效
// ============================
function createRipple(e) {
    // 获取点击坐标
    const x = e.clientX;
    const y = e.clientY;

    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    document.body.appendChild(ripple);

    // 动画结束后移除
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 700);
}

// ============================
// 页面加载完成后启动
// ============================
document.addEventListener('DOMContentLoaded', init);
