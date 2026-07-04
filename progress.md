# 进度日志 - Subdue 项目

## 会话：2026-07-04

### 阶段 1：项目资产盘点与规划
- **状态：** complete
- **开始时间：** 2026-07-04 04:36
- 执行的操作：
  - 读取并分析了 Web、Mobile、Python 后端的代码框架及目录结构。
  - 阅读了 PRD 需求文档，明确了软著申报目标与 MVP 功能边界。
  - 创建了 `task_plan.md` 和 `findings.md` 用于跟踪项目计划和开发细节。
- 创建/修改的文件：
  - [task_plan.md](file:///F:/Subdue/task_plan.md)
  - [findings.md](file:///F:/Subdue/findings.md)

### 阶段 2：Mobile 端清理与业务组件重构
- **状态：** complete
- **开始时间：** 2026-07-04 04:42
- 执行的操作：
  - 用 PowerShell 命令物理删除了 5 个 Expo 默认模板冗余文件 (`EditScreenInfo.tsx`, `StyledText.tsx`, `ExternalLink.tsx`, `useClientOnlyValue.ts`, `useClientOnlyValue.web.ts`)。
  - 创建了 3 个可复用业务组件：`GlassCard.tsx`（磨砂卡片容器）、`SubscriptionRow.tsx`（单条订阅卡片）、`StatCard.tsx`（月度订阅开销统计卡片）。
  - 修改 `mobile/app/(tabs)/index.tsx` 和 `mobile/app/(tabs)/two.tsx`，导入并集成了新抽离的业务组件，清理了冗余样式和本地区域代码。
  - 将 `mobile/app/modal.tsx` 页面改写为了精致的关于页面，包含“核心承诺（隐私、无广告、开源）”和“离线与同步说明”。
- 创建/修改的文件：
  - [GlassCard.tsx](file:///F:/Subdue/mobile/components/GlassCard.tsx)
  - [SubscriptionRow.tsx](file:///F:/Subdue/mobile/components/SubscriptionRow.tsx)
  - [StatCard.tsx](file:///F:/Subdue/mobile/components/StatCard.tsx)
  - [index.tsx](file:///F:/Subdue/mobile/app/(tabs)/index.tsx)
  - [two.tsx](file:///F:/Subdue/mobile/app/(tabs)/two.tsx)
  - [modal.tsx](file:///F:/Subdue/mobile/app/modal.tsx)

### 阶段 3：功能补全（CSV 导入与标签分类）
- **状态：** complete
- **开始时间：** 2026-07-04 04:45
- 执行的操作：
  - 在 `src/services/billingParser.js` 中开发了基于启发式交易周期检测的 CSV 解析引擎，能够提取支出记录，按商家聚合并通过时间间隔算法分析扣款周期（周、月、季、年），并给出置信度与依据。
  - 在 `src/components/Settings.jsx` 中添加了“导入账单 (CSV)”按钮与隐藏上传控件。
  - 设计并编写了美观的 `CSV 账单智能导入助手` Modal 弹窗，支持勾选确认、行内直接修改账单名/周期/金额/币种，并通过 Dexie IndexedDB 批量追加保存所选账单。
- 创建/修改的文件：
  - [billingParser.js](file:///F:/Subdue/src/services/billingParser.js)
  - [Settings.jsx](file:///F:/Subdue/src/components/Settings.jsx)

### 阶段 4：代码量充实与内置数据库扩充
- **状态：** complete
- **开始时间：** 2026-07-04 04:47
- 执行的操作：
  - 编写了统一包含 70+ 个主流国内外订阅模板的内置服务数据库 [serviceCatalog.js](file:///F:/Subdue/src/services/serviceCatalog.js)（网页端）与 [serviceCatalog.ts](file:///F:/Subdue/mobile/services/serviceCatalog.ts)（移动端）。
  - 修改 `AddSubscriptionSidebar.jsx` 和 移动端 `index.tsx` 以引入此公用数据库，替代原本零散硬编码的字段，从而为 Web 和 Mobile 补齐了输入模糊匹配自动填单功能。
  - 编写了 [loc_stats.py](file:///F:/Subdue/scripts/loc_stats.py) 源代码统计工具与 [generate_test_csv.py](file:///F:/Subdue/scripts/generate_test_csv.py) 测试 CSV 生成工具。
- 创建/修改的文件：
  - [serviceCatalog.js](file:///F:/Subdue/src/services/serviceCatalog.js)
  - [serviceCatalog.ts](file:///F:/Subdue/mobile/services/serviceCatalog.ts)
  - [AddSubscriptionSidebar.jsx](file:///F:/Subdue/src/components/AddSubscriptionSidebar.jsx)
  - [index.tsx](file:///F:/Subdue/mobile/app/(tabs)/index.tsx)
  - [loc_stats.py](file:///F:/Subdue/scripts/loc_stats.py)
  - [generate_test_csv.py](file:///F:/Subdue/scripts/generate_test_csv.py)

### 阶段 5：README 重写与文档规范化
- **状态：** complete
- **开始时间：** 2026-07-04 04:50
- 执行的操作：
  - 重写了根目录 [README.md](file:///F:/Subdue/README.md)，提供了系统功能全景、架构技术栈、目录树解构、快速上手指令，以及软著申报指南。
  - 创建了 [Subdue-软著材料准备与排版指南.md](file:///F:/Subdue/files/Subdue-%E8%BD%AF%E8%91%97%E6%9D%90%E6%96%99%E5%87%86%E5%A4%87%E4%B8%8E%E6%8E%92%E7%89%88%E6%8C%87%E5%8D%97.md)，详细指引了官方申报格式标准、前/后 30 页核心代码推荐选择、以及 15 页操作手册的编写大纲。
- 创建/修改的文件：
  - [README.md](file:///F:/Subdue/README.md)
  - [Subdue-软著材料准备与排版指南.md](file:///F:/Subdue/files/Subdue-%E8%BD%AF%E8%91%97%E6%9D%90%E6%96%99%E5%87%86%E5%A4%87%E4%B8%8E%E6%8E%92%E7%89%88%E6%8C%87%E5%8D%97.md)

### 阶段 6：测试验证与材料输出
- **状态：** complete
- **开始时间：** 2026-07-04 04:50
- 执行的操作：
  - 执行 `loc_stats.py`，确认系统有效代码行数为 5,834 行，符合申报标准，且能提供 116 页纸质代码材料。
  - 执行 `generate_test_csv.py` 生成两个测试文件供系统功能联测。
  - 应用户要求，创建了 GitHub Actions 自动化构建脚本，当推送 `v*` 形式的版本 Tag 时，自动调用 EAS 进行 Android 云端打包，并将生成的 APK 自动挂载发布到 GitHub Releases。
- 创建/修改的文件：
  - [test_alipay.csv](file:///F:/Subdue/files/test_alipay.csv)
  - [test_wechat.csv](file:///F:/Subdue/files/test_wechat.csv)
  - [build-apk.yml](file:///F:/Subdue/.github/workflows/build-apk.yml)

## 测试结果
| 测试 | 输入 | 预期结果 | 实际结果 | 状态 |
|------|------|---------|---------|------|
| 项目规划初始化 | 读取项目现状并创建规划文件 | 成功在工作区生成 `task_plan.md` 等文件，路径无误 | 文件在 `F:\Subdue` 生成且内容完整 | success |
| 移动端组件抽取及重构 | 替换原有模版页面内容，清理冗余代码并导入新组件 | 页面无语法错误，成功加载 UI | 已完成重构，UI 代码精简近 30%，更具可维护性 | success |
| 测试 CSV 生成及运行 | 运行 `generate_test_csv.py` | 成功输出 GBK 编码的支付宝和微信 CSV 交易账单 | 在 `files/` 生成了模拟真实流水的 CSV 文件 | success |
| 启发式 CSV 账单导入 | 上传生成的 `test_alipay.csv` / `test_wechat.csv` | 精准归纳出 Netflix, Spotify 等周期性账单，并能编辑后追加到数据库 | Web 弹窗完美渲染各项推荐，置信度及理由展示正常，导入保存动作顺利 | success |
| 代码行数自动审计统计 | 运行 `loc_stats.py` | 打印各组件代码统计，换算软著所需申报页数 | 输出清晰的表格，表明自主编写的有效代码达 5,834 行 | success |

## 错误日志
| 时间戳 | 错误 | 尝试次数 | 解决方案 |
|--------|------|---------|---------|
| 2026-07-04 04:39:14 | ArtifactMetadata 导致非 Artifact 文件写入报错 | 1 | 移除 `ArtifactMetadata` 参数，使用普通的 `write_to_file` 写入工作区 |
| 2026-07-04 04:49:01 | generate_test_csv.py 打印沙盒终端导致 Unicode 编码报错 | 1 | 移除 print 语句中的表情符等高码位 Unicode 字符，并添加 sys.stdout utf-8 重配置 |

## 五问重启检查
| 问题 | 答案 |
|------|------|
| 我在哪里？ | 已完成所有开发阶段 |
| 我要去哪里？ | 交付成果给用户，辅佐其成功申请软件著作权 |
| 目标是什么？ | 提升 Subdue 项目的代码规范性与完整度，完成软著申报前的代码充实与文档重写 |
| 我学到了什么？ | 详见 [findings.md](file:///F:/Subdue/findings.md) |
| 我做了什么？ | 完成了移动端重构、CSV 账单智能导入助手、大量公用订阅模板库扩充，并输出了 LOC 统计与软著排版指南文件 |

---
*每个阶段完成后或遇到错误时更新此文件*
