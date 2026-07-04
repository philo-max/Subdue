# 任务计划：Subdue 软著申报准备与代码库完善

## 目标
清理 Mobile 端模板残留，补全 CSV 导入、服务匹配库等核心功能，将有效代码行数充实至 6,000+ 行，并重写 README，使项目达到软著申报的最佳状态。

## 当前阶段
已完成

## 各阶段

### 阶段 1：需求与发现
- [x] 理解用户关于软著申报和代码库完善的意图
- [x] 盘点 Web、Mobile、Python 后端现有代码及 PRD 需求
- [x] 将发现记录到 `findings.md`
- **状态：** complete

### 阶段 2：Mobile 端清理与业务组件重构
- [x] 删除 Expo 默认模板无用组件（如 `EditScreenInfo.tsx` 等）
- [x] 提取 Mobile 端的可重用业务组件至 `mobile/components`（如 `GlassCard.tsx`、`SubscriptionRow.tsx`、`StatCard.tsx`）
- [x] 重构 `app/(tabs)/index.tsx` 和 `app/(tabs)/two.tsx` 引入提取的业务组件
- [x] 将 `app/modal.tsx` 改造成精美的“关于 Subdue”与“隐私声明”页面
- **状态：** complete

### 阶段 3：功能补全（CSV 导入与标签分类）
- [x] 在 Web 端和 Mobile 端实现 CSV 账单导入解析引擎（识别周期性扣款、智能打分、自动转换）
- [x] 实现本地服务数据库（ServiceCatalog）与分类标签自动补全逻辑
- **状态：** complete

### 阶段 4：代码量充实与内置数据库扩充
- [x] 编写丰富的内置订阅服务数据库（包含流媒体、软件、AI 工具等细分领域的 Logo、典型周期及定价数据，约增加 1000~2000 行有效数据与解析代码）
- [x] 丰富 Python 后端订阅情报分析引擎 `scripts/subdue_intelligence.py`（已完成基础功能，并配合新版 ServiceCatalog）
- [x] 新增测试数据生成脚本和代码行统计脚本
- **状态：** complete

### 阶段 5：README 重写与文档规范化
- [x] 移除 Vite 默认模板 README，重写为专业的 Subdue 项目说明文档（包含架构设计、功能图景、本地部署与软著申报说明）
- [x] 编写操作手册大纲和软著代码排版指南
- **状态：** complete

### 阶段 6：测试验证与材料输出
- [x] 进行 Web 端和 Mobile 端的整机功能与集成测试，确保无错运行
- [x] 统计并核验有效代码行数（目标 6,000+ 行）
- [x] 为 Android 移动端配置 GitHub Actions 自动构建和发布 APK 流程
- [x] 更新 `progress.md` 记录测试结果，完成交付
- **状态：** complete

## 关键问题
1. CSV 账单导入的具体格式规范（如微信、支付宝、网银导出的账单字段映射）是什么？
2. 软著申请的代码材料需要剔除哪些第三方库（通常只统计 src/app 目录下的自主编写代码，需要做 LOC 脚本精确过滤）？

## 已做决策
| 决策 | 理由 |
|------|------|
| 在工作区根目录下创建计划文件 | 遵循用户要求，不将计划文件放到 C 盘 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| 无 | 0 | - |

## 备注
- 随着进度更新阶段状态：pending → in_progress → complete
- 做重大决策前重新读取此计划（注意力操纵）
- 记录所有错误，避免重复
