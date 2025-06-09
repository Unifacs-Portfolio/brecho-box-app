import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-consumo-app.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token às requisições
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para tratamento de resposta e erros
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            // Padroniza a estrutura de erro para frontend
            error.response.data = {
                error: error.response.data?.error || 'Erro desconhecido',
                message: error.response.data?.message || '',
                status: error.response.status
            };
        }
        return Promise.reject(error);
    }
);

export default api;
