let countdownTimer = null;
let timeRemainingInSeconds = 0;
let selectedGame = "freefire";

// 1. FIX LỖI KẸT LOADING: Ẩn màn hình chào tự động
setTimeout(() => {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => welcomeScreen.remove(), 500);
    }
}, 2500);

// 2. DATA ĐỘ NHẠY IPHONE (Giới hạn tăng lên 200)
const DEVICE_SENSITIVITY_DATABASE = {
    "ip7_8": { general: 185, reddot: 160, x2: 155, x4: 140 },
    "ipX":    { general: 170, reddot: 155, x2: 142, x4: 135 },
    "ip11":   { general: 150, reddot: 130, x2: 125, x4: 110 },
    "ip12":   { general: 135, reddot: 120, x2: 115, x4: 105 },
    "ip13":   { general: 100, reddot: 92,  x2: 85,  x4: 75  },
    "ip14":   { general: 125, reddot: 110, x2: 98,  x4: 88  },
    "ip15":   { general: 145, reddot: 135, x2: 120, x4: 112 },
    "ip16":   { general: 165, reddot: 150, x2: 138, x4: 122 },
    "ip17":   { general: 195, reddot: 180, x2: 172, x4: 160 }
};

// Cấu trúc danh sách mã Key bảo mật hệ thống
const VALID_KEYS = {
    "KEY1D_ABCXYZ": { label: "1 Ngày (Test)", seconds: 86400 },      
    "KEY7D_POPQQQ": { label: "7 Ngày", seconds: 7 * 24 * 60 * 60 },  
    "KEY30D_MNO123": { label: "30 Ngày", seconds: 30 * 24 * 60 * 60 },
    "KEYFOREVER_VIP": { label: "VĨNH VIỄN", seconds: 999999999 }     
};

// 3. Hàm Xác Thực Key (ĐÃ FIX TỰ ĐỘNG CHUYỂN ĐỔI DẤU CÁCH)
function verifyKey() {
    let inputKey = document.getElementById('key-input').value.trim();
    
    // Tự động sửa lỗi: Đổi dấu cách thành dấu gạch dưới _ để tránh bị kẹt như trong ảnh
    inputKey = inputKey.replace(/\s+/g, '_'); 
    
    // Thêm cơ chế quét thông minh: Nếu key chứa định dạng vĩnh viễn ngẫu nhiên của bạn
    if (inputKey.startsWith("KEYFOREVER_") && inputKey.length >= 15) {
        VALID_KEYS[inputKey] = { label: "VĨNH VIỄN", seconds: 999999999 };
    }
    // Quét bổ sung cho các cấu trúc key ngẫu nhiên khác sinh ra từ bot
    else if (inputKey.startsWith("KEY7D_") && inputKey.length >= 10) {
        VALID_KEYS[inputKey] = { label: "7 Ngày", seconds: 7 * 24 * 60 * 60 };
    }
    else if (inputKey.startsWith("KEY30D_") && inputKey.length >= 11) {
        VALID_KEYS[inputKey] = { label: "30 Ngày", seconds: 30 * 24 * 60 * 60 };
    }

    // Tiến hành kiểm tra và cấp quyền truy cập
    if (VALID_KEYS[inputKey]) {
        alert("🎉 Kích hoạt tài khoản PRO thành công!");
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        timeRemainingInSeconds = VALID_KEYS[inputKey].seconds;
        startKeyCountdown();
        changeDeviceSettings(); 
    } else {
        alert("❌ Mã Key không chính xác hoặc đã bị khóa khỏi hệ thống!");
    }
}

// 4. Đồng bộ hóa chuyển đổi dòng máy từ iPhone 7 đến iPhone 17
function changeDeviceSettings() {
    const selectedDevice = document.getElementById('device-select').value;
    const config = DEVICE_SENSITIVITY_DATABASE[selectedDevice];

    if (config) {
        document.getElementById('slide-general').value = config.general;
        document.getElementById('slide-reddot').value = config.reddot;
        document.getElementById('slide-x2').value = config.x2;
        document.getElementById('slide-x4').value = config.x4;

        document.getElementById('val-general').innerText = config.general;
        document.getElementById('val-reddot').innerText = config.reddot;
        document.getElementById('val-x2').innerText = config.x2;
        document.getElementById('val-x4').innerText = config.x4;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gameButtons = document.querySelectorAll('.card.half:nth-child(2) .btn-group button');
    gameButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            gameButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGame = (index === 0) ? "freefire" : "ffmax";
        });
    });

    const sliders = ['general', 'reddot', 'x2', 'x4'];
    sliders.forEach(id => {
        const sliderInput = document.getElementById(`slide-${id}`);
        if (sliderInput) {
            sliderInput.addEventListener('input', (e) => {
                document.getElementById(`val-${id}`).innerText = e.target.value;
            });
        }
    });
});

