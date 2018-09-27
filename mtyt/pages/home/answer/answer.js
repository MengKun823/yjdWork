// pages/home/answer/answer.js
const app = getApp();
var util = require('../../../utils/util.js');
var Login = require('../../../utils/login.js');
var ans_url = app.globalData.hostName + "/v2/question_detail";
var quesAns_url = app.globalData.hostName + "/v2/question_answer";
var ansData;
var arrDay;
var year,month,day
var code = wx.getStorageSync("code");
Page({
  /**
   * 页面的初始数据
   */
  data: {
    optionsArr: [],
    optionState: {
      a: false,
      b: false,
      c: false,
      d: false
    },
    correctOption:{
      //0是无新添样式，1正确且选中，2选中且不正确，3正确且未选中
      a: 0,
      b: 0,
      c: 0,
      d: 0
    },
    ansData: {},
    returnHome: '返回首页',
    returnHomeImg: '../../../image/return_home.png',
    questionHearten: '一道题，一个知识点，每天进步多一点',
    pastIforNot: 0,
    questionType:'1',
    questionTypeTit: '单选题',
    submiteBtnState: true,
    showPosters: false,
    correctRate:''
  },
  /**
   * 事件处理函数
   */
  //保存图片事件
  saveImg: function () {
    var that = this;
    wx.showToast({
      title: '保存中...',
      icon: "loading",
      duration: 2000
    })
    wx.getImageInfo({
      src: that.data.shareUrl,
      success: function (ret) {
        var path = ret.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success(result) {
            wx.showToast({
              title: '已存，可分享',
              icon: "success",
              duration: 3000
            });
            that.setData({
              showPosters: false
            })
          },
          fail:function () {
            wx.getSetting({
              success: (res) => {
                if (res.authSetting["scope.writePhotosAlbum"] == false) {
                  wx.showModal({
                    title: '温馨提示',
                    content: '检测到授权未成功，请前往开启授权，以保证功能的正常使用',
                    showCancel: false,
                    confirmText: "开启授权",
                    success: resBtn => {
                      wx.openSetting({
                        success: (resT) => {
                          if (resT.authSetting["scope.writePhotosAlbum"] == true){
                            wx.showToast({
                              title: '授权成功',
                              icon: "success",
                              duration: 1500
                            })
                          }
                        }
                      })
                    }
                  })
                }
              }
            })
          }
        })
      },
      fail: function(){
        wx.showToast({
          title: '未获取到图片信息',
          duration: 1500
        })
      }
    })
  },
  answerSub: function (e) {
    let formId = e.detail.formId;
    Login.getFormId(formId);
  },
  rHome: function () {
    wx.switchTab({
      url: '../../home/home',
    })
  },
  hiddenPosters:function () {
    this.setData({
      showPosters: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var userId = wx.getStorageSync("user").id;
    if(userId != ""){
      this.getdata();
    }
    this.setData({
      userId: userId
    });
  },
  btnShare: function () {
    var that = this;
    var share_url = app.globalData.hostName + "/v2/question_share_image?day=" + that.data.ansData.show_day + "&id=" + that.data.userId + "&width=598&height=838&.jpeg";
    wx.showToast({
      title: '正在生成...',
      icon: "loading"
    });
    that.setData({
      showPosters: true,
      shareUrl: share_url
    });
  },

  //添加提交数据事件
  btnQuestion: function(){
    var that = this;
    var questionId = that.data.ansData.question_id.toString();
    // console.log(wx.getStorageSync("token"));
    var days = that.data.ansData.show_day;
    // console.log(questionId)
    wx.request({
      url: quesAns_url,
      method:"POST",
      header:{
        'content-type': 'application/json',
        'X-Token': wx.getStorageSync("token")
      },
      data: {
        question_id: questionId,
        options: that.data.optionsArr
      },
      success: res => {
        wx.reLaunch({
          url: '../answer/answer?days=' + days,
        })
      }
    });
  },


  //添加选项点击事件函数
  optionSelect: function (e) {
    let param = {};
    let questionType = this.data.questionType;
    if (questionType == '1') {
      this.data.optionsArr = []
      param = {
        a: false,
        b: false,
        c: false,
        d: false
      };
      this.data.optionsArr.push(e.currentTarget.id)
      param[e.currentTarget.id] = true
      this.setData({
        submiteBtnState: false
      })
    } else if (questionType == '2') {
      param = this.data.optionState
      let flag = this.data.optionsArr.indexOf(e.currentTarget.id)
      if (flag == -1) {
        this.data.optionsArr.push(e.currentTarget.id)
        param[e.currentTarget.id] = true
      } else {
        this.data.optionsArr.splice(flag, 1)
        param[e.currentTarget.id] = false
      }
      if (this.data.optionsArr.length >= 2) {
        this.setData({
          submiteBtnState: false
        })
      } else {
        this.setData({
          submiteBtnState: true
        })
      }
    }
    this.setData({
      optionState: param
    })
  },
  //定义获取数据函数
  getdata: function(){
    var that = this;
    Login.Login(ans_url, res => {
        ansData = res.data.data;
        var days = ansData.show_day;
        arrDay = days.split("-");
        year = arrDay[0];
        month = arrDay[1];
        day = arrDay[2];
          // ansData.question_content.type = 2
        let questionTypeTit = "单选题"
        if (ansData.question_content.type == 2) {
          questionTypeTit = '多选题'
        }

          // console.log(ansData);
        var oArr = ["a","b","c","d"];
        var uArr = ansData.user_options;
        var cArr = ansData.question_content.question.correctOption;
        let n = 0;

        for(let i of oArr){
          //在用户，在正确
          if( (uArr.indexOf(i)!=-1) && (cArr.indexOf(i)!=-1)){
            that.data.correctOption[i] = 1;
            // console.log(i);
          } else if ((uArr.indexOf(i) != -1) && (cArr.indexOf(i) == -1)){
            //在用户，不在正确
            //设置红色块
            that.data.correctOption[i] = 2;
          } else if ((uArr.indexOf(i) == -1) && (cArr.indexOf(i) != -1)){
            //不在用户，在正确
            that.data.correctOption[i] = 3;
          } else {
            //不在用户，不在正确
            that.data.correctOption[i] = 0;
          }
          n++;
        }
        //是否完成
        let hasDone = ansData.has_done;
        //正确答案
        // ansData.question_content.question.correctOption
        let questionTure = ansData.question_content.question.correctOption.join("").toUpperCase();
            // console.log(ansData.easy_error_option);
        let fallibility = ansData.easy_error_option.toUpperCase();
        //生成海报
        that.setData({
          ansData: res.data.data,
          day: day,
          month: month,
          year: year,
          answerTopBg: ansData.picture_url,
          questionText: ansData.title,
          context: ansData.question_content.question.context,
          A: ansData.question_content.question.a,
          B: ansData.question_content.question.b,
          C: ansData.question_content.question.c,
          D: ansData.question_content.question.d,
          hasDone: hasDone,
          questionType: ansData.question_content.type,
          questionTypeTit: questionTypeTit,
          questionTure: questionTure,//正确答案
          explanation: ansData.question_content.question.explanation,
          correctRate: ansData.correct_rate,
          fallibility: fallibility,//易错项
          question_id: ansData.question_id,
          correctOption: that.data.correctOption
        });
        // console.log(this.data)
    }, 'GET', {
         day: that.options.days
       },{
          'content-type': 'application/json',
          'X-Token': wx.getStorageSync("token")
          })
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
    // console.log("监听隐藏")
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
        if (res.errMsg == "shareAppMessage:fail cancel"){
          wx.showToast({
            title: '取消转发',
            image: '../../../image/erro.svg',
            duration: 2000
          })
        }else{
          wx.showToast({
            title: '转发失败',
            image: '../../../image/erro.svg',
            duration: 2000
          })
        }
      }
    }
  }
})