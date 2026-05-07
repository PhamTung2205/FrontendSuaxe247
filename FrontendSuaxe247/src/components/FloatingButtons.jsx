import React from "react";
import { useLocation } from "react-router-dom";

const FloatingButtons = () => {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  // ✅ Chỉ hiển thị ở các trang public
  const allowedPaths = [
    "/",
    "/store",
    "/service",
    "/booking",
    "/rescue",
    "/profile",
    "/repair_history",
  ];

  if (!allowedPaths.includes(currentPath)) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        zIndex: 9999,
      }}
    >
      {/* Nút Zalo */}
      <a
        href="https://zalo.me/0934277247"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: "#0084ff",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src="/assets/zalo.png"
          alt="Zalo"
          style={{ width: "28px", height: "28px", objectFit: "contain" }}
        />
      </a>

      {/* Nút Phone */}
      <a
        href="tel:1900277247"
        style={{
          backgroundColor: "#ff3b30",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <img
          src="/assets/phone.png"
          alt="Phone"
          style={{ width: "28px", height: "28px", objectFit: "contain" }}
        />
      </a>
    </div>
  );
};

export default FloatingButtons;
