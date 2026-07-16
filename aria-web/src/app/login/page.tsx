"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createPersona } from "../../lib/api";
import { useUserStore, useAIPartnerStore } from "../../lib/store";
import { useAvatarStore } from "../../lib/avatar/store";
import AvatarCustomizer from "../../components/avatar/AvatarCustomizer";
import {
  Bot,
  Sparkles,
  ChevronRight,
  Phone,
  Flame,
  Leaf,
  Star,
  Moon,
  Sun,
  Zap,
  Crown,
  Heart,
  Wand2,
} from "lucide-react";

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 60 : -60, opacity: 0 }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function LoginPage() {
  const router = useRouter();
  const { setLogin } = useUserStore();
  const { setPartner } = useAIPartnerStore();
  const { config: avatarConfig, resetConfig } = useAvatarStore();
  const [step, setStep] = useState<"welcome" | "login" | "mbti" | "zodiac" | "companion" | "avatar">("welcome");
  const [direction, setDirection] = useState(1);
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
    { name: "白羊座", icon: Flame, color: "from-[#E85D75] to-[#F28C8C]" },
    { name: "金牛座", icon: Leaf, color: "from-[#4CAF7A] to-[#6BC194]" },
    { name: "双子座", icon: Zap, color: "from-[#F5A623] to-[#F7BE5E]" },
    { name: "巨蟹座", icon: Moon, color: "from-[#6B8DD6] to-[#8BA5E0]" },
    { name: "狮子座", icon: Sun, color: "from-[#F5A623] to-[#F7BE5E]" },
    { name: "处女座", icon: Star, color: "from-[#9B6DD5] to-[#B794E0]" },
    { name: "天秤座", icon: Crown, color: "from-[#E85D75] to-[#F28C8C]" },
    { name: "天蝎座", icon: Heart, color: "from-[#C44569] to-[#E85D75]" },
    { name: "射手座", icon: Zap, color: "from-[#F5A623] to-[#F7BE5E]" },
    { name: "摩羯座", icon: Crown, color: "from-[#2AA876] to-[#4DC99A]" },
    { name: "水瓶座", icon: Star, color: "from-[#6B8DD6] to-[#8BA5E0]" },
    { name: "双鱼座", icon: Heart, color: "from-[#9B6DD5] to-[#B794E0]" },
  ];

  const companions = [
    { name: "温柔女友", icon: Heart, desc: "温柔体贴，善解人意", mbti: "ENFJ", zodiac: "巨蟹座", color: "from-[#E85D75] to-[#F28C8C]" },
    { name: "毒舌闺蜜", icon: Zap, desc: "嘴上不饶人，心里很在乎", mbti: "ENTP", zodiac: "天蝎座", color: "from-[#9B6DD5] to-[#B794E0]" },
    { name: "理性导师", icon: Crown, desc: "冷静睿智，善于分析", mbti: "INTJ", zodiac: "摩羯座", color: "from-[#6B8DD6] to-[#8BA5E0]" },
    { name: "元气少女", icon: Sparkles, desc: "活泼开朗，充满正能量", mbti: "ENFP", zodiac: "白羊座", color: "from-[#F5A623] to-[#F7BE5E]" },
    { name: "高冷才子", icon: Star, desc: "话不多但每句有深度", mbti: "INTP", zodiac: "水瓶座", color: "from-[#4CAF7A] to-[#6BC194]" },
    { name: "阳光暖男", icon: Sun, desc: "温暖可靠，像冬天的阳光", mbti: "ESFJ", zodiac: "天秤座", color: "from-[#E85D75] to-[#F28C8C]" },
    { name: "神秘学姐", icon: Moon, desc: "成熟优雅，有故事感", mbti: "INFJ", zodiac: "天蝎座", color: "from-[#C44569] to-[#E85D75]" },
    { name: "反差少年", icon: Flame, desc: "平时酷酷的，熟了很粘人", mbti: "ISTP", zodiac: "天蝎座", color: "from-[#2AA876] to-[#4DC99A]" },
  ];

  const goToStep = (newStep: typeof step, dir: number) => {
    setDirection(dir);
    setStep(newStep);
  };

  const handleCompanionSelected = () => {
    if (!selectedCompanion) return;
    goToStep("avatar", 1);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F3] via-[#FFF8F5] to-[#FCE4EC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-[#E85D75]/10 to-transparent rounded-full blur-xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-br from-[#F28C8C]/10 to-transparent rounded-full blur-xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-24 h-24 bg-gradient-to-br from-[#C44569]/5 to-transparent rounded-full blur-lg pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Welcome */}
            {step === "welcome" && (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="text-center space-y-6 py-8"
              >
                <motion.div variants={staggerItem} className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#E85D75]/20 to-[#F28C8C]/20 rounded-[24px] blur-xl scale-110" />
                  <div className="relative w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(232,93,117,0.3)]">
                    <Bot size={40} className="text-white" />
                  </div>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <h1 className="text-[32px] font-bold text-gradient bg-gradient-to-r from-[#E85D75] to-[#F28C8C] bg-clip-text text-transparent">
                    Aria
                  </h1>
                  <p className="text-[#6B6B7B] mt-2 text-sm">你的AI伴侣，懂你、陪你、记住你</p>
                </motion.div>

                <motion.div variants={staggerItem} className="space-y-3 pt-4">
                  <motion.button
                    onClick={() => goToStep("login", 1)}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[16px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.3)] flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    开始旅程
                  </motion.button>
                  <motion.button
                    onClick={() => goToStep("mbti", 1)}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 bg-white/60 backdrop-blur-sm text-[#E85D75] rounded-[16px] font-medium border border-[rgba(232,93,117,0.2)] hover:bg-white/80 transition-colors"
                  >
                    跳过，直接选择伴侣
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setLogin(1, "用户");
                      router.push("/");
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3 text-[#A0A0B0] text-sm hover:text-[#6B6B7B] transition-colors"
                  >
                    直接进入
                  </motion.button>
                </motion.div>

                <motion.p variants={staggerItem} className="text-[11px] text-[#A0A0B0] pt-4">
                  注册即表示同意用户协议和隐私政策
                </motion.p>
              </motion.div>
            )}

            {/* Login */}
            {step === "login" && (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
                <motion.div variants={staggerItem} className="text-center">
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(232,93,117,0.25)]">
                    <Phone size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2D2D3A]">登录</h2>
                </motion.div>

                <motion.div variants={staggerItem} className="space-y-3">
                  <input
                    type="tel"
                    placeholder="手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
                  />
                  <motion.button
                    onClick={() => { if (phone) setLogin(1, phone); goToStep("mbti", 1); }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[16px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
                  >
                    获取验证码
                  </motion.button>
                </motion.div>

                <motion.button
                  variants={staggerItem}
                  onClick={() => { setLogin(1, "用户"); goToStep("mbti", 1); }}
                  className="w-full py-3 bg-[#F7F7F9] text-[#6B6B7B] rounded-[16px] font-medium hover:bg-[#F0F0F3] transition-colors"
                >
                  跳过登录
                </motion.button>

                <motion.button
                  variants={staggerItem}
                  onClick={() => goToStep("welcome", -1)}
                  className="w-full text-sm text-[#E85D75] font-medium"
                >
                  ← 返回
                </motion.button>
              </motion.div>
            )}

            {/* MBTI */}
            {step === "mbti" && (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
                <motion.div variants={staggerItem} className="text-center">
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#9B6DD5] to-[#B794E0] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(155,109,213,0.25)]">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2D2D3A]">你的MBTI是什么？</h2>
                  <p className="text-sm text-[#6B6B7B] mt-1">选填，帮助我们推荐更适合你的AI伴侣</p>
                </motion.div>

                <motion.div variants={staggerItem} className="grid grid-cols-4 gap-2">
                  {mbtiTypes.map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setSelectedMBTI(type)}
                      whileTap={{ scale: 0.93 }}
                      className={`py-2.5 px-2 rounded-[12px] text-sm font-semibold transition-all duration-200 ${
                        selectedMBTI === type
                          ? "bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white shadow-[0_2px_8px_rgba(232,93,117,0.25)]"
                          : "bg-white border border-[#E5E5EB] text-[#2D2D3A] hover:border-[#E85D75] hover:text-[#E85D75]"
                      }`}
                    >
                      {type}
                    </motion.button>
                  ))}
                </motion.div>

                <motion.div variants={staggerItem} className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => goToStep("zodiac", 1)}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 bg-[#F7F7F9] text-[#6B6B7B] rounded-[16px] font-medium hover:bg-[#F0F0F3] transition-colors"
                  >
                    跳过
                  </motion.button>
                  <motion.button
                    onClick={() => goToStep("zodiac", 1)}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[16px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.25)] flex items-center justify-center gap-1"
                  >
                    下一步 <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Zodiac */}
            {step === "zodiac" && (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
                <motion.div variants={staggerItem} className="text-center">
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#6B8DD6] to-[#8BA5E0] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(107,141,214,0.25)]">
                    <Star size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2D2D3A]">你的星座是什么？</h2>
                  <p className="text-sm text-[#6B6B7B] mt-1">选填，帮助AI更好地了解你</p>
                </motion.div>

                <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2.5">
                  {zodiacSigns.map((z) => {
                    const Icon = z.icon;
                    return (
                      <motion.button
                        key={z.name}
                        onClick={() => setSelectedZodiac(z.name)}
                        whileTap={{ scale: 0.93 }}
                        className={`py-3 px-2 rounded-[16px] text-center transition-all duration-200 ${
                          selectedZodiac === z.name
                            ? `bg-gradient-to-br ${z.color} text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]`
                            : "bg-white border border-[#E5E5EB] hover:border-[#E85D75]"
                        }`}
                      >
                        <Icon size={22} className={`mx-auto mb-1 ${selectedZodiac === z.name ? "text-white" : "text-[#6B6B7B]"}`} />
                        <div className={`text-xs font-semibold ${selectedZodiac === z.name ? "text-white" : "text-[#2D2D3A]"}`}>
                          {z.name}
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div variants={staggerItem} className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => goToStep("companion", 1)}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 bg-[#F7F7F9] text-[#6B6B7B] rounded-[16px] font-medium"
                  >
                    跳过
                  </motion.button>
                  <motion.button
                    onClick={() => goToStep("companion", 1)}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[16px] font-semibold shadow-[0_4px_16px_rgba(232,93,117,0.25)] flex items-center justify-center gap-1"
                  >
                    下一步 <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Companion */}
            {step === "companion" && (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
                <motion.div variants={staggerItem} className="text-center">
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(232,93,117,0.25)]">
                    <Heart size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2D2D3A]">选择你的AI伴侣</h2>
                  <p className="text-sm text-[#6B6B7B] mt-1">每个都有独特的性格和风格</p>
                </motion.div>

                <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                  {companions.map((c) => {
                    const Icon = c.icon;
                    return (
                      <motion.button
                        key={c.name}
                        onClick={() => setSelectedCompanion(c.name)}
                        whileTap={{ scale: 0.96 }}
                        whileHover={{ y: -2 }}
                        className={`p-4 rounded-[16px] text-left transition-all duration-200 ${
                          selectedCompanion === c.name
                            ? "bg-gradient-to-br from-[#FCE4EC] to-[#FFF0F3] border-2 border-[#E85D75] shadow-[0_4px_16px_rgba(232,93,117,0.2)]"
                            : "bg-white border border-[#E5E5EB] hover:border-[#E85D75]/50 hover:shadow-md"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center mb-2`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <div className="font-semibold text-sm text-[#2D2D3A]">{c.name}</div>
                        <div className="text-[11px] text-[#6B6B7B] mt-0.5 line-clamp-1">{c.desc}</div>
                        <div className="flex gap-1 mt-2">
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#FCE4EC] text-[#E85D75] rounded-full font-medium">{c.mbti}</span>
                          <span className="text-[9px] px-1.5 py-0.5 bg-[#E8F4FD] text-[#6B8DD6] rounded-full font-medium">{c.zodiac}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div variants={staggerItem} className="flex gap-3 pt-2">
                  <motion.button
                    onClick={handleAvatarComplete}
                    disabled={!selectedCompanion}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 py-3 rounded-[16px] font-medium transition-all ${
                      selectedCompanion
                        ? "bg-[#F7F7F9] text-[#6B6B7B] hover:bg-[#F0F0F3]"
                        : "bg-[#F0F0F3] text-[#A0A0B0] cursor-not-allowed"
                    }`}
                  >
                    跳过
                  </motion.button>
                  <motion.button
                    onClick={handleCompanionSelected}
                    disabled={!selectedCompanion}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 py-3 rounded-[16px] font-semibold transition-all flex items-center justify-center gap-1 ${
                      selectedCompanion
                        ? "bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
                        : "bg-[#F0F0F3] text-[#A0A0B0] cursor-not-allowed"
                    }`}
                  >
                    下一步 <ChevronRight size={16} />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Avatar */}
            {step === "avatar" && (
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
                <motion.div variants={staggerItem} className="text-center">
                  <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#9B6DD5] to-[#B794E0] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_16px_rgba(155,109,213,0.25)]">
                    <Wand2 size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#2D2D3A]">设计{selectedCompanion}的形象</h2>
                  <p className="text-sm text-[#6B6B7B] mt-1">调整外观参数，打造你的专属AI伴侣</p>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <AvatarCustomizer />
                </motion.div>

                <motion.div variants={staggerItem} className="flex gap-3 pt-2">
                  <motion.button
                    onClick={() => goToStep("companion", -1)}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 bg-[#F7F7F9] text-[#6B6B7B] rounded-[16px] font-medium hover:bg-[#F0F0F3] transition-colors"
                  >
                    上一步
                  </motion.button>
                  <motion.button
                    onClick={handleAvatarComplete}
                    disabled={isLoading}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 py-3 rounded-[16px] font-semibold transition-all flex items-center justify-center gap-1 ${
                      isLoading
                        ? "bg-[#F0F0F3] text-[#A0A0B0] cursor-not-allowed"
                        : "bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
                    }`}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      "完成，开始聊天"
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
