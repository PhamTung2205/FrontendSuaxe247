// pages/SparePart/Spare_Part_Category.jsx

import React from 'react';
import { useSparePartCategory } from '../../../assets/js/SparePartCategory';

const LoadingSpinner = ({ message }) => (
  <div className="d-flex justify-content-center align-items-center p-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">{message}</span>
        </div>
    <span className="ms-3">{message}</span>
  </div>
);

const CategoryActions = ({ category }) => (
  <div className="row g-2 mb-3 align-items-center">
    {/* Input tìm kiếm với label */}
    <div className="col-12 col-md-4 d-flex align-items-center">
      <label htmlFor="categorySearch" className="form-label mb-0 me-2 col-auto">
        Tên danh mục:
      </label>
      <input
        id="categorySearch"
        ref={category.searchInputRef}
        type="text"
        className="form-control col"
        placeholder="Tìm kiếm theo tên danh mục..."
        value={category.inputValue}
        onChange={(e) => category.setInputValue(e.target.value)}
        disabled={category.isSubmitting || category.isTableLoading}
      />
    </div>

    <div className="col"></div>

    {/* Nút Thêm mới */}
    <div className="col-12 col-md-2 d-grid">
      {category.canManage && (
        <button
          className="btn btn-primary"
          onClick={() => category.openModal('create')}
        >
          Thêm mới
        </button>
      )}
    </div>
  </div>

);

const TableLoadingOverlay = () => (
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(255, 255, 255, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 10, borderRadius: 'var(--bs-border-radius)'
  }}>
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const CategoryTable = ({ data, canManage, openModal, isTableLoading }) => (
  <div className="position-relative">
    {isTableLoading && <TableLoadingOverlay />}
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead className="table-dark text-center">
          <tr>
            <th>STT</th><th>Mã</th><th>Tên danh mục</th><th>Mô tả</th><th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c, index) => (
            <tr key={c.PK_idCategory}>
              <td className="text-center">{index + 1}</td>
              <td className="text-center">{c.PK_idCategory}</td>
              <td>{c.categoryName}</td>
              <td>{c.description || "—"}</td>
              <td className="text-nowrap text-center">
                <button className="btn btn-info btn-sm me-2 text-white" onClick={() => openModal('view', c)}>Xem</button>
                {canManage && (
                  <>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => openModal('edit', c)}>Sửa</button>
                    <button className="btn btn-danger btn-sm" onClick={() => openModal('delete', c)}>Xóa</button>
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

const Pagination = ({ category }) => {
  if (category.getPageNumbers().length === 0) return null;
  const totalPages = Math.ceil(category.total / category.perPage);

  return (
    <nav className="mt-3">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${category.page === 1 ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => category.handlePageChange(category.page - 1)}>«</button>
        </li>
        {category.getPageNumbers().map((p, i) => (
          <li key={i} className={`page-item ${p === category.page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => p !== "..." && category.handlePageChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${category.page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => category.handlePageChange(category.page + 1)}>»</button>
        </li>
      </ul>
        </nav>
  );
};

const CategoryModal = ({ category }) => {
  if (!category.modalState) return null;

  const modalTitles = {
    view: 'Chi tiết danh mục',
    create: 'Thêm danh mục mới',
    edit: 'Cập nhật danh mục',
    delete: 'Xác nhận xoá?'
  };

  return (
        <>
      <div className="modal-backdrop fade show" onClick={category.closeModal}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitles[category.modalState]}</h5>
              <button type="button" className="btn-close" onClick={category.closeModal}></button>
            </div>
            <div className="modal-body">
              {category.modalState === 'view' && <ModalContentView category={category} />}
              {(category.modalState === 'create' || category.modalState === 'edit') && <ModalContentForm category={category} />}
              {category.modalState === 'delete' && <ModalContentDelete category={category} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ModalContentView = ({ category }) => (
  <div className="row g-3">
    <div className="col-md-6"><strong>Mã danh mục:</strong> {category.formValues.PK_idCategory}</div>
    <div className="col-md-6"><strong>Tên danh mục:</strong> {category.formValues.categoryName}</div>
    <div className="col-12"><strong>Mô tả:</strong> {category.formValues.description || "—"}</div>
    <div className="col-md-6"><strong>Tạo lúc:</strong> {new Date(category.formValues.created).toLocaleString('vi-VN')}</div>
    <div className="col-md-6"><strong>Cập nhật lúc:</strong> {new Date(category.formValues.updated).toLocaleString('vi-VN')}</div>
  </div>
);

const ModalContentForm = ({ category }) => (
  <form onSubmit={category.handleSubmit} noValidate>
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Mã danh mục <span className="text-danger">*</span></label>
        <input type="text" name="PK_idCategory" placeholder = "Nhập mã danh mục mới"
          value={category.formValues.PK_idCategory} onChange={category.handleFormChange} disabled={category.modalState === 'edit'} className={`form-control ${category.formErrors.PK_idCategory ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{category.formErrors.PK_idCategory}</div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Tên danh mục <span className="text-danger">*</span></label>
        <input type="text" name="categoryName" placeholder = "Nhập tên danh mục mới"
          value={category.formValues.categoryName} onChange={category.handleFormChange} className={`form-control ${category.formErrors.categoryName ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{category.formErrors.categoryName}</div>
      </div>
      <div className="col-12">
        <label className="form-label">Mô tả</label>
        <textarea name="description" placeholder = "Nhập mô tả danh mục"
          value={category.formValues.description} onChange={category.handleFormChange} className="form-control" rows="3" />
      </div>
    </div>
    <div className="modal-footer mt-3 pb-0">
      <button type="button" className="btn btn-secondary" onClick={category.closeModal}>Hủy</button>
      <button type="submit" className="btn btn-primary" disabled={category.isSubmitting}>
        {category.isSubmitting ? 'Đang lưu...' : 'Lưu'}
      </button>
    </div>
  </form>
);

const ModalContentDelete = ({ category }) => (
  <div>
    <p>Bạn có chắc chắn muốn xóa danh mục <b>{category.formValues.PK_idCategory}: {category.formValues.categoryName}</b> ?</p>
    <div className="alert alert-warning mt-3 mb-0">
      <small>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
      </small>
    </div>
    <div className="modal-footer mt-3 pb-0">
      <button type="button" className="btn btn-secondary" onClick={category.closeModal}>Hủy</button>
      <button type="button" className="btn btn-danger" onClick={category.confirmDelete} disabled={category.isSubmitting}>
        {category.isSubmitting ? 'Đang xóa...' : 'Xác nhận'}
      </button>
    </div>
    
  </div>
);

export default function SparePartCategory() {
  const category = useSparePartCategory();

  const renderContent = () => {
    if (category.error) {
      return <div className="alert alert-danger text-center">Lỗi: {category.error.message}</div>;
    }
    if (category.loading) {
      return <LoadingSpinner message="Đang tải dữ liệu..." />;
    }
      return (
        <>
          <CategoryActions category={category} />
          {!category.isTableLoading && category.data.length === 0 ? (
            <div className="text-center p-4">Không tìm thấy danh mục nào.</div>
          ) : (
            <>
                <CategoryTable
                  data={category.data}
                  canManage={category.canManage}
                  openModal={category.openModal}
                  isTableLoading={category.isTableLoading}
                />
                <Pagination category={category} />
              </>
          )}
        </>
    );
  };

  if (category.isAuthLoading) {
    return (
      <div className="container mt-4">
        <h1 className="mb-4 text-center">Quản lý Danh mục Phụ tùng</h1>
        <LoadingSpinner message="Đang xác thực..." />
      </div>
    );
  }

  if (!category.canView) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Danh sách danh mục phụ tùng</h3>
        <div className="alert alert-danger text-center">Bạn không có quyền truy cập vào chức năng này.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Danh sách danh mục phụ tùng</h3>
      <div className="mt-3">
        {renderContent()}
      </div>
      <CategoryModal category={category} />
    </div>
  );
}