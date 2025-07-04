-- 扩展数据库schema - 第一阶段核心功能表
-- 在现有数据库的基础上添加新表
-- 注意：database-setup.sql已经创建了基础表，此脚本只添加新的扩展表

-- 检查并处理现有的health_overview视图
DROP VIEW IF EXISTS health_overview CASCADE;

-- 删除可能存在的扩展表（与database-setup.sql中的表不冲突）
DROP TABLE IF EXISTS personalized_tips CASCADE;
DROP TABLE IF EXISTS health_overview CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS health_metrics CASCADE;
DROP TABLE IF EXISTS correlation_analyses CASCADE;

-- 删除可能存在的函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS initialize_user_health_overview() CASCADE;

-- ============================================
-- 第一部分：创建扩展表（不与现有表冲突）
-- ============================================

-- 注意：quick_records 和 health_insights 已在database-setup.sql中存在，我们跳过这些表

-- 个性化提示表（新增）
CREATE TABLE personalized_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tip_type VARCHAR(20) NOT NULL CHECK (tip_type IN ('reminder', 'suggestion', 'warning', 'achievement')),
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    action_text VARCHAR(100),
    action_link VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 健康概览表（替换原来的视图，存储用户的各项健康分数）
CREATE TABLE health_overview (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    cycle_health INTEGER DEFAULT 0 CHECK (cycle_health >= 0 AND cycle_health <= 100),
    nutrition_score INTEGER DEFAULT 0 CHECK (nutrition_score >= 0 AND nutrition_score <= 100),
    exercise_score INTEGER DEFAULT 0 CHECK (exercise_score >= 0 AND exercise_score <= 100),
    fertility_score INTEGER DEFAULT 0 CHECK (fertility_score >= 0 AND fertility_score <= 100),
    lifestyle_score INTEGER DEFAULT 0 CHECK (lifestyle_score >= 0 AND lifestyle_score <= 100),
    symptoms_score INTEGER DEFAULT 0 CHECK (symptoms_score >= 0 AND symptoms_score <= 100),
    last_updated DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id)
);

-- AI洞察记录表（用于洞察页面，与现有health_insights区分）
CREATE TABLE ai_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    insight_type VARCHAR(20) NOT NULL CHECK (insight_type IN ('positive', 'improvement', 'warning', 'neutral')),
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    is_active BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 健康指标表（新增）
CREATE TABLE health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    trend VARCHAR(10) NOT NULL CHECK (trend IN ('up', 'down', 'stable')),
    color VARCHAR(50) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 相关性分析表（新增）
CREATE TABLE correlation_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    correlation DECIMAL(3,2) NOT NULL CHECK (correlation >= -1.0 AND correlation <= 1.0),
    suggestion TEXT,
    confidence_level VARCHAR(20) DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
    is_active BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 第二部分：扩展现有表结构（如果需要）
-- ============================================

-- 为现有的health_insights表添加新字段（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'health_insights' AND column_name = 'is_active') THEN
        ALTER TABLE health_insights ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'health_insights' AND column_name = 'updated_at') THEN
        ALTER TABLE health_insights ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
    END IF;
END
$$;

-- ============================================
-- 第三部分：创建索引
-- ============================================

-- personalized_tips 索引
CREATE INDEX idx_personalized_tips_user_active ON personalized_tips(user_id, is_active);
CREATE INDEX idx_personalized_tips_type ON personalized_tips(tip_type);

-- health_overview 索引
CREATE INDEX idx_health_overview_user ON health_overview(user_id);
CREATE INDEX idx_health_overview_updated ON health_overview(last_updated DESC);

-- ai_insights 索引
CREATE INDEX idx_ai_insights_user_active ON ai_insights(user_id, is_active);
CREATE INDEX idx_ai_insights_category ON ai_insights(category);
CREATE INDEX idx_ai_insights_generated ON ai_insights(generated_at DESC);

-- health_metrics 索引
CREATE INDEX idx_health_metrics_user_date ON health_metrics(user_id, date DESC);
CREATE INDEX idx_health_metrics_category ON health_metrics(category);

-- correlation_analyses 索引
CREATE INDEX idx_correlation_analyses_user_active ON correlation_analyses(user_id, is_active);
CREATE INDEX idx_correlation_analyses_generated ON correlation_analyses(generated_at DESC);

-- 为现有health_insights表创建额外索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_health_insights_user_active ON health_insights(user_id, is_active);

-- ============================================
-- 第四部分：启用行级安全(RLS)
-- ============================================

ALTER TABLE personalized_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_overview ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE correlation_analyses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 第五部分：创建RLS策略
-- ============================================

-- personalized_tips policies
CREATE POLICY "Users can view own personalized tips" ON personalized_tips FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own personalized tips" ON personalized_tips FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own personalized tips" ON personalized_tips FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own personalized tips" ON personalized_tips FOR DELETE USING (auth.uid() = user_id);

-- health_overview policies
CREATE POLICY "Users can view own health overview" ON health_overview FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health overview" ON health_overview FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health overview" ON health_overview FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health overview" ON health_overview FOR DELETE USING (auth.uid() = user_id);

-- ai_insights policies
CREATE POLICY "Users can view own ai insights" ON ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai insights" ON ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ai insights" ON ai_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ai insights" ON ai_insights FOR DELETE USING (auth.uid() = user_id);

-- health_metrics policies
CREATE POLICY "Users can view own health metrics" ON health_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health metrics" ON health_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own health metrics" ON health_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own health metrics" ON health_metrics FOR DELETE USING (auth.uid() = user_id);

-- correlation_analyses policies
CREATE POLICY "Users can view own correlation analyses" ON correlation_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own correlation analyses" ON correlation_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own correlation analyses" ON correlation_analyses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own correlation analyses" ON correlation_analyses FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 第六部分：创建触发器函数和触发器
-- ============================================

-- 创建触发器函数用于自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为新表添加 updated_at 触发器
CREATE TRIGGER update_personalized_tips_updated_at BEFORE UPDATE ON personalized_tips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_overview_updated_at BEFORE UPDATE ON health_overview FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_metrics_updated_at BEFORE UPDATE ON health_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_correlation_analyses_updated_at BEFORE UPDATE ON correlation_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为现有的health_insights表添加触发器（如果updated_at字段存在）
CREATE TRIGGER update_health_insights_updated_at BEFORE UPDATE ON health_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第七部分：用户初始化功能
-- ============================================

-- 创建函数：初始化用户健康概览
CREATE OR REPLACE FUNCTION initialize_user_health_overview()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO health_overview (user_id, overall_score, cycle_health, nutrition_score, exercise_score, fertility_score, lifestyle_score, symptoms_score)
    VALUES (NEW.id, 75, 75, 75, 75, 75, 75, 75)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为profiles表添加触发器，自动创建健康概览
DROP TRIGGER IF EXISTS trigger_initialize_health_overview ON profiles;
CREATE TRIGGER trigger_initialize_health_overview
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION initialize_user_health_overview(); 