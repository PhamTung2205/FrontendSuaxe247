// assets/js/Supplier.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "../../hooks/useDebounce";

const emptySupplierDTO = {
    PK_idSupplier: "",
    supplierName: "",
    address: "",
    email: "",
    phone: "",
};

const getLimitFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const limit = parseInt(params.get('limit'));
    return (limit && limit > 0) ? limit : 10;
};

const API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/supplier";
const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";
const MINIMUM_LOAD_TIME = 300;

export function useSupplier() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(getLimitFromUrl());
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const debouncedSearchTerm = useDebounce(inputValue, 500);
    const [modalState, setModalState] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [formValues, setFormValues] = useState(emptySupplierDTO);
    const [formErrors, setFormErrors] = useState({});
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const canManage = userRole === "Admin" || userRole === "Quản lý hệ thống";
    const canView = canManage || userRole === "Quản lý cửa hàng";

    const searchInputRef = useRef(null);
    // Ref để theo dõi trạng thái loading trước đó, phục vụ cho việc focus
    const wasTableLoadingRef = useRef(false);

    const fetchSession = useCallback(async () => {
        setIsAuthLoading(true);
        try {
            const res = await fetch(SESSION_API_URL, { credentials: "include" });
            const result = await res.json();
            setUserRole(result.status === "success" ? result.user.roleName : null);
        } catch (err) {
            setUserRole(null);
        } finally {
            setIsAuthLoading(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!canView) { setLoading(false); return; }

        setIsTableLoading(true);
        if (!loading) setError(null);

        const startTime = Date.now();
        try {
            const params = new URLSearchParams({ page, limit: perPage });
            if (debouncedSearchTerm.trim()) {
                params.append("search", debouncedSearchTerm.trim());
            }
            const response = await fetch(`${API_URL}?${params.toString()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const result = await response.json();

            if (result.status === "success") {
                setData(result.data || []);
                setTotal(result.total || 0);
            } else {
                throw new Error(result.messages?.error || "Lấy dữ liệu thất bại");
            }
        } catch (err) {
            setError(err);
            setData([]);
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = MINIMUM_LOAD_TIME - elapsedTime;
            setTimeout(() => {
                setLoading(false);
                setIsTableLoading(false);
            }, remainingTime > 0 ? remainingTime : 0);
        }
    }, [page, perPage, debouncedSearchTerm, canView]);

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    useEffect(() => {
        if (!isAuthLoading) {
            fetchData();
        }
    }, [isAuthLoading, fetchData]);

    // useEffect chuyên dụng để xử lý focus sau khi tìm kiếm
    useEffect(() => {
        if (wasTableLoadingRef.current && !isTableLoading) {
            if (debouncedSearchTerm && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }
        wasTableLoadingRef.current = isTableLoading;
    }, [isTableLoading, debouncedSearchTerm]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, perPage]);

    const openModal = (state, supplier = null) => {
        setModalState(state);
        setFormErrors({});
        if (supplier) {
            setSelectedSupplier(supplier);
            setFormValues(supplier);
        } else {
            setSelectedSupplier(null);
            setFormValues(emptySupplierDTO);
        }
    };

    const closeModal = () => setModalState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleCrud = async (method, url, successMessage, body = null) => {
        setIsSubmitting(true);
        setFormErrors({});
        try {
            const options = {
                method,
                headers: method !== 'DELETE' ? { 'Content-Type': 'application/json' } : {},
                body: body ? JSON.stringify(body) : null,
            };
            const res = await fetch(url, options);
            const result = await res.json();
            if (res.ok) {
                window.Toast?.fire({ icon: 'success', title: successMessage });
                fetchData();
                closeModal();
            } else {
                const errorMessage = result.messages.error || 'Thao tác thất bại';
                if (res.status === 422 && result.messages) {
                    setFormErrors(result.messages);
                    window.Toast?.fire({ icon: 'error', title: 'Dữ liệu không hợp lệ!' });
                } else {
                    window.Toast?.fire({ icon: 'error', title: errorMessage });
                }
            }
        } catch (err) {
            window.Toast?.fire({ icon: 'error', title: 'Không thể kết nối đến máy chủ.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        const { supplierName, address, email, phone, PK_idSupplier } = formValues;
        const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!supplierName.trim()) errors.supplierName = "Tên nhà cung cấp không được để trống.";
        if (!address.trim()) errors.address = "Địa chỉ không được để trống.";
        if (!phone.trim()) {
            errors.phone = "Số điện thoại không được để trống.";
        } else if (!phoneRegex.test(phone)) {
            errors.phone = "Số điện thoại không đúng định dạng.";
        }
        if (email.trim() && !emailRegex.test(email)) errors.email = "Địa chỉ email không hợp lệ.";
        if (modalState === 'create' && !PK_idSupplier.trim()) errors.PK_idSupplier = "Mã nhà cung cấp không được để trống.";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            window.Toast?.fire({ icon: 'error', title: 'Dữ liệu không hợp lệ!' });
            return;
        }
        const url = modalState === 'create'
            ? API_URL
            : `${API_URL}/${selectedSupplier.PK_idSupplier}`;
        const method = modalState === 'create' ? 'POST' : 'PUT';
        const message = modalState === 'create' ? 'Thêm thành công!' : 'Cập nhật thành công!';
        handleCrud(method, url, message, formValues);
    };

    const confirmDelete = () => {
        if (!selectedSupplier) return;
        handleCrud('DELETE', `${API_URL}/${selectedSupplier.PK_idSupplier}`, 'Xóa thành công!');
    };

    const getPageNumbers = () => {
        const totalPages = Math.ceil(total / perPage);
        if (totalPages < 1) return [];
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > 3) pages.push("...");
            const start = Math.max(2, page - 1);
            const end = Math.min(totalPages - 1, page + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const handlePageChange = (newPage) => {
        const totalPages = Math.ceil(total / perPage);
        if (newPage > 0 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
        }
    };

    return {
        data, loading, error, isAuthLoading, page, perPage, setPerPage, total,
        canManage, canView, modalState, formValues, formErrors, isSubmitting,
        inputValue, setInputValue,
        openModal, closeModal, handleFormChange,
        handleSubmit, confirmDelete, getPageNumbers,
        handlePageChange,
        isTableLoading,
        searchInputRef,
    };
}