$(function () {
  const $account = document.querySelector(".user-account");
  const $body = document.querySelector("body");
  const $landing = $(".landing");
  const $goup = $(".gotop");
  const $tab = $(".tab-item");
  const $collapse = $('.collapse .collapse-btn')
  const $eye = $(".i-eye");
  const $time = $(".time");
  const $datetime = $(".booktime");
  const $seatSelect = $(".seat");

  //偵測是否為手機裝置
  function isMobileDevice() {
    const mobileDevice = ['Android', 'webOS', 'iPhone', 'iPad', 'BlackBerry', 'Windows Phone']
    let isMobileDevice = mobileDevice.some(e => navigator.userAgent.match(e))
    return isMobileDevice
  }
  //偵測螢幕寬度
  function isMobileWidth() {
    const MobileWidth = window.matchMedia("(max-width: 992px)").matches
    return MobileWidth
  }
  // landing animation delay
  function delay() {
    return new Promise(function (resolve, reject) {
      setTimeout(resolve, 2600)
    })
  }
  function mobileLandingAnimation() {
    $body.classList.remove('no-scroll')
    $('.welcome').css('display', 'none')
    delay().then(function () { $landing.fadeOut(1000); })
  }
  function pcLandingWheelAnimation() {
    $landing.on("wheel", function () {
      $landing.fadeOut(1000).promise().then(function () {
        $body.classList.remove('no-scroll')
      })
    });
  }

  // ladnding page animation
  if ($landing.length === 1) {
    $body.classList.add('no-scroll') //禁止在背景下滑動
    if (!isMobileDevice()) {
      if (isMobileWidth()) {
        mobileLandingAnimation()
      } else {
        pcLandingWheelAnimation()
      }
    }
    if (isMobileDevice()) {
      mobileLandingAnimation()
    }
  }

  // account hover效果
  $account.addEventListener("mouseenter", () => {
    $account.classList.add("-active");
    $account.classList.remove("-leave");
  });
  $account.addEventListener("mouseleave", () => {
    $account.classList.remove("-active");
    $account.classList.add("-leave");
  });

  // 顯示gototop btn
  $(window).on("scroll", function () {
    let $scrollHeight = 300;
    let $windowTop = $(window).scrollTop()
    if ($windowTop > $scrollHeight) {
      $goup.addClass("show");
    } else {
      $goup.removeClass("show");
    }
  });
  // go top
  $goup.on("click", function () {
    $("html,body").animate(
      {
        scrollTop: 0,
      },
      500
    );
  });

  // 分頁切換
  $tab.on("click", function (e) {
    let $this = $(this)
    $this.addClass("active");
    $this.siblings().removeClass("active");
    $(`.tab-content[data-id='${e.target.id}']`).siblings().addClass("hide");
    $(`.tab-content[data-id='${e.target.id}']`).removeClass("hide");
  });

  // show or hide PWD
  $eye.on("click", function (e) {
    let checkEyeOn = e.target.classList.contains('isText')
    if (checkEyeOn) {
      e.target.classList.remove("isText");
      $(this).next().attr("type", "password");
    }
    if (!checkEyeOn) {
      e.target.classList.add("isText");
      $(this).next().attr("type", "text");
    }
  });

  //訂票查詢訂單開啟/收起效果
   /*
  $collapse.on("click", function () {
      let $this = $(this)
      console.log($this);
      let $parentDiv = $this.closest('.item')
      console.log.log($parentDiv);
    $parentDiv.next().slideToggle()
    $this.siblings().removeClass("hide");
    $this.addClass("hide");
  })
  */
  // 選取時刻表效果
  $datetime.on("click", function () {
    let $this = $(this)
    $this.siblings().removeClass("active");
    $this.addClass("active");
  });

  // 座位表選取效果
  $seatSelect.on("click", function (e) {
    let $this = $(this)
    let $parentDiv = $this.parent()
    if ($parentDiv.is('.disable') || $parentDiv.is('.soldout')) {
      return;
    } else {
      $parentDiv.toggleClass("booked");
    }
  });
});
