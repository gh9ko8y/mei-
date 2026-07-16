"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Camera, User } from "lucide-react";

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
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <div
      className="min-h-screen max-w-md mx-auto"
      style={{ background: "#0C0C14" }}
    >
      {/* 顶部导航 - glass-nav */}
      <div
        className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
        style={{
          backdropFilter: "blur(20px) saturate(180%)",
          background: "rgba(12, 12, 20, 0.85)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <motion.button
          onClick={() => router.push("/")}
          className="text-[#8A8880] p-1"
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <span className="font-semibold text-[#E8E6E3]">编辑资料</span>
        <motion.button
          onClick={handleSave}
          className="text-sm font-semibold px-3 py-1.5 rounded-[10px] text-[#0C0C14]"
          style={{ background: "linear-gradient(135deg, #D4A574, #C9956A)" }}
          whileTap={{ scale: 0.95 }}
        >
          保存
        </motion.button>
      </div>

      <motion.div
        className="p-4 space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 头像 */}
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A8880]">头像</span>
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="头像"
                  className="w-[72px] h-[72px] rounded-full object-cover"
                  style={{ border: "2px solid rgba(212, 165, 116, 0.3)" }}
                />
              ) : (
                <div
                  className="w-[72px] h-[72px] rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(212, 165, 116, 0.15)",
                  }}
                >
                  <User size={30} className="text-[#D4A574]" />
                </div>
              )}
              <label
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #D4A574, #C9956A)",
                  boxShadow: "0 2px 6px rgba(212, 165, 116, 0.3)",
                }}
              >
                <Camera size={14} className="text-[#0C0C14]" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>
          </div>
        </motion.div>

        {/* Aria号 */}
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A8880]">Aria号</span>
            <span className="text-sm text-[#E8E6E3] font-medium">001</span>
          </div>
          <p className="text-[11px] text-[#5A5854] mt-1">管理员账号</p>
        </motion.div>

        {/* 昵称 */}
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A8880]">昵称</span>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="text-sm outline-none text-right text-[#E8E6E3] placeholder-[#5A5854] bg-transparent"
              style={{ width: "60%" }}
            />
          </div>
        </motion.div>

        {/* 个性签名 */}
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A8880]">个性签名</span>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="写一句话介绍自己"
              className="text-sm outline-none text-right text-[#E8E6E3] placeholder-[#5A5854] bg-transparent"
              style={{ width: "60%" }}
            />
          </div>
        </motion.div>

        {/* 性别 */}
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A8880]">性别</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="text-sm outline-none bg-transparent text-[#E8E6E3] font-medium cursor-pointer text-right"
              style={{ background: "transparent" }}
            >
              <option value="" style={{ background: "#1A1A24" }}>未设置</option>
              <option value="male" style={{ background: "#1A1A24" }}>男</option>
              <option value="female" style={{ background: "#1A1A24" }}>女</option>
              <option value="other" style={{ background: "#1A1A24" }}>其他</option>
            </select>
          </div>
        </motion.div>

        {/* 生日 */}
        <motion.div
          variants={itemVariants}
          className="rounded-[20px] p-4"
          style={{
            background: "rgba(255, 255, 255, 0.04)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#8A8880]">生日</span>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="text-sm outline-none bg-transparent text-[#E8E6E3] text-right"
              style={{
                colorScheme: "dark",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
