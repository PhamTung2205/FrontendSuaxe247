import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import '../assets/css/Store.css';

const Store = () => {
  const [stores, setStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [imageErrors, setImageErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStores();
  }, []);

// Hàm loại bỏ dấu tiếng Việt và chuẩn hóa chuỗi
const normalizeString = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // xóa dấu
    .replace(/đ/g, "d").replace(/Đ/g, "D") // thay đ → d
    .toLowerCase()
    .trim();
};

useEffect(() => {
  if (searchTerm.trim() === "") {
    setFilteredStores(stores);
  } else {
    const normalizedSearch = normalizeString(searchTerm);

    // Tạo mảng chứa {store, score} để xếp thứ tự ưu tiên
    const scoredStores = stores
      .map((store) => {
        const normalizedAddress = normalizeString(store.address || "");
        const index = normalizedAddress.indexOf(normalizedSearch);
        if (index === -1) return null; // không khớp
        return { store, score: index }; // index càng nhỏ càng khớp sớm
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score); // sắp xếp: khớp từ trái qua phải lên trước

    setFilteredStores(scoredStores.map((item) => item.store));
  }

  setCurrentPage(1);
}, [searchTerm, stores]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const storesData = data.data || data || [];
      setStores(Array.isArray(storesData) ? storesData : []);
      setFilteredStores(Array.isArray(storesData) ? storesData : []);
    } catch (err) {
      setError('Không thể tải danh sách cửa hàng. Vui lòng thử lại sau.');
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageURL) => {
    if (!imageURL) return null;
    
    if (imageURL.startsWith('/')) {
      return `http://localhost/Suaxe247Backend/BackendSuaxe247/public${imageURL}`;
    }
    
    return imageURL;
  };

  const handleImageError = (storeId) => {
    setImageErrors(prev => ({ ...prev, [storeId]: true }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleBookAppointment = (store) => {
    // Chuyển đến trang Booking và truyền thông tin cửa hàng qua state
    navigate('/booking', { 
      state: { 
        selectedStore: store,
        fromStorePage: true
      }
    });
  };

  const getGoogleMapsEmbedUrl = (address) => {
    if (!address) return '';
    const encodedAddress = encodeURIComponent(address);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyCslOh6krmn0DFq2jwyApUsfo-RInetPMc&q=${encodedAddress}&zoom=15`;
  };

  // Phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStores = filteredStores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
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
            <button className="page-link" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              &laquo; Trước
            </button>
          </li>

          {startPage > 1 && (
            <>
              <li className="page-item"><button className="page-link" onClick={() => paginate(1)}>1</button></li>
              {startPage > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            </>
          )}

          {pageNumbers.map(number => (
            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
              <button className="page-link" onClick={() => paginate(number)}>{number}</button>
            </li>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
              <li className="page-item"><button className="page-link" onClick={() => paginate(totalPages)}>{totalPages}</button></li>
            </>
          )}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
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
            <p className="mt-3 text-muted">Đang tải danh sách cửa hàng...</p>
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
          <div className="flex-grow-1">{error}</div>
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchStores}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-4" style={{ maxWidth: '1200px' }}>
      {/* Thanh tìm kiếm */}
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
                placeholder="Tìm kiếm cửa hàng theo địa chỉ..."
                value={searchTerm}
                onChange={handleSearch}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" type="button" onClick={handleClearSearch}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
            
            {searchTerm && (
              <div className="search-results-info mt-2">
                <small className="text-muted">
                  Tìm thấy <strong>{filteredStores.length}</strong> cửa hàng phù hợp
                </small>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Danh sách cửa hàng */}
      <div className="row">
        {currentStores.length > 0 ? (
          currentStores.map((store) => {
            const imageUrl = getImageUrl(store.imageURL);
            const hasImageError = imageErrors[store.PK_idStore];
            
            return (
              <div key={store.PK_idStore} className="col-12 mb-4">
                <div className="card store-horizontal-card h-100 border-0 shadow-sm">
                  <div className="row g-0 h-100">
                    {/* Ảnh bên trái - Kích thước LỚN HƠN */}
                    <div className="col-md-4">
                      <div className="store-image-container h-100 d-flex align-items-center justify-content-center p-3">
                        <div className="store-image-wrapper" style={{ width: '100%', maxWidth: '300px', height: '200px' }}>
                          {!imageUrl || hasImageError ? (
                            <div className="store-image-placeholder d-flex flex-column align-items-center justify-content-center bg-light text-muted w-100 h-100 rounded">
                              <i className="bi bi-image fs-1 mb-2"></i>
                              <small className="text-center">Không có ảnh</small>
                            </div>
                          ) : (
                            <img 
                              src={`${imageUrl}?t=${new Date().getTime()}`}
                              className="store-image w-100 h-100 rounded"
                              alt={`Cửa hàng ${store.PK_idStore}`}
                              style={{ objectFit: 'cover' }}
                              onError={() => handleImageError(store.PK_idStore)}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Thông tin cửa hàng ở giữa */}
                    <div className="col-md-4">
                      <div className="card-body h-100 d-flex flex-column p-4">
                        <div className="store-info flex-grow-1">
                          <div className="store-address mb-4">
                            <strong className="d-block mb-2 text-dark fs-6">
                              <i className="bi bi-geo-alt text-danger me-2"></i>
                              Địa chỉ:
                            </strong>
                            <span className={!store.address ? 'text-muted' : 'text-dark'}>
                              {store.address || 'Không có địa chỉ'}
                            </span>
                          </div>
                          
                          <div className="store-phone">
                            <strong className="mb-2 text-dark fs-6">
                              <i className="bi bi-telephone text-success me-2"></i>
                              Điện thoại:
                            </strong>
                            {store.phone ? (
                              <a href={`tel:${store.phone}`} className="p-1 text-decoration-none text-dark ">
                                {store.phone}
                              </a>
                            ) : (
                              <span className="text-muted">Không có số điện thoại</span>
                            )}
                          </div>
                        </div>

                        <div className="store-actions mt-3">
                          <div className="d-flex gap-2 flex-wrap">
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleBookAppointment(store)}
                            >
                              <i className="bi bi-calendar-check me-1"></i>
                              Đặt lịch
                            </button>
                            
                            {store.phone && (
                              <a 
                                href={`tel:${store.phone}`}
                                className="btn btn-success btn-sm"
                              >
                                <i className="bi bi-telephone me-1"></i>
                                Gọi ngay
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Map nhúng bên phải - NHỎ HƠN */}
                    <div className="col-md-4">
                      <div className="store-map-container h-100 position-relative">
                        {store.address ? (
                          <iframe
                            src={getGoogleMapsEmbedUrl(store.address)}
                            className="store-map-embed w-100 h-100 p-3"
                            style={{ border: 0, minHeight: '180px' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Bản đồ cửa hàng ${store.PK_idStore}`}
                          ></iframe>
                        ) : (
                          <div className="store-map-placeholder w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light text-muted border rounded">
                            <i className="bi bi-map fs-4 mb-2"></i>
                            <small className="text-center px-3">Không có địa chỉ</small>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12 text-center py-5">
            <div className="alert alert-info">
              <i className="bi bi-shop display-4 d-block mb-3"></i>
              <h5>Không tìm thấy cửa hàng phù hợp</h5>
              {searchTerm && (
                <button className="btn btn-outline-primary mt-3" onClick={handleClearSearch}>
                  Xóa tìm kiếm
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            {renderPagination()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Store;