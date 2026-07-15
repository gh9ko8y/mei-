"use client";

import { useState, useEffect } from "react";
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
    <div className="flex flex-col h-screen max-w-md mx-auto">
      {/* 内容区域 */}
      <main className="flex-1 overflow-y-auto">
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
      </main>

      {/* 底部导航栏 */}
      <nav className="flex border-t border-gray-100 bg-white/80 backdrop-blur-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isLocked = tab.requireAuth && !isLoggedIn;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 transition-colors relative ${
                isActive ? "text-indigo-500" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <div className="relative">
                <Icon size={22} />
                {isLocked && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-[6px] text-white">🔒</span>
                  </div>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium">{tab.label}</span>
            </button>
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
