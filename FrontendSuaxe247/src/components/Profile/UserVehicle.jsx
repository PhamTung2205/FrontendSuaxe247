import { useState, useEffect } from "react";

function UserVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trạng thái modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Dữ liệu form & xe được chọn
  const [form, setForm] = useState({ licensePlate: "", type: "" });
  const [errors, setErrors] = useState({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 6;

const fetchUserAndVehicles = async (currentPage = 1) => {
    setLoading(true);
    try {
      const resUser = await fetch(
        "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session",
        { credentials: "include" }
      );
      const dataUser = await resUser.json();

      if (dataUser.status !== "success" || !dataUser.user) {
        console.warn("Không tìm thấy thông tin user");
        setVehicles([]);
        setLoading(false);
        return;
      }

      const userId =
        dataUser.user?.user_id ||
        dataUser.user?.PK_idUser ||
        dataUser.user?.id ||
        dataUser.user?.FK_idCustomer;

      if (!userId) {
        console.warn("Không có ID người dùng hợp lệ:", dataUser.user);
        setVehicles([]);
        setLoading(false);
        return;
      }

      // 🔹 Gọi API lấy danh sách xe theo trang
      const resVehicles = await fetch(
        `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/userVehicles/${userId}?page=${currentPage}`,
        { credentials: "include" }
      );

      const dataVehicles = await resVehicles.json();

      if (dataVehicles.status === "success") {
        setVehicles(dataVehicles.data || []);
        setTotal(dataVehicles.total || 0);
      } else {
        console.error("Không thể tải danh sách xe:", dataVehicles.message);
        setVehicles([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách xe:", err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Khi mount hoặc đổi trang
  useEffect(() => {
    fetchUserAndVehicles(page);
  }, [page]);

  // Tạo danh sách số trang hiển thị
  const getPageNumbers = () => {
    const totalPages = Math.ceil(total / perPage);
    const pages = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  };


  // Validate cơ bản
  const validate = () => {
    const newErrors = {};
    if (!form.licensePlate.trim()) newErrors.licensePlate = "Vui lòng nhập biển số xe";
    if (!form.type.trim()) newErrors.type = "Vui lòng nhập loại xe";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mở modal thêm
  const handleOpenAdd = () => {
    setForm({ licensePlate: "", type: "" });
    setErrors({});
    setShowAddModal(true);
  };

  // Mở modal sửa
  const handleOpenEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setForm({ licensePlate: vehicle.licensePlate, type: vehicle.type });
    setErrors({});
    setShowEditModal(true);
  };

  // Mở modal xóa
  const handleOpenDelete = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDeleteModal(true);
  };

  // Gọi API thêm xe
  const handleAddVehicle = async () => {
    if (!validate()) return;
    try {
      const res = await fetch(
        "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/vehicle",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            licensePlate: form.licensePlate,
            type: form.type,
          }),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        const newVehicle = {
          PK_idVehicle: data.vehicle_id,
          licensePlate: form.licensePlate,
          type: form.type,
        };
        setVehicles([...vehicles, newVehicle]);
        setShowAddModal(false);
        window.Toast.fire({
          icon: "success",
          title: data.message || "Thêm xe thành công!",
        });
      } else {
        window.Toast.fire({
          icon: "error",
          title: data.message || "Thêm xe thất bại!",
        });
      }
    } catch (error) {
      console.error("Lỗi thêm xe:", error);
      window.Toast.fire({
        icon: "error",
        title: "Không thể kết nối đến máy chủ!",
      });
    }
  };

  // Gọi API cập nhật xe
  const handleEditVehicle = async () => {
    if (!validate()) return;
    try {
      const res = await fetch(
        `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/vehicle/${selectedVehicle.PK_idVehicle}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            licensePlate: form.licensePlate,
            type: form.type,
          }),
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setVehicles((prev) =>
          prev.map((v) =>
            v.PK_idVehicle === selectedVehicle.PK_idVehicle
              ? { ...v, ...form }
              : v
          )
        );
        setShowEditModal(false);
        window.Toast.fire({
          icon: "success",
          title: data.message || "Cập nhật xe thành công!",
        });
      } else {
        window.Toast.fire({
          icon: "error",
          title: data.message || "Cập nhật thất bại!",
        });
      }
    } catch (error) {
      console.error("Lỗi cập nhật xe:", error);
      window.Toast.fire({
        icon: "error",
        title: "Không thể kết nối đến máy chủ!",
      });
    }
  };

  // Gọi API xóa xe
  const handleDeleteVehicle = async () => {
    try {
      const res = await fetch(
        `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/vehicle/${selectedVehicle.PK_idVehicle}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        setVehicles((prev) =>
          prev.filter((v) => v.PK_idVehicle !== selectedVehicle.PK_idVehicle)
        );
        window.Toast.fire({
          icon: "success",
          title: data.message || "Xóa xe thành công!",
        });
      } else {
        window.Toast.fire({
          icon: "error",
          title: data.message || "Xóa xe thất bại!",
        });
      }
    } catch (error) {
      console.error("Lỗi xóa xe:", error);
      window.Toast.fire({
        icon: "error",
        title: "Không thể kết nối đến máy chủ!",
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      {/* Header */}
      <div className="card-header mx-3 my-2 bg-white d-flex justify-content-between align-items-center">
        <h5 className="m-0 fw-semibold">Xe của tôi</h5>
        <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-1"></i> Thêm xe
        </button>
      </div>

      {/* Body */}
      <div className="card-body py-1">
        {loading ? (
          <p className="text-center mt-4">Đang tải...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-muted text-center mt-4">Bạn chưa có xe nào.</p>
        ) : (
          <>
            {/* Thông báo cảnh báo */}
            <div className="alert alert-warning py-2 small mb-3 mt-2">
              <i className="bi bi-exclamation-triangle me-1"></i>
              Không thể xóa các xe đang có lịch hẹn.
            </div>

            {/* Danh sách xe */}
            <div className="row g-3">
              {vehicles.map((v) => (
                <div key={v.PK_idVehicle} className="col-md-4">
                  <div
                    className={`d-flex justify-content-between align-items-center p-3 border rounded ${
                      v.hasConfirmedAppointment > 0 ? "bg-light" : ""
                    }`}
                  >
                    <div>
                      <div className="fw-semibold mb-1">{v.licensePlate}</div>
                      <div className="text-muted small">{v.type}</div>
                    </div>
                    <div>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleOpenEdit(v)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleOpenDelete(v)}
                        hidden={v.hasConfirmedAppointment > 0}
                        title={
                          v.hasConfirmedAppointment > 0
                            ? "Xe này đang có lịch hẹn đã xác nhận, không thể xóa"
                            : ""
                        }
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {/* 🔹 Phân trang */}
      {total > perPage && (
        <nav className="mt-4">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setPage(page - 1)}
              >
                «
              </button>
            </li>
            {getPageNumbers().map((p) => (
              <li
                key={p}
                className={`page-item ${p === page ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(p)}>
                  {p}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                page === Math.ceil(total / perPage) ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setPage(page + 1)}
              >
                »
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/*  Modal Thêm */}
      {showAddModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">Thêm xe mới</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Biển số xe</label>
                    <input
                      type="text"
                      placeholder="VD: 29H1-12345"
                      className={`form-control ${
                        errors.licensePlate ? "is-invalid" : ""
                      }`}
                      value={form.licensePlate}
                      onChange={(e) =>
                        setForm({ ...form, licensePlate: e.target.value })
                      }
                    />
                    {errors.licensePlate && (
                      <div className="invalid-feedback">{errors.licensePlate}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Loại xe</label>
                    <input
                      type="text"
                      placeholder="VD: Wave, Vision..."
                      className={`form-control ${errors.type ? "is-invalid" : ""}`}
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                    />
                    {errors.type && (
                      <div className="invalid-feedback">{errors.type}</div>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Hủy
                  </button>
                  <button className="btn btn-primary" onClick={handleAddVehicle}>
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/*  Modal Sửa */}
      {showEditModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title fw-semibold">Chỉnh sửa xe</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Biển số xe</label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.licensePlate ? "is-invalid" : ""
                      }`}
                      value={form.licensePlate}
                      onChange={(e) =>
                        setForm({ ...form, licensePlate: e.target.value })
                      }
                    />
                    {errors.licensePlate && (
                      <div className="invalid-feedback">{errors.licensePlate}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Loại xe</label>
                    <input
                      type="text"
                      className={`form-control ${errors.type ? "is-invalid" : ""}`}
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                    />
                    {errors.type && (
                      <div className="invalid-feedback">{errors.type}</div>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Hủy
                  </button>
                  <button className="btn btn-primary" onClick={handleEditVehicle}>
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Xóa */}
      {showDeleteModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header">
                  <h5 className="modal-title text-danger fw-semibold">
                    Xác nhận xóa
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDeleteModal(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  Bạn có chắc muốn xóa xe{" "}
                  <strong>{selectedVehicle?.licensePlate}</strong> không? Thao tác này không thể hoàn tác lại
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDeleteVehicle}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default UserVehicle;
