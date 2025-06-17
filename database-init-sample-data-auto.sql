-- 自动化示例数据初始化脚本
-- 这个版本会自动获取最新的用户ID，无需手动替换

-- 临时存储用户ID
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 获取最新创建的用户ID（你可以根据需要修改这个查询）
    SELECT id INTO target_user_id 
    FROM profiles 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- 如果没有找到用户，抛出错误
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'No user found. Please create a user account first.';
    END IF;

    -- 输出找到的用户ID供参考
    RAISE NOTICE 'Using user ID: %', target_user_id;

    -- 示例健康概览数据（如果没有自动创建）
    INSERT INTO health_overview (user_id, overall_score, cycle_health, nutrition_score, exercise_score, fertility_score, lifestyle_score, symptoms_score, last_updated) 
    VALUES 
      (target_user_id, 82, 85, 78, 80, 88, 75, 84, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE SET
      overall_score = EXCLUDED.overall_score,
      cycle_health = EXCLUDED.cycle_health,
      nutrition_score = EXCLUDED.nutrition_score,
      exercise_score = EXCLUDED.exercise_score,
      fertility_score = EXCLUDED.fertility_score,
      lifestyle_score = EXCLUDED.lifestyle_score,
      symptoms_score = EXCLUDED.symptoms_score,
      last_updated = EXCLUDED.last_updated;

    -- 示例快速记录
    INSERT INTO quick_records (user_id, date, record_type, value, notes) VALUES
      (target_user_id, CURRENT_DATE, 'weight', '65.2 kg', 'Morning weight'),
      (target_user_id, CURRENT_DATE, 'mood', 'Happy', 'Feeling great today!'),
      (target_user_id, CURRENT_DATE - INTERVAL '1 day', 'exercise', '30 min cardio', 'Good workout session'),
      (target_user_id, CURRENT_DATE - INTERVAL '1 day', 'water', '2.5L', 'Stayed hydrated'),
      (target_user_id, CURRENT_DATE - INTERVAL '2 days', 'sleep', '8 hours', 'Restful night');

    -- 示例个性化提示
    INSERT INTO personalized_tips (user_id, tip_type, category, message, action_text, action_link) VALUES
      (target_user_id, 'reminder', 'cycle', 'Your next period is expected in 3 days. Consider tracking your symptoms.', 'Track Symptoms', '/symptom-mood'),
      (target_user_id, 'suggestion', 'nutrition', 'You have been consistent with your water intake! Try adding some iron-rich foods.', 'View Nutrition', '/nutrition'),
      (target_user_id, 'achievement', 'exercise', 'Great job! You have exercised 4 times this week.', 'View Progress', '/exercise'),
      (target_user_id, 'warning', 'health', 'You reported headaches 3 times this week. Consider consulting a healthcare provider.', 'Book Appointment', '#');

    -- 示例AI洞察（用于洞察页面）
    INSERT INTO ai_insights (user_id, insight_type, category, title, description, recommendation, confidence_score) VALUES
      (target_user_id, 'positive', 'cycle', 'Cycle Improvement Detected', 'Your cycle regularity has improved this month!', 'Continue tracking to maintain this positive trend.', 0.85),
      (target_user_id, 'neutral', 'nutrition', 'Hydration Status Good', 'Your water intake is above average. Keep up the good hydration!', 'Try to maintain consistent daily water intake.', 0.75),
      (target_user_id, 'warning', 'symptoms', 'Stress Pattern Alert', 'You have reported stress symptoms more frequently during certain cycle phases.', 'Consider stress management techniques like meditation or exercise.', 0.80),
      (target_user_id, 'improvement', 'exercise', 'Exercise Consistency Opportunity', 'Your exercise frequency has been irregular. Consistent moderate exercise could benefit your cycle health.', 'Try scheduling workouts at the same time each day for better consistency.', 0.75),
      (target_user_id, 'neutral', 'fertility', 'Ovulation Tracking Insight', 'Your temperature patterns suggest ovulation occurred around day 14 of your cycle.', 'Continue temperature tracking for more accurate predictions.', 0.70);

    -- 示例健康指标
    INSERT INTO health_metrics (user_id, category, score, trend, color, date) VALUES
      (target_user_id, 'Cycle Health', 85, 'up', 'bg-pink-500', CURRENT_DATE),
      (target_user_id, 'Exercise', 78, 'stable', 'bg-blue-500', CURRENT_DATE),
      (target_user_id, 'Nutrition', 82, 'up', 'bg-green-500', CURRENT_DATE),
      (target_user_id, 'Sleep Quality', 75, 'down', 'bg-purple-500', CURRENT_DATE),
      (target_user_id, 'Stress Level', 70, 'stable', 'bg-orange-500', CURRENT_DATE),
      (target_user_id, 'Mood', 88, 'up', 'bg-yellow-500', CURRENT_DATE);

    -- 示例相关性分析
    INSERT INTO correlation_analyses (user_id, title, description, correlation, suggestion, confidence_level) VALUES
      (target_user_id, 'Exercise and Mood Correlation', 'Strong positive correlation between daily exercise and mood ratings.', 0.72, 'Maintain regular exercise routine to support emotional well-being.', 'high'),
      (target_user_id, 'Sleep and Cycle Regularity', 'Moderate correlation between sleep quality and menstrual cycle regularity.', 0.58, 'Focus on sleep hygiene practices, especially during your cycle.', 'medium'),
      (target_user_id, 'Stress and Symptoms', 'Negative correlation between high stress periods and physical symptoms.', -0.65, 'Practice stress management techniques like meditation or yoga.', 'high'),
      (target_user_id, 'Water Intake and Energy', 'Positive correlation between daily water intake and energy levels.', 0.45, 'Continue maintaining good hydration habits.', 'medium');

    -- 添加历史健康指标数据（用于趋势图）
    INSERT INTO health_metrics (user_id, category, score, trend, color, date) VALUES
      -- 过去30天的数据
      (target_user_id, 'Overall Health', 75, 'stable', 'bg-indigo-500', CURRENT_DATE - INTERVAL '30 days'),
      (target_user_id, 'Overall Health', 78, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '25 days'),
      (target_user_id, 'Overall Health', 80, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '20 days'),
      (target_user_id, 'Overall Health', 82, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '15 days'),
      (target_user_id, 'Overall Health', 85, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '10 days'),
      (target_user_id, 'Overall Health', 84, 'down', 'bg-indigo-500', CURRENT_DATE - INTERVAL '5 days'),
      (target_user_id, 'Overall Health', 87, 'up', 'bg-indigo-500', CURRENT_DATE);

    RAISE NOTICE 'Sample data inserted successfully for user: %', target_user_id;
END
$$; 