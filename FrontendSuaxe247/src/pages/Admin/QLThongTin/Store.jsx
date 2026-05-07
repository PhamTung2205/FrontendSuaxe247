import React, { useState, useEffect } from "react";
import { StoreManager, showToast, getImageUrl } from "../../../assets/js/StoreAdmin.js";

// Component TableStore
function TableStore({ stores, onEdit, onDelete }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (storeId) => {
    setImageErrors(prev => ({ ...prev, [storeId]: true }));
  };

  const handleImageLoad = (storeId) => {
    setImageErrors(prev => ({ ...prev, [storeId]: false }));
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover text-center align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>STT</th>
            <th>Mã cửa hàng</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Hình ảnh</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {stores.length > 0 ? (
            stores.map((store, index) => (
              <tr key={store.PK_idStore}>
                <td className="text-center">{index + 1}</td>
                <td>{store.PK_idStore}</td>
                <td>{store.address}</td>
                <td>{store.phone}</td>
                <td>
                  <div className="d-flex justify-content-center">
                    <div
                      className="border rounded d-flex align-items-center justify-content-center bg-light"
                      style={{
                        width: '100px',
                        height: '100px',
                        overflow: 'hidden'
                      }}
                    >
                      {store.imageURL ? (
                        imageErrors[store.PK_idStore] ? (
                          <div className="text-danger text-center p-2">
                            <i className="bi bi-exclamation-triangle-fill fs-5 d-block mb-1"></i>
                            <small>Lỗi tải ảnh</small>
                          </div>
                        ) : (
                          <img
                            src={getImageUrl(store.imageURL)}
                            alt={`Cửa hàng ${store.PK_idStore}`}
                            className="img-fluid object-fit-cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={() => handleImageError(store.PK_idStore)}
                            onLoad={() => handleImageLoad(store.PK_idStore)}
                          />
                        )
                      ) : (
                        <div className="text-muted text-center p-2">
                          <i className="bi bi-image fs-5 d-block mb-1"></i>
                          <small>Không có ảnh</small>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => onEdit(store)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(store)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4">
                <div className="text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  Không có cửa hàng nào
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Component StoreForm
function StoreForm({ store, onSubmit, onClose, isSubmitting, mode = "create", checkDuplicateAddress,
  checkDuplicatePhone }) {
  const [form, setForm] = useState({
    PK_idStore: store?.PK_idStore || "",
    address: store?.address || "",
    phone: store?.phone || "",
    imageFile: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [errors, setErrors] = useState({});

  const storeManager = new StoreManager();
  const validateStoreId = (storeId) => {
    if (!storeId || storeId.trim() === '') {
      return "Mã cửa hàng không được để trống";
    }
    
    // Kiểm tra không được bắt đầu bằng số
    const startsWithNumber = /^[0-9]/.test(storeId);
    if (startsWithNumber) {
      return "Mã cửa hàng không được bắt đầu bằng số (Ví dụ: S001, CH01)";
    }

    // Kiểm tra có ít nhất 1 chữ cái
    const hasLetter = /[a-zA-Z]/.test(storeId);
    if (!hasLetter) {
      return "Mã cửa hàng phải chứa ít nhất 1 chữ cái";
    }

    // Kiểm tra độ dài tối thiểu
    if (storeId.length < 2) {
      return "Mã cửa hàng phải có ít nhất 2 ký tự";
    }

    // 🆕 Kiểm tra ký tự hợp lệ (chữ, số, gạch dưới)
    const isValidFormat = /^[a-zA-Z][a-zA-Z0-9_]*$/.test(storeId);
    if (!isValidFormat) {
      return "Mã cửa hàng chỉ được chứa chữ cái, số và gạch dưới, bắt đầu bằng chữ cái";
    }

    return null;
  };
  useEffect(() => {
    if (store?.imageURL) {
      setPreviewError(false);
      const img = new Image();
      img.src = getImageUrl(store.imageURL);

      img.onload = () => {
        setPreviewImage(img.src);
        setPreviewError(false);
      };

      img.onerror = () => {
        setPreviewImage(null);
        setPreviewError(true);
      };
    } else {
      setPreviewImage(null);
      setPreviewError(false);
    }
  }, [store]);

  const validate = async () => {
    const errs = storeManager.validateForm(form, mode);
       if (mode === "create") {
      const storeIdError = validateStoreId(form.PK_idStore);
      if (storeIdError) {
        errs.PK_idStore = storeIdError;
      }
    }
    const phoneRegex = /^(0[35789][0-9]{8})$/; // Chuẩn Việt Nam: bắt đầu bằng 03,05,07,08,09
    if (!phoneRegex.test(form.phone.trim())) {
      errs.phone = "Số điện thoại không hợp lệ vui lòng kiểm tra lại!";
    }
    if (mode === "edit" && previewError && !form.imageFile) {
      errs.imageFile = "Ảnh hiện tại đã bị xóa. Vui lòng chọn ảnh mới!";
    }

    // KIỂM TRA TRÙNG LẶP ĐỊA CHỈ
    if (form.address && form.address.trim()) {
      const isDuplicateAddress = await checkDuplicateAddress(
        form.address.trim(),
        mode === "edit" ? store?.PK_idStore : null
      );
      if (isDuplicateAddress) {
        errs.address = "Địa chỉ này đã tồn tại trong hệ thống!";
      }
    }

    // KIỂM TRA TRÙNG LẶP SỐ ĐIỆN THOẠI
    if (form.phone && form.phone.trim()) {
      const isDuplicatePhone = await checkDuplicatePhone(
        form.phone.trim(),
        mode === "edit" ? store?.PK_idStore : null
      );
      if (isDuplicatePhone) {
        errs.phone = "Số điện thoại này đã tồn tại trong hệ thống!";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

   const handleStoreIdChange = (e) => {
    const newStoreId = e.target.value;
    
    // 🆕 TỰ ĐỘNG CHUYỂN HOA
    const upperCaseStoreId = newStoreId.toUpperCase();
    setForm({ ...form, PK_idStore: upperCaseStoreId });

    // Clear error trước
    setErrors(prev => ({ ...prev, PK_idStore: undefined }));

    // Kiểm tra real-time sau 300ms
    if (upperCaseStoreId.trim()) {
      setTimeout(() => {
        const storeIdError = validateStoreId(upperCaseStoreId);
        if (storeIdError) {
          setErrors(prev => ({ ...prev, PK_idStore: storeIdError }));
        }
      }, 300);
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setPreviewError(false);

    if (file) {
      setForm({ ...form, imageFile: file });

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
        setPreviewError(false);
      };
      reader.readAsDataURL(file);
    } else {
      setForm({ ...form, imageFile: null });
      if (store?.imageURL) {
        const img = new Image();
        img.src = getImageUrl(store.imageURL);

        img.onload = () => {
          setPreviewImage(img.src);
          setPreviewError(false);
        };

        img.onerror = () => {
          setPreviewImage(null);
          setPreviewError(true);
        };
      } else {
        setPreviewImage(null);
        setPreviewError(false);
      }
    }
  };

  const handleAddressChange = async (e) => {
    const newAddress = e.target.value;
    setForm({ ...form, address: newAddress });

    // Clear error trước
    setErrors(prev => ({ ...prev, address: undefined }));

    // Kiểm tra real-time sau 500ms
    if (newAddress.trim() && newAddress.trim().length > 5) {
      setTimeout(async () => {
        const isDuplicate = await checkDuplicateAddress(
          newAddress.trim(),
          mode === "edit" ? store?.PK_idStore : null
        );
        if (isDuplicate) { // 🆕 BỎ ĐIỀU KIỆN form.address === newAddress
          setErrors(prev => ({ ...prev, address: "Địa chỉ này đã tồn tại trong hệ thống!" }));
        }
      }, 500);
    }
  };


  // Hàm xử lý khi số điện thoại thay đổi
  const handlePhoneChange = async (e) => {
    const newPhone = e.target.value;
    setForm({ ...form, phone: newPhone });

    // Clear error trước
    setErrors(prev => ({ ...prev, phone: undefined }));

    // Kiểm tra real-time sau 500ms
    if (newPhone.trim() && newPhone.trim().length >= 10) {
      setTimeout(async () => {
        const isDuplicate = await checkDuplicatePhone(
          newPhone.trim(),
          mode === "edit" ? store?.PK_idStore : null
        );
        if (isDuplicate) { // 🆕 BỎ ĐIỀU KIỆN form.phone === newPhone
          setErrors(prev => ({ ...prev, phone: "Số điện thoại này đã tồn tại trong hệ thống!" }));
        }
      }, 500);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // THÊM LOADING CHO VALIDATE
    setErrors({ ...errors, validating: "Đang kiểm tra dữ liệu..." });

    const isValid = await validate();
    if (!isValid) {
      setErrors(prev => ({ ...prev, validating: undefined }));
      return;
    }

    setErrors(prev => ({ ...prev, validating: undefined }));
    onSubmit(form);
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {mode === "create" ? "Thêm cửa hàng mới" : "Sửa thông tin cửa hàng"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-3">
                  <label className="form-label">
                    Mã cửa hàng {mode === "create" && <span className="text-danger">*</span>}
                  </label>
                  {mode === "create" ? (
                    <input
                      type="text"
                      className={`form-control ${errors.PK_idStore ? "is-invalid" : ""}`}
                      value={form.PK_idStore}
                       onChange={handleStoreIdChange}
                      placeholder="Nhập mã cửa hàng (VD: S001, CH01)"
                      
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={form.PK_idStore}
                      readOnly
                    />
                  )}
                  {errors.PK_idStore && (
                    <div className="invalid-feedback">{errors.PK_idStore}</div>
                  )}
                  {mode === "edit" && (
                    <div className="form-text text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Mã cửa hàng không thể thay đổi
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Địa chỉ <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.address ? "is-invalid" : ""}`}
                    value={form.address}
                    onChange={handleAddressChange} // 🆕 SỬA THÀNH handleAddressChange
                    placeholder="Nhập địa chỉ cửa hàng"
                  />
                  {errors.address && (
                    <div className="invalid-feedback d-block">{errors.address}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control ${errors.phone ? "is-invalid" : ""}`}
                    value={form.phone}
                    onChange={handlePhoneChange}
                    placeholder="10-11 chữ số"
                  />
                  {errors.phone && (
                    <div className="invalid-feedback d-block">{errors.phone}</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">
                    Ảnh cửa hàng{" "}
                    {mode === "edit" && previewError && <span className="text-danger">*</span>}
                  </label>                  
                  <input
                    type="file"
                    accept="image/*"
                    className={`form-control ${errors.imageFile ? "is-invalid" : ""}`}
                    onChange={handleFileChange}
                  />
                  {errors.imageFile && (
                    <div className="invalid-feedback">{errors.imageFile}</div>
                  )}

                  {mode === "edit" && previewError && !form.imageFile && (
                    <div className="alert alert-warning mt-2 py-2">
                      <small>
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        <strong>Ảnh hiện tại đã bị xóa trên server.</strong> Vui lòng chọn ảnh mới!
                      </small>
                    </div>
                  )}

                  {(previewImage || previewError) && (
                    <div className="mt-3">
                      <p className="small text-muted mb-2">
                        {form.imageFile ? "Ảnh mới:" : "Ảnh hiện tại:"}
                      </p>
                      <div className="d-flex align-items-center">
                        <div
                          className="border rounded d-flex align-items-center justify-content-center bg-light"
                          style={{
                            width: '120px',
                            height: '120px',
                            overflow: 'hidden'
                          }}
                        >
                          {previewError && !form.imageFile ? (
                            <div className="text-danger text-center p-2">
                              <i className="bi bi-exclamation-triangle-fill fs-1 d-block mb-2"></i>
                              <small>Ảnh đã bị xóa</small>
                            </div>
                          ) : (
                            <img
                              src={previewImage}
                              alt="Preview"
                              className="img-fluid object-fit-cover"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          )}
                        </div>
                        {form.imageFile && (
                          <div className="text-success small ms-3">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Đã chọn ảnh mới
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {errors.validating && (
                  <div className="alert alert-info d-flex align-items-center mb-3 py-2">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small>{errors.validating}</small>
                  </div>
                )}
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : (
                      mode === "create" ? "Lưu" : "Cập nhật"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Component DeleteStore
function DeleteStore({ store, onConfirm, onClose, isSubmitting }) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Bạn có chắc chắn muốn xóa cửa hàng này không?</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">

              <div className="">
                <div className="card-body p-0">
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex">
                      <strong style={{ width: '150px' }}>Mã cửa hàng:</strong>
                      <span>{store?.PK_idStore}</span>
                    </div>

                    <div className="d-flex">
                      <strong style={{ width: '150px' }}>Địa chỉ:</strong>
                      <span>{store?.address}</span>
                    </div>

                    <div className="d-flex">
                      <strong style={{ width: '150px' }}>Số điện thoại:</strong>
                      <span>{store?.phone}</span>
                    </div>

                    <div className="d-flex">
                      <strong style={{ width: '150px' }}>Ảnh:</strong>
                      <div
                        className="border rounded d-flex align-items-center justify-content-center bg-light"
                        style={{
                          width: '80px',
                          height: '80px',
                          overflow: 'hidden'
                        }}
                      >
                        {store?.imageURL ? (
                          imageError ? (
                            <div className="text-danger text-center p-1">
                              <i className="bi bi-exclamation-triangle-fill d-block mb-1"></i>
                              <small>Lỗi ảnh</small>
                            </div>
                          ) : (
                            <img
                              src={getImageUrl(store.imageURL)}
                              alt="Store"
                              className="img-fluid object-fit-cover"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={handleImageError}
                            />
                          )
                        ) : (
                          <span className="text-muted">Không có ảnh</span>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/*THÊM THÔNG BÁO VỀ VIỆC XÓA STORE SPARE PART */}
              <div className="alert alert-warning mt-3">
                <div className="d-flex">
                  <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
                  <div>
                    <strong>Lưu ý quan trọng:</strong>
                    <ul className="mb-0 mt-1">
                      <li>Toàn bộ phụ tùng trong kho của cửa hàng này cũng sẽ bị xóa</li>
                      <li>Hành động này không thể hoàn tác!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </button>
              <button className="btn btn-danger" onClick={onConfirm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xóa...
                  </>
                ) : (
                  "Xóa"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Main Component
export default function Store() {
  const API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store";
  const SPARE_PART_API = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/spare-part";
  const STORE_SPARE_PART_API = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store-spare-part";
  const [allStores, setAllStores] = useState([]);
  const [currentStores, setCurrentStores] = useState([]);
  const [modalState, setModalState] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [creatingSpareParts, setCreatingSpareParts] = useState(false);
  // State cho phân trang
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const storeManager = new StoreManager(API_URL);

  const fetchUserSession = async () => {
    try {
      const response = await fetch('http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session', {
        method: 'GET',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.status === 'success' && data.user) {
        setUser(data.user);
        return data.user;
      } else {
        throw new Error('Không thể lấy thông tin người dùng');
      }
    } catch (error) {
      console.error('Lỗi fetch user session:', error);
      return null;
    }
  };

  // Kiểm tra quyền
  const hasStoreAccess = () => {
    return user && (user.roleName === "Admin" || user.roleName === "Quản lý hệ thống" || user.roleName === "Quản lý kho tổng");
  };
  // Fetch tất cả cửa hàng từ API
  const fetchStores = async () => {
    if (!hasStoreAccess()) return;
    setLoading(true);
    try {
      const result = await storeManager.fetchStores();
      if (result.success) {
        setAllStores(result.data);
      } else {
        showToast("error", result.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("error", "Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const init = async () => {
    if (!user) {
      await fetchUserSession();
    } else if (hasStoreAccess()) {
      await fetchStores();
    }
  };
  init();
}, [user]);

  // Tính toán cửa hàng cho trang hiện tại
  useEffect(() => {
    const { currentItems } = storeManager.getPaginatedData(allStores, page, perPage);
    setCurrentStores(currentItems);
  }, [allStores, page, perPage]);

  const fetchAllSpareParts = async () => {
    try {
      const response = await fetch(SPARE_PART_API);
      const result = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        console.error('Lỗi khi lấy danh sách phụ tùng:', result.message);
        return [];
      }
    } catch (error) {
      console.error('Lỗi kết nối khi lấy phụ tùng:', error);
      return [];
    }
  };

  // Hàm tạo StoreSparePart cho cửa hàng mới
  const createStoreSpareParts = async (storeId) => {
    try {
      const spareParts = await fetchAllSpareParts();

      if (spareParts.length === 0) {
        console.warn('Không có phụ tùng nào để thêm vào cửa hàng');
        return false;
      }

      const storeSparePartsData = spareParts.map(sparePart => ({
        PK_idSSP: `${storeId}_${sparePart.PK_idSparePart}`,
        FK_idStore: storeId,
        FK_idSparePart: sparePart.PK_idSparePart,
        stockQty: 0,
        warningQty: 5,
        location: `Kho ${storeId}`,
        deleted: 0
      }));

      const response = await fetch(`${STORE_SPARE_PART_API}/spare-part-insert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: storeId,
          spareParts: storeSparePartsData
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`Đã thêm ${storeSparePartsData.length} phụ tùng vào cửa hàng ${storeId}`);
        return true;
      } else {
        console.error('Lỗi khi thêm store spare parts:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi tạo store spare parts:', error);
      return false;
    }
  };

  const handleCreate = async (form) => {
    setIsSubmitting(true);
    try {
      const result = await storeManager.createStore(form);

      if (result.success) {
        showToast("success", result.message);

        // TẠO STORE SPARE PART SAU KHI TẠO CỬA HÀNG THÀNH CÔNG
        const storeId = form.PK_idStore;
        setCreatingSpareParts(true);

        try {
          const sparePartsResult = await createStoreSpareParts(storeId);

          if (sparePartsResult) {
            showToast("success", `Đã tạo cửa hàng và thêm danh sách phụ tùng thành công!`);
          } else {
            showToast("warning", "Cửa hàng đã được tạo nhưng có lỗi khi thêm phụ tùng. Vui lòng kiểm tra lại.");
          }
        } catch (sparePartsError) {
          console.error("Lỗi khi thêm phụ tùng:", sparePartsError);
          showToast("warning", "Cửa hàng đã được tạo nhưng có lỗi khi thêm phụ tùng.");
        } finally {
          setCreatingSpareParts(false);
        }

        await fetchStores();
        setModalState(null);
        setPage(1);
      } else {
        showToast("error", result.message);
      }
    } catch (err) {
      console.error("Lỗi thêm cửa hàng:", err);
      showToast("error", "Lỗi kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!selectedStore) return;
    setIsSubmitting(true);
    try {
      const result = await storeManager.updateStore(selectedStore.PK_idStore, form);

      if (result.success) {
        showToast("success", result.message);
        await fetchStores();
        setModalState(null);
        setSelectedStore(null);
      } else {
        showToast("error", result.message);
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      showToast("error", "Lỗi kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };


  const deleteStoreSpareParts = async (storeId) => {
    try {
      const response = await fetch(`${STORE_SPARE_PART_API}/delete-by-store/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.status === 'success') {
        console.log(`Đã xóa ${result.updated} store spare parts của cửa hàng ${storeId}`);
        return true;
      } else {
        console.error('Lỗi khi xóa store spare parts:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Lỗi khi xóa store spare parts:', error);
      return false;
    }
  };


  // Hàm kiểm tra địa chỉ đã tồn tại
  const checkDuplicateAddress = async (address, currentStoreId = null) => {
    try {
      const duplicateStores = allStores.filter(store =>
        store.address.toLowerCase() === address.toLowerCase() &&
        store.PK_idStore !== currentStoreId
      );
      return duplicateStores.length > 0;
    } catch (error) {
      console.error('Lỗi khi kiểm tra địa chỉ:', error);
      return false;
    }
  };

  // Hàm kiểm tra số điện thoại đã tồn tại
  const checkDuplicatePhone = async (phone, currentStoreId = null) => {
    try {
      const duplicateStores = allStores.filter(store =>
        store.phone === phone &&
        store.PK_idStore !== currentStoreId
      );
      return duplicateStores.length > 0;
    } catch (error) {
      console.error('Lỗi khi kiểm tra số điện thoại:', error);
      return false;
    }
  };
  const handleDelete = async () => {
    if (!selectedStore) return;
    setIsSubmitting(true);
    try {
      // 🆕 XÓA STORE SPARE PART TRƯỚC KHI XÓA CỬA HÀNG
      const storeId = selectedStore.PK_idStore;

      showToast("info", "Đang xóa dữ liệu phụ tùng của cửa hàng...");
      const deleteSparePartsResult = await deleteStoreSpareParts(storeId);

      if (!deleteSparePartsResult) {
        showToast("warning", "Có lỗi khi xóa dữ liệu phụ tùng, vẫn tiếp tục xóa cửa hàng...");
      }

      // XÓA CỬA HÀNG
      const result = await storeManager.deleteStore(storeId);

      if (result.success) {
        if (deleteSparePartsResult) {
          showToast("success", "Đã xóa cửa hàng và toàn bộ phụ tùng thành công!");
        } else {
          showToast("success", "Đã xóa cửa hàng thành công!");
        }

        await fetchStores();

        // Nếu trang hiện tại trống sau khi xóa, quay về trang trước
        if (currentStores.length === 1 && page > 1) {
          setPage(page - 1);
        }

        setModalState(null);
        setSelectedStore(null);
      } else {
        showToast("error", result.message);
      }
    } catch (err) {
      console.error("Lỗi xóa cửa hàng:", err);
      showToast("error", "Lỗi kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { currentDisplayText, totalPages } = storeManager.getPaginatedData(allStores, page, perPage);
  const pageNumbers = storeManager.getPageNumbers(page, totalPages);

  const openCreateModal = () => {
    setSelectedStore(null);
    setModalState("create");
  };

  const openEditModal = (store) => {
    setSelectedStore(store);
    setModalState("edit");
  };

  const openDeleteModal = (store) => {
    setSelectedStore(store);
    setModalState("delete");
  };

  const closeModal = () => setModalState(null);

  if (user && !hasStoreAccess()) {
    return (
      <div className="container pt-4">
        <div className="alert alert-danger text-center">
          <h4>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Truy cập bị từ chối
          </h4>
          <p className="mb-0">
            Bạn không có quyền truy cập vào trang quản lý cửa hàng.
            <br />
            Vui lòng liên hệ quản trị viên nếu bạn cần truy cập.
          </p>
        </div>
      </div>
    );
  }
  //Kiểm tra user
  if (!user) {
    return (
      <div className="container pt-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="container pt-2">
      <h2 className="text-center mb-3">Quản lý cửa hàng</h2>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="text-muted">
          {currentDisplayText}
        </div>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
        >
          {/* <i className="bi bi-plus-circle me-2"></i> */}
          Thêm cửa hàng
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && currentStores.length > 0 && (
        <>
          <TableStore
            stores={currentStores}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
          />

          <nav className="mt-3">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>
                  «
                </button>
              </li>

              {pageNumbers.map((p, i) => (
                <li
                  key={i}
                  className={`page-item ${p === page ? "active" : ""} ${p === "..." ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => p !== "..." && setPage(p)}
                  >
                    {p}
                  </button>
                </li>
              ))}

              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page + 1)}>
                  »
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      {!loading && currentStores.length === 0 && (
        <div className="text-center py-4">
          <div className="text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
            Không có cửa hàng nào
          </div>
        </div>
      )}

      {modalState === "create" && (
        <StoreForm
          onSubmit={handleCreate}
          onClose={closeModal}
          isSubmitting={isSubmitting}
          creatingSpareParts={creatingSpareParts}
          mode="create"
          checkDuplicateAddress={checkDuplicateAddress}
          checkDuplicatePhone={checkDuplicatePhone}
          allStores={allStores}
        />
      )}

      {modalState === "edit" && (
        <StoreForm
          store={selectedStore}
          onSubmit={handleUpdate}
          onClose={closeModal}
          isSubmitting={isSubmitting}
          mode="edit"
          checkDuplicateAddress={checkDuplicateAddress}
          checkDuplicatePhone={checkDuplicatePhone}
          allStores={allStores}
        />
      )}

      {modalState === "delete" && (
        <DeleteStore
          store={selectedStore}
          onConfirm={handleDelete}
          onClose={closeModal}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}