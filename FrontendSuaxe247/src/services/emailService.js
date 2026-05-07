import { showSuccess, showError } from './notificationService';

const API_BASE_URL = 'http://localhost/Suaxe247Backend/BackendSuaxe247/public/api';

/**
 * 🔹 Gửi email thông báo tổng quát
 * @param {string} type - Loại email: 'confirmation', 'status_update', 'reminder', 'cancellation'
 * @param {number} appointmentId - ID của lịch hẹn
 * @returns {Promise<boolean>} - true nếu thành công, false nếu thất bại
 */
export const sendEmailNotification = async (type, appointmentId) => {
  try {
    console.log(`📧 Đang gửi email ${type} cho lịch hẹn:`, appointmentId);

    const response = await fetch(`${API_BASE_URL}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: type,
        appointmentId: appointmentId
      })
    });

    // Kiểm tra response
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      showSuccess(data.message || 'Đã gửi email thông báo thành công!');
      console.log('✅ Gửi email thành công:', data.message);
      return true;
    } else {
      showError(data.message || 'Gửi email thất bại');
      console.error('❌ Gửi email thất bại:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi kết nối khi gửi email:', error);
    showError('Lỗi kết nối khi gửi email. Vui lòng thử lại sau.');
    return false;
  }
};

/**
 * 🔹 Gửi email xác nhận đặt lịch
 * @param {number} appointmentId - ID của lịch hẹn
 * @returns {Promise<boolean>}
 */
export const sendConfirmationEmail = async (appointmentId) => {
  return await sendEmailNotification('confirmation', appointmentId);
};

/**
 * 🔹 Gửi email cập nhật trạng thái
 * @param {number} appointmentId - ID của lịch hẹn
 * @returns {Promise<boolean>}
 */
export const sendStatusUpdateEmail = async (appointmentId) => {
  return await sendEmailNotification('status_update', appointmentId);
};

/**
 * 🔹 Gửi email nhắc lịch
 * @param {number} appointmentId - ID của lịch hẹn
 * @returns {Promise<boolean>}
 */
export const sendReminderEmail = async (appointmentId) => {
  return await sendEmailNotification('reminder', appointmentId);
};

/**
 * 🔹 Gửi email hủy lịch
 * @param {number} appointmentId - ID của lịch hẹn
 * @returns {Promise<boolean>}
 */
export const sendCancellationEmail = async (appointmentId) => {
  return await sendEmailNotification('cancellation', appointmentId);
};

/**
 * 🔹 Test gửi email (dành cho development)
 * @param {number} appointmentId - ID của lịch hẹn
 * @returns {Promise<boolean>}
 */
export const testEmail = async (appointmentId = 1) => {
  try {
    console.log('🧪 Đang test gửi email với appointmentId:', appointmentId);

    const response = await fetch(`${API_BASE_URL}/email/test/${appointmentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      showSuccess('Test email thành công!');
      console.log('✅ Test email thành công');
      return true;
    } else {
      showError('Test email thất bại');
      console.error('❌ Test email thất bại:', data.message);
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi test email:', error);
    showError('Lỗi kết nối khi test email');
    return false;
  }
};

/**
 * 🔹 Gửi email trực tiếp qua GET endpoint (backup)
 * @param {string} type - Loại email
 * @param {number} appointmentId - ID của lịch hẹn
 * @returns {Promise<boolean>}
 */
export const sendEmailDirect = async (type, appointmentId) => {
  try {
    let endpoint = '';
    
    switch (type) {
      case 'confirmation':
        endpoint = `send-confirmation/${appointmentId}`;
        break;
      case 'status_update':
        endpoint = `send-status-update/${appointmentId}`;
        break;
      case 'reminder':
        endpoint = `send-reminder/${appointmentId}`;
        break;
      case 'cancellation':
        endpoint = `send-cancellation/${appointmentId}`;
        break;
      default:
        throw new Error('Loại email không hợp lệ');
    }

    const response = await fetch(`${API_BASE_URL}/email/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'success') {
      showSuccess(data.message || 'Đã gửi email thành công!');
      return true;
    } else {
      showError(data.message || 'Gửi email thất bại');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi gửi email trực tiếp:', error);
    showError('Lỗi kết nối khi gửi email');
    return false;
  }
};

/**
 * 🔹 Kiểm tra kết nối API email
 * @returns {Promise<boolean>}
 */
export const checkEmailService = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/email/test/1`);
    return response.ok;
  } catch (error) {
    console.error('❌ Email service không khả dụng:', error);
    return false;
  }
};

export default {
  sendEmailNotification,
  sendConfirmationEmail,
  sendStatusUpdateEmail,
  sendReminderEmail,
  sendCancellationEmail,
  testEmail,
  sendEmailDirect,
  checkEmailService
};