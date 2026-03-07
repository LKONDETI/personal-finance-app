// API Client for Banking API (.NET Backend)
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
// Priority: EXPO_PUBLIC_API_URL env var → localhost fallback (simulator only)
// To use Expo Go on a physical device, set EXPO_PUBLIC_API_URL in your .env file
// to your ngrok URL (e.g. https://abc123.ngrok-free.app) or your machine's local IP.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:5200';
console.log('🔗 API_BASE_URL:', API_BASE_URL);
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// Type Definitions
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    expiresAt: string;
}

export interface User {
    id: number;
    email: string;
    name: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Account {
    id: number;
    userId: number;
    accountName: string;
    accountNumber: string;
    productId: number;
    balance: number;
    currency: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: number;
    accountId: number;
    transactionType: 'Credit' | 'Debit';
    amount: number;
    category: string;
    description?: string;
    transactionDate?: string;
    transactionTime?: string;
    createdAt: string;
}

export interface Budget {
    id: number;
    userId: number;
    category: string;
    monthlyLimit: number;
    currentSpending: number;
    month: number;
    year: number;
    createdAt: string;
    updatedAt: string;
}

export interface Loan {
    id: number;
    userId: number;
    loanType: string;
    loanAmount: number;
    interestRate: number;
    loanTermMonths: number;
    monthlyPayment: number;
    outstandingBalance: number;
    purpose?: string;
    status: string;
    applicationDate: string;
    approvalDate?: string;
    disbursementDate?: string;
}

export interface PaymentRequest {
    id: number;
    userId: number;
    accountId?: number;
    payeeName: string;
    payeeCategory: string;
    amount: number;
    amountPaid: number;
    dueDate: string;
    paidDate?: string;
    status: number;  // 0=Pending, 1=Paid, 2=PartiallyPaid, 3=Declined, 4=Overdue
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    message: string;
    errors?: string[];
}

// Create Axios Instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Add JWT Token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync(TOKEN_KEY);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor - Handle Errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage and redirect to login
            await clearAuth();
            // You can add navigation logic here if needed
        }
        return Promise.reject(error);
    }
);

