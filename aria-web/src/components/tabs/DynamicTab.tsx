"use client";

import { useState } from "react";
import { Heart, MessageSquare, Plus } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://8.130.32.219";

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
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* 顶部 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="font-semibold text-lg">动态</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 发布按钮 */}
        <button
          onClick={() => setShowPublish(true)}
          className="w-full p-4 bg-white rounded-2xl border border-gray-100 text-left text-gray-400 text-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <Plus size={18} />
          <span>分享你的心情...</span>
        </button>

        {/* 动态列表 */}
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="text-sm">还没有动态</p>
            <p className="text-xs text-gray-300 mt-1">发布第一条动态吧</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  post.isAI ? "bg-indigo-100" : "bg-gray-100"
                }`}>
                  {post.avatar}
                </div>
                <div>
                  <span className={`font-semibold text-sm ${post.isAI ? "text-indigo-600" : ""}`}>
                    {post.author}
                  </span>
                  {post.isAI && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full ml-1">AI</span>
                  )}
                  <span className="text-xs text-gray-400 ml-2">{post.time}</span>
                </div>
              </div>
              <p className="text-sm mb-3">{post.content}</p>
              {post.image && (
                <div className="w-full h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-xl flex items-center justify-center text-4xl mb-3">
                  {post.image}
                </div>
              )}
              <div className="flex gap-4 text-xs text-gray-500">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1 ${post.liked ? "text-red-500" : "hover:text-red-500"}`}
                >
                  <Heart size={14} fill={post.liked ? "currentColor" : "none"} /> {post.likes}
                </button>
                <button className="flex items-center gap-1 hover:text-blue-500">
                  <MessageSquare size={14} /> {post.comments}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 发布弹窗 */}
      {showPublish && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setShowPublish(false)} className="text-gray-400">取消</button>
              <span className="font-semibold">发布动态</span>
              <button
                onClick={handlePublish}
                disabled={!newPost.trim()}
                className="text-indigo-500 font-medium disabled:text-gray-300"
              >
                发布
              </button>
            </div>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="分享你的心情..."
              className="w-full h-32 p-3 border border-gray-200 rounded-xl text-sm resize-none outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      )}
    </div>
  );
}
