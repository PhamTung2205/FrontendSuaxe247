// assets/js/SparePartCategory.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "../../hooks/useDebounce";

const emptyCategoryDTO = {
    PK_idCategory: "",
    categoryName: "",
    description: "",
};

const getLimitFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const limit = parseInt(params.get("limit"));
    return limit && limit > 0 ? limit : 10;
};

const API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/category";
const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";
const MINIMUM_LOAD_TIME = 300;

const normalizeWhitespace = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' ');
};

export function useSparePartCategory() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(getLimitFromUrl());
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const debouncedSearchTerm = useDebounce(inputValue, 500);
    const [modalState, setModalState] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formValues, setFormValues] = useState(emptyCategoryDTO);
    const [formErrors, setFormErrors] = useState({});
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const canManage = userRole === "Admin" || userRole === "Quản lý hệ thống";
    const canView = canManage || userRole === "Quản lý cửa hàng";
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
            const response = await fetch(`${API_URL}?${params.toString()}`, { credentials: "include" });
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

    useEffect(() => { fetchSession(); }, [fetchSession]);
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

    const openModal = (state, category = null) => {
        setModalState(state);
        setFormErrors({});
        setSelectedCategory(category);
        setFormValues(category ? category : emptyCategoryDTO);
    };

    const closeModal = () => setModalState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        const errors = {};
        const cleanedId = normalizeWhitespace(formValues.PK_idCategory);
        const cleanedName = normalizeWhitespace(formValues.categoryName);

        if (modalState === 'create' && !cleanedId) {
            errors.PK_idCategory = "Mã danh mục không được để trống.";
        } else if (modalState === 'create' && !/^[a-zA-Z0-9]+$/.test(cleanedId)) {
            errors.PK_idCategory = "Mã danh mục chỉ được chứa chữ và số.";
        }

        if (!cleanedName) {
            errors.categoryName = "Tên danh mục không được để trống.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
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
                const apiErrorMessage = result.messages?.error || 'Thao tác thất bại'; 

                if ((res.status === 422 || res.status === 409) && result.messages) {
                    setFormErrors(result.messages);

                    const toastMessage = apiErrorMessage.trim() ? apiErrorMessage : 'Dữ liệu không hợp lệ!';
                    window.Toast?.fire({ icon: 'error', title: toastMessage });
                } else {
                    window.Toast?.fire({ icon: 'error', title: apiErrorMessage });
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
        if (!validateForm()) {
            window.Toast?.fire({ icon: 'error', title: 'Dữ liệu không hợp lệ!' });
            return;
        }

        const cleanedFormValues = {
            PK_idCategory: normalizeWhitespace(formValues.PK_idCategory),
            categoryName: normalizeWhitespace(formValues.categoryName),
            description: normalizeWhitespace(formValues.description)
        };

        const url = modalState === 'create'
            ? API_URL
            : `${API_URL}/${selectedCategory.PK_idCategory}`;
        const method = modalState === 'create' ? 'POST' : 'PUT';
        const message = modalState === 'create' ? 'Thêm thành công!' : 'Cập nhật thành công!';
        handleCrud(method, url, message, cleanedFormValues);
    };

    const confirmDelete = () => {
        if (!selectedCategory) return;
        handleCrud('DELETE', `${API_URL}/${selectedCategory.PK_idCategory}`, 'Xóa thành công!');
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
        handleSubmit, confirmDelete, getPageNumbers, handlePageChange,
        isTableLoading,
        searchInputRef
    };
}