"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Eye } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();

  const history = [
    { id: 1, title: "温柔女友的动态", type: "动态", time: "2小时前" },
    { id: 2, title: "小明的个人主页", type: "用户", time: "昨天" },
    { id: 3, title: "关系分析报告", type: "报告", time: "3天前" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600"><ChevronLeft size={24} /></button>
        <h1 className="font-semibold text-lg">浏览记录</h1>
      </div>
      <div className="p-4 space-y-3">
        {history.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Eye size={18} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-gray-400">{item.type} · {item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
