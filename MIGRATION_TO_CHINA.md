# 从 Railway 迁移到国内云服务器完整指南

## 📊 迁移前后对比

| 项目 | Railway（当前） | 阿里云（迁移后） |
|------|----------------|-----------------|
| 访问速度 | ❌ 慢（300-800ms） | ✅ 快（10-50ms） |
| 上传图片 | ❌ 很慢（跨国两次） | ✅ 快（内网传输） |
| 月费用 | $5-20 | ¥60-120（约$8-17） |
| 备案要求 | ❌ 无 | ⚠️ 需要备案（使用域名） |

---

## 🚀 快速迁移步骤（3小时完成）

### 步骤 1：购买阿里云服务器（10分钟）

1. **访问阿里云轻量应用服务器**
   - 地址：https://www.aliyun.com/product/swas

2. **推荐配置**
   - 镜像：Ubuntu 22.04
   - 套餐：2核2G内存（¥60/月）或 2核4G（¥120/月）
   - 地域：**华东1（杭州）** ← 重要！与你的 OSS 同区域
   - 时长：先买1个月试试

3. **学生优惠（如果是学生）**
   - 访问：https://university.aliyun.com/
   - 认证后可享受 ¥9.9/月

---

### 步骤 2：配置服务器环境（30分钟）

#### 2.1 登录服务器

购买后在阿里云控制台：
1. 找到你的服务器
2. 点击"远程连接" 或使用 SSH 客户端
3. 登录方式：
   ```bash
   ssh root@你的服务器IP
   # 输入购买时设置的密码
   ```

#### 2.2 运行环境配置脚本

在你的本地电脑，我已经生成了 `migration-guide.sh` 脚本。

将脚本上传到服务器并执行：

```bash
# 方式1: 直接在服务器上创建脚本
nano setup.sh
# 粘贴 migration-guide.sh 的内容，Ctrl+X 保存

# 方式2: 使用 scp 上传（在本地执行）
scp C:\Users\15487\Desktop\startUp\migration-guide.sh root@你的服务器IP:/root/

# 执行脚本
chmod +x setup.sh  # 或 migration-guide.sh
sudo ./setup.sh
```

#### 2.3 配置 MySQL

```bash
# 安全配置 MySQL
sudo mysql_secure_installation

# 设置 root 密码，其他都选 Y

# 登录 MySQL
sudo mysql -u root -p

# 创建数据库和用户
CREATE DATABASE album_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'album_user'@'localhost' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON album_db.* TO 'album_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

### 步骤 3：迁移数据（30分钟）

#### 3.1 从 Railway 导出数据库

```bash
# 在本地电脑执行
# 方式1: 如果 Railway 提供数据库导出功能，直接下载

# 方式2: 使用命令行导出
railway login
railway link
railway run mysqldump -u root -p album_db > railway_backup.sql
```

如果不能直接导出，**手动备份**：
1. 登录 Railway 控制台
2. 进入 MySQL 数据库
3. 使用 phpMyAdmin 或其他工具导出 `.sql` 文件

#### 3.2 导入数据到阿里云

```bash
# 上传备份文件到服务器
scp railway_backup.sql root@你的服务器IP:/root/

# 登录服务器，导入数据
ssh root@你的服务器IP
mysql -u album_user -p album_db < /root/railway_backup.sql

# 验证数据
mysql -u album_user -p album_db
SHOW TABLES;
SELECT COUNT(*) FROM album_images;  # 检查图片数量
SELECT COUNT(*) FROM board_messages;  # 检查留言数量
EXIT;
```

---

### 步骤 4：部署应用（40分钟）

#### 4.1 上传代码到服务器

```bash
# 方式1: 使用 Git（推荐）
cd /opt
sudo git clone https://github.com/你的用户名/你的仓库.git app
cd app/album-backend-node

# 方式2: 手动上传
# 在本地打包：
cd C:\Users\15487\Desktop\startUp\album-backend-node
tar -czf backend.tar.gz .

# 上传到服务器
scp backend.tar.gz root@你的服务器IP:/opt/
ssh root@你的服务器IP
cd /opt
tar -xzf backend.tar.gz
```

#### 4.2 配置环境变量

```bash
cd /opt/app/album-backend-node
nano .env
```

填入以下内容：

```env
# 服务器配置
PORT=8080

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=album_user
DB_PASSWORD=你在步骤2.3设置的密码
DB_NAME=album_db

# 阿里云 OSS 配置（不变）
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=你的AccessKeyId
OSS_ACCESS_KEY_SECRET=你的AccessKeySecret
OSS_BUCKET=你的BucketName
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# Coze AI 聊天配置（不变）
COZE_API_URL=https://api.coze.cn/v1/conversation/create
COZE_BOT_ID=你的BotId
COZE_API_TOKEN=你的Token
```

保存：`Ctrl+X` -> `Y` -> `Enter`

#### 4.3 安装依赖并启动

```bash
# 安装依赖
npm install

# 测试启动
npm start

