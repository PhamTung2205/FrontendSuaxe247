import React from "react";
import { useNavigate } from "react-router-dom";

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
      "/admin/warehouse_report",
      "/admin/stores_report",
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


function ProtectedRoute({ user, path, element }) {
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.roleName?.toLowerCase();
  const allowedPaths = rolePermissions[role] || [];

  if (!allowedPaths.includes(path.toLowerCase())) {
    window.Toast?.fire({
      icon: "error",
      title: "Bạn không có quyền truy cập trang này!",
    });

    // Giữ nguyên trang hiện tại — không navigate, không load lại
    return null;
  }

  return element;
}

export default ProtectedRoute;
