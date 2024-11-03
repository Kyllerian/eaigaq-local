// src/App.js

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import BiometricRoute from './components/BiometricRoute'; // Новый импорт
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CaseDetailPage from './pages/CaseDetailPage';
import AllEmployeesPage from './pages/AllEmployeesPage';
import BiometricRegistrationPage from './pages/BiometricRegistrationPage'; // Новый импорт
import BiometricAuthenticationPage from './pages/BiometricAuthenticationPage'; // Убедитесь, что этот компонент существует
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  // Настройте тему по необходимости
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            {/* Маршрут для страницы входа */}
            <Route path="/login" element={<LoginPage />} />

            {/* Маршрут для регистрации биометрии */}
            <Route
              path="/register-biometric"
              element={
                <BiometricRoute type="registration">
                  <BiometricRegistrationPage />
                </BiometricRoute>
              }
            />

            {/* Маршрут для биометрической аутентификации */}
            <Route
              path="/biometric-authentication"
              element={
                <BiometricRoute type="authentication">
                  <BiometricAuthenticationPage />
                </BiometricRoute>
              }
            />

            {/* Защищённые маршруты */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/cases/:id/"
              element={
                <PrivateRoute>
                  <CaseDetailPage />
                </PrivateRoute>
              }
            />

            <Route
              path="/employees/all-departments"
              element={
                <PrivateRoute>
                  <AllEmployeesPage />
                </PrivateRoute>
              }
            />

            {/* Маршрут по умолчанию */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
