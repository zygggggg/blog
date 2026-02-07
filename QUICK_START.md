# 相册图片上传功能 - 快速开始

## 项目已完成！✅

所有代码已生成，现在可以开始部署和测试。

---

## 📁 项目结构

```
startUp/
├── album-backend/                      # 后端项目
│   ├── src/main/java/com/wzy/album/
│   │   ├── AlbumApplication.java       # 启动类
│   │   ├── config/
│   │   │   ├── CorsConfig.java         # 跨域配置
│   │   │   └── OssConfig.java          # OSS 配置
│   │   ├── controller/
│   │   │   └── AlbumController.java    # API 控制器
│   │   ├── service/
│   │   │   ├── AlbumService.java
│   │   │   └── impl/AlbumServiceImpl.java
│   │   ├── entity/
│   │   │   └── AlbumImage.java         # 数据库实体
│   │   ├── mapper/
│   │   │   └── AlbumImageMapper.java
│   │   ├── dto/
│   │   │   ├── ImageUploadDTO.java
│   │   │   └── ImageListDTO.java
│   │   ├── common/
│   │   │   └── Result.java             # 统一响应
│   │   └── exception/
│   │       ├── BusinessException.java
│   │       └── GlobalExceptionHandler.java
│   ├── src/main/resources/
│   │   ├── application.yml             # 配置文件
│   │   └── mapper/AlbumImageMapper.xml
│   ├── pom.xml                         # Maven 依赖
│   ├── database.sql                    # 数据库脚本
│   ├── album.service                   # systemd 服务文件
│   ├── nginx.conf                      # Nginx 配置
│   └── README.md
├── web_finalexam/                      # 前端项目
│   ├── html/album.html                 # 相册页面（已更新）
│   ├── css/album.css                   # 样式（已更新）
│   └── js/album.js                     # 脚本（已重写）
├── DEPLOYMENT_GUIDE.md                 # 完整部署指南
└── QUICK_START.md                      # 本文件
```

---

## 🚀 快速开始（3 步）

### 步骤 1: 配置数据库

```bash
# 1. 登录 MySQL
mysql -u root -p

# 2. 执行建表脚本
source album-backend/database.sql

# 3. 验证
USE album_db;
SHOW TABLES;
SELECT * FROM album_image;
```

### 步骤 2: 配置后端

编辑 `album-backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    password: YOUR_MYSQL_PASSWORD  # 修改这里

aliyun:
  oss:
    access-key-id: YOUR_ACCESS_KEY_ID        # 修改这里
    access-key-secret: YOUR_ACCESS_KEY_SECRET # 修改这里
```

### 步骤 3: 启动后端

```bash
cd album-backend

# 编译
mvn clean package -DskipTests

# 运行
java -jar target/album-backend-1.0.0.jar

# 测试
curl http://localhost:8080/api/album/health
```

---

## 🧪 本地测试

### 1. 测试后端 API

```bash
# 健康检查
curl http://localhost:8080/api/album/health

# 获取图片列表
curl http://localhost:8080/api/album/list

# 上传图片（替换为实际图片路径）
curl -X POST http://localhost:8080/api/album/upload \
  -F "file=@/path/to/image.jpg" \
  -F "description=测试图片"
```

### 2. 测试前端

**方法 1: 使用 VS Code Live Server**
1. 在 VS Code 中打开 `web_finalexam/html/album.html`
2. 右键 → "Open with Live Server"
3. 浏览器会自动打开

**方法 2: 使用 Python**
```bash
cd web_finalexam
python -m http.server 8000
# 访问 http://localhost:8000/html/album.html
```

**方法 3: 直接打开**
- 双击 `web_finalexam/html/album.html`
- 注意：可能会有跨域问题，建议使用方法 1 或 2

### 3. 测试上传功能

1. 打开相册页面
2. 点击右上角 "📷 上传图片" 按钮
3. 选择一张图片（JPG/PNG/GIF/WEBP，最大 10MB）
4. 输入描述（可选）
5. 点击 "确认上传"
6. 等待上传成功，页面自动刷新

