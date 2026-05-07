import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import "../assets/css/Menu.css";

function Menu({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // 🌟 trạng thái đang load session
  const offcanvasRef = useRef();

  // Đóng offcanvas khi click link (luôn lấy instance mới nhất)
  const closeOffcanvas = () => {
    setTimeout(() => {
      const el = document.getElementById("menuOffcanvas");
      if (el && window.bootstrap) {
        const bsOffcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(el);
        bsOffcanvas.hide();
      }
    }, 0);
  };

  // 🔹 Kiểm tra session khi mount Menu
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

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      const res = await fetch(
        "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/logout",
        { method: "POST", credentials: "include" }
      );

      if (!res.ok) throw new Error("Server trả về lỗi " + res.status);

      const data = await res.json();

      if (data.status === "success") {
        window.Toast?.fire({
          icon: "success",
          title: "Đăng xuất thành công!",
        });
        setUser(null);
        navigate("/login");
      } else {
        window.Toast?.fire({
          icon: "error",
          title: data.message || "Đăng xuất thất bại!",
        });
      }
    } catch (err) {
      console.error("Chi tiết lỗi logout:", err);
      window.Toast?.fire({
        icon: "error",
        title: "Không thể kết nối đến server",
      });
    }
  };

  const isActive = (path) => location.pathname === path;

  // 🌟 Nếu đang load session, hiển thị placeholder
  if (loading) {
    return (
      <nav className="navbar navbar-custom py-3">
        <div className="container text-center">Đang tải...</div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-custom py-3">
      <div className="container-fluid d-flex justify-content-between align-items-center px-4">
        {/* Nút mở offcanvas cho mobile - icon menu màu đen, không background */}
        <button
          className="border-0 bg-transparent d-lg-none"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#menuOffcanvas"
          aria-controls="menuOffcanvas"
          style={{ padding: 0, marginRight: "12px" }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect y="5" width="24" height="2" rx="1" fill="#222" />
            <rect y="11" width="24" height="2" rx="1" fill="#222" />
            <rect y="17" width="24" height="2" rx="1" fill="#222" />
          </svg>
        </button>

        {/* Logo */}
        <Link className="navbar-brand me-3" to="/">
          <img src="/assets/logo-full.png" alt="logo" height="40" />
        </Link>

        {/* Menu chính cho desktop */}
        <ul className="navbar-nav d-none d-lg-flex flex-row gap-5 mx-auto fw-bold text-dark">
          <li className="nav-item">
            <Link className={`nav-link menu-user ${isActive("/") ? "active" : ""}`} to="/">
              TRANG CHỦ
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link menu-user ${isActive("/store") ? "active" : ""}`} to="/store">
              CỬA HÀNG
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link menu-user ${isActive("/service") ? "active" : ""}`} to="/service">
              DỊCH VỤ
            </Link>
          </li>
          {user && (
            <li className="nav-item">
              <Link className={`nav-link menu-user ${isActive("/booking") ? "active" : ""}`} to="/booking">
                ĐẶT LỊCH
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link className={`nav-link menu-user ${isActive("/rescue") ? "active" : ""}`} to="/rescue">
              CỨU HỘ XE MÁY
            </Link>
          </li>
          {user && user.role !== "4" && (
            <li className="nav-item">
              <Link className={`nav-link menu-user ${isActive("/admin") ? "active" : ""}`} to="/admin">
                Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Góc phải desktop */}
        <div className="d-none d-lg-flex gap-2">
          {!user ? (
            <>
              <Link className="btn btn-dark" to="/login">
                Đăng nhập
              </Link>
              <Link className="btn btn-outline-dark" to="/register">
                Đăng ký
              </Link>
            </>
          ) : (
            <div className="dropdown">
              <button
                className="btn btn-dark dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {user.fullName}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    Thông tin cá nhân
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/repair_history">
                    Lịch sử sửa chữa
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Offcanvas cho mobile - chuyển sang trái */}
        <div
          className="offcanvas offcanvas-start d-lg-none"
          tabIndex="-1"
          id="menuOffcanvas"
          ref={offcanvasRef}
          aria-labelledby="menuOffcanvasLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="menuOffcanvasLabel">
              Menu
            </h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav flex-column fw-bold text-dark">
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/") ? "active" : ""}`} to="/" onClick={closeOffcanvas}>
                  TRANG CHỦ
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/store") ? "active" : ""}`} to="/store" onClick={closeOffcanvas}>
                  CỬA HÀNG
                </Link>
              </li>
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/service") ? "active" : ""}`} to="/service" onClick={closeOffcanvas}>
                  DỊCH VỤ
                </Link>
              </li>
              {user && (
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/booking") ? "active" : ""}`} to="/booking" onClick={closeOffcanvas}>
                    ĐẶT LỊCH
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <Link className={`nav-link ${isActive("/rescue") ? "active" : ""}`} to="/rescue" onClick={closeOffcanvas}>
                  CỨU HỘ XE MÁY
                </Link>
              </li>
              {user && user.role !== "4" && (
                <li className="nav-item">
                  <Link className={`nav-link ${isActive("/admin") ? "active" : ""}`} to="/admin" onClick={closeOffcanvas}>
                    Admin
                  </Link>
                </li>
              )}
            </ul>
            <hr />
            {/* Góc phải mobile */}
            <div className="d-flex flex-column gap-2">
              {!user ? (
                <>
                  <Link className="btn btn-dark" to="/login" onClick={closeOffcanvas}>
                    Đăng nhập
                  </Link>
                  <Link className="btn btn-outline-dark" to="/register" onClick={closeOffcanvas}>
                    Đăng ký
                  </Link>
                </>
              ) : (
                <>
                  <Link className="btn btn-outline-dark" to="/profile" onClick={closeOffcanvas}>
                    Thông tin cá nhân
                  </Link>
                  <Link className="btn btn-outline-dark" to="/repair_history" onClick={closeOffcanvas}>
                    Lịch sử sửa chữa
                  </Link>
                  <button className="btn btn-dark mt-2" onClick={() => { closeOffcanvas(); handleLogout(); }}>
                    Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Menu;
