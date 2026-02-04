# 🚀 快速部署指南

## 📦 准备工作

### 1. 确保代码已推送到 GitHub

如果还没有，执行：
```bash
cd C:\Users\15487\Desktop\startUp
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

---

## 🔧 第一步：部署后端到 Railway

### 1. 访问 Railway
打开：https://railway.app/
- 点击 "Login" → 使用 GitHub 登录

### 2. 创建新项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择你的仓库
- **Root Directory**: 设置为 `album-backend-node`

### 3. 添加 MySQL 数据库
- 点击项目右上角的 "New"
- 选择 "Database" → "MySQL"
- 等待数据库创建完成

### 4. 连接数据库到后端
Railway 会自动设置这些环境变量：
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

但我们的代码使用的是 `DB_HOST` 等，所以需要手动添加：

在后端服务的 "Variables" 中添加：
```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
PORT=8080
```

### 5. 初始化数据库
- 点击 MySQL 服务
- 点击 "Data" 标签
- 点击 "Query"
- 复制并执行 `album-backend-node/database.sql` 的内容
- 再复制并执行 `album-backend-node/board_table.sql` 的内容

### 6. 获取后端 URL
- 点击后端服务
- 点击 "Settings" → "Networking"
- 点击 "Generate Domain"
- 复制生成的 URL（类似：`https://xxx.up.railway.app`）

---

## 🌐 第二步：修改前端 API 地址

### 1. 修改 album.js
打开 `web_finalexam/js/album.js`，修改第 2 行：
```javascript
const API_BASE_URL = 'https://你的Railway域名/api/album';
```

### 2. 修改 board.js
打开 `web_finalexam/js/board.js`，修改第 2 行：
```javascript
const API_BASE_URL = 'https://你的Railway域名/api/board';
```

### 3. 提交修改
```bash
git add .
git commit -m "Update API URLs for production"
git push
```

---

## 🎨 第三步：部署前端到 Vercel

### 1. 访问 Vercel
打开：https://vercel.com/
- 点击 "Sign Up" → 使用 GitHub 登录

### 2. 导入项目
- 点击 "Add New..." → "Project"
- 选择 "Import Git Repository"
- 找到你的仓库，点击 "Import"

### 3. 配置项目
- **Framework Preset**: 选择 "Other"
- **Root Directory**: 点击 "Edit"，选择 `web_finalexam`
- **Build Command**: 留空
- **Output Directory**: 留空
- **Install Command**: 留空

### 4. 部署
- 点击 "Deploy"
- 等待 1-2 分钟

### 5. 访问网站
部署完成后，Vercel 会显示你的网站地址，类似：
```
https://你的项目名.vercel.app
```

---

## ✅ 测试

访问你的 Vercel 网站：
1. 测试相册上传功能
2. 测试留言板功能
3. 测试聊天功能

---

## 🎉 完成！

现在你的网站已经部署到云端了！

- **前端**: Vercel（全球 CDN 加速）
- **后端**: Railway（Node.js + MySQL）
- **成本**: 完全免费（在免费额度内）

---

## 📝 后续优化

### 1. 自定义域名
- Vercel 和 Railway 都支持绑定自定义域名
- 需要购买域名（约 50-100 元/年）

### 2. 图片存储优化
- 当前图片存储在 Railway 本地，重启会丢失
- 建议迁移到阿里云 OSS 或 Cloudflare R2

### 3. 自动部署
- 每次推送代码到 GitHub，Vercel 和 Railway 会自动重新部署

---

## ❓ 遇到问题？

### CORS 错误
如果前端无法访问后端，检查：
1. Railway 后端是否正常运行
2. API URL 是否正确
3. 浏览器控制台的错误信息

### 数据库连接失败
检查 Railway 的环境变量是否正确配置

### 图片无法上传
Railway 的文件系统是临时的，建议使用云存储服务
