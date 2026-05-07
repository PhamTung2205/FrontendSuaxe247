// File: assets/js/ImportRequest.js

import { useState, useEffect, useCallback } from "react";

// --- Hook Debounce (Được tự tạo lại theo yêu cầu) ---
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
        // Thiết lập timer để cập nhật debouncedValue sau 'delay' ms
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: Hủy timer nếu value thay đổi (trước khi delay kết thúc) 
        // hoặc component unmount.
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}


// --- DTO cho Yêu cầu Nhập hàng (Import Request) ---
const emptyImportRequestDTO = {
    PK_idRequest: "",
    FK_idStore: "",
    FK_idCreatedBy: "",
    reason: "",
    status: "Pending", // Trạng thái mặc định
    created: null,
    deleted: 0,
    // Joined fields (từ MImportRequest.php)
    storeAddress: "",
    createdByFullName: "",
};

// --- API Config ---
const API_URL = "/api/import-request"; 
const STORE_API_URL = "/api/store/all";   
const USER_API_URL = "/api/user/all";     

const getLimitFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const limit = parseInt(params.get('limit'));
    return (limit && limit > 0) ? limit : 10; 
};

const MINIMUM_LOAD_TIME = 300; 

const REQUEST_STATUSES = [
    { value: 'Pending', label: 'Chờ duyệt' }, // Đã thay đổi "Chờ xử lý" thành "Chờ duyệt"
    { value: 'Approved', label: 'Đã duyệt' }, // Thêm trạng thái Đã duyệt
    { value: 'Rejected', label: 'Từ chối' }, // Thay đổi "Không thể xử lý" thành "Từ chối"
    { value: 'Completed', label: 'Hoàn thành' }, // Thay đổi "Đã xử lý" thành "Hoàn thành"
];

