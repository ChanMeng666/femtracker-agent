-- Fertility Tracking Tables Extension
-- This script adds fertility-related tables to the existing FemTracker database

-- Drop existing fertility tables if they exist
DROP TABLE IF EXISTS fertility_records CASCADE;
DROP TABLE IF EXISTS ovulation_tests CASCADE;
DROP TABLE IF EXISTS bbt_records CASCADE;

-- ============================================
-- Fertility Records Table (综合记录表)
-- ============================================
CREATE TABLE fertility_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    -- Basal Body Temperature
    bbt_celsius DECIMAL(4,2) CHECK (bbt_celsius >= 35.0 AND bbt_celsius <= 42.0),
    -- Cervical Mucus
    cervical_mucus VARCHAR(20) CHECK (cervical_mucus IN ('dry', 'sticky', 'creamy', 'watery', 'egg_white')),
    -- Ovulation Test
    ovulation_test VARCHAR(20) CHECK (ovulation_test IN ('negative', 'low', 'positive')),
    -- Other fertility signs
    cervical_position VARCHAR(20) CHECK (cervical_position IN ('low', 'medium', 'high')),
    cervical_firmness VARCHAR(20) CHECK (cervical_firmness IN ('firm', 'soft')),
    cervical_opening VARCHAR(20) CHECK (cervical_opening IN ('closed', 'slightly_open', 'open')),
    -- Symptoms related to fertility
    ovulation_pain BOOLEAN DEFAULT false,
    breast_tenderness BOOLEAN DEFAULT false,
    increased_libido BOOLEAN DEFAULT false,
    -- Notes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BBT Records Table (详细体温记录)
-- ============================================
CREATE TABLE bbt_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    temperature_celsius DECIMAL(4,2) NOT NULL CHECK (temperature_celsius >= 35.0 AND temperature_celsius <= 42.0),
    measurement_time TIME,
    sleep_quality VARCHAR(20) CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
    sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
    -- Factors that might affect BBT
    alcohol_consumed BOOLEAN DEFAULT false,
    illness BOOLEAN DEFAULT false,
    stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
    late_bedtime BOOLEAN DEFAULT false,
    disturbed_sleep BOOLEAN DEFAULT false,
    -- Calculated fields
    cycle_day INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- Ovulation Tests Table (详细排卵试纸记录)
-- ============================================
CREATE TABLE ovulation_tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    test_time TIME,
    result VARCHAR(20) NOT NULL CHECK (result IN ('negative', 'faint', 'positive', 'peak')),
    test_brand VARCHAR(100),
    test_type VARCHAR(50) CHECK (test_type IN ('urine', 'digital', 'saliva')),
    -- LH levels if digital test
    lh_level DECIMAL(5,2),
    -- Notes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Enable Row Level Security
-- ============================================
ALTER TABLE fertility_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE bbt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ovulation_tests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Create RLS Policies
-- ============================================

-- Fertility Records Policies
CREATE POLICY "Users can manage own fertility records" ON fertility_records
    FOR ALL USING (auth.uid() = user_id);

-- BBT Records Policies  
CREATE POLICY "Users can manage own BBT records" ON bbt_records
    FOR ALL USING (auth.uid() = user_id);

-- Ovulation Tests Policies
CREATE POLICY "Users can manage own ovulation tests" ON ovulation_tests
    FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Create Indexes
-- ============================================

-- Fertility Records Indexes
CREATE INDEX idx_fertility_records_user_date ON fertility_records(user_id, date DESC);
CREATE INDEX idx_fertility_records_date ON fertility_records(date DESC);

-- BBT Records Indexes
CREATE INDEX idx_bbt_records_user_date ON bbt_records(user_id, date DESC);
CREATE INDEX idx_bbt_records_temperature ON bbt_records(temperature_celsius);

-- Ovulation Tests Indexes
CREATE INDEX idx_ovulation_tests_user_date ON ovulation_tests(user_id, date DESC);
CREATE INDEX idx_ovulation_tests_result ON ovulation_tests(result);

-- ============================================
-- Create Updated At Triggers
-- ============================================

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_fertility_records_updated_at 
    BEFORE UPDATE ON fertility_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bbt_records_updated_at 
    BEFORE UPDATE ON bbt_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ovulation_tests_updated_at 
    BEFORE UPDATE ON ovulation_tests 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data (for testing)
-- ============================================

-- Note: Sample data should be inserted after user authentication is set up
-- This is just an example structure

-- INSERT INTO fertility_records (user_id, date, bbt_celsius, cervical_mucus, ovulation_test, notes)
-- VALUES 
-- (auth.uid(), CURRENT_DATE, 36.7, 'creamy', 'negative', 'Normal reading'),
-- (auth.uid(), CURRENT_DATE - INTERVAL '1 day', 36.8, 'watery', 'low', 'Slightly elevated temperature');

-- INSERT INTO bbt_records (user_id, date, temperature_celsius, measurement_time, sleep_quality, sleep_hours)
-- VALUES 
-- (auth.uid(), CURRENT_DATE, 36.7, '07:00:00', 'good', 8.0),
-- (auth.uid(), CURRENT_DATE - INTERVAL '1 day', 36.8, '07:15:00', 'fair', 7.5);

-- INSERT INTO ovulation_tests (user_id, date, test_time, result, test_brand)
-- VALUES 
-- (auth.uid(), CURRENT_DATE, '14:30:00', 'negative', 'ClearBlue'),
-- (auth.uid(), CURRENT_DATE - INTERVAL '1 day', '15:00:00', 'faint', 'ClearBlue'); 