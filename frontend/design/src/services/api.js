
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {

            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    register: async (username, login, password) => {
        const response = await apiClient.post('/auth/register', {
            username,
            login,
            password,
        });
        return response.data;
    },

    login: async (login, password) => {
        const response = await apiClient.post('/auth/login', {
            login,
            password,
        });
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },

    validateToken: async () => {
        const response = await apiClient.get('/auth/validate');
        return response.data;
    },
};

export const productsAPI = {
    getGroupedProducts: async () => {
        const response = await apiClient.get('/products/grouped');
        return response.data;
    },

    getAllProducts: async () => {
        const response = await apiClient.get('/products');
        return response.data;
    },

    getProductById: async (productId) => {
        const response = await apiClient.get(`/products/${productId}`);
        return response.data;
    },

    searchProducts: async (query) => {
        const response = await apiClient.get('/products/search', {
            params: { query },
        });
        return response.data;
    },
};

export const cartAPI = {
    getCartItems: async () => {
        const response = await apiClient.get('/cart');
        return response.data;
    },

    addToCart: async (productId, quantity, size, color, price, designId = null) => {
        const response = await apiClient.post('/cart', {
            productId,
            quantity,
            size,
            color,
            price,
            designId,
        });
        return response.data;
    },

    updateCartItem: async (cartItemId, quantity) => {
        const response = await apiClient.put(`/cart/${cartItemId}`, null, {
            params: { quantity },
        });
        return response.data;
    },

    removeFromCart: async (cartItemId) => {
        const response = await apiClient.delete(`/cart/${cartItemId}`);
        return response.data;
    },

    clearCart: async () => {
        const response = await apiClient.delete('/cart');
        return response.data;
    },
};

export const ordersAPI = {
    createOrder: async (shippingAddressId, shippingCost, notes = null) => {
        const response = await apiClient.post('/orders', {
            shippingAddressId,
            shippingCost,
            notes,
        });
        return response.data;
    },

    getMyOrders: async () => {
        const response = await apiClient.get('/orders/my');
        return response.data;
    },

    getOrderById: async (orderId) => {
        const response = await apiClient.get(`/orders/${orderId}`);
        return response.data;
    },

    getOrderByNumber: async (orderNumber) => {
        const response = await apiClient.get(`/orders/number/${orderNumber}`);
        return response.data;
    },
};

export const addressesAPI = {
    getAllCountries: async () => {
        const response = await apiClient.get('/addresses/countries');
        return response.data;
    },

    getUserAddresses: async () => {
        const response = await apiClient.get('/addresses');
        return response.data;
    },

    getDefaultAddress: async () => {
        const response = await apiClient.get('/addresses/default');
        return response.data;
    },

    getAddressById: async (addressId) => {
        const response = await apiClient.get(`/addresses/${addressId}`);
        return response.data;
    },

    createAddress: async (countryId, city, streetAddress, postalCode, isDefault = false) => {
        const response = await apiClient.post('/addresses', {
            countryId,
            city,
            streetAddress,
            postalCode,
            isDefault,
        });
        return response.data;
    },

    updateAddress: async (addressId, countryId, city, streetAddress, postalCode) => {
        const response = await apiClient.put(`/addresses/${addressId}`, {
            countryId,
            city,
            streetAddress,
            postalCode,
        });
        return response.data;
    },

    setAsDefault: async (addressId) => {
        const response = await apiClient.put(`/addresses/${addressId}/default`);
        return response.data;
    },

    deleteAddress: async (addressId) => {
        const response = await apiClient.delete(`/addresses/${addressId}`);
        return response.data;
    },
};

export const ticketsAPI = {
    createTicket: async (category, description, priority) => {
        const response = await apiClient.post('/tickets', {
            category,
            description,
            priority,
        });
        return response.data;
    },

    getMyTickets: async () => {
        const response = await apiClient.get('/tickets/my');
        return response.data;
    },

    getTicketById: async (ticketId) => {
        const response = await apiClient.get(`/tickets/${ticketId}`);
        return response.data;
    },

    getTicketMessages: async (ticketId) => {
        const response = await apiClient.get(`/tickets/${ticketId}/messages`);
        return response.data;
    },

    addTicketMessage: async (ticketId, messageText, attachmentImageId = null) => {
        const response = await apiClient.post(`/tickets/${ticketId}/messages`, {
            messageText,
            attachmentImageId,
        });
        return response.data;
    },
};

