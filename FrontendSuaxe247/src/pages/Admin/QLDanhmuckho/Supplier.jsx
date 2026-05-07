// pages/Supplier/Supplier.jsx

import React from 'react';
import { useSupplier } from '../../../assets/js/Supplier';

const LoadingSpinner = ({ message }) => (
  <div className="d-flex justify-content-center align-items-center p-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">{message}</span>
        </div>
    <span className="ms-3">{message}</span>
  </div>
);

const SupplierActions = ({ supplier }) => (
  <div className="row g-2 mb-3 align-items-center">
    {/* Tìm kiếm */}
    <div className="col-12 col-md-4 d-flex align-items-center">
      <label htmlFor="supplierSearch" className="form-label me-3 mb-0" style={{ whiteSpace: 'nowrap' }}>
        Tên nhà cung cấp:
      </label>
      <input
        id="supplierSearch"
        ref={supplier.searchInputRef}
        type="text"
        className="form-control flex-grow-1"
        placeholder="Tìm kiếm theo tên..."
        value={supplier.inputValue}
        onChange={(e) => supplier.setInputValue(e.target.value)}
        disabled={supplier.isSubmitting || supplier.isTableLoading}
      />
    </div>

    <div className="col"></div>

    {/* Nút thêm */}
    <div className="col-12 col-md-2 d-grid">
      {supplier.canManage && (
        <button className="btn btn-primary" onClick={() => supplier.openModal('create')}>
          <i className="bi bi-plus-circle me-2"></i>Thêm mới
        </button>
      )}
    </div>
  </div>
);


