import React, { useState, useEffect } from "react";
import { sendStatusUpdateEmail } from '../../../services/emailService.js';


const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState("");
  // const [selectedDate, setSelectedDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  // Toast helpers
  const showSuccess = (msg = "Thành công!") =>
    window.Toast
      ? window.Toast.fire({ icon: "success", title: msg })
      : alert(msg);
  const showError = (msg = "Có lỗi xảy ra!") =>
    window.Toast
      ? window.Toast.fire({ icon: "error", title: msg })
      : alert(msg);

  /** ==========================
   *  FETCH USER & STORES
   *  ========================== */
  const fetchUserSession = async () => {
    try {
      const res = await fetch(
        "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session",
        { method: "GET", credentials: "include" }
      );
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setUser(data.user);
        return data.user;
      }
      throw new Error("Không thể lấy thông tin người dùng");
    } catch (e) {
      showError(e.message);
      return null;
    }
  };

  const fetchStores = async () => {
    try {
      const res = await fetch(
        "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store"
      );
      const data = await res.json();
      console.log("Dữ liệu cửa hàng:", data);
      if (Array.isArray(data)) setStores(data);
      else if (Array.isArray(data.data)) setStores(data.data);
    } catch (error) {
      console.error("Lỗi khi tải cửa hàng:", error);
    }
  };

  /** ==========================
   *  FETCH APPOINTMENTS
   *  ========================== */
  const fetchAppointmentsByStore = async (storeId) => {
  try {
    const res = await fetch(
      `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments/store/${storeId}`
    );
    const data = await res.json();
    
    // ✅ Xử lý response từ API mới
    if (data.status === 'success' && Array.isArray(data.data)) {
      return data.data;
    } else if (Array.isArray(data)) {
      return data;
    } else if (Array.isArray(data.data)) {
      return data.data;
    }
    
    showError("Dữ liệu không hợp lệ");
    return [];
  } catch {
    showError("Lỗi khi tải lịch hẹn");
    return [];
  }
};

  const fetchServiceDetails = async (appointmentId) => {
  try {
    const res = await fetch(
      `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointment-service/${appointmentId}`
    );
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Lỗi khi lấy dịch vụ:", error);
    return { status: "error", data: [] };
  }
};

