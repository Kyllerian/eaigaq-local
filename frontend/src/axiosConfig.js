// src/axiosConfig.js

import axios from 'axios';
import { getCSRFToken } from './csrf';

const baseURL = process.env.REACT_APP_BACKEND_URL || '/api';

// Для отладки можно вывести базовый URL в консоль
console.log('Base URL:', baseURL);

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;

// // src/axiosConfig.js
//
// import axios from 'axios';
// import { getCSRFToken } from './csrf';
//
// const baseURL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
//
// const instance = axios.create({
//   baseURL: baseURL,
//   withCredentials: true,
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   },
// });
//
// instance.interceptors.request.use(
//   (config) => {
//     const csrfToken = getCSRFToken();
//     if (csrfToken) {
//       config.headers['X-CSRFToken'] = csrfToken;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
//
// export default instance;
