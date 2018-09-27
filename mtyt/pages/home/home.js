//index.js
var Login = require('../../utils/login.js');
//获取应用实例
const app = getApp()
var util = require('../../utils/util.js');
// console.log(app.globalData.hostName);
var home_url = app.globalData.hostName + "/v2/home";
var questionData;
var arrDay;
var year, month, day;
var ans_url = app.globalData.hostName + "/v2/question_detail";
var dayTop = {};
Page({
  data: {
    showMask: true
  },
  //事件处理函数
  showMask: function() {
    wx.getSetting({
      success: (res) => {
        console.log
        if (res.authSetting["scope.userInfo"] == false){
          wx.showModal({
            title: '温馨提示',
            content: '检测到授权未成功，请前往开启授权，以保证功能的正常使用',
            showCancel: false,
            confirmText: "开启授权",
            success: resBtn => {
              wx.openSetting({
                success: (resT) => {
                  if (resT.authSetting["scope.userInfo"] == true) {
                    Login.Login(home_url, (res, bool) => {
                      //  console.log("success");
                      questionData = res.data.data;
                      var days = questionData.top[0].show_day;
                      arrDay = days.split("-");
                      year = arrDay[0];
                      month = arrDay[1];
                      day = arrDay[2];
                      console.log(bool)
                      if (!bool) {
                        this.setData({
                          showMask: false
                        });
                      }
                      this.setData({
                        year: year,
                        month: month + ' ' + '月',
                        day: day,
                        days: days,
                        questionText: questionData.top[0].title,
                        questionBg: questionData.top[0].picture_url,
                        questionNum: questionData.top[0].user_answer_num + '人已答题',
                        questionToAnswer: '去答题' + ' ' + '>',
                        pastIforNot: questionData.top[0].has_done,
                        pastRecords: questionData.body
                      });
                    }, 'GET', {}, {
                      'content-type': 'application/json',
                      'X-Token': wx.getStorageSync("token")
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  bindAnswerTap: function() {
    var dayTop = this.data.days;
    // console.log(dayTop)
    wx.navigateTo({
      url: './answer/answer?days=' + dayTop,
    })
  }, 
  bindAnswerTap2: function (item) {
    var dayTop2 = item.currentTarget.dataset.days;
    // console.log(dayTop2)
    wx.navigateTo({
      url: './answer/answer?days=' + dayTop2,
    })
  }, 
  bindMineTap: function () {
    wx.reLaunch({
      url: '../mine/mine',
    })
  },
  homeSubmit:function(e){
    let formId = e.detail.formId;
    Login.getFormId(formId);
  },
  onLoad: function () {
    // this.getDataHome();
  },
  onShow: function() {
    Login.Login(home_url, (res, bool) => {
      //  console.log("success");
      questionData = res.data.data;
      var days = questionData.top[0].show_day;
      arrDay = days.split("-");
      year = arrDay[0];
      month = arrDay[1];
      day = arrDay[2];
      // console.log(bool)
      if (!bool) {
        this.setData({
          showMask: false
        });
      }
      this.setData({
        year: year,
        month: month + ' ' + '月',
        day: day,
        days: days,
        questionText: questionData.top[0].title,
        questionBg: questionData.top[0].picture_url,
        questionNum: questionData.top[0].user_answer_num + '人已答题',
        questionToAnswer: '去答题',
        pastIforNot: questionData.top[0].has_done,
        pastRecords: questionData.body
      });
    }, 'GET', {}, {
        'content-type': 'application/json',
        'X-Token': wx.getStorageSync("token")
      })
  },
  //转发分享
  onShareAppMessage: function () {
    return {
      title: '每天一道题，搞定一个知识点',
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