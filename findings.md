# 发现与决策 - Subdue 项目

## 需求
1. **清理 Mobile 端模版残留**：移除或重写 `EditScreenInfo.tsx` 等 Expo 模版组件，将实际业务代码的组件提取为可复用组件。
2. **重写 README**：以专业的 Subdue 介绍替换当前的 Vite 模版 README。
3. **功能补全**：实现 CSV 账单导入（P1 功能，自动提取周期性订阅）、标签分类，以及基于内置数据库的自动补全功能。
4. **充实代码量**：编写代码行统计脚本，将有效代码行数稳定推高至 6,000+ 行（以便于软著申请和代码质量提升）。
5. **软著准备**：代码材料与操作手册的准备。

## 研究发现

### 1. 代码库现状
- **Web 端 (`src/`)**：基于 Vite + React，数据库采用 IndexedDB (使用 Dexie 封装于 [storage.js](file:///F:/Subdue/src/db/storage.js))。
  - 主要组件包括：`App.jsx`、`Dashboard.jsx`、`Settings.jsx`、`SubscriptionTable.jsx`、`AddSubscriptionSidebar.jsx`。
  - 主要服务：`billingCalculator.js`、`billingParser.js`、`currency.js`、`notification.js`、`syncService.js`。
- **Mobile 端 (`mobile/`)**：基于 Expo + TypeScript + React Native。
  - 页面结构采用 Expo Router 文件路由系统。
  - `mobile/app/(tabs)/index.tsx`：实现了本地订阅看板（CRUD 订阅，带 Modal 添加表单），但内部包含了许多局部的 UI 逻辑，可以提炼为组件。
  - `mobile/app/(tabs)/two.tsx`：实现了局域网配对同步和模拟截图 OCR 录入功能，以及本地数据清除设置。
  - `mobile/components/` 目录下全为 Expo 自动生成的 Boilerplate 组件（如 `EditScreenInfo.tsx`、`StyledText.tsx`、`Themed.tsx` 等）。
- **Python 后端 (`scripts/subdue_intelligence.py`)**：用于抓取订阅服务定价和优惠信息的 RSS 爬虫，能独立生成 JSON 输出。

### 2. Expo 模版残留组件列表及处理意见
- `EditScreenInfo.tsx`：完全无用，可直接删除。
- `StyledText.tsx`：仅包含 `MonoText` 字体设置，可移入公共组件或在其他地方处理后删除。
- `Themed.tsx`：用于处理 Light/Dark 模式下的 View 和 Text，可以保留并优化为 Subdue 的主题组件。
- `useColorScheme.ts` / `useColorScheme.web.ts`：React Native 颜色方案钩子，可根据情况优化。

## 技术决策
| 决策 | 理由 |
|------|------|
| 在 `mobile/components` 目录下新建 `SubdueCard.tsx`、`SubscriptionRow.tsx`、`StatCard.tsx` | 提炼 UI 组件，规范移动端代码结构并清理 Expo 默认模板组件 |
| 增加 `scripts/loc_stats.py` 脚本 | 自动统计不含空行和注释的有效代码行数，监控软著申报指标（4000~6000行） |
| 开发专门的本地 CSV 解析服务 `csvImportService.js` (Web) 和 `csvImportHelper.ts` (Mobile) | 实现通用的 CSV 账单导入，识别其中的“周期性扣款”并作为订阅候选项推荐 |
| 扩充内置的服务匹配数据库 (`src/services/serviceCatalog.js` 和 `mobile/services/serviceCatalog.ts`) | 提供丰富的默认模板，大幅提升用户体验的同时，以真实数据提升代码行数 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
| 无 | - |

## 资源
- [订阅刺客追踪器-产品需求文档.md](file:///F:/Subdue/files/%E8%AE%A2%E9%98%85%E5%88%BA%E5%AE%A2%E8%BF%BD%E8%B8%AA%E5%99%A8-%E4%BA%A7%E5%93%81%E9%9C%80%E6%B1%82%E6%96%87%E6%A1%A3.md)
- [subdue_intelligence.py](file:///F:/Subdue/scripts/subdue_intelligence.py)

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*
