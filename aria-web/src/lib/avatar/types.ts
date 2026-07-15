/**
 * 2D捏脸系统数据模型
 */

// 脸型
export type FaceShape = "round" | "oval" | "square" | "heart" | "long";

// 眼睛
export type EyeShape = "round" | "almond" | "cat";
export type EyeColor = "brown" | "black" | "blue" | "green" | "purple" | "gold";

// 鼻子
export type NoseShape = "small" | "medium" | "pointed";

// 嘴巴
export type MouthShape = "small" | "medium" | "wide" | "pouty";

// 眉毛
export type BrowShape = "thin" | "medium" | "thick" | "arched";

// 发型
export type HairStyle =
  | "short-straight" | "short-curly" | "short-wavy"
  | "medium-straight" | "medium-curly" | "medium-wavy" | "medium-bob"
  | "long-straight" | "long-curly" | "long-wavy" | "long-ponytail" | "long-braid";

// 发色
export type HairColor = "black" | "brown" | "blonde" | "red" | "pink" | "blue" | "purple" | "white";

// 身高
export type Height = "short" | "medium" | "tall";

// 体型
export type BodyType = "slim" | "average" | "curvy";

// 衣服
export type TopStyle = "tshirt" | "hoodie" | "dress" | "blouse" | "sweater" | "jacket";
export type BottomStyle = "jeans" | "skirt" | "shorts" | "pants" | "dress-pants";
export type ShoeStyle = "sneakers" | "boots" | "sandals" | "heels" | "loafers";

// 配饰
export type Accessory = "glasses" | "earrings" | "necklace" | "hat" | "scarf" | "none";

// 背景
export type Background = "gradient-purple" | "gradient-blue" | "gradient-pink" | "gradient-sunset" | "gradient-forest" | "custom";

// 完整捏脸配置
export interface AvatarConfig {
  // 脸部
  faceShape: FaceShape;
  eyeShape: EyeShape;
  eyeColor: EyeColor;
  noseShape: NoseShape;
  mouthShape: MouthShape;
  browShape: BrowShape;

  // 发型
  hairStyle: HairStyle;
  hairColor: HairColor;

  // 身体
  height: Height;
  bodyType: BodyType;

  // 装扮
  top: TopStyle;
  topColor: string;
  bottom: BottomStyle;
  bottomColor: string;
  shoes: ShoeStyle;
  shoesColor: string;
  accessory: Accessory;

  // 背景
  background: Background;
  customBackgroundUrl?: string;
}

// 默认配置
export const DEFAULT_AVATAR: AvatarConfig = {
  faceShape: "oval",
  eyeShape: "round",
  eyeColor: "brown",
  noseShape: "small",
  mouthShape: "medium",
  browShape: "medium",
  hairStyle: "long-straight",
  hairColor: "black",
  height: "medium",
  bodyType: "average",
  top: "tshirt",
  topColor: "#7C3AED",
  bottom: "jeans",
  bottomColor: "#1F2937",
  shoes: "sneakers",
  shoesColor: "#FFFFFF",
  accessory: "none",
  background: "gradient-purple",
};

// 选项映射（用于UI显示）
export const FACE_SHAPES: Record<FaceShape, string> = {
  round: "圆脸",
  oval: "鹅蛋脸",
  square: "方脸",
  heart: "心形脸",
  long: "长脸",
};

export const EYE_SHAPES: Record<EyeShape, string> = {
  round: "圆眼",
  almond: "杏眼",
  cat: "猫眼",
};

export const EYE_COLORS: Record<EyeColor, string> = {
  brown: "棕色",
  black: "黑色",
  blue: "蓝色",
  green: "绿色",
  purple: "紫色",
  gold: "金色",
};

export const NOSE_SHAPES: Record<NoseShape, string> = {
  small: "小巧",
  medium: "标准",
  pointed: "尖挺",
};

export const MOUTH_SHAPES: Record<MouthShape, string> = {
  small: "樱桃小嘴",
  medium: "标准",
  wide: "大嘴",
  pouty: "嘟嘟嘴",
};

export const BROW_SHAPES: Record<BrowShape, string> = {
  thin: "细眉",
  medium: "标准",
  thick: "粗眉",
  arched: "弯眉",
};

export const HAIR_STYLES: Record<HairStyle, string> = {
  "short-straight": "短直发",
  "short-curly": "短卷发",
  "short-wavy": "短波浪",
  "medium-straight": "中长直发",
  "medium-curly": "中长卷发",
  "medium-wavy": "中长波浪",
  "medium-bob": "波波头",
  "long-straight": "长直发",
  "long-curly": "长卷发",
  "long-wavy": "长波浪",
  "long-ponytail": "马尾",
  "long-braid": "麻花辫",
};

export const HAIR_COLORS: Record<HairColor, string> = {
  black: "黑色",
  brown: "棕色",
  blonde: "金色",
  red: "红色",
  pink: "粉色",
  blue: "蓝色",
  purple: "紫色",
  white: "白色",
};

export const HEIGHTS: Record<Height, string> = {
  short: "娇小",
  medium: "标准",
  tall: "高挑",
};

export const BODY_TYPES: Record<BodyType, string> = {
  slim: "纤细",
  average: "标准",
  curvy: "丰满",
};

export const TOP_STYLES: Record<TopStyle, string> = {
  tshirt: "T恤",
  hoodie: "卫衣",
  dress: "连衣裙",
  blouse: "衬衫",
  sweater: "毛衣",
  jacket: "外套",
};

export const BOTTOM_STYLES: Record<BottomStyle, string> = {
  jeans: "牛仔裤",
  skirt: "裙子",
  shorts: "短裤",
  pants: "休闲裤",
  "dress-pants": "西裤",
};

export const SHOE_STYLES: Record<ShoeStyle, string> = {
  sneakers: "运动鞋",
  boots: "靴子",
  sandals: "凉鞋",
  heels: "高跟鞋",
  loafers: "乐福鞋",
};

export const ACCESSORIES: Record<Accessory, string> = {
  none: "无",
  glasses: "眼镜",
  earrings: "耳环",
  necklace: "项链",
  hat: "帽子",
  scarf: "围巾",
};

export const BACKGROUNDS: Record<Background, string> = {
  "gradient-purple": "紫色渐变",
  "gradient-blue": "蓝色渐变",
  "gradient-pink": "粉色渐变",
  "gradient-sunset": "日落渐变",
  "gradient-forest": "森林渐变",
  custom: "自定义",
};

// 预设颜色
export const CLOTHING_COLORS = [
  "#7C3AED", // 紫色
  "#3B82F6", // 蓝色
  "#EF4444", // 红色
  "#10B981", // 绿色
  "#F59E0B", // 黄色
  "#EC4899", // 粉色
  "#1F2937", // 黑色
  "#FFFFFF", // 白色
  "#6B7280", // 灰色
  "#F97316", // 橙色
];
