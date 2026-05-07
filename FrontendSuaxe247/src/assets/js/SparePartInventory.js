// assets/js/SparePartInventory.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "../../hooks/useDebounce";

const emptySparePartDTO = {
    PK_idSparePart: "",
    FK_idStore: "",
    storeAddress: "",
    FK_idCategory: "",
    sparePartName: "",
    unit: "",
    stockQty: "",
    warningQty: 10,
    location: "",
    purchasePrice: "",
    salePrice: "",
    description: "",
};

const API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/spare-part-inventory";
const CATEGORY_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/category";
const STORES_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store";
const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";

export function useSparePartInventory() {
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userStoreId, setUserStoreId] = useState(null);

    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("all");
    const [selectedStoreFilterId, setSelectedStoreFilterId] = useState("");
    const debouncedSearchTerm = useDebounce(inputValue, 500);
    const [modalState, setModalState] = useState(null);
    const [selectedSparePart, setSelectedSparePart] = useState(null);
    const [formValues, setFormValues] = useState(emptySparePartDTO);
    const [formErrors, setFormErrors] = useState({});

    const searchInputRef = useRef(null);

    const canView = ["Admin", "Quản lý hệ thống", "Quản lý cửa hàng", "Kỹ thuật viên"].includes(userRole);
    const showStoreFilter = ["Admin", "Quản lý hệ thống"].includes(userRole);

    const initialize = useCallback(async () => {
        setIsAuthLoading(true);
        try {
            const [sessionRes, catRes, storeRes] = await Promise.all([
                fetch(SESSION_API_URL, { credentials: "include" }),
                fetch(CATEGORY_API_URL, { credentials: "include" }),
                fetch(STORES_API_URL, { credentials: "include" }),
            ]);

            const [sessionResult, catResult, storeResult] = await Promise.all([
                sessionRes.json(),
                catRes.json(),
                storeRes.json(),
            ]);

            if (catResult.status === "success") setCategories(catResult.data || []);
            const storeList = storeResult.status === "success" ? storeResult.data || [] : [];
            setStores(storeList);

            if (sessionResult.status === "success" && sessionResult.user) {
                const user = sessionResult.user;
                setUserId(user.PK_idUser || user.user_id);
                setUserRole(user.roleName);
                setUserStoreId(user.FK_idStore || user.store);

                if (["Admin", "Quản lý hệ thống"].includes(user.roleName)) {
                    setSelectedStoreFilterId(storeList.length > 0 ? storeList[0].PK_idStore : "");
                } else {
                    setSelectedStoreFilterId(user.FK_idStore || user.store);
                }
            } else {
                throw new Error("Phiên đăng nhập không hợp lệ.");
            }
        } catch (err) {
            console.error("Lỗi khởi tạo:", err);
            setError(err);
        } finally {
            setIsAuthLoading(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!userId || !selectedStoreFilterId) return;

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                user_id: userId,
                page,
                limit: perPage,
                store_id: selectedStoreFilterId,
            });
            if (selectedCategoryId !== "all") params.append("category", selectedCategoryId);
            if (debouncedSearchTerm.trim()) params.append("search", debouncedSearchTerm.trim());

            const res = await fetch(`${API_URL}?${params.toString()}`, { credentials: "include" });
            const result = await res.json();

            if (result.status === "success") {
                setData(result.data || []);
                setTotal(result.total || 0);
            } else throw new Error(result.message || "Lấy dữ liệu thất bại");
        } catch (err) {
            setError(err);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [userId, page, perPage, debouncedSearchTerm, selectedCategoryId, selectedStoreFilterId]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!isAuthLoading && canView) fetchData();
    }, [isAuthLoading, canView, fetchData]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearchTerm, selectedCategoryId, selectedStoreFilterId, perPage]);

    useEffect(() => {
        if (searchInputRef.current) searchInputRef.current.focus();
    }, [isAuthLoading]);

    const openModal = (state, item = null) => {
        setModalState(state);
        setFormErrors({});
        if (item) {
            setSelectedSparePart(item);
            setFormValues({ ...emptySparePartDTO, ...item });
        } else {
            setSelectedSparePart(null);
            setFormValues(emptySparePartDTO);
        }
    };
    const closeModal = () => setModalState(null);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" })); 
    };

    const validateForm = (values) => {
        const errors = {};

        const stockQty = Number(values.stockQty);

        if (isNaN(stockQty) || !Number.isInteger(stockQty) || stockQty <= 0) {
            errors.stockQty = "Số lượng tồn kho phải lớn hơn 0.";
        }

        if (values.location && values.location.length > 100) {
            errors.location = "Vị trí không được vượt quá 100 ký tự.";
        }
        return errors;
    };

    const handleCrud = async (method, url, successMessage, body = null) => {
        setIsSubmitting(true);
        try {
            const options = {
                method,
                headers: { "Content-Type": "application/json" },
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
                    const toastMessage = res.status === 409 ? apiErrorMessage : 'Dữ liệu không hợp lệ!';
                    window.Toast?.fire({ icon: 'error', title: toastMessage });
                } else {
                    window.Toast?.fire({ icon: 'error', title: apiErrorMessage });
                }
            }
        } catch (err) {
            window.Toast?.fire({ icon: "error", title: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errors = validateForm(formValues); 
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        if (modalState === "edit" && selectedSparePart) {
            handleCrud(
                "PUT",
                `${API_URL}/${selectedSparePart.PK_idSparePart}`,
                "Cập nhật thành công!",
                {
                    FK_idStore: selectedSparePart.FK_idStore,
                    stockQty: parseInt(formValues.stockQty, 10), 
                    location: formValues.location?.trim() || "",
                }
            );
        }
    };

    const getCategoryName = (id) =>
        categories.find((c) => c.PK_idCategory === id)?.categoryName || "N/A";

    const getPageNumbers = () => {
        const totalPages = Math.ceil(total / perPage);
        if (totalPages < 1) return [];
        const pages = [];
        const range = 2;
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (page > range + 1) pages.push("...");
            const start = Math.max(2, page - range);
            const end = Math.min(totalPages - 1, page + range);
            for (let i = start; i <= end; i++) pages.push(i);
            if (page < totalPages - range) pages.push("...");
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
        data,
        categories,
        stores,
        loading,
        error,
        isAuthLoading,
        page,
        perPage,
        total,
        canView,
        showStoreFilter,
        userRole,
        userStoreId,
        modalState,
        formValues,
        formErrors,
        isSubmitting,
        inputValue,
        setInputValue,
        selectedCategoryId,
        setSelectedCategoryId,
        selectedStoreFilterId,
        setSelectedStoreFilterId,
        openModal,
        closeModal,
        handleFormChange,
        handleSubmit,
        getCategoryName,
        getPageNumbers,
        handlePageChange,
        searchInputRef,
    };
}