$('#btn-navleft').on('click', function () {
  //console.log('yes!')
  if(!$('.wrap-left').hasClass('active')){
    $('.wrap-right').stop().animate({marginRight:'-20%'},300).siblings('.wrap-left').stop().animate({marginLeft:'0'},400).addClass('active');
  }else{
    $('.wrap-left').stop().animate({marginLeft:'-20%'},400).removeClass('active').siblings('.wrap-right').stop().animate({marginRight:'0'},700);
    //$('.wrap-right').stop().animate({marginRight:'0'},4000);
  }

});