const TableLoadingOverlay = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 'var(--bs-border-radius)'
  }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const SupplierTable = ({ data, canManage, openModal, isTableLoading }) => (
  <div className="position-relative">
    {isTableLoading && <TableLoadingOverlay />}
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead className="table-dark text-center">
          <tr>
            <th>STT</th><th>Mã NCC</th><th>Tên nhà cung cấp</th><th>Địa chỉ</th><th>Email</th><th>SĐT</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((s, index) => (
            <tr key={s.PK_idSupplier}>
              <td className="text-center">{index + 1}</td>
              <td className="text-center">{s.PK_idSupplier}</td>
              <td>{s.supplierName}</td>
              <td>{s.address}</td>
              <td>{s.email}</td>
              <td className="text-center">{s.phone}</td>
              <td className="text-nowrap text-center">
                <button className="btn btn-info btn-sm me-2 text-white" onClick={() => openModal('view', s)}>Xem</button>
                {canManage && (
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openModal('edit', s)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" onClick={() => openModal('delete', s)}>Xóa</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Pagination = ({ supplier }) => {
  if (supplier.getPageNumbers().length === 0) return null;
  const totalPages = Math.ceil(supplier.total / supplier.perPage);

  return (
    <nav className="mt-3">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${supplier.page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => supplier.handlePageChange(supplier.page - 1)}>«</button>
        </li>
        {supplier.getPageNumbers().map((p, i) => (
          <li key={i} className={`page-item ${p === supplier.page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => p !== "..." && supplier.handlePageChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${supplier.page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => supplier.handlePageChange(supplier.page + 1)}>»</button>
        </li>
      </ul>
        </nav>
  );
};

const SupplierModal = ({ supplier }) => {
  if (!supplier.modalState) return null;

  const modalTitles = {
    view: 'Chi tiết nhà cung cấp',
    create: 'Thêm nhà cung cấp mới',
    edit: 'Cập nhật thông tin nhà cung cấp',
    delete: 'Xác nhận xóa?'
  };

  return (
        <>
      <div className="modal-backdrop fade show" onClick={supplier.closeModal}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitles[supplier.modalState]}</h5>
              <button type="button" className="btn-close" onClick={supplier.closeModal}></button>
            </div>
            <div className="modal-body">
              {supplier.modalState === 'view' && <ModalContentView supplier={supplier} />}
              {(supplier.modalState === 'create' || supplier.modalState === 'edit') && <ModalContentForm supplier={supplier} />}
              {supplier.modalState === 'delete' && <ModalContentDelete supplier={supplier} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ModalContentView = ({ supplier }) => (
  <div className="row g-3">
    <div className="col-md-6"><strong>Mã nhà cung cấp:</strong> {supplier.formValues.PK_idSupplier}</div>
    <div className="col-md-6"><strong>Tên nhà cung cấp:</strong> {supplier.formValues.supplierName}</div>
    <div className="col-12"><strong>Địa chỉ:</strong> {supplier.formValues.address || "—"}</div>
    <div className="col-md-6"><strong>Email:</strong> {supplier.formValues.email || "—"}</div>
    <div className="col-md-6"><strong>SĐT:</strong> {supplier.formValues.phone || "—"}</div>
    <div className="col-md-6"><strong>Tạo lúc:</strong> {new Date(supplier.formValues.created).toLocaleString('vi-VN')}</div>
    <div className="col-md-6"><strong>Cập nhật lúc:</strong> {new Date(supplier.formValues.updated).toLocaleString('vi-VN')}</div>
  </div>
);

const ModalContentForm = ({ supplier }) => (
  <form onSubmit={supplier.handleSubmit} noValidate>
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Mã nhà cung cấp <span className="text-danger">*</span></label>
        <input type="text" name="PK_idSupplier" placeholder = "Nhập mã nhà cung cấp"
          value={supplier.formValues.PK_idSupplier} onChange={supplier.handleFormChange} disabled={supplier.modalState === 'edit'} className={`form-control ${supplier.formErrors.PK_idSupplier ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{supplier.formErrors.PK_idSupplier}</div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Tên nhà cung cấp <span className="text-danger">*</span></label>
        <input type="text" name="supplierName" placeholder = "Nhập tên nhà cung cấp"
          value={supplier.formValues.supplierName} onChange={supplier.handleFormChange} className={`form-control ${supplier.formErrors.supplierName ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{supplier.formErrors.supplierName}</div>
      </div>
      <div className="col-12">
        <label className="form-label">Địa chỉ <span className="text-danger">*</span></label>
        <input type="text" name="address" placeholder = "Nhập địa chỉ nhà cung cấp"
          value={supplier.formValues.address} onChange={supplier.handleFormChange} className={`form-control ${supplier.formErrors.address ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{supplier.formErrors.address}</div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Email <span className="text-danger">*</span></label>
        <input type="email" name="email" placeholder = "Nhập email nhà cung cấp"
          value={supplier.formValues.email} onChange={supplier.handleFormChange} className={`form-control ${supplier.formErrors.email ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{supplier.formErrors.email}</div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
        <input type="tel" name="phone" placeholder = "Nhập số điện thoại nhà cung cấp"
          value={supplier.formValues.phone} onChange={supplier.handleFormChange} className={`form-control ${supplier.formErrors.phone ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{supplier.formErrors.phone}</div>
      </div>
    </div>
    <div className="modal-footer mt-3 pb-0">
      <button type="button" className="btn btn-secondary" onClick={supplier.closeModal}>Hủy</button>
      <button type="submit" className="btn btn-primary" disabled={supplier.isSubmitting}>
        {supplier.isSubmitting ? 'Đang lưu...' : 'Lưu'}
      </button>
    </div>
  </form>
);

const ModalContentDelete = ({ supplier }) => (
  <div>
    <p>Bạn có chắc chắn muốn xóa nhà cung cấp <b>{supplier.formValues.PK_idSupplier}:  {supplier.formValues.supplierName}</b> ?</p>
    <div className="alert alert-warning mt-3 mb-0">
      <small>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
      </small>
    </div>    
    <div className="modal-footer mt-3 pb-0">
      <button type="button" className="btn btn-secondary" onClick={supplier.closeModal}>Hủy</button>
      <button type="button" className="btn btn-danger" onClick={supplier.confirmDelete} disabled={supplier.isSubmitting}>
        {supplier.isSubmitting ? 'Đang xóa...' : 'Xác nhận'}
      </button>
    </div>
  </div>
);


export default function Supplier() {
  const supplier = useSupplier();

  const renderContent = () => {
    if (supplier.error) {
      return <div className="alert alert-danger text-center">Lỗi: {supplier.error.message}</div>;
    }
    if (supplier.loading) {
      return <LoadingSpinner message="Đang tải dữ liệu..." />;
    }
    return (
      <>
        <SupplierActions supplier={supplier} />
          {!supplier.isTableLoading && supplier.data.length === 0 ? (
            <div className="text-center p-4">Không tìm thấy nhà cung cấp nào.</div>
          ) : (
            <>
                <SupplierTable
                  data={supplier.data}
                  canManage={supplier.canManage}
                  openModal={supplier.openModal}
                  isTableLoading={supplier.isTableLoading}
                />
                <Pagination supplier={supplier} />
              </>
        )}
      </>
    );
  };

  if (supplier.isAuthLoading) {
    return (
      <div className="container mt-4">
        <h1 className="mb-4 text-center">Quản lý Nhà cung cấp</h1>
        <LoadingSpinner message="Đang xác thực..." />
      </div>
    );
  }

  if (!supplier.canView) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Danh sách nhà cung cấp</h3>
        <div className="alert alert-danger text-center">Bạn không có quyền truy cập vào chức năng này.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Danh sách nhà cung cấp</h3>
      <div className="mt-3">
        {renderContent()}
      </div>
      <SupplierModal supplier={supplier} />
    </div>
  );
}