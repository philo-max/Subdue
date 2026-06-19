import { useState, useMemo } from "react";
import { Calendar, AlertTriangle } from "lucide-react";
import { currencyService } from "../services/currency";

const CATEGORY_COLORS = {
  流媒体: "#D9852B",
  AI工具: "#7C93B3",
  生产力: "#6FA287",
  设计工具: "#9C84B0",
  云存储: "#5FA9A0",
  健身: "#BD7B7E",
  购物会员: "#B9A36B",
  其他: "#8B93A1",
};

// Normalize any subscription cost to monthly cost equivalent
function getMonthlyEquivalent(amount, cycle) {
  if (cycle === "年") return amount / 12;
  if (cycle === "季") return amount / 3;
  if (cycle === "周") return amount * 4.3333; // 52 weeks / 12 months
  return amount; // "月"
}

export default function Dashboard({ subscriptions, settings }) {
  const [selectedOffset, setSelectedOffset] = useState(0); // 0 = today, 1 = tomorrow, etc.
  const primaryCurrency = settings.primaryCurrency || "CNY";

  const activeSubs = useMemo(() => {
    return subscriptions.filter((s) => s.status === "active");
  }, [subscriptions]);

  // Compute monthly expected total in primary currency
  const monthlyTotal = useMemo(() => {
    const total = activeSubs.reduce((sum, sub) => {
      const convertedAmount = currencyService.convert(sub.amount, sub.currency, primaryCurrency);
      const monthlyCost = getMonthlyEquivalent(convertedAmount, sub.cycle);
      return sum + monthlyCost;
    }, 0);
    return total;
  }, [activeSubs, primaryCurrency]);

  // Get nearest upcoming subscriptions (sorted by days remaining)
  const upcomingSubs = useMemo(() => {
    return [...activeSubs]
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [activeSubs]);

  // Aggregate category breakdowns in primary currency
  const categoryTotals = useMemo(() => {
    const map = {};
    activeSubs.forEach((sub) => {
      const convertedAmount = currencyService.convert(sub.amount, sub.currency, primaryCurrency);
      const monthlyCost = getMonthlyEquivalent(convertedAmount, sub.cycle);
      map[sub.category] = (map[sub.category] || 0) + monthlyCost;
    });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeSubs, primaryCurrency]);

  const maxCategoryAmount = useMemo(() => {
    return Math.max(...categoryTotals.map((c) => c.amount), 1);
  }, [categoryTotals]);

  // Create 30-day payment calendar buckets with actual calendar dates
  const dayBuckets = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets = Array.from({ length: 30 }, (_, i) => {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const m = targetDate.getMonth() + 1;
      const d = targetDate.getDate();
      
      return {
        offsetDays: i, // 0 = today, 1 = tomorrow
        dateLabel: `${m}/${d}`, // e.g. "6/19"
        dayOfMonth: d,
        month: m,
        totalAmount: 0,
        items: [],
      };
    });

    activeSubs.forEach((sub) => {
      const daysLeft = sub.daysLeft;
      // 0 daysLeft means today, so we map daysLeft = 0 to index 0, daysLeft = 29 to index 29
      if (daysLeft >= 0 && daysLeft < 30) {
        const converted = currencyService.convert(sub.amount, sub.currency, primaryCurrency);
        buckets[daysLeft].totalAmount += converted;
        buckets[daysLeft].items.push(sub);
      }
    });

    return buckets;
  }, [activeSubs, primaryCurrency]);

  const maxDayAmount = useMemo(() => {
    return Math.max(...dayBuckets.map((d) => d.totalAmount), 1);
  }, [dayBuckets]);

  const selectedBucket = dayBuckets[selectedOffset];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Hero Metric Section */}
      <div>
        <div
          style={{
            fontSize: "11px",
            color: "var(--color-muted)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "8px",
            fontWeight: 600,
          }}
        >
          预计月度总支出 ({primaryCurrency})
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "20px", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "56px",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              color: "var(--color-paper)",
            }}
          >
            {currencyService.format(monthlyTotal, primaryCurrency)}
          </span>
          <span style={{ fontSize: "13px", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>
            {activeSubs.length} 项有效订阅在追踪 · 下一笔付款在 {upcomingSubs[0]?.daysLeft ?? "-"} 天后
          </span>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="glass-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "var(--color-paper)" }}>
            <Calendar size={15} style={{ color: "var(--color-copper)" }} /> 未来 30 天扣费日历分布
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "var(--color-faint)" }}>
            <span>低额度</span>
            <div style={{ display: "flex", gap: "3px" }}>
              {[0.15, 0.35, 0.6, 0.85, 1.0].map((op) => (
                <div
                  key={op}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "3px",
                    backgroundColor: "var(--color-copper)",
                    opacity: op,
                  }}
                />
              ))}
            </div>
            <span>高额度</span>
          </div>
        </div>

        {/* 30 Days Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(46px, 1fr))",
            gap: "8px",
            marginBottom: "20px",
          }}
        >
          {dayBuckets.map((b) => {
            const hasAmount = b.totalAmount > 0;
            const intensity = hasAmount ? 0.25 + (b.totalAmount / maxDayAmount) * 0.75 : 0;
            const isSelected = selectedOffset === b.offsetDays;
            const isToday = b.offsetDays === 0;

            return (
              <button
                key={b.offsetDays}
                onClick={() => setSelectedOffset(b.offsetDays)}
                style={{
                  aspectRatio: "1",
                  borderRadius: "var(--border-radius-sm)",
                  border: isSelected ? "2px solid var(--color-copper)" : isToday ? "1.5px dashed var(--color-muted)" : "1px solid var(--color-border)",
                  backgroundColor: hasAmount ? "var(--color-copper)" : "rgba(255, 255, 255, 0.025)",
                  opacity: hasAmount ? intensity : 1,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "5px 3px 4px",
                  fontFamily: "var(--font-mono)",
                  color: hasAmount ? "var(--color-ink)" : isToday ? "var(--color-copper)" : "var(--color-faint)",
                  fontWeight: 600,
                  position: "relative",
                  boxShadow: isSelected ? "0 0 0 3px var(--color-copper-dim)" : "none",
                  transition: "var(--transition-smooth)",
                }}
              >
                {/* Date Month Label: e.g. 6/19 */}
                <span style={{ fontSize: "8.5px", opacity: hasAmount ? 0.75 : 0.85, fontWeight: isToday ? 700 : 500 }}>
                  {isToday ? "今天" : b.dateLabel}
                </span>
                
                {/* Day of Month display */}
                <span style={{ fontSize: "12px", fontWeight: 700, lineHeight: 1 }}>
                  {b.dayOfMonth}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected day explanation details */}
        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px", fontSize: "13.5px" }}>
          <span style={{ color: "var(--color-muted)" }}>
            {selectedBucket.offsetDays === 0 ? "今天" : selectedBucket.offsetDays === 1 ? "明天" : `${selectedBucket.offsetDays}天后`} ({selectedBucket.month}月{selectedBucket.dayOfMonth}日)：
          </span>
          {selectedBucket.items.length === 0 ? (
            <span style={{ color: "var(--color-faint)", fontStyle: "italic" }}>这一天没有账单扣费</span>
          ) : (
            <span style={{ color: "var(--color-paper)", fontWeight: 600 }}>
              {selectedBucket.items.map((it) => it.name).join("、")} 共计扣款{" "}
              <strong style={{ color: "var(--color-copper)" }}>
                {currencyService.format(selectedBucket.totalAmount, primaryCurrency)}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Two columns: Upcoming list vs Categories */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
        
        {/* Nearest Expirations */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-paper)" }}>即将到期续费</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {upcomingSubs.map((s, idx) => (
              <div
                key={s.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 0",
                  borderBottom: idx < upcomingSubs.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: CATEGORY_COLORS[s.category] || "var(--color-muted)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontSize: "13.5px", fontWeight: 500, color: "var(--color-paper)" }}>
                  {s.name}
                </span>

                <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--color-paper)", textAlign: "right" }}>
                  {currencyService.format(s.amount, s.currency)}
                </span>
                
                <span
                  style={{
                    fontSize: "11px",
                    color: s.daysLeft <= settings.reminderDays ? "var(--color-rust)" : "var(--color-muted)",
                    minWidth: "54px",
                    textAlign: "right",
                    fontFamily: "var(--font-mono)",
                    fontWeight: s.daysLeft <= settings.reminderDays ? 600 : 400,
                  }}
                >
                  {s.daysLeft === 0 ? "今天扣款" : `${s.daysLeft} 天后`}
                </span>
              </div>
            ))}

            {upcomingSubs.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-faint)", fontSize: "13.5px" }}>
                无即将扣款的订阅服务
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown bar meters */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-paper)" }}>按分类支出分布</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {categoryTotals.map((c) => {
              const pct = (c.amount / maxCategoryAmount) * 100;
              return (
                <div key={c.category}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--color-paper)", fontWeight: 500 }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: CATEGORY_COLORS[c.category] || "var(--color-muted)",
                        }}
                      />
                      {c.category}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                      {currencyService.format(c.amount, primaryCurrency)}/月
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      height: "6px",
                      backgroundColor: "rgba(255, 255, 255, 0.04)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        backgroundColor: CATEGORY_COLORS[c.category] || "var(--color-muted)",
                        borderRadius: "3px",
                        transition: "var(--transition-smooth)",
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {categoryTotals.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-faint)", fontSize: "13.5px" }}>
                录入账单后将在此显示分类统计
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
