"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // 保存资料到localStorage
    const profile = { nickname, bio, gender, birthday, avatar };
    localStorage.setItem("aria_profile", JSON.stringify(profile));
    alert("保存成功！");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f8f6f4] max-w-md mx-auto">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <span className="font-semibold">编辑资料</span>
        <button onClick={handleSave} className="text-indigo-500 text-sm font-medium">
          保存
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* 头像 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">头像</span>
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="头像" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-3xl">
                  😊
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>
        </div>

        {/* Aria号 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Aria号</span>
            <span className="text-sm">001</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">管理员账号</p>
        </div>

        {/* 昵称 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">昵称</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="text-sm text-right outline-none"
            />
          </div>
        </div>

        {/* 个性签名 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">个性签名</span>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="写一句话介绍自己"
              className="text-sm text-right outline-none"
            />
          </div>
        </div>

        {/* 性别 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">性别</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="text-sm outline-none bg-transparent"
            >
              <option value="">未设置</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>
        </div>

        {/* 生日 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">生日</span>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="text-sm outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
