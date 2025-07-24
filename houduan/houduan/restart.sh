#!/bin/bash
echo "正在停止先前运行的应用..."
pid=$(lsof -t -i:8080 2>/dev/null)
if [ -n "$pid" ]; then
    echo "终止进程 $pid"
    kill -9 $pid
fi

# 等待端口释放
sleep 2

echo "清理日志..."
rm -f *.log

echo "编译并启动应用..."
./mvnw clean spring-boot:run &

echo "等待应用启动..."
sleep 10

echo "应用已启动，通过http://localhost:8080/api访问" 