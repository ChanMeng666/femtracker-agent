# FemTracker Database Schema

## Database Architecture

### Primary Database: Supabase (PostgreSQL)
- Main application data storage
- User authentication
- Real-time data synchronization
- Row Level Security for privacy

### Secondary: Upstash Redis
- Session management
- Real-time notifications
- Caching layer
- Rate limiting

### File Storage: Vercel Blob
- Profile images
- Data export files
- Backup archives

## Database Tables

### 1. Users & Authentication

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  age INTEGER,
  location TEXT,
  language TEXT DEFAULT 'en-US',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/dd/yyyy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'auto',
  primary_color TEXT DEFAULT '#ec4899',
  font_size TEXT DEFAULT 'medium',
  notifications JSONB DEFAULT '{}',
  privacy JSONB DEFAULT '{}',
  accessibility JSONB DEFAULT '{}',
  behavior JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Menstrual Cycle Data

```sql
-- Menstrual cycles
CREATE TABLE menstrual_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  is_current BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily period flow tracking
CREATE TABLE period_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID REFERENCES menstrual_cycles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  flow_intensity TEXT CHECK (flow_intensity IN ('Light', 'Medium', 'Heavy', 'Spotting')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cycle phases and predictions
CREATE TABLE cycle_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  next_period_date DATE,
  ovulation_date DATE,
  fertile_window_start DATE,
  fertile_window_end DATE,
  cycle_health_score TEXT,
  confidence_level DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Symptoms & Mood Tracking

```sql
-- Symptoms tracking
CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptom_type TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood tracking
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood_type TEXT NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Fertility Data

```sql
-- Basal Body Temperature
CREATE TABLE basal_body_temperature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  temperature DECIMAL(4,2) NOT NULL,
  measurement_time TIME,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cervical Mucus tracking
CREATE TABLE cervical_mucus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mucus_type TEXT,
  amount TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ovulation tests
CREATE TABLE ovulation_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  result TEXT CHECK (result IN ('positive', 'negative', 'not_taken')),
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  test_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fertility goals and settings
CREATE TABLE fertility_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  goal TEXT CHECK (goal IN ('Trying to Conceive', 'Avoiding Pregnancy', 'General Health Monitoring', 'Menopause Tracking')),
  partner_age INTEGER,
  trying_since DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Nutrition & Exercise

```sql
-- Meals and nutrition
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_time TEXT NOT NULL,
  foods TEXT[] NOT NULL,
  calories INTEGER,
  nutrients TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Water intake tracking
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_ml INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercise tracking
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  exercise_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 10),
  calories_burned INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supplements
CREATE TABLE supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  supplement_type TEXT NOT NULL,
  dosage TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Lifestyle & Health Insights

```sql
-- Lifestyle factors
CREATE TABLE lifestyle_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  stress_triggers TEXT[],
  coping_methods TEXT[],
  weight_kg DECIMAL(5,2),
  alcohol_units INTEGER DEFAULT 0,
  smoking BOOLEAN DEFAULT false,
  medication_changes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health insights generated by AI
CREATE TABLE health_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('warning', 'tip', 'achievement', 'medical_advice')),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  action_required BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Correlation analysis results
CREATE TABLE correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  correlation_value DECIMAL(3,2),
  suggestion TEXT,
  data_points INTEGER,
  confidence_level DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. Notifications & Settings

```sql
-- Notification rules
CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cycle', 'health', 'custom')),
  enabled BOOLEAN DEFAULT true,
  schedule JSONB NOT NULL,
  message TEXT NOT NULL,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification history
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES notification_rules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);
```

### 8. Data Export & Quick Records

```sql
-- Quick daily records
CREATE TABLE quick_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  record_type TEXT NOT NULL,
  value TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data export history
CREATE TABLE data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL,
  format TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

## Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE menstrual_cycles ENABLE ROW LEVEL SECURITY;
-- ... (enable for all tables)

-- Example RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own cycle data" ON menstrual_cycles
  FOR ALL USING (auth.uid() = user_id);

-- Similar policies for all user-specific tables
```

## Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_cycles_user_date ON menstrual_cycles(user_id, start_date DESC);
CREATE INDEX idx_symptoms_user_date ON symptoms(user_id, date DESC);
CREATE INDEX idx_moods_user_date ON moods(user_id, date DESC);
CREATE INDEX idx_exercises_user_date ON exercises(user_id, date DESC);
CREATE INDEX idx_meals_user_date ON meals(user_id, date DESC);
CREATE INDEX idx_lifestyle_user_date ON lifestyle_entries(user_id, date DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, sent_at DESC);
```

## Views for Complex Queries

```sql
-- Health overview view
CREATE VIEW health_overview AS
SELECT 
  u.id as user_id,
  u.full_name,
  -- Calculate scores from recent data
  (SELECT AVG(intensity) FROM moods WHERE user_id = u.id AND date >= CURRENT_DATE - INTERVAL '30 days') as mood_score,
  (SELECT COUNT(*) FROM exercises WHERE user_id = u.id AND date >= CURRENT_DATE - INTERVAL '7 days') as weekly_exercise_count,
  -- Add more aggregated health metrics
FROM profiles u;
``` 