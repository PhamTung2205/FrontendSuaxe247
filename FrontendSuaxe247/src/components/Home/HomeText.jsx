function HomeText() {
  return (
    <section className="container-sm my-5" style={{ maxWidth: "1200px" }}>
      <div className="card shadow p-4">
        {/* --- Phần 1: Giới thiệu --- */}
        <div className="text-center mb-3">
          <h2 className="text-warning">Sửa xe 247</h2>
          <h2 className="text-primary">LỊCH SỬ HÌNH THÀNH VÀ PHÁT TRIỂN</h2>
        </div>

        <p>
          Thành lập từ năm 1997 trải qua nhiều giai đoạn với nhiều tên gọi khác
          nhau, năm 2019 đổi tên thành <strong>SỬA XE 247</strong>. Thương hiệu
          đã được đăng kí bảo hộ tại Cục sở hữu trí tuệ Việt Nam.
          <br />
          Với quy mô 20 cửa hàng, hơn 150 nhân sự được đào tạo bài bản hiện đang
          hoạt động tại Hà Nội, Đà Nẵng, Thái Nguyên, Ninh Bình và các Thành phố
          trên toàn quốc vào các năm tiếp theo. Sửa xe 247 là đơn vị đầu tiên ứng
          dụng công nghệ mới vào việc chẩn đoán pan bệnh đảm bảo sự chính xác
          ngay từ đầu, tiết kiệm chi phí cho khách hàng.
        </p>

        {/* --- Đường kẻ ngang mờ --- */}
        <hr className="my-4 text-muted" />

        {/* --- Phần 2: Lý do lựa chọn --- */}
        <div className="row align-items-center mt-3">
          {/* Cột bên trái */}
          <div className="col-md-6 mb-4 mb-md-0">
            <h3 className="text-red">LÝ DO LỰA CHỌN</h3>
            <h4 className="text-primary">
              Chuỗi cửa hàng sửa xe máy 24/7
            </h4>
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

export default HomeText;
