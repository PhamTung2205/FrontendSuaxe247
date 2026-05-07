import { useCustomer } from "../../../assets/js/Customer";

export default function CustomerPage() {
  const customer = useCustomer();

  if (customer.userRole === null) {
    return <div className="container mt-4">Đang kiểm tra quyền...</div>;
  }

  if (!customer.hasAccess) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">
          Bạn không có quyền truy cập
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-3">Danh sách khách hàng</h3>

    {/* Search */}
    <div className="row mb-3 align-items-center">
      <div className="col-md-6 mb-2 d-flex align-items-center">
        <label htmlFor="searchName" className="form-label mb-0 me-3 col-auto">
          Tên khách hàng:
        </label>
        <input
          id="searchName"
          type="text"
          className="form-control col"
          placeholder="Tìm theo tên"
          value={customer.searchName}
          onChange={(e) => customer.setSearchName(e.target.value)}
        />
      </div>

      <div className="col-md-6 mb-2 d-flex align-items-center">
        <label htmlFor="searchPhone" className="form-label mb-0 me-3 col-auto">
          Số điện thoại:
        </label>
        <input
          id="searchPhone"
          type="text"
          className="form-control col"
          placeholder="Tìm theo số điện thoại"
          value={customer.searchPhone}
          onChange={(e) => customer.setSearchPhone(e.target.value)}
        />
      </div>
    </div>




      {/* Table + trạng thái */}
      {customer.loading && <p>Đang tải dữ liệu...</p>}

      {customer.error && !customer.loading && (
        <p className="text-danger">{customer.error.message}</p>
      )}


      {!customer.loading && customer.customers.length === 0 && (
        <div className="alert alert-secondary text-center">Không có khách hàng nào!</div>
      )}

      {!customer.loading && customer.customers.length > 0 && (
        <>
          <table className="table table-bordered">
            <thead className="table-dark text-center">
              <tr>
                <th>STT</th>
                <th>Mã</th>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Số lịch đặt</th>
                <th>Số hóa đơn</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customer.customers.map((c, idx) => (
                <tr key={c.PK_idUser} className="text-center">
                  <td>{(customer.page - 1) * customer.perPage + idx + 1}</td>
                  <td>{c.PK_idUser}</td>
                  <td>{c.fullName}</td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>{c.totalAppointments}</td>
                  <td>{c.totalInvoices}</td>
                  <td>
                    {/* Nút xem chi tiết */}
                    <button
                      className="btn btn-sm btn-info me-2"
                      onClick={() => customer.fetchCustomerDetail(c.PK_idUser)}
                    >
                      Xem
                    </button>

                    {/* Nút sửa / đặt lại mật khẩu */}
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => customer.openResetPasswordModal(c)}
                    >
                      Sửa
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>

          {/* Phân trang */}
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${customer.page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => customer.setPage(customer.page - 1)}>
                  «
                </button>
              </li>
              {customer.getPageNumbers().map((p) => (
                <li key={p} className={`page-item ${p === customer.page ? "active" : ""}`}>
                  <button className="page-link" onClick={() => customer.setPage(p)}>
                    {p}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  customer.page === Math.ceil(customer.total / customer.perPage) ? "disabled" : ""
                }`}
              >
                <button className="page-link" onClick={() => customer.setPage(customer.page + 1)}>
                  »
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      {/* Modal */}
      {customer.showModal && customer.selectedCustomer && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết khách hàng</h5>
                <button type="button" className="btn-close" onClick={customer.closeModal}></button>
              </div>
              <div className="modal-body">
                <p><strong>Mã:</strong> {customer.selectedCustomer.PK_idUser}</p>
                <p><strong>Họ tên:</strong> {customer.selectedCustomer.fullName}</p>
                <p><strong>Số điện thoại:</strong> {customer.selectedCustomer.phone}</p>
                <p><strong>Email:</strong> {customer.selectedCustomer.email}</p>
                <p><strong>Giới tính:</strong> {Number(customer.selectedCustomer.gender) === 1 ? "Nữ" : "Nam"}</p>
                <p><strong>Ngày sinh:</strong> {customer.selectedCustomer.birthDate}</p>
                <p><strong>Địa chỉ:</strong> {customer.selectedCustomer.address}</p>
                <p><strong>Số lịch đặt:</strong> {customer.selectedCustomer.totalAppointments}</p>
                <p><strong>Số hóa đơn:</strong> {customer.selectedCustomer.totalInvoices}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={customer.closeModal}>Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {customer.modalState === "resetPassword" && (
        <>
          {/* Lớp mờ nền */}
          <div
            className="modal-backdrop fade show"
            onClick={customer.closeModal}
          ></div>

          {/* Modal chính */}
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={customer.handleResetPassword}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Đặt lại mật khẩu{" "}
                      {customer.selectedCustomer && (
                        <span className="text-primary">
                          ({customer.selectedCustomer.fullName})
                        </span>
                      )}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={customer.closeModal}
                    ></button>
                  </div>

                  <div className="modal-body">
                    {/* Mật khẩu mới */}
                    <div className="mb-3">
                      <label className="form-label">
                        Mật khẩu mới <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={customer.showPassword ? "text" : "password"}
                          name="newPassword"
                          className={`form-control pe-5 ${
                            customer.formErrors.newPassword ? "is-invalid" : ""
                          }`}
                          placeholder="Nhập mật khẩu mới"
                          value={customer.formValues.newPassword || ""}
                          onChange={customer.handleInputChange}
                          autoFocus
                        />
                         <i
                          className={`bi ${customer.showPassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                          style={{ cursor: "pointer" }}
                          onClick={() => customer.setShowPassword(!customer.showPassword)}
                        ></i>
                      </div>
                      {customer.formErrors.newPassword && (
                        <div className="invalid-feedback">
                          {customer.formErrors.newPassword}
                        </div>
                      )}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div className="mb-3">
                      <label className="form-label">
                        Nhập lại mật khẩu mới <span className="text-danger">*</span>
                      </label>
                      <div className="position-relative">
                        <input
                          type={customer.showRePassword ? "text" : "password"}
                          name="confirmNewPassword"
                          className={`form-control pe-5 ${
                            customer.formErrors.confirmNewPassword ? "is-invalid" : ""
                          }`}
                          placeholder="Nhập lại mật khẩu mới"
                          value={customer.formValues.confirmNewPassword || ""}
                          onChange={customer.handleInputChange}
                        />
                         <i
                          className={`bi ${customer.showRePassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                          style={{ cursor: "pointer" }}
                          onClick={() => customer.setShowRePassword(!customer.showRePassword)}
                        ></i>
                      </div>
                      
                      {customer.formErrors.confirmNewPassword && (
                        <div className="invalid-feedback">
                          {customer.formErrors.confirmNewPassword}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={customer.closeModal}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={customer.isSubmitting}
                    >
                      {customer.isSubmitting ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật mật khẩu"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}



    </div>
  );
}
