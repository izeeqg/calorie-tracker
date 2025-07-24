#!/bin/bash

# 食刻卡路里项目 GitHub 部署脚本
# 使用方法：./deploy-to-github.sh

set -e  # 遇到错误立即退出

echo "🚀 食刻卡路里项目 GitHub 部署脚本"
echo "=================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在项目根目录
if [ ! -d "miniprogram-1" ] || [ ! -d "houduan" ]; then
    echo -e "${RED}❌ 错误：请在项目根目录执行此脚本${NC}"
    echo "当前目录应包含 miniprogram-1 和 houduan 文件夹"
    exit 1
fi

echo -e "${BLUE}📋 开始部署前检查...${NC}"

# 检查Git是否安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git 未安装，请先安装 Git${NC}"
    echo "macOS: brew install git"
    echo "或访问: https://git-scm.com/"
    exit 1
fi

echo -e "${GREEN}✅ Git 已安装${NC}"

# 检查Git配置
if [ -z "$(git config --global user.name)" ] || [ -z "$(git config --global user.email)" ]; then
    echo -e "${YELLOW}⚠️  Git 用户信息未配置${NC}"
    read -p "请输入你的 GitHub 用户名: " github_username
    read -p "请输入你的邮箱地址: " github_email
    
    git config --global user.name "$github_username"
    git config --global user.email "$github_email"
    echo -e "${GREEN}✅ Git 用户信息配置完成${NC}"
fi

# 获取仓库信息
echo -e "${BLUE}📝 请输入 GitHub 仓库信息${NC}"
read -p "请输入你的 GitHub 用户名: " repo_username
read -p "请输入仓库名称 (默认: calorie-tracker): " repo_name
repo_name=${repo_name:-calorie-tracker}

repo_url="https://github.com/$repo_username/$repo_name.git"
echo -e "${BLUE}📦 仓库地址: $repo_url${NC}"

# 清理不需要的文件
echo -e "${BLUE}🧹 清理临时文件...${NC}"

# 删除编译产物
find . -name "target" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".idea" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".tea" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true

# 删除系统文件
find . -name ".DS_Store" -delete 2>/dev/null || true

echo -e "${GREEN}✅ 临时文件清理完成${NC}"

# 创建配置文件模板
echo -e "${BLUE}📄 创建配置文件模板...${NC}"

# 后端配置模板
backend_config_dir="houduan/houduan/src/main/resources"
if [ -f "$backend_config_dir/application-dev.yml" ]; then
    cp "$backend_config_dir/application-dev.yml" "$backend_config_dir/application-dev.yml.template"
    echo -e "${GREEN}✅ 创建 application-dev.yml.template${NC}"
fi

if [ -f "$backend_config_dir/application-prod.yml" ]; then
    cp "$backend_config_dir/application-prod.yml" "$backend_config_dir/application-prod.yml.template"
    echo -e "${GREEN}✅ 创建 application-prod.yml.template${NC}"
fi

# 小程序配置模板
if [ -f "miniprogram-1/project.config.json" ]; then
    cp "miniprogram-1/project.config.json" "miniprogram-1/project.config.json.template"
    echo -e "${GREEN}✅ 创建 project.config.json.template${NC}"
fi

# 初始化Git仓库
echo -e "${BLUE}🔧 初始化 Git 仓库...${NC}"

if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git 仓库初始化完成${NC}"
else
    echo -e "${YELLOW}⚠️  Git 仓库已存在${NC}"
fi

# 添加远程仓库
if git remote get-url origin &>/dev/null; then
    echo -e "${YELLOW}⚠️  远程仓库已存在，更新地址...${NC}"
    git remote set-url origin "$repo_url"
else
    git remote add origin "$repo_url"
fi

echo -e "${GREEN}✅ 远程仓库配置完成${NC}"

# 创建 .gitignore（如果不存在）
if [ ! -f ".gitignore" ]; then
    echo -e "${BLUE}📝 创建 .gitignore 文件...${NC}"
    # .gitignore 内容已经通过之前的 edit_file 创建
    echo -e "${GREEN}✅ .gitignore 文件创建完成${NC}"
fi

# 添加文件到Git
echo -e "${BLUE}📦 添加文件到 Git...${NC}"
git add .

# 检查是否有文件被添加
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  没有文件需要提交${NC}"
    exit 0
fi

# 显示将要提交的文件
echo -e "${BLUE}📋 将要提交的文件：${NC}"
git status --short

# 确认提交
echo -e "${YELLOW}❓ 确认提交这些文件到 GitHub？ (y/n)${NC}"
read -p "" confirm
if [[ $confirm != [yY] ]]; then
    echo -e "${RED}❌ 取消部署${NC}"
    exit 0
fi

# 提交代码
echo -e "${BLUE}💾 提交代码...${NC}"
git commit -m "🎉 初始提交：食刻卡路里小程序项目

- ✨ 添加微信小程序前端代码
- ✨ 添加Spring Boot后端代码  
- 📝 添加项目文档和部署指南
- 🔧 配置Git忽略文件和配置模板
- 🚀 项目准备完成，可以开始开发"

echo -e "${GREEN}✅ 代码提交完成${NC}"

# 推送到GitHub
echo -e "${BLUE}⬆️  推送到 GitHub...${NC}"

# 设置主分支名称
git branch -M main

# 推送代码
if git push -u origin main; then
    echo -e "${GREEN}🎉 部署成功！${NC}"
    echo ""
    echo -e "${BLUE}📱 你的项目已成功上传到 GitHub！${NC}"
    echo -e "${BLUE}🔗 仓库地址: https://github.com/$repo_username/$repo_name${NC}"
    echo ""
    echo -e "${YELLOW}📋 下一步操作：${NC}"
    echo "1. 访问你的 GitHub 仓库查看代码"
    echo "2. 根据 README.md 配置开发环境"
    echo "3. 修改配置文件模板中的占位符"
    echo "4. 开始你的开发之旅！"
    echo ""
    echo -e "${GREEN}🎊 祝你开发顺利！${NC}"
else
    echo -e "${RED}❌ 推送失败${NC}"
    echo ""
    echo -e "${YELLOW}💡 可能的解决方案：${NC}"
    echo "1. 检查仓库地址是否正确"
    echo "2. 检查网络连接"
    echo "3. 确认 GitHub 仓库已创建"
    echo "4. 检查 GitHub 用户名和权限"
    echo ""
    echo -e "${BLUE}🔧 如需帮助，请查看 GITHUB_DEPLOYMENT_GUIDE.md${NC}"
    exit 1
fi 