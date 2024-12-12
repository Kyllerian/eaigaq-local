// src/pages/Dashboard.js

import React, { useEffect, useState, useContext } from 'react';
import axios from '../axiosConfig';
import {
    Typography,
    Box,
    Tabs,
    Tab,
    Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Notifyer from '../components/Notifyer';
import EmployeesTab from '../components/Dashboard/Employees/EmployeesTab';
import EvidenceSearchTab from '../components/Dashboard/EvidenceSearchTab';
import CasesTab from '../components/Dashboard/CasesTab';
import CamerasTab from '../components/Dashboard/CamerasTab';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // Обработка вкладок
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        if (!user) return;

        if (user.role === 'DEPARTMENT_HEAD') {
            axios
                .get('/api/users/')
                .then((response) => {
                    setEmployees(response.data);
                })
                .catch((error) => {
                    setError('Ошибка при загрузке сотрудников.');
                });
        } else if (user.role === 'REGION_HEAD') {
            axios
                .get('/api/users/all_departments/')
                .then((response) => {
                    setEmployees(response.data);
                })
                .catch((error) => {
                    setError('Ошибка при загрузке сотрудников.');
                });

            axios
                .get('/api/departments/')
                .then((response) => {
                    setDepartments(response.data);
                })
                .catch((error) => {
                    setError('Ошибка при загрузке отделений.');
                });
        }
    }, [user]);

    const tabs = [
        {
            label: 'Дела',
            content: (
                <CasesTab
                    user={user}
                    departments={departments}
                    snackbar={snackbar}
                    setSnackbar={setSnackbar}
                    setError={setError}
                />
            ),
        },
    ];

    if (user && (user.role === 'DEPARTMENT_HEAD' || user.role === 'REGION_HEAD')) {
        tabs.push({
            label: 'Сотрудники',
            content: (
                <EmployeesTab
                    user={user}
                    employees={employees}
                    departments={departments}
                    setSnackbar={setSnackbar}
                    setEmployees={setEmployees}
                />
            ),
        });
        // // Добавляем новую вкладку Камеры
        tabs.push({
            label: 'Камеры',
            content: (
                <CamerasTab
                    user={user}
                    departments={departments}
                    setSnackbar={setSnackbar}
                />
            ),
        });
    }

    tabs.push({
        label: 'Поиск Вещдоков',
        content: (
            <EvidenceSearchTab setSnackbar={setSnackbar} />
        ),
    });

    return (
        <Box sx={{ backgroundColor: '#e9edf5', height: '100vh', overflowY: 'hidden' }}>
            <Layout>
                {user ? (
                    <>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{ marginBottom: theme.spacing(3) }}
                            TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
                            textColor="inherit"
                        >
                            {tabs.map((tab, index) => (
                                <Tab key={index} label={tab.label} />
                            ))}
                        </Tabs>

                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        {tabs[tabValue] && tabs[tabValue].content}
                    </>
                ) : (
                    <Typography variant="h4" gutterBottom>
                        Мои дела
                    </Typography>
                )}

                <Notifyer
                    snackbarOpened={snackbar.open}
                    setSnackbarOpen={setSnackbar}
                    message={snackbar.message}
                    severity={snackbar.severity}
                />
            </Layout>
        </Box>
    );
};

export default Dashboard;

// // src/pages/Dashboard.js
//
// import React, { useEffect, useState, useContext } from 'react';
// import axios from '../axiosConfig';
// import {
//   Typography,
//   Box,
//   Tabs,
//   Tab,
//   Alert,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import { AuthContext } from '../contexts/AuthContext';
// import Layout from '../components/Layout';
// import Notifyer from '../components/Notifyer';
// import EmployeesTab from '../components/Dashboard/Employees/EmployeesTab';
// import EvidenceSearchTab from '../components/Dashboard/EvidenceSearchTab';
// import CasesTab from '../components/Dashboard/CasesTab';
//
// const Dashboard = () => {
//   const { user } = useContext(AuthContext);
//   const theme = useTheme();
//
//   const [employees, setEmployees] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [error, setError] = useState(null);
//   const [tabValue, setTabValue] = useState(0);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success',
//   });
//
//   // Обработка вкладок
//   const handleTabChange = (event, newValue) => {
//     setTabValue(newValue);
//   };
//
//   useEffect(() => {
//     if (!user) return;
//
//     if (user.role === 'DEPARTMENT_HEAD') {
//       axios
//           .get('/api/users/')
//           .then((response) => {
//             setEmployees(response.data);
//           })
//           .catch((error) => {
//             setError('Ошибка при загрузке сотрудников.');
//           });
//     } else if (user.role === 'REGION_HEAD') {
//       axios
//           .get('/api/users/all_departments/')
//           .then((response) => {
//             setEmployees(response.data);
//           })
//           .catch((error) => {
//             setError('Ошибка при загрузке сотрудников.');
//           });
//
//       axios
//           .get('/api/departments/')
//           .then((response) => {
//             setDepartments(response.data);
//           })
//           .catch((error) => {
//             setError('Ошибка при загрузке отделений.');
//           });
//     }
//   }, [user]);
//
//   // Формируем массив вкладок в зависимости от роли пользователя
//   const tabs = [
//     {
//       label: 'Дела',
//       content: (
//           <CasesTab
//               user={user}
//               departments={departments}
//               snackbar={snackbar}
//               setSnackbar={setSnackbar}
//               setError={setError}
//           />
//       ),
//     },
//   ];
//
//   if (user && (user.role === 'DEPARTMENT_HEAD' || user.role === 'REGION_HEAD')) {
//     tabs.push({
//       label: 'Сотрудники',
//       content: (
//           <EmployeesTab
//               user={user}
//               employees={employees}
//               departments={departments}
//               setSnackbar={setSnackbar}
//               setEmployees={setEmployees}
//           />
//       ),
//     });
//   }
//
//   tabs.push({
//     label: 'Поиск Вещдоков',
//     content: (
//         <EvidenceSearchTab setSnackbar={setSnackbar} />
//     ),
//   });
//
//   return (
//       <Box sx={{ backgroundColor: '#e9edf5', height: '100vh', overflowY: 'hidden' }}>
//         {/* Основной контент */}
//         <Layout>
//           {/* Вкладки */}
//           {user ? (
//               <>
//                 <Tabs
//                     value={tabValue}
//                     onChange={handleTabChange}
//                     sx={{ marginBottom: theme.spacing(3) }}
//                     TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
//                     textColor="inherit"
//                 >
//                   {tabs.map((tab, index) => (
//                       <Tab key={index} label={tab.label} />
//                   ))}
//                 </Tabs>
//
//                 {error && (
//                     <Alert severity="error" sx={{ mb: 2 }}>
//                       {error}
//                     </Alert>
//                 )}
//
//                 {/* Контент выбранной вкладки */}
//                 {tabs[tabValue] && tabs[tabValue].content}
//               </>
//           ) : (
//               <Typography variant="h4" gutterBottom>
//                 Мои дела
//               </Typography>
//           )}
//
//           {/* Snackbar для уведомлений */}
//           <Notifyer
//               snackbarOpened={snackbar.open}
//               setSnackbarOpen={setSnackbar}
//               message={snackbar.message}
//               severity={snackbar.severity}
//           />
//         </Layout>
//       </Box>
//   );
// };
//
// export default Dashboard;