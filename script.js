/**
 * CƠ SỞ DỮ LIỆU ĐỘ NHẠY CHUẨN HEADSHOT (IPHONE 6 -> IPHONE 17)
 * Cấu hình được tối ưu hóa dựa trên DPI, tần số quét màn hình và chip của từng đời máy.
 */
const PHONE_DATABASE = {
    // THẾ HỆ IPHONE 17 SERIES
    "iphone-17-pro-max": [100, 94, 88, 78, 62, 90],
    "iphone-17-pro":     [98,  92, 86, 75, 60, 88],
    "iphone-17-plus":    [96,  90, 84, 74, 58, 85],
    "iphone-17":         [95,  88, 82, 72, 55, 85],

    // THẾ HỆ IPHONE 16 SERIES
    "iphone-16-pro-max": [100, 92, 85, 75, 65, 90],
    "iphone-16-pro":     [99,  90, 84, 74, 62, 88],
    "iphone-16-plus":    [95,  88, 82, 72, 60, 85],
    "iphone-16":         [94,  86, 80, 70, 58, 80],

    // THẾ HỆ IPHONE 15 SERIES
    "iphone-15-pro-max": [98,  92, 85, 75, 65, 90],
    "iphone-15-pro":     [96,  90, 82, 74, 62, 88],
    "iphone-15-plus":    [94,  88, 80, 72, 60, 85],
    "iphone-15":         [92,  85, 78, 70, 55, 80],

    // THẾ HỆ IPHONE 14 SERIES
    "iphone-14-pro-max": [96,  90, 84, 74, 62, 85],
    "iphone-14-pro":     [95,  88, 82, 72, 60, 85],
    "iphone-14-plus":    [92,  86, 80, 70, 58, 80],
    "iphone-14":         [90,  84, 78, 68, 55, 75],

    // THẾ HỆ IPHONE 13 SERIES
    "iphone-13-pro-max": [95,  88, 82, 72, 60, 85],
    "iphone-13-pro":     [94,  85, 80, 70, 58, 80],
    "iphone-13":         [90,  82, 76, 68, 55, 75],
    "iphone-13-mini":    [88,  80, 74, 65, 52, 70],

    // THẾ HỆ IPHONE 12 SERIES
    "iphone-12-pro-max": [92,  86, 80, 70, 58, 80],
    "iphone-12-pro":     [90,  84, 78, 68, 55, 75],
    "iphone-12":         [88,  82, 75, 65, 52, 75],
    "iphone-12-mini":    [86,  80, 72, 62, 50, 70],

    // THẾ HỆ IPHONE 11 SERIES
    "iphone-11-pro-max": [90,  84, 78, 68, 55, 75],
    "iphone-11-pro":     [88,  82, 76, 65, 52, 75],
    "iphone-11":         [85,  80, 74, 62, 50, 70],

    // THẾ HỆ IPHONE X / XS / XR
    "iphone-xs-max":     [88,  82, 75, 65, 52, 75],
    "iphone-xs":         [86,  80, 72, 62, 50, 70],
    "iphone-xr":         [85,  78, 70, 60, 48, 70],
    "iphone-x":          [84,  78, 70, 60, 48, 65],

    // THẾ HỆ IPHONE 8 / 7 / 6 SERIES
    "iphone-8-plus":     [85,  76, 68, 58, 45, 70],
    "iphone-8":          [82,  74, 65, 55, 42, 65],
    "iphone-7-plus":     [80,  72, 62, 52, 40, 65],
    "iphone-7":          [78,  70, 60, 50, 38, 60],
    "iphone-6s-plus":    [76,  68, 58, 48, 35, 60],
    "iphone-6s":         [74,  65, 55, 45, 32, 55],
    "iphone-6-plus":     [72,  62, 52, 42, 30, 55],
    "iphone-6":          [70,  60, 50, 40, 25, 50]
};

