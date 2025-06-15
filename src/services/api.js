import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-consumo-app.onrender.com',
    timeout: 30000,
    headers: {
      'Accept': 'application/json',
    }
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

// Adicione este interceptor
api.interceptors.request.use(async (config) => {
    // Corrige automaticamente URLs mal escritas
    if (config.url.includes('recsitas')) {
      config.url = config.url.replace('recsitas', 'receitas');
    }
    
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove header Content-Type para FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  });

export default api;

