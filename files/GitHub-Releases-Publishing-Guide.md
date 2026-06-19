# Subdue — GitHub Releases APK 发布及自动打包教程 (GitHub Releases APK Distribution Guide)

将打包好的 APK 部署到 GitHub Releases 供用户直接下载，是开源项目最主流、最便捷的分发方式。我们已经为您在 `mobile/eas.json` 中配置好了专门输出 APK 格式的打包配置。

以下是完整的本地打包、发布以及通过 GitHub Actions 实现自动化流程的详细指南。

---

## 第一阶段：手动打包与上传 APK

### 1. 运行 EAS 打包 APK
在 `mobile/` 根目录下，运行以下命令（使用 `preview` 配置文件以输出 `.apk`）：
```bash
# 进入移动端根目录
cd mobile

# 登录您的 Expo 账号 (使用 npx 避免需要全局安装 eas-cli)
npx eas login

# 运行预览版编译（生成安装版 APK）
npx eas build -p android --profile preview
```
*   **注意**：EAS 会询问您是否自动生成安卓证书，直接一路按 **回车 (Enter)** 确认即可。
*   打包通常在 Expo 云端进行，需要 5~15 分钟。编译完成后，终端将输出一个以 `https://expo.dev/artifacts/` 开头的下载链接。
*   点击该链接，即可下载最终的 `subdue-mobile-xxx.apk` 文件。

### 2. 在 GitHub 上创建 Release 并上传
1. 打开浏览器，访问您的 GitHub 仓库页面：[github.com/philo-max/Subdue](https://github.com/philo-max/Subdue)。
2. 在右侧栏找到 **Releases**，点击 **Create a new release** (或 **Draft a new release**)。
3. **填写发布信息**：
    *   **Tag version**：例如 `v1.0.0`（建议与 `package.json` 中的版本号保持一致）。
    *   **Release title**：例如 `Subdue v1.0.0 - 隐私优先的订阅追踪器`。
    *   **Description**：简要说明本次版本的更新内容。
4. **上传 APK 文件**：
    *   将刚刚下载好的 `.apk` 文件拖拽到下方 **Attach binaries** 区域。
5. **发布**：
    *   点击最下方的 **Publish release** 按钮。
    *   您的用户现在即可通过 GitHub 页面直接下载并安装该 APK！

---

## 第二阶段：进阶白嫖 —— 利用 GitHub Actions + EAS 实现提交时自动构建（可选）

如果您希望每次推送代码到 GitHub 时自动触发打包并创建 Release，可以使用 GitHub Actions。

### 1. 获取 EXPO 访问令牌
1. 登录 [Expo 官网 (expo.dev)](https://expo.dev)。
2. 进入 **Account Settings -> Access Tokens**。
3. 点击 **Create token**，创建一个描述为 `GitHub-CI` 的 Token 并复制它。

### 2. 配置 GitHub Repository Secrets
1. 打开您的 GitHub 仓库 `Subdue`，进入 **Settings** 选项卡。
2. 点击左侧导航栏的 **Secrets and variables -> Actions**。
3. 点击右上角 **New repository secret**：
    *   **Name**：`EXPO_TOKEN`
    *   **Value**：粘贴您刚刚复制的 Expo Access Token。
4. 保存。

### 3. 创建 GitHub Action 工作流
在项目根目录下创建文件夹并新建文件 `.github/workflows/build-apk.yml`：

#### [NEW] [build-apk.yml](file:///f:/Subdue/.github/workflows/build-apk.yml)
```yaml
name: Build and Upload Android APK

on:
  push:
    tags:
      - 'v*' # 仅在推送形如 v1.0.0 的 tag 时触发自动打包发布

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-size: 20
          cache: 'npm'
          cache-dependency-path: mobile/package-lock.json

      - name: Setup Expo and EAS CLI
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: |
          cd mobile
          npm ci

      - name: Build APK on EAS
        run: |
          cd mobile
          eas build -p android --profile preview --non-interactive --local=false
        # EAS 编译成功后会自动返回构建的 artifact URL

      - name: Download APK from EAS Build
        run: |
          # 提取最新一次构建的 APK 链接并下载
          cd mobile
          APK_URL=$(npx eas-cli build:list --platform android --profile preview --limit 1 --json --non-interactive | jq -r '.[0].artifacts.buildUrl')
          curl -L $APK_URL -o subdue-mobile.apk

      - name: Create Release and Upload Asset
        uses: softprops/action-gh-release@v2
        with:
          files: mobile/subdue-mobile.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

有了这个配置后，以后您想发布新版本时，只需要在终端运行：
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub Actions 就会在后台**自动**把 App 打包成 APK，并将其挂载在仓库的 Release 下载页面上！
