# 妙笔生花 · AI 创作前端

基于 uni-app（Vue 3）的 AI 创作应用前端，覆盖「文字生图 / 视频创作 / 图片优化」三条创作链路，支持 H5 与PC端等多端编译。整体采用茶金 + 暖杏的国风暖色视觉。

## 功能概览

| 模块 | 说明 |
| --- | --- |
| 账号 | 注册、登录、退出、资料修改、头像上传与账号注销 |
| 首页与创作台 | 浏览创作入口、选择创作类型、恢复草稿并查看任务 |
| 文字生图 | 编辑提示词、选择画风和画幅、优化提示词、报价并生成图片 |
| 图片优化 | 上传图片、选择优化提示词、查看报价、生成结果并对比原图 |
| 视频创作 | 设置提示词、画幅和时长，查看报价、创建视频并播放结果 |
| 图片处理 | 上传前校验与压缩、上传进度和取消、批量图片优化 |
| 作品库 | 搜索标题或提示词、按类型筛选和时间排序；修改标题、删除及分页查看 |
| 作品预览 | 保存图片或视频、分享作品、设置视频封面 |
| 草稿 | 手动保存、分页查看、继续编辑、修改名称和删除草稿 |
| 工作坊 | 按分类浏览创作模板，并将模板参数带入创作页面 |
| 通知与积分 | 查看完成通知和未读数、积分余额、报价及积分流水 |
| 跨端体验 | 适配 App、H5 和微信小程序；提供弱网、权限及加载失败提示 |

## 技术栈

- **多端框架**：uni-app 3、Vue 3 Composition API（`<script setup>`），通过条件编译适配 App、H5 和微信小程序。
- **构建工具**：Vite 5、`@dcloudio/vite-plugin-uni`。
- **UI 与样式**：H5 使用 Element Plus 和图标库；SCSS 管理样式与主题变量，App/小程序使用 uni-app 原生组件。
- **状态与路由**：Vue `reactive` 管理会话状态；页面路由由 `pages.json` 配置并通过导航拦截器处理登录校验。
- **接口与演示**：统一 API 请求层连接 FastAPI；`src/mock` 提供开发演示数据和模拟接口。

## 快速开始

```bash
npm install
npm run dev:h5
npm run dev:mp-weixin
```

设置 `.env.development` 的 `VITE_USE_MOCK=true` 使用 Mock；设为 `false` 并配置 `VITE_API_BASE_URL` 可连接后端。App 和小程序需使用设备可访问的完整地址并包含 `/api`，小程序还需配置合法请求域名。

```dotenv
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://你的服务域名/api
```

## 目录结构

```
src/
├─ apis/        # 接口请求层
├─ components/  # 公共组件（底部导航、页头、轮播、生成弹窗等）
├─ hooks/       # 复用逻辑
├─ mock/        # Demo 数据与规则
├─ pages/       # 页面
├─ router/      # 路由与登录守卫
├─ stores/      # 会话状态
├─ styles/      # 全局设计令牌
└─ utils/       # 请求、鉴权等工具
```

## APP端 实现效果预览。

### 登录 / 注册
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/784b4055-d5ea-45bf-bf31-45d7ce3df7e5" />
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/644cd5bb-0eaf-469e-bc39-077db537d41d" />



### 首页 · 文稿库
<img width="374" height="813" alt="image" src="https://github.com/user-attachments/assets/c9c23b41-e923-42ae-ad65-386ce330c90f" />


### 创作台
<img width="452" height="1013" alt="image" src="https://github.com/user-attachments/assets/55566962-d640-495c-8fef-2c65aee366d8" />
<img width="452" height="1013" alt="image" src="https://github.com/user-attachments/assets/8d803e2e-992d-4b99-865b-48dc7d22b2c0" />



### 文字生图
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/0d606c14-036a-4a06-b70f-0ddbb2fe0e87" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/1e802c53-323d-46a7-bb73-7b3c2d545724" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/580b01e0-9c24-402e-a9aa-fa7e272fe71f" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/d8d5147d-2c2b-4c3f-b32f-10104ee6e82b" />


### 视频创作
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/f67bc1c1-80c1-4313-8d6e-3503e1ed55ef" />
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/2ddc4105-4836-4cb9-ba84-7c3c2e57c0f5" />
<img width="453" height="330" alt="image" src="https://github.com/user-attachments/assets/bdf1c4dc-0748-4a82-b61d-e7d76ff72054" />



### 图片优化
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/dce2fb18-2ec7-481b-b66d-ad939754f3f2" />
<img width="465" height="522" alt="image" src="https://github.com/user-attachments/assets/4adb282b-2687-4ff2-8eb9-c95d7e66adb8" />



### 作品库
<img width="452" height="1013" alt="image" src="https://github.com/user-attachments/assets/8996f635-7f96-462a-8afc-46cf5d4297e0" />
<img width="452" height="1013" alt="image" src="https://github.com/user-attachments/assets/ff48babe-a3de-4b77-981b-70e9407de1b0" />


### 我的
<img width="375" height="812" alt="image" src="https://github.com/user-attachments/assets/b234b431-1489-43cb-874f-c0ecb53303cc" />
<img width="452" height="1013" alt="image" src="https://github.com/user-attachments/assets/2bd2cb4d-60c7-4c08-8375-332d7519efc8" />




### 工作坊
<img width="450" height="1013" alt="image" src="https://github.com/user-attachments/assets/2a5e88a4-4bf5-4e38-93fc-85d964dbbcac" />



## PC端 实现效果预览。
<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/3254bf13-01ca-4044-a4b2-9d4a2a373a48" />

<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/077dce46-1d4b-4c8c-8f7a-d1227387bb8e" />

<img width="1920" height="911" alt="image" src="https://github.com/user-attachments/assets/e131203c-9779-4936-b2f8-c794b05cda05" />