const loadServicesForAppointments = async (appointments) => {
  try {
    const updatedAppointments = await Promise.all(
      appointments.map(async (a) => {
        const serviceData = await fetchServiceDetails(a.PK_idAppointment);
        const serviceName = serviceData?.status === "success" && Array.isArray(serviceData.data)
          ? serviceData.data.map((s) => s.serviceName).join(", ")
          : "Không có dịch vụ";
        
        return {
          ...a,
          serviceName
        };
      })
    );
    
    setAppointments(updatedAppointments);
  } catch (error) {
    console.error("Lỗi khi tải dịch vụ:", error);
  }
};
  /** ==========================
   *  LOAD APPOINTMENTS (with filters)
   *  ========================== */
  const loadAppointments = async () => {
  setLoading(true);
  try {
    const userData = user || (await fetchUserSession());
    if (!userData) return;

    let storeId = userData.store;
    const role = userData.roleName;

    if ((role === "Admin" || role === "Quản lý hệ thống") && selectedStore) {
      storeId = selectedStore;
    }

    if (!storeId) {
      setAppointments([]);
      return;
    }

    // ✅ Chỉ cần 1 API call
    const storeAppointments = await fetchAppointmentsByStore(storeId);

    // ✅ Map data từ API mới
    const appointmentsWithBasicInfo = storeAppointments.map((a) => ({
      ...a,
      customerName: a.customer_name,
      customerPhone: a.customer_phone,
      vehicleInfo: a.vehicle_license_plate 
        ? `${a.vehicle_license_plate} - ${a.vehicle_type || ""}`
        : "Chưa có xe",
      serviceName: "Đang tải..." // Tạm thời
    }));

    setAppointments(appointmentsWithBasicInfo);
    
    // Cập nhật selectedStatus
    const statusMap = {};
    appointmentsWithBasicInfo.forEach((a) => (statusMap[a.PK_idAppointment] = a.status));
    setSelectedStatus(statusMap);

    // ✅ Load services riêng (nếu cần)
    await loadServicesForAppointments(appointmentsWithBasicInfo);
    
  } catch {
    showError("Không thể tải dữ liệu");
  } finally {
    setLoading(false);
  }
};

  /** ==========================
   *  STATUS HANDLERS
   *  ========================== */
  const handleStatusChange = (id, value) =>
    setSelectedStatus((p) => ({ ...p, [id]: value }));

 const updateAppointmentStatus = async (id, newStatus) => {
  setUpdatingId(id);
  try {
    const res = await fetch(
      `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments/status/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      }
    );

    if (!res.ok) throw new Error();

    // ✅ Cập nhật ngay UI
    setAppointments((prev) =>
      prev.map((a) =>
        a.PK_idAppointment === id ? { ...a, status: newStatus } : a
      )
    );
    showSuccess("Cập nhật thành công!");

    // ✉️ GỬI EMAIL NGẦM (không chờ, không làm chậm UI)
    sendStatusUpdateEmail(id)
      .then(() => console.log("✅ Đã gửi email cập nhật trạng thái"))
      .catch((err) => console.error("⚠️ Lỗi gửi email (không ảnh hưởng cập nhật):", err));

  } catch (error) {
    console.error("❌ Lỗi cập nhật:", error);
    showError("Cập nhật thất bại!");
  } finally {
    setUpdatingId(null);
  }
};


  /** ==========================
   *  FILTERS & PAGINATION
   *  ========================== */

const filteredAppointments = appointments
  .filter((a) => {
    const appointmentDay = new Date(a.appointmentDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    let matchDate = true;

    if (start && !end) {
      matchDate = appointmentDay >= start;
    } else if (!start && end) {
      matchDate = appointmentDay <= end;
    } else if (start && end) {
      matchDate = appointmentDay >= start && appointmentDay <= end;
    }

    const matchStatus = filterStatus ? a.status === filterStatus : true;
    const matchPhone = searchPhone 
      ? a.customerPhone.toLowerCase().includes(searchPhone.toLowerCase()) 
      : true;
    
    return matchDate && matchStatus && matchPhone;
  })
  // Sắp xếp theo ưu tiên trạng thái và ngày
//   .sort((a, b) => {
//   const statusPriority = {
//     "Chờ xác nhận": 1,
//     "Đã xác nhận": 2,
//     "Hoàn thành": 3,
//     "Đã hủy": 4,
//   };

//   const priorityA = statusPriority[a.status] || 99;
//   const priorityB = statusPriority[b.status] || 99;

//   if (priorityA !== priorityB) return priorityA - priorityB;

//   const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
//   const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
//   return dateA - dateB;
// });
.sort((a, b) => {
  const statusPriority = {
    "Chờ xác nhận": 1,
    "Đã xác nhận": 2,
    "Hoàn thành": 3,
    "Đã hủy": 4,
  };

  const priorityA = statusPriority[a.status] || 99;
  const priorityB = statusPriority[b.status] || 99;

  // Ưu tiên theo trạng thái trước
  if (priorityA !== priorityB) return priorityA - priorityB;

  // Tính thời gian gần với hiện tại nhất
  const now = new Date();
  const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
  const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);

  const diffA = Math.abs(dateA - now);
  const diffB = Math.abs(dateB - now);

  return diffA - diffB; 
});


const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;
const current = filteredAppointments.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
const paginate = (page) => setCurrentPage(page);

  const getStatusBadgeClass = (status) => {
    switch (status) {
       case "Chờ xác nhận":
        return "bg-warning text-dark";
      case "Đã xác nhận":
        return "bg-success";
      case "Đã hủy":
        return "bg-danger";
      case "Hoàn thành":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  /** ==========================
   *  ROLE LOGIC
   *  ========================== */
  const canSelectStore =
    user && (user.roleName === "Admin" || user.roleName === "Quản lý hệ thống");
  const canEditStatus =
    user && user.roleName === "Quản lý cửa hàng";

  /** ==========================
   *  USE EFFECTS
   *  ========================== */
  useEffect(() => {
    const init = async () => {
      const u = await fetchUserSession();
      if (!u) return;

      if (u.roleName === "Admin" || u.roleName === "Quản lý hệ thống") {
        await fetchStores();
      }

      await loadAppointments();
    };
    init();
  }, []);

  // Tự động chọn cửa hàng đầu tiên nếu là admin và chưa chọn
  useEffect(() => {
    if (
      user &&
      (user.roleName === "Admin" || user.roleName === "Quản lý hệ thống") &&
      stores.length > 0 &&
      !selectedStore
    ) {
      setSelectedStore(stores[0].PK_idStore);
    }
  }, [stores, user]);

  // useEffect(() => {
  //   if (user && selectedStore) loadAppointments();
  // }, [selectedStore, selectedDate]);

useEffect(() => {
  if (user && selectedStore) {
    setSearchPhone("");
    setCurrentPage(1);
    loadAppointments();
  }
}, [selectedStore, startDate, endDate, user]);
  /** ==========================
   *  RENDER
   *  ========================== */
  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status" />
        <span className="ms-2">Đang tải dữ liệu...</span>
      </div>
    );

  return (
    <div className="container mt-4">
      <h3 className="mb-3 text-center">
        Lịch hẹn :{" "}
        <span>
          {user?.roleName === "Quản lý cửa hàng"
            ? // Nếu là quản lý cửa hàng → hiện địa chỉ cửa hàng trong session
              user.storeAddress ||
              stores.find((s) => s.PK_idStore === user.store)?.address ||
              "Không xác định"
            : // Nếu là Admin hoặc System Manager → hiện cửa hàng đang chọn
            selectedStore
            ? stores.find((s) => s.PK_idStore === selectedStore)?.address || "Không xác định"
            : "Chưa chọn cửa hàng"}
        </span>
      </h3>
{/* Bộ lọc cửa hàng & ngày */}
<div className="row align-items-end mb-4">
  {/* Quản lý cửa hàng - hiển thị đầy đủ bộ lọc */}
  {user?.roleName === "Quản lý cửa hàng" && (
    <div className="col-12">
      <div className="row g-3">
        {/* Tìm kiếm theo sđt - chiếm 3 cột */}
        <div className="col-md-3">
          <label className="form-label">Tìm theo SĐT</label>
          <input
            type="text"
            className="form-control"
            placeholder="Nhập số điện thoại..."
            value={searchPhone}
            onChange={(e) => {
              setSearchPhone(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        {/* Từ ngày - chiếm 2 cột */}
        <div className="col-md-3">
          <label className="form-label">Từ ngày</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Đến ngày - chiếm 2 cột */}
        <div className="col-md-3">
          <label className="form-label">Đến ngày</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Trạng thái - chiếm 3 cột */}
        <div className="col-md-3">
          <label className="form-label">Trạng thái</label>
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đã hủy">Đã hủy</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>
      </div>
    </div>
  )}

  {/* Admin & Quản lý hệ thống - layout mới cân đối */}
{(user?.roleName === "Admin" || user?.roleName === "Quản lý hệ thống") && (
  <div className="col-12">
    <div className="row g-3 align-items-end">
      {/* Cửa hàng - sang trái */}
      <div className="col-md-5">
        <label className="form-label">Cửa hàng</label>
        <select
          className="form-select"
          value={selectedStore}
          onChange={(e) => {
            setSelectedStore(e.target.value);
            setCurrentPage(1);
          }}
        >
          {stores.map((s) => (
            <option key={s.PK_idStore} value={s.PK_idStore}>
              {s.address}
            </option>
          ))}
        </select>
      </div>

      {/* Tìm theo SĐT */}
      <div className="col-md-3">
        <label className="form-label">Tìm theo SĐT</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nhập số điện thoại..."
          value={searchPhone}
          onChange={(e) => {
            setSearchPhone(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Từ ngày */}
      <div className="col-md-2">
        <label className="form-label">Từ ngày</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          max={endDate || ""}
          onChange={(e) => {
            const newStart = e.target.value;
            setStartDate(newStart);
            if (endDate && new Date(newStart) > new Date(endDate)) {
              setEndDate("");
            }
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Đến ngày */}
      <div className="col-md-2">
        <label className="form-label">Đến ngày</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          min={startDate || ""}
          onChange={(e) => {
            const newEnd = e.target.value;
            setEndDate(newEnd);
            if (startDate && new Date(newEnd) < new Date(startDate)) {
              setStartDate("");
            }
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  </div>
)}

</div>

      {/* Bảng lịch hẹn */}
      {filteredAppointments.length === 0 ? (
        <div className="alert alert-info text-center">
          {canSelectStore && !selectedStore
            ? "Vui lòng chọn cửa hàng để xem lịch hẹn"
            : "Không có lịch hẹn nào phù hợp"}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-dark text-center">
                <tr>
                  <th>STT</th>
                  <th>Khách hàng</th>
                  <th>SĐT</th>
                  <th>Ngày hẹn</th>
                  <th>Giờ</th>
                  <th>Xe</th>
                  <th>Dịch vụ</th>
                  <th>Trạng thái</th>
                  {canEditStatus && (
                    <>
                      <th>Cập nhật</th>
                      <th>Hành động</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {current.map((a,index) => (
                  <tr key={a.PK_idAppointment}>
                    <td className="text-center">{index+1}</td>
                    <td>{a.customerName}</td>
                    <td>{a.customerPhone}</td>
                    <td>{new Date(a.appointmentDate).toLocaleDateString("vi-VN")}</td>
                    <td>{a.appointmentTime}</td>
                    <td>{a.vehicleInfo}</td>
                   <td>
                    {a.serviceName
                      ? a.serviceName
                          .split(", ")
                          .map((name, i, arr) => (
                            <React.Fragment key={i}>
                              {name}
                              {(i + 1) % 2 === 0 && i !== arr.length - 1 && <br />}
                              {(i + 1) % 2 !== 0 && i !== arr.length - 1 && ", "}
                            </React.Fragment>
                          ))
                      : "Không có dịch vụ"}
                  </td>
                    <td className="text-center">
                      <span className={`badge ${getStatusBadgeClass(a.status)}`}>
                        {a.status}
                      </span>
                    </td>

                    {canEditStatus && (
                      <>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={selectedStatus[a.PK_idAppointment] || ""}
                            onChange={(e) =>
                              handleStatusChange(a.PK_idAppointment, e.target.value)
                            }
                          >
                            <option value="Chờ xác nhận">Chờ xác nhận</option>
                            <option value="Đã xác nhận">Đã xác nhận</option>
                            <option value="Đã hủy">Đã hủy</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                          </select>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={
                              updatingId === a.PK_idAppointment ||
                              selectedStatus[a.PK_idAppointment] === a.status
                            }
                            onClick={() =>
                              updateAppointmentStatus(
                                a.PK_idAppointment,
                                selectedStatus[a.PK_idAppointment]
                              )
                            }
                          >
                            {updatingId === a.PK_idAppointment ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                ></span>
                                Đang cập nhật...
                              </>
                            ) : (
                              "Cập nhật"
                            )}
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
            {totalPages >= 1 && (
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                    >
                      «
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => paginate(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                    >
                      »
                    </button>
                  </li>
                </ul>
              </nav>
            )}
        </>
      )}
    </div>
  );
};

export default Appointment;