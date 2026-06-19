import { useState } from "react";

const COLORS = {
  bg: "#07090F",
  surface: "#0D1018",
  card: "#111520",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  gold: "#F5A623",
  goldDim: "rgba(245,166,35,0.12)",
  goldBorder: "rgba(245,166,35,0.25)",
  red: "#FF4757",
  redDim: "rgba(255,71,87,0.1)",
  green: "#2ED573",
  greenDim: "rgba(46,213,115,0.1)",
  blue: "#5B8DEF",
  blueDim: "rgba(91,141,239,0.1)",
  purple: "#A78BFA",
  purpleDim: "rgba(167,139,250,0.1)",
  text: "#E2E6EF",
  muted: "#6B7280",
  faint: "#374151",
};

const tabs = ["订阅如何被发现", "开源 vs 商业版拆分", "跨平台技术选型", "MVP 开发路线"];

const detectionMethods = [
  {
    icon: "✍️",
    title: "手动录入 + AI 自动补全",
    badge: "开源版核心",
    badgeColor: COLORS.green,
    privacy: "★★★★★",
    accuracy: "取决于用户",
    effort: "用户负担中",
    color: COLORS.green,
    desc: "用户输入「Netflix」，AI 自动补全 Logo、常见价格、账单周期、分类。本地运行，零隐私泄露。",
    how: [
      "内置主流订阅服务数据库（~2000条）",
      "模糊搜索 + 自动填充",
      "AI 识别自定义服务名称",
      "支持批量导入",
    ],
    risk: "需要用户主动维护，容易漏掉",
  },
  {
    icon: "📄",
    title: "银行账单 CSV 本地解析",
    badge: "开源版 · 高准确率",
    badgeColor: COLORS.green,
    privacy: "★★★★★",
    accuracy: "90%+",
    effort: "用户手动导出一次",
    color: COLORS.blue,
    desc: "用户从银行 App 导出账单 CSV，本地 AI 识别重复扣款模式，自动归类为订阅。全程离线。",
    how: [
      "解析 招行/工行/Wise/Revolut 等格式",
      "识别周期性相同金额 + 相同商户",
      "置信度评分，低分需用户确认",
      "不上传任何数据",
    ],
    risk: "用户需要手动重新导入（每月/季度）",
  },
  {
    icon: "📧",
    title: "邮件收据自动扫描",
    badge: "商业版 · 杀手级功能",
    badgeColor: COLORS.gold,
    privacy: "★★★☆☆",
    accuracy: "75–88%",
    effort: "一次 OAuth 授权",
    color: COLORS.gold,
    desc: "授权读取 Gmail/Outlook，本地解析收据邮件，提取金额、商户、日期。核心逻辑开源，API 密钥闭源。",
    how: [
      "Gmail / Outlook OAuth2 授权",
      "仅搜索 subject: receipt/invoice/订阅",
      "正则 + LLM 提取结构化数据",
      "邮件正文不上传到服务器",
    ],
    risk: "需要邮件权限，部分用户不接受",
  },
  {
    icon: "🏦",
    title: "Open Banking API 直连",
    badge: "商业版 · 欧美市场",
    badgeColor: COLORS.gold,
    privacy: "★★★☆☆",
    accuracy: "95%+",
    effort: "一次银行授权",
    color: COLORS.purple,
    desc: "通过 Plaid (美国) / Tink (欧洲) / TrueLayer (英国) 直连银行账户，自动检测周期性扣款。",
    how: [
      "Plaid API → 交易历史",
      "周期性交易识别算法",
      "自动刷新，实时提醒",
      "符合 PSD2 / Open Banking 法规",
    ],
    risk: "监管合规成本高；中国市场不可用",
  },
  {
    icon: "📱",
    title: "支付宝 / 微信支付记录",
    badge: "商业版 · 中国市场",
    badgeColor: COLORS.gold,
    privacy: "★★★☆☆",
    accuracy: "90%+",
    effort: "授权或截图 OCR",
    color: COLORS.red,
    desc: "解析支付宝/微信支付的账单页面，或用户上传截图 OCR，识别周期性扣款（爱奇艺、B站、腾讯等）。",
    how: [
      "支付宝开放平台账单 API",
      "微信支付账单截图 OCR 解析",
      "国内主流订阅平台内置识别",
      "本地识别，不存储支付凭证",
    ],
    risk: "API 接入门槛高；合规要求严格",
  },
];

