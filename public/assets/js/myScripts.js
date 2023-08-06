$(".noSpace").on("keydown", function (e) {
  if (e.which === 32 && e.target.selectionStart === 0) {
    return false;
  }
});

$(".noSpace").on("input", function () {
  $(this).val($(this).val().replace(/^\s+/g, ""));
});

function verification(id, element) {
  $.ajax({
    type: "POST",
    url: "/admin/verification",
    data: { id: id, value: element.value },
    beforeSend: function (msg) {
      blockUI("#table_get");
    },
    success: function (result) {
      if (result) {
        unblockUI("#table_get");
      }
    },
  });
}

function replay(email) {
  $("#sendFeedback").modal({
    show: true,
  });
  $("#sendMail").val(email);
}

$("#feedback_form").submit(function (e) {
  e.preventDefault();
  // alert(1);
  var email = $("#sendMail").val();
  console.log("🚀 ~ file: myScripts.js:72 ~ email:", email);
  let data = JSON.stringify(jQuery(this).serializeArray());
  console.log("🚀 ~ file: myScripts.js:73 ~ data:", data);
  $.ajax({
    type: "POST",
    url: "/admin/sendFeed",
    data: { data: data },
  });
});

// function sendFeedback(e) {
//   // alert(1);
//   var email = $("#sendMail").val();
//   console.log("🚀 ~ file: myScripts.js:72 ~ email:", email);
//   let data = JSON.stringify(jQuery(this).serializeArray());
//   console.log("🚀 ~ file: myScripts.js:73 ~ data:", data);
//   $.ajax({
//     type: "POST",
//     url: "/admin/sendFeed",
//     data: { data: data },
//     success: function (response) {
//       // This code will execute when the AJAX request is successful
//       console.log("Success!", response);
      
//       $("#sendFeedback").modal({
//         show: false,
//       });
//     },
//     error: function (xhr, status, error) {
//       // This code will execute if there's an error in the AJAX request
//       console.error("Error:", error);
//     },
//   });

//   // var data = $("#sendFeedback");
//   // console.log("🚀 ~ file: myScripts.js:69 ~ sendFeedback ~ data:", data);
//   // $.ajax({
//   //   type: "POST",
//   //   url: "/admin/viewQuizCat",
//   //   data: { id: id },
//   //   beforeSend: function (msg) {
//   //     blockUI("#table_get");
//   //   },
//   //   success: function (result) {
//   //     if (result) {
//   //       $("#View_category_modal").modal({
//   //         show: true,
//   //       });
//   //       $("#viewName").val(result.name);
//   //       $("#viewblah").attr("src", `/images/userImg/${result.image}`);
//   //       unblockUI("#table_get");
//   //     }
//   //   },
//   // });
// }

function sendFeedback(e) {
  e.preventDefault();
  var email = $("#sendMail").val();
  let data = JSON.stringify($("#feedback_form").serializeArray());

  $.ajax({
    type: "POST",
    url: "/admin/sendFeed",
    data: { data: data },
    success: function (response) {
      // This code will execute when the AJAX request is successful
      console.log("Success!", response);
      window.location.reload(true);
      // Close the modal (assuming the modal has an id of "sendFeedback")
      $("#sendFeedback").modal("hide");
    },
    error: function (xhr, status, error) {
      // This code will execute if there's an error in the AJAX request
      console.error("Error:", error);
    },
  });
}


function deleteFeed(id) {
  swal({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    buttons: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    buttons: ["Cancel", "Yes Delete it!"],
  }).then((result) => {
    if (result == true && id != "") {
      $.ajax({
        url: "/admin/deleteFeed",
        type: "post",
        data: { id: id },
        beforeSend: function (msg) {
          blockUI("#table_get");
        },
        success: function (result) {
          unblockUI("#table_get");
          console.log(result);
          if (result) {
            unblockUI("#table_get");
            window.location.reload(true);
          }
        },
      });
    }
  });
}

// function status(elem) {
//   if (elem.checked == true) {
//     var status = 1;
//   } else {
//     status = 0;
//   }

