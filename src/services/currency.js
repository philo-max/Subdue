const RATES_CACHE_KEY = "subdue_exchange_rates";

// Hardcoded baseline exchange rates (relative to 1 CNY)
// As of June 2026 typical values
const BASELINE_RATES = {
  CNY: 1.0,
  USD: 0.1378, // ~7.25 CNY per USD
  EUR: 0.1285, // ~7.78 CNY per EUR
  JPY: 21.84,  // ~0.0458 CNY per JPY (approx 100 JPY = 4.58 CNY)
};

const getCachedRates = () => {
  try {
    const saved = localStorage.getItem(RATES_CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate structure
      if (parsed && parsed.rates && parsed.rates.CNY) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read exchange rate cache", e);
  }
  return {
    rates: BASELINE_RATES,
    lastUpdated: null, // Indicates using default local values
    isDefault: true,
  };
};

export const currencyService = {
  // Sync rates from API
  syncRates: async () => {
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/CNY");
      if (!response.ok) throw new Error("Network response was not OK");
      
      const data = await response.json();
      if (data && data.result === "success" && data.rates) {
        const ratesData = {
          rates: {
            CNY: 1.0,
            USD: data.rates.USD || BASELINE_RATES.USD,
            EUR: data.rates.EUR || BASELINE_RATES.EUR,
            JPY: data.rates.JPY || BASELINE_RATES.JPY,
          },
          lastUpdated: new Date().toISOString(),
          isDefault: false,
        };
        localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(ratesData));
        return ratesData;
      }
    } catch (e) {
      console.warn("Failed to fetch live exchange rates, falling back to cache/default:", e.message);
    }
    return getCachedRates();
  },

  // Convert amount between currencies
  // pivot is CNY (rates are stored relative to 1 CNY)
  convert: (amount, fromCurrency, toCurrency) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) return 0;
    if (fromCurrency === toCurrency) return numAmount;

    const cache = getCachedRates();
    const rates = cache.rates;

    const fromRate = rates[fromCurrency] || BASELINE_RATES[fromCurrency] || 1;
    const toRate = rates[toCurrency] || BASELINE_RATES[toCurrency] || 1;

    // 1. Convert source currency to CNY
    const amountInCNY = numAmount / fromRate;
    
    // 2. Convert CNY to target currency
    const finalAmount = amountInCNY * toRate;
    
    return finalAmount;
  },

  // Format currency with appropriate symbol
  format: (amount, currencyCode) => {
    const symbols = {
      CNY: "¥",
      USD: "$",
      EUR: "€",
      JPY: "¥",
    };
    const symbol = symbols[currencyCode] || "";
    
    // For JPY, display without decimal places by default
    const fractionDigits = currencyCode === "JPY" ? 0 : 2;
    
    return `${symbol}${Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`;
  },

  // Get status metadata of exchange rates
  getRatesStatus: () => {
    const cache = getCachedRates();
    return {
      lastUpdated: cache.lastUpdated,
      isDefault: cache.isDefault,
    };
  },
  
  // List supported currencies
  getSupportedCurrencies: () => {
    return [
      { code: "CNY", name: "人民币 (CNY)", symbol: "¥" },
      { code: "USD", name: "美元 (USD)", symbol: "$" },
      { code: "EUR", name: "欧元 (EUR)", symbol: "€" },
      { code: "JPY", name: "日元 (JPY)", symbol: "¥" },
    ];
  }
};
