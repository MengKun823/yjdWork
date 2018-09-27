var app = getApp();
var API_URL = app.globalData.hostName + "/v2/check_login";
var loginTime=0
function Login(url, sucessCallback, method,data, header) {
  method = method || "GET";
  if (wx.getStorageSync("token") && wx.getStorageSync("user") && wx.getStorageSync("user").id) {
    ajax(url, sucessCallback, method,data, header);
  } else {
    //创建一个dialog
    wx.showToast({
      title: '正在加载...',
      icon: 'loading',
      duration: 3000
    });
    wx.login({
      success: res => {
      
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code != "") {
         var code = res.code;
          wx.setStorageSync("code", code);
          getToken(res.code, url, sucessCallback, method,data, header)
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)      
        }
      },
      fail: function (e) {

      }
    })
  }

}


function getToken(code, url, sucessCallback, method,data, header) {
  //请求服务器
  wx.request({
    url: API_URL,
    data: {
      code: code,
      homeMask: false
    },
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    header: {
      'content-type': 'application/json',
      // 'X-Token': wx.getStorageSync("token")
    }, // 设置请求的 header
    success: res => {
      if (res.data.code == 0) {
        wx.setStorageSync("token", res.data.data.token);
       
        
        wx.getUserInfo({//getUserInfo流程
          success: res2 => {//获取userinfo成功
            var encryptedData = res2.encryptedData;
            var iv = res2.iv;
            //请求自己的服务器
            wx.request({
              url: API_URL,
              method: "POST",
              header: {
                'content-type': 'application/json',
                'X-Token': wx.getStorageSync("token")
              },
              data: {
                token: wx.getStorageSync("token"),
                iv: iv,
                encryptedData: encryptedData
              },
              success: res3 => {
                wx.setStorageSync("user", res3.data.data);
                console.log(res3)
                if(res3.data.code==0){
                  if (res3.data.data.id) {
                    ajax(url, sucessCallback, method, data, {
                      'content-type': 'application/json',
                      'X-Token': res.data.data.token
                    });
                  }
                }else{
                  Login(url, sucessCallback, method, data, {
                    'content-type': 'application/json',
                    'X-Token': res.data.data.token
                  })
                }
                
              },
              fail: function () {
                // console.log("flase");
              }
            })
          },
          fail: function () {
            wx.showModal({
              title: '温馨提示',
              content: '未授权用户信息，使用某些功能可能需要授权',
              showCancel: false,
              confirmText: "我知道了",
              success: function (res) {
                if (url.indexOf("v2/home") > -1) {
                  ajax(url, sucessCallback, method, data,  header || {
                  'content-type': 'application/json',
                  'X-Token': wx.getStorageSync("token")
                },true);
                }
              }
            })

          },
        })
      }
      wx.hideToast();
    },
    fail: function () {
      // fail
      wx.hideToast();
    },
    complete: function () {
      // complete
    }
  })
}
function ajax(url, sucessCallback, method,data, header,bool) {

  method = method || "GET";
  data=data||{};

  // console.log(wx.getStorageSync("token"))
  sucessCallback=sucessCallback||function(){

  }
  // console.log(url, sucessCallback, method, data, header, bool)
  // console.log( sucessCallback)
  wx.request({
    url: url,
    method: method,
    header: header,
    data: data,
    success: res => {
      var codes = res.data.code;
      if ((codes == 0 && res.data.data.login!=0)||bool) {
        sucessCallback(res,bool)
      } else if (codes == -1 || !res.data.data.login){
        
       // if (loginTime++>2){
          wx.removeStorageSync("token");
          wx.removeStorageSync("user");
          wx.removeStorageSync("code");
        //}
        Login(url, sucessCallback, method, data, header)
        
      
        
      }else {
        console.log(res.message)
      }
    },
    fail:res=>{
      
    }
  })
}

//封装传formId
function getFormId (formId){
  wx.request({
    url: app.globalData.hostName + "/v2/form_id",
    method: "POST",
    header: {
      'content-type': 'application/json',
      'X-Token': wx.getStorageSync("token")
    },
    data: {
      form_id: formId
    },
    success: resSub => {
      console.log("formId传送成功");
    }
  })
}
module.exports ={
Login:Login,
ajax:ajax,
getFormId: getFormId
} ;