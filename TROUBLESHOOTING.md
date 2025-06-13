# 故障排除指南 - Recipe Agent

## ✅ 已修复的问题

### 1. 后端LangGraph服务启动失败
**问题**: 不能使用自定义checkpointer
**解决方案**: 
- 移除了 `MemorySaver()` 从graph编译
- 移除了相关import
- 修改后的代码：`graph = workflow.compile()`

### 2. 前端CopilotKit配置错误  
**问题**: EmptyAdapter只能在agent模式下使用
**解决方案**:
- 将 `ExperimentalEmptyAdapter` 改为 `OpenAIAdapter`
- 这样可以支持非agent组件如 `useCopilotChatSuggestions`

## 🚀 如何重新启动项目

### 后端 (LangGraph)
```bash
cd agent
langgraph dev
```

### 前端 (Next.js)
```bash
npm run dev
```

## ✅ 验证服务状态

### 1. 检查后端
- 访问: `http://127.0.0.1:2024/docs`
- 端口检查: `netstat -an | findstr :2024`
- 应该看到: `TCP    127.0.0.1:2024         0.0.0.0:0              LISTENING`

### 2. 检查前端
- 访问: `http://localhost:3000`
- 点击 "🍳 Recipe Assistant"
- 测试AI聊天功能

## 🔧 配置确认

### 环境变量 (.env)
```
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_COPILOTKIT_AGENT_NAME=shared_state
NEXT_PUBLIC_COPILOTKIT_AGENT_DESCRIPTION=AI Recipe Assistant with shared state functionality for creating and improving recipes
LANGGRAPH_DEPLOYMENT_URL=http://localhost:2024
NEXT_PUBLIC_COPILOTKIT_RUNTIME_URL=/api/copilotkit
```

### LangGraph配置 (agent/langgraph.json)
```json
{
  "python_version": "3.12",
  "dockerfile_lines": [],
  "dependencies": ["."],
  "graphs": {
    "sample_agent": "./sample_agent/agent.py:graph",
    "shared_state": "./recipe_agent/agent.py:graph"
  },
  "env": ".env"
}
```

## 🎯 测试步骤

1. **启动后端**: 确保LangGraph服务正常运行
2. **启动前端**: 确保Next.js应用正常运行  
3. **访问Recipe页面**: `http://localhost:3000/recipe`
4. **测试AI功能**: 
   - 点击侧边栏AI助手
   - 尝试发送消息如 "改进这个食谱"
   - 观察状态同步和响应

## 🔍 常见问题

### 如果后端仍然无法启动
1. 检查Python依赖: `python -m pip list | grep langgraph`
2. 重新安装: `python -m pip install --upgrade langgraph-cli`
3. 检查配置文件语法

### 如果前端连接失败
1. 确认后端在2024端口运行
2. 检查环境变量设置
3. 重启前端服务

## ✅ Emoji显示问题修复

### 问题描述
页面中emoji显示为乱码（如631、35e、f9c4等）

### 解决方案
在前端添加了emoji解码函数，能够：
1. 识别十六进制emoji编码
2. 将编码转换为实际emoji字符
3. 提供常见emoji的映射表
4. 处理复合emoji编码

现在项目应该可以正常工作了！🎉 