import { useState, useMemo } from "react";
import { Plus, Search, X, ChevronRight, AlertTriangle, Calendar } from "lucide-react";

/* ---------- design tokens ---------- */
const INK = "#11151C";
const SURFACE = "#181D26";
const SURFACE_2 = "#1E2430";
const BORDER = "rgba(242,237,228,0.07)";
const BORDER_HOVER = "rgba(242,237,228,0.14)";
const PAPER = "#F2EDE4";
const MUTED = "#8B93A1";
const FAINT = "#54596A";
const COPPER = "#D9852B";
const COPPER_DIM = "rgba(217,133,43,0.13)";
const RUST = "#C75450";
const RUST_DIM = "rgba(199,84,80,0.13)";
const SAGE = "#6FA287";

const CATEGORY_STYLE = {
  流媒体: "#D9852B",
  AI工具: "#7C93B3",
  生产力: "#6FA287",
  设计工具: "#9C84B0",
  云存储: "#5FA9A0",
  健身: "#BD7B7E",
  购物会员: "#B9A36B",
};

const CYCLE_SUFFIX = { 月: "/月", 年: "/年", 季: "/季", 周: "/周" };

function monthlyEq(amount, cycle) {
  if (cycle === "年") return amount / 12;
  if (cycle === "季") return amount / 3;
  if (cycle === "周") return amount * 4.33;
  return amount;
}

/* ---------- mock data ---------- */
const initialSubs = [
  { id: 1, name: "Netflix", amount: 35, cycle: "月", category: "流媒体", daysLeft: 3, status: "active" },
  { id: 2, name: "iCloud+ 200GB", amount: 21, cycle: "月", category: "云存储", daysLeft: 5, status: "active" },
  { id: 3, name: "爱奇艺 VIP", amount: 25, cycle: "月", category: "流媒体", daysLeft: 7, status: "active" },
  { id: 4, name: "ChatGPT Plus", amount: 145, cycle: "月", category: "AI工具", daysLeft: 9, status: "active", priceIncrease: { from: 128, to: 145 } },
  { id: 5, name: "Spotify", amount: 15, cycle: "月", category: "流媒体", daysLeft: 12, status: "active" },
  { id: 6, name: "网易云音乐 黑胶", amount: 18, cycle: "月", category: "流媒体", daysLeft: 14, status: "active" },
  { id: 7, name: "GitHub Copilot", amount: 76, cycle: "月", category: "AI工具", daysLeft: 16, status: "active" },
  { id: 8, name: "Notion Plus", amount: 64, cycle: "月", category: "生产力", daysLeft: 18, status: "active" },
  { id: 9, name: "B站大会员", amount: 15, cycle: "月", category: "流媒体", daysLeft: 21, status: "active" },
  { id: 10, name: "Adobe Creative Cloud", amount: 198, cycle: "月", category: "设计工具", daysLeft: 25, status: "active" },
  { id: 11, name: "京东 PLUS", amount: 118, cycle: "年", category: "购物会员", daysLeft: 27, status: "cancelled" },
  { id: 12, name: "Keep 会员", amount: 98, cycle: "年", category: "健身", daysLeft: 30, status: "active" },
];

const catalog = [
  { name: "Netflix", amount: 35, cycle: "月", category: "流媒体" },
  { name: "Spotify", amount: 15, cycle: "月", category: "流媒体" },
  { name: "Disney+", amount: 28, cycle: "月", category: "流媒体" },
  { name: "YouTube Premium", amount: 18, cycle: "月", category: "流媒体" },
  { name: "腾讯视频 VIP", amount: 19, cycle: "月", category: "流媒体" },
  { name: "iCloud+ 200GB", amount: 21, cycle: "月", category: "云存储" },
  { name: "Dropbox Plus", amount: 79, cycle: "年", category: "云存储" },
  { name: "ChatGPT Plus", amount: 145, cycle: "月", category: "AI工具" },
  { name: "GitHub Copilot", amount: 76, cycle: "月", category: "AI工具" },
  { name: "Notion AI", amount: 56, cycle: "月", category: "生产力" },
  { name: "Notion Plus", amount: 64, cycle: "月", category: "生产力" },
  { name: "Microsoft 365", amount: 298, cycle: "年", category: "生产力" },
  { name: "Adobe Creative Cloud", amount: 198, cycle: "月", category: "设计工具" },
  { name: "1Password", amount: 25, cycle: "月", category: "生产力" },
  { name: "Keep 会员", amount: 98, cycle: "年", category: "健身" },
  { name: "喜马拉雅 VIP", amount: 198, cycle: "年", category: "流媒体" },
];