export const designsAPI = {
    generateDesign: async (prompt, text, aiModelId, theme, variations) => {
        const response = await apiClient.post('/designs/generate', {
            prompt,
            text,
            aiModelId,
            theme,
            variations,
        });
        return response.data;
    },

    getMyDesigns: async () => {
        const response = await apiClient.get('/designs/my');
        return response.data;
    },

    getDesignById: async (designId) => {
        const response = await apiClient.get(`/designs/${designId}`);
        return response.data;
    },

    deleteDesign: async (designId) => {
        const response = await apiClient.delete(`/designs/${designId}`);
        return response.data;
    },

    getGenerationHistory: async () => {
        const response = await apiClient.get('/designs/history');
        return response.data;
    },

    getPublicDesigns: async () => {

        const response = await axios.get(`${API_BASE_URL}/designs/public`);
        return response.data;
    },
};

export const imagesAPI = {
    uploadImage: async (file, title, description) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', description);

        const response = await apiClient.post('/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMyImages: async () => {
        const response = await apiClient.get('/images/my');
        return response.data;
    },

    getImageById: async (imageId) => {
        const response = await apiClient.get(`/images/${imageId}`);
        return response.data;
    },

    deleteImage: async (imageId) => {
        const response = await apiClient.delete(`/images/${imageId}`);
        return response.data;
    },

    getPublicImages: async () => {

        const response = await axios.get(`${API_BASE_URL}/images/public`);
        return response.data;
    },

    updateImageVisibility: async (imageId, isPublic) => {
        const response = await apiClient.put(`/images/${imageId}/visibility`, {
            isPublic,
        });
        return response.data;
    },
};

export const favouritesAPI = {
    getFavourites: async () => {
        const response = await apiClient.get('/favourites');
        return response.data;
    },

    addToFavourites: async (productId) => {
        const response = await apiClient.post('/favourites', { productId });
        return response.data;
    },

    removeFromFavourites: async (favouriteId) => {
        const response = await apiClient.delete(`/favourites/${favouriteId}`);
        return response.data;
    },
};

export const moderatorAPI = {

    getAllOrders: async () => {
        const response = await apiClient.get('/moderator/orders');
        return response.data;
    },

    getOrdersByStatus: async (status) => {
        const response = await apiClient.get(`/moderator/orders/status/${status}`);
        return response.data;
    },

    getOrderById: async (orderId) => {
        const response = await apiClient.get(`/moderator/orders/${orderId}`);
        return response.data;
    },

    updateOrderStatus: async (orderId, status, note) => {
        const response = await apiClient.put(`/moderator/orders/${orderId}/status`, {
            status,
            note,
        });
        return response.data;
    },

    getAllTickets: async () => {
        const response = await apiClient.get('/moderator/tickets');
        return response.data;
    },

    getTicketsByStatus: async (status) => {
        const response = await apiClient.get(`/moderator/tickets/status/${status}`);
        return response.data;
    },

    getUnassignedTickets: async () => {
        const response = await apiClient.get('/moderator/tickets/unassigned');
        return response.data;
    },

    getMyTickets: async () => {
        const response = await apiClient.get('/moderator/tickets/my');
        return response.data;
    },

    getTicketById: async (ticketId) => {
        const response = await apiClient.get(`/moderator/tickets/${ticketId}`);
        return response.data;
    },

    assignTicket: async (ticketId, moderatorId) => {
        const response = await apiClient.put(`/moderator/tickets/${ticketId}/assign`, {
            moderatorId,
        });
        return response.data;
    },

    updateTicketStatus: async (ticketId, status, assignedModeratorId, response) => {
        const res = await apiClient.put(`/moderator/tickets/${ticketId}/status`, {
            status,
            assignedModeratorId,
            response,
        });
        return res.data;
    },

    getTicketMessages: async (ticketId) => {
        const response = await apiClient.get(`/moderator/tickets/${ticketId}/messages`);
        return response.data;
    },

    addTicketMessage: async (ticketId, messageText, attachmentImageId = null) => {
        const response = await apiClient.post(`/moderator/tickets/${ticketId}/messages`, {
            messageText,
            attachmentImageId,
        });
        return response.data;
    },

    getAllDesigns: async () => {
        const response = await apiClient.get('/moderator/designs');
        return response.data;
    },

    getDesignById: async (designId) => {
        const response = await apiClient.get(`/moderator/designs/${designId}`);
        return response.data;
    },

    updateDesignVisibility: async (designId, isPublic) => {
        const response = await apiClient.put(`/moderator/designs/${designId}/visibility`, {
            isPublic,
        });
        return response.data;
    },

    deleteDesign: async (designId) => {
        const response = await apiClient.delete(`/moderator/designs/${designId}`);
        return response.data;
    },
};

