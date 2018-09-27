//app.js
var user
var code
App({
  onLaunch: function () {
  },
  globalData: {
    userInfo: null,
    showMask:true,
    hostName:"https://ma.shenlancity.com",
    tokenA: wx.getStorageSync("token")
  }
})