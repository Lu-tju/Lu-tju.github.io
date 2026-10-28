# Junjie Lu · 学术主页

纯 HTML、CSS 和 JavaScript，无依赖、无需构建。支持中英文切换，自动记住语言和动图播放偏好；适配电脑和手机。

## 本地预览

直接打开 `index.html`，或运行：

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

浏览器访问 `http://127.0.0.1:8000`。

## 文件结构

```text
index.html            页面结构、导航和默认 SEO 信息
content.js            中英文个人资料、论文、项目、教育、荣誉和学术活动
app.js                内容渲染、中英文切换、动图控制和导航高亮
styles.css            样式与响应式布局
assets/               页面实际使用的头像、图标、视频和封面
scripts/check_site.py  本地资源、内容 ID、锚点和链接格式自检
.nojekyll             GitHub Pages 静态托管配置
.gitignore            本地配置和临时文件排除规则
```

## 内容维护

在 `content.js` 中同步更新 `zh` 和 `en`；固定界面文案位于 `app.js` 的 `labels`。`settings.updated` 为内容更新日期，`englishReady` 控制英文版可用性。

- `profile`、`intro`、`interests`：个人资料、介绍和研究方向。
- `papers`：论文，`selected: true` 表示代表工作；代表工作按数组顺序显示，其他论文按年份降序排列。论文数量自动统计。
- `projects`、`education`：科研项目和教育经历。
- `honors`、`services`：荣誉与学术活动；`bold: true` 将条目标题加粗，没有年份则留空。

论文标题与作者保留原文；论文状态、作者注释及项目介绍按语言翻译。作者超过五人时缩略显示，保留本人，完整名单可悬停查看。

媒体简写 `media: "yopo"` 对应 `assets/media/yopo.mp4` 和 `assets/media/yopo.webp`。也可以使用对象指定 `type`、`src`、`poster`、`caption`；`controls: true` 启用视频播放控件。替换媒体后保持路径及文件名大小写一致；删除内容时同步清理不再引用的资源。

## 检查与部署

提交前运行：

```bash
python3 scripts/check_site.py
```

将本工程提交到 GitHub 站点仓库，然后在 **Settings → Pages** 中选择 **Deploy from a branch**，指定实际分支和 **/(root)**。运行必需文件为 `index.html`、`content.js`、`app.js`、`styles.css`、`assets/` 和 `.nojekyll`。

用户站仓库名为 `USERNAME.github.io`，项目站也支持使用相对路径。发布后若仍显示旧内容，可强制刷新浏览器。
