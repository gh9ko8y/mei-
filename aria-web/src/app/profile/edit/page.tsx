"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, User, Check } from "lucide-react";

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
    const profile = { nickname, bio, gender, birthday, avatar };
    localStorage.setItem("aria_profile", JSON.stringify(profile));
    alert("保存成功！");
    router.push("/");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <div className="min-h-screen bg-[#FFF8F5]">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/72 backdrop-blur-[20px] saturate-[180%] border-b border-[rgba(0,0,0,0.05)] px-4 py-3 flex items-center justify-between">
        <motion.button
          onClick={() => router.push("/")}
          whileTap={{ scale: 0.9 }}
          className="text-[#6B6B7B] hover:text-[#2D2D3A] p-1 -ml-1"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <span className="font-bold text-[#2D2D3A]">编辑资料</span>
        <motion.button
          onClick={handleSave}
          whileTap={{ scale: 0.9 }}
          className="text-[#E85D75] font-semibold text-sm p-1 -mr-1 flex items-center gap-1"
        >
          <Check size={18} />
          保存
        </motion.button>
      </div>

      <motion.div
        className="p-4 space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* 头像 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6B7B]">头像</span>
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="头像" className="w-[72px] h-[72px] rounded-full object-cover border-2 border-white shadow-md" />
              ) : (
                <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#E85D75] to-[#F28C8C] flex items-center justify-center border-2 border-white shadow-md">
                  <User size={28} className="text-white" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-gradient-to-br from-[#E85D75] to-[#F28C8C] rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow-md">
                <Camera size={14} className="text-white" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Aria号 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6B7B]">Aria号</span>
            <span className="text-sm text-[#2D2D3A] font-medium">001</span>
          </div>
          <p className="text-xs text-[#A0A0B0] mt-1">管理员账号</p>
        </motion.div>

        {/* 昵称 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6B7B]">昵称</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="text-sm text-right outline-none bg-transparent text-[#2D2D3A] placeholder-[#A0A0B0] w-1/2"
            />
          </div>
        </motion.div>

        {/* 个性签名 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6B7B]">个性签名</span>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="写一句话介绍自己"
              className="text-sm text-right outline-none bg-transparent text-[#2D2D3A] placeholder-[#A0A0B0] w-1/2"
            />
          </div>
        </motion.div>

        {/* 性别 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6B7B]">性别</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="text-sm outline-none bg-transparent text-[#2D2D3A] text-right"
            >
              <option value="">未设置</option>
              <option value="male">男</option>
              <option value="female">女</option>
              <option value="other">其他</option>
            </select>
          </div>
        </motion.div>

        {/* 生日 */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.03)] p-4 shadow-[0_1px_3px_rgba(45,45,58,0.06)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B6B7B]">生日</span>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="text-sm outline-none bg-transparent text-[#2D2D3A]"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
