"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageSquare, PenLine, Send, FileText, X, User, Sparkles } from "lucide-react";

interface Post {
  id: number;
  author: string;
  avatar: string;
  isAI: boolean;
  content: string;
  image: string | null;
  time: string;
  likes: number;
  comments: number;
  liked: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function DynamicTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showPublish, setShowPublish] = useState(false);
  const [newPost, setNewPost] = useState("");

  const handlePublish = () => {
    if (!newPost.trim()) return;
    const post: Post = {
      id: Date.now(),
      author: "我",
      avatar: "😊",
      isAI: false,
      content: newPost,
      image: null,
      time: "刚刚",
      likes: 0,
      comments: 0,
      liked: false,
    };
    setPosts([post, ...posts]);
    setNewPost("");
    setShowPublish(false);
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map((p) =>
      p.id === postId
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-60px)] bg-[#FFF8F5]">
      {/* 顶部 */}
      <div className="sticky top-0 z-10 bg-white/72 backdrop-blur-[20px] saturate-[180%] border-b border-[rgba(0,0,0,0.05)] px-4 py-3">
        <h1 className="font-bold text-lg text-[#2D2D3A]">动态</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* 发布输入区 */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4"
        >
          <motion.button
            onClick={() => setShowPublish(true)}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3.5 bg-white rounded-[16px] shadow-[0_1px_3px_rgba(45,45,58,0.06)] border border-[rgba(0,0,0,0.03)] text-left flex items-center gap-3 hover:shadow-[0_4px_12px_rgba(45,45,58,0.08)] transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center shrink-0">
              <User size={16} className="text-white" />
            </div>
            <span className="text-sm text-[#A0A0B0] flex-1">分享你的心情...</span>
            <div className="w-8 h-8 rounded-full bg-[#F7F7F9] flex items-center justify-center">
              <PenLine size={14} className="text-[#E85D75]" />
            </div>
          </motion.button>
        </motion.div>

        <motion.div
          className="px-4 pb-4 space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {posts.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center text-[#A0A0B0] py-16"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex justify-center mb-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#E85D75]/10 to-[#F28C8C]/10 flex items-center justify-center">
                  <FileText size={28} className="text-[#E85D75]" />
                </div>
              </motion.div>
              <p className="text-sm font-medium">还没有动态</p>
              <p className="text-xs text-[#A0A0B0] mt-1">发布第一条动态吧</p>
              <motion.button
                onClick={() => setShowPublish(true)}
                whileTap={{ scale: 0.95 }}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-[14px] text-sm font-medium shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
              >
                <Sparkles size={14} className="inline mr-1.5" />
                发布动态
              </motion.button>
            </motion.div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                variants={itemVariants}
                layout
                className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    post.isAI
                      ? "bg-gradient-to-br from-[#E85D75] to-[#F28C8C]"
                      : "bg-gradient-to-br from-[#F7F7F9] to-[#EEE]"
                  }`}>
                    <span className="text-lg">{post.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${post.isAI ? "text-[#E85D75]" : "text-[#2D2D3A]"}`}>
                        {post.author}
                      </span>
                      {post.isAI && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white rounded-full font-medium">
                          AI
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#A0A0B0]">{post.time}</span>
                  </div>
                </div>
                <p className="text-sm text-[#2D2D3A] leading-relaxed mb-3">{post.content}</p>
                {post.image && (
                  <div className="w-full h-32 bg-gradient-to-br from-[#E8F5E9] to-[#E3F2FD] rounded-[16px] flex items-center justify-center text-4xl mb-3 overflow-hidden">
                    {post.image}
                  </div>
                )}
                <div className="flex gap-5 text-xs text-[#A0A0B0]">
                  <motion.button
                    onClick={() => handleLike(post.id)}
                    whileTap={{ scale: 1.3 }}
                    className={`flex items-center gap-1.5 transition-colors ${
                      post.liked ? "text-[#E85D75]" : "hover:text-[#E85D75]"
                    }`}
                  >
                    <Heart
                      size={15}
                      fill={post.liked ? "currentColor" : "none"}
                      className={post.liked ? "drop-shadow-sm" : ""}
                    />
                    <span className="font-medium">{post.likes}</span>
                  </motion.button>
                  <button className="flex items-center gap-1.5 hover:text-[#6B8DD6] transition-colors">
                    <MessageSquare size={15} />
                    <span className="font-medium">{post.comments}</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* 发布弹窗 */}
      <AnimatePresence>
        {showPublish && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[8px] flex items-end justify-center z-50"
            onClick={() => setShowPublish(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="bg-white rounded-t-[24px] w-full max-w-md p-4 shadow-[0_-8px_24px_rgba(45,45,58,0.12)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center mb-4">
                <div className="w-10 h-1 bg-[#E5E5EB] rounded-full" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <motion.button
                  onClick={() => setShowPublish(false)}
                  whileTap={{ scale: 0.9 }}
                  className="text-[#A0A0B0] hover:text-[#6B6B7B] p-1"
                >
                  <X size={20} />
                </motion.button>
                <span className="font-semibold text-[#2D2D3A]">发布动态</span>
                <motion.button
                  onClick={handlePublish}
                  disabled={!newPost.trim()}
                  whileTap={{ scale: 0.95 }}
                  className={`text-sm font-semibold transition-colors ${
                    newPost.trim() ? "text-[#E85D75]" : "text-[#A0A0B0]"
                  }`}
                >
                  发布
                </motion.button>
              </div>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="分享你的心情..."
                autoFocus
                className="w-full h-36 p-3 bg-[#F7F7F9] rounded-[16px] text-sm resize-none outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-[rgba(232,93,117,0.15)] focus:border-[#E85D75] border border-transparent leading-relaxed"
              />
              <div className="flex gap-2 mt-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-[#A0A0B0] hover:text-[#E85D75] transition-colors"
                >
                  <PenLine size={18} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-[#A0A0B0] hover:text-[#E85D75] transition-colors"
                >
                  <Sparkles size={18} />
                </motion.button>
                <motion.button
                  onClick={handlePublish}
                  disabled={!newPost.trim()}
                  whileTap={{ scale: 0.9 }}
                  className={`ml-auto px-4 py-2 rounded-[14px] text-sm font-medium flex items-center gap-1.5 transition-all ${
                    newPost.trim()
                      ? "bg-gradient-to-r from-[#E85D75] to-[#F28C8C] text-white shadow-[0_4px_16px_rgba(232,93,117,0.25)]"
                      : "bg-[#F7F7F9] text-[#A0A0B0]"
                  }`}
                >
                  <Send size={14} />
                  发布
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
