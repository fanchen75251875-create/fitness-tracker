# 🚀 快速开始指南

## ✅ 已完成的工作

1. ✅ 安装 Supabase 客户端库
2. ✅ 创建 Supabase 客户端配置
3. ✅ 设计数据库表结构（SQL）
4. ✅ 替换认证系统（使用 Supabase Auth）
5. ✅ 更新登录/注册页面

## 📋 接下来需要做的（5 分钟）

### 步骤 1：创建 Supabase 项目

1. 访问 https://supabase.com
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 填写项目信息：
   - Name: `fitness-tracker`
   - Database Password: 设置一个强密码（保存好！）
   - Region: 选择最近的区域
5. 等待项目创建（约 2 分钟）

### 步骤 2：获取 API 密钥

1. 在 Supabase Dashboard，点击左侧 **Settings** (⚙️)
2. 点击 **API**
3. 复制以下信息：
   - **Project URL** (例如: `https://xxxxx.supabase.co`)
   - **anon public** key

### 步骤 3：配置环境变量

在项目根目录创建 `.env.local` 文件：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的_Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_public_key
GEMINI_API_KEY=你的_Gemini_API_Key（如果还没有）
```

### 步骤 4：创建数据库表

1. 在 Supabase Dashboard，点击左侧 **SQL Editor**
2. 点击 **New query**
3. 打开项目中的 `supabase/schema.sql` 文件
4. 复制全部内容到 SQL Editor
5. 点击 **Run** 或按 `Cmd/Ctrl + Enter`
6. 确认看到 "Success. No rows returned"

### 步骤 5：测试

```bash
npm run dev
```

访问 http://localhost:3000

1. 点击 "注册" 创建新账号（使用邮箱）
2. 登录测试
3. 检查 Supabase Dashboard > Table Editor，应该能看到 `user_profiles` 表中有新用户

## ⚠️ 注意事项

- `.env.local` 文件不要提交到 Git
- 确保 Supabase 项目状态为 "Active"
- 如果遇到认证错误，检查 API 密钥是否正确

## 🎯 下一步

完成以上步骤后，继续：
- [ ] 迁移数据存储（localStorage → Supabase）
- [ ] 测试数据同步
- [ ] 部署到 Vercel

## 📚 详细文档

查看 `SUPABASE_SETUP.md` 获取更详细的说明。

