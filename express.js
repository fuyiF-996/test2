/**
 * 本地 Express 启动脚本
 * 作用：
 * 1. 提供静态文件服务（index.html / style.css / main.js）
 * 2. 将本地 "图片tr" 目录映射为 /images 静态资源
 * 3. 提供 /api/images 接口，返回文件夹内所有图片文件名
 *
 * 启动方式：node express.js
 * 访问地址：http://localhost:8080
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// 创建 Express 应用实例
const app = express();

// 服务端口
const PORT = 8080;

// 项目根目录
const ROOT_DIR = __dirname;

// 图片文件夹的本地绝对路径（与 express.js 同级目录下的 "图片tr" 文件夹）
const IMAGE_DIR = path.join(ROOT_DIR, '图片tr');

// 支持的图片扩展名
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

/**
 * API：获取图片列表
 * 读取 IMAGE_DIR 目录，过滤出图片文件，返回 JSON
 */
app.get('/api/images', (req, res) => {
    try {
        // 如果目录不存在，返回空数组并提示
        if (!fs.existsSync(IMAGE_DIR)) {
            console.warn(`[警告] 图片目录不存在: ${IMAGE_DIR}`);
            return res.json({ images: [], message: '图片目录不存在' });
        }

        // 读取目录下所有文件
        const files = fs.readdirSync(IMAGE_DIR);

        // 过滤出图片文件
        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return IMAGE_EXTENSIONS.includes(ext);
        });

        res.json({ images });
    } catch (error) {
        console.error('[错误] 读取图片目录失败:', error);
        res.status(500).json({ error: '读取图片目录失败', detail: error.message });
    }
});

// 将本地 "图片tr" 目录映射到 /images URL 路径
app.use('/images', express.static(IMAGE_DIR));

// 提供项目根目录下其他静态文件（HTML/CSS/JS）
app.use(express.static(ROOT_DIR));

// 启动服务
app.listen(PORT, () => {
    console.log('=================================');
    console.log('🌸 樱花图集服务已启动');
    console.log(`👉 访问地址: http://localhost:${PORT}`);
    console.log(`📁 图片目录: ${IMAGE_DIR}`);
    console.log('=================================');
});