# 如果正常运行，按 Ctrl+C 停止，然后用 PM2 启动
pm2 start server.js --name album-backend

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs album-backend
```

#### 4.4 配置防火墙

```bash
# 开放 8080 端口
sudo ufw allow 8080
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

**阿里云控制台也要开放端口**：
1. 进入"轻量应用服务器控制台"
2. 选择你的服务器
3. 点击"防火墙"
4. 添加规则：
   - 端口：8080
   - 协议：TCP
   - 来源：0.0.0.0/0

---

### 步骤 5：配置 Nginx 反向代理（可选，20分钟）

这样可以使用 80 端口访问，而不是 8080：

```bash
# 编辑 Nginx 配置
sudo nano /etc/nginx/sites-available/album
```

填入：

```nginx
server {
    listen 80;
    server_name 你的服务器IP;  # 或域名

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

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/album /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
```

---

### 步骤 6：修改前端 API 地址（10分钟）

在你的 Vue 项目中，修改 API 地址：

```javascript
// 修改所有文件中的 API 地址
// 从：https://xxx.railway.app
// 改为：http://你的服务器IP 或 http://你的域名

// 例如在 Album.vue 中：
const API_BASE_URL = 'http://你的服务器IP:8080/api/album'
// 如果配置了 Nginx：
const API_BASE_URL = 'http://你的服务器IP/api/album'
```

重新部署前端（Vercel/其他）。

---

### 步骤 7：测试验证（20分钟）

1. **测试 API**
   ```bash
   curl http://你的服务器IP:8080/api/album/list
   ```

2. **测试前端**
   - 访问你的网站
   - 测试上传图片
   - 测试留言板
   - 测试聊天

3. **性能对比**
   - 打开浏览器 F12 -> Network
   - 刷新页面，查看请求时间
   - 应该从 300-800ms 降到 10-50ms

---

## 💰 费用对比

### Railway（当前）
- MySQL: $5/月
- 服务器: $5-10/月（根据流量）
- **总计**: $10-15/月（约 ¥70-105）

### 阿里云（迁移后）
- 轻量服务器 2核2G: ¥60/月
- OSS 存储: ¥0.12/GB/月（现有）
- 流量: ¥0.8/GB（下行）
- MySQL: 包含在服务器中
- **总计**: ¥60-100/月（约 $8-14）

**省钱：每月节省 ¥10-20**

---

## ⚠️ 注意事项

### 1. 备案问题
- **使用 IP 访问**：不需要备案 ✅
- **使用域名访问**：需要备案 ⚠️
- 备案流程：15-20天，阿里云提供免费协助

### 2. 安全建议
```bash
# 修改 SSH 端口（防止暴力破解）
sudo nano /etc/ssh/sshd_config
# 将 Port 22 改为 Port 2222

# 禁用密码登录，只用密钥
sudo nano /etc/ssh/sshd_config
# 设置 PasswordAuthentication no

# 重启 SSH
sudo systemctl restart sshd
```

### 3. 定期备份
```bash
# 设置每天自动备份数据库
crontab -e

# 添加：每天凌晨2点备份
0 2 * * * mysqldump -u album_user -p你的密码 album_db > /root/backup/album_$(date +\%Y\%m\%d).sql
```

---

## 🆘 常见问题

### Q1: 迁移后网站打不开？
**A**: 检查：
1. 服务器防火墙是否开放端口
2. 阿里云控制台防火墙是否开放端口
3. 应用是否正常运行：`pm2 status`

### Q2: 图片上传还是慢？
**A**: 检查服务器地域是否与 OSS 同区域（都选杭州）

### Q3: 数据库连接失败？
**A**:
```bash
# 检查 MySQL 是否运行
sudo systemctl status mysql

# 检查用户权限
mysql -u root -p
SHOW GRANTS FOR 'album_user'@'localhost';
```

### Q4: 如何回滚到 Railway？
**A**: 保留 Railway 环境，只需把前端 API 地址改回去即可

---

## 📞 需要帮助？

迁移过程中遇到问题，随时告诉我！我可以帮你：
- 调试错误
- 优化配置
- 性能调优

---

## ✅ 迁移检查清单

- [ ] 购买阿里云服务器
- [ ] 配置服务器环境（Node.js, MySQL, PM2）
- [ ] 从 Railway 导出数据库
- [ ] 导入数据到阿里云 MySQL
- [ ] 上传代码到服务器
- [ ] 配置 .env 环境变量
- [ ] 安装依赖并启动应用
- [ ] 配置防火墙（服务器 + 阿里云控制台）
- [ ] 配置 Nginx 反向代理（可选）
- [ ] 修改前端 API 地址
- [ ] 测试所有功能
- [ ] 设置定期备份

---

## 🎉 迁移完成后

恭喜！你的网站现在运行在国内服务器上：
- ✅ 访问速度提升 **5-10倍**
- ✅ 上传图片速度提升 **10-20倍**
- ✅ 留言、聊天即时响应
- ✅ 用户体验大幅提升

记得在 Railway 确认一切正常后再删除服务，避免数据丢失！
