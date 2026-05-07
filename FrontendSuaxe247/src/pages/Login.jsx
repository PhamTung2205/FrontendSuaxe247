import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateLogin } from "../assets/js/Login";

export default function Login({ setUser }) { // 🌟 nhận setUser từ Layout/App
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailPhone = e.target.liEmailPhone.value;
    const password = e.target.liPassword.value;

    const newErrors = validateLogin(emailPhone, password);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // 🔹 Login
        const res = await fetch(
          "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier: emailPhone, password }),
            credentials: "include",
          }
        );

        const data = await res.json();

        if (data.status === "success") {
          // 🔹 Lấy thông tin session
          const sessionRes = await fetch(
            "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session",
            { method: "GET", credentials: "include" }
          );
          const sessionData = await sessionRes.json();

          if (sessionData?.status === "success") {
            // 🌟 Cập nhật user vào state chung
            setUser(sessionData.user);

            window.Toast.fire({
              icon: "success",
              title: `Đăng nhập thành công. Xin chào, ${sessionData.user.fullName}!`,
            });

            navigate("/"); // chuyển về trang chủ
          } else {
            window.Toast.fire({
              icon: "error",
              title: "Không lấy được thông tin user từ session",
            });
          }
        } else {
          window.Toast.fire({
            icon: "error",
            title: data.message || "Đăng nhập thất bại. Sai Email/SĐT hoặc mật khẩu",
          });
        }
      } catch (err) {
        window.Toast.fire({
          icon: "error",
          title: err.message || "Lỗi server",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center bg-light">
      <div className="card shadow p-4 my-3" style={{ width: "450px" }}>
        <h4 className="text-center mb-3">Đăng nhập</h4>

        <form className="px-4" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Email hoặc Số điện thoại</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập email hoặc số điện thoại"
              id="liEmailPhone"
              name="liEmailPhone"
            />
            {errors.emailPhone && (
              <p className="text-danger m-0">{errors.emailPhone}</p>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <div className="position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control pe-5"
                placeholder="Nhập mật khẩu"
                id="liPassword"
                name="liPassword"
              />
              <i
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                style={{ cursor: "pointer" }}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>
            {errors.password && (
              <p className="text-danger m-0">{errors.password}</p>
            )}
          </div>

          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-dark" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </div>
        </form>

        <div className="text-center mt-3">
          <span>Chưa có tài khoản? </span>
          <Link to="/register" className="text-red">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
