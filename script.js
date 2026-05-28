// Thay IP localhost thành IP VPS/Máy chủ của bạn khi treo online
const API_URL = "http://127.0.0.1:8000";

// Dữ liệu cấu hình độ nhạy riêng biệt cho từng dòng máy từ iPhone 7 đến iPhone 17
const deviceDatabase = {
    "iPhone 7/8":       { look: 80,  red: 70, x2: 65, x4: 55, awm: 45, free: 75 },
    "iPhone 7+/8+":     { look: 82,  red: 72, x2: 68, x4: 58, awm: 48, free: 78 },
    "iPhone X/XR":      { look: 88,  red: 78, x2: 72, x4: 62, awm: 52, free: 82 },
    "iPhone XS/XS Max": { look: 90,  red: 80, x2: 75, x4: 65, awm: 55, free: 85 },
    "iPhone 11 Series": { look: 92,  red: 84, x2: 78, x4: 68, awm: 58, free: 88 },
    "iPhone 12 Pro":    { look: 94,  red: 86, x2: 80, x4: 70, awm: 60, free: 90 },
    "iPhone 13 Pro":    { look: 100, red: 92, x2: 85, x4: 75, awm: 65, free: 90 }, // Khớp 100% hình mẫu
    "iPhone 14 Pro":    { look: 100, red: 94, x2: 88, x4: 78, awm: 68, free: 92 },
    "iPhone 15 Pro":    { look: 100, red: 96, x2: 90, x4: 80, awm: 70, free: 94 },
    "iPhone 16 Pro":    { look: 100, red: 98, x2: 92, x4: 82, awm: 72, free: 96 },
    "iPhone 17 Pro":    { look: 100, red: 100,x2: 95, x4: 85, awm: 75, free: 98 }
};

const sliderConfigs = [
    { id: "look", label: "Nhìn Xung Quanh", sub: "Quay camera" },
    { id: "red",  label: "Red Dot / Ống Ngắm", sub: "Ngắm tâm chuẩn" },
    { id: "x2",   label: "Ống Ngắm 2x", sub: "Zoom 2x" },
    { id: "x4",   label: "Ống Ngắm 4x", sub: "Zoom 4x" },
    { id: "awm",  label: "Ống Ngắm AWM", sub: "Sniper tối ưu" },
    { id: "free", label: "Nhìn Tự Do", sub: "Quan sát tự do" }
];

let syncInterval = null;
let remainingSeconds = 0;
let isVinhVien = false;

window.onload = function() {
    const select = document.getElementById("device-select");
    Object.keys(deviceDatabase).forEach(device => {
        let opt = document.createElement("option");
        opt.value = device; opt.innerText = device;
        if(device === "iPhone 13 Pro") opt.selected = true;
        select.appendChild(opt);
    });
    buildSliders();
    changeDevice();
    checkLocalSession(); 
};

function buildSliders() {
    const container = document.getElementById("sliders-container");
    container.innerHTML = "";
    sliderConfigs.forEach(cfg => {
        container.innerHTML += `
            <div class="slider-item">
                <div class="slider-info"><b>${cfg.label}</b><span>${cfg.sub}</span></div>
                <div class="slider-wrapper">
                    <input type="range" id="range-${cfg.id}" min="0" max="100" oninput="updateVal('${cfg.id}')">
                    <button class="btn-step" onclick="step('${cfg.id}', -1)">-</button>
                    <span class="slider-val" id="val-${cfg.id}">0</span>
                    <button class="btn-step" onclick="step('${cfg.id}', 1)">+</button>
                </div>
            </div>`;
    });
}

function updateVal(id) { document.getElementById(`val-${id}`).innerText = document.getElementById(`range-${id}`).value; }
function step(id, amount) { 
    let input = document.getElementById(`range-${id}`); 
    input.value = Math.max(0, Math.min(100, parseInt(input.value) + amount)); 
    updateVal(id); 
}

function changeDevice() {
    let device = document.getElementById("device-select").value;
    let data = deviceDatabase[device];
    if(data) { sliderConfigs.forEach(cfg => { document.getElementById(`range-${cfg.id}`).value = data[cfg.id]; updateVal(cfg.id); }); }
}

function setPreset(type) {
    document.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active'));
    event.currentTarget.classList.add('active');
    if(type === 'coban') { sliderConfigs.forEach(cfg => { document.getElementById(`range-${cfg.id}`).value = 50; updateVal(cfg.id); }); } else { changeDevice(); }
}

function resetSliders() { changeDevice(); }
function applySettings() { alert("Đã áp dụng độ nhạy đám mây thành công!"); }

// KÍCH HOẠT VÀ ĐỒNG BỘ VỚI SERVER API
function verifyKey() {
    const inputKey = document.getElementById("key-input").value.trim();
    const msg = document.getElementById("lock-msg");

    if(!inputKey) { msg.innerText = "Vui lòng nhập mã Key!"; return; }
    msg.innerText = "🔄 Đang xác thực dữ liệu qua API...";

    fetch(`${API_URL}/verify-key?key=${encodeURIComponent(inputKey)}`)
    .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.detail); }); return res.json(); })
    .then(data => {
        localStorage.setItem("aop_active_key", inputKey);
        if (data.type === "vinhvien") { isVinhVien = true; remainingSeconds = 0; } 
        else { isVinhVien = false; remainingSeconds = data.remaining; }
        enterApp();
    })
    .catch(err => { msg.innerText = "❌ " + err.message; });
}

function enterApp() {
    document.getElementById("lock-screen").classList.add("hidden");
    document.getElementById("main-menu").classList.remove("hidden");
    if (syncInterval) clearInterval(syncInterval);
    if (isVinhVien) {
        document.getElementById("countdown").innerText = "VĨNH VIỄN";
        document.getElementById("countdown").style.color = "#ffd600";
    }
    startRealtimeSync();
}

// THEO DÕI REALTIME PHIÊN SỬ DỤNG (PING MỖI 3 GIÂY)
function startRealtimeSync() {
    updateClockDisplay();
    syncInterval = setInterval(() => {
        const activeKey = localStorage.getItem("aop_active_key");
        if (!activeKey) { kickUserOut("Hệ thống yêu cầu đăng nhập."); return; }

        fetch(`${API_URL}/verify-key?key=${encodeURIComponent(activeKey)}`)
        .then(res => { if (!res.ok) return res.json().then(e => { throw new Error(e.detail); }); return res.json(); })
        .then(data => { if (data.type !== "vinhvien") { remainingSeconds = data.remaining; updateClockDisplay(); } })
        .catch(err => { kickUserOut(err.message); }); // Bị Admin xóa key hoặc hết hạn sẽ nhảy thẳng vào đây
    }, 3000);
}

function updateClockDisplay() {
    if (isVinhVien) return;
    let hrs = Math.floor(remainingSeconds / 3600);
    let mins = Math.floor((remainingSeconds % 3600) / 60);
    let secs = remainingSeconds % 60;
    document.getElementById("countdown").innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function kickUserOut(reason) {
    clearInterval(syncInterval);
    localStorage.removeItem("aop_active_key");
    document.getElementById("main-menu").classList.add("hidden");
    document.getElementById("lock-screen").classList.remove("hidden");
    document.getElementById("lock-msg").innerText = `⚠️ Thiết bị đã bị đá: ${reason}`;
    alert(`Thông báo: ${reason}`);
}

function checkLocalSession() {
    const activeKey = localStorage.getItem("aop_active_key");
    if (activeKey) { document.getElementById("key-input").value = activeKey; verifyKey(); }
}
