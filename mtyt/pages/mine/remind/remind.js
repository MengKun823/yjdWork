// pages/mine/remind/remind.js
//设置获取提醒时间url
const app = getApp()
var notice_url = app.globalData.hostName + '/v2/notice';
Page({
  /**
   * 页面的初始数据
   */
  data: {
  },
  //选择时间按钮
  bindTimeChange: function (e) {
    let hour = e.detail.value;
    let min = parseInt(hour.substring(3, 5));
    hour = parseInt(hour.substring(0, 2));
    // console.log(hour+":"+min);
    this.setData({
      time: e.detail.value,
    });
    wx.request({
      url: notice_url,
      method: "POST",
      header: {
        'content-type': 'application/json',
        'X-Token': wx.getStorageSync("token")
      },
      data: {
        hour : hour,
        min : min
      },
      success: res=>{
        console.log("成功");
        console.log(res);
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRemindTime();
    // console.log(this);
  },
  //传输时间方法
  getRemindTime: function (method,dataReq) {
    var that = this;
    wx.request({
      url: notice_url,
      method: "GET",
      header: {
        'content-type': 'application/json',
        'X-Token': wx.getStorageSync("token")
      },
      data: {},
      success: res=>{
        // console.log(res.data);
        let hours = res.data.data.hour;
        let mins = res.data.data.min
        if ("0" <= hours && hours < "10") {
          hours = "0"+hours;
        };
        if ("0" <= mins && mins < "10"){
          mins = "0" + mins;
        };
        that.setData({
          time: hours + ":" + mins
        })
      }
    })
  },
  //定义formSubmit事件
  formSubmitBtn:function (e) {
    console.log(e);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '每天一道题，搞定一个考点',
      path: '/pages/home/home',
      success: function (res) {
        wx.showToast({
          title: '转发成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        // 转发失败
        if (res.errMsg == "shareAppMessage:fail cancel") {
          wx.showToast({
            title: '取消转发',
            image: '../../image/erro.svg',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '转发失败',
            image: '../../image/erro.svg',
            duration: 2000
          })
        }
      }
    }
  }
})