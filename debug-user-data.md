# Debug User Data Guide

## 检查用户数据是否正确存储在数据库中

### 1. 打开浏览器开发者工具
- 按 F12 或右键点击页面选择"检查"
- 转到 Console（控制台）标签

### 2. 在控制台中运行以下命令检查用户认证状态

```javascript
// 检查当前用户
import { supabase } from './src/lib/supabase/client.js';
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### 3. 检查用户profile数据

```javascript
// 检查profile表
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id);
console.log('User profiles:', profiles);
```

### 4. 检查用户preferences数据

```javascript
// 检查用户偏好设置
const { data: preferences } = await supabase
  .from('user_preferences')
  .select('*')
  .eq('user_id', user.id);
console.log('User preferences:', preferences);
```

### 5. 检查所有用户相关表

```javascript
// 检查所有表
const tables = ['profiles', 'user_preferences', 'menstrual_cycles', 'symptoms_moods'];
for (const table of tables) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(table === 'profiles' ? 'id' : 'user_id', user.id);
  console.log(`${table}:`, { data, error });
}
```

## 预期结果

### 正常情况下应该看到：

1. **用户对象** - 包含用户ID、邮箱、验证状态等
2. **Profile记录** - 包含full_name、email、age等用户信息
3. **User preferences记录** - 包含theme、notifications、privacy等设置

### 如果数据缺失：

#### Profile缺失
- 检查注册流程是否正确触发profile创建
- 查看数据库trigger是否正常工作

#### Preferences缺失
- 这是正常的，preferences会在首次访问设置页面时创建

#### 数据不匹配
- 检查RLS (Row Level Security) 策略是否正确配置
- 确认用户ID在所有表中一致

## 修复步骤

如果发现数据问题，可以手动创建缺失的记录：

```javascript
// 手动创建profile（如果缺失）
const { data, error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name || 'User Name',
    created_at: new Date().toISOString()
  });
console.log('Profile creation result:', { data, error });

// 手动创建user preferences（如果缺失）
const { data: prefData, error: prefError } = await supabase
  .from('user_preferences')
  .insert({
    user_id: user.id,
    theme: 'light',
    language: 'English',
    notifications: {
      cycleReminders: true,
      symptomTracking: true,
      exerciseGoals: false,
      nutritionTips: true,
      healthInsights: true
    },
    privacy: {
      dataSharing: false,
      analyticsTracking: true,
      biometricLock: false,
      autoBackup: true
    }
  });
console.log('Preferences creation result:', { data: prefData, error: prefError });
```

## 常见问题

1. **RLS 权限错误** - 用户无法查看自己的数据
   - 检查RLS策略是否允许用户访问自己的记录
   - 确认用户已通过邮箱验证

2. **Trigger未触发** - profile在注册时未自动创建
   - 检查数据库trigger function是否存在并正确配置
   - 手动运行trigger function进行测试

3. **数据类型错误** - JSON字段格式不正确
   - 确保notifications和privacy字段使用正确的JSON格式
   - 检查TypeScript类型定义与数据库schema是否匹配 