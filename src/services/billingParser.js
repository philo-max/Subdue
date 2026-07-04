import { calculateNextBilling } from "./billingCalculator.js";

// Catalog keywords map for fuzzy matching
const SERVICE_KEYWORDS = {
  netflix: { name: "Netflix", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  spotify: { name: "Spotify", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  disney: { name: "Disney+", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  youtube: { name: "YouTube Premium", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  icloud: { name: "iCloud+ 200GB", category: "云存储", defaultCycle: "月", defaultCurrency: "CNY" },
  google: { name: "Google One", category: "云存储", defaultCycle: "月", defaultCurrency: "CNY" },
  dropbox: { name: "Dropbox Plus", category: "云存储", defaultCycle: "年", defaultCurrency: "CNY" },
  chatgpt: { name: "ChatGPT Plus", category: "AI工具", defaultCycle: "月", defaultCurrency: "USD" },
  claude: { name: "Claude Pro", category: "AI工具", defaultCycle: "月", defaultCurrency: "USD" },
  copilot: { name: "GitHub Copilot", category: "AI工具", defaultCycle: "月", defaultCurrency: "USD" },
  midjourney: { name: "Midjourney", category: "AI工具", defaultCycle: "月", defaultCurrency: "USD" },
  notion: { name: "Notion Plus", category: "生产力", defaultCycle: "月", defaultCurrency: "USD" },
  office: { name: "Microsoft 365", category: "生产力", defaultCycle: "年", defaultCurrency: "CNY" },
  adobe: { name: "Adobe Creative Cloud", category: "设计工具", defaultCycle: "月", defaultCurrency: "CNY" },
  "1password": { name: "1Password", category: "生产力", defaultCycle: "月", defaultCurrency: "CNY" },
  keep: { name: "Keep 会员", category: "健身", defaultCycle: "月", defaultCurrency: "CNY" },
  iqiyi: { name: "爱奇艺 VIP", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  爱奇艺: { name: "爱奇艺 VIP", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  腾讯视频: { name: "腾讯视频 VIP", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  优酷: { name: "优酷 VIP", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  bilibili: { name: "B站大会员", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  b站: { name: "B站大会员", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  网易云: { name: "网易云音乐 黑胶", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  qq音乐: { name: "QQ音乐 绿钻", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" },
  微信读书: { name: "微信读书 无限卡", category: "生产力", defaultCycle: "月", defaultCurrency: "CNY" },
  淘宝: { name: "淘宝 88VIP", category: "购物会员", defaultCycle: "年", defaultCurrency: "CNY" },
  京东: { name: "京东 PLUS", category: "购物会员", defaultCycle: "年", defaultCurrency: "CNY" },
  盒马: { name: "盒马 X 会员", category: "购物会员", defaultCycle: "年", defaultCurrency: "CNY" },
  美团: { name: "美团外卖 神会员", category: "购物会员", defaultCycle: "月", defaultCurrency: "CNY" },
  switch: { name: "Nintendo Switch Online", category: "流媒体", defaultCycle: "年", defaultCurrency: "CNY" },
  playstation: { name: "PlayStation Plus", category: "流媒体", defaultCycle: "年", defaultCurrency: "CNY" },
  xbox: { name: "Xbox Game Pass Ultimate", category: "流媒体", defaultCycle: "月", defaultCurrency: "CNY" }
};

/**
 * Heuristic parsing of transaction logs / bank SMS / email receipt texts.
 * 
 * @param {string} text - Input plain text
 * @returns {Object|null} Extracted fields or null if parsing fails
 */
export function parseBillingText(text) {
  if (!text || text.trim() === "") return null;

  const normalizedText = text.toLowerCase();
  let name = "";
  let category = "其他";
  let cycle = "月";
  let currency = "CNY";
  let amount = "";
  let firstBilledAt = new Date().toISOString().split("T")[0];

  // 1. Service Identification (Fuzzy Catalogue Match)
  let foundMatch = false;
  for (const [key, meta] of Object.entries(SERVICE_KEYWORDS)) {
    if (normalizedText.includes(key)) {
      name = meta.name;
      category = meta.category;
      cycle = meta.defaultCycle;
      currency = meta.defaultCurrency;
      foundMatch = true;
      break;
    }
  }

  // If no catalogue match, try to guess name from brackets or keywords
  if (!name) {
    const nameMatch = text.match(/【([^】]+)】/) || text.match(/\[([^\]]+)\]/) || text.match(/(?:商户|向)\s*([a-zA-Z0-9\u4e00-\u9fa5\s]+?)\s*(?:付款|支出|完成)/);
    if (nameMatch) {
      name = nameMatch[1].trim();
    } else {
      name = "自定义服务";
    }
  }

  // 2. Amount Extraction
  // Look for currency indicators followed/preceded by numbers
  // Matches: ¥35.00, $20, 145.00元, 10 USD, 金额15元
  const amountRegexes = [
    /[¥$€]\s*(\d+(?:\.\d+)?)/,                // ¥35 or $20.00
    /(\d+(?:\.\d+)?)\s*(?:元|港币|美元|欧元)/, // 145.00元
    /(?:金额|付款|交易)\s*(\d+(?:\.\d+)?)/,      // 金额15
    /(\d+(?:\.\d+)?)\s*(?:usd|eur|jpy|cny)/,   // 10 usd
    /(\d+(?:\.\d+)?)/                          // Any raw number fallback
  ];

  for (const regex of amountRegexes) {
    const match = normalizedText.match(regex);
    if (match && match[1]) {
      amount = parseFloat(match[1]);
      if (!isNaN(amount) && amount > 0) {
        break;
      }
    }
  }

  // 3. Currency Guessing
  if (normalizedText.includes("$") || normalizedText.includes("usd") || normalizedText.includes("美元")) {
    currency = "USD";
  } else if (normalizedText.includes("€") || normalizedText.includes("eur") || normalizedText.includes("欧元")) {
    currency = "EUR";
  } else if (normalizedText.includes("日元") || normalizedText.includes("jpy") || normalizedText.includes("円")) {
    currency = "JPY";
  } else if (normalizedText.includes("¥") || normalizedText.includes("cny") || normalizedText.includes("元") || normalizedText.includes("人民币")) {
    currency = "CNY";
  }

  // 4. Date Extraction
  // Matches: 2026-06-19, 2026年06月19日, 06月19日, 06-19, etc.
  const fullDateMatch = text.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
  if (fullDateMatch) {
    const y = fullDateMatch[1];
    const m = String(fullDateMatch[2]).padStart(2, "0");
    const d = String(fullDateMatch[3]).padStart(2, "0");
    firstBilledAt = `${y}-${m}-${d}`;
  } else {
    // Try to match partial date like "06月19日" or "06-19" and append current year
    const partialDateMatch = text.match(/(\d{1,2})[-/月](\d{1,2})/);
    if (partialDateMatch) {
      const currentYear = new Date().getFullYear();
      const m = String(partialDateMatch[1]).padStart(2, "0");
      const d = String(partialDateMatch[2]).padStart(2, "0");
      firstBilledAt = `${currentYear}-${m}-${d}`;
    }
  }

  return {
    name,
    amount,
    currency,
    cycle,
    category,
    firstBilledAt,
    notes: `由智能文本感应解析录入。解析原文："${text.length > 30 ? text.substring(0, 30) + "..." : text}"`
  };
}

/**
 * Parses raw CSV text into a 2D array of strings.
 * Respects double quotes and commas inside quotes.
 * 
 * @param {string} csvText 
 * @returns {Array<Array<string>>}
 */
export function parseCSV(csvText) {
  const result = [];
  if (!csvText) return result;
  
  const lines = csvText.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const row = [];
    let inQuotes = false;
    let field = "";
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        row.push(field.trim().replace(/^"|"$/g, ''));
        field = "";
      } else {
        field += char;
      }
    }
    row.push(field.trim().replace(/^"|"$/g, ''));
    result.push(row);
  }
  return result;
}

/**
 * Analyzes CSV transactions, grouping them to detect recurring subscription candidates.
 * 
 * @param {string} csvText - Raw CSV content
 * @returns {Array<Object>} List of candidate subscriptions
 */
export function parseCSVBilling(csvText) {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  // 1. Identify columns from header candidates (checking first 12 rows)
  let headerRowIdx = -1;
  let dateIdx = -1;
  let descIdx = -1;
  let amountIdx = -1;
  let directionIdx = -1; // 支出/收入

  for (let i = 0; i < Math.min(rows.length, 12); i++) {
    const row = rows[i].map(c => c.toLowerCase());
    
    // Date column check
    const tempDateIdx = row.findIndex(c => c.includes("时间") || c.includes("日期") || c.includes("date") || c.includes("time"));
    // Description/Merchant column check
    const tempDescIdx = row.findIndex(c => c.includes("商品") || c.includes("对方") || c.includes("商户") || c.includes("描述") || c.includes("description") || c.includes("merchant") || c.includes("counterparty") || c.includes("name"));
    // Amount column check
    const tempAmountIdx = row.findIndex(c => c.includes("金额") || c.includes("amount") || c.includes("money") || c.includes("支出") || c.includes("value"));
    // Direction column check
    const tempDirectionIdx = row.findIndex(c => c.includes("收/支") || c.includes("方向") || c.includes("type") || c.includes("收支"));

    if (tempDateIdx !== -1 && tempAmountIdx !== -1) {
      dateIdx = tempDateIdx;
      descIdx = tempDescIdx !== -1 ? tempDescIdx : row.findIndex((_, idx) => idx !== tempDateIdx && idx !== tempAmountIdx);
      amountIdx = tempAmountIdx;
      directionIdx = tempDirectionIdx;
      headerRowIdx = i;
      break;
    }
  }

  // Fallbacks if header cannot be identified
  if (headerRowIdx === -1) {
    headerRowIdx = 0;
    dateIdx = 0;
    descIdx = 1;
    amountIdx = 2;
  }

  const transactions = [];

  // Parse transaction rows
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length <= Math.max(dateIdx, descIdx, amountIdx)) continue;

    const rawDate = row[dateIdx];
    const rawDesc = row[descIdx];
    const rawAmount = row[amountIdx];
    const rawDir = directionIdx !== -1 ? row[directionIdx] : "";

    // Filter out incomes (only process "支出", "debit", or negative amounts)
    if (rawDir && (rawDir.includes("收") || rawDir.toLowerCase().includes("income") || rawDir.toLowerCase().includes("credit"))) {
      continue;
    }

    // Parse date
    let dateStr = "";
    const dateMatch = rawDate.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/);
    if (dateMatch) {
      dateStr = `${dateMatch[1]}-${String(dateMatch[2]).padStart(2, "0")}-${String(dateMatch[3]).padStart(2, "0")}`;
    } else {
      const partialMatch = rawDate.match(/(\d{1,2})[-/月](\d{1,2})/);
      if (partialMatch) {
        dateStr = `${new Date().getFullYear()}-${String(partialMatch[1]).padStart(2, "0")}-${String(partialMatch[2]).padStart(2, "0")}`;
      } else {
        continue; // skip if date is completely unparseable
      }
    }

    // Parse amount
    // Remove currency symbols, commas, or "元"
    const cleanedAmountStr = rawAmount.replace(/[^\d.-]/g, "");
    let amount = parseFloat(cleanedAmountStr);
    if (isNaN(amount)) continue;
    amount = Math.abs(amount); // Ensure positive subscription amounts

    // Clean description/merchant name (remove transaction IDs, dates, numbers)
    let cleanDesc = rawDesc
      .replace(/\d{10,}/g, "") // Remove long transaction numbers
      .replace(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/g, "") // Remove dates inside desc
      .trim();

    if (cleanDesc.length === 0) {
      cleanDesc = rawDesc;
    }

    transactions.push({
      date: dateStr,
      description: cleanDesc,
      rawDescription: rawDesc,
      amount
    });
  }

  // 2. Group transactions by clean description/merchant
  const groups = {};
  transactions.forEach(tx => {
    // Simplify description to find repeating patterns
    let key = tx.description.toLowerCase();
    
    // Fuzzy consolidate: e.g. "netflix.com" and "netflix subscription" -> "netflix"
    for (const kw of Object.keys(SERVICE_KEYWORDS)) {
      if (key.includes(kw)) {
        key = kw;
        break;
      }
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(tx);
  });

  const candidates = [];

  // 3. Analyze each group for subscription patterns
  for (const [key, txList] of Object.entries(groups)) {
    // Sort transactions by date ascending
    txList.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate dates spacing (deltas in days)
    const deltas = [];
    for (let i = 1; i < txList.length; i++) {
      const d1 = new Date(txList[i - 1].date);
      const d2 = new Date(txList[i].date);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      deltas.push(diffDays);
    }

    // Determine cycle and confidence heuristics
    let detectedCycle = "月";
    let spacingMatch = false;

    if (deltas.length > 0) {
      // Find average delta
      const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      
      if (avgDelta >= 27 && avgDelta <= 33) {
        detectedCycle = "月";
        spacingMatch = true;
      } else if (avgDelta >= 6 && avgDelta <= 8) {
        detectedCycle = "周";
        spacingMatch = true;
      } else if (avgDelta >= 85 && avgDelta <= 95) {
        detectedCycle = "季";
        spacingMatch = true;
      } else if (avgDelta >= 355 && avgDelta <= 370) {
        detectedCycle = "年";
        spacingMatch = true;
      }
    }

    // Check catalog keyword match
    let catalogMatch = SERVICE_KEYWORDS[key] || null;
    if (!catalogMatch) {
      // Fuzzy search in SERVICE_KEYWORDS keys
      for (const [kw, meta] of Object.entries(SERVICE_KEYWORDS)) {
        if (key.includes(kw)) {
          catalogMatch = meta;
          break;
        }
      }
    }

    // Compute average amount
    const avgAmount = txList.reduce((sum, tx) => sum + tx.amount, 0) / txList.length;
    // Check amount stability (variance check)
    let amountStable = true;
    if (txList.length > 1) {
      const variance = txList.reduce((sum, tx) => sum + Math.pow(tx.amount - avgAmount, 2), 0) / txList.length;
      const stdDev = Math.sqrt(variance);
      if (stdDev / avgAmount > 0.15) { // If standard deviation is >15% of average amount, consider unstable
        amountStable = false;
      }
    }

    // Heuristics Scoring for Subscription Confidence
    let score = 0.1;
    let reasonParts = [];

    if (catalogMatch) {
      score += 0.45;
      reasonParts.push(`匹配已知服务库 [${catalogMatch.name}]`);
    } else {
      reasonParts.push("自定义商家");
    }

    if (txList.length >= 3) {
      score += 0.25;
      reasonParts.push(`发现多个交易记录 (${txList.length}次)`);
    } else if (txList.length === 2) {
      score += 0.15;
      reasonParts.push("发现 2 次交易记录");
    }

    if (spacingMatch) {
      score += 0.2;
      reasonParts.push(`符合周期性扣款规律 (${detectedCycle}付，间隔约 ${Math.round(deltas.reduce((a,b)=>a+b,0)/deltas.length)} 天)`);
    } else if (txList.length > 1) {
      reasonParts.push("间隔规律不明显");
    }

    if (amountStable && txList.length > 1) {
      score += 0.05;
      reasonParts.push("扣款金额稳定");
    }

    // Cap confidence
    const confidence = Math.min(0.98, Math.max(0.1, score));

    // Get final values
    const latestTx = txList[txList.length - 1];
    const firstTx = txList[0];
    const name = catalogMatch ? catalogMatch.name : (latestTx.description.charAt(0).toUpperCase() + latestTx.description.slice(1));
    const category = catalogMatch ? catalogMatch.category : "其他";
    const currency = catalogMatch ? catalogMatch.defaultCurrency : "CNY";

    candidates.push({
      name,
      amount: Math.round(latestTx.amount * 100) / 100, // round to 2 decimals
      currency,
      cycle: catalogMatch ? catalogMatch.defaultCycle : detectedCycle,
      category,
      firstBilledAt: latestTx.date, // Predict next billed date based on latest date
      confidence,
      reason: reasonParts.join("，"),
      occurrences: txList.length,
      history: txList.map(tx => ({ date: tx.date, amount: tx.amount }))
    });
  }

  // Sort candidates by confidence descending
  return candidates
    .filter(c => c.confidence >= 0.25)
    .sort((a, b) => b.confidence - a.confidence);
}

