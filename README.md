# 书智对谈

基于uniapp+vue3开发的微信小程序，支持扫描书籍ISBN码或手动输入书籍信息，开启与书本的智能对话。

## 项目简介

"书智对谈"是一款基于人工智能的读书助手应用，通过扫描书籍ISBN码或手动输入书籍信息，为用户提供智能化的书籍解析和对话功能。使用本应用，用户可以：

- 扫描书籍ISBN码快速识别书籍
- 手动输入书籍信息
- 与书籍内容进行智能对话
- 获取书籍的深度解析和内容洞见

本项目采用uniapp+vue3开发，支持编译为微信小程序，实现跨平台应用开发。

## 技术栈

- 前端框架：Vue 3
- 跨平台框架：uni-app
- UI组件：uni-ui
- 预处理器：Sass
- 包管理工具：npm

## 目录结构

```
书智对谈/
├── src/                          # 源码目录
│   ├── pages/                    # 页面文件目录
│   │   └── index/                # 首页页面
│   │       └── index.vue         # 首页组件
│   ├── static/                   # 静态资源目录
│   │   ├── logo.png              # 应用logo
│   │   └── iconfont.css          # 图标字体
│   ├── App.vue                   # 应用入口组件
│   ├── main.js                   # 应用入口JS
│   ├── manifest.json             # 应用配置文件
│   ├── pages.json                # 页面路由配置
│   └── uni.scss                  # 全局样式
├── doc/                          # 文档目录
├── package.json                  # 项目依赖配置
└── README.md                     # 项目说明文档
```

## 功能模块

### 1. 首页

首页界面包含以下主要功能区块：

- **欢迎区域**：展示应用Logo和欢迎语
- **功能特性**：展示"深度解析"和"智能对话"两大核心功能
- **交互入口**：提供"扫描ISBN"和"手动输入"两种使用方式
- **聊天界面**：用户与AI的对话界面
- **输入区域**：支持文字输入和语音输入

### 2. 书籍识别

支持两种书籍识别方式：

- **扫描ISBN**：调用微信扫码API，识别书籍ISBN码
- **手动输入**：手动输入书籍ISBN或书名，进行搜索

### 3. 智能对话

基于识别的书籍信息，提供以下功能：

- 智能回答用户关于书籍的问题
- 提供书籍内容的深度解析
- 支持连续对话，实现与书籍的自然交流

## 安装与运行

### 开发环境准备

确保已安装以下工具：

- Node.js (推荐 v12 或更高版本)
- npm 或 yarn
- 微信开发者工具

### 安装依赖

```bash
# 安装项目依赖
npm install

# 安装sass预处理器（必需）
npm install -D sass
```

### 运行项目

```bash
# 运行微信小程序
npm run dev:mp-weixin
```

然后使用微信开发者工具打开项目的`dist/dev/mp-weixin`目录即可预览。

### 打包构建

```bash
# 构建微信小程序
npm run build:mp-weixin
```

## 项目配置

### 小程序配置

在`src/manifest.json`文件中进行小程序相关配置：

```json
"mp-weixin": {
    "appid": "你的小程序appid",
    "setting": {
        "urlCheck": false
    },
    "usingComponents": true
}
```

### 页面路由配置

在`src/pages.json`文件中配置页面路由和样式：

```json
{
    "pages": [
        {
            "path": "pages/index/index",
            "style": {
                "navigationBarTitleText": "书智对谈",
                "navigationBarBackgroundColor": "#5D5FEF",
                "navigationBarTextStyle": "white"
            }
        }
    ],
    "globalStyle": {
        "navigationBarTextStyle": "black",
        "navigationBarTitleText": "书智对谈",
        "navigationBarBackgroundColor": "#F8F8F8",
        "backgroundColor": "#F8F8F8"
    }
}
```

## 开发规范

### 代码风格

- 使用Vue 3组合式API
- 组件采用PascalCase命名方式
- CSS类名采用kebab-case命名方式

### 提交规范

提交信息格式：`类型(范围): 描述`

常用类型:
- feat: 新功能
- fix: 修复bug
- docs: 文档变更
- style: 代码格式调整
- refactor: 代码重构
- perf: 性能优化
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 待开发功能

- [ ] 个人中心页面
- [ ] 阅读历史记录
- [ ] 书籍收藏功能
- [ ] 语音识别功能优化
- [ ] 分享功能

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交变更 (`git commit -m 'feat: 添加某功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

