import { useState, useMemo } from "react";
import { Edit2, ToggleLeft, ToggleRight, Trash2, Search } from "lucide-react";
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

const CYCLE_SUFFIX = {
  "周": "/周",
  "月": "/月",
  "季": "/季",
  "年": "/年",
};

export default function SubscriptionTable({
  subscriptions,
  onEdit,
  onToggleStatus,
  onDelete,
}) {
  const [filter, setFilter] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["全部", ...Object.keys(CATEGORY_COLORS)];

  // Process filters and searches
  const filteredSubs = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchesCategory = filter === "全部" || sub.category === filter;
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [subscriptions, filter, searchQuery]);

  return (
    <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Search & Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", minWidth: "220px", flex: "1 0 auto" }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-faint)",
            }}
          />
          <input
            type="text"
            placeholder="搜索我录入的订阅..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              backgroundColor: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--border-radius-md)",
              color: "var(--color-paper)",
              fontSize: "13.5px",
            }}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              style={{
                fontSize: "11.5px",
                padding: "6px 12px",
                borderRadius: "20px",
                border: `1px solid ${filter === c ? "var(--color-copper)" : "var(--color-border)"}`,
                background: filter === c ? "var(--color-copper-dim)" : "transparent",
                color: filter === c ? "var(--color-copper)" : "var(--color-muted)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "var(--transition-smooth)",
              }}
              onMouseEnter={(e) => {
                if (filter !== c) e.currentTarget.style.borderColor = "var(--color-border-hover)";
              }}
              onMouseLeave={(e) => {
                if (filter !== c) e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table grid */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "640px" }}>
          {/* Table Headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1.2fr 0.8fr 1.2fr",
              fontSize: "11px",
              color: "var(--color-faint)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              paddingBottom: "10px",
              borderBottom: "1px solid var(--color-border)",
              fontWeight: 600,
            }}
          >
            <span>服务名称</span>
            <span>所属分类</span>
            <span>扣款金额</span>
            <span>付款周期</span>
            <span>下次扣款日期</span>
            <span>状态</span>
            <span style={{ textAlign: "right", paddingRight: "8px" }}>操作</span>
          </div>

          {/* Table Rows */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filteredSubs.map((s) => {
              const active = s.status === "active";
              return (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 0.8fr 1.2fr 0.8fr 1.2fr",
                    alignItems: "center",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--color-border)",
                    fontSize: "13.5px",
                    opacity: active ? 1 : 0.45,
                    transition: "var(--transition-smooth)",
                  }}
                >
                  {/* Name */}
                  <span style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 600, color: "var(--color-paper)" }}>
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: CATEGORY_COLORS[s.category] || "var(--color-muted)",
                        flexShrink: 0,
                      }}
                    />
                    {s.name}
                  </span>

                  {/* Category */}
                  <span style={{ color: "var(--color-muted)", fontSize: "13px" }}>{s.category}</span>

                  {/* Amount */}
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-paper)" }}>
                    {currencyService.format(s.amount, s.currency)}
                  </span>

                  {/* Cycle */}
                  <span style={{ color: "var(--color-muted)", fontSize: "13px" }}>{CYCLE_SUFFIX[s.cycle] || s.cycle}</span>

                  {/* Next Date & daysLeft */}
                  <span style={{ color: "var(--color-paper)", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "13px" }}>{s.nextBilledAt}</span>
                    {active && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontFamily: "var(--font-mono)",
                          color: s.daysLeft <= 3 ? "var(--color-rust)" : "var(--color-muted)",
                        }}
                      >
                        {s.daysLeft === 0 ? "今天扣款" : `${s.daysLeft}天后`}
                      </span>
                    )}
                  </span>

                  {/* Status */}
                  <span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-mono)",
                        padding: "3px 8px",
                        borderRadius: "5px",
                        backgroundColor: active ? "var(--color-sage-dim)" : "rgba(139, 147, 161, 0.1)",
                        color: active ? "var(--color-sage)" : "var(--color-faint)",
                        border: `1px solid ${active ? "rgba(111, 162, 135, 0.3)" : "rgba(139, 147, 161, 0.2)"}`,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {active ? "扣款中" : "已取消"}
                    </span>
                  </span>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingRight: "4px" }}>
                    {/* Toggle Status Button */}
                    <button
                      onClick={() => onToggleStatus(s.id, s.status)}
                      title={active ? "取消自动续费(标记为取消)" : "激活自动续费"}
                      style={actionButtonStyle}
                    >
                      {active ? (
                        <ToggleRight size={17} style={{ color: "var(--color-sage)" }} />
                      ) : (
                        <ToggleLeft size={17} style={{ color: "var(--color-faint)" }} />
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => onEdit(s)}
                      title="编辑订阅"
                      style={actionButtonStyle}
                    >
                      <Edit2 size={15} style={{ color: "var(--color-muted)" }} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (confirm(`确定要彻底删除订阅 "${s.name}" 的历史记录吗？`)) {
                          onDelete(s.id);
                        }
                      }}
                      title="彻底删除"
                      style={actionButtonStyle}
                    >
                      <Trash2 size={15} style={{ color: "var(--color-rust)" }} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredSubs.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-faint)", fontSize: "14px" }}>
                没有找到符合筛选条件的订阅项，点击右上角 “添加订阅” 开始录入吧！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const actionButtonStyle = {
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "6px",
  borderRadius: "var(--border-radius-sm)",
  transition: "var(--transition-smooth)",
  backgroundColor: "transparent",
};
