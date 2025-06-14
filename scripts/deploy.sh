#!/bin/bash

# FemTracker 部署脚本
# 使用方法: ./scripts/deploy.sh [环境] [版本]
# 例如: ./scripts/deploy.sh production v1.0.0

set -e  # 遇到错误时退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
ENVIRONMENT=${1:-production}
VERSION=${2:-$(date +%Y%m%d-%H%M%S)}
PROJECT_NAME="femtracker-agent"
DOCKER_IMAGE="$PROJECT_NAME:$VERSION"
BACKUP_DIR="./backups"

# 函数定义
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
    exit 1
}

# 检查必要工具
check_dependencies() {
    log "检查部署依赖..."
    
    if ! command -v node &> /dev/null; then
        error "Node.js 未安装，请先安装 Node.js"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm 未安装，请先安装 npm"
    fi
    
    if ! command -v git &> /dev/null; then
        error "Git 未安装，请先安装 Git"
    fi
    
    success "依赖检查完成"
}

# 环境检查
check_environment() {
    log "检查部署环境: $ENVIRONMENT"
    
    if [[ ! -f ".env.$ENVIRONMENT" ]]; then
        error "环境配置文件 .env.$ENVIRONMENT 不存在"
    fi
    
    success "环境检查完成"
}

# 代码质量检查
quality_check() {
    log "执行代码质量检查..."
    
    # 类型检查
    log "执行 TypeScript 类型检查..."
    npm run type-check || warning "TypeScript 类型检查有警告"
    
    # ESLint 检查
    log "执行 ESLint 检查..."
    npm run lint || warning "ESLint 检查有警告"
    
    # 测试
    if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
        log "执行测试..."
        npm run test || error "测试失败"
    fi
    
    success "代码质量检查完成"
}

# 构建应用
build_application() {
    log "构建应用..."
    
    # 清理旧的构建文件
    rm -rf .next build
    
    # 安装依赖
    log "安装生产依赖..."
    npm ci --only=production
    
    # 构建应用
    log "构建 Next.js 应用..."
    NODE_ENV=$ENVIRONMENT npm run build
    
    success "应用构建完成"
}

# 创建备份
create_backup() {
    if [[ -d "build" ]]; then
        log "创建备份..."
        mkdir -p $BACKUP_DIR
        
        BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf $BACKUP_FILE build/
        
        success "备份创建完成: $BACKUP_FILE"
        
        # 清理旧备份（保留最近5个）
        ls -t $BACKUP_DIR/backup-*.tar.gz | tail -n +6 | xargs -r rm
    fi
}

# 性能测试
performance_test() {
    log "执行性能测试..."
    
    if command -v lighthouse &> /dev/null; then
        lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html --quiet
        success "Lighthouse 性能测试完成"
    else
        warning "Lighthouse 未安装，跳过性能测试"
    fi
}

# 部署到 Vercel
deploy_vercel() {
    log "部署到 Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        error "Vercel CLI 未安装，请运行: npm i -g vercel"
    fi
    
    # 部署
    if [[ $ENVIRONMENT == "production" ]]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    
    success "Vercel 部署完成"
}

# 部署到 Netlify
deploy_netlify() {
    log "部署到 Netlify..."
    
    if ! command -v netlify &> /dev/null; then
        error "Netlify CLI 未安装，请运行: npm i -g netlify-cli"
    fi
    
    # 构建和部署
    netlify deploy --dir=build --prod
    
    success "Netlify 部署完成"
}

# Docker 部署
deploy_docker() {
    log "构建 Docker 镜像..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
    fi
    
    # 构建镜像
    docker build -t $DOCKER_IMAGE .
    
    # 标记为最新版本
    docker tag $DOCKER_IMAGE $PROJECT_NAME:latest
    
    success "Docker 镜像构建完成: $DOCKER_IMAGE"
}

# 健康检查
health_check() {
    log "执行健康检查..."
    
    # 检查端口3000是否可用
    if netstat -tuln | grep -q :3000; then
        warning "端口 3000 已被占用"
    fi
    
    # 检查构建文件
    if [[ ! -d "build" && ! -d ".next" ]]; then
        error "构建文件不存在"
    fi
    
    success "健康检查完成"
}

# 部署后验证
post_deploy_validation() {
    log "执行部署后验证..."
    
    # 等待服务启动
    sleep 5
    
    # 检查服务状态
    if command -v curl &> /dev/null; then
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            success "服务健康检查通过"
        else
            warning "服务健康检查失败"
        fi
    fi
}

# 清理函数
cleanup() {
    log "清理临时文件..."
    rm -rf node_modules/.cache
    rm -rf .next/cache
    success "清理完成"
}

# 显示部署信息
show_deploy_info() {
    echo ""
    echo "=================================="
    echo "🚀 部署信息"
    echo "=================================="
    echo "项目名称: $PROJECT_NAME"
    echo "环境: $ENVIRONMENT"
    echo "版本: $VERSION"
    echo "时间: $(date)"
    echo "=================================="
    echo ""
}

# 主函数
main() {
    show_deploy_info
    
    check_dependencies
    check_environment
    quality_check
    create_backup
    build_application
    health_check
    
    # 根据环境选择部署方式
    case $ENVIRONMENT in
        "vercel")
            deploy_vercel
            ;;
        "netlify")
            deploy_netlify
            ;;
        "docker")
            deploy_docker
            ;;
        "production")
            log "选择部署平台: [1] Vercel [2] Netlify [3] Docker"
            read -p "请输入选择 (1-3): " choice
            case $choice in
                1) deploy_vercel ;;
                2) deploy_netlify ;;
                3) deploy_docker ;;
                *) error "无效选择" ;;
            esac
            ;;
        *)
            warning "未知环境，执行默认构建"
            ;;
    esac
    
    post_deploy_validation
    cleanup
    
    success "🎉 部署完成！"
}

# 信号处理
trap cleanup EXIT

# 执行主函数
main "$@" 