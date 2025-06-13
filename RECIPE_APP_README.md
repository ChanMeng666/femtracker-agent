# Recipe App - 复刻说明

## 项目概述

已成功将 `example-langgraph_shared_state` 示例项目的前后端功能完整复刻到主项目中。

## 复刻内容

### 后端 (Agent)

1. **创建了 Recipe Agent**:
   - 位置: `agent/recipe_agent/agent.py`
   - 配置: 在 `agent/langgraph.json` 中添加了 `shared_state` 图配置
   - 功能: 完整的 Recipe 生成和改进功能，包含共享状态管理

2. **Agent 功能特性**:
   - 支持技能等级选择 (初级/中级/高级)
   - 烹饪时间设置 (5分钟到60+分钟)
   - 特殊饮食偏好 (高蛋白/低碳水/素食等)
   - 动态食材管理
   - 分步骤指令编辑
   - AI 智能改进功能

### 前端 (Next.js)

1. **创建了 Recipe 页面**:
   - 位置: `src/app/recipe/page.tsx`
   - 样式: `src/app/recipe/style.css`
   - 路由: `/recipe`

2. **前端功能特性**:
   - 实时状态同步
   - 交互式 Recipe 编辑器
   - 美观的 UI 界面
   - Ping 动画提示状态变化
   - CopilotKit 集成侧边栏

3. **支持库文件**:
   - `src/lib/prompts.ts`: 聊天提示和建议
   - `config.ts`: Agent 类型配置

4. **主页更新**:
   - 更新了 `src/app/page.tsx` 添加到 Recipe 页面的链接
   - 提供了项目功能概览

## 配置更新

1. **环境变量**:
   - 更新 `NEXT_PUBLIC_COPILOTKIT_AGENT_NAME` 为 `shared_state`
   - 添加 `NEXT_PUBLIC_COPILOTKIT_AGENT_DESCRIPTION`

2. **LangGraph 配置**:
   - 在 `agent/langgraph.json` 中添加了 `shared_state` 图的配置

## 如何运行

### 后端 (Agent)
```bash
cd agent
# 启动 LangGraph 服务器
langgraph dev
```

### 前端 (Next.js)
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 访问应用

1. 打开浏览器访问 `http://localhost:3000`
2. 点击 "🍳 Recipe Assistant" 按钮进入 Recipe 应用
3. 使用侧边栏与 AI 助手交互
4. 实时编辑和改进 Recipe

## 主要功能

- **实时协作**: 前后端状态实时同步
- **AI 助手**: 智能改进和建议 Recipe
- **交互式编辑**: 直接在界面上编辑所有 Recipe 元素
- **状态管理**: 完整的共享状态管理
- **美观界面**: 现代化的用户界面设计

## 技术栈

- **前端**: Next.js, TypeScript, CopilotKit React
- **后端**: Python, LangGraph, CopilotKit
- **AI**: OpenAI gpt-4o-mini-2024-07-18
- **状态管理**: CopilotKit 共享状态

项目现在完全复刻了示例的所有功能，可以正常运行和使用。 