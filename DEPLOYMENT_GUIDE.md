# 相册图片上传功能 - 完整部署指南

## 项目概述

这是一个完整的相册图片上传系统，包含：
- **后端**: Spring Boot + MySQL + 阿里云 OSS
- **前端**: 原生 JavaScript (可部署到 GitHub Pages)

## 目录结构

```
startUp/
├── album-backend/              # 后端项目
│   ├── src/
│   ├── pom.xml
│   ├── database.sql
│   └── README.md
└── web_finalexam/              # 前端项目
    ├── html/album.html
    ├── css/album.css
    └── js/album.js
```

---

## 第一部分：后端部署

### 1. 准备工作

#### 1.1 安装 Java 8+
```bash
# 检查 Java 版本
java -version

# 如果没有安装，在 Ubuntu/Debian 上：
sudo apt update
sudo apt install openjdk-8-jdk

# 在 CentOS/RHEL 上：
sudo yum install java-1.8.0-openjdk
```

#### 1.2 安装 Maven
```bash
# Ubuntu/Debian
sudo apt install maven

# CentOS/RHEL
sudo yum install maven

# 验证安装
mvn -version
```

#### 1.3 安装 MySQL 8.0
```bash
# Ubuntu/Debian
sudo apt install mysql-server

# CentOS/RHEL
sudo yum install mysql-server

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 安全配置
sudo mysql_secure_installation
```

### 2. 配置阿里云 OSS

#### 2.1 创建 OSS Bucket
1. 登录阿里云控制台：https://oss.console.aliyun.com/
2. 点击"创建 Bucket"
3. 配置：
   - Bucket 名称: `wzy-album`
   - 区域: 华东1（杭州）
   - 读写权限: **公共读**
   - 其他保持默认

#### 2.2 配置跨域规则（CORS）
1. 进入 Bucket 管理页面
2. 点击"权限管理" → "跨域设置"
3. 点击"创建规则"
4. 配置：
   - 来源: `https://zygggggg.github.io` 和 `http://localhost:63342`
   - 允许 Methods: GET, POST, PUT, DELETE, HEAD
   - 允许 Headers: `*`
   - 暴露 Headers: `ETag`
   - 缓存时间: 600

#### 2.3 创建 AccessKey
1. 点击右上角头像 → "AccessKey 管理"
2. 建议创建 RAM 子账号（更安全）：
   - 进入 RAM 控制台
   - 创建用户，勾选"编程访问"
   - 授权策略: `AliyunOSSFullAccess`
   - 保存 AccessKey ID 和 AccessKey Secret

### 3. 配置数据库

```bash
# 登录 MySQL
mysql -u root -p

# 执行建表脚本
source /path/to/album-backend/database.sql

# 或者直接执行
mysql -u root -p < album-backend/database.sql

# 验证
mysql -u root -p
USE album_db;
SHOW TABLES;
SELECT * FROM album_image;
```

### 4. 配置后端应用

编辑 `album-backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/album_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: YOUR_MYSQL_PASSWORD  # 修改为你的 MySQL 密码

aliyun:
  oss:
    endpoint: oss-cn-hangzhou.aliyuncs.com
    access-key-id: YOUR_ACCESS_KEY_ID        # 修改为你的 AccessKey ID
    access-key-secret: YOUR_ACCESS_KEY_SECRET # 修改为你的 AccessKey Secret
    bucket-name: wzy-album
    folder: album/
    url-prefix: https://wzy-album.oss-cn-hangzhou.aliyuncs.com/
```

### 5. 编译和运行

#### 5.1 本地测试
```bash
cd album-backend

# 编译
mvn clean package -DskipTests

# 运行
java -jar target/album-backend-1.0.0.jar

# 测试健康检查
curl http://localhost:8080/api/album/health
```

#### 5.2 生产环境部署

**方式一：使用 nohup**
```bash
# 后台运行
nohup java -jar album-backend-1.0.0.jar > app.log 2>&1 &

# 查看日志
tail -f app.log

# 停止服务
ps aux | grep album-backend
kill <PID>
```

**方式二：使用 systemd（推荐）**

创建服务文件 `/etc/systemd/system/album.service`:

```ini
[Unit]
Description=Album Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/album
ExecStart=/usr/bin/java -jar /opt/album/album-backend-1.0.0.jar
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
# 创建目录
sudo mkdir -p /opt/album

# 复制 jar 文件
sudo cp target/album-backend-1.0.0.jar /opt/album/

# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start album

# 设置开机自启
sudo systemctl enable album

# 查看状态
sudo systemctl status album

# 查看日志
sudo journalctl -u album -f
```

### 6. 配置 Nginx 反向代理（可选但推荐）

安装 Nginx:
```bash
sudo apt install nginx  # Ubuntu/Debian
sudo yum install nginx  # CentOS/RHEL
```

