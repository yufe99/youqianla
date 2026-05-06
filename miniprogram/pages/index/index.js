// miniprogram/pages/index/index.js
const app = getApp();

Page({
  data: {
    statusBarHeight: 20,
    greeting: '晚上好，每一份汗水都有回报',
    maskMode: false,
    netIncome: 1280,
    todayIncome: 1500,
    todayExpense: 220,
    records: [
      { id: '1', type: '高级足浴', entryType: 'income', amount: 150, time: '19:20', orderNumber: 'A8821' },
      { id: '2', type: '晚餐宵夜', entryType: 'expense', amount: 45, time: '18:45' }
    ],
    goal: { name: '买一台新款 iPad', targetAmount: 5000, currentAmount: 3200 },
    goalProgress: 64,
    goalRemain: 1800
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight
    });
    this.updateGreeting();
  },

  updateGreeting() {
    const hour = new Date().getHours();
    let g = '你好，打工人！';
    if (hour < 12) g = '上午好，今天是努力赚钱的一天！';
    else if (hour < 18) g = '下午好，每一单都是为了更好的生活';
    else g = '晚上好，每一份汗水都有回报';
    this.setData({ greeting: g });
  },

  toggleMask() {
    this.setData({ maskMode: !this.data.maskMode });
    wx.vibrateShort();
  },

  showAddModal() {
    // 您可以继续在这里实现原生的弹出层逻辑
    wx.showToast({ title: '准备记账...', icon: 'none' });
  }
})
