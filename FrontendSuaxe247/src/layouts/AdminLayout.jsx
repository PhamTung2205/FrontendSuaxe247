import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminMenu from "../components/AdminMenu";
import "../assets/css/AdminLayout.css";

function AdminLayout({ user, setUser }) { // 🌟 nhận props user + setUser
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Nút toggle menu cho mobile */}
      <button 
        className="menu-toggle-btn"
        onClick={toggleMenu}
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Overlay cho mobile */}
      <div 
        className={`menu-overlay ${isMenuOpen ? 'show' : ''}`}
        onClick={closeMenu}
      ></div>

      <div className="row g-0">
        <div className={`col-12 col-lg-2 admin-menu-container ${isMenuOpen ? 'menu-open' : ''}`}>
          <AdminMenu user={user} setUser={setUser} onItemClick={closeMenu} /> {/* 🌟 truyền user + setUser */}
        </div>
      
        <div className="col-12 col-lg-10 bg-white border px-4 outlet-container">
          <Outlet/>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
