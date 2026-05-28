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

// --- HỆ THỐNG GIẢI MÃ KIỂM TRA CHẶN KEY CŨ ---
function checkKeyVIP() {
    const key = document.getElementById("keyInput").value.trim().toUpperCase();
    const now = new Date().getTime();
    
    if (!key) {
        alert("Vui lòng nhập mã Key!");
        return;
    }

    // Tách phần mốc thời gian được mã hóa ở đuôi Key
    const parts = key.split("_TS_");
    if (parts.length !== 2) {
        alert("❌ Mã Key sai cấu trúc hoặc không hợp lệ!");
        return;
    }

    const keyTypeAndRand = parts[0];
    const encodedTimestamp = parts[1]; // Đây là mốc thời gian hết hạn từ Admin cấp

    let label = "";
    if (keyTypeAndRand.startsWith("KEY_1MIN")) label = "Gói Test 1 Phút";
    else if (keyTypeAndRand.startsWith("KEY_1DAY")) label = "Gói VIP 1 Ngày";
    else if (keyTypeAndRand.startsWith("KEY_7DAY")) label = "Gói VIP 7 Ngày";
    else if (keyTypeAndRand.startsWith("KEY_30DAY")) label = "Gói VIP 30 Ngày";
    else if (keyTypeAndRand.startsWith("KEY_FOREVER")) label = "Gói VĨNH VIỄN";
    else {
        alert("❌ Định dạng gói không đúng!");
        return;
    }

    // Xác định mốc hết hạn
    if (encodedTimestamp === "FOREVER") {
        keyExpirationTime = "FOREVER";
    } else {
        // Chuyển chuỗi timestamp ngược lại thành số miligiây
        keyExpirationTime = parseInt(encodedTimestamp) * 1000;
        
        // KIỂM TRA CHIẾN THUẬT: Nếu thời gian hiện tại lớn hơn mốc này -> KEY CŨ ĐÃ HẾT HẠN
        if (now >= keyExpirationTime) {
            alert("❌ KÍCH HOẠT THẤT BẠI: Mã Key này đã hết hạn sử dụng từ trước. Không thể tái nhập!");
            executeLockApp();
            return;
        }
    }

    // Nếu vượt qua kiểm tra, lưu trạng thái và kích hoạt
    localStorage.setItem("aop_expire", keyExpirationTime);
    localStorage.setItem("aop_label", label);
    executeActivation(label);
}

function executeActivation(label) {
    isKeyActivated = true;
    document.getElementById("lockOverlay").style.display = "none";
    
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
                executeLockApp();
            } else {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                statusText.textContent = `✅ ${label} (Hết hạn sau: ${hours}h ${minutes}m ${seconds}s)`;
                statusText.className = "status-text text-success";
            }
        }, 1000);
    }
    applyDeviceSensitivity(document.getElementById("deviceSelect").value);
}

function executeLockApp() {
    isKeyActivated = false;
    keyExpirationTime = null;

    localStorage.removeItem("aop_expire");
    localStorage.removeItem("aop_label");

    document.getElementById("lockOverlay").style.display = "flex";
    
    const statusText = document.getElementById("keyStatus");
    const vipBadge = document.getElementById("vipBadge");

    vipBadge.textContent = "HẾT HẠN";
    vipBadge.className = "vip-status-badge";
    statusText.textContent = "❌ Key hết hạn! Hãy mua mã mới.";
    statusText.className = "status-text text-warning";
    document.getElementById("keyInput").value = "";

    document.getElementById("sensGeneral").value = 0;
    document.getElementById("sensRedDot").value = 0;
    document.getElementById("sens2x").value = 0;
    document.getElementById("sens4x").value = 0;
    updateUIValues();
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
        document.getElementById("lockOverlay").style.display = "flex";
    }
}
