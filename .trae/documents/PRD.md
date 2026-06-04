# 饮食记录应用 - 产品需求文档

## 1. 产品概述

### 产品名称
**FoodSnap** - 智能饮食记录与健康管理应用

### 产品定位
一款简洁美观的日常饮食记录工具，通过日历视图直观展示每日饮食，支持拍照上传、热量统计和智能饮食推荐，帮助用户养成健康的饮食习惯。

### 目标用户
- 注重健康饮食管理的个人用户
- 健身爱好者和减脂人群
- 需要控制热量摄入的用户
- 希望追踪饮食习惯并获取科学建议的用户

### 核心价值主张
"记录每一餐，健康每一天" - 通过直观的日历界面和智能推荐，让饮食管理变得简单有趣。

---

## 2. 用户故事与功能需求

### 2.1 用户认证模块

#### 注册与登录
**作为新用户，我希望能够通过邮箱注册并登录系统，以便我的饮食数据能够安全保存和同步。**

功能需求：
- 邮箱注册（必填：邮箱、密码）
- 邮箱登录（邮箱、密码）
- 密码找回功能
- 保持登录状态（Remember Me）
- 退出登录

用户故事：
1. 新用户打开应用 → 看到欢迎页面 → 点击注册 → 填写邮箱密码 → 完成注册 → 自动登录
2. 已注册用户打开应用 → 看到登录页 → 填写邮箱密码 → 登录成功 → 进入首页
3. 用户忘记密码 → 点击忘记密码 → 输入邮箱 → 收到重置链接 → 重置密码 → 登录

#### 游客模式
**作为临时用户，我希望能够先体验应用功能，之后再决定是否注册。**

功能需求：
- 游客可以浏览和体验基础功能
- 游客数据本地存储
- 游客可以随时注册/登录迁移数据

### 2.2 日历视图模块

#### 主界面日历展示
**作为用户，我希望在首页看到一个清晰的日历视图，以便快速查看任意一天的饮食记录。**

功能需求：
- 月视图展示（默认视图）
- 日视图详情
- 周视图快速浏览
- 日期选择器快速跳转
- 今日高亮标识
- 有记录日期标记（圆点/图标）
- 点击日期查看当天详情

用户故事：
1. 用户打开应用 → 看到本月日历 → 今日日期高亮 → 有记录的日期显示标记
2. 用户点击某日期 → 切换到该日期的详细饮食记录视图
3. 用户滑动切换月份 → 日历自动加载对应月份的数据

#### 日历交互
- 左右滑动/箭头切换月份
- 点击顶部年月快速选择
- 长按日期显示简要统计
- 颜色编码区分记录状态（未记录/已记录/超标）

### 2.3 饮食记录模块

#### 添加饮食记录
**作为用户，我希望能够快速记录每餐吃了什么，包含食物名称和份量，以便追踪我的饮食摄入。**

功能需求：
- 快速添加食物（食物名称、份量单位）
- 预设常用食物快捷添加
- 最近食用食物记录
- 搜索食物数据库
- 自定义食物添加
- 记录用餐时间（早/午/晚/加餐）
- 记录具体时间点

用户故事：
1. 用户点击日期 → 进入该日期详情 → 点击"添加饮食" → 选择用餐类型 → 搜索或选择食物 → 填写份量 → 保存
2. 用户点击常用食物 → 快速添加
3. 用户自定义食物 → 输入名称、热量 → 保存

#### 饮食记录详情
- 展示当天所有饮食记录
- 按早餐/午餐/晚餐/加餐分类
- 显示每餐总热量
- 显示当天总热量
- 支持编辑和删除记录
- 显示营养成分占比（可选）

### 2.4 拍照上传模块

#### 食物拍照
**作为用户，我希望能够拍照记录我的食物，系统能够自动识别食物并提取信息。**

功能需求：
- 相机拍摄食物照片
- 相册选择图片
- 拍照后自动抠图（移除背景）
- 图片裁剪和旋转
- 照片滤镜（增强食欲）
- 照片保存到记录中

用户故事：
1. 用户点击相机图标 → 打开相机 → 对准食物拍摄 → 自动抠图处理 → 显示处理后图片 → 保存到记录
2. 用户从相册选择图片 → 选择食物区域 → 抠图处理 → 保存

#### 图片处理
- 自动背景移除（AI抠图）
- 手动调整边缘
- 亮度/对比度调整
- 裁剪和缩放

