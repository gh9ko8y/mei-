"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Users, Palette, Sparkles, User } from "lucide-react";
import LoginModal from "../components/LoginModal";
import ChatTab from "../components/tabs/ChatTab";
import RelationshipTab from "../components/tabs/RelationshipTab";
import DressUpTab from "../components/tabs/DressUpTab";
import DynamicTab from "../components/tabs/DynamicTab";
import ProfileTab from "../components/tabs/ProfileTab";

const tabs = [
  { id: "chat", label: "聊天", icon: MessageSquare, requireAuth: false },
  { id: "relationship", label: "关系", icon: Users, requireAuth: false },
  { id: "dressup", label: "装扮", icon: Palette, requireAuth: false },
  { id: "dynamic", label: "动态", icon: Sparkles, requireAuth: false },
  { id: "profile", label: "我的", icon: User, requireAuth: false },
];

const tabVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("aria_token");
    const user = localStorage.getItem("aria_user");
    if (token && user) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(user));
    }
  }, []);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.requireAuth && !isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  const handleLogin = async (ariaId: string, password: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aria_id: ariaId, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("aria_token", data.access_token);
        localStorage.setItem("aria_user", JSON.stringify({ id: data.user_id, aria_id: data.aria_id, nickname: data.nickname }));
        setIsLoggedIn(true);
        setUserInfo({ id: data.user_id, aria_id: data.aria_id, nickname: data.nickname });
        setShowLoginModal(false);
      } else {
        alert(data.detail || "登录失败");
      }
    } catch (e) {
      console.error("登录失败:", e);
      alert("网络错误");
    }
  };

  const handleRegister = async (data: { username: string; email: string; password: string; code: string }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219:4360"}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.access_token) {
        localStorage.setItem("aria_token", result.access_token);
        localStorage.setItem("aria_user", JSON.stringify({ id: result.user_id, username: result.username, nickname: data.username }));
        setIsLoggedIn(true);
        setUserInfo({ id: result.user_id, username: result.username, nickname: data.username });
        setShowLoginModal(false);
        alert("注册成功！");
      } else {
        alert(result.detail || "注册失败");
      }
    } catch (e) {
      console.error("注册失败:", e);
      alert("网络错误");
    }
  };

  const handleForgotPassword = async (email: string) => {
    alert("重置邮件已发送到 " + email);
  };

  const handleLogout = () => {
    localStorage.removeItem("aria_token");
    localStorage.removeItem("aria_user");
    setIsLoggedIn(false);
    setUserInfo(null);
    setActiveTab("chat");
  };

  return (
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#FFF8F5]">
      <main className="flex-1 overflow-y-auto scrollbar-thin relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="h-full"
          >
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "relationship" && <RelationshipTab />}
            {activeTab === "dressup" && <DressUpTab />}
            {activeTab === "dynamic" && <DynamicTab />}
            {activeTab === "profile" && (
              <ProfileTab
                isLoggedIn={isLoggedIn}
                userInfo={userInfo}
                onLogin={() => setShowLoginModal(true)}
                onLogout={handleLogout}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="flex h-[60px] bg-white/72 backdrop-blur-[20px] saturate-[180%] border-t border-[rgba(0,0,0,0.05)] z-50 pb-safe shrink-0 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = tab.requireAuth && !isLoggedIn;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${
                isActive ? "text-[#E85D75]" : "text-[#A0A0B0] hover:text-[#6B6B7B]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 w-8 h-[3px] bg-gradient-to-r from-[#E85D75] to-[#F28C8C] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              </motion.div>
              <motion.span
                className="text-[10px] font-medium"
                animate={{ opacity: isActive ? 1 : 0.7 }}
                transition={{ duration: 0.15 }}
              >
                {tab.label}
              </motion.span>
              {isLocked && (
                <div className="absolute top-1 right-3 w-3 h-3 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-[6px] text-white">🔒</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
      />
    </div>
  );
}