---

## ⚙️ 阿里云 OSS 配置

### 必须完成以下配置才能上传图片：

#### 1. 创建 OSS Bucket
1. 登录 https://oss.console.aliyun.com/
2. 创建 Bucket:
   - 名称: `wzy-album`
   - 区域: 华东1（杭州）
   - 读写权限: **公共读** ⚠️ 重要
   - 存储类型: 标准存储

#### 2. 配置 CORS
1. 进入 Bucket → 权限管理 → 跨域设置
2. 创建规则:
   - 来源: `*` 或 `https://zygggggg.github.io`
   - 允许 Methods: GET, POST, PUT, DELETE, HEAD
   - 允许 Headers: `*`
   - 暴露 Headers: `ETag`

#### 3. 获取 AccessKey
1. 点击头像 → AccessKey 管理
2. 创建 AccessKey（或使用 RAM 子账号）
3. 保存 AccessKey ID 和 Secret

---

## 🌐 部署到生产环境

### 前端部署（GitHub Pages）

```bash
cd web_finalexam

# 修改 js/album.js 第 2 行的 API 地址
# const API_BASE_URL = 'https://your-domain.com/api/album';

git add .
git commit -m "Add album upload feature"
git push origin main
```

### 后端部署（服务器）

详细步骤请查看 `DEPLOYMENT_GUIDE.md`

简要步骤：
1. 上传 jar 文件到服务器
2. 配置 systemd 服务
3. 配置 Nginx 反向代理
4. 配置 HTTPS（Let's Encrypt）

---

## 📋 API 接口文档

### 1. 健康检查
```
GET /api/album/health
```

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": "Album service is running"
}
```

### 2. 上传图片
```
POST /api/album/upload
Content-Type: multipart/form-data
```

**参数**:
- `file`: 图片文件（必填）
- `description`: 图片描述（可选）

**限制**:
- 文件大小: 最大 10MB
- 文件类型: JPG, PNG, GIF, WEBP

**响应**:
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "id": 6,
    "fileName": "abc123.jpg",
    "fileUrl": "https://wzy-album.oss-cn-hangzhou.aliyuncs.com/album/abc123.jpg",
    "fileSize": 1234567,
    "fileType": "image/jpeg",
    "description": "测试图片",
    "uploadTime": "2026-02-04 12:00:00"
  }
}
```

### 3. 获取图片列表
```
GET /api/album/list?page=1&size=20
```

**参数**:
- `page`: 页码（默认 1）
- `size`: 每页数量（默认 20）