### 2.5 热量统计模块

#### 数据统计
**作为用户，我希望能够看到我的热量摄入统计，以便了解我的饮食习惯是否符合健康标准。**

功能需求：
- 当日热量总计
- 当周热量趋势图
- 当月热量统计
- 热量目标设置
- 达成率展示
- 营养成分分布（碳水/蛋白质/脂肪）

用户故事：
1. 用户在首页 → 看到今日热量环形图 → 了解当天摄入情况
2. 用户点击统计按钮 → 查看本周/本月趋势图 → 分析饮食习惯
3. 用户设置每日目标 → 系统根据目标给出建议

#### 统计可视化
- 环形图展示当日摄入
- 柱状图展示一周趋势
- 折线图展示月度趋势
- 营养成分饼图
- 热量目标进度条

### 2.6 智能推荐模块

#### 饮食推荐
**作为用户，我希望系统能够根据我的饮食记录，推荐合适的食物和饮食计划。**

功能需求：
- 基于历史记录的推荐
- 每日饮食建议
- 营养均衡提醒
- 食物替代建议
- 个性化饮食计划生成
- 减脂/增肌/维持等目标支持

用户故事：
1. 用户记录了几天饮食 → 系统分析偏好 → 给出个性化推荐
2. 用户说"今天想吃点清淡的" → 系统推荐清淡食物选项
3. 用户设置减脂目标 → 系统生成减脂饮食计划

#### 推荐算法
- 分析用户饮食偏好
- 计算营养缺口
- 结合季节和时令
- 考虑用户过敏和偏好
- 生成周计划/日计划

### 2.7 个人设置模块

#### 用户信息管理
**作为用户，我希望能够管理我的个人信息和偏好设置。**

功能需求：
- 修改个人资料（昵称、头像）
- 设置每日热量目标
- 设置营养成分比例目标
- 饮食偏好设置（过敏、素食等）
- 通知设置
- 数据导出
- 账户安全设置

### 2.8 导航栏设计

#### 液态玻璃导航栏
**导航栏采用液态玻璃（Glassmorphism）设计风格，提供沉浸式的视觉体验和流畅的导航操作。**

设计要求：
- 半透明玻璃效果
- 背景模糊（backdrop-filter: blur）
- 微妙的边框发光
- 圆润的边角
- 悬浮感和层次感
- 平滑的过渡动画

导航项：
- 首页（日历视图）
- 统计
- 添加（中心突出按钮）
- 推荐
- 我的

---

## 3. UI/UX 设计规范

### 3.1 设计理念

**设计风格：玻璃拟态（Glassmorphism）**
- 现代、轻盈、通透
- 强调层次感和深度
- 柔和的阴影和发光效果
- 流动感和现代感

### 3.2 色彩系统

#### 主色调
```
主色（Primary）：#6366F1（靛蓝紫）
主色浅（Primary Light）：#818CF8
主色深（Primary Dark）：#4F46E5
```

#### 次要色
```
次要色（Secondary）：#EC4899（粉红）
次要色浅（Secondary Light）：#F472B6
强调色（Accent）：#10B981（翠绿）
```

#### 背景色
```
背景渐变开始：#E0E7FF（淡紫蓝）
背景渐变结束：#FCE7F3（淡粉红）
玻璃背景：rgba(255, 255, 255, 0.25)
深色玻璃：rgba(0, 0, 0, 0.15)
```

#### 文字色
```
主要文字：#1F2937（深灰）
次要文字：#6B7280（灰）
浅色文字：#FFFFFF（白）
强调文字：#6366F1（主色）
```

#### 功能色
```
成功色：#10B981
警告色：#F59E0B
错误色：#EF4444
信息色：#3B82F6
```

### 3.3 字体系统

#### 字体选择
- 主标题：`"Playfair Display", serif` - 优雅、时尚
- 副标题：`"Inter", sans-serif` - 现代、清晰
- 正文：`"Inter", sans-serif` - 易读性强
- 数字/数据：`"JetBrains Mono", monospace` - 科技感

#### 字号规范
```
H1（主标题）：32px / 2rem
H2（页面标题）：24px / 1.5rem
H3（卡片标题）：20px / 1.25rem
H4（小标题）：16px / 1rem
Body（大正文）：16px / 1rem
Body2（小正文）：14px / 0.875rem
Caption（说明文字）：12px / 0.75rem
```

