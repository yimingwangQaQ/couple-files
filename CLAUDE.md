# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

基于 uni-app（Vue2）开发的微信小程序情侣应用，包含任务清单、菜谱菜单、旅游计划三个功能页面。数据存储在微信云开发云数据库中。

## 开发方式

用 **HBuilderX** 开发，编译到微信小程序。没有 npm 脚本或命令行构建命令，通过 HBuilderX 界面操作：运行 → 运行到小程序模拟器 → 微信开发者工具。

## 架构说明

**三个页面**（tab 导航，配置在 `pages.json`）：
- `pages/task/task.vue` — 任务清单，含筛选、统计头部、添加弹窗
- `pages/recipe/recipe.vue` — 菜谱网格，含今日点单 chips、添加弹窗
- `pages/plan/plan.vue` — 旅游计划卡片，含状态/预算，添加弹窗

**数据层**（`store/index.js`）：
- 所有操作均为 async，通过 `wx.cloud.database()` 对接云数据库
- 云数据库集合：`tasks`、`recipes`、`plans`，权限均设为「所有用户可读可写」
- 无 Vuex，store 是普通导出对象，提供 `loadTasks`/`addTask` 等异步方法
- 每个页面在 `onShow` 和每次数据变更后调用 `store.load*()` 刷新本地状态

**云开发初始化**（`App.vue` `onLaunch`）：
- `wx.cloud.init({ env: 'YOUR_ENV_ID' })`，env 需替换为实际云环境 ID

## 关键约定

- 尺寸单位使用 `rpx`（微信小程序响应式像素）
- 云数据库记录主键为 `_id`（字符串），不使用数字 id
- 菜谱页的 `selectedDishes`（今日点单）仅为页面内临时状态，不持久化到云端
- 样式均为 `scoped`，全局基础样式在 `uni.scss` 和 `App.vue <style>` 中
