import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  validateEmail,
  validatePhone,
  validatePassword,
  confirmPassword,
} from "../assets/js/Register";

export default function Register() {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fullName = form.resFullName.value.trim();
    const email = form.resEmail.value.trim();
    const phone = form.resPhone.value.trim();
    const password = form.resPassword.value;
    const rePassword = form.resRePassword.value;

    let newErrors = {};

    if (!fullName) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!validateEmail(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!validatePhone(phone)) {
      newErrors.phone = "Số điện thoại phải gồm 10 chữ số";
    }

    if (!validatePassword(password)) {
      newErrors.password =
        "Mật khẩu phải ≥ 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt";
    }

    if (!confirmPassword(password, rePassword)) {
      newErrors.rePassword = "Mật khẩu nhập lại không khớp";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await fetch(
          "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, email, phone, password }),
          }
        );

        const data = await res.json();

        if (res.ok && data.status === "success") {
          window.Toast.fire({
            icon: "success",
            title: data.message || "Đăng ký thành công!",
          });
          setTimeout(() => {
            navigate("/login"); // dùng react-router
          }, 1000);
        } else {
          window.Toast.fire({
            icon: "error",
            title: data.message || "Đăng ký thất bại!",
          });
        }
      } catch (err) {
        console.error("Register error:", err);
        window.Toast.fire({
          icon: "error",
          title: "Không thể kết nối đến server!",
        });
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-4 my-3" style={{ width: "450px" }}>
        <h4 className="text-center mb-3">Đăng ký tài khoản</h4>

        <form onSubmit={handleSubmit} className="px-4">
          <div className="mb-2">
            <label className="form-label">Họ tên</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập họ tên"
              id="resFullName"
              name="resFullName"
            />
            {errors.fullName && <p className="text-danger m-0">{errors.fullName}</p>}
          </div>

          <div className="mb-2">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Nhập email"
              id="resEmail"
              name="resEmail"
            />
            {errors.email && <p className="text-danger m-0">{errors.email}</p>}
          </div>

          <div className="mb-2">
            <label className="form-label">Số điện thoại</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Nhập số điện thoại"
              id="resPhone"
              name="resPhone"
            />
            {errors.phone && <p className="text-danger m-0">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="form-label">Mật khẩu</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pe-5" // pe-5 để chừa chỗ cho icon
                placeholder="Nhập mật khẩu"
                id="resPassword"
                name="resPassword"
              />
              <i
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            {errors.password && <p className="text-danger m-0">{errors.password}</p>}
          </div>

          {/* Re-enter Password */}
          <div className="mb-3">
            <label className="form-label">Nhập lại mật khẩu</label>
            <div className="position-relative">
              <input
                type={showRePassword ? "text" : "password"}
                className="form-control pe-5"
                placeholder="Nhập lại mật khẩu"
                id="resRePassword"
                name="resRePassword"
              />
              <i
                className={`bi ${showRePassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                style={{ cursor: "pointer" }}
                onClick={() => setShowRePassword(!showRePassword)}
              ></i>
            </div>
            {errors.rePassword && <p className="text-danger m-0">{errors.rePassword}</p>}
          </div>


          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-dark">Đăng ký</button>
          </div>
        </form>

        <div className="text-center mt-3">
          <span>Đã có tài khoản? </span>
          <Link to="/login" className="text-red">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
