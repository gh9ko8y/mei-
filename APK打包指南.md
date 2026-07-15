# Aria APK打包指南

## 前置条件

需要安装以下工具：
1. **Java JDK 11+** - https://adoptium.net/
2. **Android Studio** - https://developer.android.com/studio
3. **Android SDK** - 随Android Studio安装

## 打包步骤

### 1. 安装Android Studio
```bash
# 下载并安装Android Studio
# 安装时选择默认选项
# 安装完成后，打开Android Studio
# Tools → SDK Manager → 安装 Android SDK Platform 33
```

### 2. 配置环境变量
```bash
# Windows: 设置环境变量
ANDROID_HOME = C:\Users\你的用户名\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-11.x.x+x
Path += %ANDROID_HOME%\platform-tools
Path += %ANDROID_HOME%\tools
Path += %ANDROID_HOME%\tools\bin
```

### 3. 构建APK
```bash
cd D:\Aria\aria-web

# 同步Web资源到Android
npx cap sync android

# 进入Android目录
cd android

# 构建Debug APK（测试用）
.\gradlew assembleDebug

# 或构建Release APK（正式发布）
.\gradlew assembleRelease
```

### 4. APK位置
```
# Debug APK
D:\Aria\aria-web\android\app\build\outputs\apk\debug\app-debug.apk

# Release APK
D:\Aria\aria-web\android\app\build\outputs\apk\release\app-release.apk
```

### 5. 安装到手机
```bash
# 方法1：直接传输APK到手机安装
# 方法2：使用adb安装
adb install app-debug.apk
```

## 网站备案信息

### 网站名称要求
- ✅ 必须包含中文
- ✅ 不能包含地区名（如"北京"、"上海"）
- ✅ 不能包含公司名（如"小米科技"）
- ✅ 建议：Aria AI伴侣、Aria智能助手、Aria情感陪伴

### 备案所需材料
- 个人身份证
- 域名证书
- 网站负责人信息

### 备案流程
1. 登录阿里云备案系统
2. 填写网站信息（名称用中文）
3. 上传身份证照片
4. 等待审核（7-20个工作日）

## 发布到应用商店（可选）

### Google Play
1. 注册Google Play开发者账号（$25一次性费用）
2. 上传APK
3. 填写应用信息
4. 提交审核

### 国内应用商店
1. 华为应用市场
2. 小米应用商店
3. OPPO/vivo应用商店
4. 需要软件著作权（可选）

## 注意事项

1. **签名**：发布版APK需要签名
2. **权限**：AndroidManifest.xml中配置所需权限
3. **图标**：准备应用图标（192x192, 512x512）
4. **启动页**：Capacitor已配置启动页