//   $.ajax({
//     type: "POST",
//     url: "/admin/status",
//     data: { status: status, id: elem.id },
//     beforeSend: function (msg) {
//       blockUI("#table_get");
//     },
//     success: function (result) {
//       unblockUI("#table_get");
//     },
//   });
// }
function status(elem) {
  var currentStatus = elem.checked ? 1 : 0;
  var statusText = currentStatus === 1 ? "activate" : "deactivate";
console.log("elem.checked",elem.checked)
console.log("currentStatus",currentStatus)
  swal({
    title: "Are you sure?",
    text: `Do you want to ${statusText} the status?`,
    icon: "warning",
    buttons: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    buttons: ["No", "Yes"],
  }).then((result) => {
    if (result) {
      // If user pressed "Yes"
      $.ajax({
        type: "POST",
        url: "/admin/status",
        data: { status: currentStatus, id: elem.id },
        beforeSend: function (msg) {
          blockUI("#table_get");
        },
        success: function (result) {
          unblockUI("#table_get");
          // Update the switch icon and status after successful ajax call
          elem.checked = !elem.checked;
          window.location.reload(true);
        },
        error: function (error) {
          unblockUI("#table_get");
          // Handle error if any
          console.error("Error while updating status:", error);
        },
      });
    } else {
      // If user pressed "Cancel," revert the switch icon back to its original state
      elem.checked = !elem.checked;
    }
  });
}


function categorystatus(elem) {
  if (elem.checked == true) {
    var status = 1;
  } else {
    status = 0;
  }

  $.ajax({
    type: "POST",
    url: "/admin/categoryStatus",
    data: { status: status, id: elem.id },
    beforeSend: function (msg) {
      blockUI("#categoryTable");
    },
    success: function (result) {
      unblockUI("#categoryTable");
      iziToast.success({
        title: "OK",
        position: "topRight",
        message: "Successfully update record!",
      });
    },
  });
}
function subscriptionstatus(elem) {
  if (elem.checked == true) {
    var status = 1;
  } else {
    status = 0;
  }

  $.ajax({
    type: "POST",
    url: "/admin/subscriptionStatus",
    data: { status: status, id: elem.id },
    beforeSend: function (msg) {
      blockUI("#planTable");
    },
    success: function (result) {
      unblockUI("#planTable");
      iziToast.success({
        title: "OK",
        position: "topRight",
        message: "Successfully update record!",
      });
    },
  });
}
function roomcategorystatus(elem) {
  if (elem.checked == true) {
    var status = 1;
  } else {
    status = 0;
  }

  $.ajax({
    type: "POST",
    url: "/admin/room_category_status",
    data: { status: status, id: elem.id },
    beforeSend: function (msg) {
      blockUI("#table_get");
    },
    success: function (result) {
      unblockUI("#table_get");
      iziToast.success({
        title: "OK",
        position: "topRight",
        message: "Successfully update record!",
      });
    },
  });
}
function roomSubcategorystatus(elem) {
  if (elem.checked == true) {
    var status = 1;
  } else {
    status = 0;
  }

  $.ajax({
    type: "POST",
    url: "/admin/room_subcategory_status",
    data: { status: status, id: elem.id },
    beforeSend: function (msg) {
      blockUI("#table_get");
    },
    success: function (result) {
      unblockUI("#table_get");
      iziToast.success({
        title: "OK",
        position: "topRight",
        message: "Successfully update record!",
      });
    },
  });
}
$(document).ready(function () {
  $("#categoryTable").DataTable();
});

$(document).ready(function () {
  $("#table_get").DataTable();
});

$(document).ready(function () {
  $("#subCategoryTable").DataTable();
});

$(document).ready(function () {
  $("#bookingsTable").DataTable();
});

$(document).ready(function () {
  $("#invoiceTable").DataTable();
});

$(document).ready(function () {
  $("#doctorTable").DataTable();
});

$(document).ready(function () {
  $("#table_User_get").DataTable();
});

$(document).ready(function () {
  $("#rating_table").DataTable();
});

