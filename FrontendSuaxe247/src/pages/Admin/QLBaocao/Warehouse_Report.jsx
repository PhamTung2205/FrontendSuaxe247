import { useState, useEffect } from "react";
import logoFull from "../../../assets/images/logo-full.png";

export default function Warehouse_Report() {
  const BASE_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api";
  const REPORT_API_URL = `${BASE_URL}/warehouse_report`;
  const SESSION_API_URL = `${BASE_URL}/user/session`;
  const STORE_API_URL = `${BASE_URL}/store`;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [userInfo, setUserInfo] = useState(null);
  const [inputsChanged, setInputsChanged] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("all"); 

  const fetchSession = async () => {
    try {
      const res = await fetch(SESSION_API_URL, { credentials: "include" });
      const result = await res.json();
      if (result.status === "success") {
        setUserRole(result.user.roleName);
      } else {
        setUserRole(null);
        window.Toast.fire({
          icon: "error",
          title: "Không thể lấy thông tin người dùng!",
        });
      }
    } catch (err) {
      window.Toast.fire({
        icon: "error",
        title: "Lỗi khi lấy thông tin phiên đăng nhập! " + err,
      });
      setUserRole(null);
    } finally {
      setLoadingRole(false); // ✅ báo hiệu đã tải xong
    }
  };

   // ===== Lấy danh sách cửa hàng =====
  const fetchStores = async () => {
    try {
      const res = await fetch(STORE_API_URL);
      const result = await res.json();
      if (result.status === "success") setStores(result.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cửa hàng:", err);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchStores();
  }, []);


  // ====== Gọi API tạo báo cáo ======
  const fetchReport = async () => {
    if (!from || !to) {
      window.Toast.fire({
        icon: "warning",
        title: "Vui lòng chọn khoảng thời gian hợp lệ!",
      });
      return;
    }
    setLoading(true);
    setReport(null);

    try {
      // Tạo instance URLSearchParams (KHÔNG gọi .toString() ở đây)
      const params = new URLSearchParams();
      params.append("from", from);
      params.append("to", to);

      // Nếu là Admin hoặc Quản lý hệ thống thì gửi storeId
      if (["Quản lý hệ thống", "Admin"].includes(userRole)) {
        if (selectedStoreId && selectedStoreId !== "all") {
          params.append("storeId", selectedStoreId);
        }
      }

      // Chuyển thành chuỗi query khi build URL
      const queryString = params.toString();

      const res = await fetch(`${REPORT_API_URL}?${queryString}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.status === "success") {
        setReport(data.data);
        window.Toast.fire({
          icon: "success",
          title: "Tạo báo cáo thành công!",
        });
      } else {
        window.Toast.fire({
          icon: "error",
          title: data.message || "Không thể tải báo cáo!",
        });
      }
    } catch (err) {
      window.Toast.fire({
        icon: "error",
        title: "Có lỗi xảy ra khi tạo báo cáo! " + err,
      });
      console.error("fetchReport error:", err);
    } finally {
      setLoading(false);
    }
  };


  const handlePrintReport = () => {
    if (!report) {
      window.Toast.fire({
        icon: "warning",
        title: "Chưa có dữ liệu để in!",
      });
      return;
    }

    // Mở tab mới
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Sinh bảng dữ liệu
    const tableRows = report.data?.length
      ? report.data
          .map(
            (item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td class="text-start">${item.sparePartName}</td>
            <td>${item.sparePartId}</td>
            <td>${item.unit}</td>
            <td>${item.importQty || 0}</td>
            <td class="text-end">${item.importPrice?.toLocaleString("vi-VN") || ""}</td>
            <td class="text-end">${item.importAmount?.toLocaleString("vi-VN") || ""}</td>
            <td>${item.exportQty || 0}</td>
            <td class="text-end">${item.exportPrice?.toLocaleString("vi-VN") || ""}</td>
            <td class="text-end">${item.exportAmount?.toLocaleString("vi-VN") || ""}</td>
          </tr>
        `
          )
          .join("")
      : `<tr><td colspan="10" class="text-center text-muted">Không có dữ liệu</td></tr>`;

    // Tính ngày hiện tại
    const createdAt = new Date();
    const day = createdAt.getDate();
    const month = createdAt.getMonth() + 1;
    const year = createdAt.getFullYear();

    // HTML in ra
    const htmlContent = `
    <html>
      <head>
        <title>Báo cáo xuất nhập kho ${report.reportNo}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; font-size: 14px; color: #000; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px; }
          .header .info p { margin: 0; line-height: 1.4; }
          .title { text-align: center; margin-bottom: 4px; }
          .title h5 { font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
          .title p { margin: 2px 0; padding: 0; }
          .table { border: 1px solid #000 !important; }
          .table th, .table td { border: 1px solid #000 !important; vertical-align: middle !important; padding: 4px !important; }
          .table thead th { background-color: #f8f9fa !important; }
          .footer {
            margin-top: 40px;
            width: 300px;        
            margin-left: auto;       
            text-align: center;
            font-style: italic;
          }

          .footer .date {
            margin-bottom: 10px;
          }

          .signature {
            text-align: center;
          }

          .signature strong {
            font-weight: bold;
          }

          .signature p {
            margin: 0;
            line-height: 1.4;
          }
          .logo { width: 120px; height: auto; }
        </style>
      </head>
      <body>
        <div class="container-fluid">
          <!-- Header -->
          <div class="header">
            <div class="info">
              <p><strong>Đơn vị:</strong> ${report.storeAddress}</p>
              <p><strong>Bộ phận:</strong> ${report.roleName}</p>
            </div>
            <img src="${logoFull}" alt="Logo" class="logo" />
          </div>

          <!-- Title -->
          <div class="title">
            <h5>BÁO CÁO NHẬP - XUẤT KHO</h5>
            <p>Số: <strong>${report.reportNo}</strong></p>
            <p><em>Kỳ báo cáo: Từ ngày ${formatDate(report.from)} đến ngày ${formatDate(report.to)}</em></p>
          </div>

          <!-- Table -->
          <table class="table table-bordered text-center align-middle mt-3">
            <thead>
              <tr>
                <th rowspan="2" style="width:50px">STT</th>
                <th rowspan="2" style="width:320px">
                  Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa
                </th>
                <th rowspan="2">Mã số</th>
                <th rowspan="2">ĐVT</th>
                <th colspan="3">Nhập trong kỳ</th>
                <th colspan="3">Xuất trong kỳ</th>
              </tr>
              <tr>
                <th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th>
                <th>Số lượng</th><th>Đơn giá</th><th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>

          <!-- Footer -->
            <div class="footer">
              <p class="date">Ngày ${day} tháng ${month} năm ${year}</p>
              <div class="signature">
                <p><strong>Người lập</strong></p>
                <p><em><i>(Ký, họ tên)</i></em></p>
                <p style="margin-top:50px;font-weight:bold;">${report.createdBy}</p>
              </div>
            </div>

        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 800);
          };
        </script>
      </body>

    </html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };


  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="container mt-4 mb-5" style={{ maxWidth: "1200px" }}>
      {loadingRole ? (
        <div className="text-center text-muted">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Đang kiểm tra quyền truy cập...</p>
        </div>
      ) : !["Quản lý hệ thống", "Quản lý cửa hàng", "Admin"].includes(userRole) ? (
        <div className="alert alert-danger text-center">
          Bạn không có quyền truy cập chức năng này.
        </div>
      ) : (
        <>
          <h3 className=" mb-4 text-center">Báo cáo xuất nhập kho</h3>

          {/* --- Bộ lọc thời gian --- */}
          <div className="card p-3 shadow-sm mb-4">
            <div className="row g-3 align-items-end flex-wrap">
              {["Quản lý hệ thống", "Admin"].includes(userRole) && (
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedStoreId}
                    onChange={(e) => {
                      setSelectedStoreId(e.target.value);
                      setInputsChanged(true);
                    }}
                  >
                    <option value="all">-- Tất cả cửa hàng --</option>
                    {stores.map((store) => (
                      <option key={store.PK_idStore} value={store.PK_idStore}>
                        {store.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {/* Từ ngày */}
              <div className="col-md-3 d-flex align-items-center gap-2">
                <label className="form-label fw-semibold mb-0" style={{ whiteSpace: "nowrap" }}>
                  Từ ngày
                </label>
                <input
                  type="date"
                  className="form-control flex-grow-1"
                  value={from}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    setFrom(newFrom);
                    setInputsChanged(true); // đánh dấu đã thay đổi input
                    // reset to nếu to < from
                    if (to && newFrom > to) {
                      setTo("");
                    }
                  }}
                />
              </div>

              {/* Đến ngày */}
              <div className="col-md-3 d-flex align-items-center gap-2">
                <label className="form-label fw-semibold mb-0" style={{ whiteSpace: "nowrap" }}>
                  Đến ngày
                </label>
                <input
                  type="date"
                  className="form-control flex-grow-1"
                  value={to}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setInputsChanged(true);
                  }}
                  disabled={!from} // disable nếu chưa chọn từ ngày
                  min={from || undefined} // không chọn trước ngày bắt đầu
                />
              </div>

              {/* Nút */}
              <div className="col-md-auto d-flex flex-wrap gap-2">
              <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    await fetchSession();
                    await fetchReport();
                    setInputsChanged(false); // reset flag sau khi tạo báo cáo
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-file-earmark-bar-graph me-2"></i>
                  {loading ? "Đang tạo..." : "Tạo báo cáo"}
                </button>

                {report && !loading && !inputsChanged && (
                  <>
                    <button className="btn btn-success" onClick={handlePrintReport}>
                      <i className="bi bi-printer me-2"></i>
                      Xuất báo cáo
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setFrom("");
                        setTo("");
                        setReport(null);
                        window.Toast?.fire({
                          icon: "info",
                          title: "Đã hủy và xóa dữ liệu báo cáo.",
                        });
                      }}
                    >
                      {/* <i className="bi bi-x-circle me-2"></i>  */}
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* --- Hiển thị kết quả --- */}
          {loading ? (
            <p className="text-center text-muted my-5">Đang tải dữ liệu...</p>
          ) : report ? (
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                {/* --- Thông tin chung --- */}
                <div className="mb-3">
                  <p className="mb-1">
                    <strong>Địa chỉ cửa hàng:</strong> {report.storeAddress}
                  </p>
                  <p className="mb-1">
                    <strong>Số phiếu báo cáo:</strong> {report.reportNo}
                  </p>
                  <p className="mb-1">
                    <strong>Thời gian:</strong> {formatDate(report.from)} - {formatDate(report.to)}
                  </p>
                  <p className="mb-1">
                    <strong>Người lập:</strong> {report.createdBy}
                  </p>
                </div>

                {/* --- Bảng báo cáo --- */}
                <div className="table-responsive">
                  <table className="table table-bordered table-striped align-middle text-center mb-0">
                    <thead className="table-light align-middle">
                      <tr>
                        <th rowSpan="2" className="align-middle">STT</th>
                        <th rowSpan="2" className="align-middle">Mã PT</th>
                        <th rowSpan="2" className="align-middle">Tên phụ tùng</th>
                        <th rowSpan="2" className="align-middle">ĐVT</th>
                        <th colSpan="3" className="align-middle">Nhập trong kỳ</th>
                        <th colSpan="3" className="align-middle">Xuất trong kỳ</th>
                      </tr>
                      <tr>
                        <th className="align-middle">Số lượng</th>
                        <th className="align-middle">Đơn giá</th>
                        <th className="align-middle">Thành tiền</th>
                        <th className="align-middle">Số lượng</th>
                        <th className="align-middle">Đơn giá</th>
                        <th className="align-middle">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data?.length > 0 ? (
                        report.data.map((item, idx) => (
                          <tr key={item.sparePartId}>
                            <td>{idx + 1}</td>
                            <td>{item.sparePartId}</td>
                            <td className="text-start">{item.sparePartName}</td>
                            <td>{item.unit}</td>

                            {/* Nhập trong kỳ */}
                            <td>{item.importQty || 0}</td>
                            <td className="text-end">
                              {item.importPrice?.toLocaleString("vi-VN")}
                            </td>
                            <td className="text-end">
                              {item.importAmount?.toLocaleString("vi-VN")}
                            </td>

                            {/* Xuất trong kỳ */}
                            <td>{item.exportQty || 0}</td>
                            <td className="text-end">
                              {item.exportPrice?.toLocaleString("vi-VN")}
                            </td>
                            <td className="text-end">
                              {item.exportAmount?.toLocaleString("vi-VN")}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-muted text-center">
                            Không có dữ liệu trong khoảng thời gian này
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-secondary text-center">
              Hãy chọn khoảng thời gian và nhấn <strong>Tạo báo cáo</strong>.
            </div>
          )}
        </>
      )}

      


      
    </div>
  );
}
