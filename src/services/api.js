import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-consumo-app.onrender.com/',
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

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {

            if (error.response.status === 401) {
                AsyncStorage.removeItem('userToken');
                AsyncStorage.removeItem('userData');
            }
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    response => response,
    error => {
        console.log('Erro na API:', {
            config: error.config,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        return Promise.reject(error);
    }
);

export default api;