{
  /* $(document).ready(function () {
    $(".deleteuser").on("click", function () {
      let table = $(this).attr("table_get");
      let id = $(this).data("id");
      // alert(id);

      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        buttons: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        buttons: ["Cancel", "Yes Delete it!"],
      }).then((result) => {
        if (result == true && id != "") {
          $.ajax({
            url: "/admin/deleteuser/" + id,
            type: "get",
            data: {},
            success: function (response) {
              if (response.res == 1) {
                window.location.reload(true);
              }
            },
            error: function (xhr, ajaxOptions, thrownError) {
              swal("Error deleting!", "Please try again", "error");
            },
          });
        }
      });
    });
  }); */

  function deletCategory(id) {
    // console.log(id);
    // alert(id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      buttons: ["Cancel", "Yes Delete it!"],
    }).then((result) => {
      if (result == true && id != "") {
        $.ajax({
          url: "/admin/delete_category",
          type: "post",
          data: { id: id },
          beforeSend: function (msg) {
            blockUI("#categoryTable");
          },
          success: function (result) {
            unblockUI("#categoryTable");
            console.log(result);
            if (result) {
              unblockUI("#categoryTable");
              window.location.reload(true);
            }
          },
        });
      }
    });
  }
  function deletePlan(id) {
    // console.log(id);
    // alert(id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      buttons: ["Cancel", "Yes Delete it!"],
    }).then((result) => {
      if (result == true && id != "") {
        $.ajax({
          url: "/admin/delete_plan",
          type: "post",
          data: { id: id },
          beforeSend: function (msg) {
            blockUI("#planTable");
          },
          success: function (result) {
            unblockUI("#planTable");
            console.log(result);
            if (result) {
              unblockUI("#planTable");
              window.location.reload(true);
            }
          },
        });
      }
    });
  }

  function deleteRoomCat(id) {
    // console.log(id);
    // alert(id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      buttons: ["Cancel", "Yes Delete it!"],
    }).then((result) => {
      if (result == true && id != "") {
        $.ajax({
          url: "/admin/deleteRoomCat",
          type: "post",
          data: { id: id },
          beforeSend: function (msg) {
            blockUI("#planTable");
          },
          success: function (result) {
            unblockUI("#planTable");
            console.log(result);
            if (result) {
              unblockUI("#planTable");
              window.location.reload(true);
            }
          },
        });
      }
    });
  }
  function deleteRoomSubCat(id) {
    // console.log(id);
    // alert(id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      buttons: ["Cancel", "Yes Delete it!"],
    }).then((result) => {
      if (result == true && id != "") {
        $.ajax({
          url: "/admin/deleteRoomSubCat",
          type: "post",
          data: { id: id },
          beforeSend: function (msg) {
            blockUI("#planTable");
          },
          success: function (result) {
            unblockUI("#planTable");
            console.log(result);
            if (result) {
              unblockUI("#planTable");
              window.location.reload(true);
            }
          },
        });
      }
    });
  }
  function deleteVideo(id) {
    // console.log(id);
    // alert(id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      buttons: ["Cancel", "Yes Delete it!"],
    }).then((result) => {
      if (result == true && id != "") {
        $.ajax({
          url: "/admin/deleteVideo",
          type: "post",
          data: { id: id },
          beforeSend: function (msg) {
            blockUI("#planTable");
          },
          success: function (result) {
            unblockUI("#planTable");
            console.log(result);
            if (result) {
              unblockUI("#planTable");
              window.location.reload(true);
            }
          },
        });
      }
    });
  }
  function deleteTask(id) {
    // console.log(id);
    // alert(id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      buttons: ["Cancel", "Yes Delete it!"],
    }).then((result) => {
      if (result == true && id != "") {
        $.ajax({
          url: "/admin/delete_pre_task",
          type: "post",
          data: { id: id },
          beforeSend: function (msg) {
            blockUI("#table_get");
          },
          success: function (result) {
            unblockUI("#table_get");
            console.log(result);
            if (result) {
              unblockUI("#table_get");
              window.location.reload(true);
            }
          },
        });
      }
    });
  }
  function deleteUsersTask(id) {
    // console.log(id);
    // alert(id);
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      buttons: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      buttons: ["Cancel", "Yes Delete it!"],
    }).then((result) => {
      if (result == true && id != "") {
        $.ajax({
          url: "/admin/delete_pre_task",
          type: "post",
          data: { id: id },
          beforeSend: function (msg) {
            blockUI("#table_User_get");
          },
          success: function (result) {
            unblockUI("#table_User_get");
            console.log(result);
            if (result) {
              unblockUI("#table_User_get");
              window.location.reload(true);
            }
          },
        });
      }
    });
  }
  // $(document).ready(function () {
  //   $(".deleteCAtegory").on("click", function () {
  //     let table = $(this).attr("categoryTable");
  //     let id = $(this).data("id");
  //     alert(id);

  //     swal({
  //       title: "Are you sure?",
  //       text: "You won't be able to revert this!",
  //       icon: "warning",
  //       buttons: true,
  //       confirmButtonColor: "#3085d6",
  //       cancelButtonColor: "#d33",
  //       buttons: ["Cancel", "Yes Delete it!"],
  //     }).then((result) => {
  //       if (result == true && id != "") {
  //         $.ajax({
  //           url: "/admin/deleteuser/" + id,
  //           type: "get",
  //           data: {},
  //           success: function (response) {
  //             if (response.res == 1) {
  //               window.location.reload(true);
  //             }
  //           },
  //           error: function (xhr, ajaxOptions, thrownError) {
  //             swal("Error deleting!", "Please try again", "error");
  //           },
  //         });
  //       }
  //     });
  //   });
  // });
}

