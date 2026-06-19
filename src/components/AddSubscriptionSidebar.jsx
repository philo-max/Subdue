import { useState, useEffect } from "react";
import { X, Search, ChevronRight, Clipboard } from "lucide-react";
import { calculateNextBilling } from "../services/billingCalculator";
import { parseBillingText } from "../services/billingParser";

// Extensive catalogue of common global and local subscriptions
const SERVICE_CATALOG = [
  { name: "Netflix", amount: 35, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "Spotify", amount: 15, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "Disney+", amount: 28, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "YouTube Premium", amount: 18, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "iCloud+ 200GB", amount: 21, currency: "CNY", cycle: "月", category: "云存储" },
  { name: "Google One 100GB", amount: 15, currency: "CNY", cycle: "月", category: "云存储" },
  { name: "Dropbox Plus", amount: 860, currency: "CNY", cycle: "年", category: "云存储" },
  { name: "ChatGPT Plus", amount: 20, currency: "USD", cycle: "月", category: "AI工具" },
  { name: "Claude Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具" },
  { name: "GitHub Copilot", amount: 10, currency: "USD", cycle: "月", category: "AI工具" },
  { name: "Midjourney", amount: 30, currency: "USD", cycle: "月", category: "AI工具" },
  { name: "Notion Plus", amount: 8, currency: "USD", cycle: "月", category: "生产力" },
  { name: "Microsoft 365 Personal", amount: 398, currency: "CNY", cycle: "年", category: "生产力" },
  { name: "Adobe Creative Cloud", amount: 198, currency: "CNY", cycle: "月", category: "设计工具" },
  { name: "1Password", amount: 25, currency: "CNY", cycle: "月", category: "生产力" },
  { name: "Keep 会员", amount: 19, currency: "CNY", cycle: "月", category: "健身" },
  { name: "爱奇艺 VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "腾讯视频 VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "优酷 VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "B站大会员", amount: 15, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "网易云音乐 黑胶", amount: 15, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "QQ音乐 绿钻", amount: 15, currency: "CNY", cycle: "月", category: "流媒体" },
  { name: "微信读书 无限卡", amount: 19, currency: "CNY", cycle: "月", category: "生产力" },
  { name: "淘宝 88VIP", amount: 88, currency: "CNY", cycle: "年", category: "购物会员" },
  { name: "京东 PLUS", amount: 99, currency: "CNY", cycle: "年", category: "购物会员" },
  { name: "盒马 X 会员", amount: 258, currency: "CNY", cycle: "年", category: "购物会员" },
  { name: "美团外卖 神会员", amount: 15, currency: "CNY", cycle: "月", category: "购物会员" },
  { name: "Nintendo Switch Online", amount: 155, currency: "CNY", cycle: "年", category: "流媒体" },
  { name: "PlayStation Plus", amount: 428, currency: "CNY", cycle: "年", category: "流媒体" },
  { name: "Xbox Game Pass Ultimate", amount: 110, currency: "CNY", cycle: "月", category: "流媒体" },
];

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

const CURRENCIES = ["CNY", "USD", "EUR", "JPY"];
const CYCLES = ["周", "月", "季", "年"];
const CATEGORIES = Object.keys(CATEGORY_COLORS);

export default function AddSubscriptionSidebar({ isOpen, onClose, onSave, editingSub = null }) {
  const [step, setStep] = useState(1); // 1: Search & Template list, 2: Form edit
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "CNY",
    cycle: "月",
    category: "流媒体",
    firstBilledAt: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Handle ESC key press to close sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Set form data when editing an existing subscription
  useEffect(() => {
    if (editingSub) {
      setFormData({
        name: editingSub.name || "",
        amount: editingSub.amount || "",
        currency: editingSub.currency || "CNY",
        cycle: editingSub.cycle || "月",
        category: editingSub.category || "流媒体",
        firstBilledAt: editingSub.firstBilledAt || new Date().toISOString().split("T")[0],
        notes: editingSub.notes || "",
      });
      setStep(2);
    } else {
      resetForm();
    }
  }, [editingSub, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      currency: "CNY",
      cycle: "月",
      category: "流媒体",
      firstBilledAt: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setStep(1);
    setSearchQuery("");
  };

  const filteredCatalog = SERVICE_CATALOG.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTemplate = (template) => {
    setFormData({
      name: template.name,
      amount: template.amount,
      currency: template.currency,
      cycle: template.cycle,
      category: template.category,
      firstBilledAt: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setStep(2);
  };

  const handleManualEntry = () => {
    resetForm();
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.amount) return;

    // Calculate billing details
    const billingDetails = calculateNextBilling(formData.firstBilledAt, formData.cycle);

    const savedSub = {
      ...formData,
      amount: Number(formData.amount),
      nextBilledAt: billingDetails.nextBilledAt,
      daysLeft: billingDetails.daysLeft,
    };

    if (editingSub) {
      savedSub.id = editingSub.id;
      savedSub.status = editingSub.status;
    } else {
      savedSub.status = "active";
    }

    onSave(savedSub);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Sidebar Panel */}
      <div
        className="animate-slide-in"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "420px",
          maxWidth: "90vw",
          backgroundColor: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-premium)",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "20px", fontWeight: 600 }}>
            {editingSub ? "编辑订阅" : step === 1 ? "添加订阅" : "填写订阅详情"}
          </h2>
          <button
            onClick={onClose}
            aria-label="关闭侧边栏"
            style={{
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "4px",
              borderRadius: "50%",
              transition: "var(--transition-smooth)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {step === 1 && !editingSub ? (
            /* Step 1: Template Selection */
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Smart Paste Option */}
              <SmartPastePanel onParsed={(parsedData) => {
                setFormData(parsedData);
                setStep(2);
              }} />

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
                <span style={{ fontSize: "11px", color: "var(--color-faint)", fontWeight: 500 }}>或</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
              </div>

              {/* Search bar */}
              <div style={{ position: "relative" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-faint)",
                  }}
                />
                <input
                  type="text"
                  placeholder="搜索常见服务，如 Netflix, Spotify..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px 12px 42px",
                    backgroundColor: "var(--color-surface-2)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--border-radius-md)",
                    color: "var(--color-paper)",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Templates List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ fontSize: "12px", color: "var(--color-muted)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
                  推荐服务模版
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
                  {filteredCatalog.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleSelectTemplate(item)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        width: "100%",
                        padding: "12px 16px",
                        backgroundColor: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--border-radius-lg)",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "var(--transition-smooth)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-border-hover)";
                        e.currentTarget.style.transform = "translateX(2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--color-border)";
                        e.currentTarget.style.transform = "none";
                      }}
                    >
                      {/* Color dot indicating category */}
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: CATEGORY_COLORS[item.category] || "var(--color-muted)",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ flex: 1, fontSize: "14px", fontWeight: 500, color: "var(--color-paper)" }}>{item.name}</span>
                      <span style={{ fontSize: "13px", fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                        {item.currency === "USD" ? "$" : item.currency === "EUR" ? "€" : "¥"}
                        {item.amount}/{item.cycle}
                      </span>
                      <ChevronRight size={14} style={{ color: "var(--color-faint)", marginLeft: "4px" }} />
                    </button>
                  ))}

                  {filteredCatalog.length === 0 && (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--color-faint)", fontSize: "14px" }}>
                      没有找到匹配的模版
                    </div>
                  )}
                </div>
              </div>

              {/* Create Manual Button */}
              <button
                onClick={handleManualEntry}
                style={{
                  alignSelf: "flex-start",
                  background: "none",
                  border: "none",
                  color: "var(--color-copper)",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: "4px 0",
                }}
              >
                没有我想添加的？手动录入 →
              </button>
            </div>
          ) : (
            /* Step 2: Form Fields */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Service Name */}
              <div>
                <label style={labelStyle}>服务名称</label>
                <input
                  type="text"
                  required
                  placeholder="例如 Notion Plus, Netflix"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Amount & Currency */}
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 2 }}>
                  <label style={labelStyle}>扣款金额</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1.2 }}>
                  <label style={labelStyle}>币种</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    style={selectStyle}
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billing Cycle & Category */}
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>支付周期</label>
                  <select
                    value={formData.cycle}
                    onChange={(e) => setFormData({ ...formData, cycle: e.target.value })}
                    style={selectStyle}
                  >
                    {CYCLES.map((cyc) => (
                      <option key={cyc} value={cyc}>
                        {cyc}付
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>服务分类</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={selectStyle}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* First Billing Date */}
              <div>
                <label style={labelStyle}>首次（或最近）扣款日期</label>
                <input
                  type="date"
                  required
                  value={formData.firstBilledAt}
                  onChange={(e) => setFormData({ ...formData, firstBilledAt: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>备注说明 (可选)</label>
                <textarea
                  placeholder="添加一些备注，如：多人拼车、绑定的信用卡等"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{ ...inputStyle, height: "80px", resize: "none" }}
                />
              </div>

              {/* Bottom Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "12px",
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "20px",
                }}
              >
                {!editingSub && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      backgroundColor: "transparent",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--border-radius-md)",
                      color: "var(--color-muted)",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: 500,
                      transition: "var(--transition-smooth)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-border-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                  >
                    返回
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: "12px",
                    backgroundColor: "var(--color-copper)",
                    color: "var(--color-ink)",
                    border: "none",
                    borderRadius: "var(--border-radius-md)",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                    transition: "var(--transition-smooth)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
                >
                  {editingSub ? "更新订阅" : "保存订阅"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

const labelStyle = {
  display: "block",
  fontSize: "12px",
  color: "var(--color-muted)",
  fontWeight: 600,
  letterSpacing: "0.02em",
  marginBottom: "8px",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  backgroundColor: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--border-radius-md)",
  color: "var(--color-paper)",
  fontSize: "14px",
  transition: "var(--transition-smooth)",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238B93A1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "16px",
  paddingRight: "36px",
};

function SmartPastePanel({ onParsed }) {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleParse = () => {
    setError("");
    const parsed = parseBillingText(text);
    if (parsed && parsed.amount) {
      onParsed(parsed);
      setText("");
      setIsOpen(false);
    } else {
      setError("未能识别出有效的订阅名称、扣款金额等，请核对文本格式。");
    }
  };

  return (
    <div style={{
      border: "1px dashed var(--color-border)",
      borderRadius: "var(--border-radius-lg)",
      padding: "14px",
      backgroundColor: "var(--color-surface-2)"
    }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "none",
          border: "none",
          color: "var(--color-copper)",
          cursor: "pointer",
          fontSize: "13.5px",
          fontWeight: 600,
          width: "100%",
          textAlign: "left"
        }}
      >
        <Clipboard size={14} /> {isOpen ? "收起智能粘贴解析" : "使用智能账单文本解析 (免打字)"}
      </button>

      {isOpen && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px", animation: "fadeIn 0.2s" }}>
          <div style={{ fontSize: "11.5px", color: "var(--color-muted)", lineHeight: 1.4 }}>
            支持粘贴微信支付、支付宝账单详情或银行交易通知短信，系统将自动分析名称、金额、币种与时间：
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="例如：微信支付：商户名称 Netflix，付款金额 ¥35.00，时间 2026-06-19..."
            style={{
              width: "100%",
              height: "70px",
              backgroundColor: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--border-radius-sm)",
              color: "var(--color-paper)",
              fontSize: "12.5px",
              padding: "8px",
              resize: "none",
              fontFamily: "inherit"
            }}
          />
          {error && <div style={{ fontSize: "11.5px", color: "var(--color-rust)" }}>⚠️ {error}</div>}
          <button
            type="button"
            onClick={handleParse}
            disabled={!text.trim()}
            style={{
              alignSelf: "flex-end",
              padding: "6px 14px",
              backgroundColor: text.trim() ? "var(--color-copper)" : "var(--color-faint)",
              color: "var(--color-ink)",
              border: "none",
              borderRadius: "var(--border-radius-sm)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: text.trim() ? "pointer" : "default"
            }}
          >
            一键智能识别
          </button>
        </div>
      )}
    </div>
  );
}
