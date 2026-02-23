import axios from 'axios';

const BASE_URL = 'https://699c2b9c110b5b738cc1e974.mockapi.io';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
