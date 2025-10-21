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

// Hàm đệ quy highlight text node trong container
function highlightText($container, keyword, style) {
  if (!keyword) return
  let regex
  try {
    regex = new RegExp(keyword, "gi")
  } catch (e) {
    alert("Biểu thức regex không hợp lệ!")
    return
  }

  // Nếu từ khóa nằm trong vùng đã highlight, cập nhật style
  $container.find(".highlighted").each(function () {
    const $span = $(this)
    if ($span.text().match(regex)) {
      $span.attr("style", style)
    }
  })

  // Nếu chưa có highlight, thêm mới
  $container.contents().each(function () {
    const node = this

    // Nếu là text node, kiểm tra và thay thế
    if (node.nodeType === 3) {
      const text = node.nodeValue
      if (regex.test(text)) {
        const replacedHTML = text.replace(regex, (match) => {
          return `<span class="highlighted" style="${style}">${match}</span>`
        })
        $(node).replaceWith(replacedHTML)
      }
    }
    // Nếu là element node và chưa được highlight, đệ quy
    else if (node.nodeType === 1 && !$(node).hasClass("highlighted")) {
      highlightText($(node), keyword, style)
    }
  })
}

// Hàm đệ quy xóa text khớp với từ khóa
function deleteText($container, keyword) {
  if (!keyword) return
  let regex
  try {
    regex = new RegExp(keyword, "gi")
  } catch (e) {
    alert("Biểu thức regex không hợp lệ!")
    return
  }

  $container.contents().each(function () {
    const node = this
    if (node.nodeType === 3) {
      const text = node.nodeValue.replace(regex, "") // xóa từ khóa
      node.nodeValue = text // cập nhật text node
    } else if (node.nodeType === 1) {
      deleteText($(node), keyword)
    }
  })
}

// Xử lý nút Highlight
$highlightBtn.on("click", function () {
  const keyword = $searchInput.val().trim()
  if (!keyword) return
  const style = $sampleText.attr("style") || ""
  highlightText($templateParagraph, keyword, style)
})

// Xử lý nút Delete
$deleteBtn.on("click", function () {
  const keyword = $searchInput.val().trim()
  if (!keyword) return
  deleteText($templateParagraph, keyword)
})

// Xử lý nút Reset
$resetBtn.on("click", function () {
  $searchInput.val("")
  $templateParagraph.html(originalContent)
})

// Drag & Drop
// Thêm animal
const animalEmojis = {
  mouse: "🐁",
  buffalo: "🐃",
  tiger: "🐅",
  cat: "🐈",
  dragon: "🐉",
  snake: "🐍",
  horse: "🐎",
  goat: "🐐",
  monkey: "🐒",
  rooster: "🐓",
  dog: "🐕",
  pig: "🐖",
}

$("#addBtn").click(function () {
  let selectedValue = $("#itemSelect").val()
  if (!selectedValue) {
    return
  }

  let animalName = selectedValue
  let animalEmoji = animalEmojis[selectedValue]
  let itemId = "item-" + Date.now()

  let itemHtml = `
    <div class="animal-item" id="${itemId}" data-animal="${animalName}">
      <span class="emoji">${animalEmoji}</span>
      <span class="name">${animalName}</span>
    </div>
  `

  $(".dropZone").append(itemHtml)
})

function initAnimalDragDrop() {
  let $draggedElement = null
  let $placeholder = null // biến placeholder giữ chỗ
  let isDragging = false
  let startX, startY
  let offsetX, offsetY
  let originalIndex = -1

  // Tạo placeholder giữ chỗ
  function createPlaceholder($element) {
    return $('<div class="animal-placeholder"></div>').css({
      width: $element.outerWidth(),
      height: $element.outerHeight(),
    })
  }

  // Mousedown - bắt đầu drag
  $(".dropZone").on("mousedown", ".animal-item", function (e) {
    e.preventDefault()

    $draggedElement = $(this)
    const rect = this.getBoundingClientRect()

    // Lưu vị trí ban đầu
    originalIndex = $draggedElement.index()

    // Lưu vị trí chuột so với element
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
    startX = e.clientX
    startY = e.clientY

    isDragging = false

    // Thêm event cho document
    $(document).on("mousemove.dragAnimal", handleMouseMove)
    $(document).on("mouseup.dragAnimal", handleMouseUp)
  })

  function handleMouseMove(e) {
    if (!$draggedElement) return

    // Chỉ bắt đầu drag khi di chuyển ít nhất 5px
    if (!isDragging) {
      const distance = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2))

      if (distance < 5) return

      isDragging = true

      // Tạo và chèn placeholder giữ chỗ
      $placeholder = createPlaceholder($draggedElement)
      $draggedElement.after($placeholder)

      // Thêm class dragging và chuyển sang absolute positioning
      $draggedElement.addClass("dragging")

      const $dropZone = $(".dropZone")
      const dropZoneOffset = $dropZone.offset()

      $draggedElement.css({
        position: "absolute",
        zIndex: 1000,
        pointerEvents: "none",
        left: e.pageX - dropZoneOffset.left - offsetX,
        top: e.pageY - dropZoneOffset.top - offsetY,
      })
    }

    if (!isDragging) return

    // Di chuyển element theo chuột
    const $dropZone = $(".dropZone")
    const dropZoneOffset = $dropZone.offset()

    $draggedElement.css({
      left: e.pageX - dropZoneOffset.left - offsetX,
      top: e.pageY - dropZoneOffset.top - offsetY,
    })

    // Cập nhật vị trí placeholder
    const dropZoneRect = $dropZone[0].getBoundingClientRect()

    const isInsideDropZone =
      e.clientX >= dropZoneRect.left &&
      e.clientX <= dropZoneRect.right &&
      e.clientY >= dropZoneRect.top &&
      e.clientY <= dropZoneRect.bottom

    if (isInsideDropZone) {
      const items = $dropZone.children(".animal-item").not($draggedElement)
      let inserted = false

      items.each(function () {
        const rect = this.getBoundingClientRect()
        const itemCenterX = rect.left + rect.width / 2
        const itemCenterY = rect.top + rect.height / 2

        if (!inserted) {
          if (
            e.clientY < itemCenterY ||
            (Math.abs(e.clientY - itemCenterY) < rect.height / 2 && e.clientX < itemCenterX)
          ) {
            $(this).before($placeholder)
            inserted = true
            return false
          }
        }
      })

      if (!inserted) {
        $dropZone.append($placeholder)
      }
    }
  }

  function handleMouseUp(e) {
    if ($draggedElement && isDragging) {
      const $dropZone = $(".dropZone")
      const dropZoneRect = $dropZone[0].getBoundingClientRect()

      // Kiểm tra chuột có trong dropZone không
      const isInsideDropZone =
        e.clientX >= dropZoneRect.left &&
        e.clientX <= dropZoneRect.right &&
        e.clientY >= dropZoneRect.top &&
        e.clientY <= dropZoneRect.bottom

      // Nếu thả trong dropZone, chèn vào vị trí placeholder
      if (isInsideDropZone && $placeholder && $placeholder.parent().length) {
        $placeholder.replaceWith($draggedElement)
      }
      // Reset style
      $draggedElement.removeClass("dragging").removeAttr("style")
    }

    // Xóa placeholder
    if ($placeholder && $placeholder.parent().length) {
      $placeholder.remove()
    }
    $placeholder = null

    // Reset biến
    $draggedElement = null
    isDragging = false
    originalIndex = -1

    // Bỏ event
    $(document).off(".dragAnimal")
  }
}

// Khởi tạo
$(document).ready(function () {
  initAnimalDragDrop()
})
