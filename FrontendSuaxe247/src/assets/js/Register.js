// src/js/Register.js

// kiểm tra email đúng định dạng
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// kiểm tra số điện thoại có 10 chữ số
export function validatePhone(phone) {
  return /^\d{10}$/.test(phone);
}

// kiểm tra mật khẩu (>= 8 ký tự, có hoa, thường, số, ký tự đặc biệt)
export function validatePassword(password) {
  const minLength = /.{8,}/;
  const upper = /[A-Z]/;
  const lower = /[a-z]/;
  const digit = /[0-9]/;
  const special = /[^A-Za-z0-9]/;

  return (
    minLength.test(password) &&
    upper.test(password) &&
    lower.test(password) &&
    digit.test(password) &&
    special.test(password)
  );
}

// kiểm tra nhập lại mật khẩu
export function confirmPassword(password, rePassword) {
  return password === rePassword;
}
