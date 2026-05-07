import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// Cấu hình mặc định cho toast
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",       // góc trên bên phải
  showConfirmButton: false,  // không có nút OK
  timer: 3000,               // tự tắt sau 3s
  timerProgressBar: true,    // progress bar
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  }
});

export default Toast;
