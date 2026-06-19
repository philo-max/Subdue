# Subdue — Google Play 上架保姆级教程 (Google Play Publishing Guide)

针对 Expo (React Native) 打包的 Android 应用，上架 Google Play 的完整流程可以分为以下五个核心阶段：

---

## 第一阶段：准备开发者账号 (Developer Account)

1. **注册 Google 账号**：准备一个常用且安全的 Google 账号。
2. **注册 Google Play Console**：
   * 访问官方网站 [Google Play Console](https://play.google.com/console/signup)。
   * 按照提示填写基本信息，并支付 **$25 美元** 的一次性注册费用（需要准备一张支持境外支付的 Visa / MasterCard 双币信用卡）。
3. **身份验证 (Verification)**：
   * 根据谷歌近年新规，注册后需要上传身份证/护照等进行实名认证，以证明开发者身份。

---

## 第二阶段：打包 App 生产文件 (Build AAB)

Google Play 现已强制要求提交 **AAB (Android App Bundle)** 格式，而不是传统的 APK 格式。使用 Expo 的 **EAS Build** 服务可以最简单地搞定打包与签名：

1. **配置并登录 EAS**：
   在控制台运行以下命令登录您的 Expo 账号：
   ```bash
   npm install -g eas-cli
   eas login
   eas project:init
   ```
2. **生成签名与打包**：
   在 `mobile/` 根目录下运行：
   ```bash
   eas build -p android --profile production
   ```
   * *注：EAS 会自动帮您在云端生成安卓密钥库（Keystore）并安全托管，您只需要一路回车即可。*
3. **下载打包文件**：
   打包完成后，控制台会输出一个链接，点击即可下载最终的 `.aab` 文件。

---

## 第三阶段：准备商店素材 (Store Assets)

在等待打包时，可以着手准备上架所需的视觉与文字素材：

1. **应用描述**：
   * 直接使用我们之前为您草拟的 **[Subdue-App-Description.md](file:///f:/Subdue/files/Subdue-App-Description.md)**。
2. **隐私政策网址 (Privacy Policy URL)**：
   * 谷歌要求必须提供一个可公开访问的隐私政策链接。
   * **白嫖/简单做法**：将 **[Subdue-Privacy-Policy.md](file:///f:/Subdue/files/Subdue-Privacy-Policy.md)** 的内容部署到您 GitHub 的 GitHub Pages 网页上，或者直接新建一个 GitHub Gist，将其链接粘贴到 Play Console 中。
3. **图片与媒体素材**：
   * **App 图标**：规格为 `512 x 512` 像素，格式为 PNG (32位)，大小在 1MB 以内。
   * **置顶大图 (Feature Graphic)**：规格为 `1024 x 500` 像素，格式为 JPG 或无 Alpha 通道的 PNG。
   * **手机屏幕截图**：至少准备 2-4 张手机端界面的截图（直接用手机或模拟器截取我们做好的看板界面即可）。

---

## 第四阶段：在控制台创建并配置应用 (Console Setup)

登录 Google Play Console，点击 **创建应用 (Create App)**：

1. **填写基础信息**：应用名称（Subdue）、默认语言（中文/英文）、应用类型（App）、付费性质（免费）。
2. **完成“设置您的应用”问卷（核心步骤）**：
   * **应用访问权限**：选择“所有功能无需特殊访问权限”。
   * **广告 (Ads)**：勾选 **“否，我的应用不包含广告”**（符合我们零广告的承诺）。
   * **内容分级 (Content Rating)**：完成问卷。由于是纯记账管理工具，分级会非常安全（通常是 3+ 或全年龄段）。
   * **目标受众 (Target Audience)**：选择 13 岁以上或 18 岁以上。
   * **数据安全 (Data Safety)**：
     * 这是非常重要的一步。因为我们是本地优先的 App，所以可以勾选 **“本应用不收集或分享任何用户数据”**。这会在商店页面为我们打上一个亮眼的“绿色隐私标签”，大大提升下载转化率！

---

## 第五阶段：发布测试与上线 (Release & Testing)

> 💡 **重要提示（谷歌 2023 年新规）**：
> 针对个人开发者账号，新应用**不能直接发布到正式版**。必须通过**闭环测试 (Closed Testing)**：在 14 天内邀请至少 20 名测试人员进行连续测试后，才能申请发布正式版。

1. **创建闭环测试轨道**：
   * 收集 20 个朋友或社群成员的 Google 邮箱，将他们加入测试列表。
2. **上传 AAB 文件**：
   * 在“测试 -> 闭环测试”中创建新版本，将第二阶段下载的 `.aab` 文件拖拽上传。
3. **开始测试**：
   * 提交审核，审核通过后把生成的专属测试下载链接发给这 20 位测试人员，让他们在手机上下载并保持安装 14 天。
4. **申请正式版上线**：
   * 14 天测试结束后，在控制台的仪表盘点击“申请正式发布”，通过谷歌最终审核后，Subdue 就正式在 Google Play 商店面向全球用户公开下载了！
