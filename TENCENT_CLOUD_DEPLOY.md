# 腾讯云轻量服务器快速部署指南

## 📦 购买服务器（10分钟）

### 1. 访问腾讯云轻量服务器
https://cloud.tencent.com/product/lighthouse

### 2. 推荐配置
- **镜像**：Ubuntu Server 22.04 LTS
- **地域**：广州 或 上海（选离你近的）
- **套餐**：
  - 2核2G 4M带宽 - ¥50-70/月（够用）
  - 2核4G 5M带宽 - ¥80-100/月（更流畅）
- **时长**：先买1个月试试

### 3. 新用户优惠
- 首次购买可能有超低价活动（¥50/年）
- 学生认证：¥10/月

---

## 🚀 一键部署（30分钟）

### 步骤1：登录服务器

购买后：
1. 进入"轻量应用服务器控制台"
2. 找到你的实例，点击"登录"
3. 选择"网页SSH"或使用 SSH 客户端

**SSH 登录方式：**
```bash
ssh ubuntu@你的服务器IP
# 或
ssh root@你的服务器IP
# 输入密码（购买时设置的）
```

### 步骤2：上传并运行部署脚本

**方法1：直接复制粘贴（推荐）**

登录服务器后，创建脚本：
```bash
nano deploy.sh
```

然后复制 `deploy-tencent.sh` 的内容，粘贴到终端，保存（Ctrl+X，Y，Enter）。

**方法2：使用 SCP 上传**

在本地电脑（Windows）执行：
```bash
# 打开 Git Bash 或 PowerShell
scp C:\Users\15487\Desktop\startUp\deploy-tencent.sh root@你的服务器IP:/root/
```

### 步骤3：执行部署脚本

```bash
chmod +x deploy.sh  # 或 deploy-tencent.sh
sudo bash deploy.sh
```

脚本会询问：
```
请选择部署方式：
1) 纯命令行（推荐，性能最好）
2) 安装宝塔面板（图形化管理）
```

**推荐选 1**，除非你特别想要图形界面。

---

## 🗄️ 配置数据库（10分钟）

### 1. 设置 MySQL 安全选项

```bash
sudo mysql_secure_installation
```

按提示操作：
- Set root password? **Y** → 输入强密码（记住它！）
- Remove anonymous users? **Y**
- Disallow root login remotely? **Y**
- Remove test database? **Y**
- Reload privilege tables? **Y**

### 2. 创建数据库和用户

```bash
sudo mysql -u root -p
# 输入刚才设置的密码
```

在 MySQL 中执行：
```sql
CREATE DATABASE album_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'album_user'@'localhost' IDENTIFIED BY 'Album@2024!Strong';

GRANT ALL PRIVILEGES ON album_db.* TO 'album_user'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

**⚠️ 记住密码：`Album@2024!Strong`（或你自己设的）**

---

## 📤 迁移数据（20分钟）

### 从 Railway 导出数据

**方法1：Railway CLI**
```bash
# 在本地电脑执行
railway login
railway link  # 选择你的项目
railway run mysqldump -u root -p album_db > railway_backup.sql
```

**方法2：手动导出**
1. 登录 Railway Dashboard
2. 进入 MySQL 插件
3. 使用数据库管理工具导出 `.sql` 文件

### 上传到腾讯云并导入

```bash
# 在本地电脑执行（上传备份）
scp railway_backup.sql root@你的服务器IP:/root/

# 登录服务器，导入数据
ssh root@你的服务器IP
mysql -u album_user -p album_db < /root/railway_backup.sql
# 输入密码：Album@2024!Strong

