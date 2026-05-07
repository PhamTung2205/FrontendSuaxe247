import React from "react";
import HomeLayout from "../layouts/HomeLayout";

export default function Home() {
  // const showSuccess = () => {
  //   window.Toast.fire({
  //     icon: "success",
  //     title: "Thành công! Bạn đã bấm nút"
  //   });
  // };

  // const showError = () => {
  //   window.Toast.fire({
  //     icon: "error",
  //     title: "Thất bại! Có lỗi xảy ra"
  //   });
  // };

  return (
    <>
      <HomeLayout />
      {/* <div className="container mt-5">
        <h1>Trang Home</h1>
        <button className="btn btn-success me-2" onClick={showSuccess}>
          Test Thành công
        </button>
        <button className="btn btn-danger" onClick={showError}>
          Test Thất bại
        </button>
      </div> */}
    </>
  );
}
