// 在Page({})外部初始化数据库
const db = wx.cloud.database()
const commentsCollection = db.collection('comments')

Page({
  data: {
    topic: {
      id: 0,
      title: '探迹者：创新的伙伴',
      content: '',
      images: [
        'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/元旦祝福.png',
        'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/徒步.jpg',
        'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/探纪者.png'
      ],
      likes: 0,
      liked: false,
      comments: []
    },
    showCommentInput: false,
    newComment: '',
    isTextExpanded: false,
    isLoading: true
  },

  onLoad(options) {
    this.initializeTopic(options)
  },

  // 初始化话题数据
  initializeTopic(options) {
    const topicId = options.id || '1'
    const title = decodeURIComponent(options.title || '探迹者：创新的伙伴')
    const images = options.images 
      ? JSON.parse(options.images) 
      : [
        'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/元旦祝福.png',
        'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/徒步.jpg',
        'cloud://czyyuq668-3gx14c7f26524c39.637a-czyyuq668-3gx14c7f26524c39-1331362988/咨询/探纪者.png'
      ]

    this.setData({
      topic: {
        id: topicId,
        title,
        images,
        likes: 0,
        liked: false,
        comments: []
      },
      isLoading: true
    })

    // 加载评论
    this.loadComments(topicId)
  },

  // 点赞功能
  likeTopic() {
    const topic = this.data.topic;
    this.setData({
      topic: {
        ...topic,
        likes: topic.liked ? topic.likes - 1 : topic.likes + 1,
        liked: !topic.liked
      }
    });
  },

  // 显示评论输入框
  showCommentInput() {
    this.setData({
      showCommentInput: true
    });
  },

  // 处理评论输入
  handleCommentInput(e) {
    this.setData({
      newComment: e.detail.value
    });
  },

  // 提交评论（优化版）
  async submitComment() {
    const newComment = this.data.newComment.trim()
    if (!newComment) {
      wx.showToast({ title: '评论不能为空', icon: 'none' })
      return
    }

    try {
      // 获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于显示评论用户信息'
      })

      // 构造评论对象
      const comment = {
        topicId: this.data.topic.id,
        content: newComment,
        user: {
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        },
        createdAt: db.serverDate()
      }

      // 云数据库操作
      const { _id } = await commentsCollection.add({ data: comment })
      
      // 更新本地数据
      this.setData({
        'topic.comments': [{
          ...comment,
          _id,
          createdAt: this.formatDate(new Date())
        }, ...this.data.topic.comments],
        newComment: '',
        showCommentInput: false
      })

    } catch (error) {
      console.error('提交评论失败:', error)
      wx.showToast({ title: '评论失败，请重试', icon: 'none' })
    }
  },

  // 加载评论（增强版）
  async loadComments(topicId) {
    try {
      const res = await commentsCollection
        .where({ topicId })
        .orderBy('createdAt', 'desc')
        .get()

      const comments = res.data.map(comment => ({
        ...comment,
        createdAt: this.formatDate(comment.createdAt)
      }))

      this.setData({
        'topic.comments': comments,
        isLoading: false
      })
    } catch (error) {
      console.error('加载评论失败:', error)
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      this.setData({ isLoading: false })
    }
  },

  // 格式化日期
  formatDate(timestamp) {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  },

  // 切换文本展开/收起
  toggleTextExpand() {
    this.setData({
      isTextExpanded: !this.data.isTextExpanded
    });
  },

  // 删除评论
async deleteComment(e) {
  const commentId = e.currentTarget.dataset.commentId;
  
  try {
    // 弹窗确认
    const result = await wx.showModal({
      title: '提示',
      content: '确定要删除这条评论吗？',
      cancelText: '取消',
      confirmText: '删除'
    });

    // 用户确认删除
    if (result.confirm) {
      // 调用云函数删除评论（建议使用云函数确保安全）
      await wx.cloud.callFunction({
        name: 'deleteComment',
        data: {
          commentId: commentId
        }
      });

      // 更新本地评论列表
      const updatedComments = this.data.topic.comments.filter(
        comment => comment._id !== commentId
      );

      this.setData({
        'topic.comments': updatedComments
      });

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    }
  } catch (error) {
    console.error('删除评论失败:', error);
    wx.showToast({
      title: '删除失败',
      icon: 'none'
    });
  }
}
});