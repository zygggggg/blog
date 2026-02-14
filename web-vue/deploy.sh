#!/bin/bash
# 前端一键部署脚本

echo "🚀 开始构建前端..."
npm run build

echo "📦 打包文件..."
tar -czf dist.tar.gz dist/

echo "📤 上传到服务器..."
scp dist.tar.gz root@49.235.148.184:/tmp/

echo "🔄 在服务器上部署..."
ssh root@49.235.148.184 << 'ENDSSH'
cd /tmp
tar -xzf dist.tar.gz
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
echo "✅ 部署完成！"
ENDSSH

echo "🎉 前端已更新！访问 http://49.235.148.184"
