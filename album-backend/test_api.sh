#!/bin/bash

# 相册后端 API 测试脚本
# 使用方法: ./test_api.sh

# 配置
API_BASE_URL="http://localhost:8080/api/album"
TEST_IMAGE="test_image.jpg"  # 修改为实际的测试图片路径

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "相册后端 API 测试"
echo "=========================================="
echo ""

# 测试 1: 健康检查
echo -e "${YELLOW}测试 1: 健康检查${NC}"
echo "GET $API_BASE_URL/health"
response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 健康检查通过${NC}"
    echo "响应: $body"
else
    echo -e "${RED}✗ 健康检查失败 (HTTP $http_code)${NC}"
    echo "响应: $body"
fi
echo ""

# 测试 2: 获取图片列表
echo -e "${YELLOW}测试 2: 获取图片列表${NC}"
echo "GET $API_BASE_URL/list?page=1&size=10"
response=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/list?page=1&size=10")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo -e "${GREEN}✓ 获取列表成功${NC}"
    echo "响应: $body" | python3 -m json.tool 2>/dev/null || echo "$body"
else
    echo -e "${RED}✗ 获取列表失败 (HTTP $http_code)${NC}"
    echo "响应: $body"
fi
echo ""

# 测试 3: 上传图片
if [ -f "$TEST_IMAGE" ]; then
    echo -e "${YELLOW}测试 3: 上传图片${NC}"
    echo "POST $API_BASE_URL/upload"
    echo "文件: $TEST_IMAGE"

    response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/upload" \
        -F "file=@$TEST_IMAGE" \
        -F "description=测试图片")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ 上传成功${NC}"
        echo "响应: $body" | python3 -m json.tool 2>/dev/null || echo "$body"

        # 提取图片 ID 用于删除测试
        image_id=$(echo "$body" | grep -o '"id":[0-9]*' | grep -o '[0-9]*' | head -1)

        if [ -n "$image_id" ]; then
            echo ""
            echo -e "${YELLOW}测试 4: 删除图片${NC}"
            echo "DELETE $API_BASE_URL/delete/$image_id"

            response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE_URL/delete/$image_id")
            http_code=$(echo "$response" | tail -n1)
            body=$(echo "$response" | sed '$d')

            if [ "$http_code" -eq 200 ]; then
                echo -e "${GREEN}✓ 删除成功${NC}"
                echo "响应: $body"
            else
                echo -e "${RED}✗ 删除失败 (HTTP $http_code)${NC}"
                echo "响应: $body"
            fi
        fi
    else
        echo -e "${RED}✗ 上传失败 (HTTP $http_code)${NC}"
        echo "响应: $body"
    fi
else
    echo -e "${YELLOW}测试 3: 上传图片${NC}"
    echo -e "${RED}✗ 测试图片不存在: $TEST_IMAGE${NC}"
    echo "请修改脚本中的 TEST_IMAGE 变量为实际的图片路径"
fi
echo ""

# 测试 5: 错误处理 - 上传非图片文件
echo -e "${YELLOW}测试 5: 错误处理 - 上传非图片文件${NC}"
echo "创建临时文本文件..."
echo "This is not an image" > /tmp/test.txt

response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/upload" \
    -F "file=@/tmp/test.txt")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 400 ] || [ "$http_code" -eq 500 ]; then
    echo -e "${GREEN}✓ 正确拒绝非图片文件${NC}"
    echo "响应: $body"
else
    echo -e "${RED}✗ 应该拒绝非图片文件 (HTTP $http_code)${NC}"
    echo "响应: $body"
fi

rm -f /tmp/test.txt
echo ""

# 测试 6: 错误处理 - 删除不存在的图片
echo -e "${YELLOW}测试 6: 错误处理 - 删除不存在的图片${NC}"
echo "DELETE $API_BASE_URL/delete/999999"

response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE_URL/delete/999999")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 500 ]; then
    echo -e "${GREEN}✓ 正确处理不存在的图片${NC}"
    echo "响应: $body"
else
    echo -e "${RED}✗ 错误处理异常 (HTTP $http_code)${NC}"
    echo "响应: $body"
fi
echo ""

echo "=========================================="
echo "测试完成"
echo "=========================================="
