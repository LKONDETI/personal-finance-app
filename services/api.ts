// API Client for Banking API (.NET Backend)
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const API_BASE_URL = 'http://localhost:5200';
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
    transactionDate: string;
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
    amount: number;
    interestRate: number;
    termMonths: number;
    monthlyPayment: number;
    outstandingBalance: number;
    loanPurpose: string;
    status: string;
    applicationDate: string;
    approvalDate?: string;
    disbursementDate?: string;
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
        await clearAuth();
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
        const url = accountId ? `/api/transactions?accountId=${accountId}` : '/api/transactions';
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
        const response = await apiClient.post<ApiResponse<Loan>>('/api/loans', data);
        if (response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to apply for loan');
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
