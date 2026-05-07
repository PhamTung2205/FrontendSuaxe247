import React from "react";
import { useInvoice } from '../../../assets/js/Invoice';

export default function Invoice() {
  const  inv = useInvoice();

  return (
    <div className="container pt-2">

      {inv.loadingRole ? (
        <div className="text-center text-muted">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang kiểm tra quyền truy cập...</p>
        </div>
      ) : !["Quản lý cửa hàng", "Quản lý hệ thống", "Admin"].includes(inv.userRole) ? (
        <div className="alert alert-danger text-center">
          Bạn không có quyền truy cập chức năng này.
        </div>
      ) : (
        <>
  
          {/* Header */}
          <div className="text-center mb-4">
            <h3>Danh sách hóa đơn</h3>
          </div>

          {/* Bộ lọc và nút thêm */}
          <div className="row g-2 mb-3 align-items-end">
          {(inv.userRole === "Quản lý hệ thống" || inv.userRole === "Admin") && (
            <div className="col-12 col-md-2">
              <label className="form-label">Cửa hàng</label>
              <select
                className="form-select"
                value={inv.selectedStore}
                onChange={(e) => inv.setSelectedStore(e.target.value)}
              >
                <option value="all">-- Tất cả cửa hàng --</option>
                {inv.stores?.map((store) => (
                  <option key={store.PK_idStore} value={store.PK_idStore}>
                    {store.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="col-12 col-md-2">
            <label className="form-label">Mã hóa đơn</label>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm theo mã"
              value={inv.invoiceId}
              onChange={(e) => inv.setInvoiceId(e.target.value)}
            />
          </div>

            <div className="col-12 col-md-3">
              <label className="form-label">Tên Khách hàng/KTV/Người lập</label>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên..."
                value={inv.searchName}
                onChange={(e) => inv.setSearchName(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={inv.fromDate}
                onChange={(e) => {
                  inv.setFromDate(e.target.value);
                  // reset toDate nếu nó < fromDate
                  if (inv.toDate && e.target.value > inv.toDate) {
                    inv.setToDate("");
                  }
                }}
              />
            </div>

            <div className="col-12 col-md-2">
              <label className="form-label">Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={inv.toDate}
                onChange={(e) => inv.setToDate(e.target.value)}
                disabled={!inv.fromDate} // disable nếu chưa chọn fromDate
                min={inv.fromDate || undefined} // không chọn trước ngày bắt đầu
              />
            </div>


            {/* Nút Thêm chỉ cho Quản lý cửa hàng */}
            {inv.userRole === "Quản lý cửa hàng" && (
              <div className="col-12 col-md-3 text-end">
                <button className="btn btn-primary mt-3" onClick={() => inv.setShowAddModal(true)} >Tạo hóa đơn</button>
              </div>
            )}
          </div>

          {/* Bảng danh sách hoặc thông báo khi không có dữ liệu */}
          {inv.loading && <p>Đang tải dữ liệu...</p>}

          {inv.error && !inv.loading && (
            <p className="text-danger">{inv.error.message}</p>
          )}

          {!inv.loading && inv.invoices.length === 0 && !inv.error && (
            <div className="alert alert-secondary text-center">
              Không có hóa đơn nào!
            </div>
          )}

          {!inv.loading && inv.invoices.length > 0 && (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-bordered">
                  <thead className="table-dark text-center">
                    <tr>
                      <th>STT</th>
                      <th>Mã hóa đơn</th>
                      <th>Ngày lập</th>
                      <th>Khách hàng</th>
                      <th>Xe</th>
                      <th>Kỹ thuật viên</th>
                      <th>Người lập</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.invoices.map((i, index) => (
                      <tr key={i.PK_idInvoice}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">{i.PK_idInvoice}</td>
                        <td className="text-center">
                          {new Date(i.created).toLocaleString("vi-VN")}
                        </td>
                        <td>{i.customerName}</td>
                        <td className="text-center">{i.vehicle_license}</td>
                        <td>{i.technician_name}</td>
                        <td>{i.cashier_name}</td>
                        <td className="text-center">{i.totalAmount?.toLocaleString("vi-VN")} ₫</td>
                        <td className="text-center">{i.status}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-info btn-sm me-1"
                            onClick={() => inv.viewInvoice(i.PK_idInvoice)}
                          >
                            Xem
                          </button>
                          {/* {inv.userRole === "Quản lý cửa hàng" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                inv.setInvoiceToDelete(i);
                                inv.setShowDeleteConfirm(true);
                              }}
                            >
                              Xóa
                            </button>
                          )} */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Phân trang */}
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${inv.page === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => inv.setPage(inv.page - 1)}>
                      «
                    </button>
                  </li>
                  {inv.getPageNumbers().map((p) => (
                    <li key={p} className={`page-item ${p === inv.page ? "active" : ""}`}>
                      <button className="page-link" onClick={() => inv.setPage(p)}>
                        {p}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      inv.page === Math.ceil(inv.total / inv.perPage) ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={() => inv.setPage(inv.page + 1)}>
                      »
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </>  
      )}

      {inv.showAddModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tạo mới hóa đơn <span> - {inv.userStoreAddress} </span></h5>
                  <button type="button" className="btn-close" onClick={() => { inv.resetInvoice(); inv.setShowAddModal(false); }}></button>
                </div>

                <div className="modal-body py-1">
                  <form onSubmit={inv.handleAddInvoice}>
                    <div className="row">
                      {/* === CỘT TRÁI === */}
                      <div className="col-md-6 pe-3 border-end">
                        {/* Cửa hàng */}
                        {/* <div className="mb-3">
                          <label className="form-label fw-bold">Cửa hàng: </label>
                          <div className="form-control-plaintext">{inv.userStoreAddress}</div>
                        </div> */}

                        {/* Thời gian */}
                        <div className="row">
                          <div className="col mb-2">
                            <label className="form-label fw-bold mb-1">Thời gian vào <span className="text-danger">*</span></label>
                            <input type="datetime-local" className="form-control"
                              value={inv.newInvoice.checkInTime}
                              onChange={(e) => inv.handleChange("checkInTime", e.target.value)} />
                              {inv.showErrors && inv.errors?.checkInTime && <div className="text-danger small mt-1">{inv.errors.checkInTime}</div>}
                          </div>
                          <div className="col mb-2">
                            <label className="form-label fw-bold mb-1">Thời gian giao xe <span className="text-danger">*</span></label>
                            <input type="datetime-local" className="form-control"
                              value={inv.newInvoice.checkOutTime}
                              onChange={(e) => inv.handleChange("checkOutTime", e.target.value)} />
                              {inv.showErrors && inv.errors?.checkOutTime && <div className="text-danger small mt-1">{inv.errors.checkOutTime}</div>}
                          </div>
                        </div>
                        
                        {/* Lịch đặt */}
                          <div className="row mb-2">
                            <label className="form-label fw-bold mb-1">Lịch đặt</label>
                            <div className="col">
                              <select
                                className="form-select"
                                value={inv.selectedAppointment || ""}
                                onChange={(e) => inv.handleSelectAppointment(e.target.value)}
                              >
                                <option value="">-- Chọn lịch đặt --</option>
                                {inv.appointments.map((a) => (
                                  <option key={a.PK_idAppointment} value={a.PK_idAppointment}>
                                    {`${a.appointmentTime} - ${inv.formatDate(a.appointmentDate)} - ${a.phone} - ${a.fullName}`}
                                  </option>

                                ))}
                              </select>
                            </div>
                          </div>

                          {/* KH + SDT */}
                          <div className="row mb-2">
                            <label className="form-label fw-bold mb-1">
                              Khách hàng <span className="text-danger">*</span>
                            </label>
                            <div className="col">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Số điện thoại"
                                value={inv.newInvoice.phone}
                                onChange={(e) => inv.handleChange("phone", e.target.value)}
                              />
                              {inv.showErrors && inv.errors?.phone && (
                                <div className="text-danger small mt-1">{inv.errors.phone}</div>
                              )}
                            </div>
                            <div className="col">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Tên KH"
                                value={inv.newInvoice.customerName}
                                onChange={(e) => inv.handleChange("customerName", e.target.value)}
                              />
                              {inv.showErrors && inv.errors?.customerName && (
                                <div className="text-danger small mt-1">{inv.errors.customerName}</div>
                              )}
                            </div>
                          </div>


                        {/* Xe (biển + loại + km) */}
                        <div className="mb-2">
                          <label className="form-label fw-bold mb-1">Xe <span className="text-danger">*</span></label>
                          <div className="d-flex align-items-center gap-2">
                            {/* --- Biển số + loại xe --- */}
                            {inv.newInvoice.customerId && inv.customerVehicles.length > 0 && !inv.isAddingVehicle ? (
                              <>
                                <select
                                  className="form-select flex-grow-1"
                                  value={inv.newInvoice.vehicle_license}
                                  onChange={(e) => {
                                    const v = inv.customerVehicles.find(v => v.licensePlate === e.target.value);
                                    inv.handleChange("vehicle_license", v?.licensePlate || "");
                                    inv.handleChange("vehicle_type", v?.type || "");
                                  }}
                                >
                                  <option value="">-- Chọn xe --</option>
                                  {inv.customerVehicles.map(v => (
                                    <option key={v.PK_idVehicle} value={v.licensePlate}>
                                      {v.licensePlate} - {v.type}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  className="btn btn-outline-primary btn-sm"
                                  style={{ whiteSpace: "nowrap", padding: "4px 10px" }}
                                  onClick={() => {
                                    inv.setNewInvoice({ ...inv.newInvoice, vehicle_license: "", vehicle_type: "" });
                                    inv.setIsAddingVehicle(true);
                                  }}
                                >Thêm xe
                                </button>
                              </>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  className="form-control flex-grow-1"
                                  placeholder="Biển số"
                                  value={inv.newInvoice.vehicle_license}
                                  onChange={(e) => inv.handleChange("vehicle_license", e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="form-control flex-grow-1"
                                  placeholder="Loại xe"
                                  value={inv.newInvoice.vehicle_type}
                                  onChange={(e) => inv.handleChange("vehicle_type", e.target.value)}
                                />
                                {inv.newInvoice.customerId && inv.customerVehicles.length > 0 && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    style={{ whiteSpace: "nowrap", padding: "4px 10px" }}
                                    onClick={() => inv.setIsAddingVehicle(false)}
                                  >Chọn xe
                                  </button>
                                )}
                              </>
                            )}
                            <input
                              type="number"
                              className="form-control flex-grow-1"
                              placeholder="Số km"
                              value={inv.newInvoice.kmNumber}
                              onChange={(e) => inv.handleChange("kmNumber", e.target.value)}
                            />
                          </div>

                          {inv.showErrors && inv.errors?.vehicle_license && (
                            <div className="text-danger small mt-1">{inv.errors.vehicle_license}</div>
                          )}
                        </div>

                        {/* Yêu cầu của khách hàng */}
                        <div className="mb-2">
                          <label className="form-label fw-bold mb-1">Yêu cầu của khách hàng <span className="text-danger">*</span></label>
                          <input
                            className="form-control"
                            rows="3"
                            placeholder="Nhập yêu cầu của khách hàng..."
                            value={inv.newInvoice.customerRequest || ""}
                            onChange={(e) => inv.handleChange("customerRequest", e.target.value)}
                          ></input>
                          {inv.showErrors && inv.errors?.customerRequest && (
                            <div className="text-danger small mt-1">{inv.errors.customerRequest}</div>
                          )}
                        </div>

                        <div className="mb-2">
                          <label className="form-label fw-bold mb-1">Tồn tại sau sửa chữa</label>
                          <textarea
                            className="form-control"
                            rows={1}
                            placeholder="Nhập thông tin tồn tại sau sửa chữa..."
                            value={inv.newInvoice.postRepairStatus || ""}
                            onChange={(e) => inv.handleChange("postRepairStatus", e.target.value)}
                          />
                          {inv.showErrors && inv.errors?.postRepairStatus && (
                            <div className="text-danger small mt-1">{inv.errors.postRepairStatus}</div>
                          )}
                        </div>


                        {/* KTV + Phương thức thanh toán */}
                        <div className="mb-2">
                          <div className="d-flex gap-2">
                            <div className="flex-grow-1">
                              <label className="form-label fw-bold mb-1">Kỹ thuật viên <span className="text-danger">*</span></label>
                              <select className="form-select"
                                value={inv.newInvoice.technicianId}
                                onChange={(e) => inv.handleChange("technicianId", e.target.value)}>
                                <option value="">-- Chọn kỹ thuật viên --</option>
                                {inv.technicians.map(t => (
                                  <option key={t.PK_idUser} value={t.PK_idUser}>{t.fullName}</option>
                                ))}
                              </select>
                              {inv.showErrors && inv.errors?.technicianId && (
                                <div className="text-danger small mt-1">{inv.errors.technicianId}</div>
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <label className="form-label fw-bold mb-1">Phương thức thanh toán <span className="text-danger">*</span></label>
                              <select className="form-select"
                                value={inv.newInvoice.paymentMethod || "Tiền mặt"}
                                onChange={(e) => inv.handleChange("paymentMethod", e.target.value)}>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Chuyển khoản">Chuyển khoản</option>
                              </select>


                              {inv.showErrors && inv.errors?.paymentMethod && (
                                <div className="text-danger small mt-1">{inv.errors.paymentMethod}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                         <div className=" d-flex justify-content-between align-items-center">
                          <label className="form-label fw-bold mb-0">Tổng tiền tạm tính</label>
                          <div className="fs-5 fw-bold text-danger">
                            {inv.subtotal.toLocaleString("vi-VN")} ₫
                          </div>
                        </div>



                        {/* Dịch vụ + Tiền công */}
                        {/* <div className="row mb-3">
                          <div className="col">
                            <label className="form-label fw-bold">Dịch vụ</label>
                            <select className="form-select"
                              value={inv.newInvoice.serviceId}
                              onChange={(e) => inv.handleChange("serviceId", e.target.value)}>
                              <option value="">-- Chọn dịch vụ --</option>
                              {inv.services.map(sv => <option key={sv.PK_idService} value={sv.PK_idService}>{sv.serviceName}</option>)}
                            </select>
                            {inv.showErrors && inv.errors?.serviceId && <div className="text-danger small mt-1">{inv.errors.serviceId}</div>}
                          </div>
                          <div className="col">
                            <label className="form-label fw-bold">Tiền công</label>
                            <input type="number" className="form-control" placeholder="Tiền công"
                              value={inv.newInvoice.laborCost || ""}
                              onChange={(e) => inv.handleChange("laborCost", e.target.value)} />
                              {inv.showErrors && inv.errors?.laborCost && <div className="text-danger small mt-1">{inv.errors.laborCost}</div>}
                          </div>
                        </div> */}

                      </div>


                      {/* === CỘT PHẢI: NHIỀU DỊCH VỤ === */}
                      <div className="col-md-6 ps-3">
                        {inv.servicesList.map((service, sIndex) => (
                          <div key={sIndex} className="mb-2 border rounded p-3 shadow-sm bg-light">

                            {/* --- Dịch vụ + Tiền công --- */}
                            <div className="row mb-1">
                              <div className="col">
                                <label className="form-label fw-bold mb-1">Dịch vụ <span className="text-danger">*</span></label>
                                <select
                                  className="form-select"
                                  value={service.serviceId}
                                  onChange={(e) => inv.handleServiceChange(sIndex, e.target.value)}
                                >
                                  <option value="">-- Chọn dịch vụ --</option>
                                  {inv.services
                                    .filter(sv => !inv.servicesList.some(
                                      sel => sel.serviceId === sv.PK_idService && sel !== service
                                    ))
                                    .map(sv => (
                                      <option key={sv.PK_idService} value={sv.PK_idService}>
                                        {sv.serviceName}
                                      </option>
                                    ))}
                                </select>
                                {inv.showErrors && service.errors?.serviceId && (
                                  <div className="text-danger small mt-1">{service.errors.serviceId}</div>
                                )}
                              </div>
                              <div className="col">
                                <label className="form-label fw-bold mb-1">Tiền công (VNĐ) <span className="text-danger">*</span></label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Nhập tiền công"
                                  value={service.laborCost ?? ""}
                                  onChange={(e) => inv.handleLaborCostChange(sIndex, e.target.value)}
                                />
                                {inv.showErrors && service.errors?.laborCost && (
                                  <div className="text-danger small mt-1">{service.errors.laborCost}</div>
                                )}
                              </div>
                            </div>

                            {/* --- Bảng phụ tùng --- */}
                            <div className="table-responsive">
                              <table className="table table-bordered align-middle text-center">
                                <thead className="table-light">
                                  <tr>
                                    <th>Phụ tùng <span className="text-danger">*</span></th>
                                    <th>Mã</th>
                                    <th>ĐVT</th>
                                    <th>Giá</th>
                                    <th>SL</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {service.spareParts.length === 0 ? (
                                    <tr><td colSpan="6" className="text-muted">(Chưa có phụ tùng)</td></tr>
                                  ) : service.spareParts.map((sp, pIndex) => {
                                  const available = inv.storeSpareParts.filter(spare =>
                                    !service.spareParts.some(sel => sel.sparePartId === spare.PK_idSparePart && sel !== sp)
                                  );
                                    return (
                                      <tr key={sp.sparePartId || pIndex}>
                                                    <td>
                                          <select
                                            className="form-select"
                                            value={sp.sparePartId || ""}
                                            onChange={(e) => inv.handleSparePartChange(sIndex, pIndex, e.target.value)}
                                          >
                                            <option value="">-- Chọn phụ tùng --</option>
                                            {available.map(spare => (
                                              <option key={spare.PK_idSparePart} value={spare.PK_idSparePart}>
                                                {spare.sparePartName}
                                              </option>
                                            ))}
                                          </select>
                                        </td>
                                        <td>{sp.PK_idSparePart || "-"}</td>
                                        <td>{sp.unit || "-"}</td>
                                        <td>{sp.salePrice ? Number(sp.salePrice).toLocaleString("vi-VN") : "-"}</td>
                                        <td>
                                          <input
                                            type="number"
                                            className="form-control text-center"
                                            style={{ width: "80px", margin: "auto" }}
                                            value={sp.quantity || ""}
                                            min="1"
                                            onChange={(e) => inv.handleQuantityChange(sIndex, pIndex, e.target.value)}

                                          />
                                        </td>
                                        <td>
                                          <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            disabled={service.spareParts.length === 1}
                                            onClick={() => inv.handleRemoveSparePartRow(sIndex, pIndex)}
                                          >Xóa
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            {/* --- Hiển thị lỗi chung phụ tùng --- */}
                              {inv.showErrors && service.spareParts.some(sp => !sp.sparePartId) && (
                                <div className="text-danger small mb-1">
                                  Vui lòng chọn phụ tùng
                                </div>
                              )}

                              {inv.showErrors && service.spareParts.some(sp => Number(sp.quantity) <= 0) && (
                                <div className="text-danger small mt-1">
                                  Số lượng phải lớn hơn 0
                                </div>
                              )}
                            {/* --- Nút thêm dòng phụ tùng --- */}
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => inv.handleAddSparePartRow(sIndex)}
                            >
                              <i className="bi bi-plus-lg"></i> Thêm dòng
                            </button>
                            {/* --- Nút xóa dịch vụ --- */}
                            {inv.servicesList.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm ms-2"
                                onClick={() => inv.handleRemoveService(sIndex)}
                              >
                                <i className="bi bi-x-circle"></i> Xóa dịch vụ
                              </button>
                            )}
                          </div>
                        ))}
                        <hr className="my-3" />
                        {/* --- Nút thêm dịch vụ --- */}
                        <div className="d-flex justify-content-center">
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={inv.handleAddService}
                          >
                            <i className="bi bi-plus-circle"></i> Thêm dịch vụ
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer mt-2 px-0 d-flex justify-content-between">
                      {/* --- BÊN TRÁI: Nút tạo QR --- */}
                      <div>
                        {inv.newInvoice.paymentMethod === "Chuyển khoản" && (
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={inv.handleShowQR}
                          >
                            <i className="bi bi-qr-code"></i> Tạo QR
                          </button>
                        )}
                      </div>

                      {/* --- BÊN PHẢI: Các nút Hủy / Lưu / Lưu và In --- */}
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            inv.resetInvoice();
                            inv.setShowAddModal(false);
                          }}
                        >
                          Hủy
                        </button>

                        <button type="submit" className="btn btn-primary">
                          Lưu
                        </button>

                        <button
                          type="button"
                          className="btn btn-success"
                          onClick={(e) => inv.handleAddInvoice(e, true)}
                        >
                          Lưu và In
                        </button>
                      </div>
                    </div>

                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {inv.showQRModal && (
        <>
          {/* Overlay mờ hơn, phủ cả modal hóa đơn */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1060, // cao hơn modal hóa đơn (thường là 1055)
            }}
          ></div>

          {/* Modal QR */}
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ zIndex: 1065 }} // cao hơn lớp mờ
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={() => inv.setShowQRModal(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h5 className="modal-title">Mã QR thanh toán</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => inv.setShowQRModal(false)}
                  ></button>
                </div>
                <div className="modal-body text-center">
                  <img
                    src={inv.qrUrl}
                    alt="QR Code"
                    className="img-fluid"
                    style={{ maxWidth: "250px" }}
                  />
                  <p className="mt-3 fw-bold">Quét mã để thanh toán</p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => inv.setShowQRModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}



      {/* Modal chi tiết hóa đơn */}
      {inv.selectedInvoice && (
        <>
          {inv.loadingDetail ? (
            <div className="text-center p-3">Đang tải chi tiết...</div>
          ) : (
            <>
              <div className="modal-backdrop fade show"></div>
              <div className="modal fade show d-block" tabIndex="-1">
                <div
                  className="modal-dialog modal-lg modal-dialog-centered"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Chi tiết hóa đơn</h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={inv.closeModal}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="mb-2">
                        <strong>Cửa hàng:</strong> {inv.selectedInvoice.store_address} <br />
                        <strong>Mã hóa đơn:</strong> {inv.selectedInvoice.PK_idInvoice}
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <strong>Thời gian vào:</strong>{" "}
                          {new Date(inv.selectedInvoice.checkInTime).toLocaleString("vi-VN")}
                        </div>
                        <div className="col-md-6">
                          <strong>Thời gian ra:</strong>{" "}
                          {new Date(inv.selectedInvoice.checkOutTime).toLocaleString("vi-VN")}
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-4">
                          <strong>Biển số xe:</strong> {inv.selectedInvoice.vehicle_license}
                        </div>
                        <div className="col-md-4">
                          <strong>Số KM:</strong>{" "}
                          {inv.selectedInvoice.kmNumber
                            ? parseInt(inv.selectedInvoice.kmNumber, 10).toLocaleString("en-US")
                            : "-"}
                        </div>
                        <div className="col-md-4">
                          <strong>Loại xe:</strong> {inv.selectedInvoice.vehicle_type}
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-md-6">
                          <strong>Khách hàng:</strong> {inv.selectedInvoice.customerName}
                        </div>
                        <div className="col-md-6">
                          <strong>Điện thoại:</strong> {inv.selectedInvoice.phone || "-"}
                        </div>
                      </div>

                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Kỹ thuật viên:</strong>
                        <span>{inv.selectedInvoice.technician_name || "—"}</span>
                      </div>

                      <div className="d-flex align-items-center mb-2">
                        <strong className="me-2">Yêu cầu của khách:</strong>
                        <span>{inv.selectedInvoice.customerRequest || "—"}</span>
                      </div>
                      
                      {/* === BẢNG DỊCH VỤ & PHỤ TÙNG === */}
                      <table className="table table-bordered table-sm">
                        <thead className="table-light text-center align-middle">
                          <tr>
                            <th rowSpan="2">STT</th>
                            <th rowSpan="2">Nội dung</th>
                            <th rowSpan="2">Tiền công <br /> (VNĐ)</th>
                            <th colSpan="6">Phụ tùng</th>
                          </tr>
                          <tr>
                            <th>Mã PT</th>
                            <th>Tên</th>
                            <th>ĐVT</th>
                            <th>SL</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                          </tr>
                        </thead>

                        <tbody>
                          {inv.selectedInvoice.details?.length > 0 ? (
                            Object.entries(
                              inv.selectedInvoice.details.reduce((acc, item) => {
                                const key = item.FK_idService || item.serviceName;
                                if (!acc[key]) acc[key] = [];
                                acc[key].push(item);
                                return acc;
                              }, {})
                            ).map(([serviceKey, parts], idx) => (
                              <React.Fragment key={serviceKey}>
                                {parts.map((d, i) => (
                                  <tr key={d.PK_id || `${serviceKey}-${i}`}>
                                    {/* STT chỉ hiện 1 lần cho nhóm */}
                                    {i === 0 && (
                                      <>
                                        <td className="text-center align-middle" rowSpan={parts.length}>
                                          {idx + 1}
                                        </td>
                                        <td className="align-middle" rowSpan={parts.length}>
                                          {d.serviceName || "-"}
                                        </td>
                                        <td className="text-end align-middle" rowSpan={parts.length}>
                                          {inv.toNumber(d.laborCost).toLocaleString("vi-VN")}
                                        </td>
                                      </>
                                    )}

                                    {/* Các cột phụ tùng */}
                                    <td className="text-center">{d.FK_idSparePart || "-"}</td>
                                    <td>{d.sparePartName || "-"}</td>
                                    <td className="text-center">{d.unit || "-"}</td>
                                    <td className="text-center">{d.quantity || "-"}</td>
                                    <td className="text-end">
                                      {d.salePrice ? inv.toNumber(d.salePrice).toLocaleString("vi-VN") : "-"}
                                    </td>
                                    <td className="text-end">
                                      {d.salePrice && d.quantity ? (inv.toNumber(d.salePrice) * inv.toNumber(d.quantity)).toLocaleString("vi-VN") : "-"}
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="text-center text-muted">Không có dữ liệu</td>
                            </tr>
                          )}

                          {/* === Hàng tổng cộng === */}
                          {inv.selectedInvoice.details?.length > 0 && (
                            <tr className="fw-bold">
                              <td colSpan={2} className="text-end">Tổng cộng:</td>
                              <td className="text-end">
                                {Object.values(
                                  inv.selectedInvoice.details.reduce((acc, d) => {
                                    const key = d.FK_idService || d.serviceName;
                                    if (!acc[key]) acc[key] = d.laborCost || 0;
                                    return acc;
                                  }, {})
                                )
                                  .reduce((sum, v) => sum + inv.toNumber(v), 0)
                                  .toLocaleString("vi-VN")}
                              </td>
                              <td colSpan={5}></td>
                              <td className="text-end">
                                {inv.selectedInvoice.details
                                  .reduce(
                                    (sum, d) =>
                                      sum + (inv.toNumber(d.quantity) * inv.toNumber(d.salePrice) || 0),0)
                                  .toLocaleString("vi-VN")}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <div className="row g-2 mt-2">
                        <div className="col-12">
                          <strong>Tổng chi phí sửa chữa:</strong>{" "}
                          {inv.selectedInvoice.totalAmount?.toLocaleString("vi-VN")} VNĐ
                        </div>
                        <div className="col-12">
                          <strong>Tổng tiền bằng chữ:</strong>{" "}
                          {inv.selectedInvoice.totalAmount
                            ? inv.numberToVietnamese(inv.selectedInvoice.totalAmount) : "-"}
                        </div>
                        <div className="col-12">
                          <strong>Tồn tại sau sửa chữa:</strong>{" "}
                          {inv.selectedInvoice.postRepairStatus}
                        </div>
                      </div>
                    </div>
                    
                    <div className="modal-footer mt-2 d-flex justify-content-between">
                      <div>
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={inv.handleShowQRDetail}
                          >
                            <i className="bi bi-qr-code"></i> Tạo QR
                          </button>
                      </div>
                      <div className="d-flex gap-2">
                         <button className="btn btn-secondary" onClick={inv.closeModal}>
                        Đóng
                      </button>
                      <button className="btn btn-primary" onClick={inv.handlePrintInvoice2}>
                        <i className="bi bi-printer me-1"></i> In hóa đơn
                      </button>
                      </div>
                    </div>

                    {/* <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={inv.closeModal}>
                        Đóng
                      </button>
                      <button className="btn btn-primary" onClick={inv.handlePrintInvoice2}>
                        <i className="bi bi-printer me-1"></i> In hóa đơn
                      </button>
                    </div> */}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}





      {/* Modal xóa */}
      {inv.showDeleteConfirm && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title text-danger">Xác nhận xóa</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => inv.setShowDeleteConfirm(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  Bạn có chắc chắn muốn xóa hóa đơn{" "}
                  <strong>{inv.invoiceToDelete?.PK_idInvoice}</strong> không?
                    <div className="alert alert-warning mt-3 mb-0 py-2">
                      <small>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
                      </small>
                    </div>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => inv.setShowDeleteConfirm(false)}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={inv.handleDelete}
                    disabled={inv.deleting}
                  >
                    {inv.deleting ? "Đang xóa..." : "Xóa"}
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
