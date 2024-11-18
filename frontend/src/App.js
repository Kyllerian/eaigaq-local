// src/App.js
import { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import BiometricRoute from './components/BiometricRoute'; // Новый импорт
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CaseDetailPage from './pages/CaseDetailPage';
import AllEmployeesPage from './pages/AllEmployeesPage';
import BiometricRegistrationPage from './pages/BiometricRegistrationPage'; // Новый импорт
import BiometricAuthenticationPage from './pages/BiometricAuthenticationPage'; // Убедитесь, что этот компонент существует
import { AuthProvider, AuthContext} from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import axios from './axiosConfig';


const theme = createTheme({
  // Настройте тему по необходимости
});

function App() {

    // const { logout } = useContext(AuthContext);
    // // Добавляем обработчик события при монтировании компонента
    // useEffect(() => {
    //     const handleBeforeUnload = (event) => {
    //         logout();
    //     };
    //
    //     window.addEventListener('beforeunload', handleBeforeUnload);
    //
    //     // Очищаем обработчик при размонтировании
    //     return () => {
    //         window.removeEventListener('beforeunload', handleBeforeUnload);
    //     };
    // }, [logout]);

    // useEffect(() => {
    //     const handleUnload = () => {
    //         axios.post('/api/logout/')
    //     };
    //
    //     window.addEventListener('unload', handleUnload);
    //
    //     return () => {
    //         window.removeEventListener('unload', handleUnload);
    //     };
    // }, []);

  // useEffect(() => {
  //   const handleTabClose = event => {
  //     event.preventDefault();
  //
  //     const navigationEntries = performance.getEntriesByType('navigation');
  //     console.log(navigationEntries)
  //     const navigationType = navigationEntries.length > 0 ? navigationEntries[0].type : null;
  //     // if (navigationType) {
  //     //     console.log('true')
  //     // } else {console.log('false')}
  //     console.log("navigationType", navigationType);
  //
  //     if (navigationType === 'reload') {
  //       // Если это перезагрузка, ничего не делаем
  //       window.location.reload();
  //       // event.returnValue = 'Вы уверены, что хотите блядь?';
  //       return false;
  //     } else if (navigationType !== 'reload') {
  //         event.returnValue = 'Вы уверены, что хотите выйти?';
  //         return event.returnValue && axios.post('/api/logout/');
  //     }
  //
  //     // event.returnValue = 'Вы уверены, что хотите выйти?';
  //     //
  //     // // Отправляем запрос на сервер с помощью sendBeacon
  //     // // navigator.sendBeacon('/api/logout/');
  //     // return event.returnValue && axios.post('/api/logout/');
  //   };
  //
  //   window.addEventListener('beforeunload', handleTabClose);
  //
  //   return () => {
  //     window.removeEventListener('beforeunload', handleTabClose);
  //   };
  // }, []);
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
