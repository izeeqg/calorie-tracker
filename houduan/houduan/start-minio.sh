#!/bin/bash

# MinIO启动脚本
# 卡路里跟踪项目专用

echo "正在启动MinIO对象存储服务..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "错误：Docker未安装。请先安装Docker。"
    exit 1
fi

# 检查MinIO容器是否已经存在
if docker ps -a --format "table {{.Names}}" | grep -q "^minio$"; then
    echo "MinIO容器已存在，正在检查状态..."
    
    # 检查容器是否正在运行
    if docker ps --format "table {{.Names}}" | grep -q "^minio$"; then
        echo "MinIO服务已在运行中！"
        echo "访问地址："
        echo "- API端点: http://localhost:9000"
        echo "- 管理控制台: http://localhost:9090"
        echo "- 默认用户名: minioadmin"
        echo "- 默认密码: minioadmin"
        exit 0
    else
        echo "启动现有MinIO容器..."
        docker start minio
    fi
else
    echo "创建并启动新的MinIO容器..."
    
    # 拉取最新镜像
    docker pull minio/minio
    
    # 创建数据卷
    docker volume create minio-data
    
    # 启动MinIO容器
    docker run -d \
      --name minio \
      --restart unless-stopped \
      -p 9000:9000 \
      -p 9090:9090 \
      -e "MINIO_ROOT_USER=minioadmin" \
      -e "MINIO_ROOT_PASSWORD=minioadmin" \
      -v minio-data:/data \
      minio/minio server /data --console-address ":9090"
fi

# 等待服务启动
echo "等待MinIO服务启动..."
sleep 5

# 配置桶和权限
echo "正在配置MinIO桶和权限..."
docker exec -i minio sh << 'EOF'
echo "配置MinIO客户端..."
mc alias set myminio http://localhost:9000 minioadmin minioadmin

echo "创建calorie-images桶（如果不存在）..."
mc mb myminio/calorie-images --ignore-existing

echo "设置桶策略为公开读取..."
mc anonymous set public myminio/calorie-images

echo "桶配置完成！"
EOF

# 检查服务状态
if docker ps | grep -q "minio"; then
    echo "✓ MinIO服务启动成功！"
    echo ""
    echo "访问信息："
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  API端点:     http://localhost:9000"
    echo "  管理控制台:   http://localhost:9090"
    echo "  用户名:      minioadmin"
    echo "  密码:        minioadmin"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "后续步骤："
    echo "1. 访问管理控制台创建存储桶 'calorie-images'"
    echo "2. 设置桶策略为公共读取（用于图片访问）"
    echo "3. 启动Spring Boot应用"
    echo ""
    echo "查看详细配置说明: cat README_MINIO_SETUP.md"
else
    echo "✗ MinIO服务启动失败！"
    echo "查看日志: docker logs minio"
    exit 1
fi 