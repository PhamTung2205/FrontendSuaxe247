import { useStaff } from "../../../assets/js/Staff";

export default function StaffPage() {
  const staff = useStaff(); // tất cả state & function đều ở đây

  return (
    <div className="container pt-2">
      {staff.loadingRole ? (
        <div className="text-center text-muted">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang kiểm tra quyền truy cập...</p>
        </div>
      ) : !["Quản lý cửa hàng", "Quản lý hệ thống", "Admin"].includes(staff.userRole) ? (
        <div className="alert alert-danger text-center">
          Bạn không có quyền truy cập chức năng này.
        </div>
      ) : (
        <>
        {/* Tiêu đề */}
            <h3 className="text-center mb-3">
              Danh sách nhân viên
            </h3>

            {/* Bộ lọc */}
            <div className="row g-2 mb-3 align-items-end">
              {(staff.userRole === "Quản lý hệ thống" || staff.userRole === "Admin") && (
                <div className="col-12 col-md-3">
                  <label htmlFor="storeSelect" className="form-label">Cửa hàng</label>
                  <select
                    id="storeSelect"
                    className="form-select"
                    value={staff.selectedStoreId}
                    onChange={(e) => staff.setSelectedStoreId(e.target.value)}
                  >
                    <option value="all">-- Tất cả cửa hàng --</option>
                    {staff.stores.map((store) => (
                      <option key={store.PK_idStore} value={store.PK_idStore}>
                        {store.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(() => {
                const colSize =
                  (staff.userRole === "Quản lý hệ thống" || staff.userRole === "Admin") ? [2, 2, 3, 2] : [3, 3, 3, 3];
                return (
                  <>
                    {/* Tìm kiếm */}
                    <div className={`col-12 col-md-${colSize[0]}`}>
                      <label htmlFor="searchInput" className="form-label">Tên nhân viên</label>
                      <input
                        id="searchInput"
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm theo tên..."
                        value={staff.inputValue}
                        onChange={(e) => staff.setInputValue(e.target.value)}
                      />
                    </div>

                    {/* Giới tính */}
                    <div className={`col-6 col-md-${colSize[1]}`}>
                      <label htmlFor="genderSelect" className="form-label">Giới tính</label>
                      <select
                        id="genderSelect"
                        className="form-select"
                        value={staff.selectedGender}
                        onChange={(e) => staff.setSelectedGender(e.target.value)}
                      >
                        <option value="all">-- Giới tính --</option>
                        <option value="0">Nam</option>
                        <option value="1">Nữ</option>
                      </select>
                    </div>

                    {/* Chức vụ */}
                    <div className={`col-6 col-md-${colSize[2]}`}>
                      <label htmlFor="roleSelect" className="form-label">Chức vụ</label>
                      <select
                        id="roleSelect"
                        className="form-select"
                        value={staff.selectedCategoryId}
                        onChange={(e) => staff.setSelectedCategoryId(e.target.value)}
                      >
                        <option value="all">-- Tất cả chức vụ --</option>
                        {staff.roles.map((role) => (
                          <option key={role.PK_idRole} value={role.PK_idRole}>
                            {role.roleName}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Nút thêm — thẳng hàng với các input */}
                    {(staff.userRole === "Quản lý hệ thống" || staff.userRole === "Admin") && (
                      <div className={`col-12 col-md-${colSize[3]} d-grid`}>
                        <label className="form-label">&nbsp;</label> {/* label trống để canh hàng */}
                        <button className="btn btn-primary" onClick={staff.openCreateModal}>
                          Thêm nhân viên
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>



            {/* Bảng danh sách */}
            {staff.loading && <p>Đang tải dữ liệu...</p>}

            {staff.error && !staff.loading && (
              <p className="text-danger">{staff.error.message}</p>
            )}

            {!staff.loading && staff.users.length === 0 && !staff.error && (
              <div className="alert alert-secondary text-center">
                Không có nhân viên nào!
              </div>
            )}

            {!staff.loading && staff.users.length > 0 && (
              <>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered">
                    <thead className="table-dark text-center">
                      <tr>
                        <th>STT</th>
                        <th>Mã</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Giới tính</th>
                        <th>Chức vụ</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.users.map((u, index) => (
                        <tr key={u.PK_idUser}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{u.PK_idUser}</td>
                          <td>{u.fullName}</td>
                          <td>{u.email}</td>
                          <td className="text-center">{u.phone}</td>
                          <td className="text-center">{u.gender === "1" ? "Nữ" : "Nam"}</td>
                          <td>{u.roleName}</td>
                          <td className="text-center">
                            <button
                              className="btn btn-info btn-sm me-1"
                              onClick={() => staff.openViewModal(u.PK_idUser)}
                            >
                              Xem
                            </button>
                            {(staff.userRole === "Quản lý hệ thống" || staff.userRole === "Admin") && (
                              <>
                                <button
                                  className="btn btn-warning btn-sm me-1"
                                  onClick={() => staff.openEditModal(u)}
                                >
                                  Sửa
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => staff.openDeleteModal(u)}
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Phân trang */}
                <nav>
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${staff.page === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => staff.setPage(staff.page - 1)}>
                        «
                      </button>
                    </li>

                    {staff.getPageNumbers().map((p, i) => (
                      <li
                        key={i}
                        className={`page-item ${p === staff.page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}
                      >
                        <button
                          className="page-link"
                          onClick={() => p !== "..." && staff.setPage(p)}
                        >
                          {p}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${staff.page === Math.ceil(staff.total / staff.perPage) ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => staff.setPage(staff.page + 1)}>
                        »
                      </button>
                    </li>
                  </ul>
                </nav>
              </>
            )}
        </>
      )}
      


      {staff.modalState === "create" && (
        <>
          <div className="modal-backdrop fade show" onClick={staff.closeModal}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={staff.handleSubmit}>
                  <div className="modal-header">
                    <h5 className="modal-title">Thêm nhân viên</h5>
                    <button type="button" className="btn-close" onClick={staff.closeModal}></button>
                  </div>
                  <div className="modal-body">
                    <div className="row g-3">
                      {/* Hàng 1: Họ tên, Email */}
                      <div className="col-md-6">
                        <label className="form-label">Họ tên <span className="text-danger">*</span></label>
                        <input className="form-control" name="fullName" placeholder="Nhập họ tên"
                          value={staff.formValues.fullName} onChange={staff.handleInputChange} />
                        {staff.formErrors.fullName && <div className="text-danger">{staff.formErrors.fullName}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email <span className="text-danger">*</span></label>
                        <input className="form-control" name="email" placeholder="Nhập email"
                          value={staff.formValues.email} onChange={staff.handleInputChange} />
                        {staff.formErrors.email && <div className="text-danger">{staff.formErrors.email}</div>}
                      </div>

                      {/* Hàng 2: Số điện thoại, Giới tính */}
                      <div className="col-md-6">
                        <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                        <input className="form-control" name="phone" placeholder="Nhập số điện thoại"
                          value={staff.formValues.phone} onChange={staff.handleInputChange} />
                        {staff.formErrors.phone && <div className="text-danger">{staff.formErrors.phone}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Giới tính <span className="text-danger">*</span></label>
                        <select className="form-select" name="gender" value={staff.formValues.gender}
                          onChange={staff.handleInputChange}>
                          <option value="0">Nam</option>
                          <option value="1">Nữ</option>
                        </select>
                      </div>

                      {/* Hàng 3: Ngày sinh, Địa chỉ */}
                      <div className="col-md-6">
                        <label className="form-label">Ngày sinh <span className="text-danger">*</span></label>
                        <input className="form-control" type="date" name="birthDate"
                          value={staff.formValues.birthDate} onChange={staff.handleInputChange} />
                        {staff.formErrors.birthDate && <div className="text-danger">{staff.formErrors.birthDate}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Địa chỉ</label>
                        <input className="form-control" name="address" placeholder="Nhập địa chỉ"
                          value={staff.formValues.address} onChange={staff.handleInputChange} />
                      </div>

                      {/* Hàng 4: Mật khẩu, Xác nhận mật khẩu */}
                      <div className="col-md-6">
                        <label className="form-label">Mật khẩu <span className="text-danger">*</span></label>
                        <div className="position-relative">
                          <input className="form-control pe-5" type={staff.showCreatePassword ? "text" : "password"} 
                            name="password" placeholder="Nhập mật khẩu"
                            value={staff.formValues.password} onChange={staff.handleInputChange} /> 
                          <i
                            className={`bi ${staff.showCreatePassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                            style={{ cursor: "pointer" }}
                            onClick={() => staff.setShowCreatePassword(!staff.showCreatePassword)}
                          ></i>
                        </div>
                        {staff.formErrors.password && <div className="text-danger">{staff.formErrors.password}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Xác nhận mật khẩu <span className="text-danger">*</span></label>
                        <div className="position-relative">
                          <input className="form-control" type={staff.showReCreatePassword ? "text" : "password"} 
                            name="confirmPassword" placeholder="Nhập lại mật khẩu"
                            value={staff.formValues.confirmPassword || ""}
                            onChange={staff.handleInputChange} />
                          <i
                            className={`bi ${staff.showReCreatePassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                            style={{ cursor: "pointer" }}
                            onClick={() => staff.setShowReCreatePassword(!staff.showReCreatePassword)}
                          ></i>
                        </div>
                        {staff.formErrors.confirmPassword &&
                          <div className="text-danger">{staff.formErrors.confirmPassword}</div>}
                      </div>

                      {/* Hàng 5: Chức vụ, Cửa hàng */}
                      <div className="col-md-6">
                        <label className="form-label">Chức vụ <span className="text-danger">*</span></label>
                        <select className="form-select" name="FK_idRole"
                          value={staff.formValues.FK_idRole} onChange={staff.handleInputChange}>
                          <option value="">-- Chọn chức vụ --</option>
                          {staff.roles.map(r => <option key={r.PK_idRole} value={r.PK_idRole}>{r.roleName}</option>)}
                        </select>
                        {staff.formErrors.FK_idRole && <div className="text-danger">{staff.formErrors.FK_idRole}</div>}
                      </div>

                      {staff.showStoreField() && (
                        <div className="col-md-6">
                          <label className="form-label">Cửa hàng <span className="text-danger">*</span></label>
                          <select className="form-select" name="FK_idStore"
                            value={staff.formValues.FK_idStore} onChange={staff.handleInputChange}>
                            <option value="">-- Chọn Cửa hàng --</option>
                            {staff.stores.map(s => (
                              <option key={s.PK_idStore} value={s.PK_idStore}>{s.address}</option>
                            ))}
                          </select>
                          {staff.formErrors.FK_idStore &&
                            <div className="text-danger">{staff.formErrors.FK_idStore}</div>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={staff.closeModal}>Hủy</button>
                    <button type="submit" className="btn btn-primary" disabled={staff.isSubmitting}>
                      {staff.isSubmitting ? "Đang lưu..." : "Lưu"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Modal xem + xóanhân viên */}
      {(staff.modalState === "view" || staff.modalState === "delete") && staff.selectedUser && (
        <>
          <div className="modal-backdrop fade show" onClick={staff.closeModal}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                {/* Header */}
                <div className="modal-header">
                  <h5 className="modal-title">
                    {staff.modalState === "view" ? "Thông tin nhân viên" : "Bạn có chắc chắn muốn xóa nhân viên?"}
                  </h5>
                  <button type="button" className="btn-close" onClick={staff.closeModal}></button>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6"><strong>Mã nhân viên:</strong> {staff.selectedUser.PK_idUser}</div>
                    <div className="col-md-6"><strong>Họ tên:</strong> {staff.selectedUser.fullName}</div>
                    <div className="col-md-6"><strong>Email:</strong> {staff.selectedUser.email}</div>
                    <div className="col-md-6"><strong>SĐT:</strong> {staff.selectedUser.phone}</div>
                    {staff.modalState === "view" && (
                      <>
                        <div className="col-md-6"><strong>Giới tính:</strong> {staff.selectedUser.gender === "1" ? "Nữ" : "Nam"}</div>
                        <div className="col-md-6"><strong>Ngày sinh:</strong> {staff.selectedUser.birthDate}</div>
                        <div className="col-12"><strong>Địa chỉ:</strong> {staff.selectedUser.address}</div>
                      </>
                    )}
                    <div className="col-md-6"><strong>Chức vụ:</strong> {staff.selectedUser.roleName}</div>
                    {staff.selectedUser.storeAddress && (
                      <div className="col-md-6"><strong>Cửa hàng:</strong> {staff.selectedUser.storeAddress}</div>
                    )}
                  </div>
                  {staff.modalState === "delete" && (
                    <div className="alert alert-warning mt-3 mb-0 py-3">
                      <small>
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
                      </small>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer">
                  {staff.modalState === "delete" ? (
                    <>
                      <button type="button" className="btn btn-secondary" onClick={staff.closeModal}>
                        Hủy
                      </button>
                      <button type="button" className="btn btn-danger" onClick={staff.handleDelete}>
                        Xóa
                      </button>
                    </>
                  ) : (
                    <button type="button" className="btn btn-secondary" onClick={staff.closeModal}>
                      Đóng
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal sửa nhân viên */}
      {staff.modalState === "edit" && (
        <>
          <div className="modal-backdrop fade show" onClick={staff.closeModal}></div>
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sửa thông tin nhân viên</h5>
                  <button type="button" className="btn-close" onClick={staff.closeModal}></button>
                </div>
                <form onSubmit={staff.handleUpdate}>
                  <div className="modal-body">
                    <div className="row g-3">
                      {/* Họ tên */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Họ tên <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          className={`form-control ${staff.formErrors.fullName ? "is-invalid" : ""}`}
                          value={staff.formValues.fullName}
                          onChange={staff.handleInputChange}
                        />
                        <div className="invalid-feedback">{staff.formErrors.fullName}</div>
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control ${staff.formErrors.email ? "is-invalid" : ""}`}
                          value={staff.formValues.email}
                          onChange={staff.handleInputChange}
                        />
                        <div className="invalid-feedback">{staff.formErrors.email}</div>
                      </div>

                      {/* SĐT */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Số điện thoại <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          className={`form-control ${staff.formErrors.phone ? "is-invalid" : ""}`}
                          value={staff.formValues.phone}
                          onChange={staff.handleInputChange}
                        />
                        <div className="invalid-feedback">{staff.formErrors.phone}</div>
                      </div>

                      {/* Giới tính */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Giới tính <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          name="gender"
                          value={staff.formValues.gender}
                          onChange={staff.handleInputChange}
                        >
                          <option value="0">Nam</option>
                          <option value="1">Nữ</option>
                        </select>
                      </div>

                      {/* Ngày sinh */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Ngày sinh <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          name="birthDate"
                          className={`form-control ${staff.formErrors.birthDate ? "is-invalid" : ""}`}
                          value={staff.formValues.birthDate}
                          onChange={staff.handleInputChange}
                        />
                        <div className="invalid-feedback">{staff.formErrors.birthDate}</div>
                      </div>

                      {/* Địa chỉ */}
                      <div className="col-md-6">
                        <label className="form-label">Địa chỉ</label>
                        <input
                          type="text"
                          name="address"
                          className="form-control"
                          value={staff.formValues.address}
                          onChange={staff.handleInputChange}
                        />
                      </div>

                      {/* Chức vụ */}
                      <div className="col-md-6">
                        <label className="form-label">
                          Chức vụ <span className="text-danger">*</span>
                        </label>
                        <select
                          className={`form-select ${staff.formErrors.FK_idRole ? "is-invalid" : ""}`}
                          name="FK_idRole"
                          value={staff.formValues.FK_idRole}
                          onChange={staff.handleInputChange}
                        >
                          <option value="">-- Chọn chức vụ --</option>
                          {staff.roles.map((r) => (
                            <option key={r.PK_idRole} value={r.PK_idRole}>
                              {r.roleName}
                            </option>
                          ))}
                        </select>
                        <div className="invalid-feedback">{staff.formErrors.FK_idRole}</div>
                      </div>

                      {/* Cửa hàng */}
                      {staff.showStoreField() && (
                        <div className="col-md-6">
                          <label className="form-label">
                            Cửa hàng <span className="text-danger">*</span>
                          </label>
                          <select
                            className={`form-select ${staff.formErrors.FK_idStore ? "is-invalid" : ""}`}
                            name="FK_idStore"
                            value={staff.formValues.FK_idStore}
                            onChange={staff.handleInputChange}
                          >
                            <option value="">-- Chọn Cửa hàng --</option>
                            {staff.stores.map((s) => (
                              <option key={s.PK_idStore} value={s.PK_idStore}>
                                {s.address}
                              </option>
                            ))}
                          </select>
                          <div className="invalid-feedback">{staff.formErrors?.FK_idStore}</div>
                        </div>
                      )}

                      {/* Đặt lại mật khẩu */}
                      <div className="col-12 mt-3">
                        <div className="form-check">
                          <input
                            className="form-check-input border border-1 border-dark"
                            type="checkbox"
                            id="resetPassword"
                            checked={staff.resetPassword}
                            onChange={(e) => staff.setResetPassword(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="resetPassword">
                            Đặt lại mật khẩu
                          </label>
                        </div>
                      </div>


                      {staff.resetPassword && (
                        <>
                          <div className="col-md-6">
                            <label className="form-label">
                              Mật khẩu mới <span className="text-danger">*</span>
                            </label>
                            <div className="position-relative">
                              <input
                                type={staff.showUpdatePassword ? "text" : "password"}
                                name="newPassword"
                                className={`form-control pe-5 ${staff.formErrors.newPassword ? "is-invalid" : ""}`}
                                placeholder="Nhập mật khẩu mới"
                                value={staff.formValues.newPassword || ""}
                                onChange={staff.handleInputChange}
                              />
                              <i
                                className={`bi ${staff.showUpdatePassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                                style={{ cursor: "pointer" }}
                                onClick={() => staff.setShowUpdatePassword(!staff.showUpdatePassword)}
                              ></i>
                            </div>
                            <div className="invalid-feedback">{staff.formErrors.newPassword}</div>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label">
                              Nhập lại mật khẩu mới <span className="text-danger">*</span>
                            </label>
                            <div className="position-relative">
                              <input
                                type={staff.showReUpdatePassword ? "text" : "password"}
                                name="confirmNewPassword"
                                className={`form-control pe-5 ${staff.formErrors.confirmNewPassword ? "is-invalid" : ""}`}
                                placeholder="Nhập lại mật khẩu mới"
                                value={staff.formValues.confirmNewPassword || ""}
                                onChange={staff.handleInputChange}
                              />
                              <i
                                className={`bi ${staff.showReUpdatePassword ? "bi-eye" : "bi-eye-slash"} position-absolute top-50 end-0 translate-middle-y me-3`}
                                style={{ cursor: "pointer" }}
                                onClick={() => staff.setShowReUpdatePassword(!staff.showReUpdatePassword)}
                              ></i>
                            </div>
                            <div className="invalid-feedback">{staff.formErrors.confirmNewPassword}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={staff.closeModal}>
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={staff.isSubmitting}>
                      {staff.isSubmitting ? "Đang lưu..." : "Cập nhật"}
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
