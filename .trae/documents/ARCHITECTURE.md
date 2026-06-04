# 饮食记录应用 - 技术架构文档

## 1. 系统架构概览

### 1.1 整体架构图

```
┌─────────────────────────────────────────────────────┐
│                    前端应用层                        │
│              (React + TypeScript)                   │
│  ┌─────────────────────────────────────────────┐   │
│  │           UI Components (Glass UI)           │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │  日历   │ │ 相机    │ │ 统计    │       │   │
│  │  │  视图   │ │ 拍照    │ │ 图表    │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │           状态管理层                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ Auth    │ │ Food    │ │ Stats   │       │   │
│  │  │ Context │ │ Context │ │ Context │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │           API 服务层                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ HTTP    │ │ Supabase│ │ Auth    │       │   │
│  │  │ Client  │ │ Client  │ │ Service │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                    后端服务层                        │
│              (Node.js + Express)                    │
│  ┌─────────────────────────────────────────────┐   │
│  │           API Routes                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │  认证   │ │ 饮食    │ │ 统计    │       │   │
│  │  │  路由   │ │ 路由    │ │ 路由    │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │           业务逻辑层                          │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │ 用户    │ │ 饮食    │ │ 统计    │       │   │
│  │  │ 服务    │ │ 服务    │ │ 服务    │       │   │
│  │  └─────────┘ └─────────┘ └─────────┘       │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │           数据访问层                          │   │
│  │  ┌─────────┐ ┌─────────┐                    │   │
│  │  │ Prisma  │ │ Redis   │                    │   │
│  │  │ ORM     │ │ Cache   │                    │   │
│  │  └─────────┘ └─────────┘                    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                    数据存储层                        │
│  ┌─────────────────────────────────────────────┐   │
│  │           数据库服务                          │   │
│  │  ┌─────────────────────────────────────────┐│   │
│  │  │  Supabase (PostgreSQL)                  ││   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐  ││   │
│  │  │  │  用户   │ │ 饮食记录│ │ 食物库 │  ││   │
│  │  │  │  表     │ │  表     │ │  表    │  ││   │
│  │  │  └─────────┘ └─────────┘ └─────────┘  ││   │
│  │  └─────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │           文件存储                            │   │
│  │  ┌─────────────────────────────────────────┐│   │
│  │  │  Supabase Storage                       ││   │
│  │  │  ┌─────────────────────────────────────┐ ││   │
│  │  │  │  /avatars    - 用户头像             │ ││   │
│  │  │  │  /food-images - 食物图片             │ ││   │
│  │  │  └─────────────────────────────────────┘ ││   │
│  │  └─────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 1.2 技术栈总结

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **前端框架** | React 18 + TypeScript | 类型安全，组件化开发 |
| **构建工具** | Vite | 快速开发，热更新 |
| **路由管理** | React Router v6 | SPA路由控制 |
| **状态管理** | React Context + Hooks | 轻量级状态管理 |
| **HTTP客户端** | Axios | 请求拦截，统一错误处理 |
| **样式方案** | CSS Modules + CSS Variables | 模块化，主题切换 |
| **动画库** | Framer Motion | 流畅动画效果 |
| **图表库** | Recharts | 数据可视化 |
| **日期处理** | date-fns | 轻量日期库 |
| **表单验证** | React Hook Form + Zod | 高性能表单处理 |
| **后端框架** | Express.js | 轻量级Node.js框架 |
| **数据库ORM** | Prisma | 类型安全的数据访问 |
| **数据库** | Supabase (PostgreSQL) | 云端数据库服务 |
| **文件存储** | Supabase Storage | 云端文件存储 |
| **实时订阅** | Supabase Realtime | 实时数据同步 |
| **认证方案** | JWT + bcrypt | 无状态认证 |
| **密码加密** | bcrypt | 安全密码存储 |

---

## 2. 前端架构设计

### 2.1 项目目录结构

```
foodrecord/
├── public/                      # 静态资源
│   ├── favicon.ico
│   └── images/
├── src/
│   ├── assets/                  # 资源文件
│   │   ├── fonts/              # 字体文件
│   │   ├── icons/              # SVG图标
│   │   └── images/             # 图片资源
│   │
│   ├── components/             # 公共组件
│   │   ├── common/            # 通用组件
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   └── Card/
│   │   │
│   │   ├── layout/            # 布局组件
│   │   │   ├── Header/
│   │   │   ├── Navigation/
│   │   │   └── Container/
│   │   │
│   │   ├── calendar/          # 日历相关组件
│   │   │   ├── CalendarView/
│   │   │   ├── CalendarGrid/
│   │   │   ├── CalendarDay/
│   │   │   └── MonthSelector/
│   │   │
│   │   ├── food/              # 食物相关组件
│   │   │   ├── FoodCard/
│   │   │   ├── FoodSearch/
│   │   │   ├── FoodList/
│   │   │   └── MealSelector/
│   │   │
│   │   ├── stats/             # 统计相关组件
│   │   │   ├── CalorieRing/
│   │   │   ├── TrendChart/
│   │   │   └── NutritionPie/
│   │   │
│   │   └── camera/            # 相机相关组件
│   │       ├── CameraCapture/
│   │       ├── ImagePreview/
│   │       └── ImageCropper/
│   │
│   ├── pages/                 # 页面组件
│   │   ├── Welcome/
│   │   ├── Login/
│   │   ├── Register/
│   │   ├── Home/              # 日历首页
│   │   ├── DateDetail/        # 日期详情
│   │   ├── AddFood/
│   │   ├── Camera/
│   │   ├── Stats/
│   │   ├── Recommendations/
│   │   └── Profile/
│   │
│   ├── contexts/              # React Context
│   │   ├── AuthContext.tsx
│   │   ├── FoodContext.tsx
│   │   ├── StatsContext.tsx
│   │   └── ThemeContext.tsx
│   │
│   ├── hooks/                 # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── useFoodLogs.ts
│   │   ├── useStats.ts
│   │   ├── useCalendar.ts
│   │   └── useCamera.ts
│   │
│   ├── services/              # API服务
│   │   ├── api.ts             # Axios配置
│   │   ├── authService.ts
│   │   ├── foodService.ts
│   │   ├── statsService.ts
│   │   └── userService.ts
│   │
│   ├── utils/                 # 工具函数
│   │   ├── dateUtils.ts
│   │   ├── nutritionUtils.ts
│   │   ├── validationUtils.ts
│   │   └── imageUtils.ts
│   │
│   ├── types/                  # TypeScript类型
│   │   ├── auth.types.ts
│   │   ├── food.types.ts
│   │   ├── stats.types.ts
│   │   └── api.types.ts
│   │
│   ├── styles/                 # 全局样式
│   │   ├── variables.css      # CSS变量
│   │   ├── global.css         # 全局样式
│   │   ├── animations.css     # 动画定义
│   │   └── glassmorphism.css  # 玻璃效果
│   │
│   ├── App.tsx                # 根组件
│   ├── main.tsx               # 入口文件
│   └── router.tsx             # 路由配置
│
├── server/                     # 后端代码
│   ├── src/
│   │   ├── config/            # 配置文件
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── routes/           # 路由
│   │   │   ├── auth.routes.ts
│   │   │   ├── food.routes.ts
│   │   │   ├── stats.routes.ts
│   │   │   └── user.routes.ts
│   │   │
│   │   ├── controllers/      # 控制器
│   │   │   ├── auth.controller.ts
│   │   │   ├── food.controller.ts
│   │   │   ├── stats.controller.ts
│   │   │   └── user.controller.ts
│   │   │
│   │   ├── services/         # 业务逻辑
│   │   │   ├── auth.service.ts
│   │   │   ├── food.service.ts
│   │   │   ├── stats.service.ts
│   │   │   └── user.service.ts
│   │   │
│   │   ├── middlewares/      # 中间件
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   │
│   │   ├── utils/           # 工具函数
│   │   │   ├── jwt.ts
│   │   │   ├── bcrypt.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── app.ts           # Express应用
│   │
│   └── prisma/              # Prisma ORM
│       └── schema.prisma
│
├── .env                       # 环境变量
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 2.2 核心组件架构

