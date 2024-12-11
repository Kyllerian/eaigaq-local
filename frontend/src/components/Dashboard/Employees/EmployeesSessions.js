// frontend/src/components/Dashboard/Employees/EmployeesSessions.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    useMediaQuery,
    Pagination,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from '../../../axiosConfig.js';
import EmployeesTableSessions from './TableSessions.js';
import { useQuery } from 'react-query';
import EmployeesToolbar from './Toolbar.js';

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

const EmployeesSessions = ({ user, departments, setSnackbar }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Изначально ставим 10, но оно будет пересчитано

    // const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Дебаунс для поля поиска
    const debouncedEmployeeSearchQuery = useDebounce(employeeSearchQuery, 800);

    // Фиксированные высоты строк и заголовков
    const rowHeight = 52; // Стандартная высота строки в DataGridPro
    const headerHeight = 56; // Высота заголовка таблицы

    // Высота заголовков и фильтров
    const headerAndFiltersHeight = isSmallScreen ? 200 : 150;

    // Высота пагинации и отступов под таблицей
    const footerHeight = 100;

    // Рассчитываем pageSize в зависимости от высоты окна
    const calculatePageSize = useCallback(() => {
        const height = window.innerHeight;
        const availableHeight = height - headerAndFiltersHeight - footerHeight;
        let calculatedPageSize = Math.floor(availableHeight / rowHeight) - 8;
        return calculatedPageSize > 0 ? calculatedPageSize : 1; // Минимум 1 элемент на странице
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

    // Параметры запроса
    const params = {
        page: currentPage,
        page_size: pageSize,
        search: debouncedEmployeeSearchQuery || undefined,
        user__department: selectedEmployeeDepartment || undefined,
        login__gte: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
        login__lte: dateRange[1] ? dateRange[1].add(1, 'day').format('YYYY-MM-DD') : undefined,
    };

    // Функция для получения данных сотрудников
    const fetchEmployees = async ({ queryKey }) => {
        const [_key, params] = queryKey;
        const response = await axios.get('/api/sessions/', { params });
        console.log('response.data',response.data);
        return response.data;
    };

    // Используем useQuery для получения данных
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery(['employeesSessions', params], fetchEmployees, {
        keepPreviousData: true,
    });

    const employees = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Устанавливаем tableHeight на основе количества строк
    const tableHeight = (employees.length > 0 ? Math.min(employees.length, pageSize) : 7) * rowHeight + headerHeight;

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

    // Обработчики для фильтров и поиска
    const handleEmployeeSearchChange = useCallback((event) => {
        setEmployeeSearchQuery(event.target.value);
        setCurrentPage(1); // Сбрасываем на первую страницу
    }, []);

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange); // Обновляем состояние диапазона дат
        setCurrentPage(1);
    };

    const handleEmployeeDepartmentChange = useCallback((event) => {
        setSelectedEmployeeDepartment(event.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((event, value) => {
        setCurrentPage(value);
        //setSelectedEmployee(null); // Сбрасываем выделение при смене страницы
    }, []);

    // const handleEmployeeSelect = (employee) => {
    //     if (selectedEmployee && selectedEmployee.id === employee.id) {
    //         setSelectedEmployee(null);
    //     } else {
    //         setSelectedEmployee(employee);
    //     }
    // };

    // const handleToggleActive = () => {
    //     if (selectedEmployee.id === user.id) {
    //         setSnackbar({
    //             open: true,
    //             message: 'Вы не можете деактивировать свой собственный аккаунт.',
    //             severity: 'error',
    //         });
    //         return;
    //     }

    //     axios
    //         .patch(`/api/users/${selectedEmployee.id}/`, {
    //             is_active: !selectedEmployee.is_active,
    //         })
    //         .then(() => {
    //             setSnackbar({
    //                 open: true,
    //                 message: 'Статус сотрудника изменен.',
    //                 severity: 'success',
    //             });
    //             setSelectedEmployee(null);
    //             refetch(); // Обновляем список сотрудников
    //         })
    //         .catch((error) => {
    //             setSnackbar({
    //                 open: true,
    //                 message: 'Ошибка при изменении статуса сотрудника.',
    //                 severity: 'error',
    //             });
    //         });
    // };
    return (
        <Box sx={{ display: 'flex', width: '100%', flexDirection: 'column', }}>
            {/* Поля поиска и фильтров */}
            <EmployeesToolbar user={user} employeeSearchQuery={employeeSearchQuery} departments={departments}
                handleEmployeeSearchChange={handleEmployeeSearchChange} selectedEmployeeDepartment={selectedEmployeeDepartment}
                handleEmployeeDepartmentChange={handleEmployeeDepartmentChange} setSnackbar={setSnackbar} params={params} totalCount={totalCount}
                // selectedEmployee={selectedEmployee} handleToggleActive={handleToggleActive} 
                refetch={refetch} 
                tabSelected={'sessions'}
                dateRange={dateRange}
                handleDateRangeChange={handleDateRangeChange}
            />

            {/* Контейнер для таблицы и пагинации */}
            <Box>
                {/* Таблица сотрудников */}
                <EmployeesTableSessions
                    user={user}
                    employees={employees}
                    isLoading={isLoading}
                    //selectedEmployee={selectedEmployee}
                    //handleEmployeeSelect={handleEmployeeSelect}
                    tableHeight={tableHeight}
                    pageSize={pageSize}
                    rowHeight={rowHeight}
                />

                {/* Элементы пагинации */}
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

export default EmployeesSessions;
