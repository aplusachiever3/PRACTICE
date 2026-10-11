# 随笔记智能机器：Android / iPhone App 起步工程

此目录是独立的 Capacitor 移动端包装层，不替换 GitHub Pages 根目录网站，也不会主动清理或迁移用户浏览器中的记录。

## 当前实现

- 复用仓库根目录的 `index.html`，由 `npm run sync:web` 同步到 `mobile/src/index.html`。
- 使用 Capacitor Share + Filesystem：将记录中的 base64 照片写入临时缓存，再把照片文件和文案交给 Android/iOS 系统分享菜单。
- 根目录网页继续使用原有浏览器分享逻辑；只有打包后的原生 App 会启用 `NativeShareBridge`。
- 不直接调用微信私有接口，也不自动发布朋友圈。用户仍需在系统分享菜单/微信中选择目标并确认发布；微信是否接受多张图片和正文组合取决于系统、微信版本及分享目标支持。

## 本地构建准备

需要安装 Node.js（建议当前 LTS）、Android Studio；iOS 构建还需要 macOS 与 Xcode。

```sh
cd mobile
npm install
npm run build
npx cap add android
# 在 macOS 上另外执行：npx cap add ios
npm run cap:sync
npx cap open android
# macOS + Xcode：npx cap open ios
```

如果平台目录已存在，不要重复执行 `npx cap add`；之后运行 `npm run cap:sync` 同步网页和插件。

## 本机记录迁移提醒

浏览器中的 `localStorage` 与原生 App WebView 的存储空间通常彼此隔离。此起步工程不会删除浏览器数据，但也不会自动把浏览器记录复制进 App。首次切换前，请先在原网站导出备份；后续应实现明确的导入流程并验证导入结果，再考虑迁移。

## 微信朋友圈的现实限制

此阶段使用系统分享面板，不等于已完成微信 Open SDK 集成。不能保证微信朋友圈一次接收多张照片和完整文案，也不能绕过微信确认页面。若后续必须精确控制微信分享类型，需要注册/配置微信开放平台应用、集成对应原生 SDK，并分别验证 Android 与 iOS 的能力和审核要求。