#### 2.2.1 玻璃拟态组件（Glass UI）

**GlassCard 组件**
```typescript
interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark';
  intensity?: 'low' | 'medium' | 'high';
  hover?: boolean;
  className?: string;
}
```

**实现要点**：
- 使用 `backdrop-filter: blur()` 实现模糊效果
- 半透明背景色
- 微妙的边框和阴影
- 支持悬浮动效

**CSS 实现**：
```css
.glass-card {
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(31, 38, 135, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 40px rgba(31, 38, 135, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}
```

#### 2.2.2 日历组件（CalendarView）

**组件结构**：
```
CalendarView
├── MonthSelector
│   ├── PrevButton
│   ├── CurrentMonth
│   └── NextButton
├── WeekdayHeaders
│   └── Weekday[]
├── CalendarGrid
│   └── CalendarDay[] (6x7 = 42天)
└── TodayMarker
```

**状态管理**：
```typescript
interface CalendarState {
  currentMonth: Date;
  selectedDate: Date | null;
  viewMode: 'month' | 'week';
  foodLogs: Map<string, FoodLog[]>;
}
```

#### 2.2.3 导航栏组件（GlassNavigation）

**组件结构**：
```
GlassNavigation
├── NavItem (首页)
├── NavItem (统计)
├── AddButton (中心突出)
├── NavItem (推荐)
└── NavItem (我的)
```

