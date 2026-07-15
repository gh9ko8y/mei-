/**
 * 2D形象渲染器 - 根据配置渲染虚拟恋人形象
 * MVP版本：用CSS绘制简化版形象
 */

"use client";

import { type AvatarConfig, DEFAULT_AVATAR } from "../../lib/avatar/types";

interface AvatarRendererProps {
  config?: AvatarConfig;
  size?: number; // 像素大小
  className?: string;
}

export default function AvatarRenderer({ config = DEFAULT_AVATAR, size = 200, className = "" }: AvatarRendererProps) {
  const scale = size / 200; // 基准尺寸200px

  // 脸型对应的CSS形状
  const faceShapeMap = {
    round: "50%",
    oval: "45% 50% 45% 50% / 50% 45% 50% 45%",
    square: "20%",
    heart: "50% 50% 20% 50%",
    long: "45% 50% 45% 50% / 40% 45% 40% 45%",
  };

  // 发型对应的CSS样式
  const hairStyleMap: Record<string, { w: string; h: string; br: string; top: string }> = {
    "short-straight": { w: "80%", h: "35%", br: "50% 50% 0 0", top: "-15%" },
    "short-curly": { w: "85%", h: "30%", br: "40%", top: "-12%" },
    "short-wavy": { w: "82%", h: "32%", br: "45% 45% 5% 5%", top: "-13%" },
    "medium-straight": { w: "85%", h: "50%", br: "50% 50% 10% 10%", top: "-20%" },
    "medium-curly": { w: "90%", h: "45%", br: "40%", top: "-18%" },
    "medium-wavy": { w: "88%", h: "47%", br: "45% 45% 8% 8%", top: "-19%" },
    "medium-bob": { w: "86%", h: "55%", br: "50% 50% 20% 20%", top: "-22%" },
    "long-straight": { w: "85%", h: "80%", br: "50% 50% 10% 10%", top: "-25%" },
    "long-curly": { w: "90%", h: "75%", br: "40%", top: "-22%" },
    "long-wavy": { w: "88%", h: "78%", br: "45% 45% 8% 8%", top: "-24%" },
    "long-ponytail": { w: "85%", h: "70%", br: "50% 50% 10% 10%", top: "-20%" },
    "long-braid": { w: "82%", h: "85%", br: "50% 50% 5% 5%", top: "-28%" },
  };

  const hair = hairStyleMap[config.hairStyle] || hairStyleMap["long-straight"];

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size * 1.5 }}
    >
      {/* 身体 */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: size * 0.6,
          height: size * 0.5,
          backgroundColor: config.topColor,
          borderRadius: "30% 30% 0 0",
        }}
      />

      {/* 脖子 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: size * 0.5,
          width: size * 0.12,
          height: size * 0.1,
          backgroundColor: "#FDBCB4",
          borderRadius: "0 0 5px 5px",
        }}
      />

      {/* 脸部 */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: size * 0.55,
          width: size * 0.55,
          height: size * 0.55,
          backgroundColor: "#FDBCB4",
          borderRadius: faceShapeMap[config.faceShape],
        }}
      >
        {/* 头发 */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            width: hair.w,
            height: hair.h,
            borderRadius: hair.br,
            top: hair.top,
            backgroundColor: config.hairColor,
            zIndex: 1,
          }}
        />

        {/* 眉毛 */}
        <div
          className="absolute flex justify-between"
          style={{ top: "35%", left: "20%", right: "20%" }}
        >
          <div
            style={{
              width: size * 0.06,
              height: size * 0.015,
              backgroundColor: config.hairColor,
              borderRadius: "2px",
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: size * 0.06,
              height: size * 0.015,
              backgroundColor: config.hairColor,
              borderRadius: "2px",
              opacity: 0.8,
            }}
          />
        </div>

        {/* 眼睛 */}
        <div
          className="absolute flex justify-between"
          style={{ top: "42%", left: "18%", right: "18%" }}
        >
          <Eye color={config.eyeColor} shape={config.eyeShape} size={size * 0.08} />
          <Eye color={config.eyeColor} shape={config.eyeShape} size={size * 0.08} />
        </div>

        {/* 鼻子 */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "55%",
            width: size * 0.04,
            height: size * 0.05,
            backgroundColor: "#E8A89C",
            borderRadius: config.noseShape === "pointed" ? "50% 50% 30% 30%" : "50%",
          }}
        />

        {/* 嘴巴 */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: "68%",
            width: config.mouthShape === "small" ? size * 0.06 :
                    config.mouthShape === "wide" ? size * 0.12 :
                    config.mouthShape === "pouty" ? size * 0.08 : size * 0.09,
            height: config.mouthShape === "pouty" ? size * 0.04 : size * 0.03,
            backgroundColor: "#E8636A",
            borderRadius: config.mouthShape === "pouty" ? "50%" : "0 0 50% 50%",
          }}
        />

        {/* 腮红 */}
        <div
          className="absolute flex justify-between"
          style={{ top: "60%", left: "10%", right: "10%" }}
        >
          <div
            style={{
              width: size * 0.08,
              height: size * 0.04,
              backgroundColor: "rgba(255, 150, 150, 0.3)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              width: size * 0.08,
              height: size * 0.04,
              backgroundColor: "rgba(255, 150, 150, 0.3)",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>

      {/* 配饰 */}
      {config.accessory === "glasses" && (
        <div
          className="absolute flex justify-between"
          style={{ bottom: size * 0.72, left: "18%", right: "18%" }}
        >
          <div
            style={{
              width: size * 0.12,
              height: size * 0.1,
              border: "2px solid #333",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              width: size * 0.12,
              height: size * 0.1,
              border: "2px solid #333",
              borderRadius: "50%",
            }}
          />
        </div>
      )}

      {config.accessory === "hat" && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            bottom: size * 0.95,
            width: size * 0.6,
            height: size * 0.2,
            backgroundColor: config.topColor,
            borderRadius: "10px 10px 0 0",
          }}
        />
      )}
    </div>
  );
}

// 眼睛组件
function Eye({ color, shape, size }: { color: string; shape: string; size: number }) {
  const shapeMap = {
    round: "50%",
    almond: "45% 50% 45% 50% / 50% 45% 50% 45%",
    cat: "40% 60% 40% 60% / 50% 40% 60% 50%",
  };

  return (
    <div
      style={{
        width: size,
        height: size * 0.7,
        backgroundColor: "white",
        borderRadius: shapeMap[shape as keyof typeof shapeMap] || "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: size * 0.5,
          height: size * 0.5,
          backgroundColor: color,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: size * 0.2,
            height: size * 0.2,
            backgroundColor: "black",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute"
          style={{
            width: size * 0.1,
            height: size * 0.1,
            backgroundColor: "white",
            borderRadius: "50%",
            marginTop: -size * 0.15,
            marginLeft: size * 0.1,
          }}
        />
      </div>
    </div>
  );
}
