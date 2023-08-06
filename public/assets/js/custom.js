function blockUI(element = "") {
  if (element != "") {
    $(element).block({
      message: '<img src="/assets/img/eee.gif" width=80 height=80>',
    });
  } else {
    $.fn.center = function () {
      this.css("position", "absolute");
      this.css(
        "top",
        ($(window).height() - this.height()) / 2 + $(window).scrollTop() + "px"
      );
      this.css(
        "left",
        ($(window).width() - this.width()) / 2 + $(window).scrollLeft() + "px"
      );
      return this;
    };
    $.blockUI({
      css: {
        backgroundColor: "transparent",
        border: "none",
      },
      message: '<img src="/assets/img/eee.gif" height=80 width=80>',
      baseZ: 1500,
      overlayCSS: {
        backgroundColor: "#FFFFFF",
        opacity: 0.9,
        cursor: "wait",
      },
    });
    $(".blockUI.blockMsg").center();
  }
}

function unblockUI(element = "") {
  if (element != "") {
    $(element).unblock();
  } else {
    $.unblockUI();
  }
}
