const deviceDatabase = {
    "iphone7":   { name: "iPhone 7 / 7 Plus", general: 98, redDot: 95, x2: 90, x4: 88 },
    "iphone8":   { name: "iPhone 8 / 8 Plus", general: 95, redDot: 92, x2: 88, x4: 85 },
    "iphonex":   { name: "iPhone X / XS / XR", general: 92, redDot: 88, x2: 85, x4: 82 },
    "iphone11":  { name: "iPhone 11 Series",  general: 90, redDot: 86, x2: 83, x4: 80 },
    "iphone12":  { name: "iPhone 12 Series",  general: 88, redDot: 84, x2: 80, x4: 78 },
    "iphone13":  { name: "iPhone 13 / 14 Thường", general: 86, redDot: 82, x2: 78, x4: 75 },
    "iphone13p": { name: "iPhone 13 Pro -> 14 Pro Max (120Hz)", general: 82, redDot: 78, x2: 74, x4: 70 },
    "iphone15":  { name: "iPhone 15 Series",  general: 80, redDot: 76, x2: 72, x4: 68 },
    "iphone16":  { name: "iPhone 16 Series",  general: 78, redDot: 74, x2: 70, x4: 65 },
    "iphone17":  { name: "iPhone 17 Series (Mới nhất)", general: 75, redDot: 72, x2: 68, x4: 62 }
};

let isKeyActivated = false;
let keyExpirationTime = null;
let checkKeyInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    const deviceSelect = document.getElementById("deviceSelect");
    
    // Đổ dữ liệu thiết bị vào menu lựa chọn
    for (let key in deviceDatabase) {
        let option = document.createElement("option");
        option.value = key;
        option.textContent = deviceDatabase[key].name;
        deviceSelect.appendChild(option);
    }

    deviceSelect.addEventListener("change", (e) => {
        if (isKeyActivated) applyDeviceSensitivity(e.target.value);
    });

    document.getElementById("btnActivate").addEventListener("click", checkKeyVIP);

    document.getElementById("btnApply").addEventListener("click", () => {
        if (!isKeyActivated) return;
        alert("🎉 ĐÃ BƠM ĐỘ NHẠY SẴN SÀNG! Vào game vuốt tâm ngay.");
    });

    setupSliderListeners();
    
    // Mặc định ban đầu hiển thị thông số dòng đầu tiên nhưng bị khóa màn hình
    applyDeviceSensitivity(deviceSelect.value);
    autoLoadSavedKey();
});

function applyDeviceSensitivity(deviceKey) {
    const config = deviceDatabase[deviceKey];
    if (!config) return;

    document.getElementById("sensGeneral").value = config.general;
    document.getElementById("sensRedDot").value = config.redDot;
    document.getElementById("sens2x").value = config.x2;
    document.getElementById("sens4x").value = config.x4;
    updateUIValues();
}

function updateUIValues() {
    document.getElementById("valGeneral").textContent = document.getElementById("sensGeneral").value;
    document.getElementById("valRedDot").textContent = document.getElementById("sensRedDot").value;
    document.getElementById("val2x").textContent = document.getElementById("sens2x").value;
    document.getElementById("val4x").textContent = document.getElementById("sens4x").value;
}

function setupSliderListeners() {
    ["sensGeneral", "sensRedDot", "sens2x", "sens4x"].forEach(id => {
        document.getElementById(id).addEventListener("input", updateUIValues);
    });
}

// --- XỬ LÝ KÍCH HOẠT VÀ ĐẾM NGƯỢC KHÓA APP ---

