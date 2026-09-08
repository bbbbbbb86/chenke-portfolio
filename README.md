# Chenke Portfolio

个人作品集框架：大字姓名首页、横向作品浏览、项目详情、About 页面。

## 替换内容

编辑 `app/content.json`：

- `profile`：姓名、首页短句、设计方向、个人介绍、邮箱。邮箱为空时不显示联系按钮。
- `projects`：项目标题、类别、年份、封面路径和介绍。
- 将图片放入 `public/images/`，例如 `public/images/project-01.jpg`，再将 `image` 设置为 `/images/project-01.jpg`。
- 项目正文结构位于每个项目的 `sections` 数组，可依次填写背景、过程、成果。
- 配色、字体和响应式布局统一在 `app/globals.css`。

占位文案不是实际履历、项目成果或合作承诺。

## 运行

```sh
npm install
npm run dev
```

## 构建

```sh
npm run build
```

动效尊重系统“减少动态效果”偏好。主要导航支持键盘操作；移动端支持横向滑动作品。