export function useImportRequest() {
    // --- State cho Dữ liệu và Trạng thái ---
    const [data, setData] = useState([]);
    const [stores, setStores] = useState([]);         
    const [users, setUsers] = useState([]);           

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalState, setModalState] = useState(null); 
    const [selectedRequest, setSelectedRequest] = useState(null);
    
    // --- State cho Form và Lỗi ---
    const [formValues, setFormValues] = useState(emptyImportRequestDTO);
    const [formErrors, setFormErrors] = useState({});

    // --- State cho Bộ lọc và Phân trang (Đồng bộ với CImportRequest.php) ---
    const [inputValue, setInputValue] = useState(""); // search term
    const [selectedStore, setSelectedStore] = useState(""); // store_id filter
    const [selectedStatus, setSelectedStatus] = useState(""); // status filter
    
    // SỬ DỤNG HOOK DEBOUNCE TỰ ĐỊNH NGHĨA
    // Đã đồng bộ delay 500ms (tương tự Supplier.js dùng 300ms, 500ms vẫn hợp lý)
    const debouncedSearchTerm = useDebounce(inputValue, 500); 

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(getLimitFromUrl());
    const [total, setTotal] = useState(0);

    // Lấy ID người dùng hiện tại từ LocalStorage 
    const user = JSON.parse(localStorage.getItem("user"));
    const currentUserId = user?.user_id; 


    // --- Fetch Auxiliary Data (Kho, User) ---
    const fetchAuxiliaryData = useCallback(async () => {
        // ... (Giữ nguyên logic fetch Auxiliary Data) ...
        try {
            
            // Fetch Stores và Users đồng thời
            const [storeResponse, userResponse] = await Promise.all([
                fetch(STORE_API_URL, { credentials: "include" }),
                fetch(USER_API_URL, { credentials: "include" })
            ]);
            
            const storeResult = await storeResponse.json();
            if (storeResult.status === 'success') {
                setStores(storeResult.data);
            }

            const userResult = await userResponse.json();
            if (userResult.status === 'success') {
                setUsers(userResult.data);
            }
            console.log("Cửa hàng: " + storeResult);
            console.log("user:" + userResult);
            console.log(currentUserId);
        } catch (err) {
            console.error("Lỗi tải dữ liệu phụ trợ:", err);
        }
    }, []);

    // --- Fetch Data (Yêu cầu Nhập hàng) ---
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        const startTime = Date.now();

        // START: PHẦN SỬA ĐỔI ĐỂ TỐI ƯU HÓA QUERY PARAMS
        const queryParams = new URLSearchParams();

        // 1. Tham số bắt buộc cho phân trang
        queryParams.append("page", page);
        queryParams.append("limit", perPage);

        // 2. Tham số tìm kiếm (Chỉ thêm nếu có giá trị)
        const trimmedSearch = debouncedSearchTerm.trim();
        if (trimmedSearch) {
            queryParams.append("search", trimmedSearch);
        }

        // 3. Tham số Lọc (Chỉ thêm nếu có giá trị)
        if (selectedStore) {
            queryParams.append("store_id", selectedStore);
        }
        if (selectedStatus) {
            queryParams.append("status", selectedStatus);
        }
        // END: PHẦN SỬA ĐỔI ĐỂ TỐI ƯU HÓA QUERY PARAMS


        try {
            const response = await fetch(`${API_URL}?${queryParams.toString()}`, { credentials: "include" });
            if (!response.ok) {
                // ... (Logic xử lý lỗi được giữ nguyên)
                const errorData = await response.json();
                throw new Error(errorData.messages?.error || "Lỗi không xác định từ máy chủ.");
            }
            const result = await response.json();

            // ... (Logic xử lý thời gian tải tối thiểu được giữ nguyên)

            const elapsedTime = Date.now() - startTime;
            const delay = elapsedTime < MINIMUM_LOAD_TIME ? MINIMUM_LOAD_TIME - elapsedTime : 0;
            
            setTimeout(() => {
                setData(result.data || []);
                setTotal(result.total || 0);
                setLoading(false);
            }, delay);


        } catch (err) {
            console.error("Lỗi tải dữ liệu:", err);
            setError(err.message);
            setLoading(false);
            window.Toast.fire({ icon: "error", title: `Không thể tải dữ liệu: ${err.message}` });
        }
        
    }, [page, perPage, debouncedSearchTerm, selectedStore, selectedStatus]);


    // --- Effect: Khởi tạo Dữ liệu phụ trợ ---
    useEffect(() => {
        fetchAuxiliaryData();
    }, [fetchAuxiliaryData]);


    // --- EFFECT ĐỒNG BỘ 1: Khi bất kỳ bộ lọc nào thay đổi, RESET về trang 1 ---
    // (Đồng bộ với Supplier.js)
    useEffect(() => {
        // Trừ `page`, khi `debouncedSearchTerm`, `selectedStore` hoặc `selectedStatus` thay đổi, reset page về 1
        // Trạng thái `perPage` không reset page, vì nó chỉ thay đổi số lượng items trên trang hiện tại.
        setPage(1);
    }, [debouncedSearchTerm, selectedStore, selectedStatus, perPage]); 
    // Ghi chú: Thêm perPage vào đây là để khi người dùng thay đổi Limit/PerPage,
    // nó sẽ tự động reset về trang 1 (Nếu đây là hành vi mong muốn). 
    // Nếu không muốn reset, chỉ cần bỏ `perPage` khỏi dependency array này và thêm vào `useEffect` bên dưới.

    // --- EFFECT ĐỒNG BỘ 2: Gọi fetchData khi các Dependency thay đổi ---
    // (Đồng bộ với Supplier.js, sử dụng `fetchData` trong dependency array)
    useEffect(() => {
        fetchData();
    }, [fetchData]); 


    // --- Handlers cho Modal ---
    const openModal = (state, request = null) => {
        setModalState(state);
        if (request) {
            setSelectedRequest(request);
            // Cập nhật formValues khi mở modal Edit/View/Delete
            setFormValues({ 
                ...emptyImportRequestDTO,
                ...request 
            });
        } else {
            // Thiết lập giá trị mặc định cho người tạo khi tạo mới
            setFormValues({ 
                ...emptyImportRequestDTO, 
                FK_idCreatedBy: currentUserId 
            });
        }
        setFormErrors({});
    };

    const closeModal = () => {
        setModalState(null);
        setSelectedRequest(null);
        setFormValues(emptyImportRequestDTO);
        setFormErrors({});
    };


    // --- Handlers cho Form ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => ({ ...prev, [name]: null }));
    };

    const validateForm = () => {
        let errors = {};
        if (!formValues.PK_idRequest && modalState === 'create') errors.PK_idRequest = "Mã Yêu cầu là bắt buộc.";
        if (!formValues.FK_idStore) errors.FK_idStore = "Kho nhập là bắt buộc.";
        if (!formValues.reason) errors.reason = "Lý do yêu cầu là bắt buộc.";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormOperation = async (method, url, successMessage, body = null) => {
        setIsSubmitting(true);
        setError(null);
        // Đảm bảo user_id luôn được gửi đi
        const finalUrl = `${url}${url.includes('?') ? '&' : '?' }user_id=${currentUserId}`; 
        
        try {
            const response = await fetch(finalUrl, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : null,
            });

            const result = await response.json();
            
            if (!response.ok || result.status !== 'success') {
                let errorMessage = "Lỗi không xác định trong quá trình xử lý.";
                if(result.messages && typeof result.messages === 'object') {
                    errorMessage = Object.values(result.messages).flat().join('\n');
                } else if (result.message) {
                    errorMessage = result.message;
                }
                throw new Error(errorMessage);
            }

            // Xử lý thành công
            window.Toast.fire({ icon: "success", title: successMessage });
            closeModal();
            fetchData(); // Tải lại dữ liệu sau khi CRUD thành công (ĐỒNG BỘ)

        } catch (err) {
            // Xử lý lỗi
            window.Swal.fire("Lỗi!", `Xử lý thất bại: ${err.message}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        let method, url;
        const submitData = { ...formValues };

        if (modalState === 'create') {
            method = 'POST';
            url = API_URL;
            // Backend sẽ tự thêm created/updated field
            delete submitData.created; 
            delete submitData.deleted;
            handleFormOperation(method, url, "Tạo yêu cầu nhập hàng thành công!", submitData, { credentials: "include" });

        } else if (modalState === 'edit') {
            method = 'PUT';
            url = `${API_URL}/${selectedRequest.PK_idRequest}`;
            // Loại bỏ các trường không cần gửi lên khi UPDATE
            delete submitData.createdByFullName;
            delete submitData.storeAddress;
            handleFormOperation(method, url, "Cập nhật yêu cầu nhập hàng thành công!", submitData, { credentials: "include" });
        }
    };

    const confirmDelete = () => {
        if (!selectedRequest) return;
        let url = `${API_URL}/${selectedRequest.PK_idRequest}`;
        // Sử dụng phương thức DELETE (Soft Delete)
        handleFormOperation("DELETE", url, "Đã xóa yêu cầu nhập hàng thành công!", null, { credentials: "include" });
    };


    // --- Phân trang UI (Đồng bộ với Supplier.js) ---
    const getPageNumbers = () => {
        const totalPages = Math.ceil(total / perPage);
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


    // --- Trả về toàn bộ state và handler ---
    return {
        data,
        stores,
        users,
        REQUEST_STATUSES,
        loading,
        error,
        modalState,
        selectedRequest,
        formValues,
        formErrors,
        isSubmitting,
        inputValue,
        setInputValue,
        selectedStore,
        setSelectedStore,
        selectedStatus,
        setSelectedStatus,
        page,
        setPage,
        perPage, 
        setPerPage, // Cung cấp setter cho perPage
        total,
        totalPages: Math.ceil(total / perPage),
        getPageNumbers,
        openModal,
        closeModal,
        handleInputChange,
        handleSubmit,
        confirmDelete,
        handleFormOperation, // Thêm để hỗ trợ các action như Duyệt/Từ chối bên ngoài form
    };
}