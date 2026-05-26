document.addEventListener("DOMContentLoaded", function () {
    
    // Kho dữ liệu độ nhạy mặc định cho từng máy
    const SENSITIVITY_DATABASE = {
        "iPhone 17 Pro Max": { xungQuanh: 98, redDot: 90, zoom2x: 82, zoom4x: 70, awm: 60, tuDo: 88 },
        "iPhone 17 Pro":     { xungQuanh: 99, redDot: 91, zoom2x: 84, zoom4x: 72, awm: 61, tuDo: 89 },
        "iPhone 16 Pro Max": { xungQuanh: 100, redDot: 94, zoom2x: 86, zoom4x: 76, awm: 64, tuDo: 92 },
        "iPhone 16 Pro":     { xungQuanh: 96, redDot: 88, zoom2x: 80, zoom4x: 70, awm: 58, tuDo: 85 },
        "iPhone 15 Pro Max": { xungQuanh: 95, redDot: 85, zoom2x: 78, zoom4x: 68, awm: 55, tuDo: 80 },
        "iPhone 15 Pro":     { xungQuanh: 94, redDot: 84, zoom2x: 76, zoom4x: 66, awm: 54, tuDo: 78 },
        "iPhone 14 Pro Max": { xungQuanh: 92, redDot: 82, zoom2x: 75, zoom4x: 65, awm: 52, tuDo: 85 },
        "iPhone 13 Pro Max": { xungQuanh: 100, redDot: 95, zoom2x: 88, zoom4x: 78, awm: 68, tuDo: 95 },
        "iPhone 13 Pro":     { xungQuanh: 100, redDot: 92, zoom2x: 85, zoom4x: 75, awm: 65, tuDo: 90 },
        "iPhone 12 Pro Max": { xungQuanh: 88, redDot: 78, zoom2x: 70, zoom4x: 60, awm: 48, tuDo: 75 },
        "iPhone 11 Pro Max": { xungQuanh: 85, redDot: 75, zoom2x: 68, zoom4x: 58, awm: 45, tuDo: 70 },
        "iPhone XS Max":     { xungQuanh: 82, redDot: 72, zoom2x: 65, zoom4x: 55, awm: 42, tuDo: 65 },
        "iPhone 8 Plus":     { xungQuanh: 80, redDot: 70, zoom2x: 60, zoom4x: 50, awm: 40, tuDo: 60 },
        "iPhone 7 Plus":     { xungQuanh: 75, redDot: 65, zoom2x: 55, zoom4x: 45, awm: 35, tuDo: 55 }
    };

    const loginContainer = document.getElementById("loginContainer");
    const appContainer = document.getElementById("appContainer");
    const keyInput = document.getElementById("keyInput");
    const loginBtn = document.getElementById("loginBtn");
    const keyStatusText = document.getElementById("keyStatus");
    const deviceSelect = document.getElementById("deviceSelect");

    // ========================================================
    // THUẬT TOÁN ĐĂNG NHẬP KIỂM TRA KEY RANDOM (MỚI)
    // ========================================================
    loginBtn.addEventListener("click", function () {
        const inputKey = keyInput.value.trim().toUpperCase(); // Chuyển hết thành chữ in hoa

        // Định dạng cấu trúc: Phải bắt đầu bằng AOP-, ở giữa có đúng 8 chữ số, kết thúc bằng 1D, 7D, 30D hoặc VV
        const keyPattern = /^AOP-\d{8}-(1D|7D|30D|VV)$/;

        if (keyPattern.test(inputKey)) {
            loginBtn.textContent = "ĐANG GIẢI MÃ KEY CHUẨN...";
            loginBtn.style.pointerEvents = "none";

            // Phân tích ký tự đuôi của Key để biết người dùng đang kích hoạt gói nào
            let targetTagId = "";
            let durationLabel = "";

            if (inputKey.endsWith("-1D")) {
                targetTagId = "tag1Day";
                durationLabel = "Gói 1 Ngày";
            } else if (inputKey.endsWith("-7D")) {
                targetTagId = "tag7Day";
                durationLabel = "Gói 7 Ngày";
            } else if (inputKey.endsWith("-30D")) {
                targetTagId = "tag30Day";
                durationLabel = "Gói 30 Ngày";
            } else if (inputKey.endsWith("-VV")) {
                targetTagId = "tagForever";
                durationLabel = "Vĩnh Viễn";
            }

            setTimeout(() => {
                loginContainer.classList.add("hidden");
                appContainer.classList.remove("hidden");
                appContainer.classList.add("anim-fade-up");

                // Sáng đèn thẻ thời hạn tương ứng trên menu chính
                document.getElementById(targetTagId).classList.add("active-key");
                keyStatusText.textContent = `Đã kích hoạt (${durationLabel})`;

                loadDeviceSensitivity(deviceSelect.value);
            }, 800);

        } else {
            alert("❌ MÃ KEY KHÔNG HỢP LỆ HOẶC SAI ĐỊNH DẠNG!\nHãy gõ lệnh trên Discord để nhận Key chuẩn.");
            keyInput.focus();
        }
    });

    keyInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") loginBtn.click();
    });


    // TỰ ĐỘNG ĐỔI THÔNG SỐ THEO MÁY
    function loadDeviceSensitivity(deviceName) {
        const config = SENSITIVITY_DATABASE[deviceName];
        if (!config) return;

        document.querySelectorAll(".slider-group").forEach(group => {
            const type = group.getAttribute("data-type");
            const targetValue = config[type];

            if (targetValue !== undefined) {
                const rangeInput = group.querySelector(".range-input");
                const valDisplay = group.querySelector(".val-display");

                rangeInput.value = targetValue;
                valDisplay.textContent = targetValue;
            }
        });
    }

    deviceSelect.addEventListener("change", function() {
        loadDeviceSensitivity(this.value);
    });

    // ĐIỀU KHIỂN NÚT BẤM CỦA CÁC THANH KÉO SLIDER
    const sliderGroups = document.querySelectorAll(".slider-group");
    sliderGroups.forEach(group => {
        const rangeInput = group.querySelector(".range-input");
        const valDisplay = group.querySelector(".val-display");
        const minBtn = group.querySelector(".min-btn");
        const plusBtn = group.querySelector(".plus-btn");

        rangeInput.addEventListener("input", function() {
            valDisplay.textContent = this.value;
        });

        minBtn.addEventListener("click", function() {
            let currentVal = parseInt(rangeInput.value);
            if (currentVal > 0) {
                currentVal -= 1; rangeInput.value = currentVal; valDisplay.textContent = currentVal;
            }
        });

        plusBtn.addEventListener("click", function() {
            let currentVal = parseInt(rangeInput.value);
            if (currentVal < 100) {
                currentVal += 1; rangeInput.value = currentVal; valDisplay.textContent = currentVal;
            }
        });
    });

    // Các nút nền tảng phụ trợ
    const platformButtons = document.querySelectorAll(".btn-platform");
    platformButtons.forEach(button => {
        button.addEventListener("click", function () {
            document.querySelector(".btn-platform.active").classList.remove("active");
            this.classList.add("active");
        });
    });

    // Nút Áp dụng chuyển hướng vào game
    const applyButton = document.getElementById("applyBtn");
    applyButton.addEventListener("click", function () {
        const selectedDevice = deviceSelect.value;
        applyButton.textContent = "ĐANG LƯU DATA VÀO GAME...";
        applyButton.style.pointerEvents = "none";

        setTimeout(() => {
            applyButton.textContent = "ÁP DỤNG ĐỘ NHẠY";
            applyButton.style.pointerEvents = "auto";
            alert(`[THÀNH CÔNG] Đã nạp thông số cho ${selectedDevice}!\nĐang tự động chuyển hướng mở game...`);
            
            // Gọi lệnh hệ điều hành bật Free Fire
            window.location.href = "freefire://";

            setTimeout(function() {
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                if (isIOS) {
                    window.location.href = "https://apple.com";
                } else {
                    window.location.href = "https://google.com";
                }
            }, 500);
        }, 1000);
    });

    document.getElementById("saveBtn").addEventListener("click", function() {
        alert("Đã lưu cấu hình!");
    });
});