/* ---------- small UI pieces ---------- */
function CategoryDot({ category, size = 8 }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: CATEGORY_STYLE[category] || MUTED,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function StatusPill({ status }) {
  const active = status === "active";
  return (
    <span
      style={{
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        padding: "3px 9px",
        borderRadius: 5,
        background: active ? "rgba(111,162,135,0.13)" : "rgba(139,147,161,0.1)",
        color: active ? SAGE : FAINT,
        border: `1px solid ${active ? "rgba(111,162,135,0.3)" : "rgba(139,147,161,0.2)"}`,
        letterSpacing: "0.02em",
      }}
    >
      {active ? "启用中" : "已取消"}
    </span>
  );
}

export default function SubdueDashboard() {
  const [subs, setSubs] = useState(initialSubs);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(null);
  const [selectedDay, setSelectedDay] = useState(3);
  const [filter, setFilter] = useState("全部");

  const active = subs.filter((s) => s.status === "active");
  const monthlyTotal = useMemo(
    () => Math.round(active.reduce((sum, s) => sum + monthlyEq(s.amount, s.cycle), 0)),
    [active]
  );

  const categoryTotals = useMemo(() => {
    const map = {};
    active.forEach((s) => {
      map[s.category] = (map[s.category] || 0) + monthlyEq(s.amount, s.cycle);
    });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount: Math.round(amount) }))
      .sort((a, b) => b.amount - a.amount);
  }, [active]);
  const maxCategory = categoryTotals[0]?.amount || 1;

  const upcoming = useMemo(
    () => [...active].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5),
    [active]
  );

  const dayBuckets = useMemo(() => {
    const buckets = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, amount: 0, items: [] }));
    active.forEach((s) => {
      if (s.daysLeft >= 1 && s.daysLeft <= 30) {
        buckets[s.daysLeft - 1].amount += s.amount;
        buckets[s.daysLeft - 1].items.push(s);
      }
    });
    return buckets;
  }, [active]);
  const maxDayAmount = Math.max(...dayBuckets.map((d) => d.amount), 1);
  const selectedBucket = dayBuckets[selectedDay - 1];

  const filteredCatalog = catalog.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  const categories = ["全部", ...Object.keys(CATEGORY_STYLE)];
  const filteredSubs = filter === "全部" ? subs : subs.filter((s) => s.category === filter);

  function openManual() {
    setDraft({ name: "", amount: "", cycle: "月", category: "流媒体", daysLeft: 30 });
    setStep(2);
  }
  function pickCatalogItem(item) {
    setDraft({ ...item, daysLeft: 30 });
    setStep(2);
  }
  function saveDraft() {
    if (!draft.name || !draft.amount) return;
    setSubs((prev) => [
      { ...draft, id: Date.now(), amount: Number(draft.amount), daysLeft: Number(draft.daysLeft), status: "active" },
      ...prev,
    ]);
    closeAdd();
  }
  function closeAdd() {
    setIsAddOpen(false);
    setStep(1);
    setQuery("");
    setDraft(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: INK,
        color: PAPER,
        fontFamily: "'Space Grotesk', sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@300;400;500;600;700;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes slideIn { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
        ::placeholder { color: #54596A; }
        input:focus, select:focus, button:focus-visible { outline: 2px solid ${COPPER}; outline-offset: 1px; }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: `1px solid ${BORDER}`,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${COPPER} 0%, #B5651D 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2 7H22" stroke="#11151C" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 17L7 9L11 13L15 5L19 10L22 8" stroke="#11151C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 21, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Subdue
          </span>
        </div>

        <nav style={{ display: "flex", gap: 28 }}>
          {["仪表盘", "订阅", "报告", "设置"].map((label, i) => (
            <span
              key={label}
              style={{
                fontSize: 13,
                color: i === 0 ? PAPER : MUTED,
                paddingBottom: 4,
                borderBottom: i === 0 ? `2px solid ${COPPER}` : "2px solid transparent",
                cursor: "pointer",
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {label}
            </span>
          ))}
        </nav>

        <button
          onClick={() => setIsAddOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: COPPER,
            color: "#1B1100",
            border: "none",
            borderRadius: 8,
            padding: "9px 16px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <Plus size={15} strokeWidth={2.5} /> 添加订阅
        </button>
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "36px 40px 64px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 11, color: MUTED, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>
            本月预计支出
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: 56, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1 }}>
              ¥{monthlyTotal}
            </span>
            <span style={{ fontSize: 13, color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>
              {active.length} 项订阅在追踪 · 下一笔 {upcoming[0]?.daysLeft} 天后
            </span>
          </div>
        </div>

        {/* Heatmap */}
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            padding: "24px 28px",
            marginBottom: 28,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: PAPER }}>
              <Calendar size={15} color={COPPER} /> 未来 30 天扣费分布
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: FAINT }}>
              <span>少</span>
              <div style={{ display: "flex", gap: 3 }}>
                {[0.15, 0.35, 0.6, 0.85, 1].map((op) => (
                  <div key={op} style={{ width: 12, height: 12, borderRadius: 3, background: COPPER, opacity: op }} />
                ))}
              </div>
              <span>多</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6, marginBottom: 18 }}>
            {dayBuckets.map((b) => {
              const intensity = b.amount === 0 ? 0 : 0.18 + (b.amount / maxDayAmount) * 0.82;
              const isSelected = selectedDay === b.day;
              return (
                <button
                  key={b.day}
                  onClick={() => setSelectedDay(b.day)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 6,
                    border: isSelected ? `1.5px solid ${COPPER}` : `1px solid ${BORDER}`,
                    background: b.amount === 0 ? "rgba(255,255,255,0.025)" : COPPER,
                    opacity: b.amount === 0 ? 1 : intensity,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-start",
                    padding: 5,
                    fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: b.amount === 0 ? FAINT : "#1B1100",
                    fontWeight: 600,
                    position: "relative",
                    boxShadow: isSelected ? `0 0 0 3px ${COPPER_DIM}` : "none",
                  }}
                >
                  {b.day}
                </button>
              );
            })}
          </div>

          <div
            style={{
              borderTop: `1px solid ${BORDER}`,
              paddingTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 13 }}>
              <span style={{ color: MUTED }}>第 {selectedDay} 天　</span>
              {selectedBucket.items.length === 0 ? (
                <span style={{ color: FAINT }}>这天没有扣费</span>
              ) : (
                <span style={{ color: PAPER, fontWeight: 600 }}>
                  {selectedBucket.items.map((it) => it.name).join("、")} 共扣 ¥{selectedBucket.amount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginBottom: 28 }}>
          {/* Upcoming */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: PAPER }}>即将到期</div>
            {upcoming.map((s, i) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 0",
                  borderBottom: i < upcoming.length - 1 ? `1px solid ${BORDER}` : "none",
                }}
              >
                <CategoryDot category={s.category} size={9} />
                <span style={{ flex: 1, fontSize: 13.5, color: PAPER }}>{s.name}</span>
                {s.priceIncrease && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      fontSize: 11,
                      color: RUST,
                      background: RUST_DIM,
                      padding: "2px 7px",
                      borderRadius: 5,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <AlertTriangle size={10} /> ¥{s.priceIncrease.from}→{s.priceIncrease.to}
                  </span>
                )}
                <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono', monospace", color: PAPER, minWidth: 56, textAlign: "right" }}>
                  ¥{s.amount}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: s.daysLeft <= 3 ? RUST : MUTED,
                    minWidth: 50,
                    textAlign: "right",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {s.daysLeft} 天后
                </span>
              </div>
            ))}
          </div>

          {/* Category ledger */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: PAPER }}>分类支出</div>
            {categoryTotals.map((c) => (
              <div key={c.category} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: PAPER }}>
                    <CategoryDot category={c.category} /> {c.category}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED }}>¥{c.amount}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(c.amount / maxCategory) * 100}%`,
                      background: CATEGORY_STYLE[c.category],
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full table */}
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: PAPER }}>全部订阅 · {filteredSubs.length}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  style={{
                    fontSize: 11.5,
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: `1px solid ${filter === c ? COPPER : BORDER}`,
                    background: filter === c ? COPPER_DIM : "transparent",
                    color: filter === c ? COPPER : MUTED,
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.8fr 1fr 0.8fr 0.7fr 0.7fr 0.8fr",
              fontSize: 11,
              color: FAINT,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "0 0 10px",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <span>服务</span>
            <span>分类</span>
            <span>金额</span>
            <span>周期</span>
            <span>下次扣款</span>
            <span>状态</span>
          </div>

          {filteredSubs.map((s) => (
            <div
              key={s.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.8fr 1fr 0.8fr 0.7fr 0.7fr 0.8fr",
                alignItems: "center",
                padding: "13px 0",
                borderBottom: `1px solid ${BORDER}`,
                fontSize: 13,
                opacity: s.status === "cancelled" ? 0.5 : 1,
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 8, color: PAPER }}>
                <CategoryDot category={s.category} />
                {s.name}
              </span>
              <span style={{ color: MUTED, fontSize: 12.5 }}>{s.category}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PAPER }}>¥{s.amount}</span>
              <span style={{ color: MUTED, fontSize: 12.5 }}>{CYCLE_SUFFIX[s.cycle]}</span>
              <span style={{ color: MUTED, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{s.daysLeft}天</span>
              <span><StatusPill status={s.status} /></span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, fontSize: 12, color: FAINT, textAlign: "center" }}>
          Subdue 永久无广告 · 本地优先存储 · 开源版可自行部署
        </div>
      </div>

      {/* Add subscription slide-over */}
      {isAddOpen && (
        <>
          <div
            onClick={closeAdd}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", animation: "fadeIn 0.2s ease", zIndex: 40 }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              height: "100vh",
              width: 400,
              maxWidth: "92vw",
              background: SURFACE,
              borderLeft: `1px solid ${BORDER_HOVER}`,
              zIndex: 50,
              animation: "slideIn 0.25s ease",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600 }}>
                {step === 1 ? "添加订阅" : "确认详情"}
              </span>
              <button onClick={closeAdd} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {step === 1 ? (
                <>
                  <div style={{ position: "relative", marginBottom: 18 }}>
                    <Search size={15} color={FAINT} style={{ position: "absolute", left: 12, top: 12 }} />
                    <input
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="搜索服务，如 Netflix"
                      style={{
                        width: "100%",
                        background: SURFACE_2,
                        border: `1px solid ${BORDER_HOVER}`,
                        borderRadius: 9,
                        padding: "10px 12px 10px 36px",
                        fontSize: 13.5,
                        color: PAPER,
                        fontFamily: "'Space Grotesk', sans-serif",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {filteredCatalog.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => pickCatalogItem(item)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          background: SURFACE_2,
                          border: `1px solid ${BORDER}`,
                          borderRadius: 10,
                          padding: "12px 14px",
                          cursor: "pointer",
                          textAlign: "left",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        <CategoryDot category={item.category} size={10} />
                        <span style={{ flex: 1, fontSize: 13.5, color: PAPER }}>{item.name}</span>
                        <span style={{ fontSize: 12, color: MUTED, fontFamily: "'JetBrains Mono', monospace" }}>
                          ¥{item.amount}{CYCLE_SUFFIX[item.cycle]}
                        </span>
                        <ChevronRight size={14} color={FAINT} />
                      </button>
                    ))}
                    {filteredCatalog.length === 0 && (
                      <div style={{ fontSize: 12.5, color: FAINT, padding: "8px 2px" }}>没有找到匹配的服务</div>
                    )}
                  </div>

                  <button
                    onClick={openManual}
                    style={{
                      marginTop: 16,
                      background: "none",
                      border: "none",
                      color: COPPER,
                      fontSize: 12.5,
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontFamily: "'Space Grotesk', sans-serif",
                      padding: 0,
                    }}
                  >
                    找不到？手动添加 →
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 11, color: MUTED, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>服务名称</label>
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="例如 Notion Plus"
                      style={inputStyle}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: MUTED, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>金额 (¥)</label>
                      <input
                        type="number"
                        value={draft.amount}
                        onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: MUTED, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>周期</label>
                      <select
                        value={draft.cycle}
                        onChange={(e) => setDraft({ ...draft, cycle: e.target.value })}
                        style={inputStyle}
                      >
                        {Object.keys(CYCLE_SUFFIX).map((c) => (
                          <option key={c} value={c}>{c}付</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: MUTED, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>分类</label>
                      <select
                        value={draft.category}
                        onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                        style={inputStyle}
                      >
                        {Object.keys(CATEGORY_STYLE).map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, color: MUTED, letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>下次扣款（天后）</label>
                      <input
                        type="number"
                        value={draft.daysLeft}
                        onChange={(e) => setDraft({ ...draft, daysLeft: e.target.value })}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {step === 2 && (
              <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: `1px solid ${BORDER}` }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: `1px solid ${BORDER_HOVER}`,
                    color: MUTED,
                    borderRadius: 9,
                    padding: "11px",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  返回
                </button>
                <button
                  onClick={saveDraft}
                  style={{
                    flex: 2,
                    background: COPPER,
                    border: "none",
                    color: "#1B1100",
                    borderRadius: 9,
                    padding: "11px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  保存订阅
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: SURFACE_2,
  border: `1px solid ${BORDER_HOVER}`,
  borderRadius: 9,
  padding: "10px 12px",
  fontSize: 13.5,
  color: PAPER,
  fontFamily: "'Space Grotesk', sans-serif",
  boxSizing: "border-box",
};
