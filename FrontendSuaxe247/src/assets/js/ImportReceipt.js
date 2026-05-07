// assets/js/ImportReceipt.js

import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "../../hooks/useDebounce";

const API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/import-receipt";
const STORES_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/store";
const SUPPLIERS_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/supplier";
const STORE_SPAREPARTS_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/spare-part/by-store";
const SESSION_API_URL = "http://localhost/Suaxe247Backend/BackendSuaxe247/public/api/user/session";

const MINIMUM_LOAD_TIME = 300;

const getInitialFormDTO = () => ({
    storeId: "",
    supplierId: "",
    userId: "",
    deliveryReceipt: "",
    details: [{ sparePartId: "", requestedQty: "", importedQty: "", importPrice: ""}],
});

const getLimitFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const limit = parseInt(params.get('limit'));
    return (limit && limit > 0) ? limit : 10;
};

export function useImportReceipt() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({}); 
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(getLimitFromUrl()); 
    const [total, setTotal] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const debouncedSearchTerm = useDebounce(inputValue, 500);
    const [modalState, setModalState] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [formValues, setFormValues] = useState(getInitialFormDTO());
    const [stores, setStores] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [spareParts, setSpareParts] = useState([]);
    const [filters, setFilters] = useState({ startDate: "", endDate: "", selectedStore: "" });
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const [storeId, setStoreId] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null); 

    const [isTableLoading, setIsTableLoading] = useState(false);
    const searchInputRef = useRef(null);
    const wasTableLoadingRef = useRef(false);

    const isStoreUser = userRole === "Quản lý cửa hàng" || userRole === "Kỹ thuật viên";
    const isSystemManager = userRole === "Quản lý hệ thống";

    const canManage = userRole === "Admin" || userRole === "Quản lý cửa hàng";

    const canView = canManage || isStoreUser || userRole === "Quản lý hệ thống";

    const fetchSession = useCallback(async () => {
        setIsAuthLoading(true);
        try {
            const res = await fetch(SESSION_API_URL, { credentials: "include" });
            const result = await res.json();
            if (result.status === "success") {
                setUserRole(result.user.roleName);
                setCurrentUserId(result.user.user_id);
                setStoreId(result.user.store || result.user.FK_idStore || null);
            } else {
                setUserRole(null); setStoreId(null); setCurrentUserId(null);
            }
        } catch {
            setUserRole(null); setStoreId(null); setCurrentUserId(null);
        } finally {
            setIsAuthLoading(false);
        }
    }, []);

    const fetchMetadata = useCallback(async (currentStoreId) => {
        if (!currentStoreId) return;
        try {
            const [supplierRes, sparePartRes] = await Promise.all([
                suppliers.length === 0 ? fetch(SUPPLIERS_API_URL, { credentials: "include" }) : Promise.resolve(null),
                fetch(`${STORE_SPAREPARTS_API_URL}/${currentStoreId}`, { credentials: "include" })
            ]);
            if (supplierRes) {
                const supplierResult = await supplierRes.json();
                if (supplierResult.status === "success") setSuppliers(supplierResult.data || []);
            }
            const sparePartResult = await sparePartRes.json();
            if (sparePartResult.status === "success") {
                setSpareParts(sparePartResult.data || []);
            } else {
                setSpareParts([]);
            }
        } catch (err) {
            console.error("Lỗi khi tải metadata:", err);
        }
    }, [suppliers.length]);

    const fetchAllStores = useCallback(async () => {
        if (stores.length > 0) return;
        try {
            const storeRes = await fetch(STORES_API_URL, { credentials: "include" });
            const storeResult = await storeRes.json();
            if (storeResult.status === "success") setStores(storeResult.data || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách cửa hàng:", err);
        }
    }, [stores.length]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPage(1);
    };

    const fetchData = useCallback(async () => {
        if (!canView) { setLoading(false); return; }

        setIsTableLoading(true);
        if (!loading) setError(null);

        const startTime = Date.now();
        try {
            const params = new URLSearchParams({
                page,
                limit: perPage,
                search: debouncedSearchTerm,
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
            if (storeId && isStoreUser) {
                params.append("storeId", storeId);
            }
            else if (isSystemManager && filters.selectedStore) {
                params.append("storeId", filters.selectedStore);
            }
            const res = await fetch(`${API_URL}?${params.toString()}`, { credentials: "include" });
            const result = await res.json();
            console.log(result);
            if (result.status === "success") {
                setData(result.data || []);
                setTotal(result.total || 0);
            } else {
                throw new Error(result.message || "Lấy dữ liệu thất bại");
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
    }, [page, perPage, debouncedSearchTerm, canView, storeId, isStoreUser, isSystemManager, filters, loading]);

    useEffect(() => { fetchSession(); fetchAllStores(); }, [fetchSession, fetchAllStores]);
    useEffect(() => {
        if (!isAuthLoading) {
            if (canView) {
                fetchData();
                if (storeId) fetchMetadata(storeId);
            } else {
                setLoading(false);
                setData([]);
            }
        }
    }, [isAuthLoading, canView, fetchData, fetchMetadata, storeId]);
    useEffect(() => setPage(1), [debouncedSearchTerm, perPage, filters]);

    useEffect(() => {
        if (wasTableLoadingRef.current && !isTableLoading) {
            if (debouncedSearchTerm && searchInputRef.current) {
                searchInputRef.current.focus();
            }
        }
        wasTableLoadingRef.current = isTableLoading;
    }, [isTableLoading, debouncedSearchTerm]);

    const getPageNumbers = useCallback(() => {
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
    }, [total, perPage, page]);

    const handlePageChange = useCallback((newPage) => {
        const totalPages = Math.ceil(total / perPage);
        if (newPage > 0 && newPage <= totalPages && newPage !== page) {
            setPage(newPage);
        }
    }, [total, perPage, page]);

    const openModal = async (state, data = null) => {
        setModalState(state);
        setFormErrors({});
        if (state === "create") {
            const initialValues = getInitialFormDTO();
            initialValues.storeId = storeId || "";
            initialValues.userId = currentUserId || "";
            setFormValues(initialValues);
        } else if (state === "edit" && data) {
            setIsSubmitting(true);
            try {
                const res = await fetch(`${API_URL}/${data.PK_idImport}`, { credentials: "include" });
                const result = await res.json();
                if (result.status === "success") {
                    setFormValues({
                        storeId: result.data.main.FK_idStore,
                        supplierId: result.data.main.FK_idSupplier,
                        userId: result.data.main.FK_idCreatedBy,
                        deliveryReceipt: result.data.main.deliveryReceipt || '',
                        details: result.data.details.map(d => ({
                            sparePartId: d.PK_idSparePart,
                            requestedQty: d.requestedQty,
                            importedQty: d.importedQty,
                            importPrice: d.importPrice,
                        }))
                    });
                    setSelectedReceipt(result.data);
                    setModalState("edit");
                } else {
                    throw new Error(result.message);
                }
            } catch (err) {
                window.Toast?.fire({ icon: "error", title: `Lỗi khi tải dữ liệu: ${err.message}` });
                closeModal();
            } finally {
                setIsSubmitting(false);
            }
        } else if (state === "view" && data) {
            setIsSubmitting(true);
            try {
                const res = await fetch(`${API_URL}/${data}`, { credentials: "include" }); 
                const result = await res.json();
                console.log(result);
                if (result.status === "success") setSelectedReceipt(result.data);
                else throw new Error(result.message);
            } catch (err) {
                window.Toast?.fire({ icon: "error", title: err.message });
            } finally {
                setIsSubmitting(false);
            }
        } else if (state === "delete" && data) {
            setSelectedReceipt(data);
        }
    };

    const closeModal = () => {
        setModalState(null);
        setSelectedReceipt(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null })); 
    };

    const handleDetailChange = (index, e) => {
        const { name, value } = e.target;
        const newDetails = [...formValues.details];

        if (name === 'sparePartId') {
            const selectedPart = spareParts.find(sp => sp.PK_idSparePart === value);
            newDetails[index][name] = value;
            newDetails[index]['importPrice'] = selectedPart ? selectedPart.purchasePrice : "";
        }
        else if (name === 'requestedQty') {
            const numValue = parseInt(value);
            const sanitizedValue = (isNaN(numValue) || value === '') ? '' : Math.max(1, numValue);
            newDetails[index].requestedQty = sanitizedValue;
            newDetails[index].importedQty = sanitizedValue;
        }
        else if (name === 'importedQty') {
            const numValue = parseInt(value);
            newDetails[index][name] = (isNaN(numValue) || value === '') ? '' : Math.max(1, numValue);
        }
        else {
            newDetails[index][name] = value;
        }

        setFormValues((prev) => ({ ...prev, details: newDetails }));

        if (formErrors.details?.[index]?.[name]) {
            setFormErrors(prev => {
                const newDetailErrors = [...(prev.details || [])];
                if (newDetailErrors[index]) {
                    newDetailErrors[index][name] = null;
                }
                return { ...prev, details: newDetailErrors };
            });
        }
    };

    const addDetailRow = () => {
        setFormValues((prev) => ({
            ...prev,
            details: [...prev.details, { sparePartId: "", requestedQty: "", importedQty: "", importPrice: "" }],
        }));
    };

    const removeDetailRow = (index) => {
        if (formValues.details.length <= 1) return;
        const newDetails = formValues.details.filter((_, i) => i !== index);
        setFormValues((prev) => ({ ...prev, details: newDetails }));
    };

    const confirmDelete = async () => {
        if (!selectedReceipt) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/${selectedReceipt.PK_idImport}`, {
                method: "DELETE",
                credentials: "include",
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.messages?.error || "Xóa phiếu thất bại");

            window.Toast?.fire({ icon: "success", title: result.message || "Xóa thành công!" });
            fetchData();
        } catch (err) {
            window.Toast?.fire({ icon: "error", title: err.message });
        } finally {
            setIsSubmitting(false);
            closeModal();
        }
    };

    const validateForm = (values) => {
        const errors = { details: [] };

        if (!values.supplierId) {
            errors.supplierId = "Vui lòng chọn nhà cung cấp.";
        }

        values.details.forEach((detail, index) => {
            const detailErrors = {};

            if (!detail.sparePartId) {
                detailErrors.sparePartId = "Vui lòng chọn phụ tùng.";
            }

            const reqQty = Number(detail.requestedQty);
            if (isNaN(reqQty) || !Number.isInteger(reqQty) || reqQty <= 0) {
                detailErrors.requestedQty = "Số lượng phải là số nguyên lớn hơn 0.";
            }

            const impQty = Number(detail.importedQty);
            if (isNaN(impQty) || !Number.isInteger(impQty) || impQty <= 0) {
                detailErrors.importedQty = "Số lượng phải là số nguyên lớn hơn 0.";
            }

            if (Object.keys(detailErrors).length > 0) {
                errors.details[index] = detailErrors;
            } else {
                errors.details[index] = null;
            }
        });

        const hasMainErrors = Object.keys(errors).length > 1;
        const hasDetailErrors = errors.details.some(d => d !== null);

        if (!hasMainErrors && !hasDetailErrors) {
            return {};
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // const errors = validateForm(formValues);
        // setFormErrors(errors);
        // if (Object.keys(errors).length > 0) {
        //     window.Toast?.fire({ icon: 'error', title: 'Dữ liệu không hợp lệ!' });
        //     return;
        // }

        if (modalState === 'create') {
            const errors = validateForm(formValues);
            setFormErrors(errors);
            if (Object.keys(errors).length > 0) {
                window.Toast?.fire({ icon: 'error', title: 'Dữ liệu không hợp lệ!' });
                return;
            }
        }
        else if (modalState === 'edit') {
            const errors = {};
            if (!formValues.supplierId) {
                errors.supplierId = "Vui lòng chọn nhà cung cấp.";
            }
            if (!formValues.deliveryReceipt) {
                errors.deliveryReceipt = "Vui lòng nhập phiếu giao hàng.";
            }

            errors.details = [];

            setFormErrors(errors);
            if (Object.keys(errors).length > 1) {
                window.Toast?.fire({ icon: 'error', title: 'Dữ liệu không hợp lệ!' });
                return;
            }
        } else {
            return; 
        }
        setIsSubmitting(true);
        // try {
        //     const payload = {
        //         main: {
        //             FK_idStore: formValues.storeId, 
        //             FK_idSupplier: formValues.supplierId,
        //             FK_idCreatedBy: formValues.userId,
        //             deliveryReceipt: formValues.deliveryReceipt,
        //         },
        //         details: formValues.details.map(detail => ({
        //             sparePartId: detail.sparePartId,
        //             requestedQty: detail.requestedQty,
        //             importedQty: detail.importedQty,
        //             importPrice: detail.importPrice, 
        //         })),
        //     };

        //     const res = await fetch(API_URL, {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify(payload),
        //     });
        //     const result = await res.json();
        //     if (!res.ok) throw new Error(result.message || "Tạo phiếu thất bại");

        //     window.Toast?.fire({ icon: "success", title: result.message });
        //     setFormValues(getInitialFormDTO()); 
        //     closeModal();
        //     fetchData();
        // } catch (err) {
        //     window.Toast?.fire({ icon: "error", title: err.message });
        // } finally {
        //     setIsSubmitting(false);
        // }
        try {
            let res, payload, url, method;
            if (modalState === 'create') {
                url = API_URL;
                method = "POST";
                payload = {
                    main: {
                        FK_idStore: formValues.storeId, 
                        FK_idSupplier: formValues.supplierId,
                        FK_idCreatedBy: formValues.userId,
                        deliveryReceipt: formValues.deliveryReceipt,
                    },
                    details: formValues.details.map(detail => ({
                        sparePartId: detail.sparePartId,
                        requestedQty: detail.requestedQty,
                        importedQty: detail.importedQty,
                        importPrice: detail.importPrice, 
                    })),
                };
            } else { 
                url = `${API_URL}/${selectedReceipt.main.PK_idImport}`;
                method = "PUT";
                payload = {
                    FK_idSupplier: formValues.supplierId,
                    deliveryReceipt: formValues.deliveryReceipt,
                };
            }

            res = await fetch(url, {
                method: method,
                credentials: "include",
                headers: { 
                    "Content-Type": "application/json",
                    // "X-Requested-With": "XMLHttpRequest" 
                },
                body: JSON.stringify(payload),
            });
            
            const result = await res.json();
            
            if (res.status === 400 && result.messages) {
                setFormErrors(result.messages);
                throw new Error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
            }

            if (!res.ok) {
                throw new Error(result.message || result.messages?.error || "Thao tác thất bại");
            }
            
            window.Toast?.fire({ icon: "success", title: result.message });
            setFormValues(getInitialFormDTO()); 
            closeModal();
            fetchData(); 
        } catch (err) {
            window.Toast?.fire({ icon: "error", title: err.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExportReceipt = (main, details) => {
        if (!main || !details || details.length === 0) {
            window.Toast?.fire({ icon: "error", title: "Không có dữ liệu để xuất phiếu." });
            return;
        }

        const date = new Date(main.created);
        const receiptDate = `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;

        const safeNumber = (v) => {
            const n = Number(v);
            return isNaN(n) ? 0 : n;
        };

        const totalAmount = details.reduce((sum, item) => sum + (safeNumber(item.importedQty) * safeNumber(item.importPrice)), 0);

        const numberToVietnamese = (amount) => {
            const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
            const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

            amount = Math.floor(Math.abs(Number(amount)) || 0);
            if (amount === 0) return 'Không đồng.';

            const readThree = (num, isMostSignificantGroup) => {
                const hundred = Math.floor(num / 100);
                const ten = Math.floor((num % 100) / 10);
                const unit = num % 10;
                let parts = [];

                if (hundred > 0) {
                    parts.push(digits[hundred] + ' trăm');
                } else {
                    if (!isMostSignificantGroup && (ten > 0 || unit > 0)) {
                        parts.push('không trăm');
                    }
                }

                if (ten === 0) {
                    if (unit > 0) {
                        if (hundred > 0 || (!isMostSignificantGroup && (hundred === 0))) {
                            parts.push('linh ' + (unit === 5 ? 'lăm' : digits[unit])); // Đã sửa 'năm' -> 'lăm' để đồng bộ
                        } else {
                            parts.push(unit === 5 ? 'lăm' : digits[unit]);
                        }
                    }
                } else if (ten === 1) {
                    let sub = 'mười';
                    if (unit === 0) {
                    } else if (unit === 5) sub += ' lăm'; // Đã sửa 'năm' -> 'lăm'
                    else sub += ' ' + digits[unit];
                    parts.push(sub);
                } else {
                    let sub = digits[ten] + ' mươi';
                    if (unit === 0) {
                    } else if (unit === 1) sub += ' mốt';
                    else if (unit === 4) sub += ' tư'; // Đã sửa 'bốn' -> 'tư'
                    else if (unit === 5) sub += ' lăm'; // Đã sửa 'năm' -> 'lăm'
                    else sub += ' ' + digits[unit];
                    parts.push(sub);
                }

                return parts.join(' ').trim();
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
                const isMostSignificantGroup = (i === groups.length - 1);
                if (grp === 0 && !isMostSignificantGroup && i > 0) {
                    continue; // Bỏ qua nhóm 000 trừ khi là nhóm cuối cùng
                }
                const chunkText = readThree(grp, isMostSignificantGroup);
                const unit = units[i] ? ' ' + units[i] : '';
                
                if (chunkText) textParts.push((chunkText + unit).trim());
            }

            let final = textParts.join(' ').replace(/\s+/g, ' ').trim();
            final = final.charAt(0).toUpperCase() + final.slice(1);
            return final + ' đồng.';
        };


        const totalAmountText = numberToVietnamese(totalAmount);

        const totalImpQty = details.reduce((sum, item) => sum + parseInt(item.importedQty || 0), 0);
        const totalRegQty = details.reduce((sum, item) => sum + parseInt(item.requestedQty || 0), 0);
        let tableRows = details.map((item, index) => {
            const qty = safeNumber(item.importedQty);
            const req = safeNumber(item.requestedQty);
            const price = safeNumber(item.importPrice);
            const amount = qty * price;
            return `<tr>                
                        <td class="text-center align-middle">${index + 1}</td> 
                        <td class="align-middle">${item.sparePartName || ''}</td> 
                        <td class="text-center align-middle">${item.PK_idSparePart || ''}</td> 
                        <td class="text-center align-middle">${item.unit || ''}</td> 
                        <td class="text-right align-middle">${req.toLocaleString('vi-VN')}</td> 
                        <td class="text-right align-middle">${qty.toLocaleString('vi-VN')}</td> 
                        <td class="text-right align-middle">${price.toLocaleString('vi-VN')}</td> 
                        <td class="text-right align-middle">${amount.toLocaleString('vi-VN')}</td> 
                    </tr>`;
        }).join('');

        tableRows += `<tr class="font-weight-bold">
                        <td colspan="4" class="text-right">Tổng cộng</td>
                        <td class="text-right">${totalRegQty.toLocaleString('vi-VN')}</td> 
                        <td class="text-right">${totalImpQty.toLocaleString('vi-VN')}</td> 
                        <td class="text-right"></td> <td class="text-right">${totalAmount.toLocaleString('vi-VN')}</td> 
                    </tr>\n`;
        
        // Đường dẫn logo giả định.
        const logoFullPlaceholder = "../../../assets/logo-full.png"; 

        const printContent =
        `<!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <title>Phiếu Nhập Kho - ${main.PK_idImport}</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" />
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                    }
                    body { font-family: 'Times New Roman', Times, serif; font-size: 13px; }
                    .receipt-container { width: 100%; margin: 0 auto; padding: 0px; }
                    .header h2 { margin-top: 0; margin-bottom: 5px; font-size: 18px; }
                    .info-section p { margin: 3px 0; }
                    .table-title { font-size: 20px; font-weight: bold; margin: 15px 0; text-align: center; }
                    .details-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
                    .details-table th, .details-table td { border: 1px solid #000 !important; padding: 5px; text-align: left; }
                    .details-table th { background-color: #f8f9fa !important; text-align: center; }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .align-middle { vertical-align: middle !important; }
                    .signer-section { display: flex; justify-content: space-around; margin-top: 30px; }
                    .signer-col { width: 25%; text-align: center; }
                    .signer-col p { margin: 5px 0; font-weight: bold; }
                    .small-text { font-style: italic; font-weight: normal; font-size: 11px; }
                    .font-weight-bold { font-weight: bold; }
                    .logo-print { width: 200px; height: auto; }
                    
                    /* Cấu trúc header của mẫu phiếu nhập kho (Giữ nguyên từ code gốc nhưng tối ưu CSS cho Bootstrap) */
                    .details-table thead tr:first-child th { height: auto; } 

                </style>
            </head>
            <body>
                <div class="receipt-container p-3">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div class="header" style="text-align: left;">
                            <p><strong>Đơn vị:</strong> ${main.storeName || main.storeAddress || '................................'}</p>
                            <p><strong>Bộ phận:</strong> Kho</p>
                        </div>
                        <div style="text-align: right;">
                             <img src="${logoFullPlaceholder}" alt="Logo" class="logo-print"/>
                        </div>
                    </div>

                    <h2 class="table-title">PHIẾU NHẬP KHO</h2>
                    <p class="text-center" style="margin-bottom: 15px;">${receiptDate}</p>
                    <p style="text-align: center;">
                        <strong>Số:</strong> ${main.PK_idImport}
                    </p>

                    <div class="info-section">
                        <p><strong>- Họ và tên người giao:</strong> ${main.supplierName} (Nhà cung cấp)</p>
                        <p><strong>- Theo phiếu giao hàng mã:</strong> ${main.deliveryReceipt || '................................'}</p>
                        <p><strong>- Nhập tại kho:</strong> ${main.storeName || main.storeAddress}</p>
                    </div>

                    <table class="details-table">
                        <thead>
                            <tr>
                                <th style="width: 5%;" rowspan="2" class="align-middle">STT</th>
                                <th style="width: 30%;" rowspan="2" class="align-middle">Tên, nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ sản phẩm, hàng hóa</th>
                                <th style="width: 10%;" rowspan="2" class="align-middle">Mã Số</th> <th style="width: 10%;" rowspan="2" class="align-middle">ĐVT</th>
                                <th colspan="2" style="width: 25%;">Số lượng</th>
                                <th style="width: 10%;" rowspan="2" class="align-middle">Đơn giá</th>
                                <th style="width: 10%;" rowspan="2" class="align-middle">Thành tiền</th>
                            </tr>
                            <tr>
                                <th style="width: 12.5%; font-style: normal; font-weight: bold;">Theo chứng từ</th>
                                <th style="width: 12.5%; font-style: normal; font-weight: bold;">Thực nhập</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>

                    <p style="margin-top: 10px;"><strong>Tổng số tiền (viết bằng chữ):</strong> ${totalAmountText}</p>
                    <p><strong>Số chứng từ gốc kèm theo:</strong> (Hóa đơn, Phiếu xuất kho của NCC...)</p>

                    <div class="signer-section" style="margin-top: 40px;">
                        <div class="signer-col">
                            <p>Người lập phiếu</p>
                            <p class="small-text">(Ký, họ tên)</p>
                            <p style="margin-top: 60px;">${main.createdByFullName || '.....................'}</p>
                        </div>
                        <div class="signer-col">
                            <p>Người giao hàng</p>
                            <p class="small-text">(Ký, họ tên)</p>
                            <p style="margin-top: 60px;"></p>
                        </div>
                        <div class="signer-col">
                            <p>Thủ kho</p>
                            <p class="small-text">(Ký, họ tên)</p>
                            <p style="margin-top: 60px;"></p>
                        </div>
                        <div class="signer-col">
                            <p>Kế toán trưởng</p>
                            <p class="small-text">(Hoặc bộ phận có nhu cầu nhập)</p>
                            <p class="small-text">(Ký, họ tên)</p>
                            <p style="margin-top: 40px;"></p>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                        setTimeout(() => window.close(), 500);
                    };
                </script>
            </body>
        </html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            // Không cần setTimeout gọi print() nữa vì nó đã nằm trong script trong HTML
        } else {
            window.Toast?.fire({ icon: "error", title: "Vui lòng cho phép cửa sổ bật lên để in phiếu." });
        }
    };

    return {
        data, isStoreUser, loading, error, isAuthLoading, page, setPage, perPage, setPerPage, total,
        inputValue, setInputValue, modalState, isSubmitting, selectedReceipt, formValues, setFormValues,
        stores, suppliers, spareParts, canManage, canView, storeId, userRole, filters,
        openModal, closeModal, handleFormChange, handleDetailChange, addDetailRow, removeDetailRow,
        handleSubmit, getPageNumbers, handlePageChange, handleFilterChange, confirmDelete,
        isTableLoading, searchInputRef, isSystemManager, handleExportReceipt, formErrors,
    };
}