"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, Image, Smile, MoreHorizontal, Search } from "lucide-react";

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

export default function ChatTab() {
  const [showChat, setShowChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 模拟聊天列表
  const chatList: ChatItem[] = [
    { id: "ai", name: "AI伴侣", avatar: "🥰", lastMessage: "今天天气真好~", time: "刚刚", unread: 0 },
  ];

  useEffect(() => {
    if (showChat) {
      // 加载聊天记录
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
      <div className="flex flex-col h-[calc(100vh-60px)]">
        {/* 顶部搜索栏 */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="搜索"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {/* 聊天列表 */}
        <div className="flex-1 overflow-y-auto">
          {chatList.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleChatClick(chat)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-xl">
                  {chat.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{chat.name}</span>
                  <span className="text-xs text-gray-400">{chat.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 聊天界面
  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* 顶部栏 */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowChat(false)} className="text-gray-600">
            <ChevronLeft size={24} />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-lg">
            {selectedChat?.avatar}
          </div>
          <span className="font-medium text-sm">{selectedChat?.name}</span>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[80%]">
              <div className={`px-3.5 py-2.5 text-[15px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-500 text-white rounded-2xl rounded-br-sm"
                  : "bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-400 rounded-2xl rounded-bl-sm shadow-sm px-3.5 py-2.5 text-[15px]">
              正在输入...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入栏 */}
      <div className="bg-white border-t border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="说点什么..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-[15px] outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
