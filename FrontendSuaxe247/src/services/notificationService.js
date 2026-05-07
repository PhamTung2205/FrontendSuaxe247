/**
 * 🔹 Hiển thị thông báo thành công
 * @param {string} msg - Nội dung thông báo
 */
export const showSuccess = (msg = "Thành công!") => {
  if (window.Toast) {
    window.Toast.fire({ 
      icon: "success", 
      title: msg 
    });
  } else {
    console.log("✅ SUCCESS:", msg);
    alert(`SUCCESS: ${msg}`);
  }
};

/**
 * 🔹 Hiển thị thông báo lỗi
 * @param {string} msg - Nội dung thông báo
 */
export const showError = (msg = "Có lỗi xảy ra!") => {
  if (window.Toast) {
    window.Toast.fire({ 
      icon: "error", 
      title: msg 
    });
  } else {
    console.error("❌ ERROR:", msg);
    alert(`ERROR: ${msg}`);
  }
};

/**
 * 🔹 Hiển thị thông báo cảnh báo
 * @param {string} msg - Nội dung thông báo
 */
export const showWarning = (msg = "Cảnh báo!") => {
  if (window.Toast) {
    window.Toast.fire({ 
      icon: "warning", 
      title: msg 
    });
  } else {
    console.warn("⚠️ WARNING:", msg);
    alert(`WARNING: ${msg}`);
  }
};

/**
 * 🔹 Hiển thị thông báo thông tin
 * @param {string} msg - Nội dung thông báo
 */
export const showInfo = (msg = "Thông tin") => {
  if (window.Toast) {
    window.Toast.fire({ 
      icon: "info", 
      title: msg 
    });
  } else {
    console.info("ℹ️ INFO:", msg);
    alert(`INFO: ${msg}`);
  }
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo
};