import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// import { 
//   sendConfirmationEmail, 
//   sendStatusUpdateEmail,
//   // sendCancellationEmail 
// } from '../services/emailService.js';





const Booking = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [userVehicles, setUserVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [loading, setLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState(null);
  // const [vehiclesWithActiveAppointments, setVehiclesWithActiveAppointments] = useState([]);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [licensePlateFilter, setLicensePlateFilter] = useState(''); 

   const [technicianCount, setTechnicianCount] = useState(0);
  const [timeSlotStatus, setTimeSlotStatus] = useState({}); 
  // Form data
  const [formData, setFormData] = useState({
  PK_idAppointment: '',
  FK_idStore: '',
  FK_idCustomer: '',
  FK_idVehicle: '',
  appointmentDate: '',
  appointmentTime: '',
  customerPhone: '',
  status: 'pending'
});

// Danh sách service được chọn
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Store mapping for display
  const [storeMap, setStoreMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});
  const [vehicleMap, setVehicleMap] = useState({});

  // State for cancel confirmation popup
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  // State for add vehicle popup
  const [showAddVehiclePopup, setShowAddVehiclePopup] = useState(false);
  const [newVehicleData, setNewVehicleData] = useState({
    licensePlate: '',
    type: ''
  });
  const [addingVehicle, setAddingVehicle] = useState(false);

  // Lấy thông tin từ navigation state
  const location = useLocation();
  const selectedStoreFromNavigation = location.state?.selectedStore;
  const selectedServiceFromNavigation = location.state?.selectedService;
  const fromStorePage = location.state?.fromStorePage;
  const fromServicePage = location.state?.fromServicePage;  

  // Toast functions
  const showSuccess = (message = "Thành công!") => {
    if (window.Toast) {
      window.Toast.fire({
        icon: "success",
        title: message
      });
    } else {
      alert(`SUCCESS: ${message}`);
    }
  };

  const showError = (message = "Thất bại! Có lỗi xảy ra") => {
    if (window.Toast) {
      window.Toast.fire({
        icon: "error",
        title: message
      });
    } else {
      alert(`ERROR: ${message}`);
    }
  };


//   const fetchServicesForAppointment = async (appointmentId) => {
//   try {
//     const res = await fetch(`http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointment-service/${appointmentId}`);
//     const json = await res.json();
//     if (json.status === 'success' && Array.isArray(json.data)) {
//       // đảm bảo trả về mảng service objects [{ FK_idService, serviceName }, ...]
//       return json.data;
//     }
//     return [];
//   } catch (err) {
//     console.error('Lỗi fetchServicesForAppointment', err);
//     return [];
//   }
// };
// 🔹 Kiểm tra trạng thái đặt lịch của xe (chặn trùng ngày nếu chưa hủy)
const getVehicleAppointmentStatus = (vehicleId, date, editingAppointmentId = null) => {
  // Lọc tất cả lịch của xe đó
  const vehicleAppointments = appointments.filter(
    (appointment) => appointment.FK_idVehicle === vehicleId
  );

  // Nếu không có lịch nào → xe rảnh
  if (vehicleAppointments.length === 0) return "available";

  // ✅ Kiểm tra có lịch nào cùng ngày mà chưa bị hủy không (loại trừ lịch đang sửa)
  const sameDayActive = vehicleAppointments.find(
    (appointment) =>
      appointment.appointmentDate === date &&
      appointment.status !== "Đã hủy" &&
      appointment.PK_idAppointment !== editingAppointmentId // không tính lịch đang sửa
  );

  if (sameDayActive) {
    // ❌ Có lịch chưa hủy cùng ngày → không cho đặt
    const serviceNames = sameDayActive.services?.length
      ? sameDayActive.services.map(s => serviceMap[s.FK_idService]?.serviceName || s.FK_idService).join(", ")
      : "Không rõ dịch vụ";

    return {
      status: "unavailable",
      appointmentId: sameDayActive.PK_idAppointment,
      appointmentDate: sameDayActive.appointmentDate,
      appointmentTime: sameDayActive.appointmentTime,
      service: serviceNames,
      store:
        storeMap[sameDayActive.FK_idStore]?.address ||
        sameDayActive.FK_idStore,
    };
  }

  // ✅ Không có lịch chưa hủy cùng ngày → có thể đặt
  return "available";
};


  // Kiểm tra xe có thể được chọn hay không
  const isVehicleAvailable = (vehicleId) => {
    const status = getVehicleAppointmentStatus(vehicleId);
    return status === 'available';
  };

  // Generate time slots from 7:30 to 18:00 with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 7;
    const endHour = 18;
    const endMinute = 0;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 7 && minute < 30) continue;
        if (hour === endHour && minute > endMinute) continue;
        
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Get default appointment time
  const getDefaultAppointmentTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timeSlots = generateTimeSlots();
    
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    for (let slot of timeSlots) {
      if (slot > currentTime) {
        return slot;
      }
    }
    
    return '07:30';
  };

  // Check if a time slot is available
  const isTimeSlotAvailable = (time, selectedDate) => {
    const now = new Date();
    const selectedDateTime = new Date(`${selectedDate}T${time}`);
    return selectedDateTime > now;
  };

  // Update available time slots when date changes
  const updateAvailableTimeSlots = (selectedDate, currentAppointmentTime = null) => {
    const allTimeSlots = generateTimeSlots();
    setTimeSlotStatus({});

    if (!selectedDate) {
      setAvailableTimeSlots(allTimeSlots);
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedDate === today;
    
    if (isToday) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const filteredSlots = allTimeSlots.filter(slot => slot > currentTime);
      
      if (currentAppointmentTime && !filteredSlots.includes(currentAppointmentTime)) {
        filteredSlots.unshift(currentAppointmentTime);
      }
      
      setAvailableTimeSlots(filteredSlots);
      
      if (!currentAppointmentTime && formData.appointmentTime && !filteredSlots.includes(formData.appointmentTime)) {
        setFormData(prev => ({
          ...prev,
          appointmentTime: filteredSlots[0] || ''
        }));
      }
    } else {
      if (currentAppointmentTime && !allTimeSlots.includes(currentAppointmentTime)) {
        const slotsWithCurrent = [currentAppointmentTime, ...allTimeSlots];
        setAvailableTimeSlots(slotsWithCurrent);
      } else {
        setAvailableTimeSlots(allTimeSlots);
      }
    }
  };

  // Fetch user session
  const fetchUserSession = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.status === 'success' && data.user) {
        setUser(data.user);
        const defaultTime = getDefaultAppointmentTime();
        const today = new Date().toISOString().split('T')[0];
        
        setFormData(prev => ({
          ...prev,
          FK_idCustomer: data.user.user_id,
          customerPhone: data.user.phone || data.user.customerPhone || '',
          appointmentTime: defaultTime,
          appointmentDate: today
        }));
        
        updateAvailableTimeSlots(today);
        
        await Promise.all([
          fetchUserAppointments(data.user.user_id),
          fetchUserVehicles(data.user.user_id),
          fetchStores(),
          fetchServices()
        ]);
      } else {
        showError('Bạn chưa đăng nhập');
      }
    } catch (error) {
      showError('Lỗi kết nối đến server: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch user vehicles by user ID
  const fetchUserVehicles = async (userId) => {
    try {
      const response = await fetch(`http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/userVehicles/all/${userId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        const vehicles = data.data || [];
        setUserVehicles(vehicles);
        
        const vehicleMapping = {};
        vehicles.forEach(vehicle => {
          vehicleMapping[vehicle.PK_idVehicle] = {
            licensePlate: vehicle.licensePlate,
            type: vehicle.type
          };
        });
        setVehicleMap(vehicleMapping);
      } else {
        showError('Không thể tải danh sách xe: ' + (data.message || 'Lỗi không xác định'));
        setUserVehicles([]);
      }
    } catch (error) {
      showError('Lỗi khi tải danh sách xe: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setUserVehicles([]);
    }
  };

  // Fetch user appointments
 const fetchUserAppointments = async (userId) => {
  try {
    const response = await fetch(
      `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments/customer/${userId}`
    );
    const data = await response.json();

    if (data.status === "success" && Array.isArray(data.data)) {
      // Sắp xếp theo ngày + giờ (mới nhất lên trên)
      const sortedAppointments = data.data.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate} ${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate} ${b.appointmentTime}`);
        return dateB - dateA;
      });

      // 🔹 Gọi thêm API để lấy services cho từng appointment
      const enrichedAppointments = await Promise.all(
        sortedAppointments.map(async (appointment) => {
          try {
            const resSvc = await fetch(
              `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointment-service/${appointment.PK_idAppointment}`
            );
            const svcData = await resSvc.json();

            if (svcData.status === "success" && Array.isArray(svcData.data)) {
              return {
                ...appointment,
                services: svcData.data, // [{ FK_idService, serviceName }, ...]
              };
            } else {
              return { ...appointment, services: [] };
            }
          } catch (svcErr) {
            console.error(
              "Lỗi khi tải dịch vụ cho lịch hẹn:",
              appointment.PK_idAppointment,
              svcErr
            );
            return { ...appointment, services: [] };
          }
        })
      );

      setAppointments(enrichedAppointments);
    } else {
      setAppointments([]);
    }
  } catch  {
    showError("Lỗi khi tải danh sách đặt lịch");
    setAppointments([]);
  }
};


  // Fetch stores
  const fetchStores = async () => {
    try {
      const response = await fetch('http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store');
      const data = await response.json();
      
      if (data.status === 'success') {
        const storesData = data.data;
        setStores(storesData);
        
        const storeMapping = {};
        storesData.forEach(store => {
          storeMapping[store.PK_idStore] = {
            address: store.address,
            phone: store.phone
          };
        });
        setStoreMap(storeMapping);

        // Nếu có cửa hàng được chọn từ trang Store, tự động chọn nó
        if (selectedStoreFromNavigation && storesData.some(store => store.PK_idStore === selectedStoreFromNavigation.PK_idStore)) {
          setFormData(prev => ({
            ...prev,
            FK_idStore: selectedStoreFromNavigation.PK_idStore
          }));
        }
      }
    } catch{
      showError('Lỗi khi tải danh sách cửa hàng');
    }
  };

    // 🔹 Lấy số kỹ thuật viên của cửa hàng
   const fetchTechnicianCount = async (storeId) => {
    if (!storeId) return;
    try {
      const res = await fetch(
        `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/staff/countTechnicians/${storeId}`
      );
      const json = await res.json();
      if (json.status === "success") {
        setTechnicianCount(json.count || 0);
      } else {
        setTechnicianCount(0);
      }
    } catch (error) {
      console.error("Lỗi lấy số kỹ thuật viên:", error);
      setTechnicianCount(0);
    }
  };


  // 🔹 Kiểm tra tình trạng từng khung giờ trong ngày
  const checkStoreTimeSlots = async (storeId, date) => {
    if (!storeId || !date) return;

    const slots = generateTimeSlots();
    const results = {};

    for (const time of slots) {
      try {
        const res = await fetch(
          `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments/count-by-store-time/${storeId}?date=${date}&time=${time}`
        );
        const json = await res.json();

        if (json.status === "success" && json.data) {
          const { total } = json.data;
          results[time] = {
            total,
            full: technicianCount > 0 && total >= technicianCount,
          };
        } else {
          results[time] = { total: 0, full: false };
        }
      } catch (error) {
        console.error("Lỗi kiểm tra khung giờ:", error);
        results[time] = { total: 0, full: false };
      }
    }

    setTimeSlotStatus(results);
  };

  // Fetch services
