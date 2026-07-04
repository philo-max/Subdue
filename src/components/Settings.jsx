import { useState, useRef, useEffect } from "react";
import { Download, Upload, Trash2, RefreshCw, Sun, Moon, Laptop, Smartphone, Check, Wifi, AlertCircle } from "lucide-react";
import { currencyService } from "../services/currency";
import { syncService, MOCK_DEVICES } from "../services/syncService";
import { parseCSVBilling } from "../services/billingParser";
import { storage } from "../db/storage";

export default function Settings({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
  subscriptions,
  onSyncCompleted // Hook to reload data in parent App.jsx
}) {
  const [syncing, setSyncing] = useState(false);
  const [rateStatus, setRateStatus] = useState(currencyService.getRatesStatus());
  const [syncState, setSyncState] = useState(syncService.getSyncStatus());
  const [pairingDevice, setPairingDevice] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState("both");
  const [syncLogs, setSyncLogs] = useState([]);
  
  // CSV Import States
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvCandidates, setCsvCandidates] = useState([]);
  
  const fileInputRef = useRef(null);
  const csvFileInputRef = useRef(null);

  // Sync statuses checking
  const handleCurrencyChange = (e) => {
    onUpdateSettings({ primaryCurrency: e.target.value });
  };

  const handleReminderChange = (e) => {
    onUpdateSettings({ reminderDays: Number(e.target.value) });
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === "dark" ? "light" : "dark";
    onUpdateSettings({ theme: newTheme });
  };

  const handleSyncRates = async () => {
    setSyncing(true);
    try {
      await currencyService.syncRates();
      setRateStatus(currencyService.getRatesStatus());
    } catch (e) {
      console.error("Manual rate sync failed", e);
    } finally {
      setTimeout(() => setSyncing(false), 800);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        if (Array.isArray(data)) {
          if (confirm(`确定要导入 ${data.length} 条订阅数据吗？这将覆盖当前所有数据！`)) {
            await onImportData(data);
            alert("数据导入成功！");
          }
        } else {
          alert("无效的数据格式！导入文件必须是包含订阅数组 of JSON 格式。");
        }
      } catch (err) {
        alert("文件解析失败，请确保是正确的 JSON 文件。");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // CSV Importer Logic
  const triggerCSVFileInput = () => {
    csvFileInputRef.current?.click();
  };

  const handleCSVFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const candidates = parseCSVBilling(text);
        if (candidates.length === 0) {
          alert("未在 CSV 账单中检测到明显的周期性订阅扣款记录。请确保 CSV 包含『时间』、『金额』、『商品描述/商户名称』等列，且存在重复扣费。");
          return;
        }
        setCsvCandidates(candidates.map((c, idx) => ({ ...c, checked: true, tempId: idx })));
        setShowCSVModal(true);
      } catch (err) {
        console.error(err);
        alert("CSV 解析失败，请确保格式正确。");
      }
    };
    reader.readAsText(file, "gbk"); // Read GBK for Alipay/WeChat Chinese CSV exports
    e.target.value = "";
  };

  const toggleCandidate = (idx) => {
    setCsvCandidates(prev => prev.map((c, i) => i === idx ? { ...c, checked: !c.checked } : c));
  };

  const updateCandidateField = (idx, field, value) => {
    setCsvCandidates(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleConfirmCSVImport = async () => {
    const selected = csvCandidates.filter(c => c.checked);
    if (selected.length === 0) {
      alert("请至少选择一项要导入的订阅账单！");
      return;
    }

    try {
      for (const item of selected) {
        await storage.addSubscription({
          name: item.name,
          amount: item.amount,
          currency: item.currency,
          cycle: item.cycle,
          category: item.category,
          firstBilledAt: item.firstBilledAt,
          notes: `自 CSV 账单智能分析导入。置信度：${Math.round(item.confidence * 100)}%。原因为：${item.reason}`
        });
      }
      alert(`🎉 成功导入 ${selected.length} 笔订阅账单！`);
      setShowCSVModal(false);
      if (onSyncCompleted) {
        await onSyncCompleted();
      }
    } catch (e) {
      console.error(e);
      alert("导入失败，请检查数据库状态。");
    }
  };

  // LAN Pairing & Merge Simulation Handlers
  const handleConnectMockDevice = (deviceName) => {
    setPairingDevice(deviceName);
    setSyncLogs(prev => [`[${new Date().toLocaleTimeString()}] 正在尝试与局域网设备 "${deviceName}" 握手连接...`]);
    
    // Simulate connection delay
    setTimeout(() => {
      syncService.setPaired(deviceName);
      setSyncState(syncService.getSyncStatus());
      setPairingDevice(null);
      setSyncLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ✅ 局域网配对连接成功！已信任设备：${deviceName}`,
        `[${new Date().toLocaleTimeString()}] 提示：当前已支持增量时间戳 LWW (Last-Write-Wins) 合并。`
      ]);
    }, 1500);
  };

  const handleDisconnect = () => {
    syncService.disconnect();
    setSyncState(syncService.getSyncStatus());
    setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 📴 已断开与移动端的配对。`]);
  };

  const handleRunSyncSimulation = async () => {
    if (!syncState.isPaired) return;
    
    setSyncLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] 🔄 开始局域网双向同步交易合并...`]);
    
    // Generate remote updates based on current local subscriptions
    const mockRemoteRecords = syncService.generateMockRemoteData(selectedScenario, subscriptions);
    
    setSyncLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] 获取到手机端推送账单数: ${mockRemoteRecords.length} 条`
    ]);

    // Run merge algorithm
    setTimeout(async () => {
      const result = await syncService.mergeRecords(mockRemoteRecords);
      
      // Update parent list
      await onSyncCompleted();

      setSyncLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 💻 合并远端已修改/新增入库: ${result.mergedCount} 条记录`,
        `[${new Date().toLocaleTimeString()}] 📱 推送本地较新修改至手机端: ${result.localUpdatesToSend.length} 条记录`,
        `[${new Date().toLocaleTimeString()}] 🎉 同步合并圆满完成，本地数据库已刷新！`
      ]);
    }, 1200);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", maxWidth: "720px", margin: "0 auto" }}>
      
      {/* 偏好设置 Preference Settings */}
      <section className="glass-card">
        <h3 style={sectionTitleStyle}>偏好设置</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Theme Toggle */}
          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>外观主题</div>
              <div style={settingDescStyle}>选择界面的深色或浅色外观</div>
            </div>
            <button
              onClick={toggleTheme}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--border-radius-md)",
                color: "var(--color-paper)",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "13px",
                transition: "var(--transition-smooth)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-border-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            >
              {settings.theme === "dark" ? (
                <>
                  <Moon size={15} style={{ color: "var(--color-copper)" }} /> 深色模式
                </>
              ) : (
                <>
                  <Sun size={15} style={{ color: "var(--color-copper)" }} /> 浅色模式
                </>
              )}
            </button>
          </div>

          {/* Primary Currency */}
          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>主结算货币</div>
              <div style={settingDescStyle}>仪表盘及统计报表默认使用的展示货币</div>
            </div>
            <select
              value={settings.primaryCurrency}
              onChange={handleCurrencyChange}
              style={selectStyle}
            >
              {currencyService.getSupportedCurrencies().map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.name} ({cur.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Notification Threshold */}
          <div style={settingRowStyle}>
            <div>
              <div style={settingLabelStyle}>提前提醒时间</div>
              <div style={settingDescStyle}>订阅扣款日前多少天在应用内和系统发送通知</div>
            </div>
            <select
              value={settings.reminderDays}
              onChange={handleReminderChange}
              style={selectStyle}
            >
              <option value={1}>1 天前</option>
              <option value={2}>2 天前</option>
              <option value={3}>3 天前</option>
              <option value={5}>5 天前</option>
              <option value={7}>7 天前</option>
            </select>
          </div>
        </div>
      </section>

      {/* 设备局域网同步 LAN Sync Panel (New Feature) */}
      <section className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: 0 }}>移动端 ⇄ PC端 局域网同步</h3>
          <span style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            padding: "3px 8px",
            borderRadius: "5px",
            backgroundColor: syncState.isPaired ? "var(--color-sage-dim)" : "var(--color-copper-dim)",
            color: syncState.isPaired ? "var(--color-sage)" : "var(--color-copper)",
            border: `1px solid ${syncState.isPaired ? "rgba(111, 162, 135, 0.3)" : "rgba(217, 133, 43, 0.3)"}`
          }}>
            {syncState.isPaired ? "🟢 已联通" : "🟡 未配对"}
          </span>
        </div>

        <p style={settingDescStyle}>
          在无广告和隐私红线下，Subdue 采用局域网同步协议。无需公网服务器，只需在同一 Wi-Fi 下扫描二维码，即可完成手机端（主记账器）向 PC/Mac 端（大屏查看器）的数据双向安全合并。
        </p>

        {!syncState.isPaired ? (
          /* Unpaired State */
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 2fr",
            gap: "24px",
            backgroundColor: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--border-radius-lg)",
            padding: "20px"
          }}>
            {/* QR Mock code */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#FFF",
              padding: "16px",
              borderRadius: "var(--border-radius-md)",
              aspectRatio: "1",
              maxWidth: "140px",
              margin: "0 auto"
            }}>
              {/* Styled Mock QR Code */}
              <div style={{
                width: "100%",
                height: "100%",
                backgroundImage: `radial-gradient(#111 25%, transparent 25%), radial-gradient(#111 25%, transparent 25%)`,
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 4px 4px",
                position: "relative"
              }}>
                {/* QR eye corners */}
                <div style={{ position: "absolute", top: 0, left: 0, width: "24px", height: "24px", border: "4px solid #111" }} />
                <div style={{ position: "absolute", top: 0, right: 0, width: "24px", height: "24px", border: "4px solid #111" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, width: "24px", height: "24px", border: "4px solid #111" }} />
              </div>
            </div>

            {/* Verification code and connection actions */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", color: "var(--color-muted)", textTransform: "uppercase" }}>局域网配对码</div>
                <div style={{
                  fontSize: "26px",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  color: "var(--color-copper)",
                  letterSpacing: "4px"
                }}>
                  {syncState.pairingCode}
                </div>
              </div>

              <div>
                <div style={{ fontSize: "11px", color: "var(--color-muted)", marginBottom: "6px" }}>测试连接模拟设备：</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {MOCK_DEVICES.map(dev => (
                    <button
                      key={dev.id}
                      onClick={() => handleConnectMockDevice(dev.name)}
                      disabled={pairingDevice !== null}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "var(--color-ink)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--border-radius-sm)",
                        color: "var(--color-paper)",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        transition: "var(--transition-smooth)",
                      }}
                      onMouseEnter={(e) => { if (pairingDevice === null) e.currentTarget.style.borderColor = "var(--color-border-hover)"; }}
                      onMouseLeave={(e) => { if (pairingDevice === null) e.currentTarget.style.borderColor = "var(--color-border)"; }}
                    >
                      📱 {pairingDevice === dev.name ? "配对中..." : dev.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Paired State */
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--border-radius-md)",
              padding: "12px 18px"
            }}>
              <span style={{ fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Smartphone size={16} style={{ color: "var(--color-sage)" }} />
                已连通设备：<strong>{syncState.pairedDevice}</strong>
              </span>
              <button
                onClick={handleDisconnect}
                style={{
                  padding: "5px 10px",
                  background: "none",
                  border: "1px solid var(--color-rust-dim)",
                  borderRadius: "var(--border-radius-sm)",
                  color: "var(--color-rust)",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                断开配对
              </button>
            </div>

            {/* Sync Simulation Controls */}
            <div style={{
              border: "1px dashed var(--color-border)",
              borderRadius: "var(--border-radius-lg)",
              padding: "18px",
              display: "flex",
              flexDirection: "column",
              gap: "14px"
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-paper)" }}>
                ⚡ 局域网双向合并同步模拟测试 (Option 1)
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <label style={{ fontSize: "12.5px", color: "var(--color-muted)" }}>模拟手机端发生的变更场景：</label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "var(--color-ink)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--border-radius-sm)",
                    color: "var(--color-paper)",
                    fontSize: "12.5px"
                  }}
                >
                  <option value="added">手机端新增了订阅 (YouTube Premium)</option>
                  <option value="modified">手机端修改了价格 (ChatGPT 变为 $25)</option>
                  <option value="deleted">手机端删除了订阅 (Netflix)</option>
                  <option value="both">全混合变更同步 (包含上述新增、修改和删除)</option>
                </select>
              </div>

              <button
                onClick={handleRunSyncSimulation}
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  backgroundColor: "var(--color-copper)",
                  color: "var(--color-ink)",
                  border: "none",
                  borderRadius: "var(--border-radius-md)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "13px",
                  transition: "var(--transition-smooth)"
                }}
              >
                <Wifi size={14} /> 触发模拟同步合并
              </button>
            </div>
          </div>
        )}

        {/* Sync logs terminal view */}
        {syncLogs.length > 0 && (
          <div style={{
            backgroundColor: "rgba(0,0,0,0.3)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--border-radius-md)",
            padding: "12px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--color-muted)",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            maxHeight: "130px",
            overflowY: "auto"
          }}>
            {syncLogs.map((log, i) => (
              <div key={i} style={log.includes("✅") || log.includes("🎉") ? { color: "var(--color-sage)" } : {}}>{log}</div>
            ))}
          </div>
        )}
      </section>

      {/* 实时汇率 Exchange Rates */}
      <section className="glass-card">
        <h3 style={sectionTitleStyle}>汇率同步</h3>
        <div style={settingRowStyle}>
          <div>
            <div style={settingLabelStyle}>汇率数据来源</div>
            <div style={settingDescStyle}>
              {rateStatus.isDefault ? (
                <span style={{ color: "var(--color-rust)" }}>使用本地默认初始值（未联网）</span>
              ) : (
                <span>
                  上次更新时间：
                  <strong style={{ color: "var(--color-sage)" }}>
                    {new Date(rateStatus.lastUpdated).toLocaleString()}
                  </strong>
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleSyncRates}
            disabled={syncing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              backgroundColor: "var(--color-surface-2)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--border-radius-md)",
              color: "var(--color-paper)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "var(--transition-smooth)",
              opacity: syncing ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!syncing) e.currentTarget.style.borderColor = "var(--color-border-hover)";
            }}
            onMouseLeave={(e) => {
              if (!syncing) e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          >
            <RefreshCw size={14} className={syncing ? "spin" : ""} style={syncing ? { animation: "spin 1s linear infinite" } : {}} />
            {syncing ? "同步中..." : "立即同步"}
          </button>
        </div>
      </section>

      {/* 数据管理 Data Management */}
      <section className="glass-card">
        <h3 style={sectionTitleStyle}>数据备份与安全</h3>
        <p style={{ ...settingDescStyle, marginBottom: "20px" }}>
          Subdue 承诺保护您的隐私，所有订阅账单数据均<strong>仅保存在您的本地浏览器（IndexedDB）中</strong>，我们绝不会上传任何信息到云端。请定期备份您的数据以防意外丢失。
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* Export */}
          <button onClick={onExportData} style={actionButtonStyle}>
            <Download size={15} /> 导出备份 (JSON)
          </button>

          {/* Import */}
          <button onClick={triggerFileInput} style={actionButtonStyle}>
            <Upload size={15} /> 导入数据 (JSON)
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: "none" }}
          />

          {/* CSV Import */}
          <button onClick={triggerCSVFileInput} style={actionButtonStyle}>
            <Upload size={15} /> 导入账单 (CSV)
          </button>
          <input
            type="file"
            ref={csvFileInputRef}
            onChange={handleCSVFileChange}
            accept=".csv"
            style={{ display: "none" }}
          />

          {/* Reset */}
          <button
            onClick={() => {
              if (confirm("⚠️ 危险操作！\n确定要清空并重置所有订阅数据和系统设置吗？此操作不可撤销！")) {
                onResetData();
              }
            }}
            style={{ ...actionButtonStyle, color: "var(--color-rust)", borderColor: "var(--color-rust-dim)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-rust-dim)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <Trash2 size={15} /> 清空重置数据库
          </button>
        </div>
      </section>

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0, color: "var(--color-paper)", fontSize: "16px", fontWeight: "bold" }}>
                📊 CSV 账单智能导入助手
              </h3>
              <button 
                onClick={() => setShowCSVModal(false)} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: "var(--color-muted)", 
                  fontSize: "20px", 
                  cursor: "pointer",
                  lineHeight: 1
                }}
              >
                &times;
              </button>
            </div>
            
            <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
              系统已自动分析账单中的交易记录，并智能识别出以下 <strong>{csvCandidates.length}</strong> 笔潜在的周期性订阅服务。请勾选并确认要导入的账单：
            </p>

            <div style={modalScrollAreaStyle}>
              {csvCandidates.map((candidate, idx) => (
                <div key={idx} style={candidateCardStyle(candidate.checked)}>
                  <input
                    type="checkbox"
                    checked={candidate.checked}
                    onChange={() => toggleCandidate(idx)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", marginTop: "4px" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <input
                        type="text"
                        value={candidate.name}
                        onChange={(e) => updateCandidateField(idx, "name", e.target.value)}
                        style={inlineInputStyle}
                      />
                      <span style={confidenceBadgeStyle(candidate.confidence)}>
                        {Math.round(candidate.confidence * 100)}% 置信度
                      </span>
                    </div>
                    <div style={candidateMetaRowStyle}>
                      <span>周期：</span>
                      <select
                        value={candidate.cycle}
                        onChange={(e) => updateCandidateField(idx, "cycle", e.target.value)}
                        style={inlineSelectStyle}
                      >
                        <option value="周">周付</option>
                        <option value="月">月付</option>
                        <option value="季">季付</option>
                        <option value="年">年付</option>
                      </select>

                      <span style={{ marginLeft: "8px" }}>金额：</span>
                      <input
                        type="number"
                        value={candidate.amount}
                        onChange={(e) => updateCandidateField(idx, "amount", Number(e.target.value))}
                        style={{ ...inlineInputStyle, width: "65px" }}
                      />

                      <select
                        value={candidate.currency}
                        onChange={(e) => updateCandidateField(idx, "currency", e.target.value)}
                        style={inlineSelectStyle}
                      >
                        <option value="CNY">CNY</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="HKD">HKD</option>
                      </select>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-muted)", marginTop: "8px", opacity: 0.8 }}>
                      💡 识别依据：{candidate.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={modalFooterStyle}>
              <button 
                onClick={() => setShowCSVModal(false)} 
                style={{ ...cancelButtonStyle, padding: "8px 16px" }}
              >
                取消
              </button>
              <button 
                onClick={handleConfirmCSVImport} 
                style={{ 
                  ...actionButtonStyle, 
                  backgroundColor: "var(--color-copper, #F5A623)", 
                  color: "#07090F",
                  border: "none",
                  padding: "8px 20px"
                }}
              >
                确认导入选中项 ({csvCandidates.filter(c => c.checked).length} 笔)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modal styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(7, 9, 15, 0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  backdropFilter: "blur(6px)",
  padding: "20px"
};

const modalContentStyle = {
  backgroundColor: "var(--color-surface-1, #0D1018)",
  border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
  borderRadius: "16px",
  width: "100%",
  maxWidth: "600px",
  maxHeight: "80vh",
  display: "flex",
  flexDirection: "column",
  padding: "24px",
  color: "var(--color-paper, #E2E6EF)",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
  boxSizing: "border-box"
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  paddingBottom: "14px",
  marginBottom: "16px"
};

const modalScrollAreaStyle = {
  overflowY: "auto",
  flex: 1,
  paddingRight: "6px",
  gap: "12px",
  display: "flex",
  flexDirection: "column",
  marginBottom: "8px"
};

const candidateCardStyle = (checked) => ({
  backgroundColor: checked ? "rgba(245, 166, 35, 0.03)" : "rgba(255,255,255,0.01)",
  border: checked ? "1px solid var(--color-copper, #F5A623)" : "1px solid var(--color-border, rgba(255,255,255,0.06))",
  borderRadius: "12px",
  padding: "16px",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "flex-start",
  gap: "14px",
  boxSizing: "border-box"
});

const inlineInputStyle = {
  backgroundColor: "transparent",
  border: "none",
  borderBottom: "1px dashed rgba(255,255,255,0.2)",
  color: "var(--color-paper, #E2E6EF)",
  fontSize: "14px",
  fontWeight: "700",
  padding: "2px 4px",
  outline: "none",
  width: "180px"
};

const inlineSelectStyle = {
  backgroundColor: "var(--color-surface-2, #111520)",
  border: "1px solid var(--color-border, rgba(255,255,255,0.08))",
  color: "var(--color-muted, #8B93A1)",
  fontSize: "12px",
  borderRadius: "6px",
  padding: "2px 6px",
  cursor: "pointer",
  outline: "none"
};

const confidenceBadgeStyle = (conf) => {
  const isHigh = conf > 0.8;
  const isMed = conf > 0.5;
  return {
    backgroundColor: isHigh ? "rgba(46, 213, 115, 0.15)" : isMed ? "rgba(245, 166, 35, 0.15)" : "rgba(139, 147, 161, 0.15)",
    color: isHigh ? "#2ED573" : isMed ? "#F5A623" : "#8B93A1",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 10px",
    borderRadius: "12px",
    border: `1px solid ${isHigh ? "rgba(46, 213, 115, 0.2)" : isMed ? "rgba(245, 166, 35, 0.2)" : "rgba(139, 147, 161, 0.2)"}`
  };
};

const candidateMetaRowStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: "12px",
  color: "var(--color-muted, #8B93A1)",
  marginTop: "10px",
  flexWrap: "wrap",
  gap: "8px"
};

const modalFooterStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  borderTop: "1px solid rgba(255,255,255,0.06)",
  paddingTop: "16px",
  marginTop: "16px"
};

const cancelButtonStyle = {
  backgroundColor: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--border-radius-md)",
  color: "var(--color-paper)",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  transition: "var(--transition-smooth)",
  padding: "8px 16px"
};


const sectionTitleStyle = {
  fontSize: "16px",
  fontWeight: 700,
  marginBottom: "20px",
  color: "var(--color-paper)",
  borderLeft: "3px solid var(--color-copper)",
  paddingLeft: "10px",
};

const settingRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  flexWrap: "wrap",
};

const settingLabelStyle = {
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--color-paper)",
  marginBottom: "4px",
};

const settingDescStyle = {
  fontSize: "13px",
  color: "var(--color-muted)",
  lineHeight: 1.5,
};

const selectStyle = {
  padding: "9px 12px",
  backgroundColor: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--border-radius-md)",
  color: "var(--color-paper)",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  transition: "var(--transition-smooth)",
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%238B93A1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  backgroundSize: "14px",
  paddingRight: "30px",
  minWidth: "120px",
};

const actionButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 16px",
  backgroundColor: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--border-radius-md)",
  color: "var(--color-paper)",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 600,
  transition: "var(--transition-smooth)",
};
