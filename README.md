# FemTracker Agent - AI Recipe Assistant

这是一个结合了前端和后端的AI食谱助手项目，使用Next.js构建前端，Python LangGraph构建后端智能代理。

## 项目结构

```
femtracker-agent/
├── README.md                    # 项目说明文档
├── TROUBLESHOOTING.md          # 故障排除指南
├── package.json                # 前端依赖配置
├── config.ts                   # 配置文件
├── src/                        # 前端源码
│   ├── app/
│   │   ├── api/copilotkit/     # CopilotKit API路由
│   │   ├── recipe/             # 食谱页面
│   │   └── page.tsx            # 主页
│   └── lib/                    # 工具库
└── agent/                      # 后端Python项目
    ├── venv/                   # Python虚拟环境
    ├── requirements.txt        # Python依赖
    ├── langgraph.json         # LangGraph配置
    ├── recipe_agent/          # 食谱代理
    └── sample_agent/          # 示例代理
```

## 功能特性

- 🤖 **AI食谱助手**: 基于LangGraph的智能食谱生成和改进
- 🍳 **实时编辑**: 支持实时编辑食材和制作步骤
- 📱 **响应式界面**: 现代化的响应式UI设计
- 🔄 **状态同步**: 前后端实时状态同步
- 🎯 **智能建议**: AI提供个性化的食谱改进建议
- 🏷️ **标签系统**: 支持技能等级、烹饪时间、饮食偏好等标签

## 系统要求

- **Node.js**: v18.0 或更高版本
- **Python**: 3.8 或更高版本
- **npm/yarn**: 最新版本

## 安装和启动

### 1. 环境准备

首先克隆项目并安装前端依赖：

```bash
# 克隆项目
git clone <repository-url>
cd femtracker-agent

# 安装前端依赖
npm install
```

### 2. 环境变量配置

创建 `.env.local` 文件（前端）：

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# CopilotKit配置
NEXT_PUBLIC_COPILOTKIT_AGENT_NAME=shared_state
NEXT_PUBLIC_COPILOTKIT_AGENT_DESCRIPTION="An AI assistant that helps you create and improve recipes with real-time collaborative editing"
```

创建 `agent/.env` 文件（后端）：

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 后端设置（Python虚拟环境）

```bash
# 进入agent目录
cd agent

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 验证安装
langgraph --help
```

### 4. 启动应用

#### 方法一：并行启动（推荐）

打开两个终端窗口：

**终端1 - 启动后端：**
```bash
cd agent
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
langgraph dev
```

**终端2 - 启动前端：**
```bash
npm run dev
```

#### 方法二：使用脚本启动

你也可以创建启动脚本来简化流程。

**Windows (start.bat):**
```batch
@echo off
echo Starting FemTracker Agent...

echo Starting backend...
start cmd /k "cd agent && venv\Scripts\activate && langgraph dev"

echo Waiting for backend to start...
timeout /t 5

echo Starting frontend...
start cmd /k "npm run dev"

echo Both services are starting...
echo Frontend: http://localhost:3000
echo Backend: http://localhost:2024
```

**macOS/Linux (start.sh):**
```bash
#!/bin/bash
echo "Starting FemTracker Agent..."

echo "Starting backend..."
cd agent
source venv/bin/activate
langgraph dev &
BACKEND_PID=$!

cd ..
echo "Waiting for backend to start..."
sleep 5

echo "Starting frontend..."
npm run dev &
FRONTEND_PID=$!

echo "Both services are starting..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:2024"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

wait
```

### 5. 访问应用

启动完成后，打开浏览器访问：

- **主页**: http://localhost:3000
- **食谱助手**: http://localhost:3000/recipe
- **后端API**: http://localhost:2024

## 使用说明

### 食谱助手功能

1. **创建食谱**: 点击"Generate Recipe"按钮让AI创建新食谱
2. **编辑食材**: 直接在食材列表中添加、删除或修改食材
3. **编辑步骤**: 直接在制作步骤中进行编辑
4. **AI改进**: 点击"Improve with AI"让AI分析并改进食谱
5. **设置标签**: 选择技能等级、烹饪时间、饮食偏好等标签

### 智能代理功能

- **实时协作**: 多个用户可以同时编辑同一个食谱
- **智能建议**: AI会根据食材和步骤提供改进建议
- **上下文感知**: AI了解整个食谱的上下文，提供相关建议

## 开发相关

### 项目架构

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Python + LangGraph + FastAPI + CopilotKit
- **AI模型**: OpenAI GPT (可配置其他模型)

### 重要文件说明

- `config.ts`: 项目配置，设置代理类型
- `src/app/api/copilotkit/route.ts`: CopilotKit API路由
- `src/app/recipe/page.tsx`: 食谱页面主组件
- `agent/recipe_agent/agent.py`: Python后端代理逻辑
- `agent/langgraph.json`: LangGraph配置文件

### 自定义扩展

1. **添加新的食谱类型**: 修改 `agent/recipe_agent/agent.py` 中的枚举类型
2. **修改UI样式**: 编辑 `src/app/recipe/style.css`
3. **添加新功能**: 在相应的组件中添加新的功能逻辑

## 故障排除

如果遇到问题，请查看 `TROUBLESHOOTING.md` 文件获取详细的故障排除指南。

常见问题：
- 后端启动失败：检查虚拟环境是否激活，依赖是否安装完整
- 前端连接失败：确保后端已启动并运行在端口2024
- AI响应慢：检查OpenAI API Key是否正确配置
- Emoji显示乱码：已修复，系统会自动将emoji编码转换为实际emoji字符

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

此项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 支持

如有问题或建议，请创建 issue 或联系项目维护者。

