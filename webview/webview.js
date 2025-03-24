// pages/webview/webview.js
Page({
  data: {
    url: '', // 推文链接
    articleUrl: '' // 用于存储文章链接
  },

  onLoad(options) {
    if (options.articleUrl) {
      const decodedUrl = decodeURIComponent(options.articleUrl);
      console.log("加载的 URL:", decodedUrl); // 调试日志
      this.setData({ 
        url: decodedUrl,
        articleUrl: decodedUrl // 设置 articleUrl 的值
      });
    } else {
      console.error("未传递有效的 URL 参数");
    }
  },

  onShareAppMessage() {
    return {
      title: '星汇推文分享',
      path: `/pages/webview/webview?articleUrl=${encodeURIComponent(this.data.url)}`,
      imageUrl: '' // 可选分享图片
    };
  }
});