**样式特性**：
- 底部固定定位
- 全宽玻璃效果
- 高度安全区域适配
- 中心按钮悬浮突出
- 活跃状态指示器

### 2.3 状态管理架构

#### 2.3.1 AuthContext

```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

#### 2.3.2 FoodContext

```typescript
interface FoodState {
  logs: FoodLog[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
}

interface FoodContextValue extends FoodState {
  fetchLogsByDate: (date: string) => Promise<void>;
  fetchLogsByMonth: (year: number, month: number) => Promise<void>;
  addFoodLog: (data: FoodLogInput) => Promise<void>;
  updateFoodLog: (id: string, data: Partial<FoodLog>) => Promise<void>;
  deleteFoodLog: (id: string) => Promise<void>;
}
```

### 2.4 API 服务层

**Axios 实例配置**：
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 3. 后端架构设计

### 3.1 项目结构

```
server/
├── src/
│   ├── config/
│   │   ├── index.ts          # 配置汇总
│   │   ├── database.ts      # 数据库配置
│   │   └── auth.ts          # 认证配置
│   │
│   ├── routes/
│   │   └── index.ts         # 路由汇总
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── food.controller.ts
│   │   ├── stats.controller.ts
│   │   └── user.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── food.service.ts
│   │   ├── stats.service.ts
│   │   └── user.service.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── utils/
│   │   ├── jwt.util.ts
│   │   ├── bcrypt.util.ts
│   │   └── validators.ts
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── package.json
```

### 3.2 API 设计

#### 3.2.1 认证接口

**POST /api/auth/register**
```typescript
// Request
{
  email: string;
  password: string;
  nickname: string;
}

// Response 201
{
  success: true;
  data: {
    user: User;
    token: string;
  };
}
```

**POST /api/auth/login**
```typescript
// Request
{
  email: string;
  password: string;
}

// Response 200
{
  success: true;
  data: {
    user: User;
    token: string;
  };
}
```

#### 3.2.2 饮食记录接口

**GET /api/food-logs**
```typescript
// Query Params
{
  date?: string;  // YYYY-MM-DD
  month?: string; // YYYY-MM
}

// Response 200
{
  success: true;
  data: FoodLog[];
}
```

**POST /api/food-logs**
```typescript
// Request
{
  food_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  image_url?: string;
  notes?: string;
}

// Response 201
{
  success: true;
  data: FoodLog;
}
```

#### 3.2.3 统计接口

**GET /api/stats/daily**
```typescript
// Query Params
{
  date: string;  // YYYY-MM-DD
}

// Response 200
{
  success: true;
  data: {
    date: string;
    total_calories: number;
    total_protein: number;
    total_carbs: number;
    total_fat: number;
    meals: {
      breakfast: MealStats;
      lunch: MealStats;
      dinner: MealStats;
      snack: MealStats;
    };
    goal_percentage: number;
  };
}
```

### 3.3 中间件设计

#### 认证中间件
```typescript
const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('未提供认证令牌');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    next();
  } catch (error) {
    next(new UnauthorizedError('无效的认证令牌'));
  }
};
```

#### 错误处理中间件
```typescript
const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);
  
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        details: err.details,
      },
    });
  }
  
  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      success: false,
      error: {
        message: err.message,
      },
    });
  }
  
  return res.status(500).json({
    success: false,
    error: {
      message: '服务器内部错误',
    },
  });
};
```

---

## 4. 数据库设计

### 4.1 Supabase 数据库架构

#### 4.1.1 表结构

**users 表**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(100),
  avatar_url TEXT,
  daily_calorie_goal INTEGER DEFAULT 2000,
  daily_protein_goal INTEGER DEFAULT 150,
  daily_carbs_goal INTEGER DEFAULT 250,
  daily_fat_goal INTEGER DEFAULT 65,
  dietary_preferences TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_email ON users(email);
```

