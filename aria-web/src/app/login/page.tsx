"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPersona, getPresets, type PersonaPreset } from "../../lib/api";
import { useUserStore, useAIPartnerStore } from "../../lib/store";
import { useAvatarStore } from "../../lib/avatar/store";
import AvatarRenderer from "../../components/avatar/AvatarRenderer";
import AvatarCustomizer from "../../components/avatar/AvatarCustomizer";

export default function LoginPage() {
  const router = useRouter();
  const { setLogin } = useUserStore();
  const { setPartner } = useAIPartnerStore();
  const { config: avatarConfig, resetConfig } = useAvatarStore();
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
    { name: "白羊座", emoji: "♈", date: "3.21-4.19" },
    { name: "金牛座", emoji: "♉", date: "4.20-5.20" },
    { name: "双子座", emoji: "♊", date: "5.21-6.21" },
    { name: "巨蟹座", emoji: "♋", date: "6.22-7.22" },
    { name: "狮子座", emoji: "♌", date: "7.23-8.22" },
    { name: "处女座", emoji: "♍", date: "8.23-9.22" },
    { name: "天秤座", emoji: "♎", date: "9.23-10.23" },
    { name: "天蝎座", emoji: "♏", date: "10.24-11.22" },
    { name: "射手座", emoji: "♐", date: "11.23-12.21" },
    { name: "摩羯座", emoji: "♑", date: "12.22-1.19" },
    { name: "水瓶座", emoji: "♒", date: "1.20-2.18" },
    { name: "双鱼座", emoji: "♓", date: "2.19-3.20" },
  ];

  const companions = [
    { name: "温柔女友", emoji: "🥰", desc: "温柔体贴，善解人意", mbti: "ENFJ", zodiac: "巨蟹座" },
    { name: "毒舌闺蜜", emoji: "😏", desc: "嘴上不饶人，心里很在乎", mbti: "ENTP", zodiac: "天蝎座" },
    { name: "理性导师", emoji: "🧠", desc: "冷静睿智，善于分析", mbti: "INTJ", zodiac: "摩羯座" },
    { name: "元气少女", emoji: "✨", desc: "活泼开朗，充满正能量", mbti: "ENFP", zodiac: "白羊座" },
    { name: "高冷才子", emoji: "😎", desc: "话不多但每句有深度", mbti: "INTP", zodiac: "水瓶座" },
    { name: "阳光暖男", emoji: "☀️", desc: "温暖可靠，像冬天的阳光", mbti: "ESFJ", zodiac: "天秤座" },
    { name: "神秘学姐", emoji: "🌙", desc: "成熟优雅，有故事感", mbti: "INFJ", zodiac: "天蝎座" },
    { name: "反差少年", emoji: "🔥", desc: "平时酷酷的，熟了很粘人", mbti: "ISTP", zodiac: "天蝎座" },
  ];

  // 选择伴侣后，进入捏脸步骤
  const handleCompanionSelected = () => {
    if (!selectedCompanion) return;
    setStep("avatar");
  };

  // 捏脸完成后，保存所有信息
  const handleAvatarComplete = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. 创建人格
      const persona = await createPersona(1, selectedCompanion);

      // 2. 更新状态
      setLogin(1, "用户", selectedMBTI || undefined, selectedZodiac || undefined);
      setPartner(persona.name, persona.mbti, persona.zodiac);

      // 3. 跳转主页
      router.push("/");
    } catch (e) {
      console.error(e);
      alert("创建失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 欢迎页 */}
        {step === "welcome" && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🥰</div>
            <h1 className="text-3xl font-bold text-purple-800">Aria</h1>
            <p className="text-gray-600">你的AI伴侣，懂你、陪你、记住你</p>
            <button
              onClick={() => setStep("login")}
              className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
            >
              开始
            </button>
            <button
              onClick={() => setStep("mbti")}
              className="w-full py-3 bg-white text-purple-500 rounded-xl font-medium border border-purple-200 hover:bg-purple-50 transition-colors"
            >
              跳过，直接选择伴侣
            </button>
            <button
              onClick={() => {
                setLogin(1, "用户");
                router.push("/");
              }}
              className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              直接进入
            </button>
          </div>
        )}

        {/* 登录页 */}
        {step === "login" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">登录</h2>
            <div className="space-y-3">
              <input
                type="tel"
                placeholder="手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-300 outline-none"
              />
              <button
                onClick={() => {
                  if (phone) setLogin(1, phone);
                  setStep("mbti");
                }}
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600"
              >
                获取验证码
              </button>
            </div>
            <button
              onClick={() => {
                setLogin(1, "用户");
                setStep("mbti");
              }}
              className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200"
            >
              跳过登录
            </button>
          </div>
        )}

        {/* MBTI选择 */}
        {step === "mbti" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">你的MBTI是什么？</h2>
              <p className="text-sm text-gray-500 mt-1">选填，帮助我们推荐更适合你的AI伴侣</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {mbtiTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedMBTI(type)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedMBTI === type
                      ? "bg-purple-500 text-white"
                      : "bg-white border border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("zodiac")}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                跳过
              </button>
              <button
                onClick={() => setStep("zodiac")}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* 星座选择 */}
        {step === "zodiac" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">你的星座是什么？</h2>
              <p className="text-sm text-gray-500 mt-1">选填，帮助AI更好地了解你</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {zodiacSigns.map((z) => (
                <button
                  key={z.name}
                  onClick={() => setSelectedZodiac(z.name)}
                  className={`py-3 px-2 rounded-xl text-center transition-colors ${
                    selectedZodiac === z.name
                      ? "bg-purple-500 text-white"
                      : "bg-white border border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="text-2xl">{z.emoji}</div>
                  <div className="text-xs font-medium mt-1">{z.name}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep("companion")}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                跳过
              </button>
              <button
                onClick={() => setStep("companion")}
                className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* AI伴侣选择 */}
        {step === "companion" && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold">选择你的AI伴侣</h2>
              <p className="text-sm text-gray-500 mt-1">每个都有独特的性格和风格</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {companions.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCompanion(c.name)}
                  className={`p-4 rounded-xl text-left transition-colors ${
                    selectedCompanion === c.name
                      ? "bg-purple-100 border-2 border-purple-500"
                      : "bg-white border border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="text-3xl mb-2">{c.emoji}</div>
                  <div className="font-semibold text-sm">{c.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.desc}</div>
                  <div className="flex gap-1 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full">{c.mbti}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full">{c.zodiac}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAvatarComplete}
                disabled={!selectedCompanion}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  selectedCompanion
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                跳过
              </button>
              <button
                onClick={handleCompanionSelected}
                disabled={!selectedCompanion}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  selectedCompanion
                    ? "bg-purple-500 text-white hover:bg-purple-600"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                下一步：设计形象
              </button>
            </div>
          </div>
        )}

        {/* 捏脸步骤 */}
        {step === "avatar" && (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold">设计{selectedCompanion}的形象</h2>
              <p className="text-sm text-gray-500 mt-1">调整外观参数，打造你的专属AI伴侣</p>
            </div>

            <AvatarCustomizer />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep("companion")}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium"
              >
                上一步
              </button>
              <button
                onClick={handleAvatarComplete}
                disabled={isLoading}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  isLoading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                {isLoading ? "创建中..." : "完成，开始聊天"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
