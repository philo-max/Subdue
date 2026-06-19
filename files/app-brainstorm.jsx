import { useState } from "react";

const appIdeas = [
  {
    id: 1,
    category: "AI 效率工具",
    emoji: "🧠",
    color: "#6366F1",
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.25)",
    title: "AI 会议助理 & 行动追踪器",
    tagline: "让每次会议产生真实价值",
    painPoints: [
      "开完会不知道谁负责什么事",
      "会议记录乱、找不到关键决定",
      "行动项从未被跟进，事情反复讨论",
    ],
    solution: "录音/文字输入 → AI 自动提取待办、责任人、截止日 → 自动同步任务给每个人",
    market: "B端+个人，企业付费意愿强",
    competitors: "Otter.ai（无任务追踪）、Notion（无自动提取）",
    difficulty: 3,
    potential: 5,
    features: ["会议录音转录", "自动识别 Action Items", "一键分配任务", "进度提醒推送", "历史搜索"],
  },
  {
    id: 2,
    category: "金融管理",
    emoji: "💸",
    color: "#10B981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.25)",
    title: "订阅刺客追踪器",
    tagline: "找出那些你忘记的钱每月从哪里消失",
    painPoints: [
      "不知道自己到底订了多少服务",
      "忘记取消试用被自动扣款",
      "订阅涨价了根本没注意到",
    ],
    solution: "授权读取银行/支付账单 → 自动识别所有订阅 → 涨价提醒 + 一键取消引导 + 年度支出报告",
    market: "C端普遍需求，全球用户",
    competitors: "Truebill（美国为主）、国内几乎空白",
    difficulty: 2,
    potential: 4,
    features: ["账单自动扫描", "订阅汇总仪表盘", "涨价/续费提醒", "取消引导", "AI 年度总结"],
  },
  {
    id: 3,
    category: "健康生活",
    emoji: "🏋️",
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.25)",
    title: "AI 私人健身教练",
    tagline: "人人都能拥有懂你的私教",
    painPoints: [
      "私教贵，普通人负担不起",
      "网上计划千篇一律，不适合自己",
      "受伤后不知道怎么调整计划",
    ],
    solution: "输入身体数据/目标 → AI 生成个性化计划 → 摄像头识别动作纠姿 → 每周根据完成度自动调整",
    market: "C端，健身市场万亿规模",
    competitors: "Keep（无AI纠姿）、FitAI（功能单一）",
    difficulty: 4,
    potential: 5,
    features: ["摄像头动作分析", "AI 计划生成", "进度追踪", "营养建议联动", "社区打卡"],
  },
  {
    id: 4,
    category: "专注效率",
    emoji: "⚡",
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.25)",
    title: "深度工作操作系统",
    tagline: "不只是番茄钟，是你的产出分析引擎",
    painPoints: [
      "不知道自己一天真正产出了多少",
      "被通知打断后很难重新进入状态",
      "拖延是因为任务没有拆解清楚",
    ],
    solution: "任务拆解 → 专注计时 → 干扰屏蔽 → 自动统计每个项目真实投入时长 → AI 每周效率报告",
    market: "知识工作者，远程工作者",
    competitors: "Forest（无分析）、Toggl（无专注功能）",
    difficulty: 2,
    potential: 4,
    features: ["智能任务拆解", "专注模式 + 白名单", "应用使用追踪", "效率热力图", "AI 周报"],
  },
  {
    id: 5,
    category: "学习成长",
    emoji: "🎓",
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.25)",
    title: "第二大脑笔记 + 知识图谱",
    tagline: "让你读过的每件事都能被找到、被用到",
    painPoints: [
      "读了很多书/文章但全忘了",
      "笔记越积越多但从不回看",
      "不同地方的笔记互相割裂",
    ],
    solution: "一键剪藏 → AI 自动打标签/摘要 → 知识图谱可视化关联 → 间隔复习推送 → 写作时 AI 自动召唤相关笔记",
    market: "学生、研究者、创作者",
    competitors: "Obsidian（无 AI）、Notion（无图谱）",
    difficulty: 3,
    potential: 5,
    features: ["一键剪藏", "AI 自动摘要", "知识图谱", "间隔复习", "写作助手联动"],
  },
  {
    id: 6,
    category: "社交互动",
    emoji: "🤝",
    color: "#06B6D4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.25)",
    title: "本地技能互换社区",
    tagline: "用你的技能换别人的技能，零现金",
    painPoints: [
      "专业技能找人贵，闲鱼又不靠谱",
      "自己有技能但没有变现渠道",
      "社区邻里之间缺乏连接",
    ],
    solution: "发布技能 → 匹配附近用户互换 → 信用积分体系 → 评价系统 → 也支持小额付费模式",
    market: "C端，本地化社区赛道",
    competitors: "TaskRabbit（纯付费）、国内几乎没有同类",
    difficulty: 3,
    potential: 3,
    features: ["技能档案", "智能匹配", "积分体系", "安全评价", "附近热图"],
  },
];

