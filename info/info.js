Page({
  data: {    
    showPopup: false, // 控制弹窗显示
  },
  navigateToTargetPage() {
    wx.navigateTo({
      url: '/pages/targetPage/targetPage', // 目标页面路径
    });
  },

  // 显示图片弹窗
  showImagePopup() {
    this.setData({
      showPopup: true,
    });
  },

  // 隐藏图片弹窗
  hideImagePopup() {
    this.setData({
      showPopup: false,
    });
  },
});