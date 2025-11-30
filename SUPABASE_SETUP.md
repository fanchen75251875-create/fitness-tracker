# Supabase 集成指南

## 📋 第一步：创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "Start your project" 或 "Sign in"
3. 使用 GitHub 账号登录（推荐）
4. 点击 "New Project"
5. 填写项目信息：
   - **Name**: fitness-tracker
   - **Database Password**: 设置一个强密码（保存好！）
   - **Region**: 选择离你最近的区域（如 Northeast Asia (Tokyo)）
6. 等待项目创建完成（约 2 分钟）

## 📋 第二步：获取 API 密钥

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Settings** (⚙️)
2. 点击 **API**
3. 复制以下信息：
   - **Project URL** (例如: `https://xxxxx.supabase.co`)
   - **anon public** key (在 "Project API keys" 部分)

## 📋 第三步：配置环境变量

在项目根目录创建或编辑 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_key
```

**重要**：不要提交 `.env.local` 到 Git！

## 📋 第四步：创建数据库表

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 **New query**
3. 复制 `supabase/schema.sql` 文件的全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 或按 `Cmd/Ctrl + Enter`
6. 确认所有表创建成功（应该看到 "Success. No rows returned"）

## 📋 第五步：禁用邮箱确认（重要！）

为了让新用户注册后可以立即登录，需要禁用邮箱确认：

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Authentication**
2. 点击 **Providers**
3. 找到 **Email** 提供者
4. 取消勾选 **"Confirm email"** 选项
5. 点击 **Save** 保存设置

**注意**：禁用邮箱确认后，用户注册后可以立即登录，无需验证邮箱。

## 📋 第六步：配置 Storage（可选，用于存储图片）

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Storage**
2. 点击 **Create a new bucket**
3. 填写信息：
   - **Name**: `food-images`
   - **Public bucket**: ✅ 勾选（允许公开访问）
4. 点击 **Create bucket**
5. 在 **Policies** 标签页，添加策略：
   - 允许用户上传自己的图片
   - 允许所有人读取（因为是公开 bucket）

## ✅ 验证安装

运行开发服务器：
```bash
npm run dev
```

访问 http://localhost:3000，应该可以正常使用。

## 🔧 故障排除

### 问题：环境变量未生效
- 确保 `.env.local` 文件在项目根目录
- 重启开发服务器（`npm run dev`）

### 问题：RLS 策略错误
- 检查 SQL 脚本是否全部执行成功
- 在 Supabase Dashboard > Authentication > Policies 中检查策略

### 问题：认证失败
- 检查 API 密钥是否正确
- 确认 Supabase 项目状态为 "Active"

## 📚 下一步

完成以上步骤后，继续：
1. 替换认证系统（使用 Supabase Auth）
2. 迁移数据存储（localStorage → Supabase）
3. 测试数据同步

