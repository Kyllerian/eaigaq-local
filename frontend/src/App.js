// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import BiometricRoute from './components/BiometricRoute';
import LoginPage from './pages/LoginPage';
import { ManualPage } from './pages/ManualPage';
import Dashboard from './pages/Dashboard';
import CaseDetailPage from './pages/CaseDetailPage';
import AllEmployeesPage from './pages/AllEmployeesPage';
import BiometricRegistrationPage from './pages/BiometricRegistrationPage';
import BiometricAuthenticationPage from './pages/BiometricAuthenticationPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';


// Импортируем QueryClient и QueryClientProvider из react-query
import { QueryClient, QueryClientProvider } from 'react-query';

import { useTranslation } from 'react-i18next';
import { LangsSwitcher } from './utils/langs/langs_switcher';
import { ManualPageKZ } from './pages/ManualPageKZ';

const theme = createTheme({
  // Настройте тему по необходимости
});

// Создаём экземпляр QueryClient
const queryClient = new QueryClient();

function App() {
  const { i18n } = useTranslation();
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        {/* Оборачиваем приложение в QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <Router>
            <Routes>
              {/* Маршрут для страницы входа */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/manual" element={i18n.language === 'kz' ? <ManualPageKZ /> : <ManualPage />} />

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
        </QueryClientProvider>
        <LangsSwitcher/>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

// // src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import PrivateRoute from './components/PrivateRoute';
// import BiometricRoute from './components/BiometricRoute';
// import LoginPage from './pages/LoginPage';
// import { ManualPage } from './pages/ManualPage';
// import Dashboard from './pages/Dashboard';
// import CaseDetailPage from './pages/CaseDetailPage';
// import AllEmployeesPage from './pages/AllEmployeesPage';
// import BiometricRegistrationPage from './pages/BiometricRegistrationPage';
// import BiometricAuthenticationPage from './pages/BiometricAuthenticationPage';
// import { AuthProvider } from './contexts/AuthContext';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import axios from './axiosConfig';

// // Импортируем QueryClient и QueryClientProvider из react-query
// import { QueryClient, QueryClientProvider } from 'react-query';

// const theme = createTheme({
//   // Настройте тему по необходимости
// });

// // Создаём экземпляр QueryClient
// const queryClient = new QueryClient();

// function App() {
//   return (
//     <AuthProvider>
//       <ThemeProvider theme={theme}>
//         {/* Оборачиваем приложение в QueryClientProvider */}
//         <QueryClientProvider client={queryClient}>
//           <Router>
//             <Routes>
//               {/* Маршрут для страницы входа */}
//               <Route path="/login" element={<LoginPage />} />
//               <Route path="/manual" element={<ManualPage />} />

//               {/* Маршрут для регистрации биометрии */}
//               <Route
//                 path="/register-biometric"
//                 element={
//                   <BiometricRoute type="registration">
//                     <BiometricRegistrationPage />
//                   </BiometricRoute>
//                 }
//               />

//               {/* Маршрут для биометрической аутентификации */}
//               <Route
//                 path="/biometric-authentication"
//                 element={
//                   <BiometricRoute type="authentication">
//                     <BiometricAuthenticationPage />
//                   </BiometricRoute>
//                 }
//               />

//               {/* Защищённые маршруты */}
//               <Route
//                 path="/"
//                 element={
//                   <PrivateRoute>
//                     <Dashboard />
//                   </PrivateRoute>
//                 }
//               />

//               <Route
//                 path="/cases/:id/"
//                 element={
//                   <PrivateRoute>
//                     <CaseDetailPage />
//                   </PrivateRoute>
//                 }
//               />

//               <Route
//                 path="/employees/all-departments"
//                 element={
//                   <PrivateRoute>
//                     <AllEmployeesPage />
//                   </PrivateRoute>
//                 }
//               />

//               {/* Маршрут по умолчанию */}
//               <Route path="*" element={<Navigate to="/" />} />
//             </Routes>
//           </Router>
//         </QueryClientProvider>
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }

// export default App;

// // src/App.js
// import { useEffect, useContext } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import PrivateRoute from './components/PrivateRoute';
// import BiometricRoute from './components/BiometricRoute'; // Новый импорт
// import LoginPage from './pages/LoginPage';
// import Dashboard from './pages/Dashboard';
// import CaseDetailPage from './pages/CaseDetailPage';
// import AllEmployeesPage from './pages/AllEmployeesPage';
// import BiometricRegistrationPage from './pages/BiometricRegistrationPage'; // Новый импорт
// import BiometricAuthenticationPage from './pages/BiometricAuthenticationPage'; // Убедитесь, что этот компонент существует
// import { AuthProvider, AuthContext} from './contexts/AuthContext';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
// import axios from './axiosConfig';
//
//
// const theme = createTheme({
//   // Настройте тему по необходимости
// });
//
// function App() {
//   return (
//     <AuthProvider>
//       <ThemeProvider theme={theme}>
//         <Router>
//           <Routes>
//             {/* Маршрут для страницы входа */}
//             <Route path="/login" element={<LoginPage />} />
//
//             {/* Маршрут для регистрации биометрии */}
//             <Route
//               path="/register-biometric"
//               element={
//                 <BiometricRoute type="registration">
//                   <BiometricRegistrationPage />
//                 </BiometricRoute>
//               }
//             />
//
//             {/* Маршрут для биометрической аутентификации */}
//             <Route
//               path="/biometric-authentication"
//               element={
//                 <BiometricRoute type="authentication">
//                   <BiometricAuthenticationPage />
//                 </BiometricRoute>
//               }
//             />
//
//             {/* Защищённые маршруты */}
//             <Route
//               path="/"
//               element={
//                 <PrivateRoute>
//                   <Dashboard />
//                 </PrivateRoute>
//               }
//             />
//
//             <Route
//               path="/cases/:id/"
//               element={
//                 <PrivateRoute>
//                   <CaseDetailPage />
//                 </PrivateRoute>
//               }
//             />
//
//             <Route
//               path="/employees/all-departments"
//               element={
//                 <PrivateRoute>
//                   <AllEmployeesPage />
//                 </PrivateRoute>
//               }
//             />
//
//             {/* Маршрут по умолчанию */}
//             <Route path="*" element={<Navigate to="/" />} />
//           </Routes>
//         </Router>
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }
//
// export default App;
