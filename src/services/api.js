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
        const status = error?.response?.status;
        const data = error?.response?.data;
        const headers = error?.response?.headers;

        console.log('Erro na API:', {
            config: error?.config || 'indefinido',
            response: data || 'sem dados',
            status: status || 'sem status',
            headers: headers || 'sem headers',
        });

        if (status === 401) {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
        }

        // Rejeita com o erro formatado
        return Promise.reject({
            message: error?.message || 'Erro desconhecido',
            data,
            status,
        });
    }
);

export default api;
