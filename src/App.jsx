import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { storage, settingsStorage } from "./db/storage";
import { currencyService } from "./services/currency";
import { notificationService } from "./services/notification";
import { calculateNextBilling } from "./services/billingCalculator";

// Components
import Dashboard from "./components/Dashboard";
import SubscriptionTable from "./components/SubscriptionTable";
import AddSubscriptionSidebar from "./components/AddSubscriptionSidebar";
import Settings from "./components/Settings";

export default function App() {
  const [activeTab, setActiveTab] = useState("仪表盘");
  const [subscriptions, setSubscriptions] = useState([]);
  const [settings, setSettings] = useState(settingsStorage.get());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  // Sync exchange rates & load data on mount
  useEffect(() => {
    const initApp = async () => {
      // 1. Load settings and apply theme
      document.documentElement.setAttribute("data-theme", settings.theme);

      // 2. Load subscriptions from IndexedDB & refresh their calculated dates
      await refreshSubscriptionsList();

      // 3. Try to sync latest live exchange rates
      await currencyService.syncRates();

      // 4. Request browser notification permission if supported & default
      if (notificationService.isSupported() && notificationService.getPermission() === "default") {
        setTimeout(async () => {
          await notificationService.requestPermission();
        }, 3000); // Ask gracefully after 3 seconds
      }
    };
    
    initApp();
  }, []);

  // Check for alerts whenever subscriptions are loaded
  useEffect(() => {
    if (subscriptions.length > 0) {
      // Prevent double alerts on duplicate calls by marking alerts as run once per session
      const alertedThisSession = sessionStorage.getItem("subdue_alerted_session");
      if (!alertedThisSession) {
        notificationService.checkAndNotify(subscriptions, settings.reminderDays);
        sessionStorage.setItem("subdue_alerted_session", "true");
      }
    }
  }, [subscriptions, settings.reminderDays]);

  // Read subscriptions and compute updated daysLeft dynamically
  const refreshSubscriptionsList = async () => {
    const dbSubs = await storage.getAllSubscriptions();
    const updated = dbSubs.map((sub) => {
      const dates = calculateNextBilling(sub.firstBilledAt, sub.cycle);
      return {
        ...sub,
        nextBilledAt: dates.nextBilledAt,
        daysLeft: dates.daysLeft,
      };
    });
    setSubscriptions(updated);
  };

  // CRUD Handlers
  const handleSaveSubscription = async (savedSub) => {
    if (savedSub.id) {
      await storage.updateSubscription(savedSub.id, savedSub);
    } else {
      await storage.addSubscription(savedSub);
    }
    await refreshSubscriptionsList();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "cancelled" : "active";
    await storage.updateSubscription(id, { status: nextStatus });
    await refreshSubscriptionsList();
  };

  const handleDeleteSubscription = async (id) => {
    await storage.deleteSubscription(id);
    await refreshSubscriptionsList();
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings) => {
    const updated = settingsStorage.set(newSettings);
    setSettings(updated);
    
    // Apply theme changes instantly to document element
    if (newSettings.theme) {
      document.documentElement.setAttribute("data-theme", newSettings.theme);
    }
  };

  // Data Actions
  const handleExportData = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `subdue_backup_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  const handleImportData = async (importedList) => {
    await storage.importSubscriptions(importedList);
    await refreshSubscriptionsList();
  };

  const handleResetData = async () => {
    await storage.clearAllData();
    localStorage.removeItem("subdue_settings");
    setSettings(settingsStorage.get());
    setSubscriptions([]);
    document.documentElement.setAttribute("data-theme", "dark");
  };

  // Report calculations memoized
  const reportStats = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "active");
    const cancelled = subscriptions.filter((s) => s.status === "cancelled");
    
    // Compute monthly and annual spendings converted to primary currency
    const monthlyTotal = active.reduce((sum, sub) => {
      const converted = currencyService.convert(sub.amount, sub.currency, settings.primaryCurrency);
      const factor = sub.cycle === "年" ? 1 / 12 : sub.cycle === "季" ? 1 / 3 : sub.cycle === "周" ? 4.3333 : 1;
      return sum + converted * factor;
    }, 0);

    const highestSub = active.reduce((highest, current) => {
      const currentConverted = currencyService.convert(current.amount, current.currency, settings.primaryCurrency);
      const currentMonthly = currentConverted * (current.cycle === "年" ? 1 / 12 : current.cycle === "季" ? 1 / 3 : current.cycle === "周" ? 4.3333 : 1);
      
      if (!highest) return { item: current, monthlyEquivalent: currentMonthly };
      return currentMonthly > highest.monthlyEquivalent ? { item: current, monthlyEquivalent: currentMonthly } : highest;
    }, null);

    const cycleCounts = active.reduce((counts, s) => {
      counts[s.cycle] = (counts[s.cycle] || 0) + 1;
      return counts;
    }, { "周": 0, "月": 0, "季": 0, "年": 0 });

    return {
      activeCount: active.length,
      cancelledCount: cancelled.length,
      monthlyTotal: Math.round(monthlyTotal),
      annualTotal: Math.round(monthlyTotal * 12),
      highestSub,
      cycleCounts,
      averageCost: active.length > 0 ? Math.round(monthlyTotal / active.length) : 0,
    };
  }, [subscriptions, settings.primaryCurrency]);

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Top Navbar */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          borderBottom: "1px solid var(--color-border)",
          flexWrap: "wrap",
          gap: "16px",
          backgroundColor: "var(--color-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Brand Logo */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2 7H22" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M2 17L7 9L11 13L15 5L19 10L22 8" stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--color-paper)" }}>
            Subdue
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: "flex", gap: "28px" }}>
          {["仪表盘", "订阅列表", "分析报告", "系统设置"].map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setEditingSub(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "14px",
                  color: isSelected ? "var(--color-paper)" : "var(--color-muted)",
                  paddingBottom: "4px",
                  borderBottom: isSelected ? "2px solid var(--color-copper)" : "2px solid transparent",
                  cursor: "pointer",
                  fontWeight: isSelected ? 600 : 400,
                  transition: "var(--transition-smooth)",
                }}
              >
                {tab}
              </button>
            );
          })}
        </nav>

        {/* Add subscription action CTA */}
        <button
          onClick={() => {
            setEditingSub(null);
            setIsAddOpen(true);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "var(--color-copper)",
            color: "var(--color-ink)",
            border: "none",
            borderRadius: "var(--border-radius-md)",
            padding: "9px 18px",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "var(--transition-smooth)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
        >
          <Plus size={16} strokeWidth={2.5} /> 添加订阅
        </button>
      </header>

      {/* Main Page Content */}
      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "36px 40px 64px" }}>
        
        {/* Render Tabs dynamically */}
        {activeTab === "仪表盘" && (
          <div className="animate-fade-in">
            <Dashboard subscriptions={subscriptions} settings={settings} />
          </div>
        )}

        {activeTab === "订阅列表" && (
          <div className="animate-fade-in">
            <SubscriptionTable
              subscriptions={subscriptions}
              onEdit={(sub) => {
                setEditingSub(sub);
                setIsAddOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteSubscription}
            />
          </div>
        )}

        {activeTab === "分析报告" && (
          <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Overview summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              
              <div className="glass-card">
                <div style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "6px", fontWeight: 600 }}>预计年度支出</div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-copper)", fontFamily: "var(--font-display)" }}>
                  {currencyService.format(reportStats.annualTotal, settings.primaryCurrency)}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-faint)", marginTop: "4px" }}>基于当前有效订阅乘以 12 计算</div>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "6px", fontWeight: 600 }}>平均单项月消费</div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-paper)", fontFamily: "var(--font-display)" }}>
                  {currencyService.format(reportStats.averageCost, settings.primaryCurrency)}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-faint)", marginTop: "4px" }}>有效账单的平均月折算支出</div>
              </div>

              <div className="glass-card">
                <div style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "6px", fontWeight: 600 }}>扣款/已取消比率</div>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--color-paper)", fontFamily: "var(--font-display)" }}>
                  {reportStats.activeCount} / <span style={{ color: "var(--color-faint)" }}>{reportStats.cancelledCount}</span>
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-faint)", marginTop: "4px" }}>取消不影响历史，仅停止周期续费</div>
              </div>

            </div>

            {/* In-depth reports split sections */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              
              {/* Detailed billing frequency analysis */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, borderLeft: "3px solid var(--color-copper)", paddingLeft: "10px" }}>
                  付款周期频次分析
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {Object.entries(reportStats.cycleCounts).map(([cycle, count]) => (
                    <div key={cycle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px" }}>
                      <span style={{ color: "var(--color-paper)", fontWeight: 500 }}>{cycle}付订阅</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-muted)" }}>
                        {count} 项服务
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highest Cost Subscription focus */}
              <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <h4 style={{ fontSize: "15px", fontWeight: 700, borderLeft: "3px solid var(--color-copper)", paddingLeft: "10px" }}>
                  最高单项订阅消费
                </h4>
                {reportStats.highestSub ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-paper)" }}>
                      {reportStats.highestSub.item.name}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--color-muted)" }}>
                      扣款周期：{reportStats.highestSub.item.cycle}付 · 原始单价：
                      {currencyService.format(reportStats.highestSub.item.amount, reportStats.highestSub.item.currency)}
                    </div>
                    <div style={{ marginTop: "8px", borderTop: "1px solid var(--color-border)", paddingTop: "8px" }}>
                      <div style={{ fontSize: "11px", color: "var(--color-faint)", textTransform: "uppercase" }}>月折算消费</div>
                      <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-rust)" }}>
                        {currencyService.format(reportStats.highestSub.monthlyEquivalent, settings.primaryCurrency)}/月
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "var(--color-faint)", fontStyle: "italic", fontSize: "14px" }}>
                    未录入任何有效订阅
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {activeTab === "系统设置" && (
          <div className="animate-fade-in">
            <Settings
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onResetData={handleResetData}
              subscriptions={subscriptions}
              onSyncCompleted={refreshSubscriptionsList}
            />
          </div>
        )}

      </main>

      {/* Slide-over Form Sidebar */}
      <AddSubscriptionSidebar
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingSub(null);
        }}
        onSave={handleSaveSubscription}
        editingSub={editingSub}
      />

      {/* Footer Branding */}
      <footer style={{ padding: "24px", textAlign: "center", fontSize: "12px", color: "var(--color-faint)", borderTop: "1px solid var(--color-border)", marginTop: "auto" }}>
        Subdue 守护你的钱袋子 · 永久无广告 · 隐私优先本地加密
      </footer>
    </div>
  );
}
