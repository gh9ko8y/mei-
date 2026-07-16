"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Users, Palette, Sparkles, User, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const tabContentVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("chat");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // 检查是否已登录
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
    // 忘记密码逻辑
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
    <div className="flex flex-col h-[100dvh] max-w-md mx-auto bg-[#0C0C14]">
      {/* 内容区域 */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          {activeTab === "chat" && (
            <motion.div
              key="chat"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              <ChatTab />
            </motion.div>
          )}
          {activeTab === "relationship" && (
            <motion.div
              key="relationship"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              <RelationshipTab />
            </motion.div>
          )}
          {activeTab === "dressup" && (
            <motion.div
              key="dressup"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              <DressUpTab />
            </motion.div>
          )}
          {activeTab === "dynamic" && (
            <motion.div
              key="dynamic"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              <DynamicTab />
            </motion.div>
          )}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              <ProfileTab
                isLoggedIn={isLoggedIn}
                userInfo={userInfo}
                onLogin={() => setShowLoginModal(true)}
                onLogout={handleLogout}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 底部导航栏 - V2 深色玻璃拟态 */}
      <nav
        className="glass-nav flex h-[60px] z-50"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = tab.requireAuth && !isLoggedIn;
          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              className={`flex-1 flex flex-col items-center justify-center relative ${
                isActive ? "text-[#D4A574]" : "text-[#5A5854]"
              }`}
            >
              {/* 激活指示器 - 顶部琥珀渐变横条 */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute top-0 h-[3px] w-6 rounded-full bg-gradient-to-r from-[#D4A574] to-[#C9956A]"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
              <div className="relative">
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.34, 1.56, 0.64, 1],
                  }}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                </motion.div>
                {isLocked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#5A5854] rounded-full flex items-center justify-center">
                    <Lock size={8} className="text-[#0C0C14]" />
                  </div>
                )}
              </div>
              <motion.span
                className="text-[10px] mt-0.5 font-medium"
                animate={{ opacity: isActive ? 1 : 0.6 }}
                transition={{ duration: 0.15 }}
              >
                {tab.label}
              </motion.span>
            </motion.button>
          );
        })}
      </nav>

      {/* 登录弹窗 */}
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