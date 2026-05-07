import React from "react";
import { Link } from 'react-router-dom';
import "../assets/css/Footer.css"; 
import Logo from '../assets/react.svg'

export default function Footer() {
  return (
    <footer className="footer text-light pt-5 pb-3">
      <div className="container">
        <div className="row">
          {/* Logo + Giới thiệu */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="d-flex align-items-center mb-3">
              <Link to="/">
                <img
                  src="/assets/logo-full.png"
                  alt="Sửa Xe 247"
                  style={{ height: "70px" }}
                />
              </Link>
            </div>
            <p>
              Đội cứu hộ xe máy Hà Nội chuyên nghiệp chỉ sau 10 phút là có mặt hỗ
              trợ khách hàng các lỗi về xe máy.
            </p>
            <div className="d-flex gap-3 fs-5">
              <i className="bi bi-facebook"></i>
              <i className="bi bi-instagram"></i>
              <i className="bi bi-tiktok"></i>
              <i className="bi bi-twitter"></i>
              <i className="bi bi-youtube"></i>
              <i className="bi bi-pinterest"></i>
            </div>
          </div>

          {/* Thông tin */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Thông tin</h6>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-light text-decoration-none">Trang chủ</Link></li>
              <li><Link to="/about" className="text-light text-decoration-none">Giới thiệu</Link></li>
              <li><Link to="/parts" className="text-light text-decoration-none">Phụ tùng</Link></li>
              <li><Link to="/contact" className="text-light text-decoration-none">Liên hệ</Link></li>
              <li><Link to="/News" className="text-light text-decoration-none">Tin tức</Link></li>
              <li><Link to="/sitemap" className="text-light text-decoration-none">Sitemap</Link></li>
            </ul>
          </div>

          {/* Dịch vụ */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Dịch vụ</h6>
            <ul className="list-unstyled">
              <li><Link to="/Service" className="text-light text-decoration-none">Cứu hộ xe máy</Link></li>
              <li><Link to="/Service" className="text-light text-decoration-none">Sửa xe máy tại nhà</Link></li>
              <li><Link to="/Service" className="text-light text-decoration-none">Bảo dưỡng định kỳ xe máy</Link></li>
              <li><Link to="/Service" className="text-light text-decoration-none">Tân trang xe máy</Link></li>
              <li><Link to="/Service" className="text-light text-decoration-none">Phục hồi xe máy tai nạn</Link></li>
              <li><Link to="/Service" className="text-light text-decoration-none">Sơn, dán nilon xe máy</Link></li>
              <li><Link to="/Service" className="text-light text-decoration-none">Độ đèn xe máy</Link></li>
            </ul>
          </div>

          {/* Fanpage */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-uppercase fw-bold mb-3">Fanpage Sửa xe 247</h6>
            <div className="bg-light p-2 rounded">
              <iframe
                src="https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/suaxe247.vn&tabs&width=250&height=200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true"
                width="100%"
                height="200"
                style={{ border: "none", overflow: "hidden" }}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                title="fanpage"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <hr className="my-4" />
        <div className="row">
          <div className="col-12 text-center">
            <p className="mb-0">
              © 2025 Sửa Xe 247 (Nhận-Thương-Tùng). Tất cả quyền được bảo lưu. 
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}