**food_logs 表**
```sql
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  servings DECIMAL(10, 2) DEFAULT 1,
  serving_unit VARCHAR(50) DEFAULT '份',
  calories INTEGER NOT NULL,
  protein DECIMAL(10, 2) DEFAULT 0,
  carbs DECIMAL(10, 2) DEFAULT 0,
  fat DECIMAL(10, 2) DEFAULT 0,
  image_url TEXT,
  notes TEXT,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX idx_food_logs_date ON food_logs(date);
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, date);
```

**foods 表**
```sql
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  name_en VARCHAR(255),
  category VARCHAR(100),
  calories_per_100g INTEGER NOT NULL,
  protein_per_100g DECIMAL(10, 2) DEFAULT 0,
  carbs_per_100g DECIMAL(10, 2) DEFAULT 0,
  fat_per_100g DECIMAL(10, 2) DEFAULT 0,
  serving_sizes JSONB DEFAULT '[]',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建全文搜索索引
CREATE INDEX idx_foods_name ON foods USING GIN (to_tsvector('english', name));
```

**food_images 表**
```sql
CREATE TABLE food_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_log_id UUID REFERENCES food_logs(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  processed_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 4.1.2 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_images ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own food logs" ON food_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs" ON food_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs" ON food_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs" ON food_logs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own food images" ON food_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food images" ON food_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### 4.2 Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   String    @id @default(uuid())
  email                String    @unique
  passwordHash         String    @map("password_hash")
  nickname             String?
  avatarUrl            String?   @map("avatar_url")
  dailyCalorieGoal     Int       @default(2000) @map("daily_calorie_goal")
  dailyProteinGoal     Int       @default(150) @map("daily_protein_goal")
  dailyCarbsGoal       Int       @default(250) @map("daily_carbs_goal")
  dailyFatGoal         Int       @default(65) @map("daily_fat_goal")
  dietaryPreferences   String[]  @map("dietary_preferences")
  allergies            String[]
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  
  foodLogs   FoodLog[]
  foodImages FoodImage[]
  
  @@map("users")
  @@index([email])
}

model FoodLog {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  foodName     String    @map("food_name")
  mealType     MealType
  servings     Decimal   @default(1)
  servingUnit  String    @default("份") @map("serving_unit")
  calories     Int
  protein      Decimal   @default(0)
  carbs        Decimal   @default(0)
  fat          Decimal   @default(0)
  imageUrl     String?   @map("image_url")
  notes        String?
  loggedAt     DateTime  @default(now()) @map("logged_at")
  date         DateTime  @db.Date
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")
  
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodImage    FoodImage?
  
  @@map("food_logs")
  @@index([userId])
  @@index([date])
  @@index([userId, date])
}

model Food {
  id               String    @id @default(uuid())
  name             String
  nameEn           String?   @map("name_en")
  category         String?
  caloriesPer100g  Int       @map("calories_per_100g")
  proteinPer100g   Decimal   @map("protein_per_100g") @default(0)
  carbsPer100g     Decimal   @map("carbs_per_100g") @default(0)
  fatPer100g       Decimal   @map("fat_per_100g") @default(0)
  servingSizes     Json      @map("serving_sizes") @default("[]")
  imageUrl         String?   @map("image_url")
  createdAt        DateTime  @default(now()) @map("created_at")
  
  @@map("foods")
}

model FoodImage {
  id                 String    @id @default(uuid())
  userId             String    @map("user_id")
  foodLogId          String?   @map("food_log_id")
  imageUrl           String    @map("image_url")
  processedImageUrl  String?   @map("processed_image_url")
  createdAt          DateTime  @default(now()) @map("created_at")
  
  user               User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodLog            FoodLog?  @relation(fields: [foodLogId], references: [id], onDelete: SetNull)
  
  @@map("food_images")
  @@index([userId])
}

enum MealType {
  breakfast
  lunch
  dinner
  snack
}
```

