import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api-consumo-app.onrender.com/',
  });

export default api;

