# 部署指南

## 方案 A：Vercel（前端）+ Railway（后端）

### 一、后端部署到 Railway

#### 1. 注册 Railway
访问：https://railway.app/
- 使用 GitHub 账号登录

#### 2. 创建新项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择你的仓库中的 `album-backend-node` 目录

#### 3. 添加 MySQL 数据库
- 在项目中点击 "New"
- 选择 "Database" → "Add MySQL"
- Railway 会自动创建数据库并提供连接信息

#### 4. 配置环境变量
Railway 会自动设置数据库环境变量，你只需要添加：
```
PORT=8080
```

#### 5. 初始化数据库
- 在 Railway 的 MySQL 服务中，点击 "Data"
- 点击 "Query" 执行 SQL
- 复制 `database.sql` 的内容并执行
- 复制 `board_table.sql` 的内容并执行

#### 6. 获取后端 URL
部署成功后，Railway 会提供一个 URL，类似：
```
https://your-app.up.railway.app
```

---

### 二、前端部署到 Vercel

#### 1. 注册 Vercel
访问：https://vercel.com/
- 使用 GitHub 账号登录

#### 2. 修改前端 API 地址
在部署前，需要修改以下文件中的 API 地址：

**web_finalexam/js/album.js**
```javascript
// 修改第 2 行
const API_BASE_URL = 'https://your-app.up.railway.app/api/album';
```

**web_finalexam/js/board.js**
```javascript
// 修改第 2 行
const API_BASE_URL = 'https://your-app.up.railway.app/api/board';
```

#### 3. 创建新项目
- 点击 "Add New..." → "Project"
- 选择 "Import Git Repository"
- 选择你的仓库

#### 4. 配置项目
- **Framework Preset**: Other
- **Root Directory**: `web_finalexam`
- **Build Command**: 留空（静态网站不需要构建）
- **Output Directory**: `.`（当前目录）

#### 5. 部署
- 点击 "Deploy"
- 等待部署完成

#### 6. 获取前端 URL
部署成功后，Vercel 会提供一个 URL，类似：
```
https://your-project.vercel.app
```

---

### 三、测试

1. 访问 Vercel 提供的前端 URL
2. 测试相册上传功能
3. 测试留言板功能
4. 测试聊天功能

---

## 常见问题

### 1. CORS 错误
如果前端无法访问后端 API，检查后端的 CORS 配置。
在 `server.js` 中已经配置了 `cors()`，应该没问题。

### 2. 数据库连接失败
检查 Railway 的环境变量是否正确配置。

### 3. 图片上传失败
Railway 的文件系统是临时的，重启后会丢失。
建议后续迁移到阿里云 OSS 或 Cloudflare R2。

---

## 自动部署

配置完成后，每次推送代码到 GitHub：
- Vercel 会自动重新部署前端
- Railway 会自动重新部署后端

---

## 成本

- **Vercel**: 免费（每月 100GB 带宽）
- **Railway**: 免费（每月 $5 额度，约 500 小时运行时间）

总计：**完全免费**（在免费额度内）
