// src/js/Login.js

export function validateLogin(emailPhone, password) {
  let errors = {};

  if (!emailPhone.trim()) {
    errors.emailPhone = "Vui lòng nhập email hoặc số điện thoại";
  }

  if (!password.trim()) {
    errors.password = "Vui lòng nhập mật khẩu";
  }

  return errors;
}
