const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const OSS = require('ali-oss');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// 调试：检查 OSS 环境变量
console.log('🔍 OSS Environment Variables:', {
  OSS_ACCESS_KEY_ID: process.env.OSS_ACCESS_KEY_ID ? 'exists' : 'missing',
  OSS_ACCESS_KEY_SECRET: process.env.OSS_ACCESS_KEY_SECRET ? 'exists' : 'missing',
  OSS_BUCKET: process.env.OSS_BUCKET || 'missing',
  OSS_REGION: process.env.OSS_REGION || 'missing'
});

// 检查是否使用 OSS
const USE_OSS = !!(process.env.OSS_ACCESS_KEY_ID && process.env.OSS_ACCESS_KEY_SECRET && process.env.OSS_BUCKET);

console.log('🔧 Server version: 3.0 - OSS Support');
console.log('💾 Storage Mode:', USE_OSS ? 'Aliyun OSS' : 'Local Disk');

// 初始化 OSS 客户端
let ossClient = null;
if (USE_OSS) {
  try {
    ossClient = new OSS({
      region: process.env.OSS_REGION || 'oss-rg-china-mainland',
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      bucket: process.env.OSS_BUCKET,
      timeout: 300000, // 增加超时时间到 5 分钟（300秒）
      secure: true // 使用 HTTPS
    });
    console.log('✅ OSS client initialized');
    console.log('📦 Bucket:', process.env.OSS_BUCKET);
  } catch (err) {
    console.error('❌ OSS initialization failed:', err.message);
  }
}

// 确保上传目录存在
const UPLOAD_DIR = path.join(__dirname, 'uploads');
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log('✅ Upload directory ready:', UPLOAD_DIR);
  } catch (err) {
    console.error('❌ Failed to create upload directory:', err);
  }
})();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 仅在本地存储模式下使用
if (!USE_OSS) {
  app.use('/uploads', express.static(UPLOAD_DIR));
}

// 配置文件上传
const storage = USE_OSS ? multer.memoryStorage() : multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}_${randomStr}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只支持图片格式: jpeg, jpg, png, gif, webp'));
    }
  }
});

// 数据库连接池
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'album_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 测试数据库连接
(async () => {
  try {
    console.log('hello');
    console.log('🔍 Database config:', {
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'album_db',
      hasPassword: !!(process.env.MYSQLPASSWORD || process.env.DB_PASSWORD)
    });
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Full error:', err);
  }
})();

// 统一响应格式
const successResponse = (data = null, message = 'success') => ({
  code: 200,
  message,
  data
});

const errorResponse = (message = 'error', code = 500) => ({
  code,
  message,
  data: null
});

// ==================== API 路由 ====================

// 健康检查
app.get('/api/album/health', (req, res) => {
  res.json(successResponse(`Album service is running (${USE_OSS ? 'OSS' : 'Local'} Storage Mode)`));
});

