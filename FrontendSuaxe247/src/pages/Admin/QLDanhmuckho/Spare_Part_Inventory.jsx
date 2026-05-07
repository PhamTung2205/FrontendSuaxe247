// pages/SparePart/Spare_Part_Inventory.jsx

import React from 'react';
import { useSparePartInventory } from '../../../assets/js/SparePartInventory';

const LoadingSpinner = ({ message }) => (
    <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{message}</span>
        </div>
        <span className="ms-3">{message}</span>
    </div>
);

const InventoryActions = ({ sparePart }) => (
  <div className="row g-2 mb-3 align-items-center">
    {/* Lọc theo cửa hàng */}
    {sparePart.showStoreFilter && (
      <div className="col-12 col-md-4 me-2 d-flex align-items-center">
        <label htmlFor="storeSelect" className="form-label me-3 mb-0" style={{ whiteSpace: 'nowrap' }}>
          Cửa hàng:
        </label>
        <select
          id="storeSelect"
          className="form-select flex-grow-1"
          value={sparePart.selectedStoreFilterId}
          onChange={(e) => sparePart.setSelectedStoreFilterId(e.target.value)}
          disabled={sparePart.loading}
        >
          {sparePart.stores.map(store => (
            <option key={store.PK_idStore} value={store.PK_idStore}>{store.address}</option>
          ))}
        </select>
      </div>
    )}

    {/* Lọc theo danh mục */}
    <div className={`col-12 ${sparePart.showStoreFilter ? 'col-md-3 me-2' : 'col-md-5 me-2'} d-flex align-items-center`}>
      <label htmlFor="categorySelect" className="form-label me-3 mb-0" style={{ whiteSpace: 'nowrap' }}>
        Danh mục:
      </label>
      <select
        id="categorySelect"
        className="form-select flex-grow-1"
        value={sparePart.selectedCategoryId}
        onChange={(e) => sparePart.setSelectedCategoryId(e.target.value)}
        disabled={sparePart.loading}
      >
        <option value="all">-- Tất cả Danh mục --</option>
        {sparePart.categories.map(cat => (
          <option key={cat.PK_idCategory} value={cat.PK_idCategory}>{cat.categoryName}</option>
        ))}
      </select>
    </div>

    {/* Tìm kiếm */}
    <div className={`col-12 ${sparePart.showStoreFilter ? 'col-md-4 me-2' : 'col-md-5'} d-flex align-items-center`}>
      <label htmlFor="searchInput" className="form-label me-3 mb-0" style={{ whiteSpace: 'nowrap' }}>
        Tên phụ tùng:
      </label>
      <input
        id="searchInput"
        type="text"
        className="form-control flex-grow-1"
        placeholder="Tìm theo tên phụ tùng..."
        value={sparePart.inputValue}
        onChange={(e) => sparePart.setInputValue(e.target.value)}
        disabled={sparePart.loading}
      />
    </div>
  </div>
);



const InventoryTable = ({ sparePart }) => (
    <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
            <thead className="table-dark text-center">
                <tr>
                    <th>STT</th>
                    <th>Mã PT</th>
                    <th>Tên phụ tùng</th>
                    <th>Danh mục</th>
                    <th>Đơn vị</th>
                    <th className="text-end">Giá mua (VND)</th>
                    <th className="text-end">Giá bán (VND)</th>
                    <th className="text-center">Tồn kho</th>
                    <th>Hành động</th>
                </tr>
            </thead >
            <tbody>
                {sparePart.data.map((item, index) => {
                    const canEditItem = ["Admin", "Quản lý hệ thống", "Quản lý cửa hàng", "Quản lý kho tổng"].includes(sparePart.userRole) &&
                        (sparePart.showStoreFilter || item.FK_idStore === sparePart.userStoreId);
                    const isLowStock = Number(item.stockQty) < Number(item.warningQty);

                    return (
                        <tr key={`${item.FK_idStore}-${item.PK_idSparePart}`}>
                            <td className="text-center">{index + 1}</td>
                            <td>{item.PK_idSparePart}</td>
                            <td>{item.sparePartName}</td>
                            <td>{sparePart.getCategoryName(item.FK_idCategory)}</td>
                            <td className="text-center">{item.unit}</td>
                            <td className="text-end">{Number(item.purchasePrice).toLocaleString('vi-VN')}</td>
                            <td className="text-end">{Number(item.salePrice).toLocaleString('vi-VN')}</td>
                            <td className={`text-center ${isLowStock ? 'text-danger' : ''}`}>
                                {item.stockQty}
                                {isLowStock && <i className="bi bi-exclamation-circle-fill ms-2" title={`Tồn kho dưới mức cảnh báo (${item.warningQty})`}></i>}
                            </td>
                            <td className="text-center text-nowrap">
                                <button className="btn btn-info btn-sm me-2 text-white" onClick={() => sparePart.openModal('view', item)}>Xem</button>
                                {canEditItem && <button className="btn btn-warning btn-sm" onClick={() => sparePart.openModal('edit', item)}>Sửa</button>}
                            </td>
                        </tr>
                    );
                })}
            </tbody >
        </table >
    </div >
);

