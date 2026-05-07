// serviceLogic.js - Xử lý logic cho quản lý dịch vụ
export class ServiceManager {
  constructor(API_URL) {
    this.API_URL = API_URL;
  }

  // Fetch tất cả dịch vụ từ API
  async fetchServices() {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`${this.API_URL}?t=${timestamp}`, { credentials: "include" });
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

  // Thêm dịch vụ mới
  async createService(form) {
    try {
      const formData = new FormData();
      formData.append("PK_idService", form.PK_idService);
      formData.append("serviceName", form.serviceName);
      formData.append("description", form.description);
      formData.append("estimatedPrice", form.estimatedPrice);
      formData.append("estimatedTime", form.estimatedTime);
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const res = await fetch(this.API_URL, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await res.json();
      
      if (result.status === "success") {
        return { success: true, message: "Thêm dịch vụ thành công!" };
      } else {
        return { success: false, message: result.message || "Lỗi khi thêm dịch vụ" };
      }
    } catch (err) {
      console.error("Lỗi thêm dịch vụ:", err);
      return { success: false, message: "Lỗi kết nối đến server" };
    }
  }

  // Cập nhật dịch vụ
  async updateService(serviceId, form) {
    try {
      const formData = new FormData();
      formData.append("serviceName", form.serviceName);
      formData.append("description", form.description);
      formData.append("estimatedPrice", form.estimatedPrice);
      formData.append("estimatedTime", form.estimatedTime);
      
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const res = await fetch(`${this.API_URL}/${serviceId}`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const result = await res.json();
      
      if (result.status === "success") {
        return { success: true, message: "Cập nhật dịch vụ thành công!" };
      } else {
        return { success: false, message: result.message || "Lỗi khi cập nhật" };
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      return { success: false, message: "Lỗi kết nối đến server" };
    }
  }

  // Xóa dịch vụ
  async deleteService(serviceId) {
    try {
      const res = await fetch(`${this.API_URL}/${serviceId}`, { 
        method: "DELETE",
        credentials: "include"
      });
      const result = await res.json();
      
      if (result.status === "success") {
        return { success: true, message: "Xóa dịch vụ thành công!" };
      } else {
        return { success: false, message: result.message || "Không thể xóa!" };
      }
    } catch (err) {
      console.error("Lỗi xóa dịch vụ:", err);
      return { success: false, message: "Lỗi kết nối đến server" };
    }
  }

  // Validate form dịch vụ
  validateServiceForm(form, mode = "create") {
    const errors = {};
    
    if (mode === "create" && !form.PK_idService.trim()) {
      errors.PK_idService = "Mã dịch vụ không được để trống!";
    }
    
    if (!form.serviceName.trim()) errors.serviceName = "Tên dịch vụ không được để trống!";
    if (!form.estimatedPrice) errors.estimatedPrice = "Giá dịch vụ không được để trống!";
    
    if (form.estimatedPrice && (isNaN(form.estimatedPrice) || Number(form.estimatedPrice) < 0)) {
      errors.estimatedPrice = "Giá dịch vụ phải là số và lớn hơn 0!";
    }

    if (form.estimatedTime && (isNaN(form.estimatedTime) || Number(form.estimatedTime) < 0)) {
      errors.estimatedTime = "Thời gian ước tính phải là số và lớn hơn 0!";
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

  // Filter dịch vụ
  filterServices(services, searchTerm = "", filterPrice = "") {
    let filtered = [...services];

    // Filter theo search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(service =>
        service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.PK_idService.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (service.description && service.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter theo giá
    if (filterPrice) {
      filtered = filtered.filter(service => {
        const price = service.estimatedPrice;
        switch (filterPrice) {
          case "0-100000":
            return price < 100000;
          case "100000-500000":
            return price >= 100000 && price <= 500000;
          case "500000-1000000":
            return price > 500000 && price <= 1000000;
          case "1000000":
            return price > 1000000;
          default:
            return true;
        }
      });
    }

    return filtered;
  }

  // Tính toán phân trang
  getPaginatedData(services, page, perPage) {
    const indexOfLastItem = page * perPage;
    const indexOfFirstItem = indexOfLastItem - perPage;
    const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
    
    return {
      currentItems,
      totalPages: Math.ceil(services.length / perPage),
      // currentDisplayText: services.length > 0 
      //   ? `Hiển thị ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, services.length)} trong tổng số ${services.length} dịch vụ`
      //   : 'Không có dịch vụ nào'
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

// Format price helper
export const formatPrice = (price) => {
  if (!price || isNaN(price)) return "0 VNĐ";
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

// Format price display (không có currency symbol)
export const formatPriceDisplay = (price) => {
  if (!price) return "0";
  return new Intl.NumberFormat('vi-VN').format(price);
};