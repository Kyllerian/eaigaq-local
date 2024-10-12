// src/App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CaseDetailPage from './pages/CaseDetailPage'; // Обновили импорт
import AllEmployeesPage from './pages/AllEmployeesPage'; // Новый импорт
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

            {/* Добавьте другие маршруты здесь */}
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

// // src/App.js
//
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import PrivateRoute from './components/PrivateRoute';
// import LoginPage from './pages/LoginPage';
// import Dashboard from './pages/Dashboard';
// import CasePage from './pages/CaseDetailPage'; // Используем компонент CasePage
// import { AuthProvider } from './contexts/AuthContext';
// import { ThemeProvider, createTheme } from '@mui/material/styles';
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
//             <Route path="/login" element={<LoginPage />} />
//
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
//                   <CasePage />
//                 </PrivateRoute>
//               }
//             />
//
//             {/* Добавьте другие маршруты здесь */}
//           </Routes>
//         </Router>
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }
//
// export default App;