const openCoreItems = {
  open: {
    label: "开源版",
    license: "MIT License",
    color: COLORS.green,
    icon: "🔓",
    tagline: "自部署 · 零广告 · 社区驱动",
    features: [
      { icon: "✍️", text: "手动录入 + 服务数据库" },
      { icon: "📄", text: "CSV 账单导入解析器" },
      { icon: "🔔", text: "到期提醒 / 涨价提醒" },
      { icon: "📊", text: "本地仪表盘与报告" },
      { icon: "🔒", text: "端对端本地加密存储" },
      { icon: "📤", text: "数据导入导出（JSON/CSV）" },
      { icon: "🌐", text: "Web + PC + Mobile UI" },
      { icon: "🧩", text: "全部 UI 组件" },
      { icon: "🧮", text: "订阅计算引擎" },
      { icon: "🚫", text: "零遥测 / 零追踪" },
    ],
    note: "任何人可以 fork、自部署、贡献代码",
  },
  closed: {
    label: "商业版",
    license: "Proprietary + OpenCore",
    color: COLORS.gold,
    icon: "⭐",
    tagline: "Pro · 自动化 · 云端同步",
    features: [
      { icon: "📧", text: "Gmail / Outlook 邮件扫描" },
      { icon: "🏦", text: "Plaid / Tink 银行直连" },
      { icon: "📱", text: "支付宝 / 微信账单解析" },
      { icon: "☁️", text: "多设备云端同步" },
      { icon: "🤖", text: "AI 智能分类与异常检测" },
      { icon: "👨‍👩‍👧", text: "家庭 / 团队共享模式" },
      { icon: "📈", text: "高级分析与预测" },
      { icon: "🔄", text: "自动定期刷新数据" },
      { icon: "💬", text: "优先客户支持" },
      { icon: "🔌", text: "第三方集成 Webhook" },
    ],
    note: "基于开源核心，付费解锁自动化能力",
  },
};

const techStack = [
  {
    layer: "前端 / 跨平台",
    color: COLORS.blue,
    options: [
      {
        name: "React Native + Expo",
        recommended: true,
        pros: ["一套代码 → iOS / Android / Web / PC", "Expo Router 文件路由", "社区最大，招人容易", "开源友好"],
        cons: ["复杂动画性能略差于 Flutter"],
        use: "推荐：开源版 + 商业版统一使用",
      },
      {
        name: "Flutter",
        recommended: false,
        pros: ["原生级性能", "桌面支持更好"],
        cons: ["Dart 生态较小", "开源社区不如 RN 活跃"],
        use: "备选：如需强调桌面体验",
      },
    ],
  },
  {
    layer: "数据库 / 本地存储",
    color: COLORS.green,
    options: [
      {
        name: "SQLite + Drizzle ORM",
        recommended: true,
        pros: ["本地优先，无需服务器", "加密扩展 SQLCipher", "跨平台支持好"],
        cons: ["多设备同步需额外处理"],
        use: "开源版的核心存储",
      },
      {
        name: "Supabase（商业版）",
        recommended: false,
        pros: ["开源的 Firebase 替代", "实时同步", "内置 Auth"],
        cons: ["需要运营服务器"],
        use: "商业版云端同步后端",
      },
    ],
  },
  {
    layer: "桌面端包装",
    color: COLORS.purple,
    options: [
      {
        name: "Tauri 2.0",
        recommended: true,
        pros: ["Rust 后端，包体极小（<5MB）", "比 Electron 轻 10 倍", "系统通知权限完善"],
        cons: ["需要了解一点 Rust"],
        use: "PC 端（Windows / macOS / Linux）",
      },
      {
        name: "Electron",
        recommended: false,
        pros: ["成熟稳定，门槛低"],
        cons: ["包体超大（150MB+）", "内存占用高"],
        use: "备选，若团队无 Rust 能力",
      },
    ],
  },
  {
    layer: "AI 能力",
    color: COLORS.gold,
    options: [
      {
        name: "本地模型 (llama.cpp / Phi-3)",
        recommended: true,
        pros: ["无隐私问题", "离线可用", "开源友好"],
        cons: ["首次下载模型较慢"],
        use: "开源版：邮件/账单解析",
      },
      {
        name: "Claude / GPT API",
        recommended: false,
        pros: ["精度更高", "复杂推理"],
        cons: ["需要 API Key，产生费用"],
        use: "商业版：高精度识别",
      },
    ],
  },
];

