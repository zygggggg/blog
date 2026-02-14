#!/bin/bash
# 阿里云服务器环境配置脚本

echo "===== 开始配置服务器环境 ====="

# 1. 更新系统
echo "1. 更新系统..."
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js (v18 LTS)
echo "2. 安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v

# 3. 安装 MySQL
echo "3. 安装 MySQL..."
sudo apt install -y mysql-server

# 启动 MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# 4. 安装 Git
echo "4. 安装 Git..."
sudo apt install -y git

# 5. 安装 PM2 (进程管理工具)
echo "5. 安装 PM2..."
sudo npm install -g pm2

# 6. 安装 Nginx (可选，用于反向代理)
echo "6. 安装 Nginx..."
sudo apt install -y nginx

echo "===== 环境配置完成 ====="
echo "接下来需要："
echo "1. 配置 MySQL 密码：sudo mysql_secure_installation"
echo "2. 创建数据库"
echo "3. 部署你的应用"
