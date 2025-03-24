// pages/buluo/post/post.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',     // 表白内容
    attachments: [], // 图片列表
    targetName: '',  // 心仪对象
    phone: '',        // 手机号码
    canPost:true
  },

   // 获取输入内容
  getTextContent(e) {
    this.setData({ content: e.detail.value });
  },

  // 获取心仪对象
  getName(e) {
    this.setData({ targetName: e.detail.value });
  },

  // 获取手机号
  getPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  // 图片上传成功回调
  uploadSuccess(e) {
    this.setData({
      attachments: [...this.data.attachments, e.detail.url]
    });
  },

  // 提交数据到云开发
  async post() {
    if (!this.data.content.trim()) {
      wx.showToast({ title: '内容不能为空', icon: 'none' });
      return;
    }

    this.setData({ canPost: false }); // 防止重复提交
    wx.showLoading({ title: '发布中...' });

    try {
      const db = wx.cloud.database();
      
      // 插入主帖子数据 - 不使用 _.expr('$openid')
      const postRes = await db.collection('posts').add({
        data: {
          content: this.data.content,
          attachments: this.data.attachments,
          targetName: this.data.targetName,
          phone: this.data.phone,
          // 使用全局存储的用户信息或者后续通过云函数补充
          author: getApp().globalData.userInfo.id,
          createdAt: db.serverDate(),
          likesCount: 0,
          comments: []
        }
      });

      wx.showToast({ title: '发布成功', icon: 'success' });
      
      // 返回首页并刷新
      wx.navigateBack({
        success: () => {
          const pages = getCurrentPages();
          if (pages.length > 0) {
            pages[pages.length - 1].onLoad();
          }
        }
      });
    } catch (err) {
      console.error('提交失败:', err);
      wx.showToast({ 
        title: '发布失败: ' + (err.message || err.errMsg || '未知错误'), 
        icon: 'none',
        duration: 3000
      });
    } finally {
      this.setData({ canPost: true });
      wx.hideLoading();
    }
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
})