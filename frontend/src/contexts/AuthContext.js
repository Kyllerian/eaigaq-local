// src/contexts/AuthContext.js

import React, {createContext, useState, useEffect} from 'react';
import axios from '../axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null); // Полностью аутентифицированный пользователь
    const [loading, setLoading] = useState(true); // Состояние загрузки
    const [biometricRequired, setBiometricRequired] = useState(false); // Требуется биометрия
    const [biometricRegistrationRequired, setBiometricRegistrationRequired] = useState(false); // Требуется регистрация биометрии

    // Функция для получения CSRF токена
    const getCSRFToken = async () => {
        try {
            await axios.get('/api/get_csrf_token/');
        } catch (error) {
            console.error('Ошибка при получении CSRF токена:', error);
        }
    };

    // Функция для получения текущего пользователя
    const fetchCurrentUser = async () => {
        try {
            const response = await axios.get('/api/current-user/');
            console.log('Текущий пользователь:', response.data);
            setUser(response.data);
            return response.data;
        } catch (error) {
            console.log('Ошибка при получении текущего пользователя:', error.response?.status);
            if (error.response && error.response.status === 403) {
                setUser(null);
            } else {
                console.error('Ошибка при получении текущего пользователя:', error);
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Получаем CSRF токен и затем текущего пользователя
        getCSRFToken().then(() => {
            fetchCurrentUser();
        });
    }, []);

    // Функция для логина
    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/login/', {username, password});
            const data = response.data;
            console.log('Ответ при логине:', data);

            if (data.login_successful) {
                // Полностью аутентифицированный пользователь, получаем его данные
                setBiometricRequired(false);
                setBiometricRegistrationRequired(false);
                await fetchCurrentUser();
                return {success: true};
            }

            if (data.biometric_required) {
                setBiometricRequired(true);
                setBiometricRegistrationRequired(false);
                return {success: true, biometricRequired: true};
            } else if (data.biometric_registration_required) {
                setBiometricRegistrationRequired(true);
                setBiometricRequired(true);
                return {success: true, biometricRegistrationRequired: true};
            } else {
                // Полностью аутентифицированный пользователь, получаем его данные
                 await fetchCurrentUser();
                return {success: true};
            }
        } catch (error) {
            console.log('Ошибка при логине:', error.response?.data);
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
            setUser(null);
            setBiometricRequired(false);
            setBiometricRegistrationRequired(false);
        } catch (error) {
            console.error('Ошибка при логауте:', error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loading,
            biometricRequired,
            biometricRegistrationRequired,
            setBiometricRequired,
            setBiometricRegistrationRequired,
            fetchCurrentUser,
        }}>
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
//   const [user, setUser] = useState(null); // Полностью аутентифицированный пользователь
//   const [loading, setLoading] = useState(true); // Состояние загрузки
//   const [biometricRequired, setBiometricRequired] = useState(false); // Требуется биометрия
//   const [biometricRegistrationRequired, setBiometricRegistrationRequired] = useState(false); // Требуется регистрация биометрии
//
//   // Функция для получения CSRF токена
//   const getCSRFToken = async () => {
//     try {
//       await axios.get('/api/get_csrf_token/');
//     } catch (error) {
//       console.error('Ошибка при получении CSRF токена:', error);
//     }
//   };
//
//   // Функция для получения текущего пользователя
//   const fetchCurrentUser = async () => {
//     try {
//       const response = await axios.get('/api/current-user/');
//       console.log('Текущий пользователь:', response.data);
//       setUser(response.data);
//       return response.data;
//     } catch (error) {
//       console.log('Ошибка при получении текущего пользователя:', error.response?.status);
//       if (error.response && error.response.status === 403) {
//         setUser(null);
//       } else {
//         console.error('Ошибка при получении текущего пользователя:', error);
//       }
//       return null;
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     // Получаем CSRF токен и затем текущего пользователя
//     getCSRFToken().then(() => {
//       fetchCurrentUser();
//     });
//   }, []);
//
//   // Функция для логина
//   const login = async (username, password) => {
//     try {
//       const response = await axios.post('/api/login/', { username, password });
//       const data = response.data;
//       console.log('Ответ при логине:', data);
//
//       if (data.biometric_required) {
//         setBiometricRequired(true);
//         setBiometricRegistrationRequired(false);
//         return { success: true, biometricRequired: true };
//       } else if (data.biometric_registration_required) {
//         setBiometricRegistrationRequired(true);
//         setBiometricRequired(true);
//         return { success: true, biometricRegistrationRequired: true };
//       } else {
//         // Полностью аутентифицированный пользователь, получаем его данные
//         const currentUser = await fetchCurrentUser();
//         return { success: true, needsBiometricRegistration: false };
//       }
//     } catch (error) {
//       console.log('Ошибка при логине:', error.response?.data);
//       return {
//         success: false,
//         message: error.response?.data?.detail || 'Ошибка при логине.',
//       };
//     }
//   };
//
//   // Функция для логаута
//   const logout = async () => {
//     try {
//       await axios.post('/api/logout/');
//       setUser(null);
//       setBiometricRequired(false);
//       setBiometricRegistrationRequired(false);
//     } catch (error) {
//       console.error('Ошибка при логауте:', error);
//     }
//   };
//
//   return (
//     <AuthContext.Provider value={{
//       user,
//       login,
//       logout,
//       loading,
//       biometricRequired,
//       biometricRegistrationRequired,
//       setBiometricRequired,
//       setBiometricRegistrationRequired,
//       fetchCurrentUser,
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
