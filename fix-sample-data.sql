-- 快速修复脚本：自动获取用户ID并插入示例数据
-- 在运行 database-init-sample-data.sql 失败后使用此脚本

-- 1. 首先清理可能的部分插入数据
DELETE FROM correlation_analyses WHERE user_id::text = 'YOUR_USER_ID_HERE';
DELETE FROM health_metrics WHERE user_id::text = 'YOUR_USER_ID_HERE';
DELETE FROM ai_insights WHERE user_id::text = 'YOUR_USER_ID_HERE';
DELETE FROM personalized_tips WHERE user_id::text = 'YOUR_USER_ID_HERE';
DELETE FROM quick_records WHERE user_id::text = 'YOUR_USER_ID_HERE';
DELETE FROM health_overview WHERE user_id::text = 'YOUR_USER_ID_HERE';

-- 2. 获取用户ID并插入正确数据
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- 获取用户ID
    SELECT id INTO user_uuid FROM profiles ORDER BY created_at DESC LIMIT 1;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'No user found in profiles table. Please sign up first.';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', user_uuid;
    
    -- 插入示例数据（使用实际的UUID）
    INSERT INTO health_overview (user_id, overall_score, cycle_health, nutrition_score, exercise_score, fertility_score, lifestyle_score, symptoms_score, last_updated) 
    VALUES (user_uuid, 82, 85, 78, 80, 88, 75, 84, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      overall_score = EXCLUDED.overall_score,
      cycle_health = EXCLUDED.cycle_health,
      nutrition_score = EXCLUDED.nutrition_score,
      exercise_score = EXCLUDED.exercise_score,
      fertility_score = EXCLUDED.fertility_score,
      lifestyle_score = EXCLUDED.lifestyle_score,
      symptoms_score = EXCLUDED.symptoms_score,
      last_updated = EXCLUDED.last_updated;

    INSERT INTO quick_records (user_id, date, record_type, value, notes) VALUES
      (user_uuid, CURRENT_DATE, 'weight', '65.2 kg', 'Morning weight'),
      (user_uuid, CURRENT_DATE, 'mood', 'Happy', 'Feeling great today!'),
      (user_uuid, CURRENT_DATE - INTERVAL '1 day', 'exercise', '30 min cardio', 'Good workout session'),
      (user_uuid, CURRENT_DATE - INTERVAL '1 day', 'water', '2.5L', 'Stayed hydrated'),
      (user_uuid, CURRENT_DATE - INTERVAL '2 days', 'sleep', '8 hours', 'Restful night');

    INSERT INTO personalized_tips (user_id, tip_type, category, message, action_text, action_link) VALUES
      (user_uuid, 'reminder', 'cycle', 'Your next period is expected in 3 days. Consider tracking your symptoms.', 'Track Symptoms', '/symptom-mood'),
      (user_uuid, 'suggestion', 'nutrition', 'You have been consistent with your water intake! Try adding some iron-rich foods.', 'View Nutrition', '/nutrition'),
      (user_uuid, 'achievement', 'exercise', 'Great job! You have exercised 4 times this week.', 'View Progress', '/exercise'),
      (user_uuid, 'warning', 'health', 'You reported headaches 3 times this week. Consider consulting a healthcare provider.', 'Book Appointment', '#');

    INSERT INTO ai_insights (user_id, insight_type, category, title, description, recommendation, confidence_score) VALUES
      (user_uuid, 'positive', 'cycle', 'Cycle Improvement Detected', 'Your cycle regularity has improved this month!', 'Continue tracking to maintain this positive trend.', 0.85),
      (user_uuid, 'neutral', 'nutrition', 'Hydration Status Good', 'Your water intake is above average. Keep up the good hydration!', 'Try to maintain consistent daily water intake.', 0.75),
      (user_uuid, 'warning', 'symptoms', 'Stress Pattern Alert', 'You have reported stress symptoms more frequently during certain cycle phases.', 'Consider stress management techniques like meditation or exercise.', 0.80),
      (user_uuid, 'improvement', 'exercise', 'Exercise Consistency Opportunity', 'Your exercise frequency has been irregular. Consistent moderate exercise could benefit your cycle health.', 'Try scheduling workouts at the same time each day for better consistency.', 0.75),
      (user_uuid, 'neutral', 'fertility', 'Ovulation Tracking Insight', 'Your temperature patterns suggest ovulation occurred around day 14 of your cycle.', 'Continue temperature tracking for more accurate predictions.', 0.70);

    INSERT INTO health_metrics (user_id, category, score, trend, color, date) VALUES
      (user_uuid, 'Cycle Health', 85, 'up', 'bg-pink-500', CURRENT_DATE),
      (user_uuid, 'Exercise', 78, 'stable', 'bg-blue-500', CURRENT_DATE),
      (user_uuid, 'Nutrition', 82, 'up', 'bg-green-500', CURRENT_DATE),
      (user_uuid, 'Sleep Quality', 75, 'down', 'bg-purple-500', CURRENT_DATE),
      (user_uuid, 'Stress Level', 70, 'stable', 'bg-orange-500', CURRENT_DATE),
      (user_uuid, 'Mood', 88, 'up', 'bg-yellow-500', CURRENT_DATE);

    INSERT INTO correlation_analyses (user_id, title, description, correlation, suggestion, confidence_level) VALUES
      (user_uuid, 'Exercise and Mood Correlation', 'Strong positive correlation between daily exercise and mood ratings.', 0.72, 'Maintain regular exercise routine to support emotional well-being.', 'high'),
      (user_uuid, 'Sleep and Cycle Regularity', 'Moderate correlation between sleep quality and menstrual cycle regularity.', 0.58, 'Focus on sleep hygiene practices, especially during your cycle.', 'medium'),
      (user_uuid, 'Stress and Symptoms', 'Negative correlation between high stress periods and physical symptoms.', -0.65, 'Practice stress management techniques like meditation or yoga.', 'high'),
      (user_uuid, 'Water Intake and Energy', 'Positive correlation between daily water intake and energy levels.', 0.45, 'Continue maintaining good hydration habits.', 'medium');

    INSERT INTO health_metrics (user_id, category, score, trend, color, date) VALUES
      (user_uuid, 'Overall Health', 75, 'stable', 'bg-indigo-500', CURRENT_DATE - INTERVAL '30 days'),
      (user_uuid, 'Overall Health', 78, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '25 days'),
      (user_uuid, 'Overall Health', 80, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '20 days'),
      (user_uuid, 'Overall Health', 82, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '15 days'),
      (user_uuid, 'Overall Health', 85, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '10 days'),
      (user_uuid, 'Overall Health', 84, 'down', 'bg-indigo-500', CURRENT_DATE - INTERVAL '5 days'),
      (user_uuid, 'Overall Health', 87, 'up', 'bg-indigo-500', CURRENT_DATE);

    RAISE NOTICE 'Sample data inserted successfully for user: %', user_uuid;
END
$$; 