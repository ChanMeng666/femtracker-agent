-- 示例数据初始化脚本
-- 在数据库扩展表创建后运行，为演示和测试添加一些示例数据

-- 注意：这个脚本假设你已经有一个测试用户账户
-- 请将下面的 'YOUR_USER_ID_HERE' 替换为实际的用户UUID

-- ⚠️ 重要：请先获取你的用户ID
-- 运行: SELECT id FROM auth.users WHERE email = 'your-email@example.com';
-- 或者: SELECT id FROM profiles WHERE email = 'your-email@example.com';

-- 示例健康概览数据（如果没有自动创建）
INSERT INTO health_overview (user_id, overall_score, cycle_health, nutrition_score, exercise_score, fertility_score, lifestyle_score, symptoms_score, last_updated) 
VALUES 
  ('YOUR_USER_ID_HERE', 82, 85, 78, 80, 88, 75, 84, CURRENT_DATE)
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
INSERT INTO quick_records (user_id, date, type, value, notes) VALUES
  ('YOUR_USER_ID_HERE', CURRENT_DATE, 'weight', '65.2 kg', 'Morning weight'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE, 'mood', 'Happy', 'Feeling great today!'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '1 day', 'exercise', '30 min cardio', 'Good workout session'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '1 day', 'water', '2.5L', 'Stayed hydrated'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 'sleep', '8 hours', 'Restful night');

-- 示例个性化提示
INSERT INTO personalized_tips (user_id, type, category, message, action_text, action_link) VALUES
  ('YOUR_USER_ID_HERE', 'reminder', 'cycle', 'Your next period is expected in 3 days. Consider tracking your symptoms.', 'Track Symptoms', '/symptom-mood'),
  ('YOUR_USER_ID_HERE', 'suggestion', 'nutrition', 'You have been consistent with your water intake! Try adding some iron-rich foods.', 'View Nutrition', '/nutrition'),
  ('YOUR_USER_ID_HERE', 'achievement', 'exercise', 'Great job! You have exercised 4 times this week.', 'View Progress', '/exercise'),
  ('YOUR_USER_ID_HERE', 'warning', 'health', 'You reported headaches 3 times this week. Consider consulting a healthcare provider.', 'Book Appointment', '#');

-- 示例健康洞察
INSERT INTO health_insights (user_id, type, category, message, action, action_link) VALUES
  ('YOUR_USER_ID_HERE', 'positive', 'cycle', 'Your cycle regularity has improved this month!', 'View Cycle Data', '/cycle-tracker'),
  ('YOUR_USER_ID_HERE', 'info', 'nutrition', 'Your water intake is above average. Keep up the good hydration!', 'Track Water', '/nutrition'),
  ('YOUR_USER_ID_HERE', 'warning', 'symptoms', 'You have reported stress symptoms more frequently. Consider relaxation techniques.', 'Learn More', '/lifestyle');

-- 示例AI洞察
INSERT INTO ai_insights (user_id, type, category, title, description, recommendation, confidence_score) VALUES
  ('YOUR_USER_ID_HERE', 'positive', 'overall', 'Improved Health Patterns', 'Your overall health metrics show a 15% improvement over the past month.', 'Continue your current routine and consider adding mindfulness practices.', 0.85),
  ('YOUR_USER_ID_HERE', 'improvement', 'exercise', 'Exercise Consistency Opportunity', 'Your exercise frequency has been irregular. Consistent moderate exercise could benefit your cycle health.', 'Try scheduling workouts at the same time each day for better consistency.', 0.75),
  ('YOUR_USER_ID_HERE', 'warning', 'symptoms', 'Symptom Pattern Alert', 'We noticed increased headache frequency during your luteal phase.', 'Consider tracking triggers like caffeine intake and sleep quality.', 0.80),
  ('YOUR_USER_ID_HERE', 'neutral', 'fertility', 'Ovulation Tracking Insight', 'Your temperature patterns suggest ovulation occurred around day 14 of your cycle.', 'Continue temperature tracking for more accurate predictions.', 0.70);

-- 示例健康指标
INSERT INTO health_metrics (user_id, category, score, trend, color, date) VALUES
  ('YOUR_USER_ID_HERE', 'Cycle Health', 85, 'up', 'bg-pink-500', CURRENT_DATE),
  ('YOUR_USER_ID_HERE', 'Exercise', 78, 'stable', 'bg-blue-500', CURRENT_DATE),
  ('YOUR_USER_ID_HERE', 'Nutrition', 82, 'up', 'bg-green-500', CURRENT_DATE),
  ('YOUR_USER_ID_HERE', 'Sleep Quality', 75, 'down', 'bg-purple-500', CURRENT_DATE),
  ('YOUR_USER_ID_HERE', 'Stress Level', 70, 'stable', 'bg-orange-500', CURRENT_DATE),
  ('YOUR_USER_ID_HERE', 'Mood', 88, 'up', 'bg-yellow-500', CURRENT_DATE);

-- 示例相关性分析
INSERT INTO correlation_analyses (user_id, title, description, correlation, suggestion, confidence_level) VALUES
  ('YOUR_USER_ID_HERE', 'Exercise and Mood Correlation', 'Strong positive correlation between daily exercise and mood ratings.', 0.72, 'Maintain regular exercise routine to support emotional well-being.', 'high'),
  ('YOUR_USER_ID_HERE', 'Sleep and Cycle Regularity', 'Moderate correlation between sleep quality and menstrual cycle regularity.', 0.58, 'Focus on sleep hygiene practices, especially during your cycle.', 'medium'),
  ('YOUR_USER_ID_HERE', 'Stress and Symptoms', 'Negative correlation between high stress periods and physical symptoms.', -0.65, 'Practice stress management techniques like meditation or yoga.', 'high'),
  ('YOUR_USER_ID_HERE', 'Water Intake and Energy', 'Positive correlation between daily water intake and energy levels.', 0.45, 'Continue maintaining good hydration habits.', 'medium');

-- 添加历史健康指标数据（用于趋势图）
INSERT INTO health_metrics (user_id, category, score, trend, color, date) VALUES
  -- 过去30天的数据
  ('YOUR_USER_ID_HERE', 'Overall Health', 75, 'stable', 'bg-indigo-500', CURRENT_DATE - INTERVAL '30 days'),
  ('YOUR_USER_ID_HERE', 'Overall Health', 78, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '25 days'),
  ('YOUR_USER_ID_HERE', 'Overall Health', 80, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '20 days'),
  ('YOUR_USER_ID_HERE', 'Overall Health', 82, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '15 days'),
  ('YOUR_USER_ID_HERE', 'Overall Health', 85, 'up', 'bg-indigo-500', CURRENT_DATE - INTERVAL '10 days'),
  ('YOUR_USER_ID_HERE', 'Overall Health', 84, 'down', 'bg-indigo-500', CURRENT_DATE - INTERVAL '5 days'),
  ('YOUR_USER_ID_HERE', 'Overall Health', 87, 'up', 'bg-indigo-500', CURRENT_DATE);

-- 使用说明:
-- 1. 首先运行 database-schema-extension.sql 创建新表
-- 2. 获取你的用户ID并替换所有的 'YOUR_USER_ID_HERE'
-- 3. 运行这个脚本添加示例数据
-- 4. 现在你可以在应用中看到真实的数据而不是硬编码的示例

COMMIT; 