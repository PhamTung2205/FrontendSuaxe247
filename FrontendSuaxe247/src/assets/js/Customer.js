import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";

export function useCustomer() {
  const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";
  const CUSTOMER_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/customer";

  const [userRole, setUserRole] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // <-- thêm state error

  // Modal đặt lại mật khẩu
  const [modalState, setModalState] = useState(null); // 'resetPassword' hoặc null
  const [formValues, setFormValues] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const debouncedSearchName = useDebounce(searchName, 500);
  const debouncedSearchPhone = useDebounce(searchPhone, 500);

  const hasAccess = userRole === "Quản lý hệ thống" || userRole === "Admin";

  // --- Lấy session ---
  const fetchSession = async () => {
    try {
      const res = await fetch(SESSION_API_URL, { credentials: "include" });
      const result = await res.json();
      setUserRole(result.status === "success" ? result.user.roleName : null);
    } catch (err) {
      console.error("Lỗi khi lấy session:", err);
      setUserRole(null);
      setError({ message: "Không thể lấy thông tin session." });
    }
  };

  // --- Lấy danh sách khách hàng ---
  const fetchCustomers = async (pageNum = 1, nameTerm = "", phoneTerm = "") => {
    if (!hasAccess) return;
    setLoading(true);
    setError(null); // reset error trước khi gọi API
    try {
      const url = new URL(CUSTOMER_API_URL);
      url.searchParams.append("page", pageNum);
      if (nameTerm) url.searchParams.append("name", nameTerm);
      if (phoneTerm) url.searchParams.append("phone", phoneTerm);

      const res = await fetch(url.toString(), { credentials: "include" });
      const data = await res.json();

      if (data.status === "success") {
        setCustomers(data.data);
        setTotal(data.total);
        setPage(data.page);
        setPerPage(data.perPage);
      } else {
        setCustomers([]);
        setTotal(0);
        setError({ message: data.message || "Lỗi khi tải danh sách khách hàng." });
      }
    } catch (err) {
      console.error("Lỗi khi gọi API danh sách khách hàng:", err);
      setCustomers([]);
      setTotal(0);
      setError({ message: err.message || "Lỗi khi gọi API khách hàng." });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (customerId) => {
    if (!hasAccess || !customerId) return null;
    setError(null);
    try {
      const res = await fetch(`${CUSTOMER_API_URL}/${customerId}`, { credentials: "include" });
      const data = await res.json();
      if (data.status === "success") {
        setModalState(null);
        setSelectedCustomer(data.data);
        setShowModal(true);

      } else {
        setError({ message: data.message || "Không thể lấy chi tiết khách hàng." });
      }
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết khách hàng:", err);
      setError({ message: err.message || "Lỗi khi gọi API chi tiết khách hàng." });
    }
  };

  // Đóng modal
 const closeModal = () => {
    setModalState(null);
    setShowModal(false);
    setSelectedCustomer(null);
    setFormValues({ newPassword: "", confirmNewPassword: "" });
    setFormErrors({});
  };


  useEffect(() => {
    setPage(1);
  }, [debouncedSearchName, debouncedSearchPhone]);

  useEffect(() => {
    if (hasAccess) {
      fetchCustomers(page, debouncedSearchName, debouncedSearchPhone);
    } else {
      setCustomers([]);
      setTotal(0);
    }
  }, [page, debouncedSearchName, debouncedSearchPhone, userRole]);

  useEffect(() => {
    fetchSession();
  }, []);

  const getPageNumbers = () => {
    const pages = [];
    const totalPage = Math.ceil(total / perPage);
    for (let i = 1; i <= totalPage; i++) pages.push(i);
    return pages;
  };

  // Mở modal đặt lại mật khẩu
  const openResetPasswordModal = (customer) => {
    // Đóng modal xem chi tiết nếu đang mở
    setShowModal(false);

    // Thiết lập modal đặt lại mật khẩu
    setSelectedCustomer(customer);
    setFormValues({ newPassword: "", confirmNewPassword: "" });
    setFormErrors({});
    setModalState("resetPassword");
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formValues.newPassword?.trim()) errors.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (formValues.newPassword.length < 6) errors.newPassword = "Mật khẩu phải ít nhất 6 ký tự";

    if (!formValues.confirmNewPassword?.trim())
      errors.confirmNewPassword = "Vui lòng xác nhận mật khẩu";
    else if (formValues.confirmNewPassword !== formValues.newPassword)
      errors.confirmNewPassword = "Mật khẩu xác nhận không khớp";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/resetCustomerPassword/${selectedCustomer.PK_idUser}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: formValues.newPassword }),
          credentials: "include",
        }
      );

      const result = await res.json();

      if (res.ok && result.status === "success") {
        window.Toast.fire({
          icon: "success",
          title: result.message || "Đặt lại mật khẩu thành công",
        });
        closeModal();
      } else {
        window.Toast.fire({
          icon: "error",
          title: result.message || "Đặt lại mật khẩu thất bại",
        });
      }
    } catch (err) {
      window.Toast.fire({
        icon: "error",
        title: err.message || "Lỗi khi đặt lại mật khẩu",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return {
    userRole, hasAccess, customers, total, page, perPage, searchName,
    setSearchName, searchPhone, setSearchPhone, selectedCustomer,
    modalState, formValues, formErrors, isSubmitting, fetchSession,
    fetchCustomers, fetchCustomerDetail, openResetPasswordModal,
    handleInputChange, handleResetPassword, closeModal,
    setPage, loading, error, setError, getPageNumbers, showModal,
    showPassword, setShowPassword, showRePassword, setShowRePassword,
  };

}
