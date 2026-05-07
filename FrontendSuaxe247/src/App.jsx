import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import ProtectedRoute from "./components/ProtectedRoute";
import CronEmailSender from './components/CronEmailSender';
import FloatingButtons from './components/FloatingButtons'; 

function ProtectedAdminLayout({ user, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [hasWarned, setHasWarned] = useState(false);

  if (!user) return null;

  const role = user.roleName?.toLowerCase();
  const path = location.pathname.toLowerCase();

  // 🔹 Danh sách quyền cho từng vai trò
  const rolePermissions = {
    "admin": [
      "/admin",
      "/admin/staff",
      "/admin/customer",
      "/admin/store",
      "/admin/service",
      "/admin/spare_part_category",
      "/admin/spare_part_inventory",
      "/admin/spare_part",
      "/admin/supplier",
      "/admin/appointment",
      "/admin/invoice",
      "/admin/import_receipt",
    ],
    "quản lý hệ thống": [
      "/admin",
      "/admin/staff",
      "/admin/customer",
      "/admin/store",
      "/admin/service",
      "/admin/spare_part_category",
      "/admin/spare_part_inventory",
      "/admin/spare_part",
      "/admin/supplier",
      "/admin/appointment",
      "/admin/invoice",
      "/admin/import_receipt",
      "/admin/warehouse_report",
      "/admin/stores_report",
    ],
    "quản lý cửa hàng": [
      "/admin",
      "/admin/staff",
      "/admin/service",
      "/admin/spare_part_category",
      "/admin/spare_part_inventory",
      "/admin/supplier",
      "/admin/appointment",
      "/admin/invoice",
      "/admin/import_receipt",
      "/admin/stores_report",
      "/admin/warehouse_report",
    ],
    "kỹ thuật viên": [
      "/admin",
      "/admin/service",
      "/admin/spare_part_inventory",
      "/admin/invoice",
      "/admin/appointment",
    ],
    "khách hàng": [
      "/profile",
      "/repair_history",
      "/booking",
    ],
  };


  const allowedPaths = rolePermissions[role] || [];

  // ❌ Nếu không có quyền truy cập
  if (path.startsWith("/admin") && !allowedPaths.includes(path)) {
    if (!hasWarned) {
      setHasWarned(true);

      // Hiển thị thông báo
      window.Toast?.fire({
        icon: "error",
        title: "Bạn không có quyền truy cập trang này!",
      });

      // Sau 1 giây tự động quay lại trang trước hoặc về trang chủ
      setTimeout(() => {
        if (window.history.state && window.history.state.idx > 0) {
          navigate(-1); // quay lại trang trước
        } else {
          navigate("/"); // về trang chủ
        }
      }, 1000);
    }

    return null; // không render layout admin
  }

  // ✅ Có quyền thì render bình thường
  return children;
}


// Components
import Menu from './components/Menu';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import OutStore from './pages/Store';
import Service from './pages/Service';
import Booking from './pages/Booking';
import Rescue from './pages/Rescue';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import RepairHistory from './pages/RepairHistory';

// Admin layout & pages
import AdminLayout from './layouts/AdminLayout';
import Store from './pages/Admin/QLThongTin/Store';
import Spare_Part from './pages/Admin/QLDanhmuckho/Spare_Part';
import Spare_Part_Category from './pages/Admin/QLDanhmuckho/Spare_Part_Category';
import Spare_Part_Inventory from './pages/Admin/QLDanhmuckho/Spare_Part_Inventory';
import Supplier from './pages/Admin/QLDanhmuckho/Supplier';
import Bike from './pages/Admin/QLDatLich/Bike';
import ServiceAdmin from './pages/Admin/QLThongTin/Service';
import Improt_Receipt from './pages/Admin/QLHDCuahang/Import_Receipt';
import Appointment from './pages/Admin/QLDatLich/Appointment';
import Invoice from './pages/Admin/QLHDCuahang/Invoice';
import Stores_Report from './pages/Admin/QLBaocao/Stores_Report';
import Warehouse_Report from './pages/Admin/QLBaocao/Warehouse_Report';
import Staff from './pages/Admin/QLNguoidung/Staff';
import Customer from './pages/Admin/QLNguoidung/Customer';



function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // 🌟 state user chung
  const isAdmin = location.pathname.toLowerCase().startsWith("/admin");

  // 🔹 Kiểm tra session khi load Layout
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch(
          "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session",
          { method: "GET", credentials: "include" }
        );

        const data = await res.json();

        if (data.status === "success") {
          setUser(data.user);
        } else {
          setUser(null);
          const publicRoutes = ["/", "/store", "/service", "/rescue", "/login", "/register"];
          if (!publicRoutes.includes(location.pathname.toLowerCase())) {
            navigate("/login");
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra session:", error);
        setUser(null);
        navigate("/login");
      }
    };

    checkSession();
  }, [location.pathname, navigate]);


  if (isAdmin) {
    // Admin layout
    return (
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedAdminLayout user={user}>
              <AdminLayout user={user} setUser={setUser} />
            </ProtectedAdminLayout>
          }
        >

          <Route index element={<Admin />} />
          <Route
            path="staff"
            element={
              <ProtectedRoute
                user={user}
                path="/admin/staff"
                element={<Staff />}
              />
            }
  /><Route path="staff" element={<Staff />} />
          <Route path="customer" element={<Customer />} />
          <Route path="store" element={<Store />} />
          <Route path="service" element={<ServiceAdmin />} />
          <Route path="spare_part" element={<Spare_Part />} />
          <Route path="spare_part_category" element={<Spare_Part_Category />} />
          <Route path="spare_part_inventory" element={<Spare_Part_Inventory />} />
          <Route path="supplier" element={<Supplier />} />
          <Route path="appointment" element={<Appointment />} />
          <Route path="bike" element={<Bike />} />
          <Route path="import_receipt" element={<Improt_Receipt />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="stores_report" element={<Stores_Report />} />
          <Route path="warehouse_report" element={<Warehouse_Report />} />
          <Route
            path="*"
            element={
              <div className="container mt-4">
                <h1>404 - Không tìm thấy trang</h1>
                <p>Trang bạn tìm kiếm không tồn tại.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    );
  }

  // Layout mặc định
  return (
    <div className="App d-flex flex-column min-vh-100">
      <Menu user={user} setUser={setUser} /> {/* 🌟 truyền user + setUser */}

      
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<OutStore />} />
          <Route path="/service" element={<Service />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/rescue" element={<Rescue />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/repair_history" element={<RepairHistory user={user} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="*"
            element={
              <div className="container mt-4">
                <h1>404 - Không tìm thấy trang</h1>
                <p>Trang bạn tìm kiếm không tồn tại.</p>
              </div>
            }
          />
        </Routes>
         <FloatingButtons />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
      {/* Gọi request gửi email định kỳ */}
      <CronEmailSender />
    </Router>
  );
}

export default App;