export const adminAPI = {

    getStatistics: async () => {
        const response = await apiClient.get('/admin/statistics');
        return response.data;
    },

    getAllUsers: async () => {
        const response = await apiClient.get('/admin/users');
        return response.data;
    },

    getUserById: async (userId) => {
        const response = await apiClient.get(`/admin/users/${userId}`);
        return response.data;
    },

    searchUsers: async (query) => {
        const response = await apiClient.get('/admin/users/search', {
            params: { query },
        });
        return response.data;
    },

    getUsersByRole: async (role) => {
        const response = await apiClient.get(`/admin/users/role/${role}`);
        return response.data;
    },

    blockUser: async (userId, blocked, reason) => {
        const response = await apiClient.put(`/admin/users/${userId}/block`, {
            blocked,
            reason,
        });
        return response.data;
    },

    changeUserRole: async (userId, authority) => {
        const response = await apiClient.put(`/admin/users/${userId}/role`, {
            authority,
        });
        return response.data;
    },

    getAllThemes: async () => {
        const response = await apiClient.get('/admin/themes');
        return response.data;
    },

    getThemeById: async (themeId) => {
        const response = await apiClient.get(`/admin/themes/${themeId}`);
        return response.data;
    },

    createTheme: async (themeName, description, isActive) => {
        const response = await apiClient.post('/admin/themes', {
            themeName,
            description,
            isActive,
        });
        return response.data;
    },

    updateTheme: async (themeId, themeName, description, isActive) => {
        const response = await apiClient.put(`/admin/themes/${themeId}`, {
            themeName,
            description,
            isActive,
        });
        return response.data;
    },

    deleteTheme: async (themeId) => {
        const response = await apiClient.delete(`/admin/themes/${themeId}`);
        return response.data;
    },

    toggleThemeStatus: async (themeId) => {
        const response = await apiClient.put(`/admin/themes/${themeId}/toggle`);
        return response.data;
    },

    getAllModels: async () => {
        const response = await apiClient.get('/admin/models');
        return response.data;
    },

    getModelById: async (modelId) => {
        const response = await apiClient.get(`/admin/models/${modelId}`);
        return response.data;
    },

    createModel: async (modelName, apiEndpoint, description, isActive) => {
        const response = await apiClient.post('/admin/models', {
            modelName,
            apiEndpoint,
            description,
            isActive,
        });
        return response.data;
    },

    updateModel: async (modelId, modelName, apiEndpoint, description, isActive) => {
        const response = await apiClient.put(`/admin/models/${modelId}`, {
            modelName,
            apiEndpoint,
            description,
            isActive,
        });
        return response.data;
    },

    deleteModel: async (modelId) => {
        const response = await apiClient.delete(`/admin/models/${modelId}`);
        return response.data;
    },

    toggleModelStatus: async (modelId) => {
        const response = await apiClient.put(`/admin/models/${modelId}/toggle`);
        return response.data;
    },

    updateProductPrice: async (productId, price) => {
        const response = await apiClient.put(`/admin/products/${productId}/price`, {
            price,
        });
        return response.data;
    },
};

export default apiClient;

