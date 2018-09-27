// 'use strict';
const app = getApp();
let Login = require('../../utils/login.js');
let choose_year = null,
    choose_month = null;
const conf = {
  data: {
    hasEmptyGrid: false,
    showPicker: false,
    showMask: true
  },
  onLoad() {
    var that = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"] == false) {
          wx.showModal({
            title: '温馨提示',
            content: '检测到授权未成功，请前往开启授权，以保证功能的正常使用',
            showCancel: false,
            confirmText: "开启授权",
            success: resBtn => {
              wx.openSetting({
                success: (resT) => {
                  if (resT.authSetting["scope.userInfo"] == true) {
                    that.setData({
                      showMask: false
                    })
                  }
                }
              })
            }
          })
        } else {
          that.setData({
            showMask: false
          })
        }
      }
    })
  },
  onShow: function(){
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    const cer_day = date.getDate();
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    let mine_dot = wx.getStorageSync("mine_dot");
    this.setData({
      thisYear: cur_year,
      thisMonth: cur_month,
      thisDay: cer_day,
      cur_year,
      cur_month,
      weeks_ch,
      mine_dot: mine_dot
    })
    this.calculateEmptyGrids(cur_year, cur_month);
    this.calculateDays(cur_year, cur_month);

    this.getQuestionStat()
    this.choseIsThisYearMonth()
  },
  showMask: function () {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting["scope.userInfo"] == false) {
          wx.showModal({
            title: '温馨提示',
            content: '检测到授权未成功，请前往开启授权，以保证功能的正常使用',
            showCancel: false,
            confirmText: "开启授权",
            success: resBtn => {
              wx.openSetting({
                success: (resT) => {
                  if (resT.authSetting["scope.userInfo"] == true) {
                    that.setData({
                      showMask: false
                    });

                  }
                }
              })
            }
          })
        } else {
          that.setData({
            showMask: false
          })
        }
      }
    })
  },
  getThisMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
  },
  getFirstDayOfWeek(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },
  calculateEmptyGrids(year, month) {
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let empytGrids = [];
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        empytGrids.push(i);
      }
      this.setData({
        hasEmptyGrid: true,
        empytGrids
      });
    } else {
      this.setData({
        hasEmptyGrid: false,
        empytGrids: []
      });
    }
  },
  calculateDays(year, month) {
    let days = [];
    const thisMonthDays = this.getThisMonthDays(year, month);
    for (let i = 1; i <= thisMonthDays; i++) {
      days.push({
        day: i,
        isToday: false,
        noAnswer: false,
        answered: false,
        showShare: false
      });
    }
    this.setData({
      days
    });
  },
  handleCalendar(e) {
    const handle = e.currentTarget.dataset.handle;
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      });

    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }

      this.calculateDays(newYear, newMonth);
      this.calculateEmptyGrids(newYear, newMonth);

      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      });
    }
    this.getQuestionStat();
    this.choseIsThisYearMonth();

  },
  chooseYearAndMonth() {
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    let picker_year = [],
      picker_month = [];
    for (let i = 1900; i <= 2100; i++) {
      picker_year.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      picker_month.push(i);
    }
    const idx_year = picker_year.indexOf(cur_year);
    const idx_month = picker_month.indexOf(cur_month);
    this.setData({
      picker_value: [idx_year, idx_month],
      picker_year,
      picker_month,
      showPicker: true,
    });
  },
  pickerChange(e) {
    const val = e.detail.value;
    choose_year = this.data.picker_year[val[0]];
    choose_month = this.data.picker_month[val[1]];
  },
  tapPickerBtn(e) {
    const type = e.currentTarget.dataset.type;
    const o = {
      showPicker: false,
    };
    if (type === 'confirm') {
      o.cur_year = choose_year;
      o.cur_month = choose_month;
      this.calculateEmptyGrids(choose_year, choose_month);
      this.calculateDays(choose_year, choose_month);
    }

    this.setData(o);
    this.getQuestionStat();
    this.choseIsThisYearMonth()
  },
  //点击设置跳转设置页面
  btnRemind: function() {
    wx.navigateTo({
      url: './remind/remind',
    })
    wx.setStorageSync("mine_dot", 1);
  },
  AnswerTap:function(e){
    let formId = e.detail.formId;
    Login.getFormId(formId);
  },
  //点击已答题或者忘记答题跳转
  bindAnswerTap: function (e) {
    const year = this.data.cur_year;
    const month = this.data.cur_month;
    let day = e.currentTarget.dataset.days;
    if (day > 0 && day < 10) {
      day = '0' + day;
    }
    var dayTop = year + '-' + month + '-' + day;
    wx.navigateTo({ 
      url: '../home/answer/answer?days=' + dayTop,
    })
  }, 
  //获取服务器数据
  getQuestionStat: function () {
    let questionStatData;
    let that = this;
    let startDay = that.data.cur_year + "-" + that.data.cur_month + "-" + "01";
    let endDay
    if (that.data.cur_year == that.data.thisYear && that.data.cur_month == that.data.thisMonth){
      endDay = that.data.cur_year + "-" + that.data.cur_month + "-" + that.data.thisDay;
    } else if (that.data.cur_year < that.data.thisYear){
      endDay = that.data.cur_year + "-" + that.data.cur_month + "-" + that.data.days.length;
    }
    // console.log(that.data);
    // console.log(endDay);
    wx.request({
      url: app.globalData.hostName + "/v2/user",
      method:"GET",
      header: {
        'content-type': 'application/json',
        'X-Token': wx.getStorageSync("token")
      },
      data:{
        start_day: startDay,
        end_day: endDay
      },
      success: res=>{
        questionStatData = res.data.data.stats;
        this.setData({
          questionStat: questionStatData
        })
        // console.log(that.data);

        that.noAnswerDay(endDay);
        let answeredDays = [];
        for (let item of questionStatData) {
          answeredDays.push(parseInt(item.show_day.split('-')[2]))
        }
        that.answeredDay(answeredDays)
        that.setData({
          total: res.data.data.total,
          questionStat: questionStatData
        })
      }
    })
  },
  // 判断所选日期是否为今天
  choseIsThisYearMonth () {
    const todayIndex = this.data.thisDay - 1;
    const days = this.data.days;
    if (this.data.cur_year == this.data.thisYear && this.data.cur_month == this.data.thisMonth) {
      days[todayIndex].isToday = true;
      days[todayIndex].showShare = true;
      this.setData({
        days
      });
    } else {
      days[todayIndex].isToday = false;
      this.setData({
        days
      });
    }
  },
  // 没有作答
  noAnswerDay (endDay) {
    const days = this.data.days;
    if (this.data.thisYear < this.data.cur_year){
      //显示的未来日历,所有灰色
    } else if (this.data.thisYear == this.data.cur_year){
      //当前年份相等
      if (this.data.thisMonth < this.data.cur_month){
        //同年大于当前月份
        // console.log("未来日期，什么都不显示");
      } else if (this.data.thisMonth == this.data.cur_month){
        //同年等于当前月份
        if (this.data.cur_year > 2017){
        // 当前年与显示年份相同时，且显示年份大于2017，则显示当月已经到达天数；
          for (let i = 0; i < this.data.thisDay; i++) {
            days[i].noAnswer = true;
            days[i].showShare = true;
          }
        }
      } else{
        // 同年小于当前月份
        if (this.data.cur_year > 2017){
          // 当前年与显示年份相同时，且显示年份大于2017小于当前月份，则显示所在月份全部数据；
          for (let i = 0; i < this.data.days.length; i++) {
            days[i].noAnswer = true;
            days[i].showShare = true;
          }
        }
      }
    } else if (this.data.thisYear > this.data.cur_year) {
      // 当前年份大于显示年份
      if (this.data.cur_year == 2017 && this.data.cur_month == 12) {
        // 当所显示年份为2017年且月份为十二月时显示的天数
        for (let i = 21; i < this.data.days.length; i++) {
          days[i].noAnswer = true;
          days[i].showShare = true;
        }
      }else if (this.data.cur_year > 2017){
        // 当当前年份大于显示年份，且显示年份大于2017年时，则当前最少为2019年，则18年全年显示所有数据
        for (let i = 0; i < this.data.days.length; i++) {
          days[i].noAnswer = true;
          days[i].showShare = true;
        }
      }
    }
    // console.log(days);
    this.setData({
      days
    });
  },
  // 已作答
  answeredDay(daysArr) {
    // console.log(daysArr);
    const days = this.data.days;
    if (this.data.thisYear < this.data.cur_year) {
      //显示的未来日历,所有灰色
    } else {
      for (let item of daysArr) {
      days[item-1].answered = true;
      days[item-1].showShare = true;
      }
      this.setData({
        days
      });
    }
  },
  //转发分享
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

};

Page(conf);