# 🚀 部署指南

## 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com
2. 点击右上角 **"+"** → **"New repository"**
3. 填写信息：
   - **Repository name**: `fitness-tracker`（或你喜欢的名字）
   - **Description**: 可选
   - **Visibility**: 选择 **Public**（免费）或 **Private**（私有）
   - **不要**勾选 "Initialize this repository with a README"
4. 点击 **"Create repository"**

## 步骤 2：推送代码到 GitHub

在终端执行以下命令（替换 `<你的GitHub用户名>` 和 `<仓库名>`）：

```bash
# 添加远程仓库
git remote add origin https://github.com/<你的GitHub用户名>/<仓库名>.git

# 推送代码
git branch -M main
git push -u origin main
```

**示例**：
```bash
git remote add origin https://github.com/yourusername/fitness-tracker.git
git branch -M main
git push -u origin main
```

## 步骤 3：在 Vercel 部署

### 3.1 登录 Vercel
1. 访问 https://vercel.com
2. 点击 **"Sign Up"** 或 **"Log In"**
3. 选择 **"Continue with GitHub"**（使用 GitHub 账号登录）

### 3.2 导入项目
1. 登录后，点击 **"Add New..."** → **"Project"**
2. 在项目列表中找到你的 `fitness-tracker` 仓库
3. 点击 **"Import"**

### 3.3 配置项目
1. **Project Name**: 可以保持默认或修改
2. **Framework Preset**: 应该自动识别为 "Next.js"
3. **Root Directory**: 保持默认 `./`
4. **Build Command**: 保持默认 `npm run build`
5. **Output Directory**: 保持默认 `.next`

### 3.4 配置环境变量 ⚠️ 重要！
在 **"Environment Variables"** 部分，添加以下变量：

```
NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_Supabase_anon_key
GEMINI_API_KEY=你的_Gemini_API_Key
```

**如何获取这些值**：
- `NEXT_PUBLIC_SUPABASE_URL`: 从 `.env.local` 文件复制
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 从 `.env.local` 文件复制
- `GEMINI_API_KEY`: 从 `.env.local` 文件复制（如果已配置）

### 3.5 部署
1. 点击 **"Deploy"** 按钮
2. 等待部署完成（通常 2-5 分钟）
3. 部署完成后，你会看到一个绿色的 **"Success"** 消息
4. 点击 **"Visit"** 按钮，你的应用就可以在公网访问了！

## 步骤 4：验证部署

1. 访问 Vercel 提供的域名（例如：`your-app.vercel.app`）
2. 测试注册/登录功能
3. 测试添加食物记录
4. 确认数据能正常保存

## 步骤 5：自定义域名（可选）

1. 在 Vercel Dashboard，进入你的项目
2. 点击 **Settings** → **Domains**
3. 输入你的域名（例如：`fitness-tracker.com`）
4. 按照提示配置 DNS 记录
5. 等待 DNS 生效（通常几分钟到几小时）

## 🔒 安全提示

- ✅ `.env.local` 文件已经在 `.gitignore` 中，不会被提交
- ✅ 环境变量在 Vercel 中是加密存储的
- ✅ 只有你可以在 Vercel Dashboard 中查看环境变量

## 📝 后续更新

每次你修改代码后：

```bash
git add .
git commit -m "描述你的更改"
git push
```

Vercel 会自动检测到代码更新并重新部署！

## 🆘 遇到问题？

### 部署失败
- 检查环境变量是否正确配置
- 查看 Vercel 的构建日志（Build Logs）
- 确认所有依赖都已安装

### 应用无法访问
- 检查环境变量是否都已添加
- 确认 Supabase 项目状态为 "Active"
- 查看浏览器控制台的错误信息

### 数据无法保存
- 检查 Supabase RLS 策略是否正确
- 确认用户已登录
- 查看 Supabase Dashboard 的日志

---

**部署完成后，你的应用就可以在公网访问了！** 🎉

