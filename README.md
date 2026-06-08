# 食记簿 — 美食打卡与营养管理

## 项目简介

全栈饮食记录应用。日历打卡、美食图库、数据报表、AI 营养分析、抠图拍照、浏览器推送通知。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 · TypeScript · Vite · Recharts |
| 后端 | Express · Sharp · Web Push · DeepSeek API |
| 数据库 | Supabase (PostgreSQL) |
| 样式 | CSS Modules · 液态玻璃设计系统 · 浅深双主题 |

## 功能

- **日历打卡** — 月历视图，食物贴纸，悬停弹窗
- **美食图库** — 12 个月历史，分类筛选，名称搜索
- **食记报表** — 打卡趋势折线图、品类柱状图、饮食名称饼图、明细表格
- **AI 营养分析** — DeepSeek API 实时评分 + 本地算法兜底
- **拍照抠图** — Canvas 背景移除，白边描边贴纸效果
- **收藏美食** — 收藏列表，服务器端精确查询
- **推送通知** — Web Push 每日打卡提醒 + 每周报告推送
- **个人主页** — 用户信息、编辑资料、账户管理
- **系统设置** — 主题切换、通知开关、数据导出

## 快速开始

```bash
# 前端
npm install
npm run dev          # http://localhost:3000

# 后端
cd server
npm install
npm run dev          # http://localhost:4000
```

## 环境变量

`.env` 文件：

```
VITE_SUPABASE_URL=          # Supabase 项目 URL
VITE_SUPABASE_ANON_KEY=     # Supabase 匿名密钥
VITE_VAPID_PUBLIC_KEY=      # Web Push 公钥
VAPID_PRIVATE_KEY=          # Web Push 私钥
DEEPSEEK_API_KEY=           # DeepSeek API Key
```

## 项目结构

```
foodrecord/
├── src/
│   ├── components/
│   │   ├── common/          # Icons, GlassCard
│   │   └── layout/          # Layout, TopNav, Sidebar, RightPanel, Navigation
│   ├── contexts/            # Auth, Food, Theme, Notification
│   ├── pages/               # Home, Gallery, Favorites, Report, Profile, Settings, Camera, DateDetail, Account, Login, Register, Welcome
│   ├── services/            # Supabase 数据库操作
│   ├── utils/               # 食物图片映射, 图片压缩, 推送通知
│   └── types/               # TypeScript 类型
├── server/
│   └── src/
│       ├── routes/          # API 路由
│       ├── services/        # 营养分析, 图片处理, 推送, 定时任务
│       └── config/          # Supabase 客户端
├── public/
│   ├── foods/               # 食物图片库 (12张)
│   ├── sw.js                # Service Worker
│   └── admin.html           # 通知管理面板
└── dist/                    # 构建输出
```

## 构建部署

```bash
npm run build        # 输出到 dist/
```

`dist/` 可直接部署到 Vercel、Netlify、阿里云 OSS 等平台。

## Supabase 表结构

执行以下 SQL 创建通知表：

```sql
CREATE TABLE notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "允许读取" ON notifications FOR SELECT USING (true);
CREATE POLICY "允许插入" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "允许更新" ON notifications FOR UPDATE USING (true);
CREATE POLICY "允许删除" ON notifications FOR DELETE USING (true);
```

## 管理面板

后端启动后访问 `http://localhost:4000/admin` 发送推送通知。
