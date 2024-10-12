// src/contexts/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from '../axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Состояние для хранения информации о пользователе
  const [loading, setLoading] = useState(true); // Состояние загрузки

  // Функция для проверки текущего пользователя
  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get('/api/current-user/');
      setUser(response.data); // Устанавливаем пользователя
    } catch (error) {
      setUser(null); // Если пользователь не аутентифицирован
    } finally {
      setLoading(false); // Завершаем загрузку
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Функция для логина
  const login = async (username, password) => {
    try {
      await axios.post('/api/login/', { username, password });
      await fetchCurrentUser(); // Обновляем информацию о пользователе после логина
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.detail || 'Ошибка при логине.',
      };
    }
  };

  // Функция для логаута
  const logout = async () => {
    try {
      await axios.post('/api/logout/');
      setUser(null); // Очищаем информацию о пользователе
    } catch (error) {
      console.error('Ошибка при логауте:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// // src/contexts/AuthContext.js
//
// import React, { createContext, useState, useEffect } from 'react';
// import axios from '../axiosConfig';
//
// export const AuthContext = createContext();
//
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // Состояние для хранения информации о пользователе
//   const [loading, setLoading] = useState(true); // Состояние загрузки
//
//   // Функция для проверки текущего пользователя
//   const fetchCurrentUser = async () => {
//     try {
//       const response = await axios.get('/api/current-user/');
//       setUser(response.data); // Устанавливаем пользователя
//     } catch (error) {
//       setUser(null); // Если пользователь не аутентифицирован
//     } finally {
//       setLoading(false); // Завершаем загрузку
//     }
//   };
//
//   useEffect(() => {
//     fetchCurrentUser();
//   }, []);
//
//   // Функция для логина
//   const login = async (username, password) => {
//     try {
//       await axios.post('/api/login/', { username, password });
//       await fetchCurrentUser(); // Обновляем информацию о пользователе после логина
//       return { success: true };
//     } catch (error) {
//       return { success: false, message: error.response?.data?.detail || 'Ошибка при логине.' };
//     }
//   };
//
//   // Функция для логаута
//   const logout = async () => {
//     try {
//       await axios.post('/api/logout/');
//       setUser(null); // Очищаем информацию о пользователе
//     } catch (error) {
//       console.error('Ошибка при логауте:', error);
//     }
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, login, logout, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

