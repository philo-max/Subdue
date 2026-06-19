import { calculateNextBilling } from "./billingCalculator";

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
