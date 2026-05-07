import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";

import logoFull from "../images/logo-full.png";
import logoMini from "../images/logo-mini.png";
import QRCode from "qrcode";

export function useRepairHistory() {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // --- Các state cho filter ---
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [costRange, setCostRange] = useState("");

  // --- Phân trang ---
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
  });

  // --- Debounce ---
  const debouncedSearch = useDebounce(search, 500);
  const debouncedDateFrom = useDebounce(dateFrom, 500);
  const debouncedDateTo = useDebounce(dateTo, 500);
  const debouncedCostRange = useDebounce(costRange, 500);

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");


  //qr
  const BANK_NAME = "MB";               
  const ACCOUNT_NUMBER = "0386866715";     
  const ACCOUNT_NAME = "DUONG THI THUONG"; 
  const BRANCH_NAME = "Chi nhánh Quảng Yên";
  
  const handleShowQRDetail = () => {
    const amount = selectedInvoice.totalAmount || 0;
    const invoiceId = selectedInvoice.PK_idInvoice || "unknown";
    const qr = `https://img.vietqr.io/image/${BANK_NAME}-${ACCOUNT_NUMBER}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(
      `Thanh toan hoa don ${invoiceId}`
    )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
    setQrUrl(qr);
    setShowQRModal(true);
  };

  // --- Hàm load danh sách hóa đơn ---
  const fetchInvoices = async (filters = {}) => {
    setLoading(true);
    try {
      // --- Kiểm tra user session ---
      const resUser = await fetch(
        "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session",
        { credentials: "include" }
      );
      const dataUser = await resUser.json();
      if (dataUser.status !== "success" || !dataUser.user) {
        setInvoices([]);
        setLoading(false);
        return;
      }
      setUser(dataUser.user);

      // --- Xây query ---
      const query = new URLSearchParams();
      query.append("page", page);

      if (filters.search) query.append("search", filters.search);

      // ✅ Lọc theo ngày
      if (filters.date_from) {
        query.append("date_from", filters.date_from);
      }
      if (filters.date_to) {
        query.append("date_to", filters.date_to);
      }

      if (filters.cost_range) query.append("cost_range", filters.cost_range);

      // --- Gọi API ---
      const resInvoices = await fetch(
        `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/invoices/user?${query.toString()}`,
        { credentials: "include" }
      );
      const dataInvoices = await resInvoices.json();

      // --- Xử lý kết quả ---
      if (dataInvoices.status === "success" && dataInvoices.data) {
        setInvoices(dataInvoices.data.data || []);
        setPagination(
          dataInvoices.data.pagination || { current_page: 1, total_pages: 1 }
        );
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách hóa đơn:", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };


  // --- Hàm load chi tiết hóa đơn ---
  const fetchInvoiceDetail = async (id) => {
  setLoadingDetail(true);
  try {
    const res = await fetch(
      `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/invoices/user/${id}`,
      { credentials: "include" }
    );
    const data = await res.json();

    if (data.status === "success") {
      const invoice = data.data;

      // Tạo mảng phẳng details (dịch vụ + phụ tùng)
      const details = [];
      invoice.services?.forEach((service) => {
        if (service.spareParts?.length > 0) {
          service.spareParts.forEach((p) => {
            details.push({
              PK_id: p.PK_id ?? `${service.PK_id}_${p.FK_idSparePart}`,
              serviceName: service.serviceName,
              laborCost: service.laborCost,
              FK_idSparePart: p.FK_idSparePart,
              sparePartName: p.sparePartName,
              unit: p.unit,
              quantity: p.quantity,
              salePrice: p.salePrice,
            });
          });
        } else {
          // Nếu dịch vụ không có phụ tùng
          details.push({
            PK_id: service.PK_id,
            serviceName: service.serviceName,
            laborCost: service.laborCost,
            FK_idSparePart: "",
            sparePartName: "",
            unit: "",
            quantity: "",
            salePrice: "",
          });
        }
      });

      // Cập nhật state selectedInvoice
      setSelectedInvoice({
        ...invoice,
        details,
      });
    } else {
      alert(data.message || "Không thể tải chi tiết hóa đơn");
    }
  } catch (err) {
    console.error("Lỗi khi tải chi tiết hóa đơn:", err);
  } finally {
    setLoadingDetail(false);
  }
};


  const closeModal = () => setSelectedInvoice(null);

  // --- Chuyển số và chữ ---
  const toNumber = (v) => Number(v) || 0;
  const numberToVietnamese = (amount) => {
    const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    amount = Math.floor(Math.abs(Number(amount)) || 0);
    if (amount === 0) return "Không đồng chẵn.";

    const readThree = (num, isMostSignificantGroup) => {
      const hundred = Math.floor(num / 100);
      const ten = Math.floor((num % 100) / 10);
      const unit = num % 10;
      let parts = [];

      if (hundred > 0) {
        parts.push(digits[hundred] + " trăm");
      } else if (!isMostSignificantGroup && (ten > 0 || unit > 0)) {
        parts.push("không trăm");
      }

      if (ten === 0) {
        if (unit > 0) {
          parts.push((hundred > 0 || !isMostSignificantGroup) ? "linh " + digits[unit] : digits[unit]);
        }
      } else if (ten === 1) {
        let sub = "mười";
        if (unit === 5) sub += " lăm";
        else if (unit !== 0) sub += " " + digits[unit];
        parts.push(sub);
      } else {
        let sub = digits[ten] + " mươi";
        if (unit === 1) sub += " mốt";
        else if (unit === 4) sub += " tư";
        else if (unit === 5) sub += " lăm";
        else if (unit > 0) sub += " " + digits[unit];
        parts.push(sub);
      }

      return parts.join(" ").trim();
    };

    const groups = [];
    let n = amount;
    while (n > 0) {
      groups.push(n % 1000);
      n = Math.floor(n / 1000);
    }

    let textParts = [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const grp = groups[i];
      const isMostSignificantGroup = i === groups.length - 1;
      if (grp === 0 && !isMostSignificantGroup) continue;
      const chunkText = readThree(grp, isMostSignificantGroup);
      const unit = units[i] ? " " + units[i] : "";
      if (chunkText) textParts.push((chunkText + unit).trim());
    }

    let final = textParts.join(" ").replace(/\s+/g, " ").trim();
    final = final.charAt(0).toUpperCase() + final.slice(1);
    return final + " đồng.";
  };

  const handlePrintInvoice = () => {
    if (!selectedInvoice) return;

    //  Mở TAB mới thay vì cửa sổ nhỏ
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    //  Gom nhóm các dòng theo serviceName
    const grouped = [];
    if (selectedInvoice.details?.length > 0) {
      selectedInvoice.details.forEach((item) => {
        let group = grouped.find((g) => g.serviceName === item.serviceName);
        if (!group) {
          group = {
            serviceName: item.serviceName,
            laborCost: item.laborCost,
            parts: [],
          };
          grouped.push(group);
        }
        group.parts.push(item);
      });
    }

    // Sinh HTML chi tiết bảng dịch vụ & phụ tùng
    const tableRows = grouped.length
      ? grouped
          .map((g, idx) =>
            g.parts
              .map(
                (p, i) => `
                <tr>
                  ${
                    i === 0
                      ? `
                        <td class="text-center align-middle" rowspan="${g.parts.length}">${idx + 1}</td>
                        <td class="align-middle" rowspan="${g.parts.length}">${g.serviceName || "-"}</td>
                        <td class="text-end align-middle" rowspan="${g.parts.length}">${toNumber(g.laborCost).toLocaleString("vi-VN")}</td>
                      `
                      : ""
                  }
                  <td class="text-center">${p.FK_idSparePart || "-"}</td>
                  <td>${p.sparePartName || "-"}</td>
                  <td class="text-center">${p.unit || "-"}</td>
                  <td class="text-center">${p.quantity || "-"}</td>
                  <td class="text-end">${p.salePrice ? toNumber(p.salePrice).toLocaleString("vi-VN") : "-"}</td>
                  <td class="text-end">${p.salePrice && p.quantity ? (toNumber(p.salePrice) * toNumber(p.quantity)).toLocaleString("vi-VN") : "-"}</td>
                </tr>
              `
              )
              .join("")
          )
          .join("")
      : `<tr><td colspan="9" class="text-center text-muted">Không có dữ liệu</td></tr>`;

    // Tính tổng tiền công và phụ tùng
    const totalLabor = grouped.reduce((sum, g) => sum + toNumber(g.laborCost || 0), 0);
    const totalParts = grouped.reduce(
      (sum, g) =>
        sum + g.parts.reduce((ps, p) => ps + toNumber(p.quantity) * toNumber(p.salePrice || 0), 0),
      0
    );

    //Tạo link QR chuẩn VietQR (ảnh PNG)
    const qrUrl = `https://img.vietqr.io/image/${BANK_NAME}-${ACCOUNT_NUMBER}-qr_only.png?amount=${
      selectedInvoice.totalAmount
    }&addInfo=${encodeURIComponent("Thanh toan hoa don " + selectedInvoice.PK_idInvoice)}&accountName=${encodeURIComponent(
      ACCOUNT_NAME
    )}`;

    //  HTML in ra
    const htmlContent = `
    <html>
      <head>
        <title>Hóa đơn ${selectedInvoice.PK_idInvoice}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
        <style>
          .invoice-print { font-family: "Times New Roman", serif; font-size: 12px; }
          .logo-left { width: 120px; }
          .logo-right { width: 50px; }
          .store-info { font-size: 13px; line-height: 1.3; margin-top: 10px; }
          .table th, .table td { vertical-align: middle !important; }
          .table-bordered { border: 1px solid #000 !important; }
          .table-bordered th, .table-bordered td { border: 1px solid #000 !important; }
          .table thead th { background-color: #f8f9fa !important; }
          .signature-table th { font-weight: bold; font-size: 13px; border: 1px solid #000 !important; }
          .signature-table td { border: 1px solid #000 !important; height: 60px; }
          .signature-table small { font-weight: normal; }
        </style>
      </head>
      <body>
        <div class="invoice-print p-4">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <img src="${logoFull}" alt="Logo" class="logo-left" />
              <div class="store-info">
                <div><strong>Địa chỉ:</strong> ${selectedInvoice.store_address || ""}</div>
                <div><strong>Điện thoại:</strong> ${selectedInvoice.store_phone || ""}</div>
              </div>
            </div>
            <img src="${logoMini}" alt="Mini Logo" class="logo-right" />
          </div>

          <h5 class="text-center fw-bold mb-1">HÓA ĐƠN BÁN HÀNG</h5>
          <div class="text-center mb-3 fw-bold">
            Số phiếu: ${selectedInvoice.PK_idInvoice}
          </div>

          <table class="table table-bordered table-sm mb-3" style="font-size: 12px;">
            <tbody>
              <tr>
                <td><strong>Giờ vào:</strong> ${new Date(selectedInvoice.checkInTime).toLocaleString("vi-VN")}</td>
                <td><strong>Giờ ra:</strong> ${new Date(selectedInvoice.checkOutTime).toLocaleString("vi-VN")}</td>
              </tr>
              <tr>
                <td style="width:60%"><strong>Biển số:</strong> ${selectedInvoice.vehicle_license} &nbsp;&nbsp; <strong>Số KM:</strong> ${selectedInvoice.kmNumber || "-"}</td>
                <td style="width:40%"><strong>Loại xe:</strong> ${selectedInvoice.vehicle_type}</td>
              </tr>
              <tr>
                <td><strong>Khách hàng:</strong> ${selectedInvoice.customerName}</td>
                <td><strong>Điện thoại:</strong> ${selectedInvoice.phone || "-"}</td>
              </tr>
            </tbody>
          </table>

          <table class="table table-sm mb-0" style="border-left:1px solid #000; border-right:1px solid #000; border-top:1px solid #000; border-collapse: collapse; font-size: 12px;">
            <tbody>
              <tr>
                <td style="padding:4px; border-bottom:1px solid #000;"><strong>KTV:</strong> ${selectedInvoice.technician_name || "—"}</td>
              </tr>
              <tr>
                <td style="padding:4px; border-bottom:none;"><strong>Yêu cầu khách hàng:</strong> ${selectedInvoice.customerRequest || "—"}</td>
              </tr>
            </tbody>
          </table>
          <!-- Bảng dịch vụ chính -->
          <table class="table table-bordered table-sm mt-0" style="border-collapse: collapse; font-size: 12px;">
            <thead class="table-light text-center align-middle">
              <tr>
                <th rowspan="2">STT</th>
                <th rowspan="2">Nội dung</th>
                <th rowspan="2">Tiền công<br/>(VNĐ)</th>
                <th colspan="6">Phụ tùng</th>
              </tr>
              <tr>
                <th>Mã PT</th><th>Tên</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              ${
                grouped.length
                  ? `
                  <tr class="fw-bold">
                    <td colspan="2" class="text-end">Tổng cộng:</td>
                    <td class="text-end">${totalLabor.toLocaleString("vi-VN")}</td>
                    <td colspan="5"></td>
                    <td class="text-end">${totalParts.toLocaleString("vi-VN")}</td>
                  </tr>
                  <tr>
                    <td colspan="2"></td>
                    <td class="text-center"><strong>(A)</strong></td>
                    <td colspan="5"></td>
                    <td class="text-center"><strong>(B)</strong></td>
                  </tr>
                  `
                  : ""
              }
            </tbody>
          </table>
          <div class="d-flex align-items-center mt-3">
            <div class="me-3">
              <img src="${qrUrl}" alt="QR Code" class="img-fluid" style="height: 70px; width: 70px; object-fit: contain;">
            </div>

            <div class="d-flex flex-column justify-content-between">
              <div><strong>Tổng chi phí sửa chữa (A+B):</strong> ${selectedInvoice.totalAmount?.toLocaleString("vi-VN")} VNĐ</div>
              <div><strong>Tổng tiền bằng chữ:</strong> ${selectedInvoice.totalAmount ? numberToVietnamese(selectedInvoice.totalAmount) : "-"}</div>
              <div><strong>Tồn tại sau sửa chữa: </strong>${selectedInvoice.postRepairStatus}</div>
            </div>
          </div>

          <table class="table table-bordered mt-4 text-center signature-table" style="table-layout:fixed;width:100%;font-size:12px;">
            <thead>
              <tr>
                <th>KHÁCH HÀNG<br><small>(Ký, họ tên)</small></th>
                <th>KỸ THUẬT VIÊN<br><small>(Ký, họ tên)</small></th>
                <th>KẾ TOÁN<br><small>(Ký, họ tên)</small></th>
              </tr>
            </thead>
            <tbody>
              <tr><td></td><td></td><td></td></tr>
            </tbody>
          </table>

          <div class="text-center mt-2 fst-italic" style="font-size: 10px;">
            Hotline: 1900.277.247 - 0934.277.247 | Fanpage: Sửa xe máy 247
          </div>
          <div class="text-center fst-italic fw-bold" style="font-size: 10px;">
            Phiếu có giá trị bảo hành: Phụ tùng, BĐSC trong thời gian 06 tháng theo ngày ghi trên phiếu.
          </div>

        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // --- Gọi lần đầu ---
  useEffect(() => {
    fetchInvoices();
  }, []);

  // --- Gọi lại khi filter/page thay đổi ---
  useEffect(() => {
    fetchInvoices({
      search: debouncedSearch,
      date_from: debouncedDateFrom,
      date_to: debouncedDateTo,
      cost_range: debouncedCostRange,
    });
  }, [debouncedSearch, debouncedDateFrom, debouncedDateTo, debouncedCostRange, page]);
    
  return {
    user, setUser, invoices, setInvoices, search, setSearch, 
    dateFrom, setDateFrom, dateTo, setDateTo, costRange, setCostRange,
    page, setPage, pagination, setPagination, fetchInvoices, 
    fetchInvoiceDetail, closeModal, handlePrintInvoice,
    selectedInvoice, setSelectedInvoice, loading, setLoading,
    loadingDetail, setLoadingDetail, toNumber, numberToVietnamese,
    showQRModal, setShowQRModal, qrUrl, handleShowQRDetail,

  };
}