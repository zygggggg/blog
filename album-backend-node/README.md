# Album Backend - Node.js 本地存储版本

## ✨ 特点

- ✅ **无需阿里云**：图片存储在本地 `uploads/` 目录
- ✅ **轻量级**：单文件实现，代码简洁
- ✅ **即改即用**：修改代码立即生效
- ✅ **完全免费**：不需要任何云服务

## 🚀 快速开始

### 1. 安装依赖

```bash
cd album-backend-node
npm install
```

### 2. 配置数据库

编辑 `.env` 文件，设置 MySQL 密码：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=album_db
```

### 3. 创建数据库

```bash
# 方式1：使用 MySQL 命令行
mysql -u root -p < init_database.sql

# 方式2：手动执行
mysql -u root -p
# 然后复制 init_database.sql 的内容执行
```

### 4. 启动服务

```bash
# 生产环境
npm start

# 开发环境（自动重启）
npm run dev
```

服务将运行在 `http://localhost:8080`

## 📁 目录结构

```
album-backend-node/
├── server.js              # 主服务文件
├── package.json           # 依赖配置
├── .env                   # 环境变量
├── init_database.sql      # 数据库初始化脚本
├── test_api.sh           # API 测试脚本
├── uploads/              # 图片存储目录（自动创建）
└── README.md             # 说明文档
```

## 📝 API 接口

### 1. 健康检查
```bash
curl http://localhost:8080/api/album/health
```

### 2. 上传图片
```bash
curl -X POST http://localhost:8080/api/album/upload \
  -F "file=@test.jpg" \
  -F "description=测试图片"
```

### 3. 获取图片列表
```bash
curl http://localhost:8080/api/album/list?page=1&size=20
```

### 4. 删除图片
```bash
curl -X DELETE http://localhost:8080/api/album/delete/1
```

### 5. 访问图片
```
http://localhost:8080/uploads/文件名.jpg
```

## 🔧 配置说明

### .env 文件

```env
# 服务器端口
PORT=8080

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=album_db
```

## 🧪 测试

运行测试脚本：

```bash
bash test_api.sh
```

## 📊 与 Spring Boot 对比

| 项目 | Spring Boot | Node.js (本地存储) |
|------|-------------|-------------------|
| 代码文件 | 13 个 Java 文件 | 1 个 JS 文件 |
| 代码行数 | ~800 行 | ~280 行 |
| 启动时间 | 5-10 秒 | <1 秒 |
| 内存占用 | 200-300MB | 50-80MB |
| 云服务依赖 | 需要 OSS | 不需要 |
| 成本 | 需要购买 OSS | 完全免费 |

## 🌐 部署到生产环境

### 使用 PM2

```bash
npm install -g pm2
pm2 start server.js --name album-backend
pm2 save
pm2 startup
```

### 使用 Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:8080;
    }
}
```

## 🔄 迁移到云存储

如果未来需要迁移到阿里云 OSS，只需：

1. 安装 OSS SDK：`npm install ali-oss`
2. 修改上传和删除逻辑
3. 迁移现有图片到 OSS

## ❓ 常见问题

### 1. 端口被占用
修改 `.env` 中的 `PORT` 配置

### 2. 数据库连接失败
- 检查 MySQL 是否运行
- 检查 `.env` 中的密码是否正确
- 确认数据库 `album_db` 已创建

### 3. 图片无法访问
- 确认 `uploads/` 目录存在
- 检查文件权限
- 查看服务器日志

### 4. 上传失败
- 检查文件大小（限制 10MB）
- 确认文件格式（仅支持图片）
- 查看磁盘空间

## 📄 许可证

MIT
