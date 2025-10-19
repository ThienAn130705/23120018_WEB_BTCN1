$(document).ready(function () {
  // Khi nhấn vào button có data-menu
  $("button[data-menu]").on("click", function () {
    const menu = $(this).data("menu") // lấy tên menu

    // Bỏ class active button trong nav và footer
    $("nav button, footer button").removeClass("active")

    // Thêm class active cho button được chọn có cùng data-menu trong nav và footer
    $(`button[data-menu="${menu}"]`).addClass("active")
  })
})
