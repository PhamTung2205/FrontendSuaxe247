import React, { useState, useEffect } from "react";
import { ServiceManager, showToast, getImageUrl, formatPrice, formatPriceDisplay } from "../../../assets/js/ServiceAdmin.js";

// Component TableService
function TableService({ services, onEdit, onDelete, canEdit = true }) {
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (serviceId) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: true }));
  };

  const handleImageLoad = (serviceId) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: false }));
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover text-center align-middle mb-0">
        <thead className="table-dark">
          <tr>
            <th>STT</th>
            <th>Mã dịch vụ</th>
            <th>Tên dịch vụ</th>
            <th>Mô tả</th>
            <th>Giá</th>
            <th>Thời gian ước tính</th>
            <th>Hình ảnh</th>
            {canEdit && <th>Hành động</th>}
          </tr>
        </thead>
        <tbody>
          {services.length > 0 ? (
            services.map((service, index) => (
              <tr key={service.PK_idService}>
                <td className="text-center">{index + 1}</td>
                <td className="fw-bold">{service.PK_idService}</td>
                <td className="text-start">{service.serviceName}</td>
                <td className="text-start">
                  {service.description ? (
                    <span title={service.description}>
                      {service.description.length > 50
                        ? `${service.description.substring(0, 50)}...`
                        : service.description
                      }
                    </span>
                  ) : (
                    <span className="text-muted">Không có mô tả</span>
                  )}
                </td>
                <td className="text-success fw-bold">{formatPrice(service.estimatedPrice)}</td>
                <td>{service.estimatedTime ? `${service.estimatedTime} phút` : "Không xác định"}</td>
                <td>
                  <div className="d-flex justify-content-center">
                    <div
                      className="border rounded d-flex align-items-center justify-content-center bg-light"
                      style={{
                        width: '80px',
                        height: '80px',
                        overflow: 'hidden'
                      }}
                    >
                      {service.imageURL ? (
                        imageErrors[service.PK_idService] ? (
                          <div className="text-danger text-center p-2">
                            <i className="bi bi-exclamation-triangle-fill fs-5 d-block mb-1"></i>
                            <small>Lỗi tải ảnh</small>
                          </div>
                        ) : (
                          <img
                            src={getImageUrl(service.imageURL)}
                            alt={`Dịch vụ ${service.serviceName}`}
                            className="img-fluid object-fit-cover"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                            onError={() => handleImageError(service.PK_idService)}
                            onLoad={() => handleImageLoad(service.PK_idService)}
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
                {canEdit && (
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => onEdit(service)}
                      title="Sửa dịch vụ"
                    >
                      {/* <i className="bi bi-pencil"></i> */}
                      Sửa
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(service)}
                      title="Xóa dịch vụ"
                    >
                      {/* <i className="bi bi-trash"></i> */}
                      Xóa
                    </button>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={canEdit ? "8" : "7"} className="text-center py-4">
                <div className="text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  Không có dịch vụ nào
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Component ServiceForm
function ServiceForm({ service, onSubmit, onClose, isSubmitting, mode = "create", checkDuplicateServiceId,
  checkDuplicateServiceName }) {
  const [form, setForm] = useState({
    PK_idService: service?.PK_idService || "",
    serviceName: service?.serviceName || "",
    description: service?.description || "",
    estimatedPrice: service?.estimatedPrice || "",
    estimatedTime: service?.estimatedTime || "",
    imageFile: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const [errors, setErrors] = useState({});

  const serviceManager = new ServiceManager();

  useEffect(() => {
    if (service?.imageURL) {
      setPreviewError(false);
      const img = new Image();
      img.src = getImageUrl(service.imageURL);

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
  }, [service]);

  const validate = async () => {
    const errs = serviceManager.validateServiceForm(form, mode);

    if (mode === "edit" && previewError && !form.imageFile) {
      errs.imageFile = "Ảnh hiện tại đã bị xóa. Vui lòng chọn ảnh mới!";
    }
     if (!form.estimatedTime || form.estimatedTime.trim() === "") {
    errs.estimatedTime = "Vui lòng nhập thời gian ước tính (phút)!";
  } else if (isNaN(form.estimatedTime) || Number(form.estimatedTime) <= 0) {
    errs.estimatedTime = "Thời gian ước tính phải là số phút hợp lệ (lớn hơn 0)!";
  }

    // KIỂM TRA TRÙNG LẶP MÃ DỊCH VỤ (chỉ khi tạo mới)
    if (mode === "create" && form.PK_idService && form.PK_idService.trim()) {
      const isDuplicateId = await checkDuplicateServiceId(form.PK_idService.trim());
      if (isDuplicateId) {
        errs.PK_idService = "Mã dịch vụ này đã tồn tại trong hệ thống!";
      }
    }

    //KIỂM TRA TRÙNG LẶP TÊN DỊCH VỤ
    if (form.serviceName && form.serviceName.trim()) {
      const isDuplicateName = await checkDuplicateServiceName(
        form.serviceName.trim(),
        mode === "edit" ? service?.PK_idService : null
      );
      if (isDuplicateName) {
        errs.serviceName = "Tên dịch vụ này đã tồn tại trong hệ thống!";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
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
      if (service?.imageURL) {
        const img = new Image();
        img.src = getImageUrl(service.imageURL);

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

  const handleServiceIdChange = async (e) => {
    const newServiceId = e.target.value;
    setForm({ ...form, PK_idService: newServiceId });

    // Clear error trước
    setErrors(prev => ({ ...prev, PK_idService: undefined }));

    // Kiểm tra real-time sau 500ms (chỉ khi tạo mới)
    if (mode === "create" && newServiceId.trim()) {
      setTimeout(async () => {
        const isDuplicate = await checkDuplicateServiceId(newServiceId.trim());
        if (isDuplicate) {
          setErrors(prev => ({ ...prev, PK_idService: "Mã dịch vụ này đã tồn tại trong hệ thống!" }));
        }
      }, 500);
    }
  };

  // Hàm xử lý khi tên dịch vụ thay đổi
  const handleServiceNameChange = async (e) => {
    const newServiceName = e.target.value;
    setForm({ ...form, serviceName: newServiceName });

    // Clear error trước
    setErrors(prev => ({ ...prev, serviceName: undefined }));

    // Kiểm tra real-time sau 500ms
    if (newServiceName.trim() && newServiceName.trim().length > 2) {
      setTimeout(async () => {
        const isDuplicate = await checkDuplicateServiceName(
          newServiceName.trim(),
          mode === "edit" ? service?.PK_idService : null
        );
        if (isDuplicate) {
          setErrors(prev => ({ ...prev, serviceName: "Tên dịch vụ này đã tồn tại trong hệ thống!" }));
        }
      }, 500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🆕 THÊM LOADING CHO VALIDATE
    setErrors({ ...errors, validating: "Đang kiểm tra dữ liệu..." });

    const isValid = await validate();
    if (!isValid) {
      setErrors(prev => ({ ...prev, validating: undefined }));
      return;
    }

    setErrors(prev => ({ ...prev, validating: undefined }));

    const submitData = {
      ...form,
      estimatedPrice: Number(form.estimatedPrice),
      estimatedTime: form.estimatedTime ? Number(form.estimatedTime) : null
    };

    onSubmit(submitData);
  };

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {mode === "create" ? "Thêm dịch vụ mới" : "Sửa thông tin dịch vụ"}
              </h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">
                        Mã dịch vụ {mode === "create" && <span className="text-danger">*</span>}
                      </label>
                      {mode === "create" ? (
                        <input
                          type="text"
                          className={`form-control ${errors.PK_idService ? "is-invalid" : ""}`}
                          value={form.PK_idService}
                          onChange={handleServiceIdChange}
                          placeholder="Nhập mã dịch vụ"
                        />
                      ) : (
                        <input
                          type="text"
                          className="form-control bg-light"
                          value={form.PK_idService}
                          readOnly
                        />
                      )}
                      {errors.PK_idService && (
                        <div className="invalid-feedback d-block">{errors.PK_idService}</div>
                      )}
                      {mode === "edit" && (
                        <div className="form-text text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Mã dịch vụ không thể thay đổi
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Tên dịch vụ <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className={`form-control ${errors.serviceName ? "is-invalid" : ""}`}
                        value={form.serviceName}
                        onChange={handleServiceNameChange}
                        placeholder="Nhập tên dịch vụ"
                      />
                      {errors.serviceName && (
                        <div className="invalid-feedback d-block">{errors.serviceName}</div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Giá dịch vụ <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${errors.estimatedPrice ? "is-invalid" : ""}`}
                          value={form.estimatedPrice}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setForm({ ...form, estimatedPrice: value });
                          }}
                          placeholder="Nhập giá dịch vụ"
                        />
                        <span className="input-group-text">VNĐ</span>
                      </div>
                      {errors.estimatedPrice && (
                        <div className="invalid-feedback d-block">{errors.estimatedPrice}</div>
                      )}
                      {form.estimatedPrice && (
                        <div className="form-text text-success">
                          <i className="bi bi-currency-exchange me-1"></i>
                          {formatPriceDisplay(form.estimatedPrice)} VNĐ
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Thời gian ước tính <span className="text-danger">*</span></label>
                      <div className="input-group">
                        <input
                          type="text"
                          className={`form-control ${errors.estimatedTime ? "is-invalid" : ""}`}
                          value={form.estimatedTime}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setForm({ ...form, estimatedTime: value });
                          }}
                          placeholder="Nhập thời gian ước tính"
                        />
                        <span className="input-group-text">phút</span>
                      </div>
                      {errors.estimatedTime && (
                        <div className="invalid-feedback d-block">{errors.estimatedTime}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Mô tả dịch vụ</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        maxLength={500}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Nhập mô tả chi tiết về dịch vụ..."
                      />
                      <div
                        className={`form-text ${form.description.length >= 500 ? "text-danger fw-bold" : ""
                          }`}
                      >
                        {form.description.length}/500 ký tự
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">
                        Ảnh dịch vụ{" "}
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
                    </div>

                    {(previewImage || previewError) && (
                      <div className="text-center">
                        <p className="small text-muted mb-2">
                          {form.imageFile ? "Ảnh mới:" : "Ảnh hiện tại:"}
                        </p>
                        <div
                          className="border rounded d-flex align-items-center justify-content-center bg-light mx-auto"
                          style={{
                            width: '150px',
                            height: '150px',
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
                          <div className="text-success small mt-2">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            Đã chọn ảnh mới
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>


                {errors.validating && (
                  <div className="alert alert-info d-flex align-items-center mb-3 py-2">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <small>{errors.validating}</small>
                  </div>
                )}
                <div className="d-flex justify-content-end mt-3">
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

// Component DeleteService
function DeleteService({ service, onConfirm, onClose, isSubmitting }) {
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
              <h5 className="modal-title">Bạn có chắc chắn muốn xóa dịch vụ này không?</h5>
              <button type="button" className="btn-close " onClick={onClose}></button>
            </div>
            <div className="modal-body">

              <div className="">
                <div className="card-body p-0">
                  {/* <h6 className="card-title text-danger">Thông tin dịch vụ sẽ bị xóa:</h6> */}
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex">
                      <strong style={{ width: '170px' }}>Mã dịch vụ:</strong>
                      <span>{service?.PK_idService}</span>
                    </div>

                    <div className="d-flex">
                      <strong style={{ width: '170px' }}>Tên dịch vụ:</strong>
                      <span>{service?.serviceName}</span>
                    </div>

                    <div className="d-flex">
                      <strong style={{ width: '170px' }}>Mô tả:</strong>
                      <span>{service?.description || "Không có mô tả"}</span>
                    </div>

                    <div className="d-flex">
                      <strong style={{ width: '170px' }}>Giá:</strong>
                      <span className="text-success fw-bold">{formatPrice(service?.estimatedPrice)}</span>
                    </div>

                    <div className="d-flex">
                      <strong style={{ width: '170px' }}>Thời gian ước tính:</strong>
                      <span>{service?.estimatedTime ? `${service.estimatedTime} phút` : "Không xác định"}</span>
                    </div>

                    <div className="d-flex align-items-center">
                      <strong style={{ width: '170px' }}>Ảnh:</strong>
                      <div
                        className="border rounded d-flex align-items-center justify-content-center bg-light"
                        style={{
                          width: '80px',
                          height: '80px',
                          overflow: 'hidden'
                        }}
                      >
                        {service?.imageURL ? (
                          imageError ? (
                            <div className="text-danger text-center p-1">
                              <i className="bi bi-exclamation-triangle-fill d-block mb-1"></i>
                              <small>Lỗi ảnh</small>
                            </div>
                          ) : (
                            <img
                              src={getImageUrl(service.imageURL)}
                              alt="Service"
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

              <div className="alert alert-warning mt-3 mb-0">
                <small>
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <strong>Lưu ý:</strong> Hành động này không thể hoàn tác!
                </small>
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

// Component ServiceFilters
function ServiceFilters({ searchTerm, onSearch, filterPrice, onFilter, canEditService, openCreateModal }) {
  const handleSearch = (e) => {
    const value = e.target.value;
    onSearch(value);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    onFilter(value);
  };

  return (
    <div className="row my-3 align-items-center">

      {/* Tìm theo mã/tên dịch vụ */}
      <div className="col-md-5 d-flex align-items-center">
        <label htmlFor="searchInput" className="form-label mb-0 me-2 col-auto">
          Mã dịch vụ/Tên dịch vụ:
        </label>
        <input
          id="searchInput"
          type="text"
          className="form-control"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Lọc theo giá */}
      <div className="col-md-5 d-flex align-items-center">
        <label htmlFor="filterPrice" className="form-label mb-0 me-2 col-auto">
          Lọc theo giá:
        </label>
        <select
          id="filterPrice"
          className="form-select"
          value={filterPrice}
          onChange={handleFilterChange}
        >
          <option value="">Tất cả giá</option>
          <option value="0-100000">Dưới 100,000 VNĐ</option>
          <option value="100000-500000">100,000 - 500,000 VNĐ</option>
          <option value="500000-1000000">500,000 - 1,000,000 VNĐ</option>
          <option value="1000000">Trên 1,000,000 VNĐ</option>
        </select>
      </div>

      {/* Nút thêm dịch vụ */}
      <div className="col-md-2 text-end">
        {canEditService && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            Thêm dịch vụ
          </button>
        )}
      </div>
    </div>
  );
}


// Main Component
export default function Service() {
  const API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/service";
  const [allServices, setAllServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [currentServices, setCurrentServices] = useState([]);
  const [modalState, setModalState] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  // State cho phân trang và filter
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrice, setFilterPrice] = useState("");

  const serviceManager = new ServiceManager(API_URL);



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
  const canEditService = () => {
    return user && (user.roleName === "Admin" || user.roleName === "Quản lý hệ thống");
  };
  // Fetch tất cả dịch vụ từ API
  const fetchServices = async () => {
    setLoading(true);
    try {
      const result = await serviceManager.fetchServices();

      if (result.success) {
        setAllServices(result.data);
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
      await fetchUserSession();
      await fetchServices();
    };
    init();
  }, []);

  // Filter dịch vụ dựa trên search và filter
  useEffect(() => {
    const filtered = serviceManager.filterServices(allServices, searchTerm, filterPrice);
    setFilteredServices(filtered);
    setPage(1); // Reset về trang 1 khi filter thay đổi
  }, [allServices, searchTerm, filterPrice]);

  // Tính toán dịch vụ cho trang hiện tại
  useEffect(() => {
    const { currentItems } = serviceManager.getPaginatedData(filteredServices, page, perPage);
    setCurrentServices(currentItems);
  }, [filteredServices, page, perPage]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (priceRange) => {
    setFilterPrice(priceRange);
  };




  const handleCreate = async (form) => {
    setIsSubmitting(true);
    try {
      const result = await serviceManager.createService(form);

      if (result.success) {
        showToast("success", result.message);
        await fetchServices();
        setModalState(null);
        setPage(1);
      } else {
        showToast("error", result.message);
      }
    } catch (err) {
      console.error("Lỗi thêm dịch vụ:", err);
      showToast("error", "Lỗi kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (form) => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const result = await serviceManager.updateService(selectedService.PK_idService, form);

      if (result.success) {
        showToast("success", result.message);
        await fetchServices();
        setModalState(null);
        setSelectedService(null);
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

  const handleDelete = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const result = await serviceManager.deleteService(selectedService.PK_idService);

      if (result.success) {
        showToast("success", result.message);
        await fetchServices();

        // Nếu trang hiện tại trống sau khi xóa, quay về trang trước
        if (currentServices.length === 1 && page > 1) {
          setPage(page - 1);
        }

        setModalState(null);
        setSelectedService(null);
      } else {
        showToast("error", result.message);
      }
    } catch (err) {
      console.error("Lỗi xóa dịch vụ:", err);
      showToast("error", "Lỗi kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🆕 Hàm kiểm tra mã dịch vụ đã tồn tại
  const checkDuplicateServiceId = async (serviceId, currentServiceId = null) => {
    try {
      const duplicateServices = allServices.filter(service =>
        service.PK_idService === serviceId &&
        service.PK_idService !== currentServiceId
      );
      return duplicateServices.length > 0;
    } catch (error) {
      console.error('Lỗi khi kiểm tra mã dịch vụ:', error);
      return false;
    }
  };

  // 🆕 Hàm kiểm tra tên dịch vụ đã tồn tại
  // const checkDuplicateServiceName = async (serviceName, currentServiceId = null) => {
  //   try {
  //     const duplicateServices = allServices.filter(service => 
  //       service.serviceName.toLowerCase() === serviceName.toLowerCase() && 
  //       service.PK_idService !== currentServiceId
  //     );
  //     return duplicateServices.length > 0;
  //   } catch (error) {
  //     console.error('Lỗi khi kiểm tra tên dịch vụ:', error);
  //     return false;
  //   }
  // };
  const normalizeText = (text) => {
    return text
      .normalize("NFD") // tách dấu ra khỏi ký tự
      .replace(/[\u0300-\u036f]/g, "") // xóa dấu
      .replace(/\s+/g, "") // bỏ tất cả khoảng trắng
      .toLowerCase(); // chuyển thường
  };
  const checkDuplicateServiceName = async (serviceName, currentServiceId = null) => {
    try {
      const normalizedInput = normalizeText(serviceName);

      const duplicateServices = allServices.filter(service => {
        const normalizedExisting = normalizeText(service.serviceName);
        return (
          normalizedExisting === normalizedInput &&
          service.PK_idService !== currentServiceId
        );
      });

      return duplicateServices.length > 0;
    } catch (error) {
      console.error("Lỗi khi kiểm tra tên dịch vụ:", error);
      return false;
    }
  };

  const { currentDisplayText, totalPages } = serviceManager.getPaginatedData(filteredServices, page, perPage);
  const pageNumbers = serviceManager.getPageNumbers(page, totalPages);

  const openCreateModal = () => {
    setSelectedService(null);
    setModalState("create");
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setModalState("edit");
  };

  const openDeleteModal = (service) => {
    setSelectedService(service);
    setModalState("delete");
  };

  const closeModal = () => setModalState(null);

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
      <h2 className="text-center mb-3">Quản lý dịch vụ</h2>

      <div className="d-flex justify-content-between align-items-center">
        <div className="text-muted">
          {currentDisplayText}
        </div>
      </div>
    <ServiceFilters
      searchTerm={searchTerm}
      onSearch={handleSearch}
      filterPrice={filterPrice}
      onFilter={handleFilter}
      canEditService={canEditService()}
      openCreateModal={openCreateModal}
    />


      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && currentServices.length > 0 && (
        <>
          <TableService
            services={currentServices}
            onEdit={canEditService() ? openEditModal : null}
            onDelete={canEditService() ? openDeleteModal : null}
            canEdit={canEditService()}
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

      {!loading && currentServices.length === 0 && (
        <div className="text-center py-4">
          <div className="text-muted">
            <i className="bi bi-inbox fs-1 d-block mb-2"></i>
            Không có dịch vụ nào
          </div>
        </div>
      )}
      {canEditService() && (
        <>
          {modalState === "create" && (
            <ServiceForm
              onSubmit={handleCreate}
              onClose={closeModal}
              isSubmitting={isSubmitting}
              mode="create"
              checkDuplicateServiceId={checkDuplicateServiceId}
              checkDuplicateServiceName={checkDuplicateServiceName}
            />
          )}

          {modalState === "edit" && (
            <ServiceForm
              service={selectedService}
              onSubmit={handleUpdate}
              onClose={closeModal}
              isSubmitting={isSubmitting}
              mode="edit"
              checkDuplicateServiceId={checkDuplicateServiceId}
              checkDuplicateServiceName={checkDuplicateServiceName}
            />
          )}

          {modalState === "delete" && (
            <DeleteService
              service={selectedService}
              onConfirm={handleDelete}
              onClose={closeModal}
              isSubmitting={isSubmitting}
            />
          )}
        </>
      )}
    </div>
  );
}