const roadmap = [
  {
    phase: "Phase 1",
    title: "MVP · 立刻可用",
    duration: "6–8 周",
    color: COLORS.green,
    deliverable: "开源版 v0.1 上 GitHub",
    tasks: [
      "手动录入订阅（服务数据库 + 搜索）",
      "仪表盘：月支出 / 年预测",
      "到期提醒推送",
      "本地 SQLite 加密存储",
      "基础 CSV 导出",
      "Web 版上线",
    ],
  },
  {
    phase: "Phase 2",
    title: "自动化 · 降低摩擦",
    duration: "+8 周",
    color: COLORS.blue,
    deliverable: "App Store / Play Store 上架",
    tasks: [
      "CSV 账单智能解析（本地 AI）",
      "iOS + Android App 打包发布",
      "PC 端 Tauri 应用",
      "涨价检测提醒",
      "订阅分类与标签",
      "数据导入/迁移工具",
    ],
  },
  {
    phase: "Phase 3",
    title: "商业版 · 自动发现",
    duration: "+10 周",
    color: COLORS.gold,
    deliverable: "商业版 v1.0 + 付费订阅",
    tasks: [
      "Gmail / Outlook 邮件扫描",
      "Plaid 银行直连（欧美）",
      "支付宝/微信账单解析（中国）",
      "多设备云端同步",
      "家庭共享模式",
      "高级 AI 分析报告",
    ],
  },
  {
    phase: "Phase 4",
    title: "生态 · 增长飞轮",
    duration: "持续迭代",
    color: COLORS.purple,
    deliverable: "社区 + 收入规模化",
    tasks: [
      "插件 / Webhook 生态",
      "公开 API 供开发者使用",
      "企业版（团队订阅管理）",
      "更多银行 API 覆盖",
      "社区驱动服务数据库扩充",
      "年度「订阅账单」报告分享功能",
    ],
  },
];

