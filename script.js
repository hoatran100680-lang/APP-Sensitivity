const BACKEND_API = "http://localhost:5000/api/check-key";

// Bộ thông số độ nhạy mặc định cho từng đời máy (Tối đa 200)
const deviceDatabase = {
    "ip7":  { s1: 190, s2: 185, s3: 175, s4: 170, s5: 160, s6: 180 },
    "ip8":  { s1: 180, s2: 175, s3: 165, s4: 160, s5: 150, s6: 170 },
    "ipX":  { s1: 160, s2: 155, s3: 145, s4: 140, s5: 130, s6: 150 },
    "ip11": { s1: 140, s2: 135, s3: 125, s4: 120, s5: 110, s6: 130 },
    "ip12": { s1: 120, s2: 115, s3: 105, s4: 100, s5: 90,  s6: 110 },
    "ip13": { s1: 100, s2: 92,  s3: 85,  s4: 75,  s5: 65,  s6: 90  }, // Mẫu mặc định giống ảnh
    "ip14": { s1: 95,  s2: 88,  s3: 80,  s4: 70,  s5: 60,  s6: 85  },
    "ip15": { s1: 90,  s2: 82,  s3: 75,  s4: 65,  s5: 55,  s6: 80  },
    "ip16": { s1: 85,  s2: 78,  s3: 70,  s4: 60,  s5: 50,  s6: 75  },
    "ip17": { s1: 80,  s2: 72,  s3: 65,  s4: 55,  s5: 45,  s6: 70  }
};

let mainCountdown;

function verifyKey() {
    let keyFieldValue = document.getElementById("key-input").value.trim();
    if(!keyFieldValue) return alert("Vui lòng điền mã Key!");

    fetch(BACKEND_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key_code: keyFieldValue })
    })
    .then(response => response.json())
    .then(data => {
        if(data.status === "success") {
            localStorage.setItem("current_user_key", keyFieldValue);
            localStorage.setItem("current_user_expiry", data.expiry);
            alert("🎉 Kích hoạt trực tuyến thành công!");
            openMenuDashboard(data.expiry);
        } else {
            alert("❌ Lỗi: " + data.message);
        }
    })
    .catch(() => alert("❌ Thất bại: Không thể liên kết tới Server Python!"));
}

function openMenuDashboard(expiryTimestamp) {
    document.getElementById("lock-screen").style.display = "none";
    document.getElementById("main-menu").style.display = "block";
    updateSensitivity();

    clearInterval(mainCountdown);
    
    // Hệ thống kiểm tra realtime mỗi giây, hết hạn tự động ĐÁ RA LẬP TỨC
    mainCountdown = setInterval(function() {
        let remainderTime = expiryTimestamp - Date.now();

        if(remainderTime <= 0) {
            clearInterval(mainCountdown);
            alert("⏰ ĐÃ HẾT HẠN DÙNG! Hệ thống tự động đá ra ngoài màn hình khóa.");
            logoutKey();
        } else {
            let seconds = Math.floor(remainderTime / 1000);
            let d = Math.floor(seconds / 86400);
            let h = Math.floor((seconds % 86400) / 3600);
            let m = Math.floor((seconds % 3600) / 60);
            let s = seconds % 60;

            let timeString = `${d}d - ${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            if (d > 365) timeString = "VĨNH VIỄN (VIP)";
            
            document.getElementById("key-time-display").innerText = "THỜI GIAN CÒN LẠI: " + timeString;
        }
    }, 1000);
}

// Chức năng nút Test nhanh 10 giây không cần mở Server/Discord
function runKickTest() {
    alert("🧪 Bắt đầu chế độ test nhanh: Menu sẽ mở và tự động ĐÁ bạn ra sau 10 giây nữa!");
    let testExpiry = Date.now() + (10 * 1000);
    localStorage.setItem("current_user_key", "MÃ-TEST-ẢO-10S");
    localStorage.setItem("current_user_expiry", testExpiry);
    openMenuDashboard(testExpiry);
}

function logoutKey() {
    clearInterval(mainCountdown);
    localStorage.removeItem("current_user_key");
    localStorage.removeItem("current_user_expiry");
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("lock-screen").style.display = "block";
    document.getElementById("key-input").value = "";
}

function changeVal(slider, label) {
    document.getElementById(label).innerText = document.getElementById(slider).value;
}

function updateSensitivity() {
    let currentDevice = document.getElementById("device-select").value;
    let config = deviceDatabase[currentDevice];
    if(config) {
        for(let i = 1; i <= 6; i++) {
            document.getElementById(`sens${i}`).value = config[`s${i}`];
            document.getElementById(`val${i}`).innerText = config[`s${i}`];
        }
    }
}

// Giữ đăng nhập khi F5 tải lại trang nếu key vẫn còn hạn
window.onload = function() {
    let activeKey = localStorage.getItem("current_user_key");
    let expiry = localStorage.getItem("current_user_expiry");
    
    if(activeKey && expiry) {
        if(activeKey === "MÃ-TEST-ẢO-10S" || Date.now() < parseInt(expiry)) {
            openMenuDashboard(parseInt(expiry));
        } else {
            logoutKey();
        }
    }
};
