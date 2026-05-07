// storeLogic.js - Xử lý logic cho quản lý cửa hàng
export class StoreManager {
  constructor(API_URL) {
    this.API_URL = API_URL;
  }

  // Fetch tất cả cửa hàng từ API
  async fetchStores() {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`${this.API_URL}?t=${timestamp}`);
      const result = await res.json();
      
      if (result.status === "success") {
        return { success: true, data: result.data };
      } else {
        return { success: false, message: result.message || "Lỗi khi tải dữ liệu" };
      }
    } catch (err) {
      console.error("Fetch error:", err);
      return { success: false, message: "Lỗi kết nối đến server" };
    }
  }

  // Thêm cửa hàng mới
  async createStore(form) {
    try {
      const formData = new FormData();
      formData.append("PK_idStore", form.PK_idStore);
      formData.append("address", form.address);
      formData.append("phone", form.phone);
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const res = await fetch(this.API_URL, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      
      if (result.status === "success") {
        return { success: true, message: "Thêm cửa hàng thành công!" };
      } else {
        return { success: false, message: result.message || "Lỗi khi thêm cửa hàng" };
      }
    } catch (err) {
      console.error("Lỗi thêm cửa hàng:", err);
      return { success: false, message: "Lỗi kết nối đến server" };
    }
  }

  // Cập nhật cửa hàng
  async updateStore(storeId, form) {
    try {
      const formData = new FormData();
      formData.append("address", form.address);
      formData.append("phone", form.phone);
      
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const res = await fetch(`${this.API_URL}/${storeId}`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      
      if (result.status === "success") {
        return { success: true, message: "Cập nhật cửa hàng thành công!" };
      } else {
        return { success: false, message: result.message || "Lỗi khi cập nhật" };
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      return { success: false, message: "Lỗi kết nối đến server" };
    }
  }

  // Xóa cửa hàng
  async deleteStore(storeId) {
    try {
      const res = await fetch(`${this.API_URL}/${storeId}`, { 
        method: "DELETE" 
      });
      const result = await res.json();
      
      if (result.status === "success") {
        return { success: true, message: "Xóa cửa hàng thành công!" };
      } else {
        return { success: false, message: result.message || "Không thể xóa!" };
      }
    } catch (err) {
      console.error("Lỗi xóa cửa hàng:", err);
      return { success: false, message: "Lỗi kết nối đến server" };
    }
  }

  // Validate form
  validateForm(form, mode = "create") {
    const errors = {};
    
    if (mode === "create" && !form.PK_idStore.trim()) {
      errors.PK_idStore = "Mã cửa hàng không được để trống!";
    }
    
    if (!form.address.trim()) errors.address = "Địa chỉ không được để trống!";
    if (!form.phone.trim()) errors.phone = "Số điện thoại không được để trống!";
    
    const phoneRegex = /^[0-9]{10,11}$/;
    if (form.phone && !phoneRegex.test(form.phone)) {
      errors.phone = "Số điện thoại phải có 10-11 chữ số!";
    }

    if (form.imageFile) {
      if (!["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(form.imageFile.type)) {
        errors.imageFile = "Chỉ chấp nhận file ảnh (JPEG, PNG, JPG, GIF)!";
      }
      if (form.imageFile.size > 5 * 1024 * 1024) {
        errors.imageFile = "Kích thước ảnh tối đa 5MB!";
      }
    }

    return errors;
  }

  // Tính toán phân trang
  getPaginatedData(stores, page, perPage) {
    const indexOfLastItem = page * perPage;
    const indexOfFirstItem = indexOfLastItem - perPage;
    const currentItems = stores.slice(indexOfFirstItem, indexOfLastItem);
    
    return {
      currentItems,
      totalPages: Math.ceil(stores.length / perPage),
      // currentDisplayText: stores.length > 0 
      //   ? `Hiển thị ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, stores.length)} trong tổng số ${stores.length} cửa hàng`
      //   : 'Không có cửa hàng nào'
    };
  }

  // Lấy số trang hiển thị
  getPageNumbers(currentPage, totalPages) {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }
}

// Helper functions
export const showToast = (icon, title) => {
  if (window.Toast) {
    window.Toast.fire({ icon, title });
  } else {
    alert(`${icon}: ${title}`);
  }
};

// Image URL helper
export const getImageUrl = (imageURL) => {
  return `http://localhost/Suaxe247Backend/BackendSuaxe247/public${imageURL}?t=${new Date().getTime()}`;
};