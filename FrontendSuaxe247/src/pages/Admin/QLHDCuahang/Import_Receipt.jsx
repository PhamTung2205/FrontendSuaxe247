import React from 'react';
import { useImportReceipt } from '../../../assets/js/ImportReceipt';

const LoadingSpinner = ({ message }) => (
  <div className="d-flex justify-content-center align-items-center p-5">
    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">{message}</span></div>
    <span className="ms-3">{message}</span>
  </div>
);

const ReceiptHeader = ({ receipt }) => (
  <div className="row g-3 mb-4 align-items-end">
    {receipt.isSystemManager && (
      <div className="col-12 col-lg-3 col-md-6">
        <label htmlFor="storeFilter" className="form-label">Lọc theo cửa hàng:</label>
        <select
          id="storeFilter"
          name="selectedStore"
          value={receipt.filters.selectedStore}
          onChange={receipt.handleFilterChange}
          className="form-select"
          disabled={receipt.isTableLoading}
        >
          <option value="">Tất cả cửa hàng</option>
          {receipt.stores.map(store => (
            <option key={store.PK_idStore} value={store.PK_idStore}>
              {store.address}
            </option>
          ))}
        </select>
      </div>
    )}
    <div className="col-12 col-lg-3 col-md-6">
      <label className="form-label d-block">Tìm kiếm phiếu nhập kho:</label>
      <input
        ref={receipt.searchInputRef}
        type="text"
        className="form-control"
        placeholder="Nhập nhà cung cấp, mã phiếu..."
        value={receipt.inputValue}
        onChange={e => receipt.setInputValue(e.target.value)}
        disabled={receipt.isTableLoading}
      />
    </div>
    <div className="col-6 col-lg-2 col-md-4">
      <label className="form-label">Ngày bắt đầu:</label>
      <input
        type="date"
        name="startDate"
        value={receipt.filters.startDate}
        onChange={receipt.handleFilterChange}
        className="form-control"
        disabled={receipt.isTableLoading}
      />
    </div>
    <div className="col-6 col-lg-2 col-md-4">
      <label className="form-label">Ngày kết thúc:</label>
      <input
        type="date"
        name="endDate"
        value={receipt.filters.endDate}
        onChange={receipt.handleFilterChange}
        className="form-control"
        disabled={receipt.isTableLoading || !receipt.filters.startDate}
        min={receipt.filters.startDate}
      />
    </div>
    {receipt.canManage && (
      <div className="col-12 col-lg-2 col-md-4 d-grid ms-auto">
        <button className="btn btn-primary" onClick={() => receipt.openModal('create')}>
          <i className="bi bi-plus-circle me-2"></i>Tạo Phiếu
        </button>
      </div>
    )}
  </div>
);