function subCategorystatus(elem) {
  // alert(elem );
  if (elem.checked == true) {
    var status = 1;
  } else {
    status = 0;
  }

  $.ajax({
    type: "POST",
    url: "/admin/subCategoryStatus",
    data: { status: status, id: elem.id },
    beforeSend: function (msg) {
      blockUI("#subCategoryTable");
    },
    success: function (result) {
      unblockUI("#subCategoryTable");
    },
  });
}

function deletSubCategory(id) {
  // console.log(id);
  // alert(id);
  swal({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    buttons: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    buttons: ["Cancel", "Yes Delete it!"],
  }).then((result) => {
    if (result == true && id != "") {
      $.ajax({
        url: "/admin/deleteSubCategory",
        type: "post",
        data: { id: id },
        beforeSend: function (msg) {
          blockUI("#subCategoryTable");
        },
        success: function (result) {
          unblockUI("#subCategoryTable");
          console.log(result);
          if (result) {
            unblockUI("#subCategoryTable");
            window.location.reload(true);
          }
        },
      });
    }
  });
}

function bookingStatus(id, element) {
  $.ajax({
    type: "POST",
    url: "/admin/bookingStatus",
    data: { id: id, value: element.value },
    beforeSend: function (msg) {
      blockUI("#bookingsTable");
    },
    success: function (result) {
      if (result) {
        unblockUI("#bookingsTable");
      }
    },
  });
}

function deleteBooking(id) {
  // console.log(id);
  // alert(id);
  swal({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    buttons: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    buttons: ["Cancel", "Yes Delete it!"],
  }).then((result) => {
    if (result == true && id != "") {
      $.ajax({
        url: "/admin/deleteBooking",
        type: "post",
        data: { id: id },
        beforeSend: function (msg) {
          blockUI("#categoryTable");
        },
        success: function (result) {
          unblockUI("#categoryTable");
          console.log(result);
          if (result) {
            unblockUI("#categoryTable");
            window.location.reload(true);
          }
        },
      });
    }
  });
}

// =============================change Doctor===========================
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}

//delete user-----
function deleteUser(id) {
  // console.log(id);
  // alert(id);
  swal({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    buttons: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    buttons: ["Cancel", "Yes Delete it!"],
  }).then((result) => {
    if (result == true && id != "") {
      $.ajax({
        url: "/admin/deleteUser",
        type: "post",
        data: { id: id },
        beforeSend: function (msg) {
          blockUI("#table_get");
        },
        success: function (result) {
          unblockUI("#table_get");
          console.log(result);
          if (result) {
            unblockUI("#table_get");
            window.location.reload(true);
          }
        },
      });
    }
  });
}
// =============================change Doctor===========================

