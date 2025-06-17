# 数据库Schema修复说明

## 🐛 问题描述

在Supabase中执行 `database-schema-extension.sql` 时出现错误：
```
ERROR: 42703: column "type" does not exist
```

## 🔍 问题原因

`type` 是PostgreSQL的保留关键字，不能直接用作列名。在我们的数据库schema中，多个表使用了 `type` 作为列名，导致SQL执行失败。

## ✅ 修复方案

### 1. 更新数据库表结构

将所有使用 `type` 的列名替换为更具体的名称：

| 表名 | 原列名 | 新列名 |
|------|--------|--------|
| `quick_records` | `type` | `record_type` |
| `personalized_tips` | `type` | `tip_type` |
| `health_insights` | `type` | `insight_type` |
| `ai_insights` | `type` | `insight_type` |

### 2. 更新相关索引

```sql
-- 更新索引定义
CREATE INDEX IF NOT EXISTS idx_quick_records_type ON quick_records(record_type);
CREATE INDEX IF NOT EXISTS idx_personalized_tips_type ON personalized_tips(tip_type);
```

### 3. 更新TypeScript类型定义

在 `src/lib/supabase/client.ts` 中更新接口定义：

```typescript
export interface PersonalizedTip {
  // type -> tip_type
  tip_type: 'reminder' | 'suggestion' | 'warning' | 'achievement'
  // ...其他字段
}

export interface HealthInsightDB {
  // type -> insight_type  
  insight_type: 'positive' | 'warning' | 'info'
  // ...其他字段
}

export interface AIInsight {
  // type -> insight_type
  insight_type: 'positive' | 'improvement' | 'warning' | 'neutral'
  // ...其他字段
}
```

### 4. 更新Hook查询代码

在所有相关的hooks中更新数据库查询和数据映射：

**`useHomeStateWithDB.ts`**:
- `record.type` → `record.record_type`
- `tip.type` → `tip.tip_type` 
- `insight.type` → `insight.insight_type`

**`useInsightsStateWithDB.ts`**:
- `insight.type` → `insight.insight_type`

### 5. 更新示例数据脚本

在 `database-init-sample-data.sql` 中更新INSERT语句：

```sql
-- 更新列名
INSERT INTO quick_records (user_id, date, record_type, value, notes) VALUES...
INSERT INTO personalized_tips (user_id, tip_type, category, message, ...) VALUES...
INSERT INTO health_insights (user_id, insight_type, category, message, ...) VALUES...
INSERT INTO ai_insights (user_id, insight_type, category, title, ...) VALUES...
```

## 📁 修复的文件

1. `database-schema-extension.sql` - 数据库表结构
2. `database-init-sample-data.sql` - 示例数据脚本
3. `src/lib/supabase/client.ts` - TypeScript接口定义
4. `src/hooks/useHomeStateWithDB.ts` - 首页数据库集成
5. `src/hooks/useInsightsStateWithDB.ts` - 洞察页面数据库集成

## 🚀 部署步骤

1. **拉取最新代码**:
   ```bash
   git pull origin master
   ```

2. **在Supabase中执行更新的SQL脚本**:
   - 先运行 `database-schema-extension.sql`
   - 然后运行 `database-init-sample-data.sql`（记得替换用户ID）

3. **验证修复**:
   - 检查所有表是否成功创建
   - 验证索引和RLS策略是否正确应用
   - 测试应用的数据库集成功能

## 🔧 第二次修复 - SQL执行顺序问题

### 问题：
```
ERROR: 42703: column "is_active" does not exist
```

### 原因：
SQL脚本中索引创建语句在表完全创建之前执行，导致引用不存在的列。

### 解决方案：
重新组织了SQL脚本结构：

1. **第一部分**：删除旧表和函数（确保干净安装）
2. **第二部分**：创建所有表结构
3. **第三部分**：创建所有索引
4. **第四部分**：启用RLS
5. **第五部分**：创建RLS策略
6. **第六部分**：创建触发器函数和触发器
7. **第七部分**：用户初始化功能

这确保了正确的依赖关系和执行顺序。

## 🔧 第三次修复 - 视图冲突问题

### 问题：
```
ERROR: 42809: "health_overview" is not a table
HINT: Use DROP VIEW to remove a view.
```

### 原因：
在之前的测试中，某些对象（特别是`health_overview`）被创建为了视图(VIEW)而不是表(TABLE)，导致`DROP TABLE`命令失败。

### 解决方案：
在删除表之前先删除可能存在的同名视图：

```sql
-- 先尝试删除视图，再删除同名表
DROP VIEW IF EXISTS quick_records CASCADE;
DROP VIEW IF EXISTS personalized_tips CASCADE;
DROP VIEW IF EXISTS health_insights CASCADE;
DROP VIEW IF EXISTS health_overview CASCADE;
DROP VIEW IF EXISTS ai_insights CASCADE;
DROP VIEW IF EXISTS health_metrics CASCADE;
DROP VIEW IF EXISTS correlation_analyses CASCADE;

-- 然后删除表
DROP TABLE IF EXISTS quick_records CASCADE;
DROP TABLE IF EXISTS personalized_tips CASCADE;
-- ... 其他表
```

这样可以安全地清理所有可能的冲突对象。

## ⚠️ 注意事项

- 这是一个**破坏性更改**，如果之前已经有数据在旧表结构中，需要先备份
- 新脚本会先DROP掉已存在的表，确保干净的重建
- 前端应用的数据映射逻辑已经更新，确保与新的数据库结构匹配
- 所有CopilotKit AI actions仍然使用前端类型，保持API兼容性

## 🎯 测试检查

修复后请验证以下功能：

- [ ] 首页正常加载健康概览数据
- [ ] 可以添加和显示快速记录
- [ ] 个性化提示正常显示和管理
- [ ] 健康洞察功能正常
- [ ] AI助手可以通过聊天添加数据
- [ ] 症状心情页面数据库集成正常

修复完成后，所有数据库相关功能应该恢复正常！ 🎉 