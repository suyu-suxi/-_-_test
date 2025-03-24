// pages/buluo/index_2/index_2.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: [],
    isFirstPost: true,
    select: 1, // 默认选择"全部"标签
    showCommentInput: false, // 控制评论输入框显示
    commentAnimationData: {}, // 评论框动画数据
    baseImageUrl: '', // 图片基础URL
    showTopic: true, // 控制表白墙标题显示
    newMessage: false, // 控制新消息提示显示
    newMessageNumber: 0, // 新消息数量
    searchKey: '', // 搜索关键词
    commentContent: '', // 评论内容
    currentCommentObjId: '', // 当前评论对象ID
    currentCommentObjType: '', // 当前评论对象类型
    currentCommentRefId: null // 当前回复的评论ID
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    wx.pageScrollTo({ scrollTop: 0 }) // 重置滚动位置
    this.loadPosts()
  },

  // 加载帖子数据（从云数据库获取）
  loadPosts(type = 1) {
    wx.showLoading({ title: '加载中...' });
    
    // 根据选择类型设置查询条件
    let query = {};
    if (type === 2) { // 只加载收藏的帖子
      // 这里需要知道用户收藏的帖子ID列表，可能需要另外一个集合存储
      // 暂时不实现收藏功能的查询
    }
    
    const db = wx.cloud.database();
    const _ = db.command;
    
    db.collection('posts')
      .orderBy('createdAt', 'desc') // 按创建时间降序排列
      .where(query)
      .limit(20) // 限制加载数量，可以根据需求调整
      .get()
      .then(res => {
        console.log('加载帖子成功', res.data);
        
        // 处理帖子数据，格式化日期并添加需要的字段
        const currentUser = getApp().globalData.userInfo;
        const formattedPosts = res.data.map(post => {
          // 转换日期格式
          let createdDate = new Date(post.createdAt);
          let formattedDate = `${createdDate.getFullYear()}-${(createdDate.getMonth()+1).toString().padStart(2, '0')}-${createdDate.getDate().toString().padStart(2, '0')} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;
          
          // 检查当前用户是否已点赞
          const praises = post.praises || [];
          const hasLiked = praises.some(p => p.id === currentUser.id);

          return {
            id: post._id,
            content: post.content,
            attachments: post.attachments || [],
            created_at: formattedDate,
            topic: post.targetName || '无',
            poster: {
              id: post.author,
              nickname: post.authorNickname || '匿名用户', // 可能需要从用户集合获取
              avatar: post.authorAvatar || '/images/avatar.png' // 可能需要从用户集合获取
            },
            supertube: 0, // 管理员标识，可能需要从用户集合获取
            comments: post.comments || [],
            praises: post.praises || [],
            follow: false, // 是否关注，需要单独查询
            can_delete: post.author === getApp().globalData.userInfo.id || getApp().globalData.userInfo.supertube === 1 // 帖子作者或管理员可以删除
          };
        });
        
        this.setData({ 
          posts: formattedPosts,
          select: type
        });
      })
      .catch(err => {
        console.error('加载帖子失败', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
      })
      .finally(() => {
        wx.hideLoading();
        wx.stopPullDownRefresh(); // 如果是下拉刷新触发的加载，停止下拉动画
      });
  },

  // 选择标签（全部/最热/收藏）
  selected(e) {
    const type = parseInt(e.currentTarget.dataset.type);
    this.loadPosts(type);
  },

  // 跳转到话题界面
  Tohuati: function () {
    wx.navigateTo({
    url: '/pages/buluo/huati/huati' // 这是旧路径
    });
  },

  // 发帖后回调
  postSuccess() {
    this.setData({ isFirstPost: false });
    this.loadPosts(); // 重新加载帖子列表
  },

  // 点赞功能
  praise(e) {
  const postId = e.currentTarget.dataset.obj;
  console.log('点赞帖子:', postId);
  
  wx.showLoading({ title: '处理中...' });
  
  const db = wx.cloud.database();
  const _ = db.command;
  const currentUser = getApp().globalData.userInfo;
  
  // 先获取帖子信息，检查用户是否已点赞
  db.collection('posts').doc(postId).get().then(res => {
    const post = res.data;
    const praises = post.praises || [];
    
    // 检查当前用户是否已点赞
    const userPraiseIndex = praises.findIndex(p => p.id === currentUser.id);
    
    if (userPraiseIndex === -1) {
      // 用户未点赞，添加点赞
      return db.collection('posts').doc(postId).update({
        data: {
          praises: _.push({
            id: currentUser.id,
            nickname: currentUser.nickname,
            avatar: currentUser.avatar,
            created_at: db.serverDate()
          })
        }
      });
    } else {
      // 用户已点赞，取消点赞
      praises.splice(userPraiseIndex, 1);
      return db.collection('posts').doc(postId).update({
        data: {
          praises: praises
        }
      });
    }
  }).then(() => {
    // 操作成功后重新加载数据
    this.loadPosts(this.data.select);
    wx.hideLoading();
  }).catch(err => {
    console.error('点赞操作失败:', err);
    wx.showToast({ title: '操作失败', icon: 'none' });
    wx.hideLoading();
  });
  },

  // 关注/收藏帖子
  follow(e) {
    const postId = e.currentTarget.dataset.obj;
    console.log('收藏帖子:', postId);
    
    // 这里实现收藏逻辑
    // ...
    
    // 刷新帖子列表
    this.loadPosts(this.data.select);
  },

  // 取消关注/收藏
  cancelFolllow(e) {
    const postId = e.currentTarget.dataset.obj;
    console.log('取消收藏帖子:', postId);
    
    // 这里实现取消收藏逻辑
    // ...
    
    // 刷新帖子列表
    this.loadPosts(this.data.select);
  },

  // 删除帖子
  deletePost(e) {
    const postId = e.currentTarget.id;
    
    wx.showModal({
      title: '提示',
      content: '确定要删除这条帖子吗？',
      success: (res) => {
        if (res.confirm) {
          const db = wx.cloud.database();
          db.collection('posts').doc(postId).remove()
            .then(() => {
              wx.showToast({ title: '删除成功' });
              this.loadPosts(this.data.select); // 重新加载帖子列表
            })
            .catch(err => {
              console.error('删除失败:', err);
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
        }
      }
    });
  },

  // 显示评论输入框(现有函数修改)
  showCommentInput(e) {
    const objId = e.currentTarget.dataset.objid;
    const objType = e.currentTarget.dataset.objtype;
    
    // 重置动画
    this.commentAnimation.translateY(0).step();
    
    this.setData({
      showCommentInput: true,
      currentCommentObjId: objId,
      currentCommentObjType: objType,
      commentAnimationData: this.commentAnimation.export()
    });
  },

  // 隐藏评论输入框(现有函数修改)
  hiddenComment() {
    // 向下滑出动画
    this.commentAnimation.translateY('100%').step();
    
    this.setData({
      commentAnimationData: this.commentAnimation.export()
    });
    
    // 动画结束后才真正隐藏元素
    setTimeout(() => {
      this.setData({ 
        showCommentInput: false
      });
    }, 300);
  },


  // 获取评论内容
  getCommentContent(e) {
    this.setData({ commentContent: e.detail.value });
  },

  // 发送评论
  sendComment() {
  if (!this.data.commentContent || !this.data.commentContent.trim()) {
    wx.showToast({ title: '评论内容不能为空', icon: 'none' });
    return;
  }
  
  const postId = this.data.currentCommentObjId;
  const content = this.data.commentContent;
  const refId = this.data.currentCommentRefId;
  const currentUser = getApp().globalData.userInfo;
  
  wx.showLoading({ title: '发送中...' });
  
  const db = wx.cloud.database();
  
  // 获取当前帖子信息，以便检查发帖人
  db.collection('posts').doc(postId).get().then(res => {
    const post = res.data;
    const isAuthor = post.author === currentUser.id;
    
    // 构建评论对象
    let commentObj = {
      id: new Date().getTime().toString(), // 生成唯一ID
      content: content,
      commenter: {
        id: currentUser.id,
        nickname: currentUser.nickname,
        avatar: currentUser.avatar,
        supertube: currentUser.supertube
      },
      created_at: db.serverDate(),
      author: isAuthor ? 1 : 0, // 1表示楼主，0表示普通评论
      can_delete: true // 自己的评论可以删除
    };
    
    // 如果是回复其他评论
    if (refId) {
      // 找到被回复的评论
      const comments = post.comments || [];
      const refComment = comments.find(c => c.id === refId);
      
      if (refComment) {
        commentObj.ref_comment = {
          id: refId,
          refCommenter: refComment.commenter
        };
      }
    }
    
    // 更新帖子的评论
    return db.collection('posts').doc(postId).update({
      data: {
        comments: db.command.push(commentObj)
      }
    });
  }).then(() => {
    wx.showToast({ title: '评论成功' });
    this.setData({
      showCommentInput: false,
      commentContent: '',
      currentCommentRefId: null
    });
    // 重新加载帖子列表
    this.loadPosts(this.data.select);
  }).catch(err => {
    console.error('评论失败:', err);
    wx.showToast({ title: '评论失败', icon: 'none' });
  }).finally(() => {
    wx.hideLoading();
  });
  },

  // 删除评论
  deleteComment(e) {
  const postId = e.currentTarget.dataset.objid;
  const commentId = e.currentTarget.dataset.refid;
  
  wx.showModal({
    title: '提示',
    content: '确定要删除这条评论吗？',
    success: (res) => {
      if (res.confirm) {
        wx.showLoading({ title: '删除中...' });
        
        const db = wx.cloud.database();
        
        // 先获取帖子信息
        db.collection('posts').doc(postId).get().then(res => {
          const post = res.data;
          let comments = post.comments || [];
          
          // 找到并删除指定评论
          comments = comments.filter(c => c.id !== commentId);
          
          // 更新帖子
          return db.collection('posts').doc(postId).update({
            data: {
              comments: comments
            }
          });
        }).then(() => {
          wx.showToast({ title: '删除成功' });
          // 重新加载帖子列表
          this.loadPosts(this.data.select);
        }).catch(err => {
          console.error('删除评论失败:', err);
          wx.showToast({ title: '删除失败', icon: 'none' });
        }).finally(() => {
          wx.hideLoading();
        });
      }
    }
  });
  },

  // 预览图片
  previewMoreImage(e) {
    const current = e.currentTarget.id; // 当前图片
    const urls = e.currentTarget.dataset.obj.map(url => this.data.baseImageUrl + url); // 所有图片
    
    wx.previewImage({
      current,
      urls
    });
  },

  // 打开用户信息页面
  openUserInfo(e) {
    const userId = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/buluo/userInfo/userInfo?id=${userId}`
    });
  },

  // 搜索功能
  search() {
  if (!this.data.searchKey || !this.data.searchKey.trim()) {
    wx.showToast({ title: '请输入搜索内容', icon: 'none' });
    return;
  }
  
  wx.showLoading({ title: '搜索中...' });
  
  const db = wx.cloud.database();
  const _ = db.command;
  
  db.collection('posts')
    .where(_.or([
      { content: db.RegExp({ regexp: this.data.searchKey, options: 'i' }) },
      { targetName: db.RegExp({ regexp: this.data.searchKey, options: 'i' }) },
      { phone: this.data.searchKey } // 精确匹配手机号
    ]))
    .get()
    .then(res => {
      console.log('搜索结果:', res.data);
      
      // 处理搜索结果，与loadPosts类似的逻辑
      const currentUser = getApp().globalData.userInfo;
      const formattedPosts = res.data.map(post => {
        // 转换日期格式
        let createdDate = new Date(post.createdAt);
        let formattedDate = `${createdDate.getFullYear()}-${(createdDate.getMonth()+1).toString().padStart(2, '0')}-${createdDate.getDate().toString().padStart(2, '0')} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;
        
        // 检查当前用户是否已点赞
        const praises = post.praises || [];
        const hasLiked = praises.some(p => p.id === currentUser.id);
        
        return {
          id: post._id,
          content: post.content,
          attachments: post.attachments || [],
          created_at: formattedDate,
          topic: post.targetName || '无',
          poster: {
            id: post.author,
            nickname: post.authorNickname || '匿名用户',
            avatar: post.authorAvatar || '/images/avatar.png' 
          },
          supertube: 0,
          comments: post.comments || [],
          praises: post.praises || [],
          follow: false,
          hasLiked: hasLiked, // 添加点赞状态标记
          can_delete: post.author === currentUser.id || currentUser.supertube === 1
        };
      });
      
      this.setData({ posts: formattedPosts });
    })
    .catch(err => {
      console.error('搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    })
    .finally(() => {
      wx.hideLoading();
    });
  },

  javascriptCopysearch() {
  if (!this.data.searchKey || !this.data.searchKey.trim()) {
    wx.showToast({ title: '请输入搜索内容', icon: 'none' });
    return;
  }
  
  wx.showLoading({ title: '搜索中...' });
  
  const db = wx.cloud.database();
  const _ = db.command;
  
  db.collection('posts')
    .where(_.or([
      { content: db.RegExp({ regexp: this.data.searchKey, options: 'i' }) },
      { targetName: db.RegExp({ regexp: this.data.searchKey, options: 'i' }) },
      { phone: this.data.searchKey } // 精确匹配手机号
    ]))
    .get()
    .then(res => {
      console.log('搜索结果:', res.data);
      
      // 处理搜索结果，与loadPosts类似的逻辑
      const formattedPosts = res.data.map(post => {
        // 转换日期格式
        let createdDate = new Date(post.createdAt);
        let formattedDate = `${createdDate.getFullYear()}-${(createdDate.getMonth()+1).toString().padStart(2, '0')}-${createdDate.getDate().toString().padStart(2, '0')} ${createdDate.getHours().toString().padStart(2, '0')}:${createdDate.getMinutes().toString().padStart(2, '0')}`;
        
        return {
          id: post._id,
          content: post.content,
          attachments: post.attachments || [],
          created_at: formattedDate,
          topic: post.targetName || '无',
          poster: {
            id: post.author,
            nickname: post.authorNickname || '匿名用户',
            avatar: post.authorAvatar || '/images/avatar.png' 
          },
          supertube: 0,
          comments: post.comments || [],
          praises: post.praises || [],
          follow: false,
          can_delete: post.author === getApp().globalData.userInfo.id || getApp().globalData.userInfo.supertube === 1
        };
      });
      
      this.setData({ posts: formattedPosts });
    })
    .catch(err => {
      console.error('搜索失败:', err);
      wx.showToast({ title: '搜索失败', icon: 'none' });
    })
    .finally(() => {
      wx.hideLoading();
    });
  },
  
  // 打开消息页面
  openMessage() {
    wx.navigateTo({
      url: '/pages/buluo/message/message'
    });
  },

  // 发布表白信息
  post: function () {
    wx.navigateTo({
      url: '/pages/buluo/post/post' // 确保路径正确
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    // 创建动画实例
    this.commentAnimation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadPosts(this.data.select); // 每次显示页面时刷新数据
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    // 这里可以实现页面隐藏时的逻辑
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 这里可以实现页面卸载时的逻辑
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作,刷新
   */
  onPullDownRefresh() {
    this.loadPosts(this.data.select); // 下拉刷新时重新加载数据
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 这里可以实现加载更多数据的逻辑
    // 例如分页加载更多帖子
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '表白墙',
      path: '/pages/buluo/index_2/index_2'
    };
  },

  
})