
Page({
  data:{
    Url: 'https://637a-czyyuq668-3gx14c7f26524c39-1331362988.tcb.qcloud.la/%E5%85%89%E5%BD%B1%E6%98%9F%E7%90%83%E7%B4%A0%E6%9D%90/%E4%B8%A4%E5%B0%8F%E6%97%B6%E8%AE%A1%E5%88%92%E6%8A%A5%E5%90%8D.jpg?sign=8a785a5873d1dec368e9b971d87c26b7&t=1736052641'},
    fetchCloudImages() {
      wx.cloud.getTempFileURL({
        fileList: [
          // 轮播图
          'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/光影星球素材/两小时计划报名.jpg'],
        });
      },
      success: (res) => {
        const urls = res.fileList.map((file) => file.tempFileURL);
        this.setData({
          imageUrl01: urls[0]
        });
      }
  })