// 上传图片
app.post('/api/album/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const description = req.body.description || '';

    if (!file) {
      return res.status(400).json(errorResponse('请选择要上传的文件', 400));
    }

    console.log(`📤 Upload image request received, filename: ${file.originalname}`);

    let fileUrl, fileName;

    if (USE_OSS) {
      // OSS 存储模式
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const ext = path.extname(file.originalname);
      fileName = `album/${timestamp}_${randomStr}${ext}`;

      try {
        // 上传到 OSS
        const result = await ossClient.put(fileName, file.buffer);
        fileUrl = result.url;
        console.log(`✅ Image uploaded to OSS: ${fileUrl}`);
      } catch (ossErr) {
        console.error('❌ OSS upload failed:', ossErr);
        return res.status(500).json(errorResponse('上传到 OSS 失败: ' + ossErr.message, 500));
      }
    } else {
      // 本地存储模式
      fileName = file.filename;
      fileUrl = `https://blog-production-24dd.up.railway.app/uploads/${file.filename}`;
    }

    // 保存到数据库
    const [insertResult] = await pool.execute(
      `INSERT INTO album_image
       (file_name, original_name, file_url, file_size, file_type, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fileName, file.originalname, fileUrl, file.size, file.mimetype, description]
    );

    const responseData = {
      id: insertResult.insertId,
      fileName: fileName,
      originalName: file.originalname,
      fileUrl: fileUrl,
      fileSize: file.size,
      fileType: file.mimetype,
      description: description
    };

    console.log(`✅ Upload successful, ID: ${insertResult.insertId}`);
    res.json(successResponse(responseData, '上传成功'));
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json(errorResponse('上传失败: ' + error.message, 500));
  }
});

// 获取图片列表（分页）
app.get('/api/album/list', async (req, res) => {
  try {
    console.log('hello');
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 20;
    const offset = (page - 1) * size;

    console.log(`📋 Get image list request received, page: ${page}, size: ${size}`);

    // 查询总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM album_image WHERE is_deleted = 0'
    );
    const total = countResult[0].total;

    // 查询列表
    const [rows] = await pool.query(
      `SELECT id, file_name as fileName, original_name as originalName,
              file_url as fileUrl, file_size as fileSize, file_type as fileType,
              description, upload_time as uploadTime, sort_order as sortOrder
       FROM album_image
       WHERE is_deleted = 0
       ORDER BY sort_order DESC, upload_time DESC
       LIMIT ${size} OFFSET ${offset}`
    );

    const responseData = {
      list: rows,
      total: total,
      page: page,
      size: size,
      totalPages: Math.ceil(total / size)
    };

    console.log(`✅ Found ${total} images`);
    res.json(successResponse(responseData));
  } catch (error) {
    console.error('❌ Get list error:', error);
    res.status(500).json(errorResponse('获取列表失败: ' + error.message, 500));
  }
});

// 删除图片
app.delete('/api/album/delete/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    console.log(`🗑️  Delete image request received, id: ${id}`);

    // 查询图片信息
    const [rows] = await pool.execute(
      'SELECT file_name FROM album_image WHERE id = ? AND is_deleted = 0',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json(errorResponse('图片不存在', 404));
    }

    const fileName = rows[0].file_name;

    if (USE_OSS) {
      // OSS 存储模式 - 删除 OSS 文件
      try {
        await ossClient.delete(fileName);
        console.log(`✅ File deleted from OSS: ${fileName}`);
      } catch (ossError) {
        console.warn('⚠️  OSS delete warning:', ossError.message);
        // 即使 OSS 删除失败，也继续删除数据库记录
      }
    } else {
      // 本地存储模式 - 删除本地文件
      const filePath = path.join(UPLOAD_DIR, fileName);
      try {
        await fs.unlink(filePath);
        console.log(`✅ File deleted from disk: ${fileName}`);
      } catch (fileError) {
        console.warn('⚠️  File delete warning:', fileError.message);
        // 即使文件删除失败，也继续删除数据库记录
      }
    }

    // 软删除（更新数据库）
    await pool.execute(
      'UPDATE album_image SET is_deleted = 1, update_time = NOW() WHERE id = ?',
      [id]
    );

    console.log(`✅ Image deleted successfully, ID: ${id}`);
    res.json(successResponse(null, '删除成功'));
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json(errorResponse('删除失败: ' + error.message, 500));
  }
});

// ==================== 留言板 API ====================

// 发表留言
app.post('/api/board/post', async (req, res) => {
  try {
    const { nickname, content } = req.body;

    // 验证
    if (!nickname || !nickname.trim()) {
      return res.status(400).json(errorResponse('昵称不能为空', 400));
    }

    if (!content || !content.trim()) {
      return res.status(400).json(errorResponse('留言内容不能为空', 400));
    }

    if (nickname.length > 50) {
      return res.status(400).json(errorResponse('昵称不能超过50个字符', 400));
    }

    if (content.length > 500) {
      return res.status(400).json(errorResponse('留言内容不能超过500个字符', 400));
    }

    console.log(`📝 Post message from: ${nickname}`);

    // 插入数据库
    const [result] = await pool.execute(
      'INSERT INTO board_messages (nickname, content) VALUES (?, ?)',
      [nickname.trim(), content.trim()]
    );

    const responseData = {
      id: result.insertId,
      nickname: nickname.trim(),
      content: content.trim(),
      createTime: new Date().toISOString()
    };

    res.json(successResponse(responseData, '留言发表成功'));
  } catch (error) {
    console.error('❌ Post message error:', error);
    res.status(500).json(errorResponse('发表留言失败: ' + error.message, 500));
  }
});

// 获取留言列表
app.get('/api/board/list', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 50;
    const offset = (page - 1) * size;

    console.log(`📋 Get board messages, page: ${page}, size: ${size}`);

    // 查询总数
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM board_messages WHERE is_deleted = 0'
    );
    const total = countResult[0].total;

    // 查询列表（按时间倒序）
    const [rows] = await pool.query(
      `SELECT id, nickname, content, create_time as createTime
       FROM board_messages
       WHERE is_deleted = 0
       ORDER BY create_time DESC
       LIMIT ${size} OFFSET ${offset}`
    );

    const responseData = {
      list: rows,
      total: total,
      page: page,
      size: size,
      totalPages: Math.ceil(total / size)
    };

    console.log(`✅ Found ${total} messages`);
    res.json(successResponse(responseData));
  } catch (error) {
    console.error('❌ Get board list error:', error);
    res.status(500).json(errorResponse('获取留言列表失败: ' + error.message, 500));
  }
});

// 删除留言
app.delete('/api/board/delete/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    console.log(`🗑️  Delete message request, id: ${id}`);

    // 检查留言是否存在
    const [rows] = await pool.execute(
      'SELECT id FROM board_messages WHERE id = ? AND is_deleted = 0',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json(errorResponse('留言不存在', 404));
    }

    // 软删除
    await pool.execute(
      'UPDATE board_messages SET is_deleted = 1 WHERE id = ?',
      [id]
    );

    console.log(`✅ Message deleted successfully, ID: ${id}`);
    res.json(successResponse(null, '删除成功'));
  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json(errorResponse('删除留言失败: ' + error.message, 500));
  }
});

// 清空所有留言
app.delete('/api/board/clear', async (req, res) => {
  try {
    console.log(`🗑️  Clear all messages request`);

    // 软删除所有留言
    const [result] = await pool.execute(
      'UPDATE board_messages SET is_deleted = 1 WHERE is_deleted = 0'
    );

    console.log(`✅ Cleared ${result.affectedRows} messages`);
    res.json(successResponse({ count: result.affectedRows }, '清空成功'));
  } catch (error) {
    console.error('❌ Clear messages error:', error);
    res.status(500).json(errorResponse('清空留言失败: ' + error.message, 500));
  }
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json(errorResponse(err.message || '服务器内部错误', 500));
});

// 404 处理
app.use((req, res) => {
  res.status(404).json(errorResponse('接口不存在', 404));
});

// 启动服务器
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🚀 Album Backend Server Started!');
  console.log('========================================');
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`💾 Storage Mode: Local Disk`);
  console.log(`📁 Upload Directory: ${UPLOAD_DIR}`);
  console.log('\n📝 API Endpoints:');
  console.log(`   - GET    /api/album/health`);
  console.log(`   - POST   /api/album/upload`);
  console.log(`   - GET    /api/album/list`);
  console.log(`   - DELETE /api/album/delete/:id`);
  console.log(`   - GET    /uploads/:filename (静态文件)`);
  console.log(`\n   - POST   /api/board/post`);
  console.log(`   - GET    /api/board/list`);
  console.log(`   - DELETE /api/board/delete/:id`);
  console.log(`   - DELETE /api/board/clear`);
  console.log('========================================\n');
});

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
