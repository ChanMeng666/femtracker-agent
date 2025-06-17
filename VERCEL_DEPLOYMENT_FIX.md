# Vercel部署问题修复指南

## 问题描述
在部署到Vercel时遇到构建错误，提示Redis客户端试图在前端代码中引用Node.js内置模块（如`node:crypto`、`node:events`等）。

## 错误信息
```
Module build failed: UnhandledSchemeError: Reading from "node:crypto" is not handled by plugins (Unhandled scheme).
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "node:" URIs.
```

## 解决方案

### 1. 修改Next.js配置 (`next.config.mjs`)

添加了webpack配置来排除服务器端模块：

```javascript
webpack: (config, { isServer }) => {
  // 添加SVG支持
  config.module.rules.push({
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  });

  // 如果是客户端构建，排除服务器端模块
  if (!isServer) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      'node:crypto': false,
      'node:events': false,
      'node:net': false,
      'node:timers/promises': false,
      'node:tls': false,
    };
    
    // 将redis标记为外部依赖，防止在客户端打包
    config.externals = config.externals || [];
    config.externals.push('redis');
  }

  return config;
},
```

### 2. 重构Redis客户端 (`src/lib/redis/client.ts`)

将Redis客户端改为仅提供类型安全的接口，暂时禁用实际功能：

```typescript
// Redis客户端 - 暂时禁用以解决构建问题
// TODO: 重新启用Redis功能在API路由中

// 客户端安全的缓存接口（目前不执行实际操作）
export const cache = {
  async get(key: string): Promise<null> {
    // TODO: 通过API路由实现缓存
    return null;
  },
  // ... 其他方法
};
```

### 3. 移除前端组件中的直接Redis导入

修改了 `src/hooks/data/useCycles.ts`，移除了直接的Redis缓存导入：

```typescript
// 移除：import { cache } from '@/lib/redis/client'
// 改为直接使用Supabase，缓存功能将在后续通过API路由实现
```

## 构建测试结果

✅ 构建成功！输出显示：
- 无Redis相关错误
- 所有页面正常生成
- 只有少量React Hook依赖警告（不影响功能）

## 下一步计划

### 短期（当前可用）
- ✅ 数据库集成正常工作
- ✅ 用户认证正常工作
- ✅ 设置页面显示真实用户数据
- ✅ 可以正常部署到Vercel

### 中期（优化缓存）
- [ ] 在API路由中重新启用Redis缓存
- [ ] 创建专门的缓存API端点
- [ ] 通过API调用实现前端缓存功能

### 长期（性能优化）
- [ ] 实现智能缓存策略
- [ ] 添加缓存失效机制
- [ ] 监控缓存性能

## 部署命令

现在可以安全地部署到Vercel：

```bash
# 构建测试
npm run build

# 部署（如果使用Vercel CLI）
vercel --prod

# 或推送到GitHub让Vercel自动部署
git add .
git commit -m "Fix Redis client build issues for Vercel deployment"
git push origin master
```

## 环境变量要求

确保在Vercel中配置了以下环境变量：

### Supabase（必需）
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`

### CopilotKit（必需）
- `COPILOT_CLOUD_API_KEY`

### Redis（可选，当前禁用）
- `REDIS_URL`（将来重新启用时需要）

### OpenAI（用于AI功能）
- `OPENAI_API_KEY`

## 常见问题

### Q: 缓存功能是否还能正常工作？
A: 当前缓存功能已禁用，但不影响核心功能。数据直接从Supabase读取，性能仍然良好。

### Q: 何时恢复Redis缓存？
A: 将在下个版本中通过API路由重新实现，确保服务器端和客户端的清晰分离。

### Q: 性能是否受影响？
A: 对于大多数用户场景，影响很小。Supabase具有内置的连接池和性能优化。

### Q: 如何监控性能？
A: 可以通过Vercel Analytics和Supabase Dashboard监控应用性能。 