#### 字重规范
```
Light：300
Regular：400
Medium：500
Semibold：600
Bold：700
```

### 3.4 间距系统

#### 基础间距单位
```
xs：4px
sm：8px
md：16px
lg：24px
xl：32px
2xl：48px
3xl：64px
```

#### 组件间距
```
卡片内边距：24px
元素间距：16px
小组件间距：8px
大区块间距：32px
```

### 3.5 圆角系统

```
小圆角：8px（按钮、小卡片）
中圆角：16px（卡片、输入框）
大圆角：24px（模态框、大卡片）
全圆：9999px（胶囊按钮、头像）
```

### 3.6 阴影系统

#### 玻璃阴影
```css
glass-shadow: 
  0 8px 32px rgba(31, 38, 135, 0.15),
  inset 0 0 0 1px rgba(255, 255, 255, 0.1);
```

#### 卡片阴影
```css
card-shadow: 
  0 4px 6px -1px rgba(0, 0, 0, 0.1),
  0 2px 4px -1px rgba(0, 0, 0, 0.06);
```

#### 悬浮阴影
```css
hover-shadow: 
  0 20px 25px -5px rgba(0, 0, 0, 0.1),
  0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### 3.7 动效设计

#### 转场动画
```css
page-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

#### 悬浮效果
```css
hover-scale: transform scale(1.02);
hover-duration: 200ms;
```

#### 加载动画
- 骨架屏（Skeleton Screen）
- 脉冲动画（Pulse）
- 旋转加载器（Spinner）

### 3.8 玻璃效果实现

#### 玻璃组件基础样式
```css
.glass {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}
```

#### 深色玻璃效果
```css
.glass-dark {
  background: rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 4. 页面结构

### 4.1 页面清单

1. **欢迎页** (`/welcome`)
   - Logo展示
   - 产品介绍
   - 登录/注册按钮
   - 游客体验入口

2. **登录页** (`/login`)
   - 邮箱输入框
   - 密码输入框
   - 登录按钮
   - 忘记密码链接
   - 注册入口

3. **注册页** (`/register`)
   - 邮箱输入框
   - 密码输入框
   - 确认密码输入框
   - 注册按钮
   - 登录入口

4. **首页（日历视图）** (`/`)
   - 顶部导航栏
   - 月份切换器
   - 日历网格
   - 今日热量概览
   - 底部导航栏

5. **日期详情页** (`/date/:date`)
   - 日期标题
   - 早餐记录区
   - 午餐记录区
   - 晚餐记录区
   - 加餐记录区
   - 添加按钮
   - 拍照入口

6. **添加饮食页** (`/add`)
   - 食物搜索框
   - 推荐食物列表
   - 常用食物
   - 最近食用
   - 自定义添加

7. **拍照页** (`/camera`)
   - 相机取景框
   - 拍摄按钮
   - 相册选择
   - 抠图预览

8. **统计页** (`/stats`)
   - 今日热量
   - 本周趋势
   - 本月统计
   - 营养分布
   - 目标进度

9. **推荐页** (`/recommendations`)
   - 今日推荐
   - 饮食计划
   - 健康提示
   - 食物库浏览

10. **个人中心** (`/profile`)
    - 用户头像和昵称
    - 每日目标设置
    - 饮食偏好设置
    - 账户设置
    - 数据管理

### 4.2 页面流程图

```
欢迎页
  ↓
注册/登录 ←→ 游客入口
  ↓
首页（日历视图）
  ↓
点击日期 → 日期详情页
  ↓
添加饮食/拍照
  ↓
保存 → 返回日历
```

---

## 5. 数据模型

### 5.1 用户表 (users)
```typescript
interface User {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  daily_calorie_goal: number;
  daily_protein_goal: number;
  daily_carbs_goal: number;
  daily_fat_goal: number;
  dietary_preferences: string[];
  allergies: string[];
  created_at: string;
  updated_at: string;
}
```

### 5.2 饮食记录表 (food_logs)
```typescript
interface FoodLog {
  id: string;
  user_id: string;
  food_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  notes: string | null;
  logged_at: string;
  date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}
