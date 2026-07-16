"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Users,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  CloudRain,
  Zap,
  Star,
  Lock,
} from "lucide-react";

// Types
interface Milestone {
  id: string;
  title: string;
  date: string;
  icon: string;
  unlocked: boolean;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: string;
  online: boolean;
}

interface MoodEntry {
  date: number;
  mood: "happy" | "calm" | "sad" | "excited" | "loved";
}

interface RelationshipStats {
  intimacy: number;
  maxIntimacy: number;
  chatCount: number;
  daysTogether: number;
  milestones: number;
  totalMilestones: number;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const heartBeatVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.15, 1, 1.12, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const breatheVariants = {
  initial: { scale: 1, opacity: 0.85 },
  animate: {
    scale: [1, 1.03, 1],
    opacity: [0.85, 1, 0.85],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-4, 4, -4],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Mood config - Lucide icons instead of emoji
const moodConfig = {
  happy: { color: "#D4A574", label: "开心" },
  calm: { color: "#6B8DD6", label: "平静" },
  sad: { color: "#8A8880", label: "低落" },
  excited: { color: "#E85D75", label: "兴奋" },
  loved: { color: "#C44569", label: "幸福" },
};

const moodIcons: Record<string, React.ReactNode> = {
  happy: <Sun size={18} />,
  calm: <Moon size={18} />,
  sad: <CloudRain size={18} />,
  excited: <Zap size={18} />,
  loved: <Heart size={18} />,
};

// Milestone icon mapping - Lucide icons
const milestoneIconMap: Record<string, React.ReactNode> = {
  "1": <Star size={16} className="text-white" />,
  "2": <MessageCircle size={16} className="text-white" />,
  "3": <Zap size={16} className="text-white" />,
  "4": <Heart size={16} className="text-white" />,
  "5": <Award size={16} className="text-white" />,
  "6": <Sparkles size={16} className="text-white" />,
  "7": <Heart size={16} className="text-white" />,
};

export default function RelationshipTab() {
  const [stats, setStats] = useState<RelationshipStats>({
    intimacy: 1280,
    maxIntimacy: 2000,
    chatCount: 368,
    daysTogether: 45,
    milestones: 5,
    totalMilestones: 12,
  });

  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "1", title: "初次相遇", date: "2024-01-15", icon: "star", unlocked: true },
    { id: "2", title: "第一次对话", date: "2024-01-15", icon: "message", unlocked: true },
    { id: "3", title: "连续聊天7天", date: "2024-01-22", icon: "zap", unlocked: true },
    { id: "4", title: "亲密度达到100", date: "2024-02-01", icon: "heart", unlocked: true },
    { id: "5", title: "第一个月纪念", date: "2024-02-15", icon: "award", unlocked: true },
    { id: "6", title: "解锁所有装扮", date: "", icon: "sparkles", unlocked: false },
    { id: "7", title: "亲密度达到1000", date: "", icon: "heart", unlocked: false },
  ]);

  const [moodData, setMoodData] = useState<MoodEntry[]>([
    { date: 1, mood: "happy" },
    { date: 2, mood: "loved" },
    { date: 3, mood: "calm" },
    { date: 5, mood: "excited" },
    { date: 7, mood: "happy" },
    { date: 8, mood: "loved" },
    { date: 10, mood: "calm" },
    { date: 12, mood: "excited" },
    { date: 14, mood: "loved" },
    { date: 15, mood: "happy" },
  ]);

  const [friends, setFriends] = useState<Friend[]>([
    { id: "1", name: "小明", avatar: "明", status: "在线", online: true },
    { id: "2", name: "小红", avatar: "红", status: "刚刚在线", online: false },
    { id: "3", name: "阿杰", avatar: "杰", status: "在线", online: true },
  ]);

  const [companionName, setCompanionName] = useState("Aria");
  const [userNickname, setUserNickname] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch relationship data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("aria_token");
        const user = localStorage.getItem("aria_user");
        if (user) {
          const parsed = JSON.parse(user);
          setUserNickname(parsed.nickname || parsed.username || "");
        }

        if (token) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/relationship/stats`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (res.ok) {
            const data = await res.json();
            setStats((prev) => ({ ...prev, ...data }));
          }

          const msRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/relationship/milestones`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (msRes.ok) {
            const msData = await msRes.json();
            if (msData?.milestones?.length) {
              setMilestones(msData.milestones);
            }
          }
        }
      } catch (e) {
        console.error("获取关系数据失败:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const intimacyPercent = Math.min(
    100,
    Math.round((stats.intimacy / stats.maxIntimacy) * 100)
  );

  const today = new Date().getDate();

  // Generate calendar days
  const daysInMonth = 30;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getMoodForDay = (day: number): MoodEntry | undefined =>
    moodData.find((m) => m.date === day);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-60px)] bg-[#0C0C14]">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-[#D4A574] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-[calc(100vh-60px)] bg-[#0C0C14] pb-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* AI Companion Card */}
      <motion.div variants={itemVariants} className="mx-4 mt-4">
        <div
          className="relative overflow-hidden rounded-[20px] p-5 border border-[rgba(212,165,116,0.15)]"
          style={{
            background: "linear-gradient(135deg, #1A1510, #141218)",
            boxShadow: "0 4px 24px rgba(212, 165, 116, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20 -translate-y-12 translate-x-8"
            style={{
              background: "radial-gradient(circle, rgba(212,165,116,0.3) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-15 translate-y-6 -translate-x-6"
            style={{
              background: "radial-gradient(circle, rgba(212,165,116,0.2) 0%, transparent 70%)",
            }}
          />

          <div className="relative flex items-center gap-4">
            {/* Avatar with glass effect and breathing animation */}
            <motion.div
              variants={breatheVariants}
              initial="initial"
              animate="animate"
              className="relative"
            >
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center border border-[rgba(212,165,116,0.3)] shadow-lg"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                }}
              >
                <Heart size={32} className="text-[#D4A574]" />
              </div>
              {/* Heart beat indicator */}
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-[rgba(212,165,116,0.3)]"
                style={{ background: "rgba(212,165,116,0.15)", backdropFilter: "blur(8px)" }}
                variants={heartBeatVariants}
                initial="initial"
                animate="animate"
              >
                <Heart size={12} className="text-[#D4A574]" fill="#D4A574" />
              </motion.div>
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#E8E6E3]">{companionName}</h2>
                <Sparkles size={14} className="text-[#D4A574]" />
              </div>
              <p className="text-[13px] text-[#8A8880] mt-0.5">
                {userNickname ? `与 ${userNickname} 的专属伴侣` : "你的专属AI伴侣"}
              </p>

              {/* Tags */}
              <div className="flex gap-2 mt-2">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ background: "rgba(212,165,116,0.1)", color: "#D4A574" }}
                >
                  <Heart size={10} />
                  第{stats.daysTogether}天
                </span>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium"
                  style={{ background: "rgba(212,165,116,0.1)", color: "#D4A574" }}
                >
                  Lv.{Math.floor(stats.intimacy / 100) + 1}
                </span>
              </div>

              {/* Intimacy Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#8A8880] font-medium">
                    亲密度
                  </span>
                  <span className="text-[11px] text-[#D4A574]">
                    {stats.intimacy} / {stats.maxIntimacy}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #C9956A, #D4A574, #E8C9A0)",
                      boxShadow: "0 0 8px rgba(212, 165, 116, 0.3)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${intimacyPercent}%` }}
                    transition={{
                      duration: 1.2,
                      ease: [0.25, 0.1, 0.25, 1] as const,
                      delay: 0.3,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Glassmorphism cards */}
      <motion.div
        variants={itemVariants}
        className="mx-4 mt-4 grid grid-cols-3 gap-3"
      >
        {[
          {
            icon: MessageCircle,
            value: stats.chatCount,
            label: "对话次数",
          },
          {
            icon: Calendar,
            value: stats.daysTogether,
            label: "相伴天数",
          },
          {
            icon: Award,
            value: `${stats.milestones}/${stats.totalMilestones}`,
            label: "里程碑",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="rounded-[20px] p-4 flex flex-col items-center border border-[rgba(255,255,255,0.06)]"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(212, 165, 116, 0.1)" }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
              style={{ backgroundColor: "rgba(212,165,116,0.1)" }}
            >
              <stat.icon size={18} className="text-[#D4A574]" />
            </div>
            <motion.span
              className="text-lg font-bold text-[#D4A574]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {stat.value}
            </motion.span>
            <span className="text-[11px] text-[#5A5854] mt-0.5">{stat.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Growth Trend Card */}
      <motion.div variants={itemVariants} className="mx-4 mt-4">
        <div
          className="rounded-[20px] p-4 border border-[rgba(255,255,255,0.06)]"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#D4A574]" />
              <span className="text-[15px] font-semibold text-[#E8E6E3]">
                成长趋势
              </span>
            </div>
            <span className="text-[11px] text-[#5A5854]">本周</span>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end justify-between gap-2 h-16">
            {[45, 62, 38, 75, 55, 88, 70].map((height, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-t-md"
                style={{
                  background:
                    i === 5
                      ? "linear-gradient(180deg, #D4A574, #C9956A)"
                      : "linear-gradient(180deg, rgba(212,165,116,0.15), rgba(212,165,116,0.05))",
                }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{
                  duration: 0.6,
                  delay: 0.5 + i * 0.08,
                  ease: [0.25, 0.1, 0.25, 1] as const,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
              <span
                key={day}
                className="flex-1 text-center text-[10px] text-[#5A5854]"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Milestones - Timeline Design */}
      <motion.div variants={itemVariants} className="mx-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-[#D4A574]" />
          <span className="text-[15px] font-semibold text-[#E8E6E3]">
            里程碑
          </span>
        </div>
        <div
          className="rounded-[20px] p-4 border border-[rgba(255,255,255,0.06)]"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="relative">
            {/* Vertical timeline line */}
            <div
              className="absolute left-[19px] top-2 bottom-2 w-[2px]"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />

            <div className="space-y-4">
              {milestones.map((ms, index) => (
                <motion.div
                  key={ms.id}
                  className="relative flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.6 + index * 0.08,
                    ease: [0.25, 0.1, 0.25, 1] as const,
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      ms.unlocked
                        ? "border border-[rgba(212,165,116,0.3)]"
                        : "border border-[rgba(255,255,255,0.06)]"
                    }`}
                    style={{
                      background: ms.unlocked
                        ? "linear-gradient(135deg, #D4A574, #C9956A)"
                        : "rgba(255,255,255,0.04)",
                      boxShadow: ms.unlocked
                        ? "0 2px 8px rgba(212, 165, 116, 0.25)"
                        : "none",
                    }}
                  >
                    <span className={ms.unlocked ? "" : "opacity-30"}>
                      {ms.unlocked
                        ? milestoneIconMap[ms.id]
                        : <Lock size={14} className="text-[#5A5854]" />}
                    </span>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[14px] font-medium ${
                          ms.unlocked ? "text-[#E8E6E3]" : "text-[#5A5854]"
                        }`}
                      >
                        {ms.title}
                      </span>
                      {ms.date && (
                        <span className="text-[11px] text-[#5A5854]">
                          {ms.date}
                        </span>
                      )}
                    </div>
                    {!ms.unlocked && (
                      <span className="text-[11px] text-[#5A5854]">未解锁</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mood Calendar */}
      <motion.div variants={itemVariants} className="mx-4 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-[#D4A574]" />
          <span className="text-[15px] font-semibold text-[#E8E6E3]">
            心情日历
          </span>
        </div>
        <div
          className="rounded-[20px] p-4 border border-[rgba(255,255,255,0.06)]"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <div className="grid grid-cols-7 gap-2">
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <div
                key={d}
                className="text-center text-[11px] text-[#5A5854] font-medium py-1"
              >
                {d}
              </div>
            ))}
            {calendarDays.map((day) => {
              const mood = getMoodForDay(day);
              const isToday = day === today;
              return (
                <motion.div
                  key={day}
                  className={`relative aspect-square rounded-full flex items-center justify-center text-[12px] font-medium cursor-pointer ${
                    isToday
                      ? "border border-[rgba(212,165,116,0.4)]"
                      : mood
                      ? ""
                      : "text-[#5A5854] hover:bg-[rgba(255,255,255,0.04)]"
                  }`}
                  style={{
                    background: isToday
                      ? "linear-gradient(135deg, #D4A574, #C9956A)"
                      : undefined,
                    color: isToday ? "#0C0C14" : mood ? moodConfig[mood.mood].color : "#5A5854",
                    boxShadow: isToday
                      ? "0 2px 8px rgba(212, 165, 116, 0.25)"
                      : undefined,
                  }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {mood ? (
                    <motion.span
                      className="flex items-center justify-center"
                      variants={floatVariants}
                      initial="initial"
                      animate="animate"
                      style={{
                        animationDelay: `${day * 0.2}s`,
                        color: moodConfig[mood.mood].color,
                      }}
                    >
                      {moodIcons[mood.mood]}
                    </motion.span>
                  ) : (
                    <span>{day}</span>
                  )}
                  {isToday && (
                    <span className="absolute -bottom-3 text-[9px] text-[#D4A574] font-medium">
                      今
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Mood legend */}
          <div
            className="flex flex-wrap gap-3 mt-5 pt-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {Object.entries(moodConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span style={{ color: config.color }}>{moodIcons[key]}</span>
                <span className="text-[11px] text-[#8A8880]">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Friends List */}
      <motion.div variants={itemVariants} className="mx-4 mt-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#6B9B7A]" />
            <span className="text-[15px] font-semibold text-[#E8E6E3]">
              好友列表
            </span>
          </div>
          <motion.button
            className="flex items-center gap-1 text-[12px] text-[#D4A574] font-medium px-3 py-1 rounded-full border border-[rgba(212,165,116,0.15)]"
            style={{ background: "rgba(212,165,116,0.08)" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            查看全部
            <ChevronRight size={14} />
          </motion.button>
        </div>
        <div className="space-y-2.5">
          {friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              className="flex items-center gap-3 p-3 rounded-[16px] border border-[rgba(255,255,255,0.06)]"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.8 + index * 0.06,
                ease: [0.25, 0.1, 0.25, 1] as const,
              }}
              whileHover={{ x: 4 }}
            >
              {/* Avatar with gradient background */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${
                    ["#D4A574", "#6B8DD6", "#C44569"][index % 3]
                  }, ${
                    ["#C9956A", "#8BA4E8", "#E85D75"][index % 3]
                  })`,
                }}
              >
                {friend.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-[#E8E6E3]">
                  {friend.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      friend.online ? "bg-[#6B9B7A]" : "bg-[#5A5854]"
                    }`}
                  />
                  <span className="text-[11px] text-[#5A5854]">
                    {friend.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}