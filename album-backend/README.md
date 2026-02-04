# Album Backend

相册图片上传功能后端服务

## 技术栈

- Java 8
- Spring Boot 2.7.18
- MySQL 8.0
- MyBatis Plus 3.5.3.1
- 阿里云 OSS 3.17.1

## 快速开始

### 1. 配置数据库

执行 `database.sql` 创建数据库和表：

```bash
mysql -u root -p < database.sql
```

### 2. 配置 application.yml

修改 `src/main/resources/application.yml` 中的配置：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/album_db?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password

aliyun:
  oss:
    endpoint: oss-cn-hangzhou.aliyuncs.com
    access-key-id: YOUR_ACCESS_KEY_ID
    access-key-secret: YOUR_ACCESS_KEY_SECRET
    bucket-name: wzy-album
```

### 3. 编译运行

```bash
# 编译
mvn clean package -DskipTests

# 运行
java -jar target/album-backend-1.0.0.jar
```

服务将在 `http://localhost:8080` 启动

## API 接口

### 1. 健康检查

```
GET /api/album/health
```

### 2. 上传图片

```
POST /api/album/upload
Content-Type: multipart/form-data

参数:
- file: 图片文件（必填）
- description: 图片描述（可选）

限制:
- 文件大小: 最大 10MB
- 文件类型: JPG, PNG, GIF, WEBP
```

### 3. 获取图片列表

```
GET /api/album/list?page=1&size=20

参数:
- page: 页码（默认1）
- size: 每页数量（默认20）
```

### 4. 删除图片

```
DELETE /api/album/delete/{id}

参数:
- id: 图片ID
```

## 部署

### 生产环境配置

创建 `application-prod.yml`:

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://your-db-host:3306/album_db
    username: your_username
    password: your_password

aliyun:
  oss:
    endpoint: oss-cn-hangzhou.aliyuncs.com
    access-key-id: YOUR_ACCESS_KEY_ID
    access-key-secret: YOUR_ACCESS_KEY_SECRET
    bucket-name: wzy-album
```

### 启动命令

```bash
nohup java -jar album-backend-1.0.0.jar --spring.profiles.active=prod > app.log 2>&1 &
```

## 阿里云 OSS 配置

1. 创建 OSS Bucket（名称: wzy-album）
2. 设置 Bucket 为公共读权限
3. 创建 RAM 用户并获取 AccessKey
4. 配置跨域规则（允许前端域名访问）

## 注意事项

1. 确保 MySQL 8.0 已安装并运行
2. 确保阿里云 OSS 已配置正确
3. 生产环境建议使用 HTTPS
4. 建议配置 Nginx 反向代理
