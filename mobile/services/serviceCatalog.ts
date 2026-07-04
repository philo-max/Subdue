// Extensive catalogue of common global and local subscriptions for Mobile
export interface CatalogItem {
  name: string;
  amount: number;
  currency: string;
  cycle: string;
  category: string;
  desc?: string;
}

export const SERVICE_CATALOG: CatalogItem[] = [
  // Streaming (流媒体)
  { name: "Netflix", amount: 35, currency: "CNY", cycle: "月", category: "流媒体", desc: "全球热门流媒体影视平台" },
  { name: "Spotify", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "正版数字音乐流媒体服务" },
  { name: "Disney+", amount: 28, currency: "CNY", cycle: "月", category: "流媒体", desc: "迪士尼专属流媒体平台" },
  { name: "YouTube Premium", amount: 18, currency: "CNY", cycle: "月", category: "流媒体", desc: "无广告YouTube及背景播放" },
  { name: "Apple Music", amount: 10, currency: "CNY", cycle: "月", category: "流媒体", desc: "苹果音乐流媒体服务" },
  { name: "Amazon Prime Video", amount: 45, currency: "CNY", cycle: "月", category: "流媒体", desc: "亚马逊黄金会员影视" },
  { name: "HBO Max", amount: 70, currency: "CNY", cycle: "月", category: "流媒体", desc: "华纳兄弟探索流媒体" },
  { name: "Hulu", amount: 55, currency: "CNY", cycle: "月", category: "流媒体", desc: "美国流媒体视频播放平台" },
  { name: "Paramount+", amount: 40, currency: "CNY", cycle: "月", category: "流媒体", desc: "派拉蒙流媒体影视" },
  { name: "Apple TV+", amount: 35, currency: "CNY", cycle: "月", category: "流媒体", desc: "苹果原创造影剧平台" },
  { name: "爱奇艺 黄金VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体", desc: "爱奇艺黄金会员" },
  { name: "腾讯视频 VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体", desc: "腾讯视频尊享会员" },
  { name: "优酷 VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体", desc: "优酷视频尊贵会员" },
  { name: "B站大会员", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "哔哩哔哩高级会员" },
  { name: "网易云音乐 黑胶", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "网易云黑胶VIP特权" },
  { name: "QQ音乐 绿钻豪华版", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "QQ音乐专属特权及高无损音乐" },

  // AI & Developer Tools (AI工具 / 开发者工具)
  { name: "ChatGPT Plus", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "OpenAI GPT-4尊享服务" },
  { name: "Claude Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "Anthropic Claude 高级智能体验" },
  { name: "GitHub Copilot", amount: 10, currency: "USD", cycle: "月", category: "AI工具", desc: "AI辅助编程助手" },
  { name: "Midjourney Pro", amount: 30, currency: "USD", cycle: "月", category: "AI工具", desc: "AI高画质图片生成平台" },
  { name: "Cursor Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "AI原生下一代编程编辑器" },
  { name: "Perplexity Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "AI实时对话搜索引擎" },
  { name: "DeepL Pro", amount: 8.74, currency: "EUR", cycle: "月", category: "AI工具", desc: "高精度AI智能翻译引擎" },
  { name: "JetBrains All Products Pack", amount: 28.9, currency: "USD", cycle: "月", category: "设计工具", desc: "JetBrains全套IDE开发工具" },

  // Cloud Storage (云存储)
  { name: "iCloud+ 50GB", amount: 6, currency: "CNY", cycle: "月", category: "云存储", desc: "苹果云存储50GB" },
  { name: "iCloud+ 200GB", amount: 21, currency: "CNY", cycle: "月", category: "云存储", desc: "苹果云存储200GB" },
  { name: "iCloud+ 2TB", amount: 68, currency: "CNY", cycle: "月", category: "云存储", desc: "苹果云存储2TB" },
  { name: "Google One 100GB", amount: 15, currency: "CNY", cycle: "月", category: "云存储", desc: "谷歌云端盘100GB" },
  { name: "Google One 2TB", amount: 68, currency: "CNY", cycle: "月", category: "云存储", desc: "谷歌云端盘2TB" },
  { name: "Dropbox Plus", amount: 119.88, currency: "USD", cycle: "年", category: "云存储", desc: "跨平台老牌同步网盘" },
  { name: "百度网盘 超级会员", amount: 30, currency: "CNY", cycle: "月", category: "云存储", desc: "极速下载及网盘空间" },
  { name: "阿里云盘 超级会员", amount: 20, currency: "CNY", cycle: "月", category: "云存储", desc: "大容量高速网盘" },

  // Productivity (生产力)
  { name: "Microsoft 365 个人版", amount: 398, currency: "CNY", cycle: "年", category: "生产力", desc: "微软Office办公全家桶" },
  { name: "Microsoft 365 家庭版", amount: 498, currency: "CNY", cycle: "年", category: "生产力", desc: "Office家庭版尊享" },
  { name: "Notion Plus", amount: 10, currency: "USD", cycle: "月", category: "生产力", desc: "多合一工作空间" },
  { name: "1Password 个人版", amount: 25, currency: "CNY", cycle: "月", category: "生产力", desc: "安全跨平台密码管理器" },
  { name: "TickTick Pro (滴答清单)", amount: 15, currency: "CNY", cycle: "月", category: "生产力", desc: "时间规划与Todo" },
  { name: "微信读书 无限卡", amount: 19, currency: "CNY", cycle: "月", category: "生产力", desc: "无限卡畅读会员" },

  // Shopping & Lifestyle (购物与生活)
  { name: "淘宝 88VIP", amount: 88, currency: "CNY", cycle: "年", category: "购物会员", desc: "阿里多重消费权益包" },
  { name: "京东 PLUS 会员", amount: 99, currency: "CNY", cycle: "年", category: "购物会员", desc: "免邮券及专享折扣" },
  { name: "盒马 X 会员", amount: 258, currency: "CNY", cycle: "年", category: "购物会员", desc: "盒马门店88折" },
  { name: "美团 神会员", amount: 15, currency: "CNY", cycle: "月", category: "购物会员", desc: "外卖大额无门槛红包" },
  { name: "山姆 会员卡", amount: 260, currency: "CNY", cycle: "年", category: "购物会员", desc: "山姆会员商店购物特权" },

  // Gaming (游戏)
  { name: "Nintendo Switch Online", amount: 155, currency: "HKD", cycle: "年", category: "其他", desc: "任天堂联机服务" },
  { name: "PlayStation Plus Essential", amount: 428, currency: "HKD", cycle: "年", category: "其他", desc: "索尼联机及免费游戏" },
  { name: "Xbox Game Pass Ultimate", amount: 119, currency: "HKD", cycle: "月", category: "其他", desc: "微软海量游戏库(XGP)" }
];

export const CATEGORIES = ["流媒体", "软件服务", "AI工具", "日常打卡", "其他"];
export const CURRENCIES = ["CNY", "USD", "HKD", "EUR", "JPY"];
export const CYCLES = ["周", "月", "季", "年"];
