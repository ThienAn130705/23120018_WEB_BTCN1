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

let lastSwapY = 0 // lưu vị trí chuột (Y) tại lần hoán vị gần nhất
let lastDirection = null // lưu hướng di chuyển trước đó ("up" hoặc "down")
let draggingItem = null
let placeholder = $("<div class='placeholder'></div>")
let offsetY = 0

$(".move_arrow").on("mousedown", function (e) {
  e.stopPropagation()
  e.preventDefault()

  draggingItem = $(this).closest(".news-item")
  const rect = draggingItem[0].getBoundingClientRect()
  const parent = draggingItem.parent()

  offsetY = e.clientY - rect.top

  // tạo placeholder giữ chỗ
  placeholder.height(draggingItem.outerHeight(true))
  draggingItem.after(placeholder)

  lastSwapY = e.pageY // Cập nhật tại thời điểm bắt đầu drag
  lastDirection = null

  // set style cho phần tử đang kéo
  draggingItem
    .addClass("dragging")
    .css({
      position: "absolute",
      width: rect.width,
      left: rect.left - parent.offset().left,
      top: rect.top - parent.offset().top,
      zIndex: 1000,
      cursor: "ns-resize",
      pointerEvents: "none", // không hover vùng cũ
    })
    .appendTo(parent) // di chuyển ra ngoài luồng thật

  // di chuyển item theo chuột
  $(document).on("mousemove.drag", function (e) {
    draggingItem.css({ top: e.pageY - parent.offset().top - offsetY })

    // xác định hướng hiện tại
    const deltaY = e.pageY - lastSwapY
    const direction = deltaY > 0 ? "down" : "up"

    const prev = placeholder.prev(".news-item")
    const next = placeholder.next(".news-item")

    const placeholderCenter = placeholder.offset().top + placeholder.outerHeight() / 2
    const containerBottom = parent.offset().top + parent.outerHeight()

    const buffer = 40 // vùng đệm tránh nhảy quá nhanh
    if (direction === "up" && prev.length && e.pageY < placeholderCenter - buffer) {
      placeholder.insertBefore(prev)
      lastSwapY = e.pageY // cập nhật vị trí hoán vị
      lastDirection = "up"
    } else if (
      direction === "down" &&
      next.length &&
      e.pageY > placeholderCenter + buffer &&
      placeholder.offset().top + placeholder.outerHeight() < containerBottom
    ) {
      placeholder.insertAfter(next)
      lastSwapY = e.pageY // cập nhật vị trí hoán vị
      lastDirection = "down"
    }
  })

  // thả chuột ra
  $(document).on("mouseup.drag", function () {
    $(document).off(".drag")
    placeholder.before(draggingItem)
    draggingItem.removeClass("dragging").removeAttr("style")
    placeholder.remove()
    draggingItem = null
  })
})

const $dropdown = $(".highlight-dropdown")
const $btn = $dropdown.find(".dropdown-btn")
const $checkboxes = $dropdown.find('input[type="checkbox"]')
const $bgColorInput = $dropdown.find('input[type="color"][name="background"]')
const $textColorInput = $('.text-highlight input[type="color"][name="style"]')

// đoạn text cần áp dụng
const $sampleText = $(".text-highlight p")

// style highlight mặc định
$sampleText.css({
  color: "red",
  "background-color": "yellow",
  "font-weight": "normal",
  "font-style": "normal",
  "text-decoration": "none",
})

if ($bgColorInput.length) $bgColorInput.val("#ffff00")
if ($textColorInput.length) $textColorInput.val("#ff0000")

//  hiển thị dropdown
$btn.on("click", function (e) {
  e.stopPropagation()
  $dropdown.toggleClass("show")
})

// lựa chọn highlight style
$checkboxes.on("change", function () {
  const name = $(this).attr("name")
  const checked = $(this).is(":checked")

  switch (name) {
    case "bold":
      $sampleText.css("font-weight", checked ? "bold" : "normal")
      break
    case "italic":
      $sampleText.css("font-style", checked ? "italic" : "normal")
      break
    case "underline":
      $sampleText.css("text-decoration", checked ? "underline" : "none")
      break
  }
})

// chọn màu nền (background color)
if ($bgColorInput.length) {
  $bgColorInput.on("input", function () {
    $sampleText.css("background-color", $(this).val())
  })
}

// chọn màu chữ (text color)
if ($textColorInput.length) {
  $textColorInput.on("input", function () {
    $sampleText.css("color", $(this).val())
  })
}

// đóng dropdown khi click ra ngoài
$(document).on("click", function (e) {
  if (!$(e.target).closest(".highlight-dropdown").length) {
    $dropdown.removeClass("show")
  }
})

// thành phần xử lý highlight, delete, reset
const $searchInput = $("#searchInput")
const $highlightBtn = $("#highlightBtn")
const $deleteBtn = $("#deleteBtn")
const $resetBtn = $("#resetBtn")
const $templateParagraph = $(".template-paragraph")

// lưu lại nội dung gốc để reset
const originalContent = $templateParagraph.html()

// Hàm tạo HTML highlight theo style của sampleText
function wrapWithHighlight(text) {
  const style = $sampleText.attr("style") || ""
  return `<span class="highlighted" style="${style}">${text}</span>`
}

$highlightBtn.on("click", function () {
  const keyword = $searchInput.val().trim()
  if (!keyword) return

  $templateParagraph.html(originalContent)

  const regex = new RegExp(`(${keyword})`, "gi")
  const newHTML = $templateParagraph.html().replace(regex, (match) => wrapWithHighlight(match))
  $templateParagraph.html(newHTML)
})

// Xử lý nút Reset
$resetBtn.on("click", function () {
  $searchInput.val("")
  $templateParagraph.html(originalContent)
})