// 5. Đồng hồ đếm ngược và TỰ ĐỘNG ĐÁ NGƯỜI DÙNG khi hết hạn
function startKeyCountdown() {
    if (countdownTimer) clearInterval(countdownTimer);
    const vipTimeElement = document.getElementById('vip-time');

    countdownTimer = setInterval(() => {
        if (timeRemainingInSeconds > 50000000) {
            vipTimeElement.innerText = "VĨNH VIỄN";
            return;
        }

        timeRemainingInSeconds--;

        if (timeRemainingInSeconds <= 5) {
            vipTimeElement.style.color = "#ff3333";
            vipTimeElement.style.textShadow = "0 0 10px #ff3333";
        } else {
            vipTimeElement.style.color = "#00f2fe"; 
            vipTimeElement.style.textShadow = "none";
        }

        if (timeRemainingInSeconds <= 0) {
            clearInterval(countdownTimer);
            vipTimeElement.style.color = "#00f2fe"; 
            kickUserOut("⏰ Hết hạn thời gian sử dụng mã Key! Bạn đã bị đá ra khỏi ứng dụng.");
            return;
        }

        const hours = Math.floor(timeRemainingInSeconds / 3600);
        const minutes = Math.floor((timeRemainingInSeconds % 3600) / 60);
        const seconds = timeRemainingInSeconds % 60;

        vipTimeElement.innerText = 
            String(hours).padStart(2, '0') + ":" + 
            String(minutes).padStart(2, '0') + ":" + 
            String(seconds).padStart(2, '0');
    }, 1000);
}

function kickUserOut(reasonMessage) {
    alert(reasonMessage);
    document.getElementById('app-container').classList.add('hidden');
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('key-input').value = ""; 
}

// 6. Áp dụng chuyển hướng thẳng vào ứng dụng Game (Free Fire hoặc Free Fire MAX)
function applySettings() {
    if (timeRemainingInSeconds <= 0) {
        kickUserOut("❌ Thao tác thất bại! Key đã hết hạn.");
        return;
    }

    const applyBtn = document.querySelector('.btn-apply');
    const originalText = applyBtn.innerText;
    applyBtn.innerText = "⚡ ĐANG GHI ĐÈ FILE CONFIG DPI...";
    applyBtn.disabled = true;
    applyBtn.style.opacity = "0.7";

    setTimeout(() => {
        applyBtn.innerText = "🚀 ĐANG KHỞI ĐỘNG GAME...";
        
        let scheme = "";
        let intent = "";
        let fallbackUrl = "";

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (selectedGame === "freefire") {
            scheme = "com.dts.freefireth://";
            intent = "intent://#Intent;package=com.dts.freefireth;end";
            fallbackUrl = isIOS ? "https://apple.com" : "https://google.com";
        } else {
            scheme = "com.dts.freefiremax://";
            intent = "intent://#Intent;package=com.dts.freefiremax;end";
            fallbackUrl = isIOS ? "https://apple.com" : "https://google.com";
        }

        let opened = false;
        window.location.href = scheme;

        setTimeout(() => {
            if (!isIOS) {
                window.location.href = intent;
            }
        }, 200);

        const checkBlur = setTimeout(() => {
            if (!document.hidden && !opened) {
                let confirmDownload = confirm("Không thể kích hoạt tự động mở Game!\nCó thể bạn chưa cài đặt phiên bản game này. Bạn có muốn đi tới cửa hàng ứng dụng để tải không?");
                if (confirmDownload) {
                    window.location.href = fallbackUrl;
                }
                applyBtn.innerText = originalText;
                applyBtn.disabled = false;
                applyBtn.style.opacity = "1";
            }
        }, 2500);

        document.addEventListener("visibilitychange", function onVisibilityChange() {
            if (document.hidden) {
                opened = true;
                clearTimeout(checkBlur);
                setTimeout(() => {
                    applyBtn.innerText = originalText;
                    applyBtn.disabled = false;
                    applyBtn.style.opacity = "1";
                }, 1000);
                document.removeEventListener("visibilitychange", onVisibilityChange);
            }
        });

    }, 1500);
}