const TableLoadingOverlay = () => (
  <div style={{
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(255, 255, 255, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 10, borderRadius: 'var(--bs-border-radius)'
  }}>
    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
  </div>
);

const ReceiptTable = ({ data, stores, canManage, openModal, isTableLoading }) => {
  const storeMap = new Map(stores.map(s => [s.PK_idStore, s.address]));
  return (
    <div className="position-relative">
      {isTableLoading && <TableLoadingOverlay />}
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>STT</th>
              <th>Mã Phiếu</th>
              <th>Cửa hàng</th>
              <th>Nhà cung cấp</th>
              <th>Người tạo</th>
              {/* <th>Ngày tạo</th> */}
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.PK_idImport}>
                <td className="text-center">{index + 1}</td>
                <td>{item.PK_idImport}</td>
                <td>{storeMap.get(item.FK_idStore) || item.FK_idStore}</td>
                <td>{item.supplierName}</td>
                <td>{item.createdByFullName}</td>
                {/* <td>{new Date(item.created).toLocaleString('vi-VN')}</td> */}
                <td className="text-center">
                  <button className="btn btn-info btn-sm text-white" onClick={() => openModal('view', item.PK_idImport)}>Xem</button>
                  {canManage && (
                    <>
                      <button
                        className="btn btn-warning btn-sm ms-2"
                        onClick={() => openModal('edit', item)}>
                        Sửa
                      </button>
                      <button
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => openModal('delete', item)}>
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
    </div>
  );
};

const ModalContentView = ({ receipt }) => {
  const { main, details } = receipt.selectedReceipt;

  const calculatedDetails = details.map(item => {
    const price = parseFloat(item.importPrice || 0);
    const qty = parseInt(item.importedQty);
    const value = price * qty;
    return { ...item, importPrice: price, importedQty: qty, importValue: value };
  });

  const totalImportValue = calculatedDetails.reduce((sum, item) => sum + item.importValue, 0);

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-md-6"><strong>Mã phiếu:</strong> {main.PK_idImport}</div>
        <div className="col-md-6"><strong>Phiếu giao hàng:</strong> {main.deliveryReceipt || 'Không có'}</div>
        <div className="col-md-12"><strong>Cửa hàng:</strong> {main.storeAddress}</div>
        <div className="col-md-6"><strong>Người tạo:</strong> {main.createdByFullName}</div>
        <div className="col-md-6"><strong>Nhà cung cấp:</strong> {main.supplierName}</div>
        <div className="col-md-6"><strong>Ngày tạo:</strong> {new Date(main.created).toLocaleString('vi-VN')}</div>
        <div className="col-md-6"><strong>Cập nhật lúc:</strong> {new Date(main.updated).toLocaleString('vi-VN')}</div>
      </div>
      <h5>Chi tiết phụ tùng</h5>
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Mã Phụ tùng</th>
              <th>Tên Phụ tùng</th>
              <th>Đơn vị</th>
              <th className="text-end">Giá nhập (VNĐ)</th>
              <th className="text-end">Số lượng nhập</th>
              <th className="text-end">Giá trị nhập (VNĐ)</th>
            </tr>
          </thead>
          <tbody>
            {calculatedDetails.map((item, index) => (
              <tr key={index}>
                <td>{item.PK_idSparePart}</td>
                <td>{item.sparePartName}</td>
                <td>{item.unit}</td>
                <td className="text-end">{item.importPrice.toLocaleString('vi-VN')}</td>
                <td className="text-end">{item.importedQty.toLocaleString('vi-VN')}</td>
                <td className="text-end">{item.importValue.toLocaleString('vi-VN')}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="5" className="text-start"><strong>Tổng Giá trị nhập</strong></td>
              <td className="text-end"><strong>{totalImportValue.toLocaleString('vi-VN')}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="modal-footer mt-4 pb-0 border-0">
        <button type="button" className="btn btn-secondary" onClick={receipt.closeModal}>Đóng</button>
        <button
          type="button"
          className="btn btn-success"
          onClick={() => receipt.handleExportReceipt(main, details)}
        >
          <i className="bi bi-file-earmark-arrow-down-fill me-2"></i>Xuất Phiếu
        </button>
      </div>
    </>
  );
};

const ModalContentForm = ({ receipt }) => {
  const isEditMode = receipt.modalState === 'edit';

  const storeName = isEditMode
    ? receipt.selectedReceipt?.main?.storeAddress
    : (receipt.stores.find(s => s.PK_idStore === receipt.storeId)?.address || 'Cửa hàng của bạn');

  const getUnit = (sparePartId) => {
    const sp = receipt.spareParts.find(s => s.PK_idSparePart === sparePartId);
    return sp ? sp.unit : '';
  };
  const selectedSparePartIds = receipt.formValues.details.map(d => d.sparePartId);

  return (
    <form onSubmit={receipt.handleSubmit}>
      <div className="row g-3 mb-3">

        {!isEditMode && (
          <div className="col-md-12">
            <label className="form-label">Cửa hàng nhập</label>
            <input type="text" className="form-control" value={storeName} disabled />
            <input type="hidden" name="storeId" value={receipt.formValues.storeId} />
          </div>
        )}

        <div className="col-md-6">
          <label htmlFor="supplierId" className="form-label">Nhà cung cấp <span className="text-danger">*</span></label>
          <select
            id="supplierId"
            name="supplierId"
            value={receipt.formValues.supplierId}
            onChange={receipt.handleFormChange}
            className={`form-select ${receipt.formErrors.supplierId ? 'is-invalid' : ''}`}
            required>
            <option value="" disabled>-- Chọn nhà cung cấp --</option>
            {receipt.suppliers.map(s => (<option key={s.PK_idSupplier} value={s.PK_idSupplier}>{s.supplierName}</option>))}
          </select>
          {receipt.formErrors.supplierId && <div className="invalid-feedback">{receipt.formErrors.supplierId}</div>}
        </div>

        <div className="col-md-6">
          <label htmlFor="deliveryReceipt" className="form-label">Phiếu giao hàng <span className="text-danger">*</span></label>
          <input
            type="text"
            className={`form-control ${receipt.formErrors.deliveryReceipt ? 'is-invalid' : ''}`}
            id="deliveryReceipt"
            name="deliveryReceipt"
            value={receipt.formValues.deliveryReceipt}
            onChange={receipt.handleFormChange}
            placeholder="Nhập mã phiếu giao hàng"
            required
          />
          {receipt.formErrors.deliveryReceipt && <div className="invalid-feedback">{receipt.formErrors.deliveryReceipt}</div>}
        </div>
      </div>

      {!isEditMode && (
        <>
          <hr />
          <h6>Danh sách phụ tùng</h6>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '30%' }}>Phụ tùng</th>
                  <th style={{ width: '10%' }}>Đơn vị</th>
                  <th style={{ width: '20%' }}>Giá nhập (VNĐ)</th>
                  <th style={{ width: '15%' }}>Số lượng yêu cầu</th>
                  <th style={{ width: '15%' }}>Số lượng nhập</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {receipt.formValues.details.map((detail, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        name="sparePartId"
                        value={detail.sparePartId}
                        onChange={e => receipt.handleDetailChange(index, e)}
                        className="form-select"
                        required
                      >
                        <option value="" disabled>-- Chọn phụ tùng --</option>
                        {receipt.spareParts
                          .filter(sp => !selectedSparePartIds.includes(sp.PK_idSparePart) || sp.PK_idSparePart === detail.sparePartId)
                          .map(sp => (<option key={sp.PK_idSparePart} value={sp.PK_idSparePart}>{sp.sparePartName}</option>))
                        }
                      </select>
                    </td>
                    <td><input type="text" className="form-control" value={getUnit(detail.sparePartId)} disabled /></td>
                    <td>
                      <input
                        type="text"
                        name="importPrice"
                        value={detail.importPrice}
                        onChange={e => receipt.handleDetailChange(index, e)}
                        className="form-control"
                        min="0"
                        disabled
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="requestedQty"
                        className="form-control"
                        value={detail.requestedQty}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) receipt.handleDetailChange(index, e);
                        }}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        name="importedQty"
                        className="form-control"
                        value={detail.importedQty}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (/^\d*$/.test(val)) receipt.handleDetailChange(index, e);
                        }}
                        required
                        disabled={!detail.requestedQty}
                      />
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => receipt.removeDetailRow(index)}
                        disabled={receipt.formValues.details.length <= 1}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={receipt.addDetailRow}
          >
            <i className="bi bi-plus-lg"></i> Thêm dòng
          </button>
        </>
      )}

      <div className="modal-footer mt-4 pb-0 border-0">
        <button type="button" className="btn btn-secondary" onClick={receipt.closeModal}>Hủy</button>
        <button type="submit" className="btn btn-primary" disabled={receipt.isSubmitting}>
          {receipt.isSubmitting
            ? (isEditMode ? 'Đang cập nhật...' : 'Đang lưu...')
            : (isEditMode ? 'Cập nhật' : 'Tạo Phiếu')}
        </button>
      </div>
    </form>
  );
};

