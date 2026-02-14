#!/bin/bash
# 腾讯云轻量服务器一键部署脚本（Ubuntu 22.04 LTS）
# 使用方法：sudo bash deploy-tencent.sh

set -e

echo "========================================="
echo "   腾讯云轻量服务器一键部署"
echo "   适用镜像：Ubuntu 22.04 LTS"
echo "========================================="

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 检查 root 权限
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 权限运行${NC}"
    echo "命令：sudo bash deploy-tencent.sh"
    exit 1
fi

echo -e "${YELLOW}请选择部署方式：${NC}"
echo "1) 纯命令行（推荐，性能最好）"
echo "2) 安装宝塔面板（图形化管理）"
read -p "请输入选择 [1/2]: " choice

# 步骤 1: 更新系统
echo -e "${GREEN}[1/7] 更新系统...${NC}"
apt update && apt upgrade -y

# 步骤 2: 安装 Node.js 18
echo -e "${GREEN}[2/7] 安装 Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
echo "✓ Node 版本: $(node -v)"
echo "✓ NPM 版本: $(npm -v)"

# 步骤 3: 安装 MySQL
echo -e "${GREEN}[3/7] 安装 MySQL...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql
echo "✓ MySQL 已安装并启动"

# 步骤 4: 安装 Git
echo -e "${GREEN}[4/7] 安装 Git...${NC}"
apt install -y git
echo "✓ Git 版本: $(git --version)"

# 步骤 5: 安装 PM2
echo -e "${GREEN}[5/7] 安装 PM2...${NC}"
npm install -g pm2
echo "✓ PM2 已安装"

# 步骤 6: 安装 Nginx
echo -e "${GREEN}[6/7] 安装 Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
echo "✓ Nginx 已安装并启动"

# 步骤 7: 配置防火墙
echo -e "${GREEN}[7/7] 配置防火墙...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8080/tcp
echo "y" | ufw enable
echo "✓ 防火墙已配置"

# 创建目录
mkdir -p /opt/app
mkdir -p /root/backup


# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me)

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   环境配置完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "服务器 IP: ${YELLOW}${SERVER_IP}${NC}"
echo ""
echo "接下来的步骤："
echo ""
echo "1️⃣  配置 MySQL 安全设置："
echo "   ${YELLOW}sudo mysql_secure_installation${NC}"
echo "   （设置 root 密码，其他都选 Y）"
echo ""
echo "2️⃣  创建数据库："
echo "   ${YELLOW}sudo mysql -u root -p${NC}"
echo "   然后执行："
echo "   ${YELLOW}CREATE DATABASE album_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;${NC}"
echo "   ${YELLOW}CREATE USER 'album_user'@'localhost' IDENTIFIED BY '你的强密码';${NC}"
echo "   ${YELLOW}GRANT ALL PRIVILEGES ON album_db.* TO 'album_user'@'localhost';${NC}"
echo "   ${YELLOW}FLUSH PRIVILEGES;${NC}"
echo "   ${YELLOW}EXIT;${NC}"
echo ""
echo "3️⃣  上传代码："
echo "   方法1：使用 Git"
echo "   ${YELLOW}cd /opt/app${NC}"
echo "   ${YELLOW}git clone https://github.com/你的用户名/仓库.git${NC}"
echo ""
echo "   方法2：使用 SCP 上传（在本地电脑执行）"
echo "   ${YELLOW}cd C:\\Users\\15487\\Desktop\\startUp\\album-backend-node${NC}"
echo "   ${YELLOW}scp -r ./* root@${SERVER_IP}:/opt/app/${NC}"
echo ""
echo "4️⃣  配置并启动："
echo "   ${YELLOW}cd /opt/app/album-backend-node${NC}"
echo "   ${YELLOW}nano .env${NC}  （编辑环境变量）"
echo "   ${YELLOW}npm install${NC}"
echo "   ${YELLOW}pm2 start server.js --name album-backend${NC}"
echo "   ${YELLOW}pm2 startup${NC}"
echo "   ${YELLOW}pm2 save${NC}"
echo ""
echo "5️⃣  腾讯云控制台开放防火墙端口："
echo "   进入：轻量应用服务器 → 你的实例 → 防火墙"
echo "   添加规则：8080、80、443 端口"
echo ""
echo "📖 详细文档：查看 MIGRATION_TO_CHINA.md"
echo ""
if [ "$choice" = "2" ]; then
    echo -e "${YELLOW}⚠️  宝塔面板访问地址和账号密码请查看上方输出${NC}"
    echo ""
fi
