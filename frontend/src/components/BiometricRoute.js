// src/components/BiometricRoute.js

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Loading from './Loading';

function BiometricRoute({ children, type }) {
  const { biometricRequired, biometricRegistrationRequired, loading } = useContext(AuthContext);

  if (loading) return <Loading />;

  if (type === 'registration') {
    return biometricRegistrationRequired ? children : <Navigate to="/" />;
  }

  if (type === 'authentication') {
    return biometricRequired && !biometricRegistrationRequired ? children : <Navigate to="/" />;
  }

  // Если тип не указан или не распознан, перенаправляем на главную страницу
  return <Navigate to="/" />;
}

export default BiometricRoute;
