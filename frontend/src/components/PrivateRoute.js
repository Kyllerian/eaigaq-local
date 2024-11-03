// src/components/PrivateRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Loading from './Loading'; // Импортируем компонент Loading

function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <Loading />; // Используем компонент Loading вместо текста
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default PrivateRoute;

// // src/components/PrivateRoute.js
//
// import React, { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext';
//
// function PrivateRoute({ children }) {
//   const { user, loading } = useContext(AuthContext);
//
//   if (loading) {
//     return <div>Загрузка...</div>; // Можно заменить на спиннер
//   }
//
//   if (!user) {
//     return <Navigate to="/login" />;
//   }
//
//   return children;
// }
//
// export default PrivateRoute;
