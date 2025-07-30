// src/lib/api/client.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable para almacenar el token actual
let currentToken: string | null = null;

// Función para establecer el token desde el componente
export const setApiToken = (token: string | null) => {
  currentToken = token;
};

// Interceptor para requests - añadir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor para responses - manejo de errores mejorado
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Manejo de errores específicos
    if (error.response?.status === 401) {
      // Token expirado o no válido - limpiar token y redirigir
      currentToken = null;
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }

    if (error.response?.status === 403) {
      console.error('Sin permisos para acceder a este recurso');
    }

    if (error.response?.status && error.response?.status >= 500) {
      console.error('Error del servidor:', error.response?.data);
    }

    return Promise.reject(error);
  },
);

// Función helper para manejo de respuestas API
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.isSuccess) {
    return response.data.value;
  } else {
    throw new Error(response.data.errors.join(', ') || 'Error en la API');
  }
};

export default apiClient;
