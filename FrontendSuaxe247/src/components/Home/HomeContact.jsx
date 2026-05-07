function HomeContact() {
  return (
    <section
      className="text-center text-white d-flex align-items-center position-relative my-5"
      style={{
        backgroundImage: "url('/assets/banner3.jpg')", // ảnh cửa hàng phía sau
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "400px",
      }}
    >
      {/* Lớp overlay mờ tối */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      ></div>

      {/* Nội dung */}
      <div
        className="container-sm position-relative"
        style={{ maxWidth: "1200px" }}
      >
        <h3
          className="fw-bold mx-auto"
          style={{ maxWidth: "700px" }}
        >
          Liên hệ ngay với chúng tôi để được hỗ trợ tư vấn kịp thời chính xác
        </h3>

        <p className="fst-italic p-3">
          Sửa xe máy 247 – hệ thống cửa hàng sửa chữa xe máy chuyên nghiệp
        </p>

        {/* Hai số điện thoại dạng ảnh */}
        <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
          <a href="tel:1900277247">
            <img
              src="/assets/phone1.png"
              alt="Hotline 1900-277-247"
              className="img-fluid"
              style={{ maxHeight: "100px", width: "auto" }}
            />
          </a>

          <a href="tel:0934277247">
            <img
              src="/assets/phone2.png"
              alt="Hotline 0934-277-247"
              className="img-fluid"
              style={{ maxHeight: "100px", width: "auto" }}
            />
          </a>
        </div>
      </div>
    </section>
  );
}

export default HomeContact;