export default function SubTrackerArch() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedMethod, setExpandedMethod] = useState(null);
  const [expandedStack, setExpandedStack] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "36px 40px 0", borderBottom: `1px solid ${COLORS.border}`, background: `linear-gradient(180deg, rgba(245,166,35,0.04) 0%, transparent 100%)` }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: COLORS.gold, letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
            💸 订阅刺客追踪器 · 技术架构
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.025em" }}>
            怎么实现它？
          </h1>
          <p style={{ color: COLORS.muted, margin: "0 0 28px", fontSize: 14 }}>
            无广告 · 开源核心 + 商业版分层 · PC + iOS + Android 全覆盖
          </p>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
            {tabs.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={{
                  padding: "11px 20px",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === i ? `2px solid ${COLORS.gold}` : "2px solid transparent",
                  color: activeTab === i ? COLORS.gold : COLORS.muted,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeTab === i ? 700 : 400,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                  letterSpacing: "0.01em",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 40px 48px" }}>

        {/* Tab 0: Detection Methods */}
        {activeTab === 0 && (
          <div>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
              订阅追踪最难的地方不是 UI，而是<strong style={{ color: COLORS.text }}>「如何自动发现订阅」</strong>。有 5 种技术路线，隐私风险和自动化程度各不相同：
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {detectionMethods.map((m, i) => (
                <div
                  key={i}
                  onClick={() => setExpandedMethod(expandedMethod === i ? null : i)}
                  style={{
                    background: expandedMethod === i ? `rgba(${m.color === COLORS.green ? "46,213,115" : m.color === COLORS.blue ? "91,141,239" : m.color === COLORS.gold ? "245,166,35" : m.color === COLORS.purple ? "167,139,250" : "255,71,87"},0.06)` : COLORS.card,
                    border: `1px solid ${expandedMethod === i ? m.color + "44" : COLORS.border}`,
                    borderRadius: 14,
                    padding: "20px 24px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 24 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.01em" }}>{m.title}</div>
                        <span style={{
                          display: "inline-block",
                          marginTop: 4,
                          fontSize: 10,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: m.badgeColor + "22",
                          color: m.badgeColor,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                          border: `1px solid ${m.badgeColor}44`,
                        }}>{m.badge}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 20, fontSize: 12, color: COLORS.muted }}>
                      <span>🔒 隐私 <strong style={{ color: COLORS.text }}>{m.privacy}</strong></span>
                      <span>🎯 准确率 <strong style={{ color: COLORS.text }}>{m.accuracy}</strong></span>
                      <span style={{ color: expandedMethod === i ? m.color : COLORS.faint, fontWeight: 600 }}>{expandedMethod === i ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {expandedMethod === i && (
                    <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>工作原理</div>
                        <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.7, margin: "0 0 12px" }}>{m.desc}</p>
                        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                          {m.how.map((h, j) => (
                            <li key={j} style={{ fontSize: 12, color: COLORS.muted, padding: "4px 0", display: "flex", gap: 8 }}>
                              <span style={{ color: m.color }}>›</span>{h}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>用户负担</div>
                        <div style={{
                          background: "rgba(0,0,0,0.3)",
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 8,
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "#CBD5E1",
                          marginBottom: 12,
                        }}>{m.effort}</div>
                        <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>⚠️ 注意事项</div>
                        <div style={{
                          background: COLORS.redDim,
                          border: `1px solid ${COLORS.red}33`,
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontSize: 12,
                          color: "#FCA5A5",
                        }}>{m.risk}</div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 20,
              padding: "16px 20px",
              background: COLORS.goldDim,
              border: `1px solid ${COLORS.goldBorder}`,
              borderRadius: 10,
              fontSize: 13,
              color: "#FDE68A",
              lineHeight: 1.7,
            }}>
              💡 <strong>策略建议：</strong>开源版用「手动录入 + CSV 解析」——零隐私风险，让社区信任你。商业版再加邮件扫描和银行 API，作为升级诱因。
            </div>
          </div>
        )}

        {/* Tab 1: Open Core Split */}
        {activeTab === 1 && (
          <div>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
              采用 <strong style={{ color: COLORS.text }}>「Open Core」模型</strong>——核心引擎开源，自动化能力商业化。参考 GitLab、Sentry 的成功路径：
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {Object.values(openCoreItems).map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${item.color}33`,
                    borderRadius: 16,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ background: item.color + "11", padding: "20px 24px", borderBottom: `1px solid ${item.color}22` }}>
                    <div style={{ fontSize: 11, color: item.color, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                      {item.icon} {item.label}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em", marginBottom: 4 }}>{item.tagline}</div>
                    <div style={{
                      display: "inline-block",
                      fontSize: 10,
                      padding: "3px 10px",
                      borderRadius: 4,
                      background: item.color + "22",
                      color: item.color,
                      border: `1px solid ${item.color}44`,
                      letterSpacing: "0.05em",
                      fontWeight: 700,
                    }}>{item.license}</div>
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    {item.features.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 10,
                          alignItems: "flex-start",
                          padding: "7px 0",
                          borderBottom: i < item.features.length - 1 ? `1px solid ${COLORS.border}` : "none",
                          fontSize: 13,
                          color: "#CBD5E1",
                        }}
                      >
                        <span>{f.icon}</span>
                        <span>{f.text}</span>
                      </div>
                    ))}
                    <div style={{
                      marginTop: 16,
                      padding: "10px 14px",
                      background: item.color + "11",
                      border: `1px solid ${item.color}22`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: COLORS.muted,
                      fontStyle: "italic",
                    }}>{item.note}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Business model */}
            <div style={{ marginTop: 20, background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "24px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: COLORS.text }}>💰 商业版定价策略（无广告原则下）</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { plan: "Free", price: "永久免费", color: COLORS.green, features: ["开源版全功能", "手动录入无限", "CSV 导入", "本地存储"] },
                  { plan: "Pro", price: "¥18 / 月\n或 ¥128 / 年", color: COLORS.gold, features: ["邮件自动扫描", "银行 API 直连", "云端多设备同步", "AI 智能分析"] },
                  { plan: "Family", price: "¥25 / 月", color: COLORS.purple, features: ["最多 5 人共享", "家庭账单汇总", "分账建议", "Pro 所有功能"] },
                ].map((p) => (
                  <div
                    key={p.plan}
                    style={{
                      background: p.color + "0A",
                      border: `1px solid ${p.color}33`,
                      borderRadius: 10,
                      padding: "16px",
                    }}
                  >
                    <div style={{ fontSize: 11, color: p.color, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>{p.plan}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: COLORS.text, whiteSpace: "pre-line", lineHeight: 1.5 }}>{p.price}</div>
                    {p.features.map((f) => (
                      <div key={f} style={{ fontSize: 12, color: COLORS.muted, padding: "3px 0", display: "flex", gap: 6 }}>
                        <span style={{ color: p.color }}>✓</span>{f}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, fontSize: 12, color: COLORS.muted, lineHeight: 1.7 }}>
                🎯 不含广告。开源版用户是最好的口碑来源，会主动向朋友推荐 → 降低获客成本 → 形成增长飞轮。
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tech Stack */}
        {activeTab === 2 && (
          <div>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
              目标：<strong style={{ color: COLORS.text }}>一套代码库</strong>，覆盖 Web / iOS / Android / PC (Windows+macOS+Linux)，开源版和商业版共享同一前端。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {techStack.map((layer, li) => (
                <div
                  key={li}
                  style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden" }}
                >
                  <div
                    style={{
                      padding: "14px 24px",
                      background: layer.color + "0D",
                      borderBottom: `1px solid ${layer.color}22`,
                      fontSize: 12,
                      fontWeight: 700,
                      color: layer.color,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    {layer.layer}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                    {layer.options.map((opt, oi) => (
                      <div
                        key={oi}
                        style={{
                          padding: "20px 24px",
                          borderRight: oi === 0 ? `1px solid ${COLORS.border}` : "none",
                          position: "relative",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{opt.name}</span>
                          {opt.recommended && (
                            <span style={{
                              fontSize: 9,
                              padding: "2px 7px",
                              borderRadius: 3,
                              background: layer.color + "22",
                              color: layer.color,
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              border: `1px solid ${layer.color}44`,
                            }}>推荐</span>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 10, color: COLORS.green, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>✓ 优势</div>
                            {opt.pros.map((p) => (
                              <div key={p} style={{ fontSize: 12, color: COLORS.muted, padding: "2px 0" }}>· {p}</div>
                            ))}
                          </div>
                          <div>
                            <div style={{ fontSize: 10, color: COLORS.red, letterSpacing: "0.1em", marginBottom: 4, textTransform: "uppercase" }}>✗ 劣势</div>
                            {opt.cons.map((c) => (
                              <div key={c} style={{ fontSize: 12, color: COLORS.muted, padding: "2px 0" }}>· {c}</div>
                            ))}
                          </div>
                          <div style={{
                            padding: "6px 10px",
                            background: layer.color + "11",
                            border: `1px solid ${layer.color}22`,
                            borderRadius: 6,
                            fontSize: 11,
                            color: layer.color,
                          }}>{opt.use}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: "20px 24px", background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginBottom: 14 }}>📦 最终推荐技术栈</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {[
                  { label: "React Native + Expo", color: COLORS.blue },
                  { label: "SQLite + SQLCipher", color: COLORS.green },
                  { label: "Drizzle ORM", color: COLORS.green },
                  { label: "Tauri 2.0 (PC)", color: COLORS.purple },
                  { label: "Supabase (商业版云端)", color: COLORS.gold },
                  { label: "Bun / Node.js 后端", color: COLORS.blue },
                  { label: "llama.cpp (本地 AI)", color: COLORS.red },
                  { label: "GitHub Actions CI/CD", color: COLORS.muted },
                ].map((t) => (
                  <span
                    key={t.label}
                    style={{
                      background: t.color + "18",
                      border: `1px solid ${t.color}40`,
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontSize: 12,
                      color: COLORS.text,
                    }}
                  >{t.label}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Roadmap */}
        {activeTab === 3 && (
          <div>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>
              先用最小可行产品获取早期用户的真实反馈，再逐步加入自动化能力。越早上线，越早积累口碑。
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {roadmap.map((phase, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr",
                    gap: 0,
                    background: COLORS.card,
                    border: `1px solid ${phase.color}2A`,
                    borderRadius: 14,
                    overflow: "hidden",
                  }}
                >
                  <div style={{
                    background: phase.color + "0F",
                    borderRight: `1px solid ${phase.color}22`,
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 6,
                  }}>
                    <div style={{ fontSize: 10, color: phase.color, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>{phase.phase}</div>
                    <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, color: COLORS.text }}>{phase.title}</div>
                    <div style={{ fontSize: 11, color: COLORS.muted }}>{phase.duration}</div>
                  </div>
                  <div style={{ padding: "20px 24px" }}>
                    <div style={{
                      display: "inline-block",
                      fontSize: 10,
                      padding: "3px 10px",
                      borderRadius: 4,
                      background: phase.color + "18",
                      color: phase.color,
                      border: `1px solid ${phase.color}33`,
                      marginBottom: 14,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                    }}>🎯 {phase.deliverable}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 20px" }}>
                      {phase.tasks.map((t, j) => (
                        <div key={j} style={{ fontSize: 12, color: COLORS.muted, display: "flex", gap: 8, alignItems: "flex-start", padding: "3px 0" }}>
                          <span style={{ color: phase.color, flexShrink: 0, marginTop: 1 }}>▸</span>
                          <span>{t}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24,
              padding: "20px 24px",
              background: COLORS.goldDim,
              border: `1px solid ${COLORS.goldBorder}`,
              borderRadius: 12,
            }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>🚀 下一步：我们现在可以做什么？</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {[
                  { icon: "🎨", title: "UI 原型", desc: "先做主仪表盘 + 添加订阅流程的高保真设计" },
                  { icon: "📁", title: "项目架构", desc: "搭建 React Native + Expo + Drizzle 的完整开发框架" },
                  { icon: "📝", title: "产品文档", desc: "写 MVP 功能规格，确定数据模型和 API 设计" },
                ].map((item) => (
                  <div key={item.title} style={{
                    background: "rgba(0,0,0,0.2)",
                    borderRadius: 8,
                    padding: "14px",
                    fontSize: 12,
                    color: "#FDE68A",
                  }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, marginBottom: 4, color: COLORS.text }}>{item.title}</div>
                    <div style={{ color: COLORS.muted, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
