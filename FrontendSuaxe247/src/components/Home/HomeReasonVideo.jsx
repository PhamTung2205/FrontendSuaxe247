function HomeReasonVideo() {
  return (
    <section className="container-sm my-5" style={{ maxWidth: "1200px" }}>
      <div className="card shadow p-4">
        <div className="row align-items-center">
          {/* Cột bên trái */}
          <div className="col-md-6 mb-4 mb-md-0">
            <h2 className="text-red">LÝ DO LỰA CHỌN</h2>
            <h2 style={{ color: "#0081c5" }}>
              Chuỗi cửa hàng sửa xe máy 24/7.
            </h2>
            <p>
              Với bề dày hơn <strong>27 năm</strong> kinh nghiệm. Hệ thống cửa
              hàng <strong>SỬA XE 247</strong> luôn nhận được sự tin tưởng tuyệt
              đối từ khách hàng.
            </p>

            <div className="row">
              {/* Cột trái: tick xanh */}
              <div className="col-6">
                <div className="d-flex align-items-center border-bottom py-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <span className="fw-semibold">Trang thiết bị hiện đại</span>
                </div>
                <div className="d-flex align-items-center border-bottom py-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <span className="fw-semibold">Dịch vụ chuyên nghiệp</span>
                </div>
              </div>

              {/* Cột phải: sao vàng */}
              <div className="col-6">
                <div className="d-flex align-items-center border-bottom py-2">
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  <span className="fw-semibold">Phụ tùng chính hiệu</span>
                </div>
                <div className="d-flex align-items-center border-bottom py-2">
                  <i className="bi bi-star-fill text-warning me-2"></i>
                  <span className="fw-semibold">Kỹ thuật chính xác</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột bên phải (Video YouTube) */}
          <div className="col-md-6 d-flex justify-content-center">
            <div
              className="ratio ratio-16x9 border border-warning rounded"
              style={{ maxWidth: "450px" }}
            >
              <iframe
                src="https://www.youtube.com/embed/QJoXpZ9qiws?si=R57GuaKHHDIOvI3X"
                title="YouTube video"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeReasonVideo;