const ModalContentDelete = ({ receipt }) => (
  <div>
    <p>Bạn có chắc chắn muốn xóa phiếu nhập <b>{receipt.selectedReceipt?.PK_idImport}</b>?</p>
    <div className="alert alert-warning mt-3 mb-0">
      <small>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
      </small>
    </div> 
    <div className="modal-footer mt-3 pb-0 border-0">
      <button type="button" className="btn btn-secondary" onClick={receipt.closeModal}>Hủy</button>
      <button type="button" className="btn btn-danger" onClick={receipt.confirmDelete} disabled={receipt.isSubmitting}>
        {receipt.isSubmitting ? 'Đang xóa...' : 'Xóa'}
      </button>
    </div>
  </div>
);

const ReceiptModal = ({ receipt }) => {
  if (!receipt.modalState) return null;

  const modalTitles = {
    view: 'Chi tiết Phiếu Nhập Kho',
    create: 'Tạo Phiếu Nhập Kho Mới',
    delete: 'Xác nhận Xóa',
    edit: 'Chỉnh sửa Phiếu Nhập Kho' 
  };

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modalTitles[receipt.modalState]}</h5>
              <button type="button" className="btn-close" onClick={receipt.closeModal}></button>
            </div>
            <div className="modal-body">
              {receipt.isSubmitting && <LoadingSpinner message="Đang tải..." />}

              {!receipt.isSubmitting && receipt.modalState === 'view' && receipt.selectedReceipt && (<ModalContentView receipt={receipt} />)}
              {!receipt.isSubmitting && (receipt.modalState === 'create' || receipt.modalState === 'edit') && <ModalContentForm receipt={receipt} />}
              {receipt.modalState === 'delete' && <ModalContentDelete receipt={receipt} />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Pagination = ({ receipt }) => {
  const totalPages = Math.ceil(receipt.total / receipt.perPage);
  if (totalPages < 1) return null;

  return (
    <nav className="mt-3">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${receipt.page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => receipt.handlePageChange(receipt.page - 1)}>«</button>
        </li>
        {receipt.getPageNumbers().map((p, i) => (
          <li key={i} className={`page-item ${p === receipt.page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => p !== "..." && receipt.handlePageChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item ${receipt.page >= totalPages ? "disabled" : ""}`}>
          <button className="page-link" onClick={() => receipt.handlePageChange(receipt.page + 1)}>»</button>
        </li>
      </ul>
    </nav>
  );
};


export default function ImportReceipt() {
  const receipt = useImportReceipt();

  const renderContent = () => {
    if (receipt.loading) {
      return <LoadingSpinner message="Đang tải danh sách..." />;
    }
    if (receipt.error) {
      return <div className="alert alert-danger text-center">Lỗi: {receipt.error.message}</div>;
    }
    return (
      <>
        <ReceiptHeader receipt={receipt} />
        {!receipt.isTableLoading && receipt.data.length === 0 ? (
          <div className="alert alert-secondary text-center">Không tìm thấy phiếu nhập kho nào.</div>
        ) : (
          <>
              <ReceiptTable
                data={receipt.data}
                stores={receipt.stores}
                canManage={receipt.canManage}
                openModal={receipt.openModal}
                isTableLoading={receipt.isTableLoading}
              />
              <Pagination receipt={receipt} />
            </>
        )}
      </>
    );
  };

  if (receipt.isAuthLoading) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Quản lý Phiếu Nhập Kho</h3>
        <LoadingSpinner message="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  if (!receipt.canView) {
    return (
      <div className="container mt-4">
        <h3 className="mb-4 text-center">Quản lý Phiếu Nhập Kho</h3>
        <div className="alert alert-danger text-center">
          Bạn không có quyền truy cập vào chức năng này.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3 className="mb-4 text-center">Quản lý Phiếu Nhập Kho</h3>
      <div className="mt-3">
        {renderContent()}
      </div>
      <ReceiptModal receipt={receipt} />
    </div>
  );
}