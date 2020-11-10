# react-funlip

基于 React+Antd 开发 Chrome Extension 的项目 funlip

本项目架构实现了以下功能：

- 集成 less
- 集成 React+Ant Design
- 集成 react-router-dom
- 解决 Ant Design 全局样式污染问题
- 实现 Ant Design 按需加载
- 将 popup、content、background 目录互相独立，便于团队协作开发维护
- 按照 Chrome Extension 最终生成目录要求配置 webpack
- 封装 axios，可以将 API 请求委托给 background script 执行，从而实现跨域请求
- 设置.env.development 环境变量，便于在开发环境下禁止委托 background script 发起请求
- 用户登录登出 设置主密码 添加网址密码
- 页面自动填充用户账号密码
- 插件端手动填充用户账号密码
- 用户登录时，弹出是否需要保存密码

## 安装

git clone 至本地，执行 npm install 或 cnpm install 安装依赖。

## 开发调试

执行：

```
yarn start
```

即可在开发环境预览调试 popup 页面

如果需要在开发环境预览调试 content script，

修改 src/popup/index.js

引入 content script

```
    import React, { Fragment } from 'react'
    import { HashRouter, Route, Switch, Redirect } from 'react-router-dom'
    import Login from './pages/login'
    import Home from './pages/home'
    import './popup.styl'
+   import '@/content'
```

## build 项目

执行：

```
yarn build
```

即可生成最终 Chrome Extension 文件。

## 精简最终 build 文件

build 生成的最终文件，对于插件来说，有很多是不必要的。

可删除以下文件：

```
    ├─ /images
    ├─ /static
    |  ├─ /css
    |  |  ├─ content.css
-   |  |  ├─ content.css.map
    |  |  ├─ main.css
-   |  |  └─ main.css.map
    |  ├─ /js
    |  |  ├─ background.js
-   |  |  ├─ background.js.LICENSE.txt
-   |  |  ├─ background.js.map
    |  |  ├─ content.js
-   |  |  ├─ content.js.LICENSE.txt
-   |  |  ├─ content.js.map
    |  |  ├─ main.js
-   |  |  ├─ main.js.LICENSE.txt
-   |  |  └─ main.js.map
    |  ├─ /media
-   ├─ asset-manifest.json
    ├─ favicon.ico
    ├─ index.html
    ├─ insert.js
    ├─ manifest.json
-   ├─ precache-manifest.xxxxxxx.js
-   ├─ service-worker.js
```
