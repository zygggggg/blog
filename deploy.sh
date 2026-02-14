#!/bin/bash
# 阿里云服务器一键部署脚本
# 使用方法：将此脚本上传到服务器，然后执行 sudo bash deploy.sh

set -e  # 遇到错误立即停止

echo "========================================="
echo "   阿里云服务器一键部署脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行此脚本${NC}"
    echo "使用: sudo bash deploy.sh"
    exit 1
fi

# 步骤 1: 更新系统
echo -e "${GREEN}[1/8] 更新系统...${NC}"
apt update && apt upgrade -y

# 步骤 2: 安装 Node.js 18
echo -e "${GREEN}[2/8] 安装 Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
echo "Node 版本: $(node -v)"
echo "NPM 版本: $(npm -v)"

# 步骤 3: 安装 MySQL
echo -e "${GREEN}[3/8] 安装 MySQL...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# 步骤 4: 安装 Git
echo -e "${GREEN}[4/8] 安装 Git...${NC}"
apt install -y git

# 步骤 5: 安装 PM2
echo -e "${GREEN}[5/8] 安装 PM2...${NC}"
npm install -g pm2

# 步骤 6: 安装 Nginx
echo -e "${GREEN}[6/8] 安装 Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 步骤 7: 配置防火墙
echo -e "${GREEN}[7/8] 配置防火墙...${NC}"
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 8080
echo "y" | ufw enable

# 步骤 8: 创建应用目录
echo -e "${GREEN}[8/8] 创建应用目录...${NC}"
mkdir -p /opt/app
mkdir -p /root/backup

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   环境配置完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "接下来的步骤："
echo "1. 配置 MySQL："
echo "   sudo mysql_secure_installation"
echo ""
echo "2. 创建数据库："
echo "   sudo mysql -u root -p"
echo "   CREATE DATABASE album_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "   CREATE USER 'album_user'@'localhost' IDENTIFIED BY '你的密码';"
echo "   GRANT ALL PRIVILEGES ON album_db.* TO 'album_user'@'localhost';"
echo "   FLUSH PRIVILEGES;"
echo "   EXIT;"
echo ""
echo "3. 上传代码到 /opt/app/"
echo ""
echo "4. 配置环境变量："
echo "   cd /opt/app/album-backend-node"
echo "   nano .env"
echo ""
echo "5. 启动应用："
echo "   npm install"
echo "   pm2 start server.js --name album-backend"
echo "   pm2 startup"
echo "   pm2 save"
echo ""
echo -e "${GREEN}服务器 IP: $(curl -s ifconfig.me)${NC}"