**响应**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 5,
    "page": 1,
    "size": 20,
    "list": [
      {
        "id": 1,
        "fileName": "pics01.jpg",
        "fileUrl": "../image/pics01.jpg",
        "fileSize": 1231358,
        "fileType": "image/jpeg",
        "description": "示例图片1",
        "uploadTime": "2026-02-04 10:00:00"
      }
    ]
  }
}
```

### 4. 删除图片
```
DELETE /api/album/delete/{id}
```

**响应**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

## ❓ 常见问题

### Q1: 编译失败，提示找不到依赖
**A**: 确保已安装 Maven，并且网络连接正常。可以尝试：
```bash
mvn clean install -U
```

### Q2: 启动失败，提示数据库连接错误
**A**: 检查：
1. MySQL 是否运行：`sudo systemctl status mysql`
2. 数据库是否创建：`mysql -u root -p -e "SHOW DATABASES;"`
3. 用户名密码是否正确

### Q3: 上传图片失败
**A**: 检查：
1. OSS AccessKey 是否正确
2. OSS Bucket 权限是否为"公共读"
3. 查看后端日志：`tail -f app.log`

### Q4: 前端显示跨域错误
**A**: 检查：
1. 后端 `CorsConfig.java` 是否包含前端域名
2. OSS CORS 配置是否正确
3. 浏览器控制台查看具体错误信息

### Q5: 图片上传后不显示
**A**: 检查：
1. 浏览器控制台是否有错误
2. API 请求是否成功（Network 标签）
3. 图片 URL 是否可以直接访问

---

## 📚 相关文档

- **完整部署指南**: `DEPLOYMENT_GUIDE.md`
- **后端 README**: `album-backend/README.md`
- **数据库脚本**: `album-backend/database.sql`

---

## 🎯 下一步

1. ✅ 完成本地测试
2. ⬜ 配置阿里云 OSS
3. ⬜ 部署后端到服务器
4. ⬜ 部署前端到 GitHub Pages
5. ⬜ 配置域名和 HTTPS
6. ⬜ 添加更多功能（图片删除、编辑等）

---

## 💡 功能特性

### 已实现
- ✅ 图片上传到阿里云 OSS
- ✅ 图片列表分页查询
- ✅ 图片删除（逻辑删除）
- ✅ 文件类型和大小验证
- ✅ 跨域支持
- ✅ 统一异常处理
- ✅ 响应式轮播图
- ✅ 图片预览
- ✅ 上传进度提示

### 可扩展功能
- ⬜ 用户认证（JWT）
- ⬜ 图片编辑（裁剪、旋转）
- ⬜ 批量上传
- ⬜ 图片标签和分类
- ⬜ 图片搜索
- ⬜ 图片压缩（前端）
- ⬜ CDN 加速
- ⬜ 后台管理界面

---

## 📞 支持

如有问题，请：
1. 查看 `DEPLOYMENT_GUIDE.md` 的常见问题部分
2. 检查后端日志
3. 检查浏览器控制台

---

**祝使用愉快！🎉**

---

# Coze 聊天功能接入快速开始

## 🎯 三步完成接入

### 第一步：获取 Coze 凭证

1. 访问 https://www.coze.cn/
2. 创建一个新的 Bot
3. 复制 **Bot ID** 和 **API Token**

### 第二步：配置后端

1. 进入后端目录：
```bash
cd album-backend-node
```

2. 复制配置文件（如果还没有 .env 文件）：
```bash
cp .env.example .env
```

3. 编辑 `.env` 文件，填入你的 Coze 凭证：
```env
# Coze AI 聊天配置
COZE_API_URL=https://api.coze.cn/v1/conversation/create
COZE_BOT_ID=你的Bot_ID
COZE_API_TOKEN=你的API_Token
```

### 第三步：启动服务

1. 安装依赖（首次运行）：
```bash
npm install
```

2. 启动后端服务：
```bash
npm start
```

3. 打开浏览器，访问：
```
file:///你的路径/web_finalexam/html/chat.html
```

## ✅ 完成！

现在你可以在聊天页面与 AI 对话了！

## 📖 详细文档

查看完整配置说明：[web_finalexam/COZE_SETUP.md](web_finalexam/COZE_SETUP.md)

## 🔧 架构说明

```
浏览器 (chat.html)
    ↓
前端 JS (chat.js) 调用 http://localhost:8080/api/chat/message
    ↓
后端服务器 (server.js)
    ↓
Coze API (api.coze.cn)
    ↓
返回 AI 回复
```

## ⚡ 优势

- ✅ API Token 在服务器端，安全
- ✅ 无跨域问题
- ✅ 便于扩展和维护

## 🧪 测试聊天功能

### 1. 测试后端 API

```bash
# 测试聊天接口
curl -X POST http://localhost:8080/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}'
```

### 2. 在浏览器中测试

1. 打开 `web_finalexam/html/chat.html`
2. 在输入框输入消息
3. 点击发送或按 Enter
4. 等待 AI 回复

## ❓ 常见问题

### Q1: 提示"聊天服务未配置"
**A**: 检查 `.env` 文件是否包含 `COZE_BOT_ID` 和 `COZE_API_TOKEN`，然后重启后端服务。

### Q2: 前端无法连接后端
**A**: 确认后端服务已启动在 8080 端口，可以用 `curl http://localhost:8080/api/album/health` 测试。

### Q3: AI 没有回复
**A**:
1. 检查后端控制台日志
2. 确认 Bot ID 和 API Token 是否正确
3. 确认网络连接正常

---

**开始享受智能对话吧！💬**