// Auth Functions
export const auth = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/Auth/login', {
            email,
            password,
        });

        if (response.data.success && response.data.data) {
            // Store token and user data securely
            await SecureStore.setItemAsync(TOKEN_KEY, response.data.data.token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.data.data.user));
            return response.data.data;
        }

        throw new Error(response.data.message || 'Login failed');
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post<ApiResponse<AuthResponse>>('/api/Auth/register', data);

        if (response.data.success && response.data.data) {
            // Store token and user data securely
            await SecureStore.setItemAsync(TOKEN_KEY, response.data.data.token);
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.data.data.user));
            return response.data.data;
        }

        throw new Error(response.data.message || 'Registration failed');
    },

    logout: async (): Promise<void> => {
        try {
            await apiClient.post('/api/Auth/logout');
        } catch (error) {
            console.error('Error logging out from backend:', error);
        } finally {
            await clearAuth();
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        try {
            const userData = await SecureStore.getItemAsync(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    getToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },
};

// Accounts API
export const accounts = {
    getAll: async (): Promise<Account[]> => {
        const response = await apiClient.get<ApiResponse<Account[]>>('/api/accounts');
        return response.data.data || [];
    },

    getById: async (id: number): Promise<Account> => {
        const response = await apiClient.get<ApiResponse<Account>>(`/api/accounts/${id}`);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error('Account not found');
    },

    create: async (accountName: string, productId: number): Promise<Account> => {
        const response = await apiClient.post<ApiResponse<Account>>('/api/accounts', {
            accountName,
            productId,
        });
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to create account');
    },
};

// Transactions API
export const transactions = {
    getAll: async (accountId?: number): Promise<Transaction[]> => {
        const url = accountId ? `/api/Transactions/account/${accountId}` : '/api/transactions';
        const response = await apiClient.get<ApiResponse<Transaction[]>>(url);
        return response.data.data || [];
    },

    create: async (data: {
        accountId: number;
        transactionType: 'Credit' | 'Debit';
        amount: number;
        category: string;
        description?: string;
    }): Promise<Transaction> => {
        const response = await apiClient.post<ApiResponse<Transaction>>('/api/transactions', data);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to create transaction');
    },
};

// Budgets API
export const budgets = {
    getAll: async (): Promise<Budget[]> => {
        const response = await apiClient.get<ApiResponse<Budget[]>>('/api/budgets');
        return response.data.data || [];
    },

    getById: async (id: number): Promise<Budget> => {
        const response = await apiClient.get<ApiResponse<Budget>>(`/api/budgets/${id}`);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error('Budget not found');
    },

    create: async (data: {
        category: string;
        monthlyLimit: number;
        month: number;
        year: number;
    }): Promise<Budget> => {
        const response = await apiClient.post<ApiResponse<Budget>>('/api/budgets', data);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to create budget');
    },

    update: async (id: number, data: { monthlyLimit: number }): Promise<Budget> => {
        const response = await apiClient.put<ApiResponse<Budget>>(`/api/budgets/${id}`, data);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to update budget');
    },

    delete: async (id: number): Promise<void> => {
        await apiClient.delete(`/api/budgets/${id}`);
    },
};

// Loans API
export const loans = {
    getAll: async (): Promise<Loan[]> => {
        const response = await apiClient.get<ApiResponse<Loan[]>>('/api/loans');
        return response.data.data || [];
    },

    getById: async (id: number): Promise<Loan> => {
        const response = await apiClient.get<ApiResponse<Loan>>(`/api/loans/${id}`);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error('Loan not found');
    },

    apply: async (data: {
        loanType: string;
        amount: number;
        termMonths: number;
        loanPurpose: string;
    }): Promise<Loan> => {
        const response = await apiClient.post<ApiResponse<Loan>>('/api/loans', {
            loanType: data.loanType,
            loanAmount: data.amount,
            loanTermMonths: data.termMonths,
            purpose: data.loanPurpose,
        });
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to apply for loan');
    },
};

// Payment Requests API
export const paymentRequests = {
    getAll: async (status?: string): Promise<PaymentRequest[]> => {
        const url = status ? `/api/paymentrequests?status=${status}` : '/api/paymentrequests';
        const response = await apiClient.get<ApiResponse<PaymentRequest[]>>(url);
        return response.data.data || [];
    },

    getById: async (id: number): Promise<PaymentRequest> => {
        const response = await apiClient.get<ApiResponse<PaymentRequest>>(`/api/paymentrequests/${id}`);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error('Payment request not found');
    },

    payFull: async (id: number, accountId: number): Promise<PaymentRequest> => {
        const response = await apiClient.post<ApiResponse<PaymentRequest>>(`/api/paymentrequests/${id}/pay`, {
            accountId,
        });
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Payment failed');
    },

    payPartial: async (id: number, accountId: number, amount: number): Promise<PaymentRequest> => {
        const response = await apiClient.post<ApiResponse<PaymentRequest>>(`/api/paymentrequests/${id}/pay-partial`, {
            accountId,
            amount,
        });
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Partial payment failed');
    },

    decline: async (id: number): Promise<PaymentRequest> => {
        const response = await apiClient.post<ApiResponse<PaymentRequest>>(`/api/paymentrequests/${id}/decline`);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to decline request');
    },
};

// Users API
export const users = {
    getCurrentProfile: async (): Promise<User> => {
        const response = await apiClient.get<ApiResponse<User>>('/api/user/me');
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch user profile');
    },

    updateProfile: async (data: { name?: string; phone?: string }): Promise<User> => {
        const response = await apiClient.put<ApiResponse<User>>('/api/user/me', data);
        if (response.data.data) {
            // Update the local storage user cache just in case
            await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.data.data));
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to update user profile');
    },
};

// Helper Functions
const clearAuth = async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(USER_KEY);
    } catch (error) {
        console.error('Error clearing auth:', error);
    }
};

// Export axios instance for direct use if needed
export default apiClient;