const Pagination = ({ sparePart }) => {
    if (sparePart.getPageNumbers().length === 0) return null;
    const totalPages = Math.ceil(sparePart.total / sparePart.perPage);
    return (
        <nav className="mt-4 d-flex justify-content-center">
            <ul className="pagination">
                <li className={`page-item ${sparePart.page === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => sparePart.handlePageChange(sparePart.page - 1)}>&laquo;</button>
                </li>
                {sparePart.getPageNumbers().map((p, i) => (
                    <li key={i} className={`page-item ${p === sparePart.page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => p !== "..." && sparePart.handlePageChange(p)}>{p}</button>
                    </li>
                ))}
                <li className={`page-item ${sparePart.page >= totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => sparePart.handlePageChange(sparePart.page + 1)}>&raquo;</button>
                </li>
            </ul>
        </nav>
    );
};

const ModalContentView = ({ sparePart }) => {
    const { formValues, categories } = sparePart;
    const categoryName = categories.find(c => c.PK_idCategory === formValues.FK_idCategory)?.categoryName || 'Không xác định';

    return (
        <>
            <div className="row g-3">
                <div className="col-md-6"><strong>Mã phụ tùng:</strong> {formValues.PK_idSparePart}</div>
                <div className="col-md-6"><strong>Tên phụ tùng:</strong> {formValues.sparePartName}</div>
                <div className="col-md-6"><strong>Danh mục:</strong> {categoryName}</div>
                <div className="col-md-6"><strong>Đơn vị:</strong> {formValues.unit}</div>
                <div className="col-md-6"><strong>Giá mua:</strong> {Number(formValues.purchasePrice).toLocaleString('vi-VN')} VNĐ</div>
                <div className="col-md-6"><strong>Giá bán:</strong> {Number(formValues.salePrice).toLocaleString('vi-VN')} VNĐ</div>
                <div className="col-md-6"><strong>Số lượng tồn kho:</strong> {formValues.stockQty}</div>
                <div className="col-md-6"><strong>Vị trí trong kho:</strong> {formValues.location || "—"}</div>
                <div className="col-12"><strong>Mô tả:</strong> {formValues.description || "Không có mô tả gì..."}</div>
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
                <label className="form-label fw-bold">Số lượng tồn kho</label>
                <input
                    type="text" // Đổi từ "number" sang "text" để dùng custom onChange
                    name="stockQty"
                    className={`form-control ${sparePart.formErrors.stockQty ? 'is-invalid' : ''}`}
                    value={sparePart.formValues.stockQty}
                    onChange={(e) => {
                        const val = e.target.value;
                        // Chỉ cho phép nhập số (digits 0-9), giống như giá
                        if (/^\d*$/.test(val)) sparePart.handleFormChange(e);
                    }}
                />
                {sparePart.formErrors.stockQty && <div className="invalid-feedback">{sparePart.formErrors.stockQty}</div>}
            </div>
            <div className="col-md-6">
                <label className="form-label fw-bold">Vị trí trong kho</label>
                <input
                    type="text"
                    name="location"
                    className={`form-control ${sparePart.formErrors.location ? 'is-invalid' : ''}`}
                    value={sparePart.formValues.location}
                    onChange={sparePart.handleFormChange}
                    placeholder="VD: Kệ A1, Dãy B2..."
                />
                {sparePart.formErrors.location && <div className="invalid-feedback">{sparePart.formErrors.location}</div>}
            </div>
        </div>
        <div className="modal-footer mt-4 pb-0 border-0">
            <button type="button" className="btn btn-secondary" onClick={sparePart.closeModal}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={sparePart.isSubmitting}>
                {sparePart.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
        </div>
    </form>
);

const InventoryModal = ({ sparePart }) => {
    if (!sparePart.modalState) return null;
    const modalTitles = {
        view: 'Chi tiết Tồn kho Phụ tùng',
        edit: 'Cập nhật Tồn kho Phụ tùng',
    };

    return (
        <>
            <div className="modal-backdrop fade show" />
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{modalTitles[sparePart.modalState]}</h5>
                            <button type="button" className="btn-close" onClick={sparePart.closeModal}></button>
                        </div>
                        <div className="modal-body">
                            {sparePart.modalState === 'view' && <ModalContentView sparePart={sparePart} />}
                            {sparePart.modalState === 'edit' && <ModalContentForm sparePart={sparePart} />}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default function SparePartInventory() {
    const sparePart = useSparePartInventory();

    const getTitle = () => {
        const selectedStore = sparePart.stores.find(store => store.PK_idStore === sparePart.selectedStoreFilterId);
        if (!selectedStore) return 'Quản lý Kho Phụ tùng';
        return `Kho Phụ tùng: ${selectedStore.address}`;
    };

    if (sparePart.isAuthLoading) {
        return (
            <div className="container mt-4">
                <h3 className="mb-4 text-center">Quản lý Kho Phụ tùng</h3>
                <LoadingSpinner message="Đang xác thực và tải dữ liệu..." />
            </div>
        );
    }

    if (!sparePart.canView) {
        return (
            <div className="container mt-4">
                <h3 className="mb-4 text-center">Quản lý Kho Phụ tùng</h3>
                <div className="alert alert-danger text-center">Bạn không có quyền truy cập vào chức năng này.</div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h3 className="mb-4 text-center">{getTitle()}</h3>
            <InventoryActions sparePart={sparePart} />
            <div className="mt-3">
                {sparePart.loading && <LoadingSpinner message="Đang tải dữ liệu kho..." />}
                {sparePart.error && <div className="alert alert-danger text-center">Lỗi: {sparePart.error.message}</div>}
                {!sparePart.loading && !sparePart.error && (
                    <>
                        {sparePart.data.length === 0 ? (
                            <div className="alert text-center p-4">Không tìm thấy phụ tùng nào khớp với điều kiện.</div>
                        ) : (
                            <>
                                <InventoryTable sparePart={sparePart} />
                                <Pagination sparePart={sparePart} />
                            </>
                        )}
                    </>
                )}
            </div>
            <InventoryModal sparePart={sparePart} />
        </div>
    );
}