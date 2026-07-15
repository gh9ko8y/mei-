"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Gift, Check } from "lucide-react";

export default function CheckInPage() {
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(false);
  const [streak, setStreak] = useState(5);

  const days = [
    { day: 1, reward: 5, checked: true },
    { day: 2, reward: 10, checked: true },
    { day: 3, reward: 15, checked: true },
    { day: 4, reward: 20, checked: true },
    { day: 5, reward: 25, checked: true },
    { day: 6, reward: 30, checked: false },
    { day: 7, reward: 100, checked: false, special: true },
  ];

  const handleCheckIn = () => {
    if (!checkedIn) {
      setCheckedIn(true);
      setStreak(streak + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-600"><ChevronLeft size={24} /></button>
        <h1 className="font-semibold text-lg">每日签到</h1>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center">
          <div className="text-4xl mb-2">🎁</div>
          <div className="text-sm opacity-80">连续签到</div>
          <div className="text-4xl font-bold my-2">{streak}天</div>
          <button
            onClick={handleCheckIn}
            disabled={checkedIn}
            className={`mt-4 px-8 py-3 rounded-xl font-medium ${checkedIn ? "bg-white/30" : "bg-white text-orange-500 hover:bg-gray-100"}`}
          >
            {checkedIn ? "✓ 已签到" : "立即签到"}
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">本周签到</h3>
          <div className="grid grid-cols-7 gap-2">
            {days.map((d) => (
              <div key={d.day} className={`text-center p-2 rounded-xl ${d.checked ? "bg-green-100" : d.special ? "bg-yellow-100" : "bg-gray-100"}`}>
                <div className="text-xs text-gray-500">第{d.day}天</div>
                <div className={`text-lg font-bold ${d.checked ? "text-green-600" : d.special ? "text-yellow-600" : "text-gray-400"}`}>
                  {d.checked ? <Check size={16} className="mx-auto" /> : `+${d.reward}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
