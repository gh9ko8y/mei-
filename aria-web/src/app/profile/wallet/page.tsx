"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, Gift, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export default function WalletPage() {
  const router = useRouter();

  const transactions = [
    { id: 1, type: "income", desc: "每日签到", amount: 10, time: "今天" },
    { id: 2, type: "expense", desc: "解锁高级表情包", amount: -50, time: "昨天" },
    { id: 3, type: "income", desc: "分享奖励", amount: 20, time: "3天前" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600"><ChevronLeft size={24} /></button>
        <h1 className="font-semibold text-lg">我的钱包</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white text-center">
          <div className="text-sm opacity-80 mb-1">账户余额</div>
          <div className="text-4xl font-bold">890</div>
          <div className="text-sm opacity-80 mt-1">积分</div>
          <div className="flex gap-3 mt-4">
            <button className="flex-1 py-2 bg-white/20 rounded-xl text-sm hover:bg-white/30">充值积分</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm">交易记录</div>
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                {t.type === "income" ? <ArrowDownLeft size={16} className="text-green-600" /> : <ArrowUpRight size={16} className="text-red-600" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{t.desc}</div>
                <div className="text-xs text-gray-400">{t.time}</div>
              </div>
              <div className={`font-medium ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {t.amount > 0 ? "+" : ""}{t.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
