"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Star,
  Calendar,
  Users,
  ChevronDown,
  MessageCircle,
  Target,
  Gift,
  Camera,
  Smile,
  Frown,
  Sun,
  Moon,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function RelationshipTab() {
  const [expandedFriends, setExpandedFriends] = useState(false);

  const milestones = [
    { date: "2026-05-11", title: "第一次相遇", icon: Star },
    { date: "2026-05-13", title: "第一次说晚安", icon: Moon },
    { date: "2026-05-18", title: "第一次深入聊天", icon: MessageCircle },
    { date: "2026-05-22", title: "第一次分享心情", icon: Heart },
    { date: "2026-05-28", title: "第一次吵架和好", icon: Target },
    { date: "2026-06-01", title: "认识20天", icon: Gift },
  ];

  const recentMoods = [
    { day: "一", mood: "happy" },
    { day: "二", mood: "calm" },
    { day: "三", mood: "sad" },
    { day: "四", mood: "happy" },
    { day: "五", mood: "loved" },
    { day: "六", mood: "happy", isToday: true },
    { day: "日", mood: "calm" },
  ];

  const friends = [
    { name: "Alice", initial: "A", online: true },
    { name: "阿杰", initial: "杰", online: false },
    { name: "小明", initial: "明", online: true },
    { name: "小美", initial: "美", online: false },
    { name: "小华", initial: "华", online: true },
  ];

  const stats = [
    { label: "总对话", value: "1,234", icon: MessageCircle },
    { label: "共同话题", value: "28", icon: Target },
    { label: "AI主动关心", value: "56", icon: Gift },
    { label: "回忆记录", value: "12", icon: Camera },
  ];

  const moodIcons: Record<string, { icon: typeof Smile; color: string }> = {
    happy: { icon: Smile, color: "text-[#F5A623]" },
    calm: { icon: Sun, color: "text-[#4CAF7A]" },
    sad: { icon: Frown, color: "text-[#6B8DD6]" },
    loved: { icon: Heart, color: "text-[#E85D75]" },
  };

  return (
    <motion.div
      className="p-4 space-y-4 bg-[#FFF8F5] min-h-[calc(100dvh-60px)]"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* AI伴侣卡片 */}
      <motion.div
        variants={cardVariants}
        className="bg-gradient-to-br from-[#C44569] via-[#E85D75] to-[#F28C8C] rounded-[20px] p-4 text-white shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-[72px] h-[72px] rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl border-2 border-white/30 shadow-lg"
          >
            🥰
          </motion.div>
          <div className="flex-1">
            <div className="text-lg font-bold">AI伴侣</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">ENFJ</span>
              <span className="text-xs px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">巨蟹座</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <motion.div
                animate={{ scale: [1, 1.15, 1, 1.12, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <Heart size={14} className="fill-white" />
              </motion.div>
              <span className="text-sm">第47天</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-2">
            <span className="opacity-90">亲密度</span>
            <span className="font-bold">45%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <motion.div
              className="bg-white h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "45%" }}
              transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* 数据统计 */}
      <motion.div variants={itemVariants} className="grid grid-cols-4 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(45, 45, 58, 0.08)" }}
              className="bg-white rounded-[16px] p-3 text-center shadow-[0_1px_3px_rgba(45,45,58,0.06)] border border-[rgba(0,0,0,0.03)]"
            >
              <div className="flex justify-center mb-1.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E85D75]/10 to-[#F28C8C]/10 flex items-center justify-center">
                  <Icon size={16} className="text-[#E85D75]" />
                </div>
              </div>
              <motion.div
                className="text-sm font-bold text-gradient bg-gradient-to-r from-[#E85D75] to-[#F28C8C] bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                {stat.value}
              </motion.div>
              <div className="text-[10px] text-[#A0A0B0] mt-0.5">{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 关系里程碑 */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
      >
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#2D2D3A]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F5A623]/10 to-[#F5A623]/20 flex items-center justify-center">
            <Star size={14} className="text-[#F5A623]" />
          </div>
          关系里程碑
          <span className="text-xs text-[#A0A0B0] ml-auto">{milestones.length}个</span>
        </h3>
        <div className="space-y-0">
          {milestones.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center gap-3 relative py-2.5"
              >
                {i < milestones.length - 1 && (
                  <div className="absolute left-[18px] top-[42px] w-[2px] h-[calc(100%-12px)] bg-[#F0F0F0]" />
                )}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F5A623]/10 to-[#F5A623]/20 flex items-center justify-center shrink-0 z-10">
                  <Icon size={14} className="text-[#F5A623]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#2D2D3A] truncate">{m.title}</div>
                  <div className="text-xs text-[#A0A0B0]">{m.date}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* AI心情日历 */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
      >
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2 text-[#2D2D3A]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85D75]/10 to-[#E85D75]/20 flex items-center justify-center">
            <Calendar size={14} className="text-[#E85D75]" />
          </div>
          本周心情
        </h3>
        <div className="flex justify-between">
          {recentMoods.map((m, i) => {
            const moodData = moodIcons[m.mood];
            const Icon = moodData?.icon || Smile;
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex flex-col items-center gap-1.5"
              >
                <motion.div
                  animate={m.isToday ? { y: [0, -4, 0] } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    m.isToday
                      ? "bg-gradient-to-br from-[#E85D75] to-[#F28C8C] text-white shadow-[0_2px_8px_rgba(232,93,117,0.25)]"
                      : "bg-[#F7F7F9] " + (moodData?.color || "text-[#A0A0B0]")
                  }`}
                >
                  <Icon size={18} />
                </motion.div>
                <span className={`text-xs ${m.isToday ? "text-[#E85D75] font-semibold" : "text-[#A0A0B0]"}`}>
                  {m.day}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 好友列表 */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] shadow-[0_1px_3px_rgba(45,45,58,0.06)] overflow-hidden"
      >
        <motion.button
          onClick={() => setExpandedFriends(!expandedFriends)}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[rgba(0,0,0,0.02)] transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6B8DD6]/10 to-[#6B8DD6]/20 flex items-center justify-center">
              <Users size={14} className="text-[#6B8DD6]" />
            </div>
            <span className="font-semibold text-sm text-[#2D2D3A]">好友</span>
            <span className="text-xs text-[#A0A0B0]">{friends.length}人</span>
          </div>
          <motion.div
            animate={{ rotate: expandedFriends ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={18} className="text-[#A0A0B0]" />
          </motion.div>
        </motion.button>
        <AnimatePresence>
          {expandedFriends && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#F5F5F5]">
                {friends.map((f, i) => {
                  const gradients = [
                    "from-[#E85D75] to-[#F28C8C]",
                    "from-[#6B8DD6] to-[#8BA5E0]",
                    "from-[#4CAF7A] to-[#6BC194]",
                  ];
                  return (
                    <motion.div
                      key={f.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(0,0,0,0.02)] cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradients[i % 3]} flex items-center justify-center text-white text-sm font-bold`}>
                          {f.initial}
                        </div>
                        {f.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4CAF7A] rounded-full border-2 border-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-[#2D2D3A]">{f.name}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