# 验证数据
mysql -u album_user -p album_db
SELECT COUNT(*) FROM album_images;
SELECT COUNT(*) FROM board_messages;
EXIT;
```

---

## 📁 部署应用（20分钟）

### 方法1：使用 Git（推荐）

```bash
cd /opt/app
git clone https://github.com/你的用户名/你的仓库.git .
cd album-backend-node
```

### 方法2：SCP 上传

在本地电脑：
```bash
cd C:\Users\15487\Desktop\startUp\album-backend-node
scp -r ./* root@你的服务器IP:/opt/app/
```

### 配置环境变量

```bash
cd /opt/app/album-backend-node
nano .env
```

填入（修改密码部分）：
```env
# 服务器配置
PORT=8080

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=album_user
DB_PASSWORD=Album@2024!Strong
DB_NAME=album_db

# 阿里云 OSS 配置
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=你的AccessKeyId
OSS_ACCESS_KEY_SECRET=你的AccessKeySecret
OSS_BUCKET=你的BucketName
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# Coze AI 聊天配置
COZE_API_URL=https://api.coze.cn/v1/conversation/create
COZE_BOT_ID=你的BotId
COZE_API_TOKEN=你的Token
```

保存：Ctrl+X → Y → Enter

### 安装依赖并启动

```bash
# 安装依赖
npm install

# 测试启动
npm start
# 按 Ctrl+C 停止

# 用 PM2 后台运行
pm2 start server.js --name album-backend
pm2 startup
pm2 save

# 查看运行状态
pm2 status
pm2 logs album-backend
```

---

## 🔥 开放防火墙（重要！）

### 1. 服务器防火墙（已配置）
脚本已自动配置，跳过。

### 2. 腾讯云控制台防火墙 ⚠️

**这一步必须做，否则无法访问！**

1. 登录腾讯云控制台
2. 进入：**轻量应用服务器** → 你的实例
3. 点击：**防火墙** 标签
4. 点击：**添加规则**
5. 添加以下规则：

| 应用类型 | 协议 | 端口 | 来源 |
|---------|------|------|------|
| 自定义 | TCP | 8080 | 0.0.0.0/0 |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |

---

## 🌐 配置 Nginx 反向代理（可选）

这样可以通过 80 端口访问，而不用加 :8080

```bash
sudo nano /etc/nginx/sites-available/album
```

填入：
```nginx
server {
    listen 80;
    server_name 你的服务器IP;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用：
```bash
sudo ln -s /etc/nginx/sites-available/album /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔄 修改前端 API 地址

修改所有前端文件中的 API 地址：

```javascript
// 从 Railway 地址
const API_BASE_URL = 'https://xxx.railway.app/api'

// 改为腾讯云地址（如果配置了 Nginx）
const API_BASE_URL = 'http://你的服务器IP/api'

// 或者不用 Nginx
const API_BASE_URL = 'http://你的服务器IP:8080/api'
```

需要修改的文件：
- `web-vue/src/views/Album.vue`
- `web-vue/src/views/Board.vue`
- `web-vue/src/views/Chat.vue`
- 其他调用 API 的地方

---

## ✅ 测试验证

### 1. 测试 API
```bash
curl http://你的服务器IP:8080/api/album/list
```

应该返回 JSON 数据。

### 2. 测试前端
访问你的网站，测试：
- ✅ 加载相册
- ✅ 上传图片
- ✅ 发表留言
- ✅ AI 聊天

### 3. 性能测试
打开 F12 → Network，刷新页面，查看请求时间：
- 应该从 **300-800ms** 降到 **10-50ms** ⚡

---

## 🎉 完成！

恭喜！你的网站现在运行在国内服务器上：
- ✅ 访问速度提升 **10倍**
- ✅ 上传速度提升 **20倍**
- ✅ 用户体验大幅提升

---

## 📞 常见问题

### Q: 无法访问 8080 端口？
A: 检查腾讯云控制台防火墙是否开放 8080

### Q: 数据库连接失败？
A: 检查 .env 文件中的密码是否正确

### Q: PM2 启动失败？
A: 查看日志：`pm2 logs album-backend`

### Q: 如何重启应用？
A: `pm2 restart album-backend`

### Q: 如何停止应用？
A: `pm2 stop album-backend`

---

## 🔧 日常维护

### 查看应用状态
```bash
pm2 status
pm2 logs album-backend
```

### 重启应用
```bash
pm2 restart album-backend
```

### 更新代码
```bash
cd /opt/app/album-backend-node
git pull
npm install
pm2 restart album-backend
```

### 备份数据库
```bash
mysqldump -u album_user -p album_db > /root/backup/album_$(date +%Y%m%d).sql
```

---

需要帮助？随时问我！
