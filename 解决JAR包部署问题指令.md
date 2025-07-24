# 解决JAR包部署问题 - 完整指令

## 🔍 问题分析

您遇到的问题是Docker Compose试图构建后端源码，但实际上后端是以JAR包形式存在于 `/root/calorie-app/app.jar`。

错误信息：
```
failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

## 🚀 解决方案

### 方案一：使用修正脚本（推荐）

#### 1. 上传修正脚本到服务器
```bash
# 在本地执行
scp 修正Docker配置脚本.sh root@59.110.150.196:/root/
```

#### 2. 在服务器上执行修正
```bash
# 连接到服务器
ssh root@59.110.150.196

# 设置权限并执行修正脚本
chmod +x 修正Docker配置脚本.sh
./修正Docker配置脚本.sh
```

#### 3. 启动服务
```bash
# 进入项目目录
cd /opt/calorie-app

# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

---

### 方案二：手动修正（如果脚本不可用）

#### 1. 连接到服务器
```bash
ssh root@59.110.150.196
```

#### 2. 检查JAR包是否存在
```bash
ls -la /root/calorie-app/app.jar
# 应该看到JAR包文件
```

#### 3. 备份并修正Docker Compose配置
```bash
cd /opt/calorie-app

# 备份原配置
cp docker-compose.yml docker-compose.yml.backup

# 编辑配置文件
vi docker-compose.yml
```

#### 4. 修改后端服务配置
将原来的后端服务配置：
```yaml
  calorie-backend:
    build: ./houduan/houduan
    container_name: calorie-backend
    # ... 其他配置
```

修改为：
```yaml
  calorie-backend:
    image: openjdk:17-jre-slim
    container_name: calorie-backend
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/calorie_tracker?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
      SPRING_DATASOURCE_USERNAME: calorie_user
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_PASSWORD}
      SPRING_REDIS_HOST: redis
      SPRING_REDIS_PORT: 6379
      SPRING_REDIS_PASSWORD: ${REDIS_PASSWORD}
      MINIO_ENDPOINT: http://minio:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: ${MINIO_PASSWORD}
      MINIO_BUCKET_NAME: calorie-images
      MINIO_DOMAIN: https://calorietracker.top/files
      TZ: Asia/Shanghai
      JAVA_OPTS: "-Xms512m -Xmx1024m"
    ports:
      - "8080:8080"
    volumes:
      - /root/calorie-app/app.jar:/app/app.jar:ro
      - ./uploads:/app/uploads
      - ./logs:/var/log/calorie-tracker
    command: ["java", "-jar", "/app/app.jar"]
    depends_on:
      - mysql
      - redis
      - minio
    networks:
      - calorie-network
```

#### 5. 拉取Java镜像并启动
```bash
# 拉取Java运行时镜像
docker pull openjdk:17-jre-slim

# 启动服务
docker compose up -d
```

---

## 🔍 验证部署

### 1. 检查服务状态
```bash
cd /opt/calorie-app
docker compose ps
```

预期输出应该显示所有服务都在运行：
```
NAME               IMAGE                 COMMAND                  SERVICE           CREATED         STATUS          PORTS
calorie-backend    openjdk:17-jre-slim   "java -jar /app/app.…"   calorie-backend   2 minutes ago   Up 2 minutes    0.0.0.0:8080->8080/tcp
calorie-mysql      mysql:8.0             "docker-entrypoint.s…"   mysql             2 minutes ago   Up 2 minutes    0.0.0.0:3306->3306/tcp
calorie-nginx      nginx:alpine          "/docker-entrypoint.…"   nginx             2 minutes ago   Up 2 minutes    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
calorie-redis      redis:alpine          "docker-entrypoint.s…"   redis             2 minutes ago   Up 2 minutes    0.0.0.0:6379->6379/tcp
calorie-minio      minio/minio:latest    "/usr/bin/docker-ent…"   minio             2 minutes ago   Up 2 minutes    0.0.0.0:9000->9000/tcp, 0.0.0.0:9090->9090/tcp
```

### 2. 检查后端服务日志
```bash
docker compose logs calorie-backend
```

应该看到Spring Boot启动日志，最后显示：
```
Started Application in X.XXX seconds (JVM running for X.XXX)
```

### 3. 测试API访问
```bash
# 测试本地API
curl http://localhost:8080/actuator/health

# 测试通过Nginx的API
curl http://localhost/api/health
```

### 4. 测试域名访问（如果DNS已生效）
```bash
curl -I http://calorietracker.top
curl -I http://calorietracker.top/api/health
```

---

## 🚨 常见问题排查

### 1. JAR包不存在
```bash
# 检查JAR包位置
find /root -name "*.jar" -type f
```

### 2. Java版本问题
如果JAR包需要特定Java版本，修改镜像：
```yaml
# 对于Java 8
image: openjdk:8-jre-slim

# 对于Java 11
image: openjdk:11-jre-slim

# 对于Java 17（默认）
image: openjdk:17-jre-slim
```

### 3. 内存不足
如果服务器内存不足，调整Java参数：
```yaml
environment:
  JAVA_OPTS: "-Xms256m -Xmx512m"
```

### 4. 端口冲突
检查端口占用：
```bash
netstat -tulpn | grep -E "(8080|3306|6379|9000|80)"
```

---

## 📋 完整的执行命令总结

```bash
# 1. 连接服务器
ssh root@59.110.150.196

# 2. 上传并执行修正脚本（推荐）
chmod +x 修正Docker配置脚本.sh
./修正Docker配置脚本.sh

# 3. 启动服务
cd /opt/calorie-app
docker compose up -d

# 4. 检查状态
docker compose ps
docker compose logs -f

# 5. 测试访问
curl http://localhost:8080/actuator/health
curl http://calorietracker.top
```

---

## ✅ 成功标志

- 所有5个容器都显示为 "Up" 状态
- 后端日志显示 "Started Application" 
- API健康检查返回成功
- 域名可以正常访问

现在您可以按照这些步骤解决JAR包部署问题了！ 