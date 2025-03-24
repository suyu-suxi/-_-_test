Page({
  data: {
    list: [
      {
        isLiked: false, // 统一使用 isLiked
        num: 10,
        clickCount: 0,
        name: '星汇',
        title: '星汇动态：徒步活动圆满成功',
        author: '004 小鱼',
        url: 'https://mp.weixin.qq.com/s/-fxhGJUAb8DFOe8XL9djkQ?token=166926222&lang=zh_CN',
        image: 'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/徒步.jpg'
      },
      {
        isLiked: false, // 修正拼写错误 islinked -> isLiked
        name: '星汇',
        num: 10,
        clickCount: 0,
        title: '探纪者：星汇项目正式启动',
        author: '',
        url: 'https://mp.weixin.qq.com/s/fYSylxNC6iGkGknksQUCnA?token=166926222&lang=zh_CN',
        image: 'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/加载/加载(竖图).jpg'
      },
      {
        isLiked: false, // 修正拼写错误
        name: '星汇',
        num: 10,
        clickCount: 0,
        title: '创意手工坊',
        author: '',
        url: '',
        image: 'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/加载/加载(竖图).jpg'
      },
      {
        isLiked: false, // 修正拼写错误
        name: '星汇',
        num: 10,
        clickCount: 0,
        title: '',
        author: '',
        url: '',
        image: 'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/加载/加载(竖图).jpg'
      },
      {
        isLiked: false, // 修正拼写错误
        name: '星汇',
        num: 10,
        clickCount: 0,
        title: '光影星球',
        author: '',
        url: '',
        image: 'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/加载/加载(竖图).jpg'
      },
    ],
    images: [
      {
        src: "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/首页/首页顶部宣传轮播图/光影星球.jpg",
        url: "https://mp.weixin.qq.com/s/-fxhGJUAb8DFOe8XL9djkQ?token=166926222&lang=zh_CN"
      },
      {
        src: "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/首页/首页顶部宣传轮播图/徒步.jpg",
        url: "https://mp.weixin.qq.com/s/vpnmUa4O2FQNkKegVORH3g?token=166926222&lang=zh_CN"
      },
      {
        src: "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/首页/首页顶部宣传轮播图/探纪者.png",
        url: "https://mp.weixin.qq.com/s/fYSylxNC6iGkGknksQUCnA?token=166926222&lang=zh_CN"
      },
      {
        src: "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/首页/首页顶部宣传轮播图/星汇最佳人气.png",
        url: "https://forms.ebdan.net/ls/81C6z5sK?bt=yxy"
      }
    ],
    bannerList: [
      "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/徒步.jpg",
      "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/加载/加载(横图).jpg",
      "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/加载/加载(横图).jpg",
      "cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/加载/加载(横图).jpg"
    ],
  },

  onLoad() {
    this.loadImagesFromCloud();
  },
  
  // 图片加载方法（优化版）
  loadImagesFromCloud() {
    wx.showLoading({ title: '加载中...' })
    
    const loadTasks = [
      this._loadListImages(),
      this._loadBannerImages(),
      this._loadOtherImages()
    ];

    Promise.all(loadTasks)
      .catch(err => {
        console.error('图片加载失败:', err)
        wx.showToast({ title: '图片加载失败', icon: 'none' })
      })
      .finally(() => wx.hideLoading())
  },

  // 加载瀑布流图片
  _loadListImages() {
    return new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: this.data.list.map(item => item.image),
        success: res => {
          const list = this.data.list.map((item, index) => ({
            ...item,
            clickCount: item.clickCount || 0, // 确保计数器存在
            image: res.fileList[index]?.tempFileURL || '',
            isLiked: item.isLiked || false,
            num: Math.max(0, Number(item.num) || 0) // 修复缺少的右括号
          }))
          this.setData({ list }, resolve)
        },
        fail: reject
      })
    })
  },

  // 加载轮播图
  _loadBannerImages() {
    return new Promise((resolve, reject) => {
      wx.cloud.getTempFileURL({
        fileList: this.data.bannerList,
        success: res => {
          const bannerList = res.fileList.map(file => file.tempFileURL)
          this.setData({ bannerList }, resolve)
        },
        fail: reject
      })
    })
  },

  // 加载其他图片（根据需求实现）
  _loadOtherImages() {
    return Promise.resolve() // 预留实现
  },

  // 统一页面跳转方法,如果url无法跳转则输出'功能尚未开发'
  navigateToArticle(e) {
    const url = e.currentTarget.dataset.url
    if (!url) {
      wx.showToast({ title: '功能尚未开放', icon: 'none' })
      return
    }

    // 防抖处理（500ms内不重复点击）
    const now = Date.now()
    if (this.lastNavigateTime && now - this.lastNavigateTime < 500) return
    this.lastNavigateTime = now

    wx.navigateTo({
      url: `/pages/webview/webview?articleUrl=${encodeURIComponent(url)}`
    })
  },

  // 点赞处理（优化版）
  handleLike(e) {
    const index = e.currentTarget.dataset.index
    if (index === undefined || index >= this.data.list.length) return

    // 防抖处理（300ms内不重复点击）
    const now = Date.now()
    if (this.lastLikeTime && now - this.lastLikeTime < 300) return
    this.lastLikeTime = now

    const newList = this.data.list.map((item, i) => {
      if (i === index) {
        const newStatus = !item.isLiked
        return {
          ...item,
          isLiked: newStatus,
          num: Math.max(0, newStatus ? item.num + 1 : item.num - 1)
        }
      }
      return item
    })

    this.setData({ list: newList })
  },

  navigateToLuminousShadow() {
    wx.switchTab({
      url: "/pages/Luminous_Shadow/Luminous_Shadow"
    })
  },

})