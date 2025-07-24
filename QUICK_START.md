# 🚀 快速开始指南

> 3分钟快速部署食刻卡路里项目到GitHub

## 📋 简化版部署步骤

### 方法一：使用自动化脚本（推荐）

1. **给脚本添加执行权限**
   ```bash
   chmod +x deploy-to-github.sh
   ```

2. **运行部署脚本**
   ```bash
   ./deploy-to-github.sh
   ```

3. **按照提示输入信息**
   - GitHub 用户名
   - 仓库名称（默认：calorie-tracker）
   - 确认提交

4. **完成！** 🎉

### 方法二：手动部署

1. **在GitHub创建新仓库**
   - 仓库名：`calorie-tracker`
   - 勾选：Add README, .gitignore (Java), MIT License

2. **在项目根目录执行**
   ```bash
   # 初始化Git
   git init
   
   # 添加远程仓库（替换your-username）
   git remote add origin https://github.com/your-username/calorie-tracker.git
   
   # 添加文件
   git add .
   
   # 提交
   git commit -m "🎉 初始提交：食刻卡路里小程序项目"
   
   # 推送
   git branch -M main
   git push -u origin main
   ```

## ⚡ 注意事项

- 确保在项目根目录（包含 `miniprogram-1` 和 `houduan` 文件夹）执行命令
- 首次推送需要输入GitHub用户名和密码/Token
- 配置文件模板会自动创建，保护敏感信息

## 🔗 相关文档

- 📖 [完整README](README.md) - 项目详细介绍
- 📋 [详细部署指南](GITHUB_DEPLOYMENT_GUIDE.md) - 完整的GitHub部署教程
- ⚙️ [部署说明](DEPLOYMENT.md) - 环境配置和生产部署

---

需要帮助？查看 [详细部署指南](GITHUB_DEPLOYMENT_GUIDE.md) 或在GitHub仓库创建Issue。 