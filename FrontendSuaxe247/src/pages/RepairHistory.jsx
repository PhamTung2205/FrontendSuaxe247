import React from "react";
import { useRepairHistory } from './../assets/js/RepairHistory';

function RepairHistory() {
  const inv = useRepairHistory();

  return (
    <div className="container my-4" style={{ maxWidth: "1200px" }}>
      <div className="card shadow-lg border-0">
        {/* --- Bộ lọc --- */}
        <div className="card-header bg-light">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Mã / Biển số</label>
              <input
                type="text"
                className="form-control"
                value={inv.search}
                onChange={(e) => {
                  inv.setSearch(e.target.value);
                  inv.setPage(1);
                }}
                placeholder="Nhập mã hoặc biển số"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={inv.dateFrom}
                onChange={(e) => {
                  const newFromDate = e.target.value;
                  inv.setDateFrom(newFromDate);
                  if (inv.dateTo && newFromDate > inv.dateTo) inv.setDateTo("");
                  inv.setPage(1);
                }}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={inv.dateTo}
                onChange={(e) => {
                  inv.setDateTo(e.target.value);
                  inv.setPage(1);
                }}
                disabled={!inv.dateFrom}
                min={inv.dateFrom || undefined}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Khoảng chi phí</label>
              <select
                className="form-select"
                value={inv.costRange}
                onChange={(e) => {
                  inv.setCostRange(e.target.value);
                  inv.setPage(1);
                }}
              >
                <option value="">Tất cả</option>
                <option value="100000">Dưới 100.000</option>
                <option value="300000">100.000 - 300.000</option>
                <option value="500000">300.000 - 500.000</option>
                <option value="above500000">Từ 500.000 trở lên</option>
              </select>
            </div>

            <div className="col-md-auto">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  inv.setSearch("");
                  inv.setDateFrom("");
                  inv.setDateTo("");
                  inv.setCostRange("");
                  inv.setPage(1);
                }}
              >
                <i className="bi bi-x-circle me-2"></i>Xóa
              </button>
            </div>
          </div>
        </div>

        {/* --- Danh sách hóa đơn --- */}
        <div className="card-body">
          {inv.loading ? (
            <p className="text-center text-muted my-5">Đang tải dữ liệu...</p>
          ) : inv.invoices.length === 0 ? (
            <div className="alert alert-secondary text-center my-4">
              Không có hóa đơn nào!
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <p className="mb-0 text-muted">
                  Hiển thị {inv.pagination.current_page} / {inv.pagination.total_pages} trang
                </p>
              </div>

              <div className="row g-4">
                {inv.invoices.map((i, index) => (
                  <div
                    className="col-md-4"
                    key={index}
                    onClick={() => inv.fetchInvoiceDetail(i.PK_idInvoice)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card h-100 shadow-sm border rounded-3">
                      <div className="card-body">
                        <h5 className="fw-bold text-primary mb-3">
                          {i.PK_idInvoice}
                        </h5>
                        <p className="mb-2">
                          <strong>Cửa hàng:</strong> {i.store_address || "Không xác định"}
                        </p>
                        <p className="mb-1 text-muted">
                          <i className="bi bi-tools me-2 text-secondary"></i>
                          {i.vehicle_license || "N/A"} – {i.vehicle_type || "Xe máy"}
                        </p>
                        <p className="mb-0 text-muted">
                          <i className="bi bi-calendar3 me-2 text-secondary"></i>
                          {i.created
                            ? new Date(i.created).toLocaleDateString("vi-VN")
                            : "Không rõ ngày"}
                        </p>
                      </div>
                      <div className="card-footer bg-white border-top py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="fw-semibold text-muted">Tổng chi phí</span>
                          <span className="fw-bold fs-5 text-success">
                            {i.totalAmount
                              ? i.totalAmount.toLocaleString("vi-VN") + "₫"
                              : "0₫"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="card-footer">
        {/* Phân trang */}
        <nav>
          <ul className="pagination justify-content-center mt-4">
            <li className={`page-item ${inv.pagination.current_page === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => inv.setPage(inv.pagination.current_page - 1)}
              >
                «
              </button>
            </li>

            {Array.from({ length: inv.pagination.total_pages }, (_, i) => i + 1).map((p) => (
              <li
                key={p}
                className={`page-item ${p === inv.pagination.current_page ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => inv.setPage(p)}>
                  {p}
                </button>
              </li>
            ))}

            <li
              className={`page-item ${
                inv.pagination.current_page === inv.pagination.total_pages ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => inv.setPage(inv.pagination.current_page + 1)}
              >
                »
              </button>
            </li>
          </ul>
        </nav>

        </div>
      </div>

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
                          <div className="col-12">
                            <strong>Người lập hóa đơn:</strong>{" "}
                            {inv.selectedInvoice.cashier_name}
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
                      <button className="btn btn-primary" onClick={inv.handlePrintInvoice}>
                        <i className="bi bi-printer me-1"></i> In hóa đơn
                      </button>
                      </div>
                    </div>

                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
    </div>
  );
}

export default RepairHistory;