function checkKeyVIP() {
    const key = document.getElementById("keyInput").value.trim().toUpperCase();
    let durationMinutes = 0;
    let isForever = false;
    let label = "";

    if (key.startsWith("KEY_1MIN_")) { durationMinutes = 1; label = "Gói Test 1 Phút"; }
    else if (key.startsWith("KEY_1DAY_")) { durationMinutes = 24 * 60; label = "Gói 1 Ngày"; }
    else if (key.startsWith("KEY_7DAY_")) { durationMinutes = 7 * 24 * 60; label = "Gói 7 Ngày"; }
    else if (key.startsWith("KEY_30DAY_")) { durationMinutes = 30 * 24 * 60; label = "Gói 30 Ngày"; }
    else if (key.startsWith("KEY_FOREVER_")) { isForever = true; label = "Gói VĨNH VIỄN"; }
    else {
        alert("❌ Mã Key không đúng cấu trúc hoặc đã bị sử dụng!");
        return;
    }

    const now = new Date().getTime();
    keyExpirationTime = isForever ? "FOREVER" : now + (durationMinutes * 60 * 1000);

    localStorage.setItem("aop_expire", keyExpirationTime);
    localStorage.setItem("aop_label", label);

    executeActivation(label);
}

function executeActivation(label) {
    isKeyActivated = true;
    document.getElementById("lockOverlay").style.display = "none"; // MỞ KHÓA APP
    
    const statusText = document.getElementById("keyStatus");
    const vipBadge = document.getElementById("vipBadge");
    
    vipBadge.textContent = "VIP ACTIVE";
    vipBadge.className = "vip-status-badge vip-active";

    if (checkKeyInterval) clearInterval(checkKeyInterval);

    if (keyExpirationTime === "FOREVER") {
        statusText.textContent = `👑 Đã kích hoạt: ${label}`;
        statusText.className = "status-text text-success";
    } else {
        checkKeyInterval = setInterval(() => {
            const now = new Date().getTime();
            const timeLeft = keyExpirationTime - now;

            if (timeLeft <= 0) {
                clearInterval(checkKeyInterval);
                executeLockApp(); // VĂNG APP NGAY LẬP TỨC
            } else {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                statusText.textContent = `✅ ${label} (Hết hạn sau: ${hours}h ${minutes}m ${seconds}s)`;
                statusText.className = "status-text text-success";
            }
        }, 1000);
    }
    
    // Cập nhật lại thông số chuẩn theo máy ngay khi mở khóa thành công
    applyDeviceSensitivity(document.getElementById("deviceSelect").value);
}

function executeLockApp() {
    isKeyActivated = false;
    keyExpirationTime = null;

    localStorage.removeItem("aop_expire");
    localStorage.removeItem("aop_label");

    // HIỂN THỊ LẠI MÀN HÌNH KHÓA CHE PHỦ TOÀN BỘ APP
    document.getElementById("lockOverlay").style.display = "flex";
    
    const statusText = document.getElementById("keyStatus");
    const vipBadge = document.getElementById("vipBadge");

    vipBadge.textContent = "HẾT HẠN";
    vipBadge.className = "vip-status-badge";
    statusText.textContent = "❌ Hết hạn dùng thử! Vui lòng gia hạn thêm Key.";
    statusText.className = "status-text text-warning";
    document.getElementById("keyInput").value = "";

    // Reset thông số về 0
    document.getElementById("sensGeneral").value = 0;
    document.getElementById("sensRedDot").value = 0;
    document.getElementById("sens2x").value = 0;
    document.getElementById("sens4x").value = 0;
    updateUIValues();
    
    alert("⚠️ KHÓA BẢN QUYỀN: Hết hạn sử dụng Key VIP. Hệ thống đã dừng tối ưu!");
}

function autoLoadSavedKey() {
    const savedExpire = localStorage.getItem("aop_expire");
    const savedLabel = localStorage.getItem("aop_label");

    if (savedExpire) {
        if (savedExpire === "FOREVER") {
            keyExpirationTime = "FOREVER";
            executeActivation(savedLabel);
        } else {
            keyExpirationTime = parseInt(savedExpire);
            if (keyExpirationTime > new Date().getTime()) {
                executeActivation(savedLabel);
            } else {
                executeLockApp();
            }
        }
    } else {
        document.getElementById("lockOverlay").style.display = "flex"; // Khóa mặc định ban đầu
    }
}
