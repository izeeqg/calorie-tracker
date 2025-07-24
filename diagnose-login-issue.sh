#!/bin/bash

# 登录问题诊断脚本
# 使用方法：./diagnose-login-issue.sh

echo "🔍 食刻卡路里登录问题诊断脚本"
echo "================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 诊断结果
ISSUES_FOUND=0

echo -e "${BLUE}📋 开始系统诊断...${NC}"
echo ""

# 1. 检查后端服务状态
echo -e "${BLUE}1. 检查后端服务状态${NC}"
if pgrep -f "calorie-tracker" > /dev/null; then
    echo -e "${GREEN}✅ 后端服务正在运行${NC}"
    ps aux | grep "calorie-tracker" | grep -v grep
else
    echo -e "${RED}❌ 后端服务未运行${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 检查端口8080
if netstat -ln | grep ":8080" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 端口8080正在监听${NC}"
else
    echo -e "${RED}❌ 端口8080未监听${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# 2. 检查数据库连接
echo -e "${BLUE}2. 检查数据库服务${NC}"
if systemctl is-active --quiet mysql; then
    echo -e "${GREEN}✅ MySQL服务正在运行${NC}"
    
    # 尝试连接数据库
    if mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 数据库连接正常${NC}"
        
        # 检查calorie_tracker数据库是否存在
        if mysql -u root -e "USE calorie_tracker; SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ calorie_tracker数据库存在${NC}"
        else
            echo -e "${RED}❌ calorie_tracker数据库不存在${NC}"
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  数据库连接需要密码验证${NC}"
    fi
else
    echo -e "${RED}❌ MySQL服务未运行${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# 3. 检查Redis服务
echo -e "${BLUE}3. 检查Redis服务${NC}"
if systemctl is-active --quiet redis; then
    echo -e "${GREEN}✅ Redis服务正在运行${NC}"
    
    # 测试Redis连接
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis连接正常${NC}"
    else
        echo -e "${RED}❌ Redis连接失败${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "${RED}❌ Redis服务未运行${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# 4. 检查后端API连通性
echo -e "${BLUE}4. 检查后端API连通性${NC}"

# 检查本地API
if curl -s -f "http://localhost:8080/api/user/login" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 本地API可访问${NC}"
else
    echo -e "${YELLOW}⚠️  本地API不可访问或返回错误${NC}"
fi

# 检查生产API
if curl -s -f "https://calorietracker.top/api" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 生产环境API可访问${NC}"
else
    echo -e "${YELLOW}⚠️  生产环境API不可访问${NC}"
fi
echo ""

# 5. 检查配置文件
echo -e "${BLUE}5. 检查配置文件${NC}"

CONFIG_FILES=(
    "houduan/houduan/src/main/resources/application-dev.yml"
    "houduan/houduan/src/main/resources/application-prod.yml"
    "miniprogram-1/utils/constants.js"
)

for file in "${CONFIG_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file 存在${NC}"
    else
        echo -e "${RED}❌ $file 不存在${NC}"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
done
echo ""

# 6. 检查日志文件
echo -e "${BLUE}6. 检查日志文件${NC}"

LOG_PATHS=(
    "houduan/houduan/logs/"
    "/var/log/"
    "./"
)

LOG_FOUND=false
for path in "${LOG_PATHS[@]}"; do
    if [ -d "$path" ]; then
        SPRING_LOGS=$(find "$path" -name "*spring*" -o -name "*calorie*" -o -name "*.log" 2>/dev/null | head -5)
        if [ ! -z "$SPRING_LOGS" ]; then
            echo -e "${GREEN}✅ 发现日志文件：${NC}"
            echo "$SPRING_LOGS" | while read log; do
                echo "   - $log"
            done
            LOG_FOUND=true
            break
        fi
    fi
done

if [ "$LOG_FOUND" = false ]; then
    echo -e "${YELLOW}⚠️  未找到日志文件${NC}"
fi
echo ""

# 7. 网络连通性测试
echo -e "${BLUE}7. 网络连通性测试${NC}"

# 测试微信API连通性
if ping -c 1 api.weixin.qq.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 微信API网络连通${NC}"
else
    echo -e "${RED}❌ 微信API网络不通${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# 测试本地服务
if curl -s "http://localhost:8080" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 本地服务可访问${NC}"
else
    echo -e "${YELLOW}⚠️  本地服务不可访问${NC}"
fi
echo ""

# 8. 系统资源检查
echo -e "${BLUE}8. 系统资源检查${NC}"

# 检查内存使用
MEMORY_USAGE=$(free | awk 'FNR==2{printf "%.1f", $3/($3+$4)*100}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo -e "${RED}❌ 内存使用率过高: ${MEMORY_USAGE}%${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ 内存使用率正常: ${MEMORY_USAGE}%${NC}"
fi

# 检查磁盘空间
DISK_USAGE=$(df / | awk 'FNR==2{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${RED}❌ 磁盘使用率过高: ${DISK_USAGE}%${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ 磁盘使用率正常: ${DISK_USAGE}%${NC}"
fi
echo ""

# 诊断总结
echo "================================="
echo -e "${BLUE}📊 诊断总结${NC}"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 系统状态良好，没有发现明显问题！${NC}"
    echo ""
    echo -e "${YELLOW}💡 建议检查以下配置：${NC}"
    echo "1. 微信小程序AppID和AppSecret是否正确"
    echo "2. 后端日志中是否有具体的错误信息"
    echo "3. 小程序开发工具中的网络设置"
else
    echo -e "${RED}⚠️  发现 $ISSUES_FOUND 个问题需要解决${NC}"
    echo ""
    echo -e "${YELLOW}🔧 建议的解决步骤：${NC}"
    echo "1. 启动缺失的服务（MySQL、Redis、后端服务）"
    echo "2. 检查配置文件中的数据库连接信息"
    echo "3. 查看详细的错误日志"
    echo "4. 参考 LOGIN_TROUBLESHOOTING.md 进行详细排查"
fi

echo ""
echo -e "${BLUE}📋 快速修复命令：${NC}"
echo ""
echo "# 启动MySQL服务"
echo "sudo systemctl start mysql"
echo ""
echo "# 启动Redis服务"  
echo "sudo systemctl start redis"
echo ""
echo "# 重启后端服务"
echo "cd houduan/houduan && mvn spring-boot:run"
echo ""
echo "# 查看后端日志"
echo "tail -f houduan/houduan/logs/spring.log"
echo ""
echo -e "${BLUE}📖 详细解决方案请查看：LOGIN_TROUBLESHOOTING.md${NC}" 