---

## 5. 部署架构

### 5.1 前端部署

**Vercel 部署配置**：
- 环境变量配置
- 自动 HTTPS
- CDN 全球分发
- Serverless Functions

**构建优化**：
```bash
# vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router'],
          charts: ['recharts'],
        },
      },
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
});
```

### 5.2 后端部署

**Render/Railway/Render 部署**：
- Node.js 18+ 环境
- 环境变量配置
- 自动 HTTPS
- 水平扩展

### 5.3 数据库部署

**Supabase**：
- 免费套餐：500MB 数据库，1GB 文件存储
- 自动备份
- 全球 CDN
- 实时订阅支持

---

## 6. 安全设计

### 6.1 认证安全

- **密码加密**：使用 bcrypt，salt rounds = 12
- **JWT 安全**：
  - Token 有效期：7天（访问令牌）
  - 刷新令牌：30天
  - Token 存储：HttpOnly Cookie 或 localStorage（前端）
- **CORS 配置**：严格的白名单策略
- **Rate Limiting**：登录接口限流（5次/分钟）

### 6.2 数据安全

- **HTTPS**：全站强制 HTTPS
- **SQL 注入**：使用 Prisma ORM 参数化查询
- **XSS 防护**：
  - React 自动转义
  - CSP (Content Security Policy)
- **CSRF 防护**：
  - SameSite Cookie
  - CSRF Token

### 6.3 API 安全

- **输入验证**：使用 Zod/Joi 验证所有输入
- **权限控制**：RBAC (Role-Based Access Control)
- **敏感数据**：不返回敏感字段（密码哈希等）

---

## 7. 性能优化

### 7.1 前端性能

- **代码分割**：按路由分割代码
- **懒加载**：非首屏组件懒加载
- **图片优化**：
  - WebP 格式
  - 响应式图片
  - 懒加载
- **缓存策略**：
  - Service Worker 缓存
  - HTTP 缓存头
- **虚拟列表**：长列表使用虚拟滚动

### 7.2 后端性能

- **数据库索引**：高频查询字段添加索引
- **查询优化**：避免 N+1 问题，使用 Prisma include
- **缓存层**：Redis 缓存热门数据（可选）
- **分页**：所有列表接口强制分页

---

## 8. 监控与日志

### 8.1 前端监控

- **错误追踪**：Sentry
- **性能监控**：Web Vitals
- **用户行为**：埋点分析（可选）

### 8.2 后端监控

- **日志系统**：Winston / Pino
- **错误监控**：Sentry
- **性能监控**：Prometheus + Grafana（可选）
- **健康检查**：/health 接口

---

## 9. 开发工作流

### 9.1 Git Flow

```
main (生产分支)
  ↑
develop (开发分支)
  ↑
feature/* (功能分支)
  ↑
fix/* (修复分支)
```

### 9.2 CI/CD

**GitHub Actions**：
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run lint
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
```

### 9.3 代码规范

- **ESLint**：代码质量
- **Prettier**：代码格式化
- **Husky**：Git hooks
- **Lint-staged**：暂存区代码检查

---

## 10. 扩展性设计

### 10.1 功能扩展

- **插件系统**：预留插件接口
- **主题系统**：支持自定义主题
- **国际化**：i18next 支持多语言

### 10.2 技术扩展

- **微前端**：未来可拆分
- **移动端**：React Native 复用逻辑
- **桌面端**：Electron 打包

### 10.3 数据扩展

- **数据导出**：支持 JSON/CSV/Excel
- **数据导入**：支持常见格式
- **API 开放**：未来开放第三方 API

---

**文档版本**: v1.0
**最后更新**: 2026-05-28
**文档作者**: AI Assistant
