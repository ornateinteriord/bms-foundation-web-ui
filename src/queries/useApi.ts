import axios from "axios";
import TokenService from "./token/tokenService";
import { ApiError } from "../types";

const api = axios.create({
    baseURL: import.meta.env.VITE_MLM_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = TokenService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

const useApi = async <T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    data?: any,
    params?: Record<string, any>
): Promise<T> => {
    try {
        const response = await api.request<T>({
            method,
            url: path,
            data,
            params,
        });
        return response.data; // Return data strongly typed
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const apiError: ApiError = {
                message: error.response?.data.message || "An error occurred",
                status: error.response?.status,
            };
            throw apiError; // Throw custom API error
        }
        throw { message: "An error occurred", status: 500 };
    }
};

export default useApi;