创建配置文件 `/etc/nginx/sites-available/album`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名

    location /api/album {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS 配置
        add_header Access-Control-Allow-Origin "https://zygggggg.github.io" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "*" always;

        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/album /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

配置 HTTPS（使用 Let's Encrypt）:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 第二部分：前端部署

### 1. 修改 API 地址

编辑 `web_finalexam/js/album.js`，修改第 2 行：

```javascript
// 本地测试
const API_BASE_URL = 'http://localhost:8080/api/album';

// 生产环境（使用域名）
const API_BASE_URL = 'https://your-domain.com/api/album';

// 生产环境（使用 IP）
const API_BASE_URL = 'http://your-server-ip:8080/api/album';
```

### 2. 部署到 GitHub Pages

```bash
cd web_finalexam

# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Add album upload feature"

# 添加远程仓库
git remote add origin https://github.com/zygggggg/zygggggg.github.io.git

# 推送到 GitHub
git push -u origin main
```

GitHub Pages 会自动部署，访问：`https://zygggggg.github.io/html/album.html`

### 3. 本地测试

使用 VS Code Live Server 或其他本地服务器：
```bash
# 使用 Python
cd web_finalexam
python -m http.server 8000

# 访问
http://localhost:8000/html/album.html
```

---

## 第三部分：测试验证

### 1. 后端 API 测试

```bash
# 健康检查
curl http://localhost:8080/api/album/health

# 获取图片列表
curl http://localhost:8080/api/album/list

# 上传图片
curl -X POST http://localhost:8080/api/album/upload \
  -F "file=@/path/to/image.jpg" \
  -F "description=测试图片"
```

### 2. 前端功能测试

1. 打开相册页面
2. 点击右上角"📷 上传图片"按钮
3. 选择一张图片
4. 输入描述（可选）
5. 点击"确认上传"
6. 等待上传成功
7. 页面自动刷新，新图片出现在轮播中

### 3. 跨域测试

打开浏览器开发者工具（F12），查看 Network 标签：
- 确保 API 请求成功（状态码 200）
- 确保没有 CORS 错误

---

## 第四部分：常见问题

### 1. 跨域问题

**症状**: 浏览器控制台显示 CORS 错误

**解决方案**:
- 检查后端 `CorsConfig.java` 是否包含前端域名
- 检查阿里云 OSS 的 CORS 配置
- 如果使用 Nginx，检查 Nginx 配置

### 2. 文件上传失败

**症状**: 上传时提示"文件上传失败"

**解决方案**:
- 检查 OSS AccessKey 是否正确
- 检查 OSS Bucket 权限是否为"公共读"
- 检查网络连接
- 查看后端日志：`sudo journalctl -u album -f`

### 3. 数据库连接失败

**症状**: 后端启动失败，日志显示数据库连接错误

**解决方案**:
```bash
# 检查 MySQL 是否运行
sudo systemctl status mysql

# 检查数据库是否存在
mysql -u root -p -e "SHOW DATABASES;"

# 检查用户权限
mysql -u root -p -e "SHOW GRANTS FOR 'root'@'localhost';"
```

### 4. 端口被占用

**症状**: 后端启动失败，提示端口 8080 被占用

**解决方案**:
```bash
# 查找占用端口的进程
sudo lsof -i :8080

# 杀死进程
sudo kill -9 <PID>

# 或修改 application.yml 中的端口
server:
  port: 8081
```

---

## 第五部分：安全建议

### 1. 文件上传安全
- ✅ 已限制文件类型（仅图片）
- ✅ 已限制文件大小（10MB）
- ✅ 使用 UUID 生成文件名
- ✅ 验证 MIME 类型

### 2. API 安全
- ⚠️ 建议添加身份认证（JWT Token）
- ⚠️ 建议添加请求频率限制（防止滥用）
- ✅ 已配置 CORS 白名单

### 3. 数据库安全
- ⚠️ 使用强密码
- ⚠️ 配置防火墙，仅允许本地访问
- ⚠️ 定期备份数据

### 4. OSS 安全
- ✅ 使用 RAM 子账号（最小权限）
- ⚠️ 定期轮换 AccessKey
- ⚠️ 配置防盗链

---

## 第六部分：监控和维护

### 1. 日志查看

```bash
# 查看应用日志
sudo journalctl -u album -f

# 查看 Nginx 日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 查看 MySQL 日志
sudo tail -f /var/log/mysql/error.log
```

### 2. 数据库备份

```bash
# 备份数据库
mysqldump -u root -p album_db > album_db_backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -u root -p album_db < album_db_backup_20260204.sql

# 设置定时备份（crontab）
crontab -e
# 添加：每天凌晨 2 点备份
0 2 * * * mysqldump -u root -pYOUR_PASSWORD album_db > /backup/album_db_$(date +\%Y\%m\%d).sql
```

### 3. 磁盘空间监控

```bash
# 查看磁盘使用情况
df -h

# 查看 OSS 使用情况
# 登录阿里云控制台查看
```

---

## 第七部分：性能优化

### 1. 图片压缩（前端）

在 `album.js` 的 `uploadImage` 函数前添加压缩逻辑：

```javascript
// 压缩图片
function compressImage(file, maxWidth = 1920, quality = 0.8) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}
```

### 2. CDN 加速

配置阿里云 CDN 加速 OSS：
1. 登录阿里云 CDN 控制台
2. 添加域名，源站选择 OSS
3. 配置 HTTPS 证书
4. 修改 `application.yml` 中的 `url-prefix` 为 CDN 域名

### 3. 数据库索引优化

```sql
-- 已创建的索引
CREATE INDEX idx_upload_time ON album_image(upload_time);
CREATE INDEX idx_is_deleted ON album_image(is_deleted);

-- 如果需要按描述搜索，添加全文索引
ALTER TABLE album_image ADD FULLTEXT INDEX idx_description(description);
```

---

## 成本估算

- **阿里云 OSS**:
  - 存储: ¥0.12/GB/月
  - 流量: ¥0.5/GB
  - 预计: ¥10-20/月（100GB 存储 + 20GB 流量）

- **阿里云 ECS**:
  - 学生机: ¥10/月（1核2GB）
  - 轻量应用服务器: ¥24/月（2核2GB）

- **MySQL**:
  - 自建: 免费
  - RDS: ¥50/月起

**总计**: ¥50-100/月

---

## 联系方式

如有问题，请查看：
- 后端日志: `sudo journalctl -u album -f`
- 前端控制台: 浏览器 F12 → Console
- GitHub Issues: https://github.com/zygggggg/zygggggg.github.io/issues

---

**祝部署顺利！🎉**
