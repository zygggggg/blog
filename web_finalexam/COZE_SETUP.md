# Coze API 接入指南（后端版本）

本文档说明如何将字节 Coze 平台的 AI Bot 通过后端接入到聊天模块中。

## 📋 前置准备

### 1. 注册 Coze 账号
1. 访问 [Coze 平台](https://www.coze.cn/) 或 [Coze 国际版](https://www.coze.com/)
2. 使用手机号或邮箱注册账号
3. 登录到 Coze 控制台

### 2. 创建 Bot
1. 在 Coze 控制台点击「创建 Bot」
2. 填写 Bot 名称、描述、头像等信息
3. 配置 Bot 的人设和能力（可以使用预设模板或自定义）
4. 保存并发布 Bot

### 3. 获取 API 凭证
1. 进入你创建的 Bot 详情页
2. 找到「API 密钥」或「开发设置」
3. 复制以下信息：
   - **Bot ID**: 你的 Bot 唯一标识
   - **API Token**: 用于调用 API 的访问令牌

## ⚙️ 后端配置

### 1. 创建 .env 文件

在 `album-backend-node` 目录下，复制 `.env.example` 创建 `.env` 文件：

```bash
cd album-backend-node
cp .env.example .env
```

### 2. 配置 Coze 参数

打开 `.env` 文件，找到 Coze 配置部分，填入你的凭证：

```env
# Coze AI 聊天配置
COZE_API_URL=https://api.coze.cn/v1/conversation/create
COZE_BOT_ID=7234567890123456789
COZE_API_TOKEN=pat_abcd1234efgh5678ijkl9012mnop
```

### 参数说明：

1. **COZE_API_URL**:
   - 国内版：`https://api.coze.cn/v1/conversation/create`
   - 国际版：`https://api.coze.com/v1/conversation/create`

2. **COZE_BOT_ID**:
   - 替换为你在 Coze 平台获取的 Bot ID
   - 格式通常为数字字符串，例如：`7234567890123456789`

3. **COZE_API_TOKEN**:
   - 替换为你的 API Token
   - 格式通常为：`pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🚀 启动服务

### 1. 启动后端服务

```bash
cd album-backend-node
npm install  # 首次运行需要安装依赖
npm start    # 启动服务
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

### 2. 确认服务启动成功

看到以下输出表示服务启动成功：

```
========================================
🚀 Album Backend Server Started!
========================================
📍 Server URL: http://localhost:8080
💾 Storage Mode: Local Disk

📝 API Endpoints:
   - POST   /api/chat/message
   ...
========================================
```

### 3. 打开前端页面

直接在浏览器中打开 `web_finalexam/html/chat.html`，即可开始使用聊天功能。

## 🔧 前端配置（可选）

如果你的后端服务不在 `localhost:8080`，需要修改前端配置。

打开 `web_finalexam/js/chat.js`，修改 API 地址：

```javascript
const API_CONFIG = {
    baseUrl: 'http://your-backend-url:8080',  // 修改为你的后端地址
    chatEndpoint: '/api/chat/message'
};
```

## 💡 架构优势

使用后端调用 Coze API 的好处：

✅ **安全性高**：API Token 保存在服务器端，不会暴露给用户
✅ **无跨域问题**：前端只调用自己的后端 API
✅ **便于扩展**：可以在后端添加日志、限流、缓存等功能
✅ **统一管理**：所有 API 配置集中在 .env 文件中

## 🔧 故障排查

### 常见问题：

1. **聊天没有响应**
   - 检查后端服务是否正常启动
   - 检查 .env 文件中的 Coze 配置是否正确
   - 查看后端控制台日志是否有错误信息

2. **提示"聊天服务未配置"**
   - 确认 .env 文件存在且包含 COZE_BOT_ID 和 COZE_API_TOKEN
   - 重启后端服务

3. **提示"聊天服务暂时不可用"**
   - Bot ID 或 API Token 不正确
   - Coze API 地址错误（检查国内版 vs 国际版）
   - 网络连接问题

4. **前端无法连接后端**
   - 确认后端服务已启动在 8080 端口
   - 检查浏览器控制台是否有跨域错误
   - 确认前端配置的 baseUrl 正确

## 📚 API 文档

### 后端 API：POST /api/chat/message

**请求参数：**
```json
{
  "message": "用户输入的消息",
  "userId": "可选，用户唯一标识"
}
```

**响应格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reply": "AI 的回复内容",
    "userId": "用户 ID"
  }
}
```

详细的 Coze API 文档请访问：
- [Coze 开发者文档](https://www.coze.cn/docs)
- [API 参考](https://www.coze.cn/docs/developer_guides/api_overview)

## 💡 进阶功能

如果需要更高级的功能，可以在后端 `server.js` 中扩展：

1. **对话历史管理**：在数据库中保存对话记录
2. **用户身份验证**：添加登录验证
3. **消息限流**：防止恶意请求
4. **多 Bot 支持**：根据不同场景使用不同的 Bot
5. **流式输出**：实现打字机效果

## 📝 注意事项

1. ⚠️ **不要将 .env 文件提交到 Git**：已添加到 .gitignore
2. 📊 注意 Coze API 的调用频率限制和配额
3. 🔒 定期更换 API Token，保证安全
4. 📝 定期检查 Coze API 的更新

## 🆘 获取帮助

如有问题，可以：
- 查看后端控制台的日志输出
- 查看浏览器控制台的错误信息
- 查看 [Coze 官方文档](https://www.coze.cn/docs)
- 联系 Coze 技术支持

