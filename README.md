# 个人网站项目 - WZY Blog

## 🎯 项目简介

这是一个完整的个人网站系统，包含相册、留言板、聊天机器人等功能。

**技术栈**: Node.js + Express + MySQL + 原生 JavaScript

---

## 📂 项目结构

```
startUp/
├── album-backend-node/          # Node.js 后端
│   ├── server.js               # 主服务器文件
│   ├── database.sql            # 相册数据库脚本
│   ├── board_table.sql         # 留言板数据库脚本
│   └── package.json            # 依赖配置
│
└── web_finalexam/              # 前端项目
    ├── html/                   # HTML 页面
    │   ├── home.html          # 首页
    │   ├── about.html         # 关于页面
    │   ├── album.html         # 相册
    │   ├── blog.html          # 聊天机器人
    │   └── join.html          # 留言板
    ├── css/                    # 样式文件
    ├── js/                     # JavaScript 文件
    └── image/                  # 图片资源
```

---

## 🚀 快速开始

### 1. 配置数据库
```bash
mysql -u root -p
CREATE DATABASE album_db;
USE album_db;
source album-backend-node/database.sql
source album-backend-node/board_table.sql
```

### 2. 启动后端
```bash
cd album-backend-node
npm install
npm start
```

### 3. 访问前端
使用浏览器打开 `web_finalexam/html/home.html`

---

## 🎨 功能特性

- ✅ 相册图片上传与展示
- ✅ 留言板功能
- ✅ 聊天机器人
- ✅ 响应式设计
- ✅ 透明玻璃态 UI

---

## 🌐 部署

详细部署指南请查看：
- `QUICK_DEPLOY_GUIDE.md` - Vercel + Railway 部署指南
- `DEPLOYMENT_GUIDE_VERCEL_RAILWAY.md` - 详细部署文档

---

**项目版本**: 2.0.0
**最后更新**: 2026-02-04
**状态**: ✅ 可部署使用
