import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import  '../assets/css/Service.css';
const Service = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [imageErrors, setImageErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  // Hàm loại bỏ dấu và chuẩn hóa chữ thường
const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

useEffect(() => {
  if (searchTerm.trim() === "") {
    setFilteredServices(services);
  } else {
    const normalizedSearch = normalizeString(searchTerm);

    const scoredServices = services
      .map((service) => {
        const normalizedName = normalizeString(service.serviceName || "");
        const index = normalizedName.indexOf(normalizedSearch);
        if (index === -1) return null;
        return { service, score: index }; // vị trí xuất hiện đầu tiên
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score); // xếp kết quả khớp sớm lên đầu

    setFilteredServices(scoredServices.map((item) => item.service));
  }

  setCurrentPage(1);
}, [searchTerm, services]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/service');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Xử lý dữ liệu từ API
      const servicesData = data.data || data || [];
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setFilteredServices(Array.isArray(servicesData) ? servicesData : []);
    } catch (err) {
      setError('Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getImageUrl = (imageURL) => {
    if (!imageURL) return null;
    
    if (imageURL.startsWith('/')) {
      return `http://localhost/Suaxe247Backend/BackendSuaxe247/public${imageURL}`;
    }
    
    return imageURL;
  };

  // Xử lý lỗi ảnh
  const handleImageError = (serviceId) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: true }));
  };

  const handleImageLoad = (serviceId) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: false }));
  };

  // Xử lý đặt dịch vụ
  const handleBookService = (service) => {
  // Chuyển đến trang Booking và truyền thông tin dịch vụ qua state
  navigate('/booking', { 
    state: { 
      selectedService: service,
      fromServicePage: true
    }
  });
};
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <nav aria-label="Page navigation">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &laquo; Trước
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item">
                <button className="page-link" onClick={() => paginate(1)}>1</button>
              </li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}

          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button className="page-link" onClick={() => paginate(number)}>
                {number}
              </button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item">
                <button className="page-link" onClick={() => paginate(totalPages)}>
                  {totalPages}
                </button>
              </li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau &raquo;
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Đang tải danh sách dịch vụ...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <div className="me-2">⚠️</div>
          <div className="flex-grow-1">
            {error}
          </div>
          <button 
            className="btn btn-sm btn-outline-danger ms-3"
            onClick={fetchServices}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid my-4" style={{ maxWidth: '1200px' }}>
      {/* Thanh tìm kiếm - Nhỏ hơn như Store cũ */}
      <div className="row mb-4">
        <div className="col-12 col-md-8 col-lg-6 mx-auto">
          <div className="search-container">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm dịch vụ theo tên..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" type="button" onClick={handleClearSearch}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
            
            {/* Thông tin kết quả tìm kiếm */}
            {searchTerm && (
              <div className="search-results-info mt-2">
                <small className="text-muted">
                  Tìm thấy <strong>{filteredServices.length}</strong> dịch vụ phù hợp với "<strong>{searchTerm}</strong>"
                  {filteredServices.length === 0 && (
                    <span className="text-danger"> - Không có kết quả phù hợp</span>
                  )}
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách dịch vụ - Đã sửa col-11 thành col-12 */}
      <div className="row justify-content-center">
        {currentServices.length > 0 ? (
          currentServices.map((service) => {
            const imageUrl = getImageUrl(service.imageURL);
            const hasImageError = imageErrors[service.PK_idService];
            
            return (
              <div key={service.PK_idService} className="col-12 mb-4">
                <div className="card service-card-horizontal border-0 shadow-sm mx-3">
                  <div className="row g-0 h-100">
                    {/* Ảnh bên trái - Responsive tốt */}
                    <div className="col-md-3">
                      <div className="service-image-wrapper h-100 d-flex align-items-center justify-content-center p-3">
                        <div className="service-image-container w-100 h-100">
                          {!imageUrl ? (
                            // Không có URL ảnh
                            <div 
                              className="service-image-placeholder d-flex flex-column align-items-center justify-content-center bg-light text-muted w-100 h-100"
                            >
                              <i className="bi bi-image fs-1 mb-2"></i>
                              <small className="text-center">Không có ảnh</small>
                            </div>
                          ) : hasImageError ? (
                            // Có URL nhưng không tìm thấy ảnh
                            <div 
                              className="service-image-placeholder d-flex flex-column align-items-center justify-content-center bg-light text-danger w-100 h-100"
                            >
                              <i className="bi bi-exclamation-triangle fs-1 mb-2"></i>
                              <small className="text-center">Không tìm thấy ảnh</small>
                            </div>
                          ) : (
                            // Hiển thị ảnh bình thường
                            <img 
                              src={`${imageUrl}?t=${new Date().getTime()}`}
                              className="service-image w-100 h-100"
                              alt={service.serviceName}
                              onError={() => handleImageError(service.PK_idService)}
                              onLoad={() => handleImageLoad(service.PK_idService)}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Nội dung bên phải */}
                    <div className="col-md-9">
                      <div className="card-body d-flex flex-column h-100 p-4">
                        <div className="row flex-grow-1">
                          <div className="col-12 col-lg-8">
                            <h5 className="card-title text-primary fw-bold mb-3 service-name">
                              {service.serviceName}
                            </h5>
                            
                            {service.description && (
                              <div className="service-description-container">
                                <p className="card-text text-muted mb-3 service-description">
                                  {service.description}
                                </p>
                              </div>
                            )}
                            
                            <div className="service-details d-flex align-items-center gap-4">
                              <div className="service-price">
                                <span className="fw-bold text-success fs-5">
                                  {formatPrice(service.estimatedPrice)}
                                </span>
                              </div>
                              
                              <div className="service-time">
                                <span className="text-muted">
                                  <i className="bi bi-clock me-2"></i>
                                  Thời gian dự tính: <strong>{service.estimatedTime} phút</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Nút đặt dịch vụ - To hơn */}
                          <div className="col-12 col-lg-4 d-flex flex-column justify-content-end align-items-end">
                            <div className="book-button-wrapper">
                              <button 
                                className="btn btn-light btn-book-service btn-lg"
                                onClick={() => handleBookService(service)}
                              >
                                <i className="bi bi-calendar-plus me-2"></i>
                                Đặt dịch vụ
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Hiển thị khi không có dịch vụ nào
          <div className="col-12 text-center py-5">
            <div className="alert alert-info">
              <i className="bi bi-search display-4 d-block mb-3"></i>
              <h5>Không tìm thấy dịch vụ phù hợp</h5>
              <p className="mb-0">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả dịch vụ.</p>
              {searchTerm && (
                <button 
                  className="btn btn-outline-primary mt-3"
                  onClick={handleClearSearch}
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phân trang - Chỉ hiển thị khi có nhiều hơn 1 trang */}
      {totalPages > 1 && filteredServices.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            {renderPagination()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;