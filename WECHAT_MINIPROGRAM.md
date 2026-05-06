# 如何将本项目导入微信小程序？

本项目已针对 **微信云托管 (WeChat Cloud Run)** 进行了深度优化。你可以通过以下步骤在 5 分钟内将其变为正式的微信小程序。

### 核心方案：Web-view 模式
由于本项目使用了 React 18 高级特性，使用微信小程序的 `web-view` 组件是性能最好、功能最全的适配方式。

---

## 第一步：获取你的线上 URL
1. 将本项目部署到 **微信云托管**。
2. 部署成功后，你会获得一个类似 `https://xxx-xxx.service.tcloudbase.com` 的线上访问域名。

## 第二步：创建小程序外壳
在 **微信开发者工具** 中新建一个小程序项目，并修改以下文件：

### 1. `app.json` (配置文件)
```json
{
  "pages": [
    "pages/index/index"
  ],
  "window": {
    "navigationStyle": "custom",
    "backgroundColor": "#F8F9FF"
  }
}
```

### 2. `pages/index/index.wxml` (界面文件)
```xml
<!-- 指向你云托管部署后的域名 -->
<web-view src="https://你的云托管域名.com"></web-view>
```

### 3. `pages/index/index.js` (逻辑文件)
```javascript
Page({
  onLoad: function() {
    console.log('今日有钱加载中...');
  }
})
```

---

## 为什么现在的项目就是“小程序”了？

1. **账户自动关联**：我们在 `server.ts` 中通过 `x-wx-openid` 请求头自动识别微信用户。当你在微信内打开这个页面时，后端会自动为每个微信用户分配独立的账本，无需登录。
2. **UI 深度适配**：
   - 使用了 `viewport-fit=cover` 适配 iPhone 刘海。
   - 使用了 `env(safe-area-inset-bottom)` 确保底部导航不被遮挡。
   - 按钮点击态 (`active:scale-95`) 与小程序原生手感一致。
3. **云托管原生支持**：根目录下的 `Dockerfile` 已配置好，支持一键上传到微信云托管。

### 接下来建议：
- **手动增加支出**：点击首页侧边的“眼睛”图标可以开启“老板来了”脱敏模式。
- **自定义支出项**：在“管理”页面中可以添加你常用的支出分类（如：吸烟、零食等）。
