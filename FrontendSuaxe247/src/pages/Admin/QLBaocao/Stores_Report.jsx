import { useState, useEffect } from "react";
import logoFull from "../../../assets/images/logo-full.png";

export default function Store_Report() {
  const BASE_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api";
  const REPORT_API_URL = `${BASE_URL}/store_report`;
  const SESSION_API_URL = `${BASE_URL}/user/session`;
  const STORE_API_URL = `${BASE_URL}/store`;

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputsChanged, setInputsChanged] = useState(false);
  const [userRole, setUserRole] = useState(null)
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
      setLoadingRole(false); 
    }
  };

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


  // ===== Gọi API báo cáo hoạt động cửa hàng =====
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
      const params = new URLSearchParams();
      params.append("from", from);
      params.append("to", to);

      // ✅ gửi storeId nếu có quyền
      if (["Quản lý hệ thống", "Admin"].includes(userRole)) {
        if (selectedStoreId !== "all") {
          params.append("storeId", selectedStoreId);
        }
      }

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
    } finally {
      setLoading(false);
    }
  };

  // ===== Định dạng ngày yyyy-mm-dd → dd/mm/yyyy =====
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handlePrintReport = () => {
    if (!report) {
      window.Toast.fire({
        icon: "warning",
        title: "Chưa có dữ liệu để in!",
      });
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // ===== Sinh bảng dữ liệu =====
    const serviceRows = report.serviceDetails?.length
      ? report.serviceDetails
          .map(
            (srv, idx) => `
            <tr>
              <td>4.${idx + 1}</td>
              <td class="text-start">- ${srv.serviceName}</td>
              <td>${srv.serviceCount}</td>
              <td>Lần</td>
            </tr>`
          )
          .join("")
      : `<tr><td colspan="4" class="text-center text-muted">Không có dữ liệu dịch vụ</td></tr>`;

    const tableRows = `
      <tr class="fw-bold">
        <td>1</td>
        <td class="text-start">Tổng doanh thu</td>
        <td>${report.totalRevenue?.toLocaleString("vi-VN")}</td>
        <td>VNĐ</td>
      </tr>
      <tr class="">
        <td>1.1</td>
        <td class="text-start">- Tổng tiền công</td>
        <td>${report.totalLaborRevenue?.toLocaleString("vi-VN")}</td>
        <td>VNĐ</td>
      </tr>
      <tr class="">
        <td>1.2</td>
        <td class="text-start">- Tổng tiền phụ tùng</td>
        <td>${report.totalPartRevenue?.toLocaleString("vi-VN")}</td>
        <td>VNĐ</td>
      </tr>
      <tr class="fw-bold">
        <td>2</td>
        <td class="text-start">Tổng số lượt khách</td>
        <td>${report.totalCustomerVisits}</td>
        <td>Lượt</td>
      </tr>
      <tr>
        <td>2.1</td>
        <td class="text-start">- Số lượng khách cũ</td>
        <td>${report.customerOldCount}</td>
        <td>Khách</td>
      </tr>
      <tr>
        <td>2.2</td>
        <td class="text-start">- Số lượng khách mới</td>
        <td>${report.customerNewCount}</td>
        <td>Khách</td>
      </tr>
      <tr class="fw-bold">
        <td>3</td>
        <td class="text-start">Tổng số lượng đặt lịch</td>
        <td>${report.totalAppointment}</td>
        <td>Lịch</td>
      </tr>
      <tr>
        <td>3.1</td>
        <td class="text-start">- Số lượng hoàn thành</td>
        <td>${report.completedAppointment}</td>
        <td>Lịch</td>
      </tr>
      <tr>
        <td>3.2</td>
        <td class="text-start">- Tỷ lệ hoàn thành</td>
        <td>${report.completionRate}%</td>
        <td>%</td>
      </tr>
      <tr class="fw-bold">
        <td>4</td>
        <td class="text-start">Tổng số lượng dịch vụ đã sử dụng</td>
        <td>${report.totalServiceUsed}</td>
        <td>Dịch vụ</td>
      </tr>
      ${serviceRows}
    `;

    // ===== Ngày in =====
    const createdAt = new Date();
    const day = createdAt.getDate();
    const month = createdAt.getMonth() + 1;
    const year = createdAt.getFullYear();

    // ===== HTML xuất in =====
    const htmlContent = `
    <html>
      <head>
        <title>Báo cáo hoạt động cửa hàng ${report.reportNo}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Times New Roman', serif; font-size: 14px; color: #000; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
          .header .info p { margin: 0; line-height: 1.4; }
          .logo { width: 100px; height: auto; }
          .title { text-align: center; margin-bottom: 6px; }
          .title h5 { font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
          .title p { margin: 2px 0; padding: 0; }
          table { width: 100%; border-collapse: collapse; }
          .table { border: 1px solid #000 !important; }
          .table th, .table td { border: 1px solid #000 !important; padding: 5px !important; vertical-align: middle; }
          .table thead th { background-color: #f8f9fa !important; }
          .fw-bold { font-weight: bold !important; }
          .footer {
            margin-top: 40px;
            width: 300px;
            margin-left: auto;
            text-align: center;
          }
          .footer .date { margin-bottom: 10px; }
          .signature { text-align: center; }
          .signature p { margin: 0; line-height: 1.4; }
          .signature strong { font-weight: bold; }
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
            <h5>BÁO CÁO HOẠT ĐỘNG CỬA HÀNG</h5>
            <p>Số: <strong>${report.reportNo}</strong></p>
            <p><em>Kỳ báo cáo: Từ ngày ${formatDate(report.from)} đến ngày ${formatDate(report.to)}</em></p>
          </div>

          <!-- Table -->
          <table class="table table-bordered align-middle text-center mt-3">
            <thead class="table-light">
              <tr>
                <th style="width:60px">STT</th>
                <th style="width:60%">Nội dung</th>
                <th>Giá trị</th>
                <th>Đơn vị tính</th>
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
          <h3 className="text-center mb-4">Báo cáo hoạt động cửa hàng</h3>

          {/* --- Bộ lọc thời gian --- */}
          <div className="card p-3 shadow-sm mb-4">
            <div className="row g-3 align-items-end flex-wrap">
              {["Quản lý hệ thống", "Admin"].includes(userRole) && (
                <div className="col-md-2">
                  <select
                    className="form-select"
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                  >
                    <option value="all">-- Chọn cửa hàng --</option>
                    {stores.map((store) => (
                      <option key={store.PK_idStore} value={store.PK_idStore}>
                        {store.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* --- Từ ngày --- */}
              <div className="col-md-3 d-flex align-items-center gap-2">
                <label
                  className="form-label fw-semibold mb-0"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Từ ngày
                </label>
                <input
                  type="date"
                  className="form-control flex-grow-1"
                  value={from}
                  onChange={(e) => {
                    const newFrom = e.target.value;
                    setFrom(newFrom);
                    setInputsChanged(true);
                    if (to && newFrom > to) setTo("");
                  }}
                />
              </div>

              {/* --- Đến ngày --- */}
              <div className="col-md-3 d-flex align-items-center gap-2">
                <label
                  className="form-label fw-semibold mb-0"
                  style={{ whiteSpace: "nowrap" }}
                >
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
                  disabled={!from}
                  min={from || undefined}
                />
              </div>

              {/* --- Các nút thao tác --- */}
              <div className="col-md-auto d-flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    await fetchSession();
                    await fetchReport();
                    setInputsChanged(false);
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-file-earmark-bar-graph me-2"></i>
                  {loading ? "Đang tạo..." : "Tạo báo cáo"}
                </button>

                {report && !loading && !inputsChanged && (
                  <>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handlePrintReport}
                    >
                      <i className="bi bi-printer me-2"></i>
                      Xuất báo cáo
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setReport(null);
                        setFrom("");
                        setTo("");
                        window.Toast?.fire({
                          icon: "info",
                          title: "Đã hủy và xóa dữ liệu báo cáo.",
                        });
                      }}
                    >
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
                {/* Thông tin chung */}
                <div className="mb-3">
                  <p className="mb-1"><strong>Địa chỉ cửa hàng:</strong> {report.storeAddress}</p>
                  <p className="mb-1"><strong>Số phiếu báo cáo:</strong> {report.reportNo}</p>
                  <p className="mb-1"><strong>Thời gian:</strong> {formatDate(report.from)} - {formatDate(report.to)}</p>
                  <p className="mb-1"><strong>Người lập:</strong> {report.createdBy}</p>
                </div>

                {/* --- Bảng báo cáo --- */}
                <div className="table-responsive">
                  <table className="table table-bordered align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "60px" }}>STT</th>
                        <th style={{ width: "60%" }}>Nội dung</th>
                        <th>Giá trị</th>
                        <th>Đơn vị tính</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="fw-bold">
                        <td>1</td>
                        <td className="text-start">Tổng doanh thu</td>
                        <td>{report.totalRevenue?.toLocaleString("vi-VN")}</td>
                        <td>VNĐ</td>
                      </tr>

                      <tr className="">
                        <td>1.1</td>
                        <td className="text-start">- Tổng tiền công</td>
                        <td>{report.totalLaborRevenue?.toLocaleString("vi-VN")}</td>
                        <td>VNĐ</td>
                      </tr>

                      <tr className="">
                        <td>1.2</td>
                        <td className="text-start">- Tổng tiền phụ tùng</td>
                        <td>{report.totalPartRevenue?.toLocaleString("vi-VN")}</td>
                        <td>VNĐ</td>
                      </tr>

                      <tr className="fw-bold">
                        <td>2</td>
                        <td className="text-start">Tổng số lượt khách</td>
                        <td>{report.totalCustomerVisits}</td>
                        <td>Lượt</td>
                      </tr>

                      <tr>
                        <td>2.1</td>
                        <td className="text-start">- Số lượng khách cũ</td>
                        <td>{report.customerOldCount}</td>
                        <td>Khách</td>
                      </tr>

                      <tr>
                        <td>2.2</td>
                        <td className="text-start">- Số lượng khách mới</td>
                        <td>{report.customerNewCount}</td>
                        <td>Khách</td>
                      </tr>

                      <tr className="fw-bold">
                        <td>3</td>
                        <td className="text-start">Tổng số lượng lịch đặt</td>
                        <td>{report.totalAppointment}</td>
                        <td>Lịch</td>
                      </tr>

                      <tr>
                        <td>3.1</td>
                        <td className="text-start">- Số lượng hoàn thành</td>
                        <td>{report.completedAppointment}</td>
                        <td>Lịch</td>
                      </tr>

                      <tr>
                        <td>3.2</td>
                        <td className="text-start">- Tỷ lệ hoàn thành</td>
                        <td>{report.completionRate}%</td>
                        <td>%</td>
                      </tr>

                      <tr className="fw-bold">
                        <td>4</td>
                        <td className="text-start">Tổng số lượng dịch vụ đã sử dụng</td>
                        <td>{report.totalServiceUsed}</td>
                        <td>Dịch vụ</td>
                      </tr>


                      {/* Danh sách dịch vụ chi tiết */}
                      {report.serviceDetails?.length > 0 ? (
                        report.serviceDetails.map((srv, idx) => (
                          <tr key={idx}>
                            <td>{`4.${idx + 1}`}</td>
                            <td className="text-start">- {srv.serviceName}</td>
                            <td>{srv.serviceCount}</td>
                            <td>Lần</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-muted text-center">
                            Không có dữ liệu dịch vụ
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
