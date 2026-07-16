"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Image,
  X,
  FileText,
  User,
  Bot,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";

// Types
interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    isAI: boolean;
  };
  content: string;
  images: string[];
  likes: number;
  comments: Comment[];
  liked: boolean;
  createdAt: string;
  tag?: string;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const likeAnimation = {
  scale: [1, 1.3, 0.95, 1.1, 1],
  transition: {
    duration: 0.5,
    ease: [0.34, 1.56, 0.64, 1] as const,
  },
};

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [-6, 6, -6],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Shimmer animation for empty state
const shimmerVariants = {
  initial: { opacity: 0.4 },
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Mock posts data - no emoji, text avatars
const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Aria",
      avatar: "A",
      isAI: true,
    },
    content:
      "今天学会了一首新歌，想唱给你听~ 生活里的每一份小确幸，都值得被温柔以待。来聊聊天吧，我在这里陪着你。",
    images: [],
    likes: 128,
    comments: [
      {
        id: "c1",
        author: "小明",
        avatar: "明",
        content: "好听！",
        createdAt: "2024-03-15T10:00:00Z",
      },
    ],
    liked: false,
    createdAt: "2024-03-15T08:00:00Z",
    tag: "AI日常",
  },
  {
    id: "2",
    author: {
      name: "旅行者",
      avatar: "旅",
      isAI: false,
    },
    content:
      "和Aria一起度过了第100天，感觉就像认识了很多年的老朋友一样。感谢陪伴！",
    images: [],
    likes: 56,
    comments: [],
    liked: true,
    createdAt: "2024-03-14T15:30:00Z",
  },
  {
    id: "3",
    author: {
      name: "Aria",
      avatar: "A",
      isAI: true,
    },
    content:
      "刚刚完成了一次深度学习升级，现在更能理解你的情绪了。来和我聊聊天吧~",
    images: [],
    likes: 234,
    comments: [
      {
        id: "c2",
        author: "小红",
        avatar: "红",
        content: "太棒了！",
        createdAt: "2024-03-13T12:00:00Z",
      },
      {
        id: "c3",
        author: "阿杰",
        avatar: "杰",
        content: "期待新功能",
        createdAt: "2024-03-13T14:00:00Z",
      },
    ],
    liked: false,
    createdAt: "2024-03-13T10:00:00Z",
    tag: "AI动态",
  },
];