const DifficultyDots = ({ value, max = 5, color }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {Array.from({ length: max }).map((_, i) => (
      <div
        key={i}
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: i < value ? color : "rgba(255,255,255,0.1)",
          transition: "background 0.2s",
        }}
      />
    ))}
  </div>
);

export default function AppBrainstorm() {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(new Set());
  const [hoveredId, setHoveredId] = useState(null);

  const selectedIdea = appIdeas.find((a) => a.id === selected);

  const toggleVote = (id, e) => {
    e.stopPropagation();
    setVoted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080B14",
        color: "#E8EAF0",
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 40px 28px",
          background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "#6366F1",
              textTransform: "uppercase",
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            ✦ 产品方向探索
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              margin: 0,
              letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #E8EAF0 0%, #9CA3AF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            选择你的赛道
          </h1>
          <p style={{ color: "#6B7280", margin: "10px 0 0", fontSize: 15, lineHeight: 1.6 }}>
            6个经过痛点验证的方向 · 点击任意卡片深入探索 · ⭐ 收藏你感兴趣的
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px" }}>
        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {appIdeas.map((idea) => (
            <div
              key={idea.id}
              onClick={() => setSelected(selected === idea.id ? null : idea.id)}
              onMouseEnter={() => setHoveredId(idea.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: selected === idea.id ? idea.bg : hoveredId === idea.id ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${selected === idea.id ? idea.border : hoveredId === idea.id ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 16,
                padding: "24px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                position: "relative",
                transform: hoveredId === idea.id && selected !== idea.id ? "translateY(-2px)" : "none",
                boxShadow: selected === idea.id ? `0 0 0 1px ${idea.border}, 0 8px 32px rgba(0,0,0,0.3)` : "none",
              }}
            >
              {/* Top row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.15em",
                      color: idea.color,
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    {idea.category}
                  </div>
                  <div style={{ fontSize: 28 }}>{idea.emoji}</div>
                </div>
                <button
                  onClick={(e) => toggleVote(idea.id, e)}
                  style={{
                    background: voted.has(idea.id) ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${voted.has(idea.id) ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 8,
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontSize: 14,
                    transition: "all 0.2s",
                    color: voted.has(idea.id) ? "#FFD700" : "#6B7280",
                  }}
                >
                  {voted.has(idea.id) ? "★" : "☆"}
                </button>
              </div>

              <h3
                style={{
                  margin: "0 0 6px",
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "#F1F3F9",
                  lineHeight: 1.3,
                }}
              >
                {idea.title}
              </h3>
              <p style={{ margin: "0 0 18px", color: "#6B7280", fontSize: 13, lineHeight: 1.5 }}>
                {idea.tagline}
              </p>

              {/* Pain points preview */}
              <div style={{ marginBottom: 18 }}>
                {idea.painPoints.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      padding: "5px 0",
                      borderBottom: i < idea.painPoints.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ color: idea.color, flexShrink: 0, marginTop: 1 }}>▸</span>
                    {p}
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#4B5563", marginBottom: 5, letterSpacing: "0.1em" }}>开发难度</div>
                  <DifficultyDots value={idea.difficulty} color={idea.color} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#4B5563", marginBottom: 5, letterSpacing: "0.1em" }}>市场潜力</div>
                  <DifficultyDots value={idea.potential} color={idea.color} />
                </div>
              </div>

              {/* Expand indicator */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  right: 20,
                  fontSize: 11,
                  color: selected === idea.id ? idea.color : "#374151",
                  transition: "all 0.2s",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                {selected === idea.id ? "▲ 收起" : "详情 ▼"}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selectedIdea && (
          <div
            style={{
              marginTop: 24,
              background: selectedIdea.bg,
              border: `1px solid ${selectedIdea.border}`,
              borderRadius: 20,
              padding: "32px",
              animation: "fadeIn 0.25s ease",
            }}
          >
            <style>{`
              @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
            `}</style>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 28, flexWrap: "wrap" }}>
              <span style={{ fontSize: 36 }}>{selectedIdea.emoji}</span>
              <div>
                <div style={{ fontSize: 11, color: selectedIdea.color, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 }}>
                  {selectedIdea.category}
                </div>
                <h2 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {selectedIdea.title}
                </h2>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 20,
              }}
            >
              {/* Solution */}
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 12,
                  padding: "20px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: 11, color: selectedIdea.color, letterSpacing: "0.15em", marginBottom: 10, fontWeight: 700, textTransform: "uppercase" }}>
                  💡 核心解法
                </div>
                <p style={{ margin: 0, fontSize: 13, color: "#D1D5DB", lineHeight: 1.7 }}>
                  {selectedIdea.solution}
                </p>
              </div>

              {/* Features */}
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 12,
                  padding: "20px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: 11, color: selectedIdea.color, letterSpacing: "0.15em", marginBottom: 12, fontWeight: 700, textTransform: "uppercase" }}>
                  ⚙️ 核心功能
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedIdea.features.map((f) => (
                    <span
                      key={f}
                      style={{
                        background: `${selectedIdea.color}22`,
                        border: `1px solid ${selectedIdea.color}44`,
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 12,
                        color: "#D1D5DB",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Market */}
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 12,
                  padding: "20px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div style={{ fontSize: 11, color: selectedIdea.color, letterSpacing: "0.15em", marginBottom: 10, fontWeight: 700, textTransform: "uppercase" }}>
                  📊 市场情况
                </div>
                <div style={{ fontSize: 13, color: "#D1D5DB", lineHeight: 1.7 }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ color: "#6B7280" }}>目标用户：</span>{selectedIdea.market}
                  </div>
                  <div>
                    <span style={{ color: "#6B7280" }}>竞品差距：</span>{selectedIdea.competitors}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: "16px 20px",
                background: `${selectedIdea.color}11`,
                border: `1px solid ${selectedIdea.color}33`,
                borderRadius: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 13, color: "#9CA3AF" }}>
                🖥 PC + 📱 移动端均适配 &nbsp;·&nbsp; 支持 App Store + Google Play 上架
              </div>
              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                <span>
                  <span style={{ color: "#6B7280" }}>开发难度 </span>
                  <span style={{ color: selectedIdea.color, fontWeight: 700 }}>{"●".repeat(selectedIdea.difficulty)}{"○".repeat(5 - selectedIdea.difficulty)}</span>
                </span>
                <span>
                  <span style={{ color: "#6B7280" }}>市场潜力 </span>
                  <span style={{ color: selectedIdea.color, fontWeight: 700 }}>{"●".repeat(selectedIdea.potential)}{"○".repeat(5 - selectedIdea.potential)}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div
          style={{
            marginTop: 40,
            padding: "28px 32px",
            background: "rgba(99,102,241,0.06)",
            border: "1px solid rgba(99,102,241,0.15)",
            borderRadius: 16,
            display: "flex",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.01em" }}>
              下一步：确定方向 → 开始设计
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              收藏你感兴趣的方向，告诉我你倾向于哪个，我们接着做竞品分析、MVP功能规划、技术选型和UI原型。
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {voted.size > 0 && (
              <div
                style={{
                  background: "rgba(255,215,0,0.1)",
                  border: "1px solid rgba(255,215,0,0.25)",
                  borderRadius: 8,
                  padding: "10px 16px",
                  fontSize: 13,
                  color: "#FFD700",
                }}
              >
                ★ 已收藏 {voted.size} 个方向
              </div>
            )}
            <div
              style={{
                background: "#6366F1",
                borderRadius: 8,
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                color: "white",
                letterSpacing: "0.01em",
              }}
            >
              告诉我你的选择 →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
