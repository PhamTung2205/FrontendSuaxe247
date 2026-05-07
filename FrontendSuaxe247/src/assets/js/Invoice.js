import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";

import logoFull from "../images/logo-full.png";
import logoMini from "../images/logo-mini.png";
import { sendStatusUpdateEmail } from '../../services/emailService.js';

import QRCode from "qrcode";

export function useInvoice() {
  const BASE_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api";
  const SESSION_API_URL = `${BASE_URL}/user/session`;
  const INVOICE_API_URL = `${BASE_URL}/invoice`;
  const STORE_API_URL = `${BASE_URL}/store`;
  const TECHNICIAN_API_URL = `${BASE_URL}/user/staff/technician`;
  const SERVICE_API_URL = `${BASE_URL}/service`;
  const CUSTOMER_API_URL = `${BASE_URL}/user/customer/by-phone`;
  const VEHICLE_API_URL = `${BASE_URL}/userVehicles`;
  const STORE_SPAREPARTS_API_URL = `${BASE_URL}/spare-part/by-store`;
  const APPOINTMENT_API_URL = `${BASE_URL}/appointments/confirmed`;

  // ==== State ====
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchName, setSearchName] = useState("");
  const [invoiceId, setInvoiceId] = useState("");

  const debouncedSearchName = useDebounce(searchName, 500);
  const debouncedInvoiceId = useDebounce(invoiceId, 500);

  const initialInvoice = {
  checkInTime: "",
  checkOutTime: "",
  phone: "",
  customerName: "",
  vehicle_license: "",
  vehicle_type: "",
  kmNumber: "",
  customerRequest: "",
  postRepairStatus: "",
  paymentMethod: "",
  FK_idCashier: null,
  FK_idStore: null,
  servicesList: [
    {
      serviceId: "",
      laborCost: 0,
      spareParts: [
        { sparePartId: "", code: "", unit: "", price: 0, quantity: 1 }
      ]
    }
  ]
};

  const [showAddModal, setShowAddModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState( initialInvoice);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  // ==== User session infor ====
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true); 
  const [userStoreId, setUserStoreId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userStoreAddress, setUserStoreAddress] = useState(null);

  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("all");
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);
  const [customerVehicles, setCustomerVehicles] = useState([]);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [storeSpareParts, setStoreSpareParts] = useState([]);
  const [errors, setErrors] = useState({});
  const [showErrors, setShowErrors] = useState(false);

  const [subtotal, setSubtotal] = useState(0);

  // 🔹 Mẫu mặc định
  const defaultSparePart = { sparePartId: "", code: "", unit: "", price: 0, quantity: 1 };
  const defaultService = {
    serviceId: "",
    laborCost: "",
    spareParts: [defaultSparePart],
  };

  // 🔹 State khởi tạo
  const [servicesList, setServicesList] = useState([defaultService]);
  const [sparePartsList, setSparePartsList] = useState([defaultSparePart]);


  //appointment
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState("");

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrUrl, setQrUrl] = useState("");
  const [qrInfo, setQrInfo] = useState({ vehicle: "", amount: 0 });


  //qr
  const BANK_NAME = "MB";               
  const ACCOUNT_NUMBER = "0386866715";     
  const ACCOUNT_NAME = "DUONG THI THUONG"; 
  const BRANCH_NAME = "Chi nhánh Quảng Yên";   

  const handleShowQR = () => {
    const vehicle =
        newInvoice.vehicle_license && newInvoice.vehicle_license.trim() !== ""
          ? `${newInvoice.vehicle_license} - thanh toan hoa don`
          : "thanh toan hoa don tam tinh";
    const amount = subtotal || 0;

    const qr = `https://img.vietqr.io/image/${BANK_NAME}-${ACCOUNT_NUMBER}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(
      `${vehicle}`
    )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    setQrUrl(qr);
    setQrInfo({ vehicle, amount }); // 👉 thêm dòng này
    setShowQRModal(true);
  };

  const handleShowQRDetail = () => {
    const amount = selectedInvoice.totalAmount || 0;
    const invoiceId = selectedInvoice.PK_idInvoice || "unknown";
    const qr = `https://img.vietqr.io/image/${BANK_NAME}-${ACCOUNT_NUMBER}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(
      `Thanh toan hoa don ${invoiceId}`
    )}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
    setQrUrl(qr);
    setShowQRModal(true);
  };


  const toNumber = (v) => Number(v) || 0;

  // 🔹 Hàm reset toàn bộ hóa đơn
  const resetInvoice = () => {
    setNewInvoice({
      ...initialInvoice,
      FK_idCashier: userId,
      FK_idStore: userStoreId,
    });
    setServicesList([defaultService]);
    setSparePartsList([defaultSparePart]);
    setErrors({});
    setShowErrors(false);
    
    // Thêm reset các phần liên quan đến lịch hẹn
    setSelectedAppointment(null);
    setCustomerVehicles([]);
  };

  // ==== Fetch session ====
  const fetchSession = async () => {
  try {
    const res = await fetch(SESSION_API_URL, { credentials: "include" });
    const result = await res.json();

    if (result.status === "success") {
      setUserRole(result.user.roleName);
      setUserStoreId(result.user.store);
      setUserStoreAddress(result.user.storeAddress);
      setUserId(result.user.user_id);

      // gán cashier và store vào hóa đơn mặc định
      setNewInvoice(prev => ({
        ...prev,
        FK_idCashier: result.user.user_id,
        FK_idStore: result.user.store
      }));

      fetchSparePartsByStore(result.user.store);
    } else {
      setUserRole(null);
    }
  } catch (err) {
    console.error("Lỗi khi lấy session:", err);
    setUserRole(null);
  }finally{
    setLoadingRole(false); 
  }
};

  // ==== Fetch stores ====
  const fetchStores = async () => {
    try {
      const res = await fetch(STORE_API_URL, { credentials: "include" });
      const result = await res.json();
      if (result.status === "success") {
        setStores(result.data);
      }
    } catch (err) {
      console.error("Lỗi fetchStores:", err);
    }
  };
  
  // === Fetch technicians ===
  const fetchTechnicians = async () => {
    try {
      const res = await fetch(TECHNICIAN_API_URL, { credentials: "include" });
      const result = await res.json();
      if (result.status === "success") setTechnicians(result.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try{
      const res = await fetch(SERVICE_API_URL, { credentials: "include" });
      const result = await res.json();
      if(result.status === "success") setServices(result.data);
    }catch(err){
      console.error(err);
    }
  };

  // ==== Lifecycle ====
  useEffect(() => {
    fetchSession();
    fetchStores();
    fetchTechnicians();
    fetchServices();
  }, []);

// ==== Fetch invoices ====
const fetchInvoices = async () => {
  if (!userRole) return;
  setLoading(true);
  setError(null);

  try {
    const params = new URLSearchParams();

    // Nếu có fromDate, luôn append
    if (fromDate) {
      params.append("dateFrom", fromDate);
    }
    // Nếu có toDate, append thêm (nếu không có thì BE sẽ hiểu là đến hiện tại)
    if (toDate) {
      params.append("dateTo", toDate);
    }

    if (debouncedSearchName) params.append("searchName", debouncedSearchName);
    if (debouncedInvoiceId) params.append("invoiceId", debouncedInvoiceId);
    params.append("page", page);

    // Filter theo quyền
    if (userRole === "Quản lý cửa hàng") {
      params.append("storeId", userStoreId);
    } else if (userRole === "Kỹ thuật viên") {
      params.append("technicianId", userId);
    } else if (["Quản lý hệ thống", "Admin"].includes(userRole)) {
      if (selectedStore && selectedStore !== "all") {
        params.append("storeId", selectedStore);
      }
    }

    const res = await fetch(`${INVOICE_API_URL}?${params.toString()}`, {
      credentials: "include",
    });
    const data = await res.json();

    if (data.status === "success") {
      setInvoices(data.data);
      setTotal(data.total);
    } else {
      setError({ message: data.message || "Lỗi không xác định" });
    }
  } catch (err) {
    setError({ message: err.message });
  } finally {
    setLoading(false);
  }
};


  // --- Gọi API khi debounce thay đổi ---
  useEffect(() => {
    fetchInvoices();
  }, [userRole, fromDate, toDate, debouncedSearchName, debouncedInvoiceId, page, selectedStore]);

  // ==== Fetch invoice detail ====
  const viewInvoice = async (id) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`${INVOICE_API_URL}/${id}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.status === "success") {
        const invoice = data.data;

        // Tạo mảng details phẳng để dễ render table
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
            // Dịch vụ không có phụ tùng
            details.push({
              PK_id: service.PK_id,
              serviceName: service.serviceName,
              laborCost: service.laborCost,
              FK_idSparePart: null,
              sparePartName: null,
              unit: null,
              quantity: null,
              salePrice: null,
            });
          }
        });

        setSelectedInvoice({
          ...invoice,
          details, // thêm mảng phẳng này để table render
        });
      } else {
        setError({ message: data.message });
      }
    } catch (err) {
      setError({ message: err.message });
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeModal = () => setSelectedInvoice(null);


  const fetchVehiclesByCustomer = async (customerId) => {
    if (!customerId) {
      setCustomerVehicles([]);
      return;
    }

    try {
      const res = await fetch(`${VEHICLE_API_URL}/${customerId}`, { credentials: "include" });
      const result = await res.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        setCustomerVehicles(result.data);
      } else {
        setCustomerVehicles([]);
      }
    } catch (err) {
      console.error("Lỗi khi fetch danh sách xe:", err);
      setCustomerVehicles([]);
    }
  };

  const fetchCustomerByPhone = async (phone) => {
    if (!phone || phone.length < 8) return;

    try {
      const res = await fetch(`${CUSTOMER_API_URL}/${phone}`, { credentials: "include" });
      const result = await res.json();

      if (result.status === "success") {
        const customer = result.data;
        setNewInvoice((prev) => ({
          ...prev,
          customerName: customer.fullName,
          customerId: customer.PK_idUser,
        }));

        fetchVehiclesByCustomer(customer.PK_idUser);
        setIsAddingVehicle(false); // mặc định về chọn xe
      } else {
        setNewInvoice((prev) => ({
          ...prev,
          customerName: "",
          customerId: null,
        }));
        setCustomerVehicles([]);
        setIsAddingVehicle(false);
      }
    } catch (err) {
      console.error("Lỗi khi fetch khách hàng:", err);
    }
  };

  // Debounce gọi API khi nhập số điện thoại
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCustomerByPhone(newInvoice.phone);
    }, 500); // 0.5s sau khi dừng gõ

    return () => clearTimeout(delayDebounce);
  }, [newInvoice.phone]);

  const fetchSparePartsByStore = async (storeId) => {
    if (!storeId) {
      setStoreSpareParts([]);
      return;
    }
    try {
      const res = await fetch(`${STORE_SPAREPARTS_API_URL}/${storeId}`, { credentials: "include" });
      const result = await res.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        setStoreSpareParts(result.data);
      } else {
        setStoreSpareParts([]);
      }
    } catch (err) {
      console.error("Lỗi khi fetch phụ tùng của cửa hàng:", err);
      setStoreSpareParts([]);
    }
  };

  const handleAddService = () => {
    setServicesList(prev => [
      ...prev,
      {
        serviceId: "",
        laborCost: "",
        spareParts: [
          { sparePartId: "", code: "", unit: "", price: 0, quantity: 1 },
        ],
      },
    ]);
  };

  const handleRemoveService = (index) => {
    if (servicesList.length === 1) return;
    setServicesList(prev => prev.filter((_, i) => i !== index));
  };

const handleServiceChange = (index, id) => {
  // Tìm dịch vụ theo id (kiểu chuỗi)
  const sv = services.find(s => s.PK_idService === id);

  setServicesList(prev => {
    const updated = [...prev];
    updated[index] = {
      ...updated[index],
      serviceId: id,
      serviceName: sv?.serviceName || "",
      // 🟢 Gán thêm tiền công dự kiến nếu có
      laborCost: sv?.estimatedPrice ?? "",
      errors: {
        ...updated[index].errors,
        serviceId: undefined, // xóa lỗi chọn dịch vụ
        laborCost: undefined, // xóa lỗi tiền công (nếu có)
      },
    };
    return updated;
  });
};


  const handleLaborCostChange = (index, value) => {
    setServicesList(prev => {
      const updated = [...prev];
      const service = { ...updated[index] };

      // Cập nhật giá trị
      service.laborCost = Number(value);

      // Nếu trước đó có lỗi laborCost, xóa nó khi người dùng nhập lại
      if (service.errors?.laborCost) {
        service.errors = { ...service.errors };
        delete service.errors.laborCost;
      }

      updated[index] = service;
      return updated;
    });
  };

  const handleAddSparePartRow = (serviceIndex) => {
    setServicesList(prev => {
      const updated = [...prev];
      const service = { ...updated[serviceIndex] };
      service.spareParts = [
        ...service.spareParts,
        { sparePartId: "", code: "", unit: "", price: 0, quantity: 1 },
      ];
      updated[serviceIndex] = service;
      return updated;
    });
  };

  const handleRemoveSparePartRow = (serviceIndex, partIndex) => {
    setServicesList(prev => {
      const updated = [...prev];
      const parts = updated[serviceIndex].spareParts;
      if (parts.length > 1) {
        updated[serviceIndex].spareParts = parts.filter((_, i) => i !== partIndex);
      }
      return updated;
    });
  };

  const handleSparePartChange = (serviceIndex, partIndex, id) => {
    setServicesList(prev => {
      const updated = [...prev];
      const sp = storeSpareParts.find(p => p.PK_idSparePart === id);
      if (!sp) return prev;

      const currentService = updated[serviceIndex];
      const duplicate = currentService.spareParts.some(
        (p, i) => p.sparePartId === id && i !== partIndex
      );
      if (duplicate) return prev; // ngăn chọn trùng

      currentService.spareParts[partIndex] = {
    ...currentService.spareParts[partIndex],
    sparePartId: id,
    PK_idSparePart: sp.PK_idSparePart,
    sparePartName: sp.sparePartName,
    unit: sp.unit,
    salePrice: sp.salePrice,
  };
      return updated;
    });
  };

  const handleQuantityChange = (serviceIndex, partIndex, qty) => {
    setServicesList(prev => {
      const updated = [...prev]; // clone mảng dịch vụ
      const service = { ...updated[serviceIndex] }; // clone dịch vụ
      const spareParts = [...service.spareParts]; // clone mảng phụ tùng
      spareParts[partIndex] = { ...spareParts[partIndex], quantity: Number(qty) }; // cập nhật quantity
      service.spareParts = spareParts; 
      updated[serviceIndex] = service;
      return updated;
    });
  };

  const validateInvoice = () => {
    const errs = {};

    // --- Kiểm tra thời gian ---
    if (!newInvoice.checkInTime)
      errs.checkInTime = "Vui lòng chọn thời gian vào";
    if (!newInvoice.checkOutTime)
      errs.checkOutTime = "Vui lòng chọn thời gian ra";

    // Nếu cả hai đều có thì kiểm tra logic thời gian
    if (newInvoice.checkInTime && newInvoice.checkOutTime) {
      const inTime = new Date(newInvoice.checkInTime);
      const outTime = new Date(newInvoice.checkOutTime);

      if (inTime && outTime && new Date(inTime) > new Date(outTime)) {
        errs.checkOutTime = "Thời gian ra phải lớn hơn hoặc bằng thời gian vào";
      }

    }

    // --- Khách hàng ---
    const phoneRegex = /^(0[35789])[0-9]{8}$/;
    if (!newInvoice.phone?.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    else if (!phoneRegex.test(newInvoice.phone))
      errs.phone = "Số điện thoại không hợp lệ (phải có 10 số)";

    if (!newInvoice.customerName?.trim())
      errs.customerName = "Vui lòng nhập tên khách hàng";

    // --- Xe ---
    if (
      !newInvoice.vehicle_license?.trim() ||
      !newInvoice.vehicle_type?.trim() ||
      !newInvoice.kmNumber
    )
      errs.vehicle_license = "Vui lòng nhập đầy đủ thông tin xe";
    else if (Number(newInvoice.kmNumber) < 0)
      errs.vehicle_license = "Số km phải lớn hơn 0";

    // --- Kỹ thuật viên ---
    if (!newInvoice.technicianId)
      errs.technicianId = "Vui lòng chọn kỹ thuật viên";

    // --- Yêu cầu khách hàng ---
    if (!newInvoice.customerRequest?.trim())
      errs.customerRequest = "Vui lòng nhập yêu cầu của khách hàng";

    // --- Validate dịch vụ và phụ tùng ---
    const newServices = servicesList.map((sv) => {
      const serviceErrors = {
        serviceId: "",
        laborCost: "",
        spareParts: [],
      };

      if (!sv.serviceId) serviceErrors.serviceId = "Vui lòng chọn dịch vụ";

      if (sv.laborCost === "" || sv.laborCost == null) {
        serviceErrors.laborCost = "Vui lòng nhập tiền công";
      } else if (Number(sv.laborCost) < 0) {
        serviceErrors.laborCost = "Tiền công không nhỏ hơn 0";
      }

      serviceErrors.spareParts = sv.spareParts.map((sp) => {
        const e = {};
        if (!sp.sparePartId) e.sparePartId = "Vui lòng chọn phụ tùng";
        if (Number(sp.quantity) <= 0) e.quantity = "Số lượng phải > 0";
        return e;
      });

      return {
        ...sv,
        errors: serviceErrors,
      };
    });

    setServicesList(newServices);
    setErrors(errs);
    setShowErrors(true);

    // Check tổng thể
    const hasServiceErrors = newServices.some(
      (sv) =>
        sv.errors.serviceId ||
        sv.errors.laborCost ||
        sv.errors.spareParts.some((sp) => Object.keys(sp).length > 0)
    );

    return Object.keys(errs).length === 0 && !hasServiceErrors;
  };


  const handleChange = (field, value) => {
    setNewInvoice(prev => {
      const updated = { ...prev, [field]: value };

      // Kiểm tra nhóm xe
      if (field === "vehicle_license" || field === "vehicle_type" || field === "kmNumber") {
        if (updated.vehicle_license?.trim() && updated.vehicle_type?.trim() && Number(updated.kmNumber) > 0) {
          setErrors(prev => ({ ...prev, vehicle_license: "" })); // Xóa lỗi chỉ khi cả 3 đủ
        }
      } else {
        // Xóa lỗi field bình thường
        setErrors(prev => ({ ...prev, [field]: "" }));
      }

      return updated;
    });
  };
  const togglePostRepairStatus = () => {
    setNewInvoice(prev => ({
      ...prev,
      postRepairStatus: prev.postRepairStatus ? null : "" // uncheck -> null, check -> ""
    }));
    setErrors(prev => ({ ...prev, postRepairStatus: "" })); // reset lỗi
  };

// --- Hàm tính tổng tiền tạm tính ---
  const calculateSubtotal = (services) => {
    let total = 0;

    services.forEach(service => {
      // Tiền công
      total += Number(service.laborCost) || 0;

      // Tiền phụ tùng
      service.spareParts.forEach(sp => {
        const price = Number(sp.salePrice) || 0;
        const qty = Number(sp.quantity) || 0;
        total += price * qty;
      });
    });

    setSubtotal(total);
  };
  useEffect(() => {
    calculateSubtotal(servicesList);
  }, [servicesList]);

  // ==== Add invoice ====
  const handleAddInvoice = async (e, shouldPrint = false) => {
    e.preventDefault();
    setShowErrors(true);

    // Lấy dữ liệu hiện tại để gửi, tránh setState bất đồng bộ
    const invoiceToSend = {
      phone: newInvoice.phone,
      customerName: newInvoice.customerName,
      vehicle_license: newInvoice.vehicle_license,
      vehicle_type: newInvoice.vehicle_type,
      kmNumber: toNumber(newInvoice.kmNumber),
      checkInTime: newInvoice.checkInTime,
      checkOutTime: newInvoice.checkOutTime || null,
      customerRequest: newInvoice.customerRequest || "",
      postRepairStatus: newInvoice.postRepairStatus || "",
      paymentMethod: newInvoice.paymentMethod || "Chuyển khoản",
      FK_idCashier: userId,
      FK_idStore: userStoreId,
      FK_idTechnician: newInvoice.technicianId || null,
      status: newInvoice.status || "Đã thanh toán",
      FK_idAppointment: selectedAppointment || null,

      services: servicesList.map((s) => ({
        serviceId: String(s.serviceId),
        laborCost: toNumber(s.laborCost),
        spareParts: s.spareParts.map((sp) => ({
          sparePartId: String(sp.sparePartId),
          quantity: toNumber(sp.quantity),
        })),
      })),
    };


    // Kiểm tra hợp lệ trước khi gửi
    if (!validateInvoice(invoiceToSend)) return;

    try {
      const res = await fetch(INVOICE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceToSend),
        credentials: "include",
      });

      const data = await res.json();

      if (data.status === "success") {
        window.Toast.fire({ icon: "success", title: "Thêm hóa đơn thành công!" });
        

        const newId = data.data?.PK_idInvoice || data.invoice?.PK_idInvoice;

        if (userStoreId) {
          await fetchConfirmedAppointments(userStoreId);
        }

        // // ✉️ Nếu hóa đơn được tạo từ lịch hẹn, gửi mail xác nhận (ngầm, không chặn UI)
        if (selectedAppointment) {
          sendStatusUpdateEmail(selectedAppointment)
            .then(() => console.log("✅ Đã gửi email xác nhận lịch hẹn sau khi tạo hóa đơn"))
            .catch((err) => console.error("⚠️ Lỗi gửi email (không ảnh hưởng UI):", err));
        }
        if (shouldPrint && newId) {
          // Đóng modal & reset form trước để UI không khựng
          setShowAddModal(false);
          resetInvoice();

          // Mở tab in ngay để tránh bị chặn
          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            alert("Trình duyệt đã chặn cửa sổ in. Hãy bật popup cho trang này!");
            return;
          }
          printWindow.document.write("<p>Đang tải hóa đơn...</p>");

          // Lấy chi tiết hóa đơn và in song song, không chặn UI
          (async () => {
            try {
              const res = await fetch(`${INVOICE_API_URL}/${newId}`, {
                credentials: "include",
              });
              const detail = await res.json();

              if (detail.status === "success") {
                const invoice = detail.data;

                // Tạo mảng phẳng `details` để in giống viewInvoice()
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
                    details.push({
                      PK_id: service.PK_id,
                      serviceName: service.serviceName,
                      laborCost: service.laborCost,
                      FK_idSparePart: null,
                      sparePartName: null,
                      unit: null,
                      quantity: null,
                      salePrice: null,
                    });
                  }
                });

                invoice.details = details;

                // In ra tab đã mở
                handlePrintInvoice(invoice, printWindow);
              } else {
                printWindow.document.write("<p>Không tải được chi tiết hóa đơn.</p>");
              }
            } catch (err) {
              console.error("Lỗi khi in hóa đơn:", err);
              printWindow.document.write("<p>Lỗi khi in hóa đơn.</p>");
            } finally {
              // Sau khi in xong mới reload danh sách để tránh lag
              setTimeout(() => fetchInvoices(), 1000);
            }
          })();
        } else {
          // Chỉ lưu (không in)
          setShowAddModal(false);
          fetchInvoices();
          resetInvoice();
        }
      } else {
        const msg = data.message || "Không thể tạo hóa đơn";
        window.Toast.fire({ icon: "error", title: msg });
      }
    } catch (err) {
      console.error("Fetch error:", err);
      window.Toast.fire({ icon: "error", title: err.message });
    }
  };

  // ==== Delete invoice ====
  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`${INVOICE_API_URL}/${invoiceToDelete.PK_idInvoice}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (data.status === "success") {
        window.Toast.fire({
          icon: "success",
          title: data.message || "Xóa hóa đơn thành công",
        });
        setShowDeleteConfirm(false);
        setInvoiceToDelete(null);
        fetchInvoices();
      } else {
        window.Toast.fire({
          icon: "error",
          title: data.message || "Xóa hóa đơn thất bại",
        });
      }
    } catch (err) {
      window.Toast.fire({
        icon: "error",
        title: "Lỗi khi xóa hóa đơn: " + err.message,
      });
    } finally {
      setDeleting(false);
    }
  };

  
  // ==== Pagination ====
  const getPageNumbers = () => {
    const pages = [];
    const totalPage = Math.ceil(total / perPage);
    for (let i = 1; i <= totalPage; i++) pages.push(i);
    return pages;
  };

  // ==== Convert number to Vietnamese ====
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

  // ==== Fetch confirmed appointments ====
  const fetchConfirmedAppointments = async (storeId) => {
    if (!storeId) return;
    try {
      const res = await fetch(`${APPOINTMENT_API_URL}/${storeId}`, {
        credentials: "include",
      });
      const result = await res.json();

      if (result.status === "success" && Array.isArray(result.data)) {
        setAppointments(result.data);
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Lỗi khi fetch danh sách lịch hẹn:", err);
      setAppointments([]);
    }
  };

  // Gọi khi lấy session xong (đã có store)
  useEffect(() => {
    if (userStoreId) {
      fetchConfirmedAppointments(userStoreId);
    }
  }, [userStoreId]);

  const handleSelectAppointment = (appointmentId) => {
    if (!appointmentId) {
      setSelectedAppointment(null);
      setNewInvoice({
        ...newInvoice,
        phone: "",
        customerName: "",
        customerId: "",
        vehicle_license: "",
        vehicle_type: ""
      });
      setCustomerVehicles([]);
      setIsAddingVehicle(false);
      return;
    }

    const appointment = appointments.find(
      (a) => String(a.PK_idAppointment) === String(appointmentId)
    );
    if (!appointment) return;

    setSelectedAppointment(appointmentId);

    // Fill thông tin khách hàng + xe
    setNewInvoice({
      ...newInvoice,
      phone: appointment.phone || "",
      customerName: appointment.fullName || "",
      customerId: appointment.FK_idCustomer || "",
      vehicle_license: appointment.licensePlate || "",
      vehicle_type: appointment.type || ""
    });

    if (appointment.licensePlate && appointment.type) {
      // có xe → hiển thị select
      setCustomerVehicles([
        {
          PK_idVehicle: appointment.FK_idVehicle,
          licensePlate: appointment.licensePlate,
          type: appointment.type
        }
      ]);
      setIsAddingVehicle(false);
    } else {
      // chưa có xe → hiển thị input
      setCustomerVehicles([]);
      setIsAddingVehicle(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

// ==== Print invoice ====
  const handlePrintInvoice = (invoiceData = null, printWindow = null) => {
    const invoice = invoiceData || selectedInvoice;
    if (!invoice) return;

    // Mở TAB mới thay vì cửa sổ nhỏ
      const win = printWindow || window.open("", "_blank");
    if (!win) return;

    if (!printWindow) return;

    // Gom nhóm các dòng theo serviceName
    const grouped = [];
    if (invoice.details?.length > 0) {
      invoice.details.forEach((item) => {
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
      invoice.totalAmount
    }&addInfo=${encodeURIComponent("Thanh toan hoa don " + invoice.PK_idInvoice)}&accountName=${encodeURIComponent(
      ACCOUNT_NAME
    )}`;

    // HTML in ra
    const htmlContent = `
    <html>
      <head>
        <title>Hóa đơn ${invoice.PK_idInvoice}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
        <style>
          .invoice-print { font-family: "Times New Roman", serif; font-size: 12px; }
          .logo-left { width: 120; }
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
                <div><strong>Địa chỉ:</strong> ${invoice.store_address || ""}</div>
                <div><strong>Điện thoại:</strong> ${invoice.store_phone || ""}</div>
              </div>
            </div>
            <img src="${logoMini}" alt="Mini Logo" class="logo-right" />
          </div>

          <h5 class="text-center fw-bold mb-1">HÓA ĐƠN BÁN HÀNG</h5>
          <div class="text-center mb-3 fw-bold">
            Số phiếu: ${invoice.PK_idInvoice}
          </div>

          <table class="table table-bordered table-sm mb-3" style="font-size: 10px;">
            <tbody>
              <tr>
                <td><strong>Thời gian vào:</strong> ${new Date(invoice.checkInTime).toLocaleString("vi-VN")}</td>
                <td><strong>Thời gian giao xe:</strong> ${new Date(invoice.checkOutTime).toLocaleString("vi-VN")}</td>
              </tr>
              <tr>
                <td style="width:60%"><strong>Biển số:</strong> ${invoice.vehicle_license} &nbsp;&nbsp; <strong>Số KM:</strong> ${invoice.kmNumber || "-"}</td>
                <td style="width:40%"><strong>Loại xe:</strong> ${invoice.vehicle_type}</td>
              </tr>
              <tr>
                <td><strong>Khách hàng:</strong> ${invoice.customerName}</td>
                <td><strong>Điện thoại:</strong> ${invoice.phone || "-"}</td>
              </tr>
            </tbody>
          </table>

          <table class="table table-sm mb-0" style="border-left:1px solid #000; border-right:1px solid #000; border-top:1px solid #000; border-collapse: collapse; font-size: 12px;">
            <tbody>
              <tr>
                <td style="padding:4px; border-bottom:1px solid #000;"><strong>KTV:</strong> ${invoice.technician_name || "—"}</td>
              </tr>
              <tr>
                <td style="padding:4px; border-bottom:none;"><strong>Yêu cầu khách hàng:</strong> ${invoice.customerRequest || "—"}</td>
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
              <div><strong>Tổng chi phí sửa chữa (A+B):</strong> ${invoice.totalAmount?.toLocaleString("vi-VN")} VNĐ</div>
            <div><strong>Tổng tiền bằng chữ:</strong> ${invoice.totalAmount ? numberToVietnamese(invoice.totalAmount) : "-"}</div>
            <div><strong>Tồn tại sau sửa chữa: </strong>${invoice.postRepairStatus}</div>    
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

    win.document.open();
    win.document.write(htmlContent);
    win.document.close();
  };


  const handlePrintInvoice2 = () => {
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
                <td><strong>Thời gian vào:</strong> ${new Date(selectedInvoice.checkInTime).toLocaleString("vi-VN")}</td>
                <td><strong>Thời gian giao xe:</strong> ${new Date(selectedInvoice.checkOutTime).toLocaleString("vi-VN")}</td>
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


          <table class="table table-bordered mt-3 text-center signature-table" style="table-layout:fixed;width:100%;font-size:12px;">
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

  // ==== Return ====
  return {
    // ==== State ====
    fromDate, toDate, searchName, invoiceId, showAddModal, newInvoice,
    loading, error, invoices, selectedInvoice, loadingDetail, deleting,
    showDeleteConfirm, invoiceToDelete, page, total, perPage,
    userRole, userStoreId, userId, userStoreAddress, stores, selectedStore, 
    technicians, services, customerVehicles, isAddingVehicle, storeSpareParts, 
    sparePartsList, errors, showErrors, servicesList, subtotal, appointments, 
    selectedAppointment, loadingRole,

    // ==== Setters ====
    setFromDate, setToDate, setSearchName, setInvoiceId, setShowAddModal,
    setNewInvoice, setPage, setSelectedStore, setShowDeleteConfirm, setInvoiceToDelete, 
    setIsAddingVehicle, resetInvoice, formatDate, setLoadingRole,

    // ==== Functions ====
    toNumber, fetchInvoices, handleAddInvoice, handleDelete, viewInvoice, closeModal,
    getPageNumbers, numberToVietnamese, fetchCustomerByPhone, handleAddSparePartRow,
    handleRemoveSparePartRow, handleSparePartChange, handleQuantityChange, handleChange,
    handleAddService, handleRemoveService, handleServiceChange, handleLaborCostChange,
    handlePrintInvoice2, togglePostRepairStatus, fetchConfirmedAppointments, handleSelectAppointment,

    showQRModal, setShowQRModal, qrUrl, handleShowQR, handleShowQRDetail, qrInfo,

    
  };

}


