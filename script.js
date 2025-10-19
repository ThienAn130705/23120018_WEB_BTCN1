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

// Xử lý chức năng mở rộng thu gọn nội dung tin tức
$(".summary_arrow").on("click", function (e) {
  e.stopPropagation() // Ngăn sự kiện lan lên cha
  const arrow = $(this) // Lấy phần mũi tên được nhấn
  const newsItem = arrow.closest(".news-item") // Lấy phần tin tức cha
  const content = newsItem.find("p") // Lấy phần nội dung tin tức

  // Mở rộng hoặc thu gọn nội dung với hiệu ứng trượt
  content.slideToggle(150, function () {
    const nowVisible = $(this).is(":visible") // Kiểm tra trạng thái nội dung
    arrow.text(nowVisible ? "⇩" : "▶") // Thay đổi biểu tượng mũi tên
  })
})
