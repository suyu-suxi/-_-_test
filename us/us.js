// pages/us/us.js
Page({
  data: {
    images: {
      background: "", // 星空背景图片
      logo: ""        // 公司Logo图片
    },
    content: {
      culture: "秉承初心 追逐热爱 星星汇聚 闪耀时代", // 企业文化
      values: "以有热爱的学生为核心",               // 企业价值观
      slogan: "因热爱 无限可能 因无畏 奔赴山海"      // 企业宣传语
    }
  },

  onLoad() {
    this.loadImagesFromCloud();
  },

  // 加载云端图片
  loadImagesFromCloud() {
    const that = this;

    // 图片云端路径配置
    const cloudImages = {
      background: "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/我的/星空背景.png",
      logo: "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/我的/公司Logo.jpg"
    };

    // 获取临时文件 URL
    wx.cloud.getTempFileURL({
      fileList: Object.values(cloudImages),
      success(res) {
        const tempFiles = res.fileList;
        that.setData({
          images: {
            background: tempFiles[0]?.tempFileURL || "/images/default-background.png", // 默认背景
            logo: tempFiles[1]?.tempFileURL || "/images/default-logo.png"             // 默认Logo
          }
        });
      },
      fail(err) {
        console.error("图片加载失败", err);
        // 使用默认图片
        that.setData({
          images: {
            background: "/images/default-background.png",
            logo: "/images/default-logo.png"
          }
        });
      }
    });
  }
});
