import { useEffect, useState } from "react";

function UserInfor() {
  const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";
  const CURRENT_USER_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/current";
  const UPDATE_PROFILE_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/updateProfile";
  const CHANGE_PASSWORD_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/changePassword";

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    gender: "0",
    birthDate: "",
    address: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changing, setChanging] = useState(false);

  const handleOpenPasswordModal = () => setShowPasswordModal(true);
  const handleClosePasswordModal = () => {
    resetPasswordModal();
    setShowPasswordModal(false);
  };
  const [errors, setErrors] = useState({});

  const resetPasswordModal = () => {
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };


  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value })); // dùng prev đảm bảo đúng thứ tự
    setErrors(prev => ({ ...prev, [name]: "" })); // xóa lỗi của field đó
    // console.log("Input:", name, value);
  };


  // Lấy session hiện tại trước
  const fetchSession = async () => {
    try {
      const res = await fetch(SESSION_API_URL, { credentials: "include" });
      const result = await res.json();
      if (result.status === "success") {
        setUserRole(result.user.roleName);
        return true;
      } else {
        setUserRole(null);
        return false;
      }
    } catch (err) {
      console.error("Lỗi khi lấy session:", err);
      setUserRole(null);
      return false;
    }
  };

  // Lấy thông tin người dùng
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(CURRENT_USER_API_URL, { method: "GET", credentials: "include" });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setUser(data.data || data.user);
      } else {
        setError(data.message || "Không thể tải thông tin người dùng.");
      }
    } catch (err) {
      console.error(err);
      setError("Lỗi kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      const hasSession = await fetchSession();
      if (hasSession) await fetchUserInfo();
      else {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setLoading(false);
      }
    };
    init();
  }, []);

  // Kiểm tra có phải khách hàng không
  const isCustomer = userRole?.toLowerCase().includes("khách");

  // Mở modal sửa thông tin
  const handleOpenEdit = () => {
    setFormData({
      fullName: user.fullName || "",
      phone: user.phone || "",
      email: user.email || "",
      gender: user.gender?.toString() || "0",
      birthDate: user.birthDate && user.birthDate !== "0000-00-00" ? user.birthDate.split(" ")[0] : "",
      address: user.address || "",
    });
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    // Reset formData về giá trị hiện tại của user
    setFormData({
      fullName: user.fullName || "",
      phone: user.phone || "",
      email: user.email || "",
      gender: user.gender?.toString() || "0",
      birthDate: user.birthDate && user.birthDate !== "0000-00-00" ? user.birthDate.split(" ")[0] : "",
      address: user.address || "",
    });

    // Xóa lỗi trước đó
    setErrors({});
    setShowEditModal(false);
  };


  const handleChange = (e) =>
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  // Lưu thông tin cập nhật
  const handleSave = async () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Họ và tên không được để trống";
    if (!formData.phone.trim()) newErrors.phone = "Số điện thoại không được để trống";
    if (!formData.email.trim()) newErrors.email = "Email không được để trống";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await fetch(UPDATE_PROFILE_API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok && data.status === "success") {
        // ✅ Lưu thông báo tạm thời trước khi reload
        sessionStorage.setItem("profile_updated", "true");

        // Reload trang
        window.location.reload();
      } else {
        window.Toast?.fire({
          icon: "error",
          title: data.message || "Cập nhật thất bại!",
        });
      }
    } catch (err) {
      console.error(err);
      window.Toast?.fire({
        icon: "error",
        title: "Không thể kết nối đến server!",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const updated = sessionStorage.getItem("profile_updated");
    if (updated) {
      window.Toast?.fire({
        icon: "success",
        title: "Cập nhật thông tin thành công!",
      });
      sessionStorage.removeItem("profile_updated"); // ✅ Xóa để không lặp lại
    }
  }, []);


  // Trạng thái đang tải / lỗi
  if (loading)
    return (
      <div className="text-center py-5 text-muted">
        <div className="spinner-border text-primary me-2" />
        Đang tải thông tin...
      </div>
    );

  if (error)
    return (
      <div className="alert alert-danger text-center my-3">
        {error}
      </div>
    );

  if (!user)
    return (
      <div className="alert alert-secondary text-center my-3">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  // Các trường thông tin hiển thị
  const infoFields = [
    { label: "Họ và tên", value: user.fullName },
    { label: "Số điện thoại", value: user.phone },
    { label: "Email", value: user.email },
    { label: "Giới tính", value: Number(user.gender) === 1 ? "Nữ" : "Nam" },
    {
      label: "Ngày sinh",
      value:
        user.birthDate && user.birthDate !== "0000-00-00"
          ? new Date(user.birthDate.replace(" ", "T")).toLocaleDateString("vi-VN")
          : "",
    },
    { label: "Địa chỉ", value: user.address },
  ];

  if (!isCustomer) infoFields.push({ label: "Chức vụ", value: user.roleName });
  if (user.storeAddress) infoFields.push({ label: "Cửa hàng", value: user.storeAddress });


  // Kiểm tra mật khẩu mới (>= 8 ký tự, có hoa, thường, số, ký tự đặc biệt)
  const validatePassword = (password) => {
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
  };

  const validatePasswords = () => {
    const newErrors = {};
    if (!passwordData.oldPassword.trim()) newErrors.oldPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!passwordData.newPassword.trim()) newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    if (!passwordData.confirmPassword.trim()) newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    if (passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu xác nhận không trùng khớp";
    if (passwordData.newPassword && !validatePassword(passwordData.newPassword)) {
      newErrors.newPassword = "Mật khẩu phải >= 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt";
    }
    setErrors(newErrors);
    console.log("PasswordData:", passwordData);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePasswords()) return;

    setChanging(true);
    try {
      const res = await fetch(CHANGE_PASSWORD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
        credentials: "include",
      });

      const result = await res.json();
      if (res.ok && result.status === "success") {
        window.Toast?.fire({ icon: "success", title: "Đổi mật khẩu thành công!" });
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setErrors({});
        setShowPasswordModal(false);
      } else {
        window.Toast?.fire({ icon: "error", title: result.message || "Đổi mật khẩu thất bại!" });
      }
    } catch (err) {
      setErrors({ server: "Lỗi kết nối máy chủ.", err });
    } finally {
      setChanging(false);
    }
  };


  // Render giao diện
  return (
    <>
      <div className="card shadow-sm border-0 h-100">
        <div className="card-header my-2 mx-3 bg-white text-center fs-5 fw-semibold">
          Thông tin cá nhân
        </div>
        <div className="card-body">
          {infoFields
            .filter((item) => item.value && item.value.toString().trim() !== "")
            .map((item, index) => (
              <div key={index} className="mb-3">
                <strong>{item.label}:</strong> {item.value}
              </div>
            ))}

          <div className="d-flex gap-2 mt-4">
            {isCustomer && (
              <button className="btn btn-primary flex-grow-1" onClick={handleOpenEdit}>
                Sửa thông tin
              </button>
            )}
           <button className="btn btn-secondary flex-grow-1" onClick={handleOpenPasswordModal}>
            Đổi mật khẩu
          </button>
          </div>
        </div>
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chỉnh sửa thông tin</h5>
                  <button type="button" className="btn-close" onClick={handleCloseEdit}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Họ và tên</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && <div className="text-danger small">{errors.fullName}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && <div className="text-danger small">{errors.phone}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="text-danger small">{errors.email}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Giới tính</label>
                    <select
                      className="form-select"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="0">Nam</option>
                      <option value="1">Nữ</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Ngày sinh</label>
                    <input
                      type="date"
                      className="form-control"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Địa chỉ</label>
                    <input
                      type="text"
                      className="form-control"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseEdit}>
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showPasswordModal && (
      <>
        <div className="modal-backdrop fade show"></div>
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Đổi mật khẩu</h5>
                <button type="button" className="btn-close" onClick={handleClosePasswordModal}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-bold">Mật khẩu hiện tại</label>
                  <div className="position-relative">
                    <input type={showOldPassword  ? "text" : "password"}
                      name="oldPassword" className="form-control pe-5" 
                      placeholder = "Nhập mật khẩu hiện tại"
                      value={passwordData.oldPassword} onChange={handlePasswordChange} />
                      <i
                        className={`bi ${showOldPassword  ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowOldPassword(!showOldPassword )}
                      ></i>
                  </div>
                  {errors.oldPassword && <div className="text-danger small">{errors.oldPassword}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Mật khẩu mới</label>
                  <div className="position-relative">
                    <input type={showNewPassword ? "text" : "password"} 
                      name="newPassword" className="form-control pe-5" 
                      placeholder = "Nhập mật khẩu mới"
                      value={passwordData.newPassword} onChange={handlePasswordChange} />
                      <i
                        className={`bi ${showNewPassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      ></i>
                  </div>
                  {errors.newPassword && <div className="text-danger small">{errors.newPassword}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Xác nhận mật khẩu mới</label>
                  <div className="position-relative">
                  <input type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword" className="form-control pe-5" 
                    placeholder = "Xác nhận mật khẩu mới"
                    value={passwordData.confirmPassword} onChange={handlePasswordChange} />
                  <i
                    className={`bi ${showConfirmPassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  ></i>
                  </div>
                  {errors.confirmPassword && <div className="text-danger small">{errors.confirmPassword}</div>}
                </div>
                {errors.server && <div className="alert alert-danger mt-2">{errors.server}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClosePasswordModal}>Hủy</button>
                <button type="button" className="btn btn-primary" onClick={handleChangePassword} disabled={changing}>
                  {changing ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  );
}

export default UserInfor;
