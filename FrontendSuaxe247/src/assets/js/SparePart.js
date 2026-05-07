// assets/js/SparePart.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "../../hooks/useDebounce";

const emptySparePartDTO = {
    PK_idSparePart: "",
    sparePartName: "",
    unit: "",
    purchasePrice: "",
    salePrice: "",
    description: "",
    FK_idCategory: ""
};

const SPARE_PART_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/spare-part";
const CATEGORY_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/category";
const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";
const MINIMUM_LOAD_TIME = 300;

const normalizeWhitespace = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
};

export function useSparePart() {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const debouncedSearchTerm = useDebounce(inputValue, 500);
    const [modalState, setModalState] = useState(null);
    const [selectedSparePart, setSelectedSparePart] = useState(null);
    const [formValues, setFormValues] = useState(emptySparePartDTO);
    const [formErrors, setFormErrors] = useState({});
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const canManage = userRole === "Admin" || userRole === "Quản lý hệ thống";
    const canView = canManage || userRole === "Quản lý cửa hàng" || userRole === "Kỹ thuật viên";

    const [isTableLoading, setIsTableLoading] = useState(false);
    const searchInputRef = useRef(null);
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

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${CATEGORY_API_URL}?limit=1000`, { credentials: "include" });
            const result = await response.json();
            if (result.status === "success") {
                setCategories(result.data || []);
            }
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
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
            const response = await fetch(`${SPARE_PART_API_URL}?${params.toString()}`, { credentials: "include" });
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
    }, [page, perPage, debouncedSearchTerm, canView, loading]);

    useEffect(() => { fetchSession(); fetchCategories(); }, [fetchSession, fetchCategories]);
    useEffect(() => { if (!isAuthLoading) fetchData(); }, [isAuthLoading, fetchData]);
    useEffect(() => { setPage(1); }, [debouncedSearchTerm, perPage]);

    useEffect(() => {
        if (wasTableLoadingRef.current && !isTableLoading) {
            if (debouncedSearchTerm && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }
        wasTableLoadingRef.current = isTableLoading;
    }, [isTableLoading, debouncedSearchTerm]);

    const openModal = (state, sparePart = null) => {
        setModalState(state);
        setFormErrors({});
        setSelectedSparePart(sparePart);
        setFormValues(sparePart ? sparePart : emptySparePartDTO);
    };

    const closeModal = () => setModalState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = (values) => {
        const errors = {};

        // Mã
        if (!values.PK_idSparePart?.trim()) {
            errors.PK_idSparePart = "Mã phụ tùng không được để trống.";
        }

        // Tên
        if (!values.sparePartName?.trim()) {
            errors.sparePartName = "Tên phụ tùng không được để trống.";
        }

        // Đơn vị
        if (!values.unit?.trim()) {
            errors.unit = "Đơn vị tính không được để trống.";
        }

        const purchasePriceValue = parseInt(String(values.purchasePrice || '').trim(), 10);
        if (!values.purchasePrice?.toString().trim()) {
            errors.purchasePrice = "Giá mua không được để trống.";
        } else if (isNaN(purchasePriceValue) || purchasePriceValue <= 0) {
            errors.purchasePrice = "Giá mua phải là số nguyên dương hợp lệ (lớn hơn 0, không chứa ký tự đặc biệt).";
        }

        // Giá bán
        const salePriceValue = parseInt(String(values.salePrice || '').trim(), 10);
        if (!values.salePrice?.toString().trim()) {
            errors.salePrice = "Giá bán không được để trống.";
        } else if (isNaN(salePriceValue) || salePriceValue <= 0) {
            errors.salePrice = "Giá bán phải là số nguyên dương hợp lệ (lớn hơn 0, không chứa ký tự đặc biệt).";
        } else if (salePriceValue < purchasePriceValue) {
            errors.salePrice = "Giá bán không được nhỏ hơn giá mua.";
        }

        // Danh mục
        if (!values.FK_idCategory) {
            errors.FK_idCategory = "Vui lòng chọn danh mục.";
        }

        return errors;
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
            console.log(body); 
            if (res.ok) {
                window.Toast?.fire({ icon: 'success', title: successMessage });
                fetchData();
                closeModal();
            } else {
                const errorMessage = result.messages?.error || 'Thao tác thất bại';
                if ((res.status === 422 || res.status === 409) && typeof result.messages === 'object') {
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = validateForm(formValues);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return; 
        }

        const cleanedFormValues = Object.fromEntries(
            Object.entries(formValues).map(([key, value]) => [key, normalizeWhitespace(value)])
        );

        // const finalBody = {
        //     ...cleanedFormValues,
        //     purchasePrice: parseInt(String(cleanedFormValues.purchasePrice).replace(/\D/g, ''), 10) || 0,
        //     salePrice: parseInt(String(cleanedFormValues.salePrice).replace(/\D/g, ''), 10) || 0,
        // };
        const finalBody = {
            ...cleanedFormValues,
            purchasePrice: parseInt(cleanedFormValues.purchasePrice, 10),
            salePrice: parseInt(cleanedFormValues.salePrice, 10),
        };

        const url =
            modalState === "create"
                ? SPARE_PART_API_URL
                : `${SPARE_PART_API_URL}/${selectedSparePart.PK_idSparePart}`;
        const method = modalState === "create" ? "POST" : "PUT";
        const message = modalState === "create" ? "Thêm thành công!" : "Cập nhật thành công!";

        handleCrud(method, url, message, finalBody, { credentials: "include" });
    };

    const confirmDelete = () => {
        if (!selectedSparePart) return;
        handleCrud(
            'DELETE',
            `${SPARE_PART_API_URL}/${selectedSparePart.PK_idSparePart}`,
            'Xóa thành công!',
            null,
            { credentials: "include" }
        );
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
        inputValue, setInputValue, categories,
        openModal, closeModal, handleFormChange,
        handleSubmit, confirmDelete, getPageNumbers, handlePageChange,
        isTableLoading,
        searchInputRef
    };
}