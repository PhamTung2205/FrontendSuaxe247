// pages/SparePart/Spare_Part.jsx

import React from 'react';
import { useSparePart } from '../../../assets/js/SparePart';

const LoadingSpinner = ({ message }) => (
  <div className="d-flex justify-content-center align-items-center p-5">
    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">{message}</span></div>
    <span className="ms-3">{message}</span>
  </div>
);

const SparePartActions = ({ sparePart }) => (
  <div className="row g-2 mb-3 align-items-center">
    {/* Input tìm kiếm với label */}
    <div className="col-12 col-md-4 d-flex align-items-center">
      <label htmlFor="sparePartSearch" className="form-label mb-0 me-2 col-auto">
        Tên phụ tùng:
      </label>
      <input
        id="sparePartSearch"
        ref={sparePart.searchInputRef}
        type="text"
        className="form-control col"
        placeholder="Tìm theo tên phụ tùng..."
        value={sparePart.inputValue}
        onChange={e => sparePart.setInputValue(e.target.value)}
        disabled={sparePart.isSubmitting || sparePart.isTableLoading}
      />
    </div>

    <div className="col"></div>

    {/* Nút Thêm mới */}
    <div className="col-12 col-md-2 d-grid">
      {sparePart.canManage && (
        <button className="btn btn-primary" onClick={() => sparePart.openModal('create')}>
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

const SparePartTable = ({ data, categories, canManage, openModal, isTableLoading }) => {
  const categoryMap = new Map(categories.map(c => [c.PK_idCategory, c.categoryName]));

  return (
    <div className="position-relative">
      {isTableLoading && <TableLoadingOverlay />}
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark text-center">
            <tr>
              <th>STT</th><th>Mã</th><th>Tên phụ tùng</th><th>Danh mục</th><th>Đơn vị</th>
              <th className="text-end">Giá mua</th><th className="text-end">Giá bán</th><th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.PK_idSparePart}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{item.PK_idSparePart}</td>
                <td>{item.sparePartName}</td>
                <td>{categoryMap.get(item.FK_idCategory) || 'N/A'}</td>
                <td className="text-center">{item.unit}</td>
                  <td className="text-end">{Number(item.purchasePrice).toLocaleString('vi-VN')} đ</td>
                  <td className="text-end">{Number(item.salePrice).toLocaleString('vi-VN')} đ</td>
                  <td className="text-center text-nowrap">
                    <button className="btn btn-info btn-sm me-2 text-white" onClick={() => openModal('view', item)}>Xem</button>
                    {canManage && (
                      <>
                        <button className="btn btn-warning btn-sm me-2" onClick={() => openModal('edit', item)}>Sửa</button>
                        <button className="btn btn-danger btn-sm" onClick={() => openModal('delete', item)}>Xóa</button>
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
};

const Pagination = ({ sparePart }) => {
  if (sparePart.getPageNumbers().length === 0) return null;
  const totalPages = Math.ceil(sparePart.total / sparePart.perPage);
  return (
    <nav className="mt-3">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${sparePart.page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => sparePart.handlePageChange(sparePart.page - 1)}>Trước</button>
        </li>
        {sparePart.getPageNumbers().map((p, i) => (
          <li key={i} className={`page-item ${p === sparePart.page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => p !== "..." && sparePart.handlePageChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${sparePart.page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => sparePart.handlePageChange(sparePart.page + 1)}>Sau</button>
        </li>
      </ul>
    </nav>
  );
};

const SparePartModal = ({ sparePart }) => {
  if (!sparePart.modalState) return null;
  const modalTitles = {
    view: 'Chi tiết Phụ tùng',
    create: 'Thêm Phụ tùng mới',
    edit: 'Cập nhật Phụ tùng',
    delete: 'Xác nhận Xóa'
  };
  return (
    <>
      <div className="modal-backdrop fade show" onClick={sparePart.closeModal}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitles[sparePart.modalState]}</h5>
              <button type="button" className="btn-close" onClick={sparePart.closeModal}></button>
              </div>
            <div className="modal-body">
              {sparePart.modalState === 'view' && <ModalContentView sparePart={sparePart} />}
              {(sparePart.modalState === 'create' || sparePart.modalState === 'edit') && <ModalContentForm sparePart={sparePart} />}
              {sparePart.modalState === 'delete' && <ModalContentDelete sparePart={sparePart} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const ModalContentView = ({ sparePart }) => {
  const category = sparePart.categories.find(c => c.PK_idCategory === sparePart.formValues.FK_idCategory);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    return new Date(dateString).toLocaleString('vi-VN', options);
  };

  return (
    <>
      <div className="row g-3">
        <div className="col-md-6"><strong>Mã phụ tùng:</strong> {sparePart.formValues.PK_idSparePart}</div>
        <div className="col-md-6"><strong>Tên phụ tùng:</strong> {sparePart.formValues.sparePartName}</div>
        <div className="col-md-6"><strong>Danh mục:</strong> {category ? category.categoryName : 'Không xác định'}</div>
        <div className="col-md-6"><strong>Đơn vị:</strong> {sparePart.formValues.unit}</div>
        <div className="col-md-6"><strong>Giá mua:</strong> {Number(sparePart.formValues.purchasePrice).toLocaleString('vi-VN')} VNĐ</div>
        <div className="col-md-6"><strong>Giá bán:</strong> {Number(sparePart.formValues.salePrice).toLocaleString('vi-VN')} VNĐ</div>
        <div className="col-12"><strong>Mô tả:</strong> {sparePart.formValues.description || "—"}</div>
        <div className="col-md-6"><strong>Ngày tạo:</strong> {formatDate(sparePart.formValues.created)}</div>
        <div className="col-md-6"><strong>Ngày cập nhật:</strong> {formatDate(sparePart.formValues.updated)}</div>
      </div>
      <div className="modal-footer mt-3 pb-0 border-0">
        <button type="button" className="btn btn-secondary" onClick={sparePart.closeModal}>Đóng</button>
      </div>
    </>
  );
};

const ModalContentForm = ({ sparePart }) => (
  <form onSubmit={sparePart.handleSubmit} noValidate>
    <div className="row g-3">
            <div className="col-md-6">
        <label className="form-label">Mã phụ tùng <span className="text-danger">*</span></label>
        <input type="text" name="PK_idSparePart" placeholder = "Nhập mã phụ tùng"
          value={sparePart.formValues.PK_idSparePart} onChange={sparePart.handleFormChange} disabled={sparePart.modalState === 'edit'} className={`form-control ${sparePart.formErrors.PK_idSparePart ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{sparePart.formErrors.PK_idSparePart}</div>
      </div>
            <div className="col-md-6">
        <label className="form-label">Tên phụ tùng <span className="text-danger">*</span></label>
        <input type="text" name="sparePartName" placeholder = "Nhập tên phụ tùng"
          value={sparePart.formValues.sparePartName} onChange={sparePart.handleFormChange} className={`form-control ${sparePart.formErrors.sparePartName ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{sparePart.formErrors.sparePartName}</div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Danh mục <span className="text-danger">*</span></label>
        <select name="FK_idCategory" value={sparePart.formValues.FK_idCategory} onChange={sparePart.handleFormChange} className={`form-select ${sparePart.formErrors.FK_idCategory ? 'is-invalid' : ''}`}>
          <option value="">-- Chọn danh mục --</option>
          {sparePart.categories.map(category => (
            <option key={category.PK_idCategory} value={category.PK_idCategory}>{category.categoryName}</option>
          ))}
        </select>
        <div className="invalid-feedback">{sparePart.formErrors.FK_idCategory}</div>
      </div>
            <div className="col-md-6">
        <label className="form-label">Đơn vị <span className="text-danger">*</span></label>
        <input type="text" name="unit" placeholder = "Nhập đơn vị phụ tùng"
          value={sparePart.formValues.unit} onChange={sparePart.handleFormChange} className={`form-control ${sparePart.formErrors.unit ? 'is-invalid' : ''}`} />
        <div className="invalid-feedback">{sparePart.formErrors.unit}</div>
      </div>
            <div className="col-md-6">
        <label className="form-label">Giá mua (VNĐ) <span className="text-danger">*</span></label>
        <input
          type="text"
          name="purchasePrice"
          value={sparePart.formValues.purchasePrice}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) sparePart.handleFormChange(e);
          }}
          placeholder="Nhập giá mua"
          className={`form-control ${sparePart.formErrors.purchasePrice ? 'is-invalid' : ''}`}
        />
        <div className="invalid-feedback">{sparePart.formErrors.purchasePrice}</div>
      </div>
      <div className="col-md-6">
        <label className="form-label">Giá bán (VNĐ) <span className="text-danger">*</span></label>
        <input
          type="text"
          name="salePrice"
          value={sparePart.formValues.salePrice}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) sparePart.handleFormChange(e);
          }}
          placeholder="Nhập giá bán"
          className={`form-control ${sparePart.formErrors.salePrice ? 'is-invalid' : ''}`}
        />
        <div className="invalid-feedback">{sparePart.formErrors.salePrice}</div>

      </div>
      <div className="col-12">
        <label className="form-label">Mô tả</label>
        <textarea name="description" placeholder = "Nhập mô tả phụ tùng"
          value={sparePart.formValues.description} onChange={sparePart.handleFormChange} className="form-control" rows="3"></textarea>
      </div>
    </div>
    <div className="modal-footer mt-3 pb-0">
      <button type="button" className="btn btn-secondary" onClick={sparePart.closeModal}>Hủy</button>
      <button type="submit" className="btn btn-primary" disabled={sparePart.isSubmitting}>
        {sparePart.isSubmitting ? 'Đang lưu...' : 'Lưu'}
      </button>
    </div>
    </form>
);

const ModalContentDelete = ({ sparePart }) => (
    <div>
    <p>Bạn có chắc chắn muốn xóa phụ tùng <b>{sparePart.formValues.sparePartName}</b>?</p>
    <div className="alert alert-warning mt-3 mb-0">
      <small>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
      </small>
    </div>
    <div className="modal-footer mt-3 pb-0">
      <button type="button" className="btn btn-secondary" onClick={sparePart.closeModal}>Hủy</button>
      <button type="button" className="btn btn-danger" onClick={sparePart.confirmDelete} disabled={sparePart.isSubmitting}>
        {sparePart.isSubmitting ? 'Đang xóa...' : 'Xóa'}
      </button>
    </div>
    </div>
);

export default function SparePart() {
  const sparePart = useSparePart();

  const renderContent = () => {
    if (sparePart.loading) {
      return <LoadingSpinner message="Đang tải dữ liệu..." />;
    }
    if (sparePart.error) {
      return <div className="alert alert-danger text-center">Lỗi: {sparePart.error.message}</div>;
    }
    return (
      <>
        <SparePartActions sparePart={sparePart} />
        {!sparePart.isTableLoading && sparePart.data.length === 0 ? (
          <div className="text-center p-4">Không tìm thấy phụ tùng nào.</div>
        ) : (
          <>
              <SparePartTable
                data={sparePart.data}
                categories={sparePart.categories}
                canManage={sparePart.canManage}
                openModal={sparePart.openModal}
                isTableLoading={sparePart.isTableLoading}
              />
              <Pagination sparePart={sparePart} />
            </>
        )}
      </>
    );
  };

  if (sparePart.isAuthLoading) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Danh sách phụ tùng</h3>
        <LoadingSpinner message="Đang xác thực..." />
      </div>
    );
  }

  if (!sparePart.canView) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Danh sách phụ tùng</h3>
        <div className="alert alert-danger text-center">Bạn không có quyền truy cập vào chức năng này.</div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Danh sách phụ tùng</h3>
      <div className="mt-3">
        {renderContent()}
      </div>
      <SparePartModal sparePart={sparePart} />
    </div>
  );
}