// // frontend/src/components/Dashboard/Employees/EmployeesStats.js

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//     Box,
//     useMediaQuery,
//     Pagination,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import axios from '../../../axiosConfig.js';
// import EmployeesTable from './Table.js';
// import { useQuery } from 'react-query';
// import EmployeesToolbar from './Toolbar.js';
// import EmployeesTableStats from './TableStats.js';

// // Хук для дебаунса
// function useDebounce(value, delay) {
//     const [debouncedValue, setDebouncedValue] = useState(value);

//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setDebouncedValue(value);
//         }, delay);

//         return () => {
//             clearTimeout(handler);
//         };
//     }, [value, delay]);

//     return debouncedValue;
// }

// const EmployeesStats = ({ user, departments, setSnackbar }) => {
//     const theme = useTheme();
//     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

//     const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
//     const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10); // Изначально ставим 10, но оно будет пересчитано

//     const [selectedEmployee, setSelectedEmployee] = useState(null);

//     // Дебаунс для поля поиска
//     const debouncedEmployeeSearchQuery = useDebounce(employeeSearchQuery, 800);

//     // Фиксированные высоты строк и заголовков
//     const rowHeight = 52; // Стандартная высота строки в DataGridPro
//     const headerHeight = 56; // Высота заголовка таблицы

//     // Высота заголовков и фильтров
//     const headerAndFiltersHeight = isSmallScreen ? 200 : 150;

//     // Высота пагинации и отступов под таблицей
//     const footerHeight = 100;

//     // Рассчитываем pageSize в зависимости от высоты окна
//     const calculatePageSize = useCallback(() => {
//         const height = window.innerHeight;
//         const availableHeight = height - headerAndFiltersHeight - footerHeight;
//         let calculatedPageSize = Math.floor(availableHeight / rowHeight) - 7;
//         return calculatedPageSize > 0 ? calculatedPageSize : 1; // Минимум 1 элемент на странице
//     }, [headerAndFiltersHeight, footerHeight, rowHeight]);

//     // Инициализируем pageSize при монтировании и на изменении размеров окна
//     useEffect(() => {
//         const handleResize = () => {
//             const newPageSize = calculatePageSize();
//             setPageSize(newPageSize);
//         };

//         window.addEventListener('resize', handleResize);
//         // Инициализируем pageSize при монтировании
//         const initialPageSize = calculatePageSize();
//         setPageSize(initialPageSize);

//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, [calculatePageSize]);

//     // Параметры запроса
//     const params = {
//         page: currentPage,
//         page_size: pageSize,
//         search: debouncedEmployeeSearchQuery || undefined,
//         department: selectedEmployeeDepartment || undefined,
//     };

//     // Функция для получения данных сотрудников
//     // const fetchEmployees = async ({ queryKey }) => {
//     //     const [_key, params] = queryKey;
//     //     const response = await axios.get('/api/users/', { params });
//     //     return response.data;
//     // };
//     const fetchUsersWithCases = async ({ queryKey }) => {
//         const [_key, params] = queryKey;

//         // Запрашиваем пользователей и дела
//         const [responseUsers, responseCases] = await Promise.all([
//             axios.get('/api/users/', { params }),
//             axios.get('/api/cases/'),
//         ]);

//         // console.log(responseUsers.data.results, "Users");
//         // console.log(responseCases.data, "Cases");

//         const users = responseUsers.data.results;
//         const cases = responseCases.data;

//         // Создаем маппинг дел по id пользователей (investigator)
//         const casesMap = cases.reduce((map, caseItem) => {
//             if (!map[caseItem.investigator]) {
//                 map[caseItem.investigator] = [];
//             }
//             map[caseItem.investigator].push(caseItem);
//             return map;
//         }, {});

//         // Добавляем список дел к каждому пользователю
//         const usersWithCases = users.map((user) => {
//             const userCases = casesMap[user.id] || [];
//             const openedCasesCount = userCases.reduce(
//                 (count, caseItem) => count + (caseItem.active ? 1 : 0),
//                 0
//             );
//             const closedCasesCount = userCases.reduce(
//                 (count, caseItem) => count + (caseItem.active ? 0 : 1),
//                 0
//             );

//             return {
//                 ...user,
//                 cases: casesMap[user.id] || [],
//                 openedCasesCount,
//                 closedCasesCount,
//             }
//         });
//         // console.log(usersWithCases, "usersWithCases");
//         responseUsers.data = {
//             ...(responseUsers.data),
//             results: usersWithCases
//         }
//         return responseUsers.data;
//     };


//     // Используем useQuery для получения данных
//     const {
//         data,
//         isLoading,
//         isError,
//         error,
//         refetch,
//     } = useQuery(['employeesStats', params], fetchUsersWithCases, {
//         keepPreviousData: true,
//     });

//     const employees = data?.results || [];
//     const totalCount = data?.count || 0;
//     const totalPages = Math.ceil(totalCount / pageSize);

//     // Устанавливаем tableHeight на основе количества строк
//     const tableHeight = (employees.length > 0 ? Math.min(employees.length, pageSize) : 1) * rowHeight + headerHeight;

//     useEffect(() => {
//         if (isError) {
//             console.error('Ошибка при получении сотрудников:', error);
//             setSnackbar({
//                 open: true,
//                 message: 'Ошибка при получении сотрудников.',
//                 severity: 'error',
//             });
//         }
//     }, [isError, error, setSnackbar]);

//     // Обработчики для фильтров и поиска
//     const handleEmployeeSearchChange = useCallback((event) => {
//         setEmployeeSearchQuery(event.target.value);
//         setCurrentPage(1); // Сбрасываем на первую страницу
//     }, []);

//     const handleEmployeeDepartmentChange = useCallback((event) => {
//         setSelectedEmployeeDepartment(event.target.value);
//         setCurrentPage(1);
//     }, []);

//     const handlePageChange = useCallback((event, value) => {
//         setCurrentPage(value);
//         setSelectedEmployee(null); // Сбрасываем выделение при смене страницы
//     }, []);

//     const handleEmployeeSelect = (employee) => {
//         if (selectedEmployee && selectedEmployee.id === employee.id) {
//             setSelectedEmployee(null);
//         } else {
//             setSelectedEmployee(employee);
//         }
//     };

//     const handleToggleActive = () => {
//         if (selectedEmployee.id === user.id) {
//             setSnackbar({
//                 open: true,
//                 message: 'Вы не можете деактивировать свой собственный аккаунт.',
//                 severity: 'error',
//             });
//             return;
//         }

//         axios
//             .patch(`/api/users/${selectedEmployee.id}/`, {
//                 is_active: !selectedEmployee.is_active,
//             })
//             .then(() => {
//                 setSnackbar({
//                     open: true,
//                     message: 'Статус сотрудника изменен.',
//                     severity: 'success',
//                 });
//                 setSelectedEmployee(null);
//                 refetch(); // Обновляем список сотрудников
//             })
//             .catch((error) => {
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при изменении статуса сотрудника.',
//                     severity: 'error',
//                 });
//             });
//     };
//     return (
//         <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', }}>
//             {/* Поля поиска и фильтров */}
//             <EmployeesToolbar user={user} employeeSearchQuery={employeeSearchQuery} departments={departments}
//                 handleEmployeeSearchChange={handleEmployeeSearchChange} selectedEmployeeDepartment={selectedEmployeeDepartment}
//                 handleEmployeeDepartmentChange={handleEmployeeDepartmentChange} setSnackbar={setSnackbar} params={params} totalCount={totalCount} refetch={refetch}
//             />

//             {/* Контейнер для таблицы и пагинации */}
//             <Box>
//                 {/* Таблица сотрудников */}
//                 <EmployeesTableStats
//                     user={user}
//                     employees={employees}
//                     isLoading={isLoading}
//                     selectedEmployee={selectedEmployee}
//                     handleEmployeeSelect={handleEmployeeSelect}
//                     tableHeight={tableHeight}
//                     pageSize={pageSize}
//                     rowHeight={rowHeight}
//                 />

//                 {/* Элементы пагинации */}
//                 {totalPages > 1 && (
//                     <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//                         <Pagination
//                             count={totalPages}
//                             page={currentPage}
//                             onChange={handlePageChange}
//                         />
//                     </Box>
//                 )}
//             </Box>
//         </Box>
//     );
// };

// export default EmployeesStats;

// frontend/src/components/Dashboard/Employees/EmployeesStats.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    useMediaQuery,
    Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from '../../../axiosConfig.js';
import { useQuery } from 'react-query';
import EmployeesToolbar from './Toolbar.js';
import EmployeesTableStats from './TableStats.js';

// Хук для дебаунса
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const EmployeesStats = ({ user, departments, setSnackbar }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Изначально ставим 10, но оно будет пересчитано

    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Дебаунс для поля поиска
    const debouncedEmployeeSearchQuery = useDebounce(employeeSearchQuery, 800);

    // Фиксированные высоты строк и заголовков
    const rowHeight = 90; // Стандартная высота строки
    const headerHeight = 56; // Высота заголовка таблицы
    const headerAndFiltersHeight = isSmallScreen ? 200 : 150;
    const footerHeight = 100;

    // Рассчитываем pageSize в зависимости от высоты окна
    const calculatePageSize = useCallback(() => {
        const height = window.innerHeight;
        const availableHeight = height - headerAndFiltersHeight - footerHeight;
        let calculatedPageSize = Math.floor(availableHeight / rowHeight) - 3;
        return calculatedPageSize > 0 ? calculatedPageSize : 1;
    }, [headerAndFiltersHeight, footerHeight, rowHeight]);

    // Инициализируем pageSize при монтировании и на изменении размеров окна
    useEffect(() => {
        const handleResize = () => {
            const newPageSize = calculatePageSize();
            setPageSize(newPageSize);
        };

        window.addEventListener('resize', handleResize);
        // Инициализируем pageSize при монтировании
        const initialPageSize = calculatePageSize();
        setPageSize(initialPageSize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [calculatePageSize]);

    // Параметры для запроса пользователей
    const params = {
        page: currentPage,
        page_size: pageSize,
        search: debouncedEmployeeSearchQuery || undefined,
        department: selectedEmployeeDepartment || undefined,
    };

    // Загружаем дела один раз и кэшируем их
    const {
        data: casesData,
        isLoading: isCasesLoading,
        isError: isCasesError,
        error: casesError
    } = useQuery(
        'cases',
        async () => {
            const response = await axios.get('/api/cases/');
            return response.data;
        },
        {
            staleTime: Infinity, 
            cacheTime: Infinity,
        }
    );

    // Запрашиваем пользователей и объединяем их с делами из casesData
    const {
        data: employeesData,
        isLoading: isLoadingUsers,
        isError: isUsersError,
        error: usersError,
        refetch,
    } = useQuery(
        ['employeesStats', params],
        async ({ queryKey }) => {
            const [_key, params] = queryKey;
            const response = await axios.get('/api/users/', { params });
            return response.data;
        },
        {
            keepPreviousData: true,
            enabled: !!casesData, // Дела должны быть загружены
            staleTime: 1000 * 60 * 5, 
            cacheTime: 1000 * 60 * 30,
            select: (data) => {
                if (!casesData) return data;
                const users = data.results;

                // Создаем мап для дел
                const casesMap = casesData.reduce((map, caseItem) => {
                    if (!map[caseItem.investigator]) {
                        map[caseItem.investigator] = [];
                    }
                    map[caseItem.investigator].push(caseItem);
                    return map;
                }, {});

                const usersWithCases = users.map((u) => {
                    const userCases = casesMap[u.id] || [];
                    const openedCasesCount = userCases.filter(c => c.active).length;
                    const closedCasesCount = userCases.filter(c => !c.active).length;
                    return {
                        ...u,
                        cases: userCases,
                        openedCasesCount,
                        closedCasesCount,
                    };
                });

                return {
                    ...data,
                    results: usersWithCases,
                };
            }
        }
    );

    const isLoading = isLoadingUsers || isCasesLoading;
    const isError = isUsersError || isCasesError;
    const error = usersError || casesError;

    const employees = employeesData?.results || [];
    const totalCount = employeesData?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Устанавливаем высоту таблицы
    const tableHeight = (employees.length > 0 ? Math.min(employees.length, pageSize) : 5) * rowHeight + headerHeight;

    useEffect(() => {
        if (isError) {
            console.error('Ошибка при получении сотрудников:', error);
            setSnackbar({
                open: true,
                message: 'Ошибка при получении сотрудников.',
                severity: 'error',
            });
        }
    }, [isError, error, setSnackbar]);

    // Обработчики
    const handleEmployeeSearchChange = useCallback((event) => {
        setEmployeeSearchQuery(event.target.value);
        console.log(event.target.value);
        setCurrentPage(1); // Сбрасываем на первую страницу
    }, []);

    const handleEmployeeDepartmentChange = useCallback((event) => {
        setSelectedEmployeeDepartment(event.target.value);
        console.log(event.target.value, 'department');
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((event, value) => {
        setCurrentPage(value);
        setSelectedEmployee(null); // Сбрасываем выделение при смене страницы
    }, []);

    const handleEmployeeSelect = (employee) => {
        if (selectedEmployee && selectedEmployee.id === employee.id) {
            setSelectedEmployee(null);
        } else {
            setSelectedEmployee(employee);
        }
    };

    const handleToggleActive = () => {
        if (selectedEmployee.id === user.id) {
            setSnackbar({
                open: true,
                message: 'Вы не можете деактивировать свой собственный аккаунт.',
                severity: 'error',
            });
            return;
        }

        axios
            .patch(`/api/users/${selectedEmployee.id}/`, {
                is_active: !selectedEmployee.is_active,
            })
            .then(() => {
                setSnackbar({
                    open: true,
                    message: 'Статус сотрудника изменен.',
                    severity: 'success',
                });
                setSelectedEmployee(null);
                refetch(); // Обновляем список сотрудников
            })
            .catch((error) => {
                setSnackbar({
                    open: true,
                    message: 'Ошибка при изменении статуса сотрудника.',
                    severity: 'error',
                });
            });
    };

    return (
        <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
            {/* Поля поиска и фильтров */}
            <EmployeesToolbar 
                user={user} 
                employeeSearchQuery={employeeSearchQuery} 
                departments={departments}
                handleEmployeeSearchChange={handleEmployeeSearchChange} 
                selectedEmployeeDepartment={selectedEmployeeDepartment}
                handleEmployeeDepartmentChange={handleEmployeeDepartmentChange} 
                setSnackbar={setSnackbar} 
                params={params} 
                selectedEmployee={selectedEmployee} 
                handleToggleActive={handleToggleActive}
                totalCount={totalCount} 
                refetch={refetch}
                // для статистики
                casesData={casesData}
                tabSelected={'stats'}
            />

            {/* Контейнер для таблицы и пагинации */}
            <Box>
                {/* Таблица сотрудников */}
                <EmployeesTableStats
                    user={user}
                    employees={employees}
                    isLoading={isLoading}
                    selectedEmployee={selectedEmployee}
                    handleEmployeeSelect={handleEmployeeSelect}
                    tableHeight={tableHeight}
                    pageSize={pageSize}
                    rowHeight={rowHeight}
                />

                {/* Пагинация */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default EmployeesStats;