```

### 5.3 食物库表 (foods)
```typescript
interface Food {
  id: string;
  name: string;
  name_en: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  serving_sizes: {
    name: string;
    grams: number;
  }[];
  image_url: string | null;
  created_at: string;
}
```

### 5.4 食物图片表 (food_images)
```typescript
interface FoodImage {
  id: string;
  user_id: string;
  food_log_id: string | null;
  image_url: string;
  processed_image_url: string | null;
  created_at: string;
}
```

---

## 6. 技术需求

### 6.1 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router v6
- **状态管理**: React Context + Hooks
- **HTTP客户端**: Axios
- **样式**: CSS Modules + CSS Variables
- **动画**: Framer Motion
- **图表**: Recharts
- **日期处理**: date-fns
- **表单验证**: React Hook Form + Zod
- **图像处理**: Canvas API / html2canvas

### 6.2 后端技术栈
- **运行环境**: Node.js 18+
- **框架**: Express.js
- **认证**: JWT (JSON Web Tokens)
- **密码加密**: bcrypt
- **数据库ORM**: Prisma
- **文件上传**: Multer
- **图像处理**: Sharp
- **验证**: Joi / Zod

### 6.3 数据库
- **主数据库**: Supabase (PostgreSQL)
- **实时订阅**: Supabase Realtime

### 6.4 API 设计

#### 认证接口
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET /api/auth/me
```

#### 饮食记录接口
```
GET /api/food-logs?date=YYYY-MM-DD
GET /api/food-logs/month?year=YYYY&month=MM
POST /api/food-logs
PUT /api/food-logs/:id
DELETE /api/food-logs/:id
```

#### 食物库接口
```
GET /api/foods?search=keyword
GET /api/foods/:id
GET /api/foods/popular
GET /api/foods/recommended
POST /api/foods (admin)
```

#### 统计接口
```
GET /api/stats/daily?date=YYYY-MM-DD
GET /api/stats/weekly?startDate=YYYY-MM-DD
GET /api/stats/monthly?year=YYYY&month=MM
```

#### 用户接口
```
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/goals
PUT /api/users/preferences
```

### 6.5 第三方集成
- **图像识别**: TensorFlow.js / 百度AI图像识别API
- **地图服务**: 可选（餐厅推荐使用）
- **推送通知**: Firebase Cloud Messaging

---

## 7. 非功能性需求

### 7.1 性能要求
- 页面首次加载时间 < 3秒
- 交互响应时间 < 100ms
- 图片压缩和质量优化
- 懒加载非关键资源

### 7.2 安全要求
- 所有数据传输使用HTTPS
- 敏感信息加密存储
- JWT token安全管理
- SQL注入防护
- XSS防护
- CORS配置

### 7.3 可用性要求
- 支持主流浏览器（Chrome, Firefox, Safari, Edge）
- 响应式设计，适配手机/平板/桌面
- 离线数据缓存
- 优雅的错误处理
- 友好的用户提示

### 7.4 可访问性要求
- 键盘导航支持
- ARIA标签
- 颜色对比度符合WCAG标准
- 支持屏幕阅读器

---

## 8. MVP 功能优先级

### P0（必须实现）
1. 用户注册和登录
2. 日历视图展示
3. 添加饮食记录
4. 热量统计（今日）
5. 玻璃拟态UI设计
6. 响应式布局

### P1（第二阶段）
1. 拍照上传功能
2. 周/月统计图表
3. 食物搜索和推荐
4. 编辑和删除记录
5. 个人目标设置

### P2（第三阶段）
1. AI食物识别
2. 智能饮食推荐
3. 数据导出功能
4. 社交分享功能
5. 通知提醒功能

---

## 9. 产品路线图

### 第一阶段：基础功能（MVP）
- 完成用户认证系统
- 实现日历视图和饮食记录
- 完成热量统计基础功能
- 玻璃拟态UI开发

### 第二阶段：增强体验
- 添加拍照和图片处理
- 完善统计图表
- 食物数据库扩充
- 推荐系统基础

### 第三阶段：智能化
- AI食物识别
- 个性化推荐算法
- 健康报告生成
- 社区功能

---

## 10. 成功指标

### 用户指标
- 日活跃用户数（DAU）
- 用户留存率（次日/7日/30日）
- 用户增长率
- 平均每日记录次数

### 业务指标
- 功能使用率
- 核心流程完成率
- 用户满意度评分
- 付费转化率（未来）

### 技术指标
- 系统可用性（99.9%）
- API响应时间（<200ms）
- 错误率（<1%）
- 页面性能评分（Google Lighthouse > 90）

---

**文档版本**: v1.0
**最后更新**: 2026-05-28
**文档作者**: AI Assistant
