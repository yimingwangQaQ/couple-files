# 我们的小窝 💕

基于 **uni-app（Vue2）** 开发的微信小程序情侣应用，数据存储在微信云开发云数据库中，支持两人实时共享数据与订阅消息通知。

---

## 功能页面

### 任务清单
- 添加、完成、删除共同待办任务
- 支持按状态筛选（全部 / 待完成 / 已完成）
- 顶部统计已完成 / 总任务数
- 完成任务后可发送订阅消息通知对方

### 菜谱菜单
- 以网格卡片形式展示菜谱收藏
- 支持「今日点单」chips，临时标记想吃的菜（不存云端）
- 菜谱可点赞投票，票数实时同步
- 添加 / 删除菜谱

### 旅游计划
- 卡片式展示旅行目的地，含状态与预算信息
- 状态：计划中 / 进行中 / 已完成
- 添加 / 删除计划，一键更新计划状态
- 完成计划后可发送订阅消息通知对方

---

## 技术栈

| 项目 | 说明 |
|------|------|
| 框架 | uni-app（Vue2） |
| 目标平台 | 微信小程序 |
| 数据存储 | 微信云开发云数据库 |
| 云函数 | `sendNotify`（订阅消息推送）、`registerUser`（用户注册） |
| 状态管理 | 无 Vuex，使用轻量 store 对象 |
| 开发工具 | HBuilderX + 微信开发者工具 |

---

## 快速开始

### 前置条件
- 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 开通微信云开发并创建云环境

### 第一步：新建 uni-app 项目
1. HBuilderX → 文件 → 新建 → 项目
2. 选择「uni-app」，Vue 版本「Vue2」，模板「默认模板」

### 第二步：覆盖文件
将本仓库文件按路径覆盖到新项目：

```
App.vue              → 项目根目录
main.js              → 项目根目录
pages.json           → 项目根目录
manifest.json        → 项目根目录
uni.scss             → 项目根目录
store/index.js       → store/
pages/task/task.vue      → pages/task/
pages/recipe/recipe.vue  → pages/recipe/
pages/plan/plan.vue      → pages/plan/
cloudfunctions/          → 项目根目录
```

### 第三步：配置云环境
打开 `App.vue`，将 `onLaunch` 中的云环境 ID 替换为你自己的：

```js
wx.cloud.init({ env: 'YOUR_ENV_ID' })
```

### 第四步：创建云数据库集合
在微信云开发控制台创建以下集合，权限设为**所有用户可读可写**：
- `tasks`
- `recipes`
- `plans`

### 第五步：部署云函数
在 HBuilderX 中右键 `cloudfunctions/sendNotify` 和 `cloudfunctions/registerUser`，选择「上传并部署」。

### 第六步：运行
菜单 → 运行 → 运行到小程序模拟器 → 微信开发者工具

---

## 自定义情侣信息

打开 `store/index.js`，修改顶部的 `coupleInfo`：

```js
coupleInfo: {
  name1: '小董',   // 修改为你们的昵称
  name2: '小王',
  avatar1: '👧',
  avatar2: '👦',
  startDate: '2019-07-04'  // 在一起的纪念日
}
```

---

## 订阅消息通知（可选）

如需启用任务/计划完成时推送通知给对方：

1. 前往[微信公众平台](https://mp.weixin.qq.com) → 功能 → 订阅消息，申请模板
2. 将模板 ID 填入 `store/index.js` 顶部：

```js
export const TASK_TMPL_ID = 'your_task_template_id'
export const PLAN_TMPL_ID = 'your_plan_template_id'
```

---

## 项目结构

```
├── App.vue                  # 应用入口，云开发初始化
├── main.js                  # uni-app 入口
├── pages.json               # 页面路由 & TabBar 配置
├── manifest.json            # 小程序配置
├── uni.scss                 # 全局样式变量
├── store/
│   └── index.js             # 数据层，封装所有云数据库操作
├── pages/
│   ├── task/task.vue        # 任务清单页
│   ├── recipe/recipe.vue    # 菜谱菜单页
│   └── plan/plan.vue        # 旅游计划页
└── cloudfunctions/
    ├── sendNotify/          # 订阅消息推送云函数
    └── registerUser/        # 用户注册云函数
```
