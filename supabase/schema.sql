-- 健身追踪应用数据库表结构
-- 在 Supabase Dashboard > SQL Editor 中执行此脚本

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料表（扩展 Supabase Auth 的 users 表）
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    avatar_url TEXT,
    current_weight DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 每日记录表
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    diet_type VARCHAR(10) DEFAULT 'Med', -- High, Med, Low
    calories_intake DECIMAL(10,2) DEFAULT 0,
    protein_intake DECIMAL(10,2) DEFAULT 0,
    carbs_intake DECIMAL(10,2) DEFAULT 0,
    fat_intake DECIMAL(10,2) DEFAULT 0,
    workout_volume DECIMAL(10,2) DEFAULT 0,
    calories_burned DECIMAL(10,2) DEFAULT 0,
    weight DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- 饮食记录明细表
CREATE TABLE IF NOT EXISTS public.food_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    calories DECIMAL(10,2) NOT NULL,
    carbs DECIMAL(10,2) NOT NULL,
    protein DECIMAL(10,2) NOT NULL,
    fat DECIMAL(10,2) NOT NULL,
    image_url TEXT, -- 食物图片 URL（存储在 Supabase Storage）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 训练动作明细表
CREATE TABLE IF NOT EXISTS public.workout_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_log_id UUID NOT NULL REFERENCES public.daily_logs(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL,
    sets INT NOT NULL,
    reps INT NOT NULL,
    weight DECIMAL(10,2) NOT NULL,
    volume DECIMAL(10,2) NOT NULL, -- sets * reps * weight
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_food_entries_daily_log ON public.food_entries(daily_log_id);
CREATE INDEX IF NOT EXISTS idx_workout_entries_daily_log ON public.workout_entries(daily_log_id);

-- 启用 Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_entries ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户只能访问自己的数据
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own daily logs"
    ON public.daily_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily logs"
    ON public.daily_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily logs"
    ON public.daily_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily logs"
    ON public.daily_logs FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own food entries"
    ON public.food_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = food_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own food entries"
    ON public.food_entries FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = food_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own food entries"
    ON public.food_entries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = food_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own food entries"
    ON public.food_entries FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = food_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own workout entries"
    ON public.workout_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = workout_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own workout entries"
    ON public.workout_entries FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = workout_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own workout entries"
    ON public.workout_entries FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = workout_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own workout entries"
    ON public.workout_entries FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.daily_logs
            WHERE daily_logs.id = workout_entries.daily_log_id
            AND daily_logs.user_id = auth.uid()
        )
    );

-- 创建函数：自动更新 updated_at 时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_logs_updated_at BEFORE UPDATE ON public.daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

