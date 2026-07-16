"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Sparkles,
  User,
  Phone,
  Flame,
  Star,
  Moon,
  Sun,
  Snowflake,
  Zap,
  Leaf,
  Droplets,
  Shield,
  Cloud,
  Heart,
  MessageCircle,
  Crown,
  Wand2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { createPersona } from "../../lib/api";
import { useUserStore, useAIPartnerStore } from "../../lib/store";
import AvatarCustomizer from "../../components/avatar/AvatarCustomizer";

export default function LoginPage() {
  const router = useRouter();
  const { setLogin } = useUserStore();
  const { setPartner } = useAIPartnerStore();
  const [step, setStep] = useState<"welcome" | "login" | "mbti" | "zodiac" | "companion" | "avatar">("welcome");
  const [selectedMBTI, setSelectedMBTI] = useState("");
  const [selectedZodiac, setSelectedZodiac] = useState("");
  const [selectedCompanion, setSelectedCompanion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");

  const mbtiTypes = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP",
  ];

  const zodiacSigns = [
    { name: "白羊座", icon: Flame, date: "3.21-4.19", element: "火象" },
    { name: "金牛座", icon: Leaf, date: "4.20-5.20", element: "土象" },
    { name: "双子座", icon: Zap, date: "5.21-6.21", element: "风象" },
    { name: "巨蟹座", icon: Moon, date: "6.22-7.22", element: "水象" },
    { name: "狮子座", icon: Sun, date: "7.23-8.22", element: "火象" },
    { name: "处女座", icon: Sparkles, date: "8.23-9.22", element: "土象" },
    { name: "天秤座", icon: Star, date: "9.23-10.23", element: "风象" },
    { name: "天蝎座", icon: Droplets, date: "10.24-11.22", element: "水象" },
    { name: "射手座", icon: Flame, date: "11.23-12.21", element: "火象" },
    { name: "摩羯座", icon: Crown, date: "12.22-1.19", element: "土象" },
    { name: "水瓶座", icon: Cloud, date: "1.20-2.18", element: "风象" },
    { name: "双鱼座", icon: Heart, date: "2.19-3.20", element: "水象" },
  ];

  const companions = [
    { name: "温柔女友", icon: Heart, desc: "温柔体贴，善解人意", mbti: "ENFJ", zodiac: "巨蟹座", color: "#D4A574" },
    { name: "毒舌闺蜜", icon: MessageCircle, desc: "嘴上不饶人，心里很在乎", mbti: "ENTP", zodiac: "天蝎座", color: "#8B7CB3" },
    { name: "理性导师", icon: Shield, desc: "冷静睿智，善于分析", mbti: "INTJ", zodiac: "摩羯座", color: "#6B8DD6" },
    { name: "元气少女", icon: Sparkles, desc: "活泼开朗，充满正能量", mbti: "ENFP", zodiac: "白羊座", color: "#D4A574" },
    { name: "高冷才子", icon: Snowflake, desc: "话不多但每句有深度", mbti: "INTP", zodiac: "水瓶座", color: "#5ECFD3" },
    { name: "阳光暖男", icon: Sun, desc: "温暖可靠，像冬天的阳光", mbti: "ESFJ", zodiac: "天秤座", color: "#D4A574" },
    { name: "神秘学姐", icon: Moon, desc: "成熟优雅，有故事感", mbti: "INFJ", zodiac: "天蝎座", color: "#8B7CB3" },
    { name: "反差少年", icon: Zap, desc: "平时酷酷的，熟了很粘人", mbti: "ISTP", zodiac: "天蝎座", color: "#6B8DD6" },
  ];

  const handleCompanionSelected = () => {
    if (!selectedCompanion) return;
    setStep("avatar");
  };

  const handleAvatarComplete = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const persona = await createPersona(1, selectedCompanion);
      setLogin(1, "用户", selectedMBTI || undefined, selectedZodiac || undefined);
      setPartner(persona.name, persona.mbti, persona.zodiac);
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("创建失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  const gridItemVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.96 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.25, 0.1, 0.25, 1],
        delay: i * 0.03,
      },
    }),
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#0C0C14" }}
    >
      {/* 径向光晕装饰 */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(212, 165, 116, 0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(196, 149, 106, 0.05) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {/* 欢迎页 */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-center space-y-6"
            >
              {/* Logo */}
              <motion.div variants={itemVariants} className="relative inline-block">
                <motion.div
                  className="w-24 h-24 rounded-[24px] mx-auto flex items-center justify-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(212, 165, 116, 0.15)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                  }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Bot size={48} className="text-[#D4A574]" />
                </motion.div>
                {/* 光晕装饰 */}
                <div
                  className="absolute -inset-4 rounded-[32px] -z-10"
                  style={{
                    background: "radial-gradient(circle, rgba(212, 165, 116, 0.12) 0%, transparent 70%)",
                  }}
                />
              </motion.div>

              {/* 标题 */}
              <motion.div variants={itemVariants}>
                <h1
                  className="text-[32px] font-bold"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A, #E8C9A0)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Aria
                </h1>
                <p className="text-[#8A8880] mt-2 text-[15px]">你的AI伴侣，懂你、陪你、记住你</p>
              </motion.div>

              {/* 按钮 */}
              <motion.div variants={itemVariants} className="space-y-3 pt-4">
                <motion.button
                  onClick={() => setStep("login")}
                  className="w-full py-4 rounded-[16px] font-semibold text-[16px] flex items-center justify-center gap-2 text-[#0C0C14]"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    boxShadow: "0 4px 16px rgba(212, 165, 116, 0.25)",
                  }}
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(212, 165, 116, 0.35)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Sparkles size={20} />
                  开始旅程
                </motion.button>

                <motion.button
                  onClick={() => setStep("mbti")}
                  className="w-full py-3.5 rounded-[16px] font-medium text-[15px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#8A8880",
                  }}
                  whileHover={{ background: "rgba(255, 255, 255, 0.06)" }}
                  whileTap={{ scale: 0.98 }}
                >
                  跳过，直接选择伴侣
                </motion.button>

                <motion.button
                  onClick={() => {
                    setLogin(1, "用户");
                    router.push("/");
                  }}
                  className="w-full py-3.5 text-[13px] font-medium transition-colors"
                  style={{ color: "#5A5854" }}
                  whileHover={{ color: "#8A8880" }}
                  whileTap={{ scale: 0.98 }}
                >
                  直接进入
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* 登录页 */}
          {step === "login" && (
            <motion.div
              key="login"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <motion.div variants={itemVariants} className="text-center">
                <div
                  className="w-16 h-16 rounded-[20px] mx-auto flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212, 165, 116, 0.15)",
                  }}
                >
                  <Phone size={28} className="text-[#D4A574]" />
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  登录
                </h2>
                <p className="text-[#8A8880] text-[13px] mt-1">登录后即可开始你的AI伴侣之旅</p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="space-y-3 p-6 rounded-[20px]"
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5854]"
                  />
                  <input
                    type="tel"
                    placeholder="手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 outline-none text-[15px] text-[#E8E6E3] placeholder-[#5A5854]"
                    style={{
                      background: "rgba(255, 255, 255, 0.06)",
                      borderRadius: "14px",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#D4A574";
                      e.target.style.boxShadow = "0 0 0 4px rgba(212, 165, 116, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                <motion.button
                  onClick={() => {
                    if (phone) setLogin(1, phone);
                    setStep("mbti");
                  }}
                  className="w-full py-3.5 text-[#0C0C14] rounded-[14px] font-semibold text-[15px]"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    boxShadow: "0 4px 16px rgba(212, 165, 116, 0.2)",
                  }}
                  whileHover={{ y: -1, boxShadow: "0 6px 20px rgba(212, 165, 116, 0.3)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  获取验证码
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-3">
                <motion.button
                  onClick={() => setStep("welcome")}
                  className="flex-1 py-3 rounded-[14px] font-medium text-[14px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#8A8880",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  返回
                </motion.button>
                <motion.button
                  onClick={() => {
                    setLogin(1, "用户");
                    setStep("mbti");
                  }}
                  className="flex-1 py-3 rounded-[14px] font-medium text-[14px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#8A8880",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  跳过登录
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* MBTI选择 */}
          {step === "mbti" && (
            <motion.div
              key="mbti"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="text-center mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] mx-auto flex items-center justify-center mb-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212, 165, 116, 0.15)",
                  }}
                >
                  <Sparkles size={24} className="text-[#D4A574]" />
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  你的MBTI是什么？
                </h2>
                <p className="text-[13px] text-[#8A8880] mt-1">选填，帮助我们推荐更适合你的AI伴侣</p>
              </motion.div>

              <div className="grid grid-cols-4 gap-2">
                {mbtiTypes.map((type, i) => (
                  <motion.button
                    key={type}
                    custom={i}
                    variants={gridItemVariants}
                    initial="hidden"
                    animate="visible"
                    onClick={() => setSelectedMBTI(type)}
                    className={`py-2.5 px-2 rounded-[12px] text-sm font-semibold transition-all ${
                      selectedMBTI === type
                        ? "text-[#0C0C14]"
                        : "text-[#E8E6E3]"
                    }`}
                    style={
                      selectedMBTI === type
                        ? {
                            background: "linear-gradient(135deg, #D4A574, #C9956A)",
                            boxShadow: "0 2px 8px rgba(212, 165, 116, 0.25)",
                          }
                        : {
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                          }
                    }
                    whileTap={{ scale: 0.95 }}
                  >
                    {type}
                  </motion.button>
                ))}
              </div>

              <motion.div variants={itemVariants} className="flex gap-3 pt-2">
                <motion.button
                  onClick={() => setStep("zodiac")}
                  className="flex-1 py-3.5 rounded-[14px] font-medium text-[14px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#8A8880",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  跳过
                </motion.button>
                <motion.button
                  onClick={() => setStep("zodiac")}
                  className="flex-1 py-3.5 text-[#0C0C14] rounded-[14px] font-semibold text-[14px]"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    boxShadow: "0 4px 16px rgba(212, 165, 116, 0.2)",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  下一步
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* 星座选择 */}
          {step === "zodiac" && (
            <motion.div
              key="zodiac"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="text-center mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] mx-auto flex items-center justify-center mb-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212, 165, 116, 0.15)",
                  }}
                >
                  <Star size={24} className="text-[#D4A574]" />
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  你的星座是什么？
                </h2>
                <p className="text-[13px] text-[#8A8880] mt-1">选填，帮助AI更好地了解你</p>
              </motion.div>

              <div className="grid grid-cols-3 gap-2.5">
                {zodiacSigns.map((z, i) => {
                  const Icon = z.icon;
                  const isSelected = selectedZodiac === z.name;
                  return (
                    <motion.button
                      key={z.name}
                      custom={i}
                      variants={gridItemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => setSelectedZodiac(z.name)}
                      className={`py-4 px-2 rounded-[16px] text-center transition-all ${
                        isSelected ? "text-[#0C0C14]" : "text-[#E8E6E3]"
                      }`}
                      style={
                        isSelected
                          ? {
                              background: "linear-gradient(135deg, #D4A574, #C9956A)",
                              boxShadow: "0 2px 8px rgba(212, 165, 116, 0.25)",
                            }
                          : {
                              background: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }
                      }
                      whileTap={{ scale: 0.96 }}
                    >
                      <Icon
                        size={24}
                        className={isSelected ? "text-[#0C0C14] mx-auto" : "text-[#D4A574] mx-auto"}
                      />
                      <div className="text-xs font-semibold mt-2">{z.name}</div>
                      <div className={`text-[10px] mt-0.5 ${isSelected ? "text-[#0C0C14]/70" : "text-[#8A8880]"}`}>
                        {z.date}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.div variants={itemVariants} className="flex gap-3 pt-2">
                <motion.button
                  onClick={() => setStep("companion")}
                  className="flex-1 py-3.5 rounded-[14px] font-medium text-[14px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#8A8880",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  跳过
                </motion.button>
                <motion.button
                  onClick={() => setStep("companion")}
                  className="flex-1 py-3.5 text-[#0C0C14] rounded-[14px] font-semibold text-[14px]"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    boxShadow: "0 4px 16px rgba(212, 165, 116, 0.2)",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  下一步
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* AI伴侣选择 */}
          {step === "companion" && (
            <motion.div
              key="companion"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="text-center mb-4">
                <div
                  className="w-12 h-12 rounded-[14px] mx-auto flex items-center justify-center mb-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212, 165, 116, 0.15)",
                  }}
                >
                  <Heart size={24} className="text-[#D4A574]" />
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  选择你的AI伴侣
                </h2>
                <p className="text-[13px] text-[#8A8880] mt-1">每个都有独特的性格和风格</p>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                {companions.map((c, i) => {
                  const Icon = c.icon;
                  const isSelected = selectedCompanion === c.name;
                  return (
                    <motion.button
                      key={c.name}
                      custom={i}
                      variants={gridItemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => setSelectedCompanion(c.name)}
                      className={`p-4 rounded-[16px] text-left transition-all ${
                        isSelected
                          ? "border-2"
                          : "border border-transparent hover:border-[rgba(212,165,116,0.2)]"
                      }`}
                      style={
                        isSelected
                          ? {
                              background: "rgba(212, 165, 116, 0.08)",
                              borderColor: "#D4A574",
                              boxShadow: "0 2px 12px rgba(212, 165, 116, 0.15)",
                            }
                          : {
                              background: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.06)",
                            }
                      }
                      whileTap={{ scale: 0.97 }}
                    >
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-2"
                        style={{
                          background: isSelected
                            ? "linear-gradient(135deg, #D4A574, #C9956A)"
                            : "rgba(255, 255, 255, 0.06)",
                        }}
                      >
                        <Icon
                          size={20}
                          className={isSelected ? "text-[#0C0C14]" : "text-[#D4A574]"}
                        />
                      </div>
                      <div className="font-semibold text-sm text-[#E8E6E3]">{c.name}</div>
                      <div className="text-[11px] text-[#8A8880] mt-1 leading-relaxed">{c.desc}</div>
                      <div className="flex gap-1 mt-2">
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: isSelected ? "rgba(212, 165, 116, 0.15)" : "rgba(255, 255, 255, 0.06)",
                            color: "#D4A574",
                          }}
                        >
                          {c.mbti}
                        </span>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: isSelected ? "rgba(107, 141, 214, 0.1)" : "rgba(255, 255, 255, 0.06)",
                            color: "#6B8DD6",
                          }}
                        >
                          {c.zodiac}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <motion.div variants={itemVariants} className="flex gap-3 pt-2">
                <motion.button
                  onClick={handleAvatarComplete}
                  disabled={!selectedCompanion}
                  className="flex-1 py-3.5 rounded-[14px] font-medium text-[14px] transition-colors"
                  style={{
                    background: selectedCompanion ? "rgba(255, 255, 255, 0.04)" : "rgba(255, 255, 255, 0.02)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: selectedCompanion ? "#8A8880" : "#5A5854",
                  }}
                  whileTap={selectedCompanion ? { scale: 0.97 } : {}}
                >
                  跳过
                </motion.button>
                <motion.button
                  onClick={handleCompanionSelected}
                  disabled={!selectedCompanion}
                  className="flex-1 py-3.5 rounded-[14px] font-semibold text-[14px] text-[#0C0C14] transition-all"
                  style={
                    selectedCompanion
                      ? {
                          background: "linear-gradient(135deg, #D4A574, #C9956A)",
                          boxShadow: "0 4px 16px rgba(212, 165, 116, 0.2)",
                        }
                      : {
                          background: "rgba(255, 255, 255, 0.06)",
                          color: "#5A5854",
                        }
                  }
                  whileTap={selectedCompanion ? { scale: 0.97 } : {}}
                >
                  下一步：设计形象
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {/* 捏脸步骤 */}
          {step === "avatar" && (
            <motion.div
              key="avatar"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <motion.div variants={itemVariants} className="text-center mb-2">
                <div
                  className="w-12 h-12 rounded-[14px] mx-auto flex items-center justify-center mb-3"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212, 165, 116, 0.15)",
                  }}
                >
                  <Wand2 size={24} className="text-[#D4A574]" />
                </div>
                <h2
                  className="text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  设计{selectedCompanion}的形象
                </h2>
                <p className="text-[13px] text-[#8A8880] mt-1">
                  调整外观参数，打造你的专属AI伴侣
                </p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <AvatarCustomizer />
              </motion.div>

              <motion.div variants={itemVariants} className="flex gap-3 mt-4">
                <motion.button
                  onClick={() => setStep("companion")}
                  className="flex-1 py-3.5 rounded-[14px] font-medium text-[14px]"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#8A8880",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  上一步
                </motion.button>
                <motion.button
                  onClick={handleAvatarComplete}
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-[14px] font-semibold text-[14px] text-[#0C0C14] transition-all"
                  style={
                    isLoading
                      ? { background: "rgba(255, 255, 255, 0.06)", color: "#5A5854" }
                      : {
                          background: "linear-gradient(135deg, #D4A574, #C9956A)",
                          boxShadow: "0 4px 16px rgba(212, 165, 116, 0.2)",
                        }
                  }
                  whileTap={!isLoading ? { scale: 0.97 } : {}}
                >
                  {isLoading ? "创建中..." : "完成，开始聊天"}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