const fetchServices = async () => {
  try {
    const response = await fetch('http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/service');
    const data = await response.json();
    
    if (data.status === 'success') {
      const servicesData = data.data;
      setServices(servicesData);
      
      const serviceMapping = {};
      servicesData.forEach(service => {
        serviceMapping[service.PK_idService] = {
          serviceName: service.serviceName,
          estimatedPrice: service.estimatedPrice,
          estimatedTime: service.estimatedTime
        };
      });
      setServiceMap(serviceMapping);

      // Nếu có dịch vụ được chọn từ trang Service, tự động chọn nó - THÊM ĐOẠN NÀY
      if (selectedServiceFromNavigation && servicesData.some(service => service.PK_idService === selectedServiceFromNavigation.PK_idService)) {
        setFormData(prev => ({
          ...prev,
          FK_idService: selectedServiceFromNavigation.PK_idService
        }));
        setSelectedServices([selectedServiceFromNavigation]);
      }
    }
  } catch{
    showError('Lỗi khi tải danh sách dịch vụ');
  }
};

  // Load data khi mở form đặt lịch
  const loadDataForBookingForm = async () => {
    if (user) {
      try {
        setLoading(true);
        await Promise.all([
          fetchUserAppointments(user.user_id),
          fetchUserVehicles(user.user_id)
        ]);
      } catch (error) {
        showError('Lỗi khi tải dữ liệu: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  
// Khi chọn một dịch vụ trong select
const handleSelectService = (e) => {
  const selectedServiceId = e.target.value;
  if (!selectedServiceId) return;

  const selectedService = services.find(s => s.PK_idService === selectedServiceId);
  if (selectedService && !selectedServices.some(s => s.PK_idService === selectedServiceId)) {
    setSelectedServices([...selectedServices, selectedService]);
  }

  // Reset select về mặc định
  e.target.value = "";
};

// Xóa một dịch vụ khỏi danh sách đã chọn
const handleRemoveSelectedService = (serviceId) => {
  setSelectedServices(selectedServices.filter(s => s.PK_idService !== serviceId));
};

  


  // Add new vehicle
 const handleAddVehicle = async (e) => {
  e.preventDefault();
  
  if (!user) {
    showError('Bạn chưa đăng nhập');
    return;
  }

  if (!newVehicleData.licensePlate.trim() || !newVehicleData.type.trim()) {
    showError('Vui lòng điền đầy đủ thông tin biển số và loại xe');
    return;
  }

  // Kiểm tra biển số xe có tồn tại trong danh sách xe của user không
  const licensePlateExists = userVehicles.some(vehicle => 
    vehicle.licensePlate.toLowerCase() === newVehicleData.licensePlate.trim().toLowerCase()
  );

  if (licensePlateExists) {
    showError('Biển số xe đã tồn tại trong danh sách xe của bạn. Vui lòng nhập biển số khác.');
    return;
  }

  setAddingVehicle(true);

  const vehicleData = {
    licensePlate: newVehicleData.licensePlate.trim(),
    type: newVehicleData.type.trim()
  };

  try {
    const response = await fetch('http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/vehicle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(vehicleData)
    });

    const data = await response.json();

    if (data.status === 'success') {
      showSuccess('Thêm xe thành công!');
      setShowAddVehiclePopup(false);
      setNewVehicleData({ licensePlate: '', type: '' });
      
      // Refresh vehicles list
      await fetchUserVehicles(user.user_id);
      
      if (data.vehicle_id) {
        setFormData(prev => ({
          ...prev,
          FK_idVehicle: data.vehicle_id
        }));
      }
    } else {
      // Kiểm tra xem lỗi có phải do biển số trùng từ server không
      if (data.message && data.message.toLowerCase().includes('biển số') || data.message.toLowerCase().includes('license')) {
        showError('Biển số xe đã tồn tại trong hệ thống. Vui lòng nhập biển số khác.');
      } else {
        showError(data.message || 'Thêm xe thất bại');
      }
    }
  } catch {
    showError('Lỗi kết nối đến server');
  } finally {
    setAddingVehicle(false);
  }
};

  // Handle edit appointment
  const handleEditAppointment = async (appointment) => {
  try {
    // Bật form sửa
    setEditingAppointment(appointment);
    setShowForm(true);

    // Gán dữ liệu form
    setFormData({
      FK_idStore: appointment.FK_idStore,
      FK_idVehicle: appointment.FK_idVehicle,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      customerPhone: appointment.customerPhone||user?.phone||user?.customerPhone||"",
    });

    // ✅ Gọi lại danh sách khung giờ khả dụng
    updateAvailableTimeSlots(appointment.appointmentDate, appointment.appointmentTime);

    // 🔹 Gọi API lấy danh sách dịch vụ đã đặt
    const res = await fetch(
      `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointment-service/${appointment.PK_idAppointment}`
    );

    const data = await res.json();

    if (data.status === "success" && Array.isArray(data.data)) {
      setSelectedServices(
        data.data.map((svc) => ({
          PK_idService: svc.FK_idService,
          serviceName: svc.serviceName || svc.FK_idService,
        }))
      );
    } else {
      setSelectedServices([]);
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy dịch vụ của lịch hẹn:", error);
    setSelectedServices([]);
  }
};


  // Show cancel confirmation popup
  const showCancelConfirmation = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelPopup(true);
  };

  // Handle cancel appointment confirmation
  const handleCancelConfirmation = async (confirmed) => {
    if (confirmed && appointmentToCancel) {
      await performCancelAppointment(appointmentToCancel.PK_idAppointment);
    }
    setShowCancelPopup(false);
    setAppointmentToCancel(null);
  };

  // Perform actual cancel appointment
  const performCancelAppointment = async (appointmentId) => {
  try {
    const response = await fetch(
      `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments/${appointmentId}`,
      { method: 'DELETE' }
    );

    const data = await response.json();

    if (data.status === 'success') {
      showSuccess('Hủy đặt lịch thành công!');
      
      // 🔄 Cập nhật lại danh sách lịch hẹn
      if (user) {
        await fetchUserAppointments(user.user_id);
      }

      // // ✉️ GỬI EMAIL XÁC NHẬN HỦY — chạy ngầm, không chờ
      // sendCancellationEmail(appointmentId)
      //   .then(() => console.log('✅ Đã gửi email thông báo hủy lịch'))
      //   .catch(err => console.error('⚠️ Lỗi gửi email hủy lịch:', err));

    } else {
      showError(data.message || 'Hủy đặt lịch thất bại');
    }

  } catch (error) {
    console.error('❌ Lỗi kết nối:', error);
    showError('Lỗi kết nối đến server');
  }
};




const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.FK_idStore && formData.appointmentDate && formData.appointmentTime) {

  const realtimeRes = await fetch(
    `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments/count-by-store-time/${formData.FK_idStore}?date=${formData.appointmentDate}&time=${formData.appointmentTime}`
  );
  const realtimeJson = await realtimeRes.json();
  const total = realtimeJson?.data?.total || 0;

  if (technicianCount > 0 && total >= technicianCount) {
    return showError(`Khung giờ ${formData.appointmentTime} ngày ${formData.appointmentDate} đã FULL lịch. Vui lòng chọn giờ khác.`);
  }
}
  if (!user) return showError('Bạn chưa đăng nhập');

  // 🔹 Kiểm tra khung giờ đã full hay chưa
  const selectedSlotStatus = timeSlotStatus[formData.appointmentTime];
  if (selectedSlotStatus?.full) {
    return showError(`Khung giờ ${formData.appointmentTime} đã full đặt lịch, vui lòng chọn giờ khác.`);
  }
  if (!formData.FK_idStore || !formData.appointmentDate || !formData.appointmentTime || !formData.FK_idVehicle || !formData.customerPhone)
    return showError('Vui lòng điền đầy đủ thông tin');

  if (selectedServices.length === 0)
    return showError('Vui lòng chọn ít nhất một dịch vụ');

  const phoneRegex = /(0[3|5|7|8|9])+([0-9]{8})\b/;
  if (!phoneRegex.test(formData.customerPhone))
    return showError('Số điện thoại không hợp lệ');

  const selectedDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
  if (selectedDateTime <= new Date())
    return showError('Không thể đặt lịch trong quá khứ. Vui lòng chọn thời gian trong tương lai.');

  try {
    if (editingAppointment) {
      // === 🛠 CẬP NHẬT LỊCH HẸN ===
      const updateData = {
        FK_idStore: formData.FK_idStore,
        FK_idVehicle: formData.FK_idVehicle,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        customerPhone: formData.customerPhone,
        status: 'Chờ xác nhận'
      };

      const response = await fetch(
        `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments/${editingAppointment.PK_idAppointment}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        }
      );

      const data = await response.json();
      if (data.status === 'success') {
        // --- XÓA DỊCH VỤ CŨ ---
        await fetch(
          `http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointment-service/remove-all/${editingAppointment.PK_idAppointment}`,
          { method: 'DELETE' }
        );

        // --- THÊM LẠI DỊCH VỤ MỚI ---
        await Promise.all(
          selectedServices.map(service => {
            const serviceData = new FormData();
            serviceData.append('FK_idAppointment', editingAppointment.PK_idAppointment);
            serviceData.append('FK_idService', service.PK_idService);
            return fetch(
              'http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointment-service/add',
              { method: 'POST', body: serviceData }
            );
          })
        );

        // ✅ GIAO DIỆN NGAY LẬP TỨC
        showSuccess('Cập nhật lịch hẹn thành công!');
        setShowForm(false);
        setEditingAppointment(null);
        resetForm();
        setSelectedServices([]);
        await fetchUserAppointments(user.user_id);

        // ✉️ GỬI EMAIL NGẦM (không chờ)
        // sendStatusUpdateEmail(editingAppointment.PK_idAppointment)
        //   .then(() => console.log('✅ Đã gửi email cập nhật sau khi sửa lịch'))
        //   .catch(err => console.error('⚠️ Lỗi gửi email cập nhật:', err));

      } else {
        showError(data.message || 'Cập nhật lịch hẹn thất bại');
      }

    } else {
      // === ✨ TẠO MỚI LỊCH HẸN ===
      const submitData = {
        ...formData,
        FK_idCustomer: user.user_id,
        status: 'Chờ xác nhận'
      };

      const response = await fetch(
        'http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointments',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        const appointmentId = data.data?.PK_idAppointment || data.insert_id;

        await Promise.all(
          selectedServices.map(service => {
            const serviceData = new FormData();
            serviceData.append('FK_idAppointment', appointmentId);
            serviceData.append('FK_idService', service.PK_idService);
            return fetch(
              'http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/appointment-service/add',
              { method: 'POST', body: serviceData }
            );
          })
        );

        // ✅ HIỂN THỊ NGAY
        showSuccess('Đặt lịch thành công!');
        setShowForm(false);
        resetForm();
        setSelectedServices([]);
        await fetchUserAppointments(user.user_id);

        // ✉️ GỬI EMAIL NGẦM SAU KHI GIAO DIỆN ĐÃ CẬP NHẬT
        // sendConfirmationEmail(appointmentId)
        //   .then(() => console.log('✅ Đã gửi email xác nhận đặt lịch'))
        //   .catch(err => console.error('⚠️ Lỗi gửi email xác nhận:', err));

      } else {
        showError(data.message || 'Đặt lịch thất bại');
      }
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối:', error);
    showError('Lỗi kết nối đến server: ' + error.message);
  }
};



  // Reset form
 const resetForm = () => {
  if (user) {
    const defaultTime = getDefaultAppointmentTime();
    const today = new Date().toISOString().split('T')[0];
    
    setFormData({
      PK_idAppointment: '',
      FK_idStore: selectedStoreFromNavigation ? selectedStoreFromNavigation.PK_idStore : '',
      FK_idCustomer: user.user_id,
      FK_idVehicle: '',
      appointmentDate: today,
      appointmentTime: defaultTime,
      customerPhone: user.phone || user.customerPhone || '',
      status: 'pending'
    });
    
    updateAvailableTimeSlots(today);
  }
  setEditingAppointment(null);
  setSelectedServices([]);
};

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format datetime for display
  const formatDateTime = (dateString, timeString) => {
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

// Get display information for cancel confirmation popup
// const getCancelAppointmentDisplayInfo = (appointment) => {
//   const displayInfo = getAppointmentDisplayInfo(appointment);
  
//   return {
//     storeAddress: displayInfo.storeAddress,
//     serviceNames: displayInfo.serviceName, // Đã được cập nhật từ hàm trên
//     licensePlate: displayInfo.licensePlate,
//     vehicleType: displayInfo.vehicleType
//   };
// };
 // Get display information for appointments
const getAppointmentDisplayInfo = (appointment) => {
  const storeInfo = storeMap[appointment.FK_idStore] || { address: appointment.FK_idStore };
  const serviceInfo = serviceMap[appointment.FK_idService] || { serviceName: appointment.FK_idService };
  const vehicleInfo = vehicleMap[appointment.FK_idVehicle] || { 
    licensePlate: 'Đang tải...', 
    type: '' 
  };

  // Lấy thông tin dịch vụ từ appointment.services (nếu có)
  const serviceNames = appointment.services && appointment.services.length > 0
    ? appointment.services.map(s => serviceMap[s.FK_idService]?.serviceName || s.FK_idService).join(', ')
    : serviceInfo.serviceName || 'Không có';

  return {
    storeAddress: storeInfo.address,
    serviceName: serviceNames, // Sửa thành serviceNames
    licensePlate: vehicleInfo.licensePlate,
    vehicleType: vehicleInfo.type
  };
};

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter ? appointment.status === statusFilter : true;
    const matchesDate = dateFilter ? appointment.appointmentDate === dateFilter : true;
    const matchesLicensePlate = licensePlateFilter ? 
    vehicleMap[appointment.FK_idVehicle]?.licensePlate?.toLowerCase().includes(licensePlateFilter.toLowerCase()) : 
    true;
  
  return matchesStatus && matchesDate && matchesLicensePlate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Load data on component mount
  useEffect(() => {
    fetchUserSession();
  }, []);

  // Load data khi mở form đặt lịch
  useEffect(() => {
    if (showForm && user) {
      loadDataForBookingForm();
    }
  }, [showForm]);

  // Auto refresh appointments data
  useEffect(() => {
    if (user && !showForm) {
      const interval = setInterval(() => {
        fetchUserAppointments(user.user_id);
      }, 30000); // Refresh mỗi 30 giây
      
      return () => clearInterval(interval);
    }
  }, [user, showForm]);

  // Tự động mở form đặt lịch khi chuyển từ trang Store hoặc Service
 useEffect(() => {
  if ((fromStorePage && selectedStoreFromNavigation) || (fromServicePage && selectedServiceFromNavigation)) {
    setShowForm(true);
  }
}, [fromStorePage, fromServicePage, selectedStoreFromNavigation, selectedServiceFromNavigation]);
// 🔹 Khi technicianCount thay đổi → cập nhật lại tình trạng full của ngày hiện tại
useEffect(() => {
  if (formData.FK_idStore && formData.appointmentDate) {
    checkStoreTimeSlots(formData.FK_idStore, formData.appointmentDate);
  }
}, [technicianCount]);

  if (loading) {
    return (
      <div className="container mt-4" style={{maxWidth: '1200px'}}>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <p className="text-center mt-2">Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4" style={{maxWidth: '1200px'}}>
        <div className="alert alert-warning text-center">
          <h4>Vui lòng đăng nhập để sử dụng tính năng đặt lịch</h4>
          <button 
            className="btn btn-primary mt-2"
            onClick={fetchUserSession}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{maxWidth: '1200px'}}>
      <div className="row">
        <div className="col-12">
        
          {/* Booking Form */}
          {showForm && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  {editingAppointment ? 'Chỉnh sửa đặt lịch' : 'Đặt lịch mới'}
                  {editingAppointment && (
                    <small className="ms-2 ">
                      {/* <i className="fas fa-clock me-1"></i> */}
                      {formatDateTime(editingAppointment.appointmentDate, editingAppointment.appointmentTime)}
                    </small>
                  )}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    {/*Name*/}
                    <div className="col-md-6">
                      <label className="form-label">Tên người dùng</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={user.fullName}
                        disabled
                      />
                    </div>
                     {/*Xe*/}
                    <div className="col-md-6">
                      <label className="form-label">Xe của bạn *</label>
                      <select 
                        className="form-select"
                        value={formData.FK_idVehicle}
                        onChange={(e) => {
                          const vehicleId = e.target.value;
                          if (vehicleId === 'add_vehicle') {
                            setShowAddVehiclePopup(true);
                            setFormData(prev => ({ ...prev, FK_idVehicle: '' }));
                          } else {
                            setFormData({...formData, FK_idVehicle: vehicleId});
                          }
                        }}
                        required
                      >
                        <option value="">Chọn xe</option>
                        {userVehicles.map(vehicle => {
                          const vehicleStatus = getVehicleAppointmentStatus(
                            vehicle.PK_idVehicle,
                            formData.appointmentDate,
                            editingAppointment ? editingAppointment.PK_idAppointment : null 
                          );
                          const isAvailable = vehicleStatus === 'available';
                          const isCurrentlyEditing = editingAppointment && editingAppointment.FK_idVehicle === vehicle.PK_idVehicle;
                          
                          const canSelect = isAvailable || isCurrentlyEditing;
                          
                          return (
                            <option 
                              key={vehicle.PK_idVehicle} 
                              value={vehicle.PK_idVehicle}
                              disabled={!canSelect}
                              className={!canSelect ? 'text-muted' : ''}
                            >
                              {vehicle.licensePlate} - {vehicle.type}
                              {!canSelect && !isCurrentlyEditing && vehicleStatus !== 'available' && (
                                ` (Đang có lịch: ${vehicleStatus.appointmentDate} ${vehicleStatus.appointmentTime})`
                              )}
                              {isCurrentlyEditing && ' (Đang chỉnh sửa)'}
                                </option>
                              );
                            })}
                        <option value="add_vehicle" className="text-primary fw-bold">
                          + Thêm xe mới
                        </option>
                      </select>
                      
                      {formData.FK_idVehicle && (() => {
                      const vehicleStatus = getVehicleAppointmentStatus(
                        formData.FK_idVehicle, 
                        formData.appointmentDate,
                        editingAppointment ? editingAppointment.PK_idAppointment : null // Thêm tham số này
                      );
                      
                      const isCurrentlyEditing = editingAppointment && editingAppointment.FK_idVehicle === formData.FK_idVehicle;
                      
                      if (vehicleStatus !== 'available' && !isCurrentlyEditing) {
                        return (
                          <div className="alert alert-warning mt-2 py-2">
                            <small>
                              Xe này đang có lịch hẹn "{vehicleStatus.service}" vào {formatDate(vehicleStatus.appointmentDate)} lúc {vehicleStatus.appointmentTime}. 
                              Vui lòng chọn xe khác hoặc đợi lịch hiện tại hoàn thành/hủy.
                            </small>
                          </div>
                        );
                      }
                      return null;
                    })()}
                      
                      {userVehicles.length === 0 && (
                        <div className="form-text text-warning">
                          Bạn chưa có xe nào. Vui lòng thêm xe trước khi đặt lịch.
                        </div>
                      )}
                    </div>
                     
                  </div>

                  <div className="row mb-3">
                    {/*SĐT*/}
                    <div className="col-md-6">
                      <label className="form-label">Số điện thoại *</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        placeholder="Nhập số điện thoại của bạn"
                        required
                        disabled
                      />
                    </div>
                   {/*cửa hàng*/}
                    <div className="col-md-6">
                      <label className="form-label">Cửa hàng *</label>
                     <select
                        className="form-select"
                        value={formData.FK_idStore}
                        onChange={(e) => {
                          const storeId = e.target.value;
                          setFormData({ ...formData, FK_idStore: storeId });
                          fetchTechnicianCount(storeId);
                          if (formData.appointmentDate) {
                            checkStoreTimeSlots(storeId, formData.appointmentDate);
                          }
                        }}
                        required
                      >
                        <option value="">Chọn cửa hàng</option>
                        {stores.map(store => (
                          <option key={store.PK_idStore} value={store.PK_idStore}>
                            {store.address}
                          </option>
                        ))}
                      </select>
                      {selectedStoreFromNavigation && (
                        <div className="form-text text-success">
                          {/* <i className="fas fa-check-circle me-1"></i> */}
                          Cửa hàng được chọn từ trang danh sách
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row mb-3">
                      {/*Email*/}
                    <div className="col-md-6">
                      <label className="form-label">Email khách hàng</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={user.email || "Chưa có thông tin email"}
                        disabled
                      />
                    </div>
                    {/*Dịch vụ*/}
                    <div className="col-md-6">
                      <label className="form-label">Dịch vụ *</label>

                      {/* Hiển thị danh sách dịch vụ đã chọn */}
                      {selectedServices.length > 0 && (
                        <div className="mb-2 p-2 border rounded bg-light">
                          {/* <strong>Các dịch vụ đã chọn:</strong> */}
                          <ul className="list-unstyled mb-0 mt-2">
                            {selectedServices.map(service => (
                              <li key={service.PK_idService} className="d-flex justify-content-between align-items-center mb-1">
                                <span>{service.serviceName}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleRemoveSelectedService(service.PK_idService)}
                                >
                                  {/* <i className="fas fa-times"></i> */}
                                  Xóa
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Select để thêm dịch vụ */}
                      <select 
                        className="form-select"
                        onChange={handleSelectService}
                        defaultValue=""
                      >
                        <option value="">Chọn dịch vụ để thêm</option>
                        {services
                          .filter(s => !selectedServices.some(sel => sel.PK_idService === s.PK_idService))
                          .map(service => (
                            <option key={service.PK_idService} value={service.PK_idService}>
                              {service.serviceName}
                            </option>
                          ))}
                      </select>

                      {selectedServices.length === 0 && (
                        <div className="form-text text-warning">
                          Vui lòng chọn ít nhất một dịch vụ
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">Ngày đặt lịch *</label>
                      <input
                      type="date"
                      className="form-control"
                      value={formData.appointmentDate}
                      onChange={(e) => {
                        const selectedDate = e.target.value;
                        const currentTime = formData.appointmentTime;
                        setFormData((prev) => ({
                          ...prev,
                          appointmentDate: selectedDate,
                        }));
                        updateAvailableTimeSlots(selectedDate, currentTime);

                        // 🔹 Gọi kiểm tra số lượng khung giờ khi chọn ngày
                        if (formData.FK_idStore) {
                          checkStoreTimeSlots(formData.FK_idStore, selectedDate);
                        }
                      }}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Giờ đặt lịch *</label>
                      <select 
                        className="form-select"
                        value={formData.appointmentTime}
                        onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                        required
                      >
                        <option value="">Chọn khung giờ</option>
                       {availableTimeSlots.map((time) => {
                        const status = timeSlotStatus[time];
                        const isFull = status?.full;

                        return (
                          <option key={time} value={time} disabled={isFull}>
                            {time} {isFull ? "(Đã full đặt lịch)" : ""}
                          </option>
                        );
                      })}
                      </select>
                      
                      {editingAppointment && 
                       formData.appointmentTime === editingAppointment.appointmentTime && 
                       !isTimeSlotAvailable(formData.appointmentTime, formData.appointmentDate) && (
                        <div className="alert alert-warning mt-2 py-2">
                          <small>
                            {/* <i className="fas fa-exclamation-triangle me-1"></i> */}
                            <strong>Lưu ý:</strong> Giờ đã đặt trước đó không khả dụng trong ngày mới. 
                            Vui lòng chọn giờ khác hoặc giữ nguyên giờ này để tiếp tục chỉnh sửa.
                          </small>
                        </div>
                      )}
                      
                      <div className="form-text">
                        Đặt lịch trong khung giờ: 7:30 - 18:00
                      </div>
                      
                      {availableTimeSlots.length === 0 && formData.appointmentDate && (
                        <div className="text-warning small mt-1">
                          {/* <i className="fas fa-exclamation-triangle me-1"></i> */}
                          Không còn khung giờ trống cho ngày hôm nay. Vui lòng chọn ngày khác.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2  justify-content-end">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      Hủy
                    </button>
                    
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={availableTimeSlots.length === 0 || 
                        (!editingAppointment && formData.FK_idVehicle && !isVehicleAvailable(formData.FK_idVehicle))}
                    >
                      {editingAppointment ? 'Cập nhật' : 'Đặt lịch'}
                    </button>
                    
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Appointments List - Card Layout */}
          {!showForm && (
  <div className="card">
    <div className="card-header bg-light">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-2">
        {/* Bộ lọc bên trái */}
        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* Tìm theo biển số */}
          <div className="input-group" style={{width: '200px'}}>
            
            <input 
              type="text" 
              className="form-control"
              placeholder="Biển số..."
              value={licensePlateFilter}
              onChange={(e) => setLicensePlateFilter(e.target.value)}
            />
          </div>

          {/* Tìm theo ngày */}
          <div className="input-group" style={{width: '180px'}}>
           
            <input 
              type="date" 
              className="form-control"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* Tìm theo trạng thái */}
          <div className="input-group" style={{width: '200px'}}>
            
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Chờ xác nhận">Chờ xác nhận</option>
              <option value="Đã xác nhận">Đã xác nhận</option>
              <option value="Đã hủy">Đã hủy</option>
              <option value="Hoàn thành">Hoàn thành</option>
            </select>
          </div>

          {/* Nút xóa lọc */}
          {(statusFilter || dateFilter || licensePlateFilter) && (
            <button 
              className="btn btn-outline-secondary"
              onClick={() => {
                setStatusFilter('');
                setDateFilter('');
                setLicensePlateFilter('');
              }}
              style={{height: '38px'}}
            >
              {/* <i className="fas fa-times me-1"></i> */}
               Xóa
            </button>
          )}
        </div>

        {/* Nút thêm đặt lịch bên phải */}
        <button 
          className="btn btn-primary d-flex align-items-center"
          onClick={() => {
            setEditingAppointment(null);
            setShowForm(true);
          }}
          style={{height: '38px'}}
        >
           Thêm đặt lịch
        </button>
      </div>
    </div>
    
    <div className="card-body">
      {/* Phần danh sách appointments giữ nguyên */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">Không tìm thấy đặt lịch nào phù hợp</p>
          {/* <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingAppointment(null);
              setShowForm(true);
            }}
          >
             Đặt lịch ngay
          </button> */}
        </div>
                ) : (
                  <>
                    <div className="row">
                      {currentAppointments.map(appointment => {
                        const displayInfo = getAppointmentDisplayInfo(appointment);
                        const canEditCancel = appointment.status === 'Chờ xác nhận';
                        
                        return (
                          <div key={appointment.PK_idAppointment} className="col-md-6 col-lg-4 mb-3">
                            <div className="card h-100 border shadow-sm">
                              <div className="card-body">
                                <div className="mb-3">
                                  <h6 className="card-title text-primary">
                                    {/* <i className="fas fa-store me-2"></i> */}
                                    {displayInfo.storeAddress}
                                  </h6>
                                 <p className="card-text mb-1">
                                  {/* <i className="fas fa-concierge-bell me-2"></i> */}
                                  <strong>Dịch vụ:</strong>{' '}
                                  {appointment.services && appointment.services.length > 0
                                    ? appointment.services.map(s => serviceMap[s.FK_idService]?.serviceName || s.FK_idService).join(', ')
                                    : displayInfo.serviceName || 'Không có'}
                                </p>
                                  <p className="card-text mb-1">
                                    {/* <i className="fas fa-car me-2"></i> */}
                                    <strong>Xe:</strong> {displayInfo.licensePlate}
                                    {displayInfo.vehicleType && (
                                      <span> - {displayInfo.vehicleType}</span>
                                    )}
                                  </p>
                                  <p className="card-text mb-1">
                                    {/* <i className="fas fa-calendar me-2"></i> */}
                                    <strong>Ngày:</strong> {formatDate(appointment.appointmentDate)}
                                  </p>
                                  <p className="card-text mb-1">
                                    {/* <i className="fas fa-clock me-2"></i> */}
                                    <strong>Giờ:</strong> {appointment.appointmentTime}
                                  </p>
                                  <p className="card-text">
                                    <span className={`badge ${
                                      appointment.status === 'Chờ xác nhận' ? 'bg-warning text-dark' :
                                      appointment.status === 'Đã xác nhận' ? 'bg-success' :
                                      appointment.status === 'Đã hủy' ? 'bg-danger' : 'bg-info'
                                    }`}>
                                      {appointment.status}
                                    </span>
                                  </p>
                                </div>
                                
                                <div className="btn-group w-100">
                                  {canEditCancel ? (
                                    <>
                                      <button
                                        className="btn btn-warning btn-sm me-2"
                                        onClick={() => handleEditAppointment(appointment)}
                                      >
                                        {/* <i className="fas fa-edit me-1"></i> */}
                                        Sửa
                                      </button>
                                      <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => showCancelConfirmation(appointment)}
                                      >
                                        {/* <i className="fas fa-times me-1"></i> */}
                                        Hủy
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      className="btn btn-outline-secondary btn-sm w-100"
                                      disabled
                                    >
                                      {/* <i className="fas fa-eye me-1"></i> */}
                                      Chỉ xem
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <nav className="mt-4">
                        <ul className="pagination justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              «
                            </button>
                          </li>
                          
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => paginate(page)}
                              >
                                {page}
                              </button>
                            </li>
                          ))}
                          
                          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              »
                            </button>
                          </li>
                        </ul>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Popup Modal */}
      {showCancelPopup && appointmentToCancel && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  {/* <i className="fas fa-exclamation-triangle me-2"></i> */}
                  Xác nhận hủy đặt lịch
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => handleCancelConfirmation(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-danger">
                  <strong>
                    {/* <i className="fas fa-exclamation-circle me-2"></i> */}
                  CẢNH BÁO:</strong> Hành động này không thể hoàn tác!
                </div>
                
                <h6 className="mb-3">Thông tin đặt lịch sẽ bị hủy:</h6>
                
                <div className="card border-0 bg-light">
                  <div className="card-body">
                    {(() => {
                      const displayInfo = getAppointmentDisplayInfo(appointmentToCancel);
                      return (
                        <>
                          <p className="mb-2">
                            <strong>
                              {/* <i className="fas fa-store me-2 text-primary"></i> */}
                            Cửa hàng:</strong> {displayInfo.storeAddress}
                          </p>
                         <p className="mb-2">
                          <strong>
                            {/* <i className="fas fa-concierge-bell me-2 text-primary"></i> */}
                            Dịch vụ:
                          </strong>{" "}
                          {selectedServices.length > 0
                            ? selectedServices.map((svc) => svc.serviceName).join(", ")
                            : displayInfo.serviceName || "Chưa có dịch vụ"}
                        </p>
                          <p className="mb-2">
                            <strong>
                              {/* <i className="fas fa-car me-2 text-primary"></i> */}
                              Xe:</strong> {displayInfo.licensePlate}
                            {displayInfo.vehicleType && ` - ${displayInfo.vehicleType}`}
                          </p>
                          <p className="mb-2">
                            <strong>
                              {/* <i className="fas fa-calendar me-2 text-primary"></i> */}
                              Ngày:</strong> {formatDate(appointmentToCancel.appointmentDate)}
                          </p>
                          <p className="mb-0">
                            <strong>
                              {/* <i className="fas fa-clock me-2 text-primary"></i> */}
                              Giờ:</strong> {appointmentToCancel.appointmentTime}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-muted small mb-0">
                    {/* <i className="fas fa-info-circle me-1"></i> */}
                    Sau khi hủy, bạn sẽ cần đặt lịch mới nếu muốn sử dụng dịch vụ
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => handleCancelConfirmation(false)}
                >
                  {/* <i className="fas fa-times me-2"></i> */}
                  Hủy bỏ
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleCancelConfirmation(true)}
                >
                  {/* <i className="fas fa-check me-2"></i> */}
                  Đồng ý hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Popup Modal */}
      {showAddVehiclePopup && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  {/* <i className="fas fa-car me-2"></i> */}
                  Thêm xe mới
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => {
                    setShowAddVehiclePopup(false);
                    setNewVehicleData({ licensePlate: '', type: '' });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleAddVehicle}>
                  <div className="mb-3">
                    <label className="form-label">Biển số xe *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newVehicleData.licensePlate}
                      onChange={(e) => setNewVehicleData({...newVehicleData, licensePlate: e.target.value})}
                      placeholder="Nhập biển số xe"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Loại xe *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={newVehicleData.type}
                      onChange={(e) => setNewVehicleData({...newVehicleData, type: e.target.value})}
                      placeholder="Nhập loại xe của bạn"
                      required
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={addingVehicle}
                    >
                      {addingVehicle ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Đang thêm...
                        </>
                      ) : (
                        <>
                          {/* <i className="fas fa-save me-2"></i> */}
                          Lưu xe
                        </>
                      )}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowAddVehiclePopup(false);
                        setNewVehicleData({ licensePlate: '', type: '' });
                      }}
                      disabled={addingVehicle}
                    >
                      {/* <i className="fas fa-times me-2"></i> */}
                      Hủy
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;