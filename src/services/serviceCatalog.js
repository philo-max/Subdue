// Extensive catalogue of common global and local subscriptions
export const SERVICE_CATALOG = [
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
  { name: "Apple TV+", amount: 35, currency: "CNY", cycle: "月", category: "流媒体", desc: "苹果原创影剧平台" },
  { name: "爱奇艺 黄金VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体", desc: "爱奇艺黄金会员" },
  { name: "腾讯视频 VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体", desc: "腾讯视频尊享会员" },
  { name: "优酷 VIP", amount: 25, currency: "CNY", cycle: "月", category: "流媒体", desc: "优酷视频尊贵会员" },
  { name: "芒果TV VIP", amount: 19, currency: "CNY", cycle: "月", category: "流媒体", desc: "芒果TV会员服务" },
  { name: "B站大会员", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "哔哩哔哩高级会员" },
  { name: "网易云音乐 黑胶", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "网易云黑胶VIP特权" },
  { name: "QQ音乐 绿钻豪华版", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "QQ音乐专属特权及高无损音乐" },
  { name: "喜马拉雅 VIP", amount: 20, currency: "CNY", cycle: "月", category: "流媒体", desc: "有声书及优质音频电台" },
  { name: "咪咕视频 VIP", amount: 15, currency: "CNY", cycle: "月", category: "流媒体", desc: "体育直播及咪咕影视会员" },

  // AI & Developer Tools (AI工具 / 开发者工具)
  { name: "ChatGPT Plus", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "OpenAI GPT-4尊享服务" },
  { name: "Claude Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "Anthropic Claude 高级智能体验" },
  { name: "GitHub Copilot", amount: 10, currency: "USD", cycle: "月", category: "AI工具", desc: "AI辅助编程助手" },
  { name: "Midjourney Pro", amount: 30, currency: "USD", cycle: "月", category: "AI工具", desc: "AI高画质图片生成平台" },
  { name: "Cursor Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "AI原生下一代编程编辑器" },
  { name: "Phind Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "面向开发者的AI搜索引擎" },
  { name: "v0.dev Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "Vercel生成式UI设计开发工具" },
  { name: "Vercel Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "现代化前端云托管平台专业版" },
  { name: "DeepL Pro", amount: 8.74, currency: "EUR", cycle: "月", category: "AI工具", desc: "高精度AI智能翻译引擎" },
  { name: "Perplexity Pro", amount: 20, currency: "USD", cycle: "月", category: "AI工具", desc: "AI实时对话搜索引擎" },
  { name: "Runway Gen-2", amount: 15, currency: "USD", cycle: "月", category: "AI工具", desc: "AI音视频创意生成平台" },
  { name: "Suno AI Pro", amount: 10, currency: "USD", cycle: "月", category: "AI工具", desc: "AI音乐创作平台" },
  { name: "ElevenLabs Starter", amount: 5, currency: "USD", cycle: "月", category: "AI工具", desc: "高保真AI语音生成与克隆" },
  { name: "JetBrains All Products Pack", amount: 28.9, currency: "USD", cycle: "月", category: "设计工具", desc: "JetBrains全套IDE开发工具" },
  { name: "Docker Pro", amount: 7, currency: "USD", cycle: "月", category: "AI工具", desc: "Docker容器高级开发者专享" },
  { name: "Netlify Pro", amount: 19, currency: "USD", cycle: "月", category: "AI工具", desc: "前端静态构建及Serverless部署" },

  // Cloud Storage (云存储)
  { name: "iCloud+ 50GB", amount: 6, currency: "CNY", cycle: "月", category: "云存储", desc: "苹果云存储50GB套餐" },
  { name: "iCloud+ 200GB", amount: 21, currency: "CNY", cycle: "月", category: "云存储", desc: "苹果云存储200GB套餐" },
  { name: "iCloud+ 2TB", amount: 68, currency: "CNY", cycle: "月", category: "云存储", desc: "苹果云存储2TB豪华套餐" },
  { name: "Google One 100GB", amount: 15, currency: "CNY", cycle: "月", category: "云存储", desc: "谷歌云端盘100GB空间" },
  { name: "Google One 200GB", amount: 20, currency: "CNY", cycle: "月", category: "云存储", desc: "谷歌云端盘200GB空间" },
  { name: "Google One 2TB", amount: 68, currency: "CNY", cycle: "月", category: "云存储", desc: "谷歌云端盘2TB海量空间" },
  { name: "Dropbox Plus", amount: 119.88, currency: "USD", cycle: "年", category: "云存储", desc: "跨平台老牌网络同步云盘" },
  { name: "OneDrive Standalone", amount: 15, currency: "CNY", cycle: "月", category: "云存储", desc: "微软官方网盘存储" },
  { name: "百度网盘 超级会员", amount: 30, currency: "CNY", cycle: "月", category: "云存储", desc: "极速下载及超大网盘空间" },
  { name: "阿里云盘 超级会员", amount: 20, currency: "CNY", cycle: "月", category: "云存储", desc: "大容量高速文件分享同步云盘" },
  { name: "夸克云盘 会员", amount: 15, currency: "CNY", cycle: "月", category: "云存储", desc: "夸克浏览器专属云空间" },
  { name: "坚果云 个人专业版", amount: 30, currency: "CNY", cycle: "月", category: "云存储", desc: "国内团队协作多端实时同步网盘" },

  // Productivity (生产力)
  { name: "Microsoft 365 个人版", amount: 398, currency: "CNY", cycle: "年", category: "生产力", desc: "微软Office办公全家桶" },
  { name: "Microsoft 365 家庭版", amount: 498, currency: "CNY", cycle: "年", category: "生产力", desc: "支持6人共享的Office服务" },
  { name: "Notion Plus", amount: 10, currency: "USD", cycle: "月", category: "生产力", desc: "Notion多合一笔记文档工作流" },
  { name: "1Password 个人版", amount: 25, currency: "CNY", cycle: "月", category: "生产力", desc: "安全跨平台密码管理器" },
  { name: "1Password 家庭版", amount: 40, currency: "CNY", cycle: "月", category: "生产力", desc: "全家共享的安全密码锁" },
  { name: "Readwise Reader", amount: 8.99, currency: "USD", cycle: "月", category: "生产力", desc: "全能阅读及稍后阅读同步" },
  { name: "Todoist Pro", amount: 5, currency: "USD", cycle: "月", category: "生产力", desc: "经典高效的任务规划及Todo" },
  { name: "TickTick Pro (滴答清单)", amount: 15, currency: "CNY", cycle: "月", category: "生产力", desc: "国人喜爱的日程管理与习惯打卡" },
  { name: "Heptabase Pro", amount: 11.99, currency: "USD", cycle: "月", category: "生产力", desc: "高颜值视觉化知识库白板笔记" },
  { name: "Obsidian Sync", amount: 10, currency: "USD", cycle: "月", category: "生产力", desc: "Obsidian官方笔记多端同步" },
  { name: "微信读书 无限卡", amount: 19, currency: "CNY", cycle: "月", category: "生产力", desc: "微信读书全场免费畅读" },
  { name: "WPS 会员", amount: 15, currency: "CNY", cycle: "月", category: "生产力", desc: "国产办公套件高级特权" },
  { name: "有道云笔记 会员", amount: 18, currency: "CNY", cycle: "月", category: "生产力", desc: "网易有道专业云端记事本" },
  { name: "XMind Pro", amount: 28, currency: "CNY", cycle: "月", category: "生产力", desc: "脑图与思维导图设计工具" },

  // Design & Media Editing (设计与多媒体)
  { name: "Figma Professional", amount: 15, currency: "USD", cycle: "月", category: "设计工具", desc: "主流云端UI/UX协作设计工具" },
  { name: "Adobe Creative Cloud", amount: 198, currency: "CNY", cycle: "月", category: "设计工具", desc: "Adobe全家桶(PS, AI, PR等)" },
  { name: "Canva 可画高级版", amount: 35, currency: "CNY", cycle: "月", category: "设计工具", desc: "极简在线海报及平面设计工具" },
  { name: "剪映 专业版", amount: 20, currency: "CNY", cycle: "月", category: "设计工具", desc: "字节跳动旗下全能视频剪辑" },
  { name: "Sketch Pro", amount: 9, currency: "USD", cycle: "月", category: "设计工具", desc: "Mac端矢量图形与UI设计" },
  { name: "ArtStation Plus", amount: 6.99, currency: "USD", cycle: "月", category: "设计工具", desc: "艺术家CG画廊展示高级版" },
  { name: "Envato Elements", amount: 33, currency: "USD", cycle: "月", category: "设计工具", desc: "海量多媒体素材模版库" },

  // Fitness & Health (健身与健康)
  { name: "Keep 会员", amount: 19, currency: "CNY", cycle: "月", category: "健身", desc: "Keep在线减脂塑形健身课程" },
  { name: "Strava Subscription", amount: 8, currency: "USD", cycle: "月", category: "健身", desc: "专业户外跑步骑行GPS社区" },
  { name: "Zwift", amount: 14.99, currency: "USD", cycle: "月", category: "健身", desc: "室内虚拟骑行及运动社区" },
  { name: "MyFitnessPal Premium", amount: 19.99, currency: "USD", cycle: "月", category: "健身", desc: "卡路里计算及饮食营养追踪" },
  { name: "Nike Run Club Pro", amount: 0, currency: "CNY", cycle: "月", category: "健身", desc: "耐克专业运动指导(内置免费)" },
  { name: "小红书 燃脂会员", amount: 15, currency: "CNY", cycle: "月", category: "健身", desc: "运动减脂干货专栏" },

  // Shopping & Lifestyle (购物与生活)
  { name: "淘宝 88VIP", amount: 88, currency: "CNY", cycle: "年", category: "购物会员", desc: "阿里系多重消费及权益包" },
  { name: "京东 PLUS 会员", amount: 99, currency: "CNY", cycle: "年", category: "购物会员", desc: "京东免邮券及PLUS专属价" },
  { name: "盒马 X 会员", amount: 258, currency: "CNY", cycle: "年", category: "购物会员", desc: "盒马鲜生门店每周88折特权" },
  { name: "美团 神会员", amount: 15, currency: "CNY", cycle: "月", category: "购物会员", desc: "美团外卖大额无门槛红包" },
  { name: "饿了么 吃货卡", amount: 10, currency: "CNY", cycle: "月", category: "购物会员", desc: "饿了么外卖专享红包与折扣" },
  { name: "山姆 会员卡", amount: 260, currency: "CNY", cycle: "年", category: "购物会员", desc: "山姆会员商店购物资格" },
  { name: "Costco 会员卡", amount: 299, currency: "CNY", cycle: "年", category: "购物会员", desc: "开市客仓储商店会员卡" },
  { name: "星巴克 星享俱乐部星礼包", amount: 98, currency: "CNY", cycle: "月", category: "购物会员", desc: "星巴克咖啡优惠及周边礼包" },

  // Gaming (游戏)
  { name: "Nintendo Switch Online", amount: 155, currency: "HKD", cycle: "年", category: "其他", desc: "任天堂联机服务与怀旧游戏" },
  { name: "PlayStation Plus Essential", amount: 428, currency: "HKD", cycle: "年", category: "其他", desc: "索尼主机联机及每月会送游戏" },
  { name: "Xbox Game Pass Ultimate", amount: 119, currency: "HKD", cycle: "月", category: "其他", desc: "微软海量主机与PC游戏库(XGP)" },
  { name: "Steam EA Play", amount: 38, currency: "CNY", cycle: "月", category: "其他", desc: "EA旗下精品游戏试玩库" },
  { name: "网易 UU 加速器", amount: 30, currency: "CNY", cycle: "月", category: "其他", desc: "游戏网络加速低延迟" },
  { name: "腾讯手游加速器 VIP", amount: 15, currency: "CNY", cycle: "月", category: "其他", desc: "手游延迟优化加速" }
];

export const CATEGORY_COLORS = {
  流媒体: "#D9852B",
  AI工具: "#7C93B3",
  生产力: "#6FA287",
  设计工具: "#9C84B0",
  云存储: "#5FA9A0",
  健身: "#BD7B7E",
  购物会员: "#B9A36B",
  其他: "#8B93A1",
};

export const CURRENCIES = ["CNY", "USD", "EUR", "JPY", "HKD"];
export const CYCLES = ["周", "月", "季", "年"];
export const CATEGORIES = Object.keys(CATEGORY_COLORS);
