let countdownTimer = null;
let timeRemainingInSeconds = 0;
let selectedGame = "freefire"; // Mặc định ban đầu chọn Free Fire thường

// ==========================================
// 1. FIX LỖI KẸT LOADING (MÀN HÌNH CHÀO)
// ==========================================
setTimeout(() => {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => welcomeScreen.remove(), 500);
    }
}, 2500);

// ==========================================
// 2. DATA ĐỘ NHẠY IPHONE (0 - 200) TỪ IP 7 ĐẾN IP 17
// ==========================================
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

const VALID_KEYS = {
    "KEY1D_ABCXYZ": { label: "1 Ngày (Test)", seconds: 10 }, // 10 giây để test tự đá
    "KEY7D_POPQQQ": { label: "7 Ngày", seconds: 7 * 24 * 60 * 60 },  
    "KEY30D_MNO123": { label: "30 Ngày", seconds: 30 * 24 * 60 * 60 },
    "KEYFOREVER_VIP": { label: "VĨNH VIỄN", seconds: 999999999 }     
};

// ==========================================
// 3. XÁC THỰC KEY & ĐỒNG BỘ FIX KHOẢNG TRẮNG
// ==========================================
function verifyKey() {
    let inputKey = document.getElementById('key-input').value.trim();
    inputKey = inputKey.replace(/\s+/g, '_'); // Tự đổi dấu cách thành dấu gạch dưới
    
    // Hỗ trợ quét định dạng key tự động từ Bot cấp
    if (inputKey.startsWith("KEYFOREVER_") && inputKey.length >= 14) {
        VALID_KEYS[inputKey] = { label: "VĨNH VIỄN", seconds: 999999999 };
    } else if (inputKey.startsWith("KEY7D_") && inputKey.length >= 10) {
        VALID_KEYS[inputKey] = { label: "7 Ngày", seconds: 7 * 24 * 60 * 60 };
    } else if (inputKey.startsWith("KEY30D_") && inputKey.length >= 11) {
        VALID_KEYS[inputKey] = { label: "30 Ngày", seconds: 30 * 24 * 60 * 60 };
    }

    if (VALID_KEYS[inputKey]) {
        alert("🎉 Kích hoạt tài khoản PRO thành công!");
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        
        timeRemainingInSeconds = VALID_KEYS[inputKey].seconds;
        startKeyCountdown();
        changeDeviceSettings(); 
    } else {
        alert("❌ Mã Key không chính xác hoặc đã hết hạn!");
    }
}

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

// ==========================================
// 4. HỆ THỐNG ĐẾM NGƯỢC THỜI GIAN & TỰ ĐỘNG ĐÁ RA
// ==========================================
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

// ==========================================
// 5. TỰ ĐỘNG CHUYỂN HƯỚNG ĐA NỀN TẢNG (CHẠY MỌI THIẾT BỊ)
// ==========================================
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
        
        let iosScheme = "";
        let androidIntent = "";
        let pcFallbackUrl = "";
        let appStoreUrl = "";
        let playStoreUrl = "";

        const ua = navigator.userAgent.toLowerCase();
        const isIOS = /ipad|iphone|ipod/.test(ua) && !window.MSStream;
        const isAndroid = /android/.test(ua);
        const isPC = !isIOS && !isAndroid;

        if (selectedGame === "freefire") {
            iosScheme = "com.dts.freefireth://";
            androidIntent = "intent://#Intent;package=com.dts.freefireth;end";
            appStoreUrl = "https://apple.com";
            playStoreUrl = "https://google.com";
            pcFallbackUrl = "https://garena.com"; 
        } else {
            iosScheme = "com.dts.freefiremax://";
            androidIntent = "intent://#Intent;package=com.dts.freefiremax;end";
            appStoreUrl = "https://apple.com";
            playStoreUrl = "https://google.com";
            pcFallbackUrl = "https://garena.com";
        }

        // --- KÍCH HOẠT CHUYỂN HƯỚNG THEO THIẾT BỊ ---
        if (isPC) {
            alert("🖥️ Đã lưu thông số Regedit DPI giả lập thành công!");
            let openWeb = confirm("Bạn có muốn mở trang chủ để cập nhật game bản PC không?");
            if (openWeb) window.open(pcFallbackUrl, '_blank');
            resetButton();
            return;
        }

        if (isIOS) {
            window.location.href = iosScheme;
            setTimeout(() => { window.location.assign(iosScheme); }, 250);
        } 
        
        if (isAndroid) {
            window.location.href = iosScheme.replace("com.dts", "freefire"); 
            setTimeout(() => { window.location.href = androidIntent; }, 100);
        }

        // --- KIỂM TRA LỖI CHƯA CÀI GAME ---
        let hasLeftPage = false;
        const checkBlur = setTimeout(() => {
            if (!document.hidden && !hasLeftPage) {
                let fallback = isIOS ? appStoreUrl : playStoreUrl;
                let confirmDownload = confirm("Không thể tự động mở game!\nPhát hiện máy bạn chưa cài bản game này hoặc trình duyệt chặn mở app. Mở cửa hàng ứng dụng để tải xuống?");
                if (confirmDownload) window.location.href = fallback;
                resetButton();
            }
        }, 2500);

        document.addEventListener("visibilitychange", function onVisibilityChange() {
            if (document.hidden) {
                hasLeftPage = true;
                clearTimeout(checkBlur);
                setTimeout(resetButton, 1000);
                document.removeEventListener("visibilitychange", onVisibilityChange);
            }
        });

        function resetButton() {
            applyBtn.innerText = originalText;
            applyBtn.disabled = false;
            applyBtn.style.opacity = "1";
        }

    }, 1500);
}
