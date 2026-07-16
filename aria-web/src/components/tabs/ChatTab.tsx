"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Send,
  Image,
  Smile,
  MoreHorizontal,
  Search,
  User,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219";

// 聊天列表项
interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

// 动画配置
const listContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const userMessageVariants = {
  hidden: { opacity: 0, x: 20, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const aiMessageVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  show: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const typingDot = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export default function ChatTab() {
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 聊天列表 — 移除 emoji，使用名称代替
  const chatList: ChatItem[] = [
    {
      id: "ai",
      name: "AI伴侣",
      avatar: "",
      lastMessage: "今天天气真好~",
      time: "刚刚",
      unread: 0,
    },
  ];

  useEffect(() => {
    if (showChat) {
      const token = localStorage.getItem("aria_token");
      if (token) {
        fetch(`${API_BASE}/chat/history?user_id=1`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => setMessages(data || []))
          .catch(console.error);
      }
    }
  }, [showChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatClick = (chat: ChatItem) => {
    setSelectedChat(chat);
    setShowChat(true);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    setInputText("");
    setIsLoading(true);

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: text,
      valid_start: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const token = localStorage.getItem("aria_token");
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: 1, content: text }),
      });
      const data = await res.json();
      if (data.reply) {
        const aiMsg = {
          id: data.event_id,
          role: "assistant",
          content: data.reply,
          valid_start: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  // 聊天列表视图
  if (!showChat) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col h-[calc(100vh-60px)] bg-[#0C0C14]"
      >
        {/* 顶部搜索栏 */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-[rgba(255,255,255,0.06)] rounded-[14px] border border-[rgba(255,255,255,0.06)] transition-all duration-200 focus-within:border-[#D4A574] focus-within:bg-[rgba(255,255,255,0.08)] focus-within:shadow-[0_0_0_3px_rgba(212,165,116,0.1)]">
            <Search size={16} className="text-[#5A5854]" />
            <input
              type="text"
              placeholder="搜索"
              className="flex-1 bg-transparent text-sm outline-none text-[#E8E6E3] placeholder:text-[#5A5854]"
            />
          </div>
        </div>

        {/* 聊天列表 */}
        <motion.div
          className="flex-1 overflow-y-auto"
          variants={listContainer}
          initial="hidden"
          animate="show"
        >
          {chatList.map((chat) => (
            <motion.div
              key={chat.id}
              variants={listItem}
              onClick={() => handleChatClick(chat)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.03)] cursor-pointer transition-colors duration-150 border-b border-[rgba(255,255,255,0.04)]"
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9956A] flex items-center justify-center shadow-[0_2px_8px_rgba(212,165,116,0.25)]">
                  <User size={20} className="text-[#0C0C14]" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#6B9B9A] rounded-full border-2 border-[#0C0C14]"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#E8E6E3]">
                    {chat.name}
                  </span>
                  <span className="text-[11px] text-[#5A5854] font-medium">
                    {chat.time}
                  </span>
                </div>
                <p className="text-[13px] text-[#8A8880] truncate">
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="min-w-[18px] h-[18px] rounded-full bg-gradient-to-r from-[#D4A574] to-[#C9956A] flex items-center justify-center px-1">
                  <span className="text-[10px] text-[#0C0C14] font-semibold">
                    {chat.unread}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // 聊天界面
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-60px)] bg-[#0C0C14]"
    >
      {/* 顶部栏 — glass-nav 效果 */}
      <div className="sticky top-0 z-10 backdrop-blur-[24px] bg-[rgba(12,12,20,0.72)] border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowChat(false)}
            className="text-[#8A8880] hover:text-[#E8E6E3] transition-colors p-1"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={24} />
          </motion.button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A574] to-[#C9956A] flex items-center justify-center shadow-[0_2px_6px_rgba(212,165,116,0.25)]">
            <User size={16} className="text-[#0C0C14]" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-sm text-[#E8E6E3]">
              {selectedChat?.name}
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6B9B9A]"></div>
              <span className="text-[10px] text-[#6B9B9A] font-medium">
                在线
              </span>
            </div>
          </div>
          <motion.button
            className="text-[#8A8880] hover:text-[#E8E6E3] transition-colors p-1"
            whileTap={{ scale: 0.9 }}
          >
            <MoreHorizontal size={20} />
          </motion.button>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              variants={
                msg.role === "user" ? userMessageVariants : aiMessageVariants
              }
              initial="hidden"
              animate="show"
              layout
            >
              <div className="max-w-[80%]">
                <div
                  className={`px-3.5 py-2.5 text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[rgba(212,165,116,0.12)] text-[#E8C9A0] rounded-[16px_16px_4px_16px] border border-[rgba(212,165,116,0.15)]"
                      : "bg-[rgba(255,255,255,0.04)] text-[#E8E6E3] rounded-[16px_16px_16px_4px] border border-[rgba(255,255,255,0.06)]"
                  }`}
                >
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] text-[#5A5854] mt-1 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(msg.valid_start)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 正在输入 */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="bg-[rgba(255,255,255,0.04)] rounded-[16px_16px_16px_4px] border border-[rgba(255,255,255,0.06)] px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#D4A574]"
                    variants={typingDot}
                    animate="animate"
                    transition={{ delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#D4A574]"
                    variants={typingDot}
                    animate="animate"
                    transition={{ delay: 0.15 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-[#D4A574]"
                    variants={typingDot}
                    animate="animate"
                    transition={{ delay: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* 输入栏 — glass-nav 效果 */}
      <div className="sticky bottom-0 backdrop-blur-[24px] bg-[rgba(12,12,20,0.72)] border-t border-[rgba(255,255,255,0.06)] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <motion.button
            className="p-2 text-[#5A5854] hover:text-[#D4A574] transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Smile size={20} />
          </motion.button>
          <motion.button
            className="p-2 text-[#5A5854] hover:text-[#D4A574] transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <Image size={20} />
          </motion.button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="说点什么..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-[rgba(255,255,255,0.06)] rounded-[14px] text-[15px] outline-none text-[#E8E6E3] placeholder:text-[#5A5854] border border-[rgba(255,255,255,0.06)] transition-all duration-200 focus:border-[#D4A574] focus:bg-[rgba(255,255,255,0.08)] focus:shadow-[0_0_0_3px_rgba(212,165,116,0.1)] disabled:opacity-50"
          />
          <motion.button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="p-2.5 bg-gradient-to-r from-[#D4A574] to-[#C9956A] text-[#0C0C14] rounded-full shadow-[0_2px_8px_rgba(212,165,116,0.25)] hover:shadow-[0_4px_12px_rgba(212,165,116,0.35)] disabled:opacity-40 disabled:shadow-none transition-shadow"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}