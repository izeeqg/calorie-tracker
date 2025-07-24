# MinIO对象存储配置指南

## 1. MinIO简介

MinIO是一个高性能的对象存储服务，兼容Amazon S3 API。本项目使用MinIO来存储用户上传的图片文件。

## 2. MinIO安装和启动

### 方式一：使用Docker（推荐）

```bash
# 拉取MinIO镜像
docker pull minio/minio

# 启动MinIO服务
docker run -d \
  --name minio \
  -p 9000:9000 \
  -p 9090:9090 \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  -v minio-data:/data \
  minio/minio server /data --console-address ":9090"
```

### 方式二：直接安装

**macOS:**
```bash
brew install minio/stable/minio
minio server ~/minio-data --console-address ":9090"
```

**Linux:**
```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server ~/minio-data --console-address ":9090"
```

**Windows:**
下载并运行 minio.exe
```
minio.exe server C:\minio-data --console-address ":9090"
```

## 3. 访问MinIO管理控制台

启动后访问：http://localhost:9090

默认登录信息：
- 用户名：minioadmin
- 密码：minioadmin

## 4. 配置桶（Bucket）

### 手动创建桶
1. 登录管理控制台
2. 点击"Create Bucket"
3. 输入桶名称：`calorie-images`
4. 设置桶策略为公共读取（用于图片访问）

### 设置桶策略
在桶设置中添加以下策略，允许公共读取：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::calorie-images/*"]
    }
  ]
}
```

## 5. 应用配置

在 `application.yml` 中配置MinIO连接信息：

```yaml
minio:
  endpoint: http://localhost:9000
  access-key: minioadmin
  secret-key: minioadmin
  bucket-name: calorie-images
  domain: http://localhost:9000  # 外部访问域名
```

## 6. 生产环境配置建议

### 安全配置
1. 修改默认的access-key和secret-key
2. 使用HTTPS访问
3. 配置防火墙规则
4. 启用访问日志

### 性能配置
1. 配置SSD存储
2. 调整内存分配
3. 配置负载均衡

### 示例生产配置
```yaml
minio:
  endpoint: https://minio.yourdomain.com
  access-key: your-access-key
  secret-key: your-secret-key
  bucket-name: calorie-images
  domain: https://minio.yourdomain.com
```

## 7. 常见问题

### Q: 无法访问上传的图片
A: 确保桶策略设置为公共读取，或者配置正确的访问权限。

### Q: 上传失败
A: 检查MinIO服务是否启动，网络连接是否正常，配置信息是否正确。

### Q: 性能问题
A: 考虑使用SSD存储，增加内存分配，或者配置MinIO集群。

## 8. 迁移现有文件

如果之前使用本地存储，可以使用以下脚本迁移文件到MinIO：

```bash
# 使用mc客户端工具迁移
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc cp --recursive ./uploads/ myminio/calorie-images/
``` 