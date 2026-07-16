"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, Image, Smile, MoreHorizontal, Search, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219";

interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

const chatList: ChatItem[] = [
  { id: "ai", name: "AI伴侣", avatar: "🥰", lastMessage: "今天天气真好~", time: "刚刚", unread: 0 },
  { id: "ai2", name: "小暖", avatar: "☀️", lastMessage: "记得多喝水哦", time: "5分钟前", unread: 2 },
  { id: "ai3", name: "知心姐姐", avatar: "🌙", lastMessage: "我在听，你说吧", time: "1小时前", unread: 0 },
  { id: "ai4", name: "开心果", avatar: "😄", lastMessage: "哈哈哈太好笑了", time: "昨天", unread: 0 },
  { id: "ai5", name: "温柔学姐", avatar: "🌸", lastMessage: "加油，你可以的！", time: "昨天", unread: 1 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function ChatTab() {
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
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
        const aiMsg: ChatMessage = {
          id: data.event_id,
          role: "assistant",
          content: data.reply,
          time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
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

  const filteredChatList = chatList.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Chat list view
  if (!showChat) {
    return (
      <div className="flex flex-col h-[calc(100dvh-60px)] bg-[#FFF8F5]">
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0B0]" />
            <input
              type="text"
              placeholder="搜索"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 bg-[#F7F7F9] rounded-[14px] text-sm outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A0B0] hover:text-[#6B6B7B]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <motion.div
          className="flex-1 overflow-y-auto scrollbar-thin"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredChatList.map((chat) => (
            <motion.div
              key={chat.id}
              variants={itemVariants}
              whileHover={{ backgroundColor: "rgba(232, 93, 117, 0.04)" }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleChatClick(chat)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center text-xl shadow-md">
                  {chat.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#4CAF7A] rounded-full border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#2D2D3A]">{chat.name}</span>
                  <span className="text-[11px] text-[#A0A0B0]">{chat.time}</span>
                </div>
                <p className="text-xs text-[#6B6B7B] truncate mt-0.5">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="shrink-0 min-w-[20px] h-5 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] rounded-full flex items-center justify-center px-1.5"
                >
                  <span className="text-[10px] text-white font-bold">{chat.unread}</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Chat detail view
  return (
    <div className="flex flex-col h-[calc(100dvh-60px)] bg-[#FFF8F5]">
      <div className="sticky top-0 z-10 bg-white/72 backdrop-blur-[20px] saturate-[180%] border-b border-[rgba(0,0,0,0.05)] px-4 py-3 flex items-center gap-3">
        <motion.button
          onClick={() => setShowChat(false)}
          className="text-[#6B6B7B] hover:text-[#2D2D3A] p-1 -ml-1"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center text-sm shadow-sm">
          {selectedChat?.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-[#2D2D3A] block">{selectedChat?.name}</span>
          <span className="text-[11px] text-[#4CAF7A]">在线</span>
        </div>
        <button className="text-[#A0A0B0] hover:text-[#6B6B7B] p-1">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{
                opacity: 0,
                x: msg.role === "user" ? 20 : -20,
                scale: 0.95,
              }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[80%] space-y-1">
                <div
                  className={`px-3.5 py-2.5 text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#E85D75] to-[#F28C8C] text-white rounded-[20px] rounded-br-[4px] shadow-[0_2px_8px_rgba(232,93,117,0.25)]"
                      : "bg-white text-[#2D2D3A] rounded-[20px] rounded-bl-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.03)]"
                  }`}
                >
                  {msg.content}
                </div>
                <p className={`text-[10px] text-[#A0A0B0] ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  {msg.time ? msg.time : formatTime(msg.time)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white rounded-[20px] rounded-bl-[4px] shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.03)] px-4 py-3 flex items-center gap-1.5">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-[#E85D75] rounded-full"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                className="w-2 h-2 bg-[#E85D75] rounded-full opacity-60"
              />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                className="w-2 h-2 bg-[#E85D75] rounded-full opacity-30"
              />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 bg-white/72 backdrop-blur-[20px] saturate-[180%] border-t border-[rgba(0,0,0,0.05)] px-3 py-2">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 text-[#A0A0B0] hover:text-[#E85D75] transition-colors"
          >
            <Image size={20} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-2 text-[#A0A0B0] hover:text-[#E85D75] transition-colors"
          >
            <Smile size={20} />
          </motion.button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="说点什么..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-[#F7F7F9] rounded-full text-[15px] outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] disabled:opacity-50"
          />
          <motion.button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            whileTap={{ scale: 0.9 }}
            className={`p-2.5 rounded-full transition-all duration-200 ${
              inputText.trim()
                ? "bg-gradient-to-br from-[#E85D75] to-[#F28C8C] text-white shadow-[0_2px_8px_rgba(232,93,117,0.3)]"
                : "bg-[#F7F7F9] text-[#A0A0B0]"
            } disabled:opacity-50`}
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
