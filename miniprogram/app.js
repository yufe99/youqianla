// miniprogram/app.js
App({
  onLaunch() {
    // 这里可以进行全局初始化，如云开发环境配置
    console.log('今日有钱啦 原生小程序启动');
  },
  globalData: {
    userInfo: null,
    // 可以在这里配置云托管的 API 地址
    baseUrl: 'https://express-keku-254212-5-1428799482.sh.run.tcloudbase.com'
  }
})
