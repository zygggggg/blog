#!/bin/bash

# 测试脚本 - Node.js 版本

BASE_URL="http://localhost:8080/api/album"

echo "=========================================="
echo "Album Backend API 测试"
echo "=========================================="
echo ""

# 1. 健康检查
echo "1️⃣  测试健康检查..."
curl -s -X GET "$BASE_URL/health" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/health"
echo -e "\n"

# 2. 获取图片列表
echo "2️⃣  测试获取图片列表..."
curl -s -X GET "$BASE_URL/list?page=1&size=5" | json_pp 2>/dev/null || curl -s -X GET "$BASE_URL/list?page=1&size=5"
echo -e "\n"

# 3. 上传图片（需要准备测试图片）
if [ -f "test.jpg" ]; then
    echo "3️⃣  测试上传图片..."
    curl -s -X POST "$BASE_URL/upload" \
      -F "file=@test.jpg" \
      -F "description=Node.js测试图片" | json_pp 2>/dev/null || curl -s -X POST "$BASE_URL/upload" -F "file=@test.jpg" -F "description=Node.js测试图片"
    echo -e "\n"
else
    echo "3️⃣  跳过上传测试（未找到 test.jpg）"
    echo -e "\n"
fi

# 4. 删除图片（需要提供 ID）
# echo "4️⃣  测试删除图片..."
# curl -s -X DELETE "$BASE_URL/delete/1" | json_pp 2>/dev/null || curl -s -X DELETE "$BASE_URL/delete/1"
# echo -e "\n"

echo "=========================================="
echo "测试完成！"
echo "=========================================="