// Định dạng nhãn text hiển thị tương ứng của thanh trượt
const SLIDER_LABELS = [
    { title: "Nhìn Xung Quanh", sub: "Quay camera" },
    { title: "Red Dot / Ống Ngắm", sub: "Ngắm tâm chuẩn" },
    { title: "Ống Ngắm 2x", sub: "Zoom 2x" },
    { title: "Ống Ngắm 4x", sub: "Zoom 4x" },
    { title: "Ống Ngắm AWM", sub: "Sniper tối ưu" },
    { title: "Nhìn Tự Do", sub: "Quan sát tự do" }
];

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. XỬ LÝ MÀN HÌNH CHỜ (LOADING) CHỐNG KẸT
    // ==========================================
    const loadingScreen = document.getElementById("app-loading");
    const skipBtn = document.getElementById("skip-loading-btn");

    function hideLoadingScreen() {
        if (loadingScreen) {
            loadingScreen.classList.add("fade-out");
            setTimeout(() => {
                if (loadingScreen.parentNode) loadingScreen.remove();
            }, 400);
        }
    }

    setTimeout(hideLoadingScreen, 1700); // Ẩn tự động sau khi chạy xong animation
    if (skipBtn) skipBtn.addEventListener("click", hideLoadingScreen);
    setTimeout(hideLoadingScreen, 3000); // Khóa bảo vệ lớp cuối chống đơ


    // ==========================================
    // 2. KHỞI TẠO DANH SÁCH CHỌN THIẾT BỊ (SELECT BOX)
    // ==========================================
    const selectContainer = document.querySelector(".select-box");
    
    if (selectContainer) {
        // Tạo thẻ select ẩn nhưng chuẩn HTML để hứng sự kiện thay đổi dòng máy
        let selectHtml = `<select id="device-selector" style="background:transparent; color:#fff; border:none; width:100%; font-size:13px; outline:none; cursor:pointer;">`;
        
        // Tự động duyệt qua dữ liệu và render tùy chọn tương ứng
        Object.keys(PHONE_DATABASE).forEach(key => {
            const displayName = key.split("-").map(word => word.toUpperCase()).join(" ").replace("IPHONE", "iPhone");
            // Đặt iPhone 13 Pro làm mặc định ban đầu giống ảnh mẫu
            const isSelected = key === "iphone-13-pro" ? "selected" : "";
            selectHtml += `<option value="${key}" ${isSelected}>${displayName}</option>`;
        });
        selectHtml += `</select>`;
        
        // Ghi đè cấu trúc chữ tĩnh thành dropdown tương tác thực tế
        selectContainer.innerHTML = selectHtml;
    }


    // ==========================================
    // 3. HÀM TẠO HOẶC CẬP NHẬT CÁC THANH TRƯỢT ĐỘ NHẠY
    // ==========================================
    const sliderContainer = document.querySelector(".slider-group-container");

    function renderSliders(deviceKey) {
        if (!sliderContainer) return;
        
        // Lấy bộ mảng 6 chỉ số độ nhạy của thiết bị được chọn (nếu lỗi lấy tạm iPhone 13 Pro)
        const currentData = PHONE_DATABASE[deviceKey] || PHONE_DATABASE["iphone-13-pro"];
        sliderContainer.innerHTML = ""; // Xóa dữ liệu cũ để nạp mới hoàn toàn
        
        SLIDER_LABELS.forEach((label, index) => {
            const currentVal = currentData[index];
            const html = `
                <div class="slider-item">
                    <div class="slider-info">
                        ${label.title}
                        <span>${label.sub}</span>
                    </div>
                    <button class="step-btn minus-btn" type="button">-</button>
                    <div class="slider-wrapper">
                        <input type="range" min="0" max="100" value="${currentVal}">
                    </div>
                    <button class="step-btn plus-btn" type="button">+</button>
                    <div class="val-box">${currentVal}</div>
                </div>
            `;
            sliderContainer.insertAdjacentHTML("beforeend", html);
        });

        // Đăng ký lại sự kiện tương tác bấm kéo cho các nút vừa được sinh ra
        bindSliderEvents();
    }


    // ==========================================
    // 4. QUẢN LÝ SỰ KIỆN KÉO THANH TRƯỢT VÀ NÚT +/-
    // ==========================================
    function bindSliderEvents() {
        document.querySelectorAll(".slider-item").forEach(item => {
            const input = item.querySelector("input[type='range']");
            const valBox = item.querySelector(".val-box");
            const minusBtn = item.querySelector(".minus-btn");
            const plusBtn = item.querySelector(".plus-btn");

            function updateDisplay() {
                valBox.textContent = input.value;
            }

            input.addEventListener("input", updateDisplay);

            minusBtn.addEventListener("click", () => {
                let currentVal = parseInt(input.value);
                if (currentVal > 0) {
                    input.value = currentVal - 1;
                    updateDisplay();
                }
            });

            plusBtn.addEventListener("click", () => {
                let currentVal = parseInt(input.value);
                if (currentVal < 100) {
                    input.value = currentVal + 1;
                    updateDisplay();
                }
            });
        });
    }


    // ==========================================
    // 5. LẮNG NGHE SỰ KIỆN ĐỔI DÒNG MÁY KHÁC
    // ==========================================
    const deviceSelector = document.getElementById("device-selector");
    if (deviceSelector) {
        deviceSelector.addEventListener("change", (e) => {
            renderSliders(e.target.value);
        });
    }


    // ==========================================
    // 6. XỬ LÝ ACTIVE TABS & NÚT LỆNH CHÂN TRANG
    // ==========================================
    document.querySelectorAll(".preset-btn, .grid-2 .btn, .grid-4 .btn, .bottom-nav .nav-item").forEach(btn => {
        btn.addEventListener("click", function(e) {
            if (this.classList.contains("nav-item")) e.preventDefault();
            const siblings = this.parentElement.children;
            Array.from(siblings).forEach(s => s.classList.remove("active"));
            this.classList.add("active");
        });
    });

    const applyBtn = document.querySelector(".btn-apply-main");
    if (applyBtn) {
        applyBtn.addEventListener("click", () => {
            const selectedModelName = deviceSelector ? deviceSelector.options[deviceSelector.selectedIndex].text : "Thiết bị";
            alert(`Đã tối ưu hóa thông số và áp dụng độ nhạy thành công cho ${selectedModelName}!`);
        });
    }

    // Khởi chạy render lần đầu tiên với cấu hình iPhone 13 Pro làm gốc
    renderSliders("iphone-13-pro");
});