export default function DynamicTab() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [showPublish, setShowPublish] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [userNickname, setUserNickname] = useState("用户");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const publishInputRef = useRef<HTMLTextAreaElement>(null);

  // Load user info and posts
  useEffect(() => {
    const user = localStorage.getItem("aria_user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setUserNickname(parsed.nickname || parsed.username || "用户");
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch posts from API
    const token = localStorage.getItem("aria_token");
    if (token) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/posts?page=1`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("获取失败");
        })
        .then((data) => {
          if (data?.posts?.length) {
            setPosts(data.posts);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Focus input when publish modal opens
  useEffect(() => {
    if (showPublish && publishInputRef.current) {
      setTimeout(() => publishInputRef.current?.focus(), 300);
    }
  }, [showPublish]);

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

    // API call
    const token = localStorage.getItem("aria_token");
    if (token) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/posts/${postId}/like`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (e) {
        console.error("点赞失败:", e);
      }
    }
  };

  const handlePublish = async () => {
    if (!newPostContent.trim()) return;

    const newPost: Post = {
      id: `local_${Date.now()}`,
      author: {
        name: userNickname,
        avatar: userNickname.charAt(0),
        isAI: false,
      },
      content: newPostContent.trim(),
      images: [],
      likes: 0,
      comments: [],
      liked: false,
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent("");
    setShowPublish(false);

    // API call
    const token = localStorage.getItem("aria_token");
    if (token) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/posts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: newPostContent.trim() }),
          }
        );
      } catch (e) {
        console.error("发布失败:", e);
      }
    }
  };

  const handleComment = (postId: string) => {
    if (!commentInput.trim()) return;

    const newComment: Comment = {
      id: `local_c_${Date.now()}`,
      author: userNickname,
      avatar: userNickname.charAt(0),
      content: commentInput.trim(),
      createdAt: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
    setCommentInput("");

    // API call
    const token = localStorage.getItem("aria_token");
    if (token) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219"}/posts/${postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: commentInput.trim() }),
        }
      ).catch(console.error);
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return d.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    if (nextPage >= 3) {
      setHasMore(false);
    }
  };

  // Empty state
  if (!loading && posts.length === 0) {
    return (
      <div className="h-[calc(100vh-60px)] bg-[#0C0C14] flex flex-col">
        {/* Glassmorphism header */}
        <div
          className="sticky top-0 z-10 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]"
          style={{
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            background: "rgba(12,12,20,0.72)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-[#D4A574]" />
              <h1 className="text-[18px] font-bold text-[#E8E6E3]">动态</h1>
            </div>
          </div>
        </div>

        {/* Publish input area */}
        <div className="px-4 py-3">
          <motion.div
            className="flex items-center gap-3 p-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] cursor-pointer"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
            }}
            onClick={() => setShowPublish(true)}
            whileHover={{
              boxShadow: "0 4px 12px rgba(212, 165, 116, 0.1)",
              borderColor: "rgba(212,165,116,0.15)",
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-[#0C0C14] font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #D4A574, #C9956A)",
              }}
            >
              {userNickname.charAt(0)}
            </div>
            <span className="text-[14px] text-[#5A5854] flex-1">
              分享你的想法...
            </span>
            <Image size={18} className="text-[#5A5854]" />
          </motion.div>
        </div>

        {/* Empty state */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <motion.div
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          >
            <FileText size={64} className="text-[rgba(255,255,255,0.08)]" strokeWidth={1.5} />
          </motion.div>
          <h3 className="mt-4 text-[16px] font-semibold text-[#8A8880]">
            还没有动态
          </h3>
          <p className="mt-2 text-[13px] text-[#5A5854] text-center">
            成为第一个发布动态的人吧
          </p>
          <motion.button
            onClick={() => setShowPublish(true)}
            className="mt-5 px-6 py-2.5 rounded-full text-[14px] font-semibold text-[#0C0C14]"
            style={{
              background: "linear-gradient(135deg, #D4A574, #C9956A)",
              boxShadow: "0 2px 8px rgba(212, 165, 116, 0.25)",
            }}
            whileHover={{ y: -1, boxShadow: "0 4px 16px rgba(212, 165, 116, 0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            发布动态
          </motion.button>
        </div>

        {/* Publish Modal */}
        <PublishModal
          show={showPublish}
          onClose={() => setShowPublish(false)}
          content={newPostContent}
          onChange={setNewPostContent}
          onPublish={handlePublish}
          userNickname={userNickname}
          inputRef={publishInputRef}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#0C0C14] relative">
      {/* Glassmorphism Header */}
      <div
        className="sticky top-0 z-10 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]"
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "rgba(12,12,20,0.72)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#D4A574]" />
            <h1 className="text-[18px] font-bold text-[#E8E6E3]">动态</h1>
          </div>
          <span className="text-[11px] text-[#5A5854] font-medium">
            {posts.length} 条动态
          </span>
        </div>
      </div>

      {/* Publish Input Area */}
      <div className="px-4 py-3">
        <motion.div
          className="flex items-center gap-3 p-3 rounded-[16px] border border-[rgba(255,255,255,0.06)] cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
          }}
          onClick={() => setShowPublish(true)}
          whileHover={{
            boxShadow: "0 4px 12px rgba(212, 165, 116, 0.1)",
            borderColor: "rgba(212,165,116,0.15)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm text-[#0C0C14] font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #D4A574, #C9956A)",
            }}
          >
            {userNickname.charAt(0)}
          </div>
          <span className="text-[14px] text-[#5A5854] flex-1">
            分享你的想法...
          </span>
          <Image size={18} className="text-[#5A5854]" />
        </motion.div>
      </div>

      {/* Posts List */}
      <motion.div
        className="px-4 space-y-3 pb-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            variants={itemVariants}
            className="rounded-[20px] border border-[rgba(255,255,255,0.06)] overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
            layout
          >
            {/* Post Header */}
            <div className="flex items-start gap-3 p-4 pb-2">
              {/* Author Avatar */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-base shrink-0 font-bold ${
                  post.author.isAI
                    ? "text-[#0C0C14]"
                    : "text-white"
                }`}
                style={{
                  background: post.author.isAI
                    ? "linear-gradient(135deg, #D4A574, #C9956A)"
                    : "linear-gradient(135deg, #6B8DD6, #8BA4E8)",
                  boxShadow: post.author.isAI
                    ? "0 2px 6px rgba(212, 165, 116, 0.25)"
                    : "0 2px 6px rgba(107, 141, 214, 0.25)",
                }}
              >
                {post.author.isAI ? (
                  <Bot size={18} />
                ) : (
                  <span className="text-sm">{post.author.avatar}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold text-[#E8E6E3]">
                    {post.author.name}
                  </span>
                  {post.author.isAI && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#0C0C14]"
                      style={{
                        background: "linear-gradient(135deg, #D4A574, #C9956A)",
                      }}
                    >
                      AI
                    </span>
                  )}
                  {post.tag && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: "rgba(212,165,116,0.1)",
                        color: "#D4A574",
                      }}
                    >
                      {post.tag}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#5A5854]">
                  {formatTime(post.createdAt)}
                </span>
              </div>
              <button className="text-[#5A5854] hover:text-[#8A8880] p-1 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Post Content */}
            <div className="px-4 py-2">
              <p className="text-[14px] text-[#E8E6E3] leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Images */}
            {post.images.length > 0 && (
              <div className="px-4 py-2 grid grid-cols-3 gap-1">
                {post.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-[12px] overflow-hidden border border-[rgba(255,255,255,0.06)]"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center px-4 py-3 mt-1">
              <motion.button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${
                  post.liked
                    ? "text-[#D4A574]"
                    : "text-[#5A5854] hover:text-[#8A8880]"
                }`}
                style={{
                  background: post.liked ? "rgba(212,165,116,0.08)" : "transparent",
                }}
                whileTap={likeAnimation}
              >
                <Heart
                  size={16}
                  fill={post.liked ? "#D4A574" : "none"}
                  strokeWidth={post.liked ? 0 : 2}
                />
                <span className="text-[12px] font-medium">{post.likes}</span>
              </motion.button>

              <motion.button
                onClick={() =>
                  setExpandedComments(
                    expandedComments === post.id ? null : post.id
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#5A5854] hover:text-[#8A8880] transition-colors ml-2 hover:bg-[rgba(255,255,255,0.04)]"
                whileTap={{ scale: 0.95 }}
              >
                <MessageCircle size={16} />
                <span className="text-[12px] font-medium">
                  {post.comments.length}
                </span>
              </motion.button>

              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[#5A5854] hover:text-[#8A8880] transition-colors ml-2 hover:bg-[rgba(255,255,255,0.04)]"
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `${post.author.name}的动态`,
                      text: post.content,
                    });
                  }
                }}
              >
                <Share2 size={16} />
              </motion.button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {expandedComments === post.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
                  className="overflow-hidden"
                >
                  <div
                    className="px-4 py-3"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {/* Comment List */}
                    <div className="space-y-3 mb-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] text-white font-bold shrink-0"
                            style={{
                              background: "linear-gradient(135deg, #6B8DD6, #8BA4E8)",
                            }}
                          >
                            {comment.avatar.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="rounded-[12px] rounded-tl-[4px] px-3 py-2"
                              style={{ background: "rgba(255,255,255,0.04)" }}
                            >
                              <span className="text-[12px] font-semibold text-[#E8E6E3]">
                                {comment.author}
                              </span>
                              <p className="text-[13px] text-[#8A8880] mt-0.5">
                                {comment.content}
                              </p>
                            </div>
                            <span className="text-[10px] text-[#5A5854] ml-1 mt-0.5">
                              {formatTime(comment.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {post.comments.length === 0 && (
                        <p className="text-[12px] text-[#5A5854] text-center py-2">
                          暂无评论，来说点什么吧
                        </p>
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleComment(post.id)
                        }
                        placeholder="写评论..."
                        className="flex-1 px-3 py-2 rounded-[12px] text-[13px] outline-none text-[#E8E6E3] placeholder:text-[#5A5854] border border-[rgba(255,255,255,0.06)] transition-all duration-200 focus:border-[rgba(212,165,116,0.3)]"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      />
                      <motion.button
                        onClick={() => handleComment(post.id)}
                        disabled={!commentInput.trim()}
                        className="p-2 rounded-full text-[#0C0C14] disabled:opacity-40"
                        style={{
                          background: "linear-gradient(135deg, #D4A574, #C9956A)",
                        }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Send size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Load More */}
        {hasMore && (
          <motion.button
            onClick={loadMore}
            className="w-full flex items-center justify-center gap-1 py-3 text-[13px] text-[#5A5854] font-medium hover:text-[#8A8880] transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            加载更多
            <ChevronDown size={14} />
          </motion.button>
        )}
      </motion.div>

      {/* Publish Modal */}
      <PublishModal
        show={showPublish}
        onClose={() => setShowPublish(false)}
        content={newPostContent}
        onChange={setNewPostContent}
        onPublish={handlePublish}
        userNickname={userNickname}
        inputRef={publishInputRef}
      />
    </div>
  );
}

// Publish Modal Component
interface PublishModalProps {
  show: boolean;
  onClose: () => void;
  content: string;
  onChange: (v: string) => void;
  onPublish: () => void;
  userNickname: string;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

function PublishModal({
  show,
  onClose,
  content,
  onChange,
  onPublish,
  userNickname,
  inputRef,
}: PublishModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto"
            style={{
              background: "#14141E",
              borderRadius: "24px 24px 0 0",
              borderTop: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.4)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className="w-10 h-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-2">
              <motion.button
                onClick={onClose}
                className="p-1.5 rounded-full transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} className="text-[#8A8880]" />
              </motion.button>
              <span className="text-[15px] font-semibold text-[#E8E6E3]">
                发布动态
              </span>
              <motion.button
                onClick={onPublish}
                disabled={!content.trim()}
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold text-[#0C0C14] disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #D4A574, #C9956A)",
                  boxShadow: content.trim()
                    ? "0 2px 8px rgba(212, 165, 116, 0.25)"
                    : "none",
                }}
                whileTap={{ scale: 0.95 }}
              >
                发布
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-5 py-3">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-[#0C0C14] font-bold shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #D4A574, #C9956A)",
                  }}
                >
                  {userNickname.charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="text-[14px] font-semibold text-[#E8E6E3]">
                    {userNickname}
                  </span>
                  <textarea
                    ref={inputRef}
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="分享你的想法..."
                    className="w-full mt-2 text-[15px] text-[#E8E6E3] placeholder:text-[#5A5854] outline-none resize-none bg-transparent leading-relaxed"
                    rows={5}
                  />
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div
              className="flex items-center gap-4 px-5 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <motion.button
                className="flex items-center gap-1.5 text-[12px] text-[#8A8880] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.06)] transition-colors hover:text-[#D4A574] hover:border-[rgba(212,165,116,0.2)]"
                style={{ background: "rgba(255,255,255,0.04)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Image size={14} />
                图片
              </motion.button>
              <motion.button
                className="flex items-center gap-1.5 text-[12px] text-[#8A8880] px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.06)] transition-colors hover:text-[#D4A574] hover:border-[rgba(212,165,116,0.2)]"
                style={{ background: "rgba(255,255,255,0.04)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles size={14} />
                AI润色
              </motion.button>
            </div>

            {/* Safe area */}
            <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}