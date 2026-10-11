# 随笔记智能机器 V1.0

一个无需 API、可直接通过浏览器运行的中文个人笔记工具。

## 当前功能
- 快速创建、编辑笔记
- 分类：随笔、灵感、待办、工作、学习、生活、项目
- 标签、关键词搜索、排序
- 重要笔记、最近编辑、待办和归档筛选
- 简单的本地笔记整理建议（规则式，不依赖外部 AI 服务）
- JSON 导入与导出备份
- 桌面和手机响应式布局

## 数据与隐私
笔记默认保存在当前浏览器的 localStorage 中，不会自动上传到 GitHub。清除浏览器数据或换设备可能导致数据丢失，请定期点击“导出备份”。导出的 JSON 文件请妥善保管。

## 启用 GitHub Pages
1. 打开仓库 Settings。
2. 进入 Pages。
3. 在 Build and deployment 中选择 Deploy from a branch。
4. Branch 选择 main，目录选择 /(root)，点击 Save。
5. 等待 GitHub Pages 部署完成后，访问： https://aplusachiever3.github.io/PRACTICE/

## 文件
- `index.html`：完整的独立网页应用，无需构建步骤。
