import React from "react";

function HomeInfomation() {
  return (
    <section className="container-sm my-5" style={{ maxWidth: "1200px" }}>
      <div className="card shadow py-5 px-3">
        <div className="row text-center">
          {/* KỸ THUẬT VIÊN */}
          <div className="col-md-3 col-6 ">
            <i className="bi bi-people display-4 text-dark"></i>
            <h2 className="fw-semibold text-primary fs-2 my-3">150</h2>
            <p className=" text-uppercase fs-5 mb-0">KỸ THUẬT VIÊN</p>
          </div>

          {/* NĂM KINH NGHIỆM */}
          <div className="col-md-3 col-6 ">
            <i className="bi bi-journal-text display-4 text-dark"></i>
            <h2 className="fw-semibold text-primary fs-2 my-3">27</h2>
            <p className=" text-uppercase fs-5 mb-0">NĂM KINH NGHIỆM</p>
          </div>

          {/* CƠ SỞ */}
          <div className="col-md-3 col-6 ">
            <i className="bi bi-geo-alt display-4 text-dark"></i>
            <h2 className="fw-semibold text-primary fs-2 my-3">20</h2>
            <p className=" text-uppercase fs-5 mb-0">
              CƠ SỞ HÀ NỘI; ĐÀ NẴNG; THÁI NGUYÊN; NINH BÌNH
            </p>
          </div>

          {/* KHÁCH HÀNG HÀI LÒNG */}
          <div className="col-md-3 col-6 ">
            <i className="bi bi-trophy display-4 text-dark"></i>
            <h2 className="fw-semibold text-primary fs-2 my-3">95 %</h2>
            <p className=" text-uppercase fs-5 mb-0">KHÁCH HÀNG HÀI LÒNG</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeInfomation;
