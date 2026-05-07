import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";

// Main logic hook
export function useStaff() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalState, setModalState] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "0",
    birthDate: "",
    address: "",
    FK_idRole: "",
    FK_idStore: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [selectedStoreId, setSelectedStoreId] = useState("all");
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true); 
  const [userStoreId, setUserStoreId] = useState(null);
  const [resetPassword, setResetPassword] = useState(false);
  const debouncedSearchTerm = useDebounce(inputValue, 500);

  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showReCreatePassword, setShowReCreatePassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);
  const [showReUpdatePassword, setShowReUpdatePassword] = useState(false);

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/staff";
  const ROLE_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/roles/staff";
  const STORE_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store";
  const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";

  // Lấy session hiện tại để phân quyền
  const fetchSession = async () => {
    try {
      const res = await fetch(SESSION_API_URL, { credentials: "include" });
      const result = await res.json();
      if (result.status === "success") {
        setUserRole(result.user.roleName);
        setUserStoreId(result.user.FK_idStore);
      } else {
        setUserRole(null);
      }
    } catch (err) {
      console.error("Lỗi khi lấy session:", err);
      setUserRole(null);
    }finally{
      setLoadingRole(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm.trim()) params.append("search", debouncedSearchTerm.trim());
      if (selectedGender !== "all") params.append("gender", selectedGender);
      if (selectedCategoryId !== "all") params.append("roleId", selectedCategoryId);

      // Nếu là Quản lý cửa hàng → chỉ lấy nhân viên của cửa hàng đó
      if (userRole === "Quản lý cửa hàng") {
        params.append("storeId", userStoreId);
      } else if (selectedStoreId !== "all") {
        params.append("storeId", selectedStoreId);
      }

      params.append("page", page);

      const res = await fetch(`${API_URL}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error(res.statusText);
      const result = await res.json();
      if (result.status === "success") {
        setUsers(result.data);
        setTotal(result.total);
        setPerPage(result.perPage);
      } else throw new Error(result.message || "Lỗi khi tải users");
    } catch (err) {
      setError(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch(ROLE_API_URL);
      const result = await res.json();
      if (result.status === "success") setRoles(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(STORE_API_URL);
      const result = await res.json();
      if (result.status === "success") setStores(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchRoles();
    fetchStores();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedStoreId, selectedGender, selectedCategoryId, debouncedSearchTerm]);

  useEffect(() => {
    if (userRole) fetchUsers();
  }, [page, selectedStoreId, selectedGender, selectedCategoryId, debouncedSearchTerm, userRole]);

  // Modal handlers
  const openCreateModal = () => {
    if (userRole === "Quản lý cửa hàng") {
      window.Toast.fire({ icon: "warning", title: "Bạn không có quyền thêm nhân viên!" });
      return;
    }
    setFormValues({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      gender: "0",
      birthDate: "",
      address: "",
      FK_idRole: "",
      FK_idStore: "",
    });
    setFormErrors({});
    setModalState("create");
  };

  const openViewModal = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { credentials: "include" });
      const result = await res.json();
      if (result.status === "success") {
        setSelectedUser(result.data);
        setModalState("view");
      } else {
        window.Toast.fire({ icon: "error", title: "Không tìm thấy nhân viên" });
      }
    } catch (err) {
      console.error(err);
      window.Toast.fire({ icon: "error", title: "Lỗi khi tải thông tin nhân viên" });
    }
  };

  const openEditModal = (user) => {
    if (userRole === "Quản lý cửa hàng") {
      window.Toast.fire({ icon: "warning", title: "Bạn không có quyền sửa nhân viên!" });
      return;
    }
    setFormValues({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender ?? "0",
      birthDate: user.birthDate ? user.birthDate.split(" ")[0] : "",
      address: user.address || "",
      FK_idRole: user.FK_idRole || "",
      FK_idStore: user.FK_idStore || "",
    });
    setFormErrors({});
    setSelectedUser(user);
    setModalState("edit");
  };

  const openDeleteModal = (user) => {
    if (userRole === "Quản lý cửa hàng") {
      window.Toast.fire({ icon: "warning", title: "Bạn không có quyền xóa nhân viên!" });
      return;
    }
    setSelectedUser(user);
    setModalState("delete");
  };

  const closeModal = () => {
    // Reset toàn bộ form và trạng thái liên quan đến mật khẩu
    setFormValues((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
    setFormErrors({});
    setResetPassword(false);
    setModalState(null);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation giữ nguyên
  const validateForm = (isEdit = false) => {
    const errors = {};
    if (!formValues.fullName.trim()) errors.fullName = "Họ tên không được để trống";

    if (!formValues.email.trim()) {
      errors.email = "Email không được để trống";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formValues.email)) {
      errors.email = "Email không hợp lệ";
    } 

    if (!formValues.phone.trim()) {
      errors.phone = "SĐT không được để trống";
    } else if (!/^(0[35789])[0-9]{8}$/.test(formValues.phone)) {
      errors.phone = "Số điện thoại không hợp lệ (phải có 10 số)";
    } 

    if (!isEdit) {
      if (!formValues.password.trim()) errors.password = "Mật khẩu không được để trống";
      else if (formValues.password.length < 6)
        errors.password = "Mật khẩu phải ít nhất 6 ký tự";
    }

    if (!isEdit) {
      if (!formValues.password.trim()) errors.password = "Mật khẩu không được để trống";
      else if (formValues.password.length < 6)
        errors.password = "Mật khẩu phải ít nhất 6 ký tự";

      if (!formValues.confirmPassword?.trim())
        errors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      else if (formValues.confirmPassword !== formValues.password)
        errors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (isEdit && resetPassword) {
      if (!formValues.newPassword?.trim())
        errors.newPassword = "Vui lòng nhập mật khẩu mới";
      else if (formValues.newPassword.length < 6)
        errors.newPassword = "Mật khẩu mới phải ít nhất 6 ký tự";

      if (!formValues.confirmNewPassword?.trim())
        errors.confirmNewPassword = "Vui lòng xác nhận mật khẩu mới";
      else if (formValues.confirmNewPassword !== formValues.newPassword)
        errors.confirmNewPassword = "Mật khẩu xác nhận không khớp";
    }

    if (!formValues.birthDate) {
      errors.birthDate = "Ngày sinh không được để trống";
    } else {
      const birthDate = new Date(formValues.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) errors.birthDate = "Nhân viên phải từ 18 tuổi trở lên";
    }

    if (!formValues.FK_idRole) errors.FK_idRole = "Vui lòng chọn chức vụ";

    const roleName = roles.find((r) => r.PK_idRole === formValues.FK_idRole)?.roleName;
    if (["Quản lý cửa hàng", "Kỹ thuật viên"].includes(roleName)) {
      if (!formValues.FK_idStore) {
        errors.FK_idStore = "Vui lòng chọn cửa hàng";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit thêm
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (userRole === "Quản lý cửa hàng") {
    window.Toast.fire({ icon: "warning", title: "Bạn không có quyền thêm nhân viên!" });
    return;
  }

  if (!validateForm(false)) return;

  setIsSubmitting(true);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formValues),
      credentials: "include",
    });

    const result = await res.json();

    if (res.ok && result.status === "success") {
      window.Toast.fire({
        icon: "success",
        title: result.message || "Thêm nhân viên thành công",
      });
      fetchUsers();
      closeModal();
    } else {
      // Nếu lỗi từ API (ví dụ trùng email/phone)
      window.Toast.fire({
        icon: "error",
        title: result.message || "Thêm nhân viên thất bại",
      });
    }
  } catch (err) {
    window.Toast.fire({
      icon: "error",
      title: err.message || "Thêm nhân viên thất bại",
    });
  } finally {
    setIsSubmitting(false);
  }
};


// Submit sửa
const handleUpdate = async (e) => {
  e.preventDefault();

  if (userRole === "Quản lý cửa hàng") {
    window.Toast.fire({ icon: "warning", title: "Bạn không có quyền sửa nhân viên!" });
    return;
  }

  // Validate form (truyền true vì là edit)
  if (!validateForm(true)) return;

  // Chuẩn bị dữ liệu gửi lên API
  const bodyData = { ...formValues };
  if (resetPassword) {
    bodyData.password = formValues.newPassword;
  }

  setIsSubmitting(true);
  try {
    const res = await fetch(`${API_URL}/${selectedUser.PK_idUser}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
      credentials: "include",
    });

    const result = await res.json();

    if (res.ok && result.status === "success") {
      window.Toast.fire({
        icon: "success",
        title: result.message || "Cập nhật nhân viên thành công",
      });
      fetchUsers();
      closeModal();
    } else {
      window.Toast.fire({
        icon: "error",
        title: result.message || "Cập nhật nhân viên thất bại",
      });
    }
  } catch (err) {
    window.Toast.fire({
      icon: "error",
      title: err.message || "Cập nhật nhân viên thất bại",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  // Xóa
  const handleDelete = async () => {
    if (userRole === "Quản lý cửa hàng") {
      window.Toast.fire({ icon: "warning", title: "Bạn không có quyền xóa nhân viên!" });
      return;
    }

    if (!selectedUser) return;
    try {
      const res = await fetch(`${API_URL}/${selectedUser.PK_idUser}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json();
      if (result.status === "success") {
        window.Toast.fire({
          icon: "success",
          title: result.message || "Xóa nhân viên thành công",
        });
        fetchUsers();
        closeModal();
      } else throw new Error(result.message || "Xóa nhân viên thất bại");
    } catch (err) {
      window.Toast.fire({ icon: "error", title: err.message || "Xóa nhân viên thất bại" });
    }
  };

  const getPageNumbers = () => {
    const totalPages = Math.ceil(total / perPage);
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const showStoreField = () => {
    const roleName = roles.find((r) => r.PK_idRole === formValues.FK_idRole)?.roleName;
    return roleName && ["Quản lý cửa hàng", "Kỹ thuật viên"].includes(roleName);
  };

  return {
    users, roles, stores, loading, error, modalState, selectedUser, formValues,
    formErrors, isSubmitting, inputValue, setInputValue, selectedGender,
    setSelectedGender, selectedStoreId, setSelectedStoreId, selectedCategoryId,
    setSelectedCategoryId, page, setPage, perPage, total, userRole, userStoreId,
    fetchUsers, openCreateModal, openViewModal, openEditModal, openDeleteModal,
    closeModal, handleInputChange, handleSubmit, handleUpdate, handleDelete,
    getPageNumbers, showStoreField, resetPassword, setResetPassword,
    showCreatePassword, setShowCreatePassword, showReCreatePassword,
    setShowReCreatePassword, showUpdatePassword, setShowUpdatePassword, 
    showReUpdatePassword, setShowReUpdatePassword, loadingRole, setLoadingRole,
  };
}
