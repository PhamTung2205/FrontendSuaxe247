import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../assets/css/AdminMenu.css";

function AdminMenu({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // 🌟 trạng thái đang load session

  const userRole = user?.roleName;
  const isActive = (path) => location.pathname === path;

  const USER_ROLES_CONFIG = {
    FULL_ACCESS: { roles: ["Admin"] },
    ALL_STAFF: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Kỹ thuật viên", "Admin"] },
    HOMEPAGE: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Kỹ thuật viên", "Admin"] },
    EMPLOYEE: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
    CUSTOMER: {roles: ["Quản lý hệ thống", "Admin"]},
    STORE: { roles: ["Quản lý hệ thống", "Admin"] },
    SEVICE: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Kỹ thuật viên", "Admin"] },
    SPARE_PART: { roles: ["Quản lý hệ thống", "Admin"] },
    SPARE_PART_CATEGORY: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
    SPARE_PART_INVENTORY: {
      label: "Tồn kho phụ tùng",
      roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Kỹ thuật viên", "Admin"]
    },
    SUPPLIER: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
    APPOINTMENT: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
    INVOICE: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Kỹ thuật viên", "Admin"] },
    IMPROT_RECEIPT: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
    BIKE: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
    STORES_REPORT: { roles: ["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
    WAREHOUSE_REPORT: { roles: [ "Quản lý hệ thống", "Quản lý cửa hàng", "Admin"] },
  };

  const menuItemsConfig = [
    { path: "/admin", label: "Trang chủ", roles: USER_ROLES_CONFIG.HOMEPAGE.roles },
    { path: "/admin/staff", label: "Nhân viên", roles: USER_ROLES_CONFIG.EMPLOYEE.roles },
    { path: "/admin/customer", label: "Khách hàng", roles: USER_ROLES_CONFIG.CUSTOMER.roles },
    { path: "/admin/store", label: "Cửa hàng", roles: USER_ROLES_CONFIG.STORE.roles },
    { path: "/admin/service", label: "Dịch vụ", roles: USER_ROLES_CONFIG.SEVICE.roles },
    { path: "/admin/spare_part_category", label: "Danh mục phụ tùng", roles: USER_ROLES_CONFIG.SPARE_PART_CATEGORY.roles },
    { path: "/admin/spare_part_inventory", label: "Tồn kho phụ tùng", roles: USER_ROLES_CONFIG.SPARE_PART_INVENTORY.roles.concat(USER_ROLES_CONFIG.SPARE_PART_INVENTORY.roles) },
    { path: "/admin/spare_part", label: "Phụ tùng", roles: USER_ROLES_CONFIG.SPARE_PART.roles },
    { path: "/admin/supplier", label: "Nhà cung cấp", roles: USER_ROLES_CONFIG.SUPPLIER.roles },
    { path: "/admin/appointment", label: "Lịch hẹn", roles: USER_ROLES_CONFIG.APPOINTMENT.roles },
    // { path: "/admin/Bike", label: "Xe", roles: USER_ROLES_CONFIG.BIKE.roles },
    { path: "/admin/invoice", label: "Hóa đơn", roles: USER_ROLES_CONFIG.INVOICE.roles },
    { path: "/admin/import_receipt", label: "Phiếu nhập kho", roles: USER_ROLES_CONFIG.IMPROT_RECEIPT.roles },
    { path: "/admin/warehouse_report", label: "Báo cáo xuất nhập kho", roles: USER_ROLES_CONFIG.WAREHOUSE_REPORT.roles },
    { path: "/admin/stores_report", label: "Báo cáo HĐ cửa hàng", roles: USER_ROLES_CONFIG.STORES_REPORT.roles },

  ];

  const filteredMenuItems = menuItemsConfig.filter(
    (item) => userRole && item.roles.includes(userRole)
  );

  // 🔹 Kiểm tra session khi mount AdminMenu
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(
          "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session",
          { method: "GET", credentials: "include" }
        );
        const data = await res.json();
        if (data.status === "success") setUser(data.user);
        else setUser(null);
      } catch (err) {
        console.error("Lỗi khi check session:", err);
        setUser(null);
      } finally {
        setLoading(false); // 🌟 kết thúc load
      }
    };

    fetchSession();
  }, [setUser]);

  const handleLogout = async () => {
    try {
      const res = await fetch(
        "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/logout",
        { method: "POST", credentials: "include" }
      );
      const data = await res.json();
      if (data.status === "success") {
        window.Toast?.fire({ icon: "success", title: "Đăng xuất thành công!" });
        setUser(null);
        navigate("/login");
      } else {
        window.Toast?.fire({ icon: "error", title: data.message || "Đăng xuất thất bại!" });
      }
    } catch (err) {
      console.error(err);
      window.Toast?.fire({ icon: "error", title: "Không thể kết nối đến server" });
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: "250px", height: "100vh" }}>
        <div className="text-center mt-5">Đang tải menu...</div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: "250px", height: "100vh" }}>
      <Link to="/Admin" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-5">Admin Panel</span>
      </Link>
      <hr />
      <div className="flex-grow-1 overflow-auto sidebar-scroll">
        <ul className="nav nav-pills flex-column mb-3">
          {filteredMenuItems.map((item, idx) => (
            <li key={idx}>
              <Link to={item.path} className={`nav-link text-white ${isActive(item.path) ? "active bg-secondary" : ""}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <hr />
      <div className="dropdown mt-auto">
        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
          <i className="bi bi-person-circle me-2"></i>
          <strong>{user?.fullName}</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
          <li><Link className="dropdown-item" to="/profile">Thông tin cá nhân</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li><Link className="dropdown-item" to="/">Về trang chính</Link></li>
          <li><button className="dropdown-item" onClick={handleLogout}>Đăng xuất</button></li>
        </ul>
      </div>
    </div>
  );
}

export default AdminMenu;
