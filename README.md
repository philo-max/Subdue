# Subdue — 订阅刺客追踪器 💸

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Node Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg)
![Python Version](https://img.shields.io/badge/python-%3E%3D%203.9-blue.svg)

一个**无广告、隐私优先、本地优先**的订阅管理与到期涨价提醒工具。帮您看清“钱到底花在哪儿”，并在服务自动续费前主动通过系统通知发出预警。

---

## 🌟 核心特性

1. **隐私安全保障 (Privacy-First)**：默认所有数据存储在本地设备中（Web端使用 IndexedDB，移动端使用 AsyncStorage）。数据绝不上传云端。
2. **多端局域网同步 (LAN Sync)**：无需购买云服务。手机端与 PC 网页端之间直接通过局域网（LAN）建立本地双向加密安全通道，进行一键账单同步。
3. **智能 CSV 账单解析 (CSV Importer)**：支持导入微信、支付宝及银行导出的 CSV 账单。内置重复性交易识别算法，能从海量流水账单中智能挖掘周期性扣费（如月付/年付的订阅），引导一键归档。
4. **服务数据库与自动补全 (Service Catalog)**：内置 70+ 种主流全球及本土订阅服务（如 Netflix, Spotify, iCloud, ChatGPT, B站大会员等）的价格、计费周期和分类模板，输入即自动补全。
5. **本地通知预警 (Local Notification)**：智能计算下次扣款日期，并在扣款前 N 天（用户可自定义）在设备本地发起推送通知，防止遗忘取消免费试用而被强行续费。
6. **省钱情报引擎 (Python Intelligence)**：内置 Python 订阅价格爬虫与分析算法，支持本地分析最新涨价/降价变动，并提供拼车均摊、转区消费等极客专属“省钱秘籍”。

---

## 🛠️ 技术架构

### 技术栈
*   **Web 前端**：React 19 + Vite 8 + Dexie.js (IndexedDB 包装器) + Lucide React
*   **Mobile 移动端**：Expo 51 + React Native 0.74 + TypeScript + React Navigation (Expo Router) + Expo Symbols
*   **数据分析与工具**：Python 3.9+ + XML.etree (RSS 资讯分析) + Standard CSV Parser
*   **样式表现**：CSS 变量 (自适应暗色/亮色主题) + Tailwind-like Glassmorphic Design

### 项目目录结构
```text
Subdue/
├── src/                    # Web 端源代码 (React + Vite)
│   ├── components/         # 仪表盘、设置、订阅明细及新增侧边栏等 UI 组件
│   ├── db/                 # Dexie IndexedDB 数据库模型定义与 CRUD 实现 (storage.js)
│   ├── services/           # 计费计算器、汇率转换、本地通知及局域网同步服务
│   └── main.jsx / App.jsx  # 应用入口与主路由
├── mobile/                 # Mobile 移动端源代码 (Expo + React Native)
│   ├── app/                # 页面视图层 ((tabs)主看板与助手设置、modal关于页面)
│   ├── components/         # 抽离的磨砂卡片容器、单条订阅行、统计大卡片等业务组件
│   ├── services/           # 移动端通知注册、本地 AsyncStorage 存取与同步客户端
│   └── tsconfig.json       # TypeScript 编译器配置
├── scripts/                # 辅助开发工具与数据分析脚本
│   ├── subdue_intelligence.py # Python 订阅资讯爬虫与省钱秘籍推荐生成器
│   ├── generate_test_csv.py   # 生成用于模拟导入的支付宝/微信 CSV 账单数据
│   └── loc_stats.py           # 软件著作权申报专用代码行数统计脚本
└── files/                  # 软件软著申报、上架指南及 PRD 产品需求文档
```

---

## 🚀 快速开始

### 1. 运行 Web 客户端 (PC)
```bash
# 进入项目根目录，安装依赖
npm install

# 启动本地开发服务
npm run dev
```
打开浏览器访问控制台输出的 `http://localhost:5173`。

### 2. 运行 Mobile 客户端 (iOS/Android)
```bash
# 进入移动端目录
cd mobile

# 安装依赖
npm install

# 启动 Expo 开发服务器 (按 'a' 运行于 Android 模拟器，或 'i' 运行于 iOS 模拟器)
npx expo start
```

### 3. 运行 Python 情报爬虫与测试数据生成器
```bash
# 启动 RSS 订阅资讯智能匹配
python scripts/subdue_intelligence.py

# 在 files/ 目录中生成供测试导入的支付宝/微信 CSV 账单
python scripts/generate_test_csv.py

# 统计项目代码行数 (确认软著指标)
python scripts/loc_stats.py
```

---

## 📑 软件著作权（软著）申报参考

本软件完全符合中国软件著作权申报的材料标准，提供 60 页自主编写核心代码（前后各 30 页）的直接提取支持。

### 指标盘点
使用内置的 [loc_stats.py](file:///F:/Subdue/scripts/loc_stats.py) 脚本可直接输出有效行数报表：
*   **总物理代码行数**：~6,700 行
*   **有效代码行数（剔除空行/注释）**：**5,800+ 行**（远超软著规定的 4000+ 行门槛）
*   **可提供源代码材料页数**：约 116 页（充裕富余，可任意筛选最核心的 Web 业务 CRUD 逻辑和移动端组件代码）

### 申报代码材料推荐筛选路径
1.  **Web 数据库与逻辑层**：`src/db/storage.js`，`src/services/billingParser.js`。
2.  **Mobile 核心控制器**：`mobile/app/(tabs)/index.tsx`，`mobile/services/syncClient.ts`。
3.  **自主提取组件层**：`mobile/components/SubscriptionRow.tsx`，`mobile/components/StatCard.tsx`。
4.  **数据爬取与情报层**：`scripts/subdue_intelligence.py`。

---

## ⚖️ 开源协议

本项目采用 **MIT License** 许可协议。任何人都可以免费获取、修改并作为个人用途使用。
