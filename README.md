# FoodSnap - 智能饮食记录应用

## 🍽️ 项目简介

FoodSnap 是一款简洁美观的日常饮食记录应用，采用现代玻璃拟态（Glassmorphism）设计风格，通过日历视图直观展示每日饮食记录，支持拍照上传、热量统计和智能饮食推荐。

## ✨ 主要功能

- 📅 **日历视图** - 直观展示每日饮食记录
- 🔥 **热量追踪** - 精准记录每餐热量摄入
- 🤖 **智能推荐** - 基于饮食习惯的个性化建议
- 📸 **拍照记录** - 记录食物照片
- 📊 **统计图表** - 可视化分析饮食数据
- 👤 **个人中心** - 管理个人目标和偏好

## 🎨 设计特点

- **玻璃拟态 UI** - 半透明背景、模糊效果、微妙的边框发光
- **响应式设计** - 完美适配手机、平板和桌面端
- **流畅动画** - 精心设计的交互动效
- **现代色彩系统** - 靛蓝紫主色调，粉红和翠绿辅助

## 🛠️ 技术栈

### 前端
- **React 18** + **TypeScript** - 类型安全的前端框架
- **Vite** - 快速构建工具
- **React Router v6** - 路由管理
- **CSS Modules** - 模块化样式
- **date-fns** - 日期处理

### 后端（可选扩展）
- **Node.js** + **Express**
- **Supabase** - 数据库和认证
- **Prisma** - ORM

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 📁 项目结构

```
foodrecord/
├── src/
│   ├── components/          # React 组件
│   │   ├── common/         # 通用组件（Button, Input, GlassCard）
│   │   └── layout/         # 布局组件（Layout, Navigation）
│   ├── contexts/            # React Context
│   ├── pages/               # 页面组件
│   ├── types/               # TypeScript 类型定义
│   ├── App.tsx             # 应用主组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎯 核心组件

### 玻璃卡片 (GlassCard)
采用玻璃拟态设计风格的卡片组件，支持半透明背景、模糊效果和悬浮动画。

### 底部导航 (Navigation)
液态玻璃材质的底部导航栏，包含首页、统计、添加、推荐、我的五个导航项。

### 日历视图 (CalendarView)
展示月度日历，支持日期选择、月份切换、今日高亮和有记录日期标记。

## 🔐 数据存储

当前版本使用 localStorage 存储数据：
- 用户信息
- 饮食记录
- 应用设置

未来版本将集成 Supabase 云数据库，支持多设备同步。

## 📱 响应式断点

- **手机** (`< 480px`) - 单列布局
- **平板** (`768px - 1024px`) - 双列布局
- **桌面** (`> 1024px`) - 多列布局，最大宽度限制

## 🎨 设计系统

### 色彩系统
- **主色**: `#6366F1` (靛蓝紫)
- **次要色**: `#EC4899` (粉红)
- **强调色**: `#10B981` (翠绿)

### 字体
- **标题**: Playfair Display
- **正文**: Inter
- **数据**: JetBrains Mono

### 间距
基于 4px 的倍数系统：`4px, 8px, 16px, 24px, 32px, 48px, 64px`

## 🔧 开发规范

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 格式化代码
- 遵循 TypeScript 最佳实践

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请联系开发者。

---

**Made with ❤️ using React + TypeScript**
