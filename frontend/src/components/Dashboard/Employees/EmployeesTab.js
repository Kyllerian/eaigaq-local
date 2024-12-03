// frontend/src/components/Dashboard/Employees/EmployeesTab.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Button,
    Menu,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    Pagination,
} from '@mui/material';
import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
    Description as DescriptionIcon,
    PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from '../../../axiosConfig';
import EmployeesTable from './Table';
import DialogNewEmployees from './DialogNewEmployees';
import { useQuery } from 'react-query';
import Loading from '../../Loading.jsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../../constants/formatDate';
import { useReactToPrint } from 'react-to-print';
import EmployeesReportPDF from './EmployeesReportPDF'; // Импортируем компонент для отчета в PDF

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

const EmployeesTab = ({ user, departments, setSnackbar }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // Изначально ставим 10, но оно будет пересчитано

    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Экспорт данных
    const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);

    // Состояние для диалога добавления сотрудника
    const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);

    // Реф и состояние для отчета в PDF
    const employeesReportRef = useRef();
    const [employeesExportData, setEmployeesExportData] = useState([]);

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
        department: selectedEmployeeDepartment || undefined,
    };

    // Функция для получения данных сотрудников
    const fetchEmployees = async ({ queryKey }) => {
        const [_key, params] = queryKey;
        const response = await axios.get('/api/users/', { params });
        return response.data;
    };

    // Используем useQuery для получения данных
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery(['employees', params], fetchEmployees, {
        keepPreviousData: true,
    });

    const employees = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Устанавливаем tableHeight на основе количества строк
    const tableHeight = (employees.length > 0 ? Math.min(employees.length, pageSize) : 1) * rowHeight + headerHeight;

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

    const handleEmployeeDepartmentChange = useCallback((event) => {
        setSelectedEmployeeDepartment(event.target.value);
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

    // Обработчики для экспорта
    const handleExportMenuOpen = (event) => {
        setExportMenuAnchorEl(event.currentTarget);
    };
    const handleExportMenuClose = () => {
        setExportMenuAnchorEl(null);
    };

    // Функция для печати отчета в PDF
    const handlePrintEmployeesReport = useReactToPrint({
        contentRef: employeesReportRef,
        documentTitle: 'Отчет по сотрудникам',
        onAfterPrint: () => {
            setEmployeesExportData([]); // Очищаем данные после печати
        },
    });

    // Используем useEffect для вызова печати после обновления данных
    useEffect(() => {
        if (employeesExportData.length > 0) {
            handlePrintEmployeesReport();
        }
    }, [employeesExportData, handlePrintEmployeesReport]);

    const handleEmployeesExport = useCallback(
        (type) => {
            setExportLoading(true);
            handleExportMenuClose();
            const exportParams = {
                ...params,
                page_size: totalCount || 1000, // Получаем все записи
            };

            axios
                .get('/api/users/', { params: exportParams })
                .then(async (response) => {
                    const exportData = response.data.results || [];
                    if (type === 'excel') {
                        await handleExportExcel(exportData);
                    } else if (type === 'pdf') {
                        if (exportData.length === 0) {
                            setSnackbar({
                                open: true,
                                message: 'Нет данных для экспорта.',
                                severity: 'warning',
                            });
                            setExportLoading(false);
                            return;
                        }
                        setEmployeesExportData(exportData);
                        setExportLoading(false);
                        // handlePrintEmployeesReport будет вызван в useEffect
                    }
                })
                .catch((error) => {
                    console.error('Ошибка при экспорте сотрудников:', error);
                    setSnackbar({
                        open: true,
                        message: 'Ошибка при экспорте сотрудников.',
                        severity: 'error',
                    });
                    setExportLoading(false);
                });
        },
        [params, totalCount, setSnackbar]
    );

    // Обработчик экспорта в Excel
    const handleExportExcel = useCallback(
        async (exportData) => {
            if (exportData.length === 0) {
                setSnackbar({
                    open: true,
                    message: 'Нет данных для экспорта.',
                    severity: 'warning',
                });
                return;
            }
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Сотрудники');

                // Добавляем заголовки
                worksheet.columns = [
                    { header: 'Фамилия', key: 'last_name', width: 20 },
                    { header: 'Имя', key: 'first_name', width: 20 },
                    { header: 'Звание', key: 'rank', width: 20 },
                    { header: 'Роль', key: 'role_display', width: 20 },
                    { header: 'Электронная почта', key: 'email', width: 25 },
                    { header: 'Отделение', key: 'department_name', width: 25 },
                    { header: 'Статус', key: 'is_active_display', width: 15 },
                    { header: 'Дата последнего входа', key: 'last_login', width: 25 },
                ];

                // Добавляем данные
                exportData.forEach((employee) => {
                    worksheet.addRow({
                        last_name: employee.last_name,
                        first_name: employee.first_name,
                        rank: employee.rank,
                        role_display: employee.role_display,
                        email: employee.email,
                        department_name: employee.department_name || 'Не указано',
                        is_active_display: employee.is_active ? 'Активен' : 'Неактивен',
                        last_login: employee.last_login
                            ? formatDate(employee.last_login)
                            : 'Никогда',
                    });
                });

                // Применяем стили к заголовкам
                worksheet.getRow(1).font = { bold: true };

                // Генерируем буфер
                const buffer = await workbook.xlsx.writeBuffer();

                // Сохраняем файл
                const blob = new Blob([buffer], { type: 'application/octet-stream' });
                saveAs(blob, 'Сотрудники.xlsx');
            } catch (error) {
                console.error('Ошибка при экспорте в Excel:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при экспорте в Excel.',
                    severity: 'error',
                });
            } finally {
                setExportLoading(false);
            }
        },
        [setSnackbar]
    );

    return (
        <>
            {/* Основной контейнер */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Поля поиска и фильтров */}
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: theme.spacing(2),
                            mb: theme.spacing(2),
                        }}
                    >
                        <TextField
                            label="Поиск по имени, фамилии, званию, роли или email"
                            variant="outlined"
                            value={employeeSearchQuery}
                            onChange={handleEmployeeSearchChange}
                            size="small"
                            sx={{ flexGrow: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {user.role === 'REGION_HEAD' && (
                            <FormControl variant="outlined" size="small" sx={{ minWidth: 200, maxWidth: 200 }}>
                                <InputLabel id="department-filter-label">Отделение</InputLabel>
                                <Select
                                    labelId="department-filter-label"
                                    value={selectedEmployeeDepartment}
                                    onChange={handleEmployeeDepartmentChange}
                                    label="Отделение"
                                >
                                    <MenuItem value="">
                                        <em>Все отделения</em>
                                    </MenuItem>
                                    {departments.map((department) => (
                                        <MenuItem key={department.id} value={department.id}>
                                            {department.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {/* Кнопка экспорта с меню */}
                        <Box sx={{ display: 'flex', gap: theme.spacing(1), ml: 'auto' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleExportMenuOpen}
                                startIcon={<GetAppIcon />}
                                sx={{ height: '40px' }}
                            >
                                Экспорт
                            </Button>
                            <Menu
                                anchorEl={exportMenuAnchorEl}
                                open={Boolean(exportMenuAnchorEl)}
                                onClose={handleExportMenuClose}
                            >
                                <MenuItem onClick={() => handleEmployeesExport('excel')}>
                                    <ListItemIcon>
                                        <DescriptionIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Экспорт Excel</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleEmployeesExport('pdf')}>
                                    <ListItemIcon>
                                        <PictureAsPdfIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Экспорт PDF</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>

                        {/* Кнопка изменения статуса сотрудника */}
                        {selectedEmployee && (
                            <Button
                                onClick={handleToggleActive}
                                variant="contained"
                                color={selectedEmployee.is_active ? 'error' : 'success'}
                                sx={{ height: '40px' }}
                            >
                                {selectedEmployee.is_active ? 'Деактивировать' : 'Активировать'}
                            </Button>
                        )}
                    </Box>
                    {/* Добавляем кнопку "Добавить сотрудника" под строкой поиска */}
                    {(user.role === 'REGION_HEAD' || user.role === 'DEPARTMENT_HEAD') && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenEmployeeDialog(true)}
                        >
                            Добавить сотрудника
                        </Button>
                    )}
                </Box>

                {/* Контейнер для таблицы и пагинации */}
                <Box>
                    {/* Таблица сотрудников */}
                    <EmployeesTable
                        user={user}
                        employees={employees}
                        isLoading={isLoading}
                        selectedEmployee={selectedEmployee}
                        handleEmployeeSelect={handleEmployeeSelect}
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

            {exportLoading && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        width: '100vw',
                        background: 'rgba(0,0,0, 0.25)',
                        zIndex: '99999',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Loading />
                </div>
            )}

            {/* Диалог для добавления нового сотрудника */}
            <DialogNewEmployees
                user={user}
                departments={departments}
                setSnackbar={setSnackbar}
                openEmployeeDialog={openEmployeeDialog}
                setOpenEmployeeDialog={setOpenEmployeeDialog}
                refetchEmployees={refetch}
            />

            {/* Компонент для печати отчета в PDF */}
            <EmployeesReportPDF
                employeesReportRef={employeesReportRef}
                currentUser={user}
                employeeSearchQuery={employeeSearchQuery}
                selectedEmployeeDepartment={
                    departments.find((dept) => dept.id === selectedEmployeeDepartment)?.name || ''
                }
                employeesExportData={employeesExportData}
            />
        </>
    );
};

export default EmployeesTab;




// // frontend/src/components/Dashboard/Employees/EmployeesTab.js
//
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//     Box,
//     TextField,
//     InputAdornment,
//     FormControl,
//     Select,
//     MenuItem,
//     InputLabel,
//     Button,
//     Menu,
//     ListItemIcon,
//     ListItemText,
//     useMediaQuery,
//     Pagination,
// } from '@mui/material';
// import {
//     Search as SearchIcon,
//     GetApp as GetAppIcon,
//     Description as DescriptionIcon,
//     PictureAsPdf as PictureAsPdfIcon,
// } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import axios from '../../../axiosConfig';
// import EmployeesTable from './Table';
// import DialogNewEmployees from './DialogNewEmployees';
// import { useQuery } from 'react-query';
// import Loading from '../../Loading.jsx';
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { formatDate } from '../../../constants/formatDate';
// import { useReactToPrint } from 'react-to-print';
// import EmployeesReportPDF from './EmployeesReportPDF'; // Импортируем компонент для отчета в PDF
//
// // Хук для дебаунса
// function useDebounce(value, delay) {
//     const [debouncedValue, setDebouncedValue] = useState(value);
//
//     useEffect(
//         () => {
//             const handler = setTimeout(() => {
//                 setDebouncedValue(value);
//             }, delay);
//
//             return () => {
//                 clearTimeout(handler);
//             };
//         },
//         [value, delay]
//     );
//
//     return debouncedValue;
// }
//
// const EmployeesTab = ({ user, departments, setSnackbar }) => {
//     const theme = useTheme();
//     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
//
//     const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
//     const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10); // Изначально ставим 10, но оно будет пересчитано
//
//     const [selectedEmployee, setSelectedEmployee] = useState(null);
//
//     // Экспорт данных
//     const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
//     const [exportLoading, setExportLoading] = useState(false);
//
//     // Состояние для диалога добавления сотрудника
//     const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
//
//     // Реф и состояние для отчета в PDF
//     const employeesReportRef = useRef();
//     const [employeesExportData, setEmployeesExportData] = useState([]);
//
//     // Дебаунс для поля поиска
//     const debouncedEmployeeSearchQuery = useDebounce(employeeSearchQuery, 800);
//
//     // Предполагаемая средняя высота строки (в пикселях)
//     const averageRowHeight = 60;
//
//     // Рассчитываем pageSize и высоту таблицы в зависимости от высоты окна
//     const calculatePageSize = useCallback(() => {
//         const height = window.innerHeight;
//         const itemHeight = averageRowHeight; // Средняя высота строки
//         const headerHeight = isSmallScreen ? 200 : 150; // Скорректированная высота заголовков и фильтров
//         const footerHeight = 100; // Высота пагинации и возможных отступов под таблицей
//         const availableHeight = height - headerHeight - footerHeight;
//         let calculatedPageSize = Math.floor(availableHeight / itemHeight) - 3;
//         return calculatedPageSize > 0 ? calculatedPageSize : 1; // Минимум 5 элементов на странице
//     }, [isSmallScreen]);
//
//     const [tableHeight, setTableHeight] = useState(averageRowHeight * 1); // Изначально 5 строк
//
//     useEffect(() => {
//         const handleResize = () => {
//             const newPageSize = calculatePageSize();
//             setPageSize(newPageSize);
//             setTableHeight(newPageSize * averageRowHeight);
//         };
//
//         window.addEventListener('resize', handleResize);
//         // Инициализируем pageSize и tableHeight при монтировании
//         const initialPageSize = calculatePageSize();
//         setPageSize(initialPageSize);
//         setTableHeight(initialPageSize * averageRowHeight);
//
//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, [calculatePageSize]);
//
//     // Параметры запроса
//     const params = {
//         page: currentPage,
//         page_size: pageSize,
//         search: debouncedEmployeeSearchQuery || undefined,
//         department: selectedEmployeeDepartment || undefined,
//     };
//
//     // Функция для получения данных сотрудников
//     const fetchEmployees = async ({ queryKey }) => {
//         const [_key, params] = queryKey;
//         const response = await axios.get('/api/users/', { params });
//         return response.data;
//     };
//
//     // Используем useQuery для получения данных
//     const {
//         data,
//         isLoading,
//         isError,
//         error,
//         refetch,
//     } = useQuery(['employees', params], fetchEmployees, {
//         keepPreviousData: true,
//     });
//
//     const employees = data?.results || [];
//     const totalCount = data?.count || 0;
//     const totalPages = Math.ceil(totalCount / pageSize);
//
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
//
//     // Обработчики для фильтров и поиска
//     const handleEmployeeSearchChange = useCallback((event) => {
//         setEmployeeSearchQuery(event.target.value);
//         setCurrentPage(1); // Сбрасываем на первую страницу
//     }, []);
//
//     const handleEmployeeDepartmentChange = useCallback((event) => {
//         setSelectedEmployeeDepartment(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handlePageChange = useCallback((event, value) => {
//         setCurrentPage(value);
//     }, []);
//
//     const handleEmployeeSelect = (employee) => {
//         if (selectedEmployee && selectedEmployee.id === employee.id) {
//             setSelectedEmployee(null);
//         } else {
//             setSelectedEmployee(employee);
//         }
//     };
//
//     const handleToggleActive = () => {
//         if (selectedEmployee.id === user.id) {
//             setSnackbar({
//                 open: true,
//                 message: 'Вы не можете деактивировать свой собственный аккаунт.',
//                 severity: 'error',
//             });
//             return;
//         }
//
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
//
//     // Обработчики для экспорта
//     const handleExportMenuOpen = (event) => {
//         setExportMenuAnchorEl(event.currentTarget);
//     };
//     const handleExportMenuClose = () => {
//         setExportMenuAnchorEl(null);
//     };
//
//     // Функция для печати отчета в PDF
//     const handlePrintEmployeesReport = useReactToPrint({
//         contentRef: employeesReportRef,
//         documentTitle: 'Отчет по сотрудникам',
//         onAfterPrint: () => {
//             setEmployeesExportData([]); // Очищаем данные после печати
//         },
//     });
//
//     // Используем useEffect для вызова печати после обновления данных
//     useEffect(() => {
//         if (employeesExportData.length > 0) {
//             handlePrintEmployeesReport();
//         }
//     }, [employeesExportData, handlePrintEmployeesReport]);
//
//     const handleEmployeesExport = useCallback(
//         (type) => {
//             setExportLoading(true);
//             handleExportMenuClose();
//             const exportParams = {
//                 ...params,
//                 page_size: totalCount || 1000, // Получаем все записи
//             };
//
//             axios
//                 .get('/api/users/', { params: exportParams })
//                 .then(async (response) => {
//                     const exportData = response.data.results || [];
//                     if (type === 'excel') {
//                         await handleExportExcel(exportData);
//                     } else if (type === 'pdf') {
//                         if (exportData.length === 0) {
//                             setSnackbar({
//                                 open: true,
//                                 message: 'Нет данных для экспорта.',
//                                 severity: 'warning',
//                             });
//                             setExportLoading(false);
//                             return;
//                         }
//                         setEmployeesExportData(exportData);
//                         setExportLoading(false);
//                         // Убираем немедленный вызов handlePrintEmployeesReport()
//                         // Он будет вызван в useEffect после обновления employeesExportData
//                     }
//                 })
//                 .catch((error) => {
//                     console.error('Ошибка при экспорте сотрудников:', error);
//                     setSnackbar({
//                         open: true,
//                         message: 'Ошибка при экспорте сотрудников.',
//                         severity: 'error',
//                     });
//                     setExportLoading(false);
//                 });
//         },
//         [params, totalCount, setSnackbar]
//     );
//
//     // Обработчик экспорта в Excel
//     const handleExportExcel = useCallback(
//         async (exportData) => {
//             if (exportData.length === 0) {
//                 setSnackbar({
//                     open: true,
//                     message: 'Нет данных для экспорта.',
//                     severity: 'warning',
//                 });
//                 return;
//             }
//             try {
//                 const workbook = new ExcelJS.Workbook();
//                 const worksheet = workbook.addWorksheet('Сотрудники');
//
//                 // Добавляем заголовки
//                 worksheet.columns = [
//                     { header: 'Фамилия', key: 'last_name', width: 20 },
//                     { header: 'Имя', key: 'first_name', width: 20 },
//                     { header: 'Звание', key: 'rank', width: 20 },
//                     { header: 'Роль', key: 'role_display', width: 20 },
//                     { header: 'Электронная почта', key: 'email', width: 25 },
//                     { header: 'Отделение', key: 'department_name', width: 25 },
//                     { header: 'Статус', key: 'is_active_display', width: 15 },
//                     { header: 'Дата последнего входа', key: 'last_login', width: 25 },
//                 ];
//
//                 // Добавляем данные
//                 exportData.forEach((employee) => {
//                     worksheet.addRow({
//                         last_name: employee.last_name,
//                         first_name: employee.first_name,
//                         rank: employee.rank,
//                         role_display: employee.role_display,
//                         email: employee.email,
//                         department_name: employee.department_name || 'Не указано',
//                         is_active_display: employee.is_active ? 'Активен' : 'Неактивен',
//                         last_login: employee.last_login
//                             ? formatDate(employee.last_login)
//                             : 'Никогда',
//                     });
//                 });
//
//                 // Применяем стили к заголовкам
//                 worksheet.getRow(1).font = { bold: true };
//
//                 // Генерируем буфер
//                 const buffer = await workbook.xlsx.writeBuffer();
//
//                 // Сохраняем файл
//                 const blob = new Blob([buffer], { type: 'application/octet-stream' });
//                 saveAs(blob, 'Сотрудники.xlsx');
//             } catch (error) {
//                 console.error('Ошибка при экспорте в Excel:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при экспорте в Excel.',
//                     severity: 'error',
//                 });
//             } finally {
//                 setExportLoading(false);
//             }
//         },
//         [setSnackbar]
//     );
//
//     return (
//         <>
//             {/* Основной контейнер */}
//             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                 {/* Поля поиска и фильтров */}
//                 <Box sx={{ mb: theme.spacing(3) }}>
//                     <Box
//                         sx={{
//                             display: 'flex',
//                             flexWrap: 'wrap',
//                             alignItems: 'center',
//                             gap: theme.spacing(2),
//                             mb: theme.spacing(2),
//                         }}
//                     >
//                         <TextField
//                             label="Поиск по имени, фамилии, званию, роли или email"
//                             variant="outlined"
//                             value={employeeSearchQuery}
//                             onChange={handleEmployeeSearchChange}
//                             size="small"
//                             sx={{ flexGrow: 1 }}
//                             InputProps={{
//                                 startAdornment: (
//                                     <InputAdornment position="start">
//                                         <SearchIcon color="action" />
//                                     </InputAdornment>
//                                 ),
//                             }}
//                         />
//
//                         {user.role === 'REGION_HEAD' && (
//                             <FormControl variant="outlined" size="small" sx={{ minWidth: 200, maxWidth: 200 }}>
//                                 <InputLabel id="department-filter-label">Отделение</InputLabel>
//                                 <Select
//                                     labelId="department-filter-label"
//                                     value={selectedEmployeeDepartment}
//                                     onChange={handleEmployeeDepartmentChange}
//                                     label="Отделение"
//                                 >
//                                     <MenuItem value="">
//                                         <em>Все отделения</em>
//                                     </MenuItem>
//                                     {departments.map((department) => (
//                                         <MenuItem key={department.id} value={department.id}>
//                                             {department.name}
//                                         </MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         )}
//
//                         {/* Кнопка экспорта с меню */}
//                         <Box sx={{ display: 'flex', gap: theme.spacing(1), ml: 'auto' }}>
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={handleExportMenuOpen}
//                                 startIcon={<GetAppIcon />}
//                                 sx={{ height: '40px' }}
//                             >
//                                 Экспорт
//                             </Button>
//                             <Menu
//                                 anchorEl={exportMenuAnchorEl}
//                                 open={Boolean(exportMenuAnchorEl)}
//                                 onClose={handleExportMenuClose}
//                             >
//                                 <MenuItem onClick={() => handleEmployeesExport('excel')}>
//                                     <ListItemIcon>
//                                         <DescriptionIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт Excel</ListItemText>
//                                 </MenuItem>
//                                 <MenuItem onClick={() => handleEmployeesExport('pdf')}>
//                                     <ListItemIcon>
//                                         <PictureAsPdfIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт PDF</ListItemText>
//                                 </MenuItem>
//                             </Menu>
//                         </Box>
//
//                         {/* Кнопка изменения статуса сотрудника */}
//                         {selectedEmployee && (
//                             <Button
//                                 onClick={handleToggleActive}
//                                 variant="contained"
//                                 color={selectedEmployee.is_active ? 'error' : 'success'}
//                                 sx={{ height: '40px' }}
//                             >
//                                 {selectedEmployee.is_active ? 'Деактивировать' : 'Активировать'}
//                             </Button>
//                         )}
//                     </Box>
//                     {/* Добавляем кнопку "Добавить сотрудника" под строкой поиска */}
//                     {(user.role === 'REGION_HEAD' || user.role === 'DEPARTMENT_HEAD') && (
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             onClick={() => setOpenEmployeeDialog(true)}
//                             sx={{ mt: 2 }}
//                         >
//                             Добавить сотрудника
//                         </Button>
//                     )}
//                 </Box>
//
//                 {/* Контейнер для таблицы и пагинации */}
//                 <Box>
//                     {/* Таблица сотрудников */}
//                     <EmployeesTable
//                         user={user}
//                         employees={employees}
//                         isLoading={isLoading}
//                         selectedEmployee={selectedEmployee}
//                         handleEmployeeSelect={handleEmployeeSelect}
//                         tableHeight={tableHeight}
//                     />
//
//                     {/* Элементы пагинации */}
//                     {totalPages > 1 && (
//                         <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
//                             <Pagination
//                                 count={totalPages}
//                                 page={currentPage}
//                                 onChange={handlePageChange}
//                             />
//                         </Box>
//                     )}
//                 </Box>
//             </Box>
//
//             {exportLoading && (
//                 <div
//                     style={{
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         height: '100vh',
//                         width: '100vw',
//                         background: 'rgba(0,0,0, 0.25)',
//                         zIndex: '99999',
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                     }}
//                 >
//                     <Loading />
//                 </div>
//             )}
//
//             {/* Диалог для добавления нового сотрудника */}
//             <DialogNewEmployees
//                 user={user}
//                 departments={departments}
//                 setSnackbar={setSnackbar}
//                 openEmployeeDialog={openEmployeeDialog}
//                 setOpenEmployeeDialog={setOpenEmployeeDialog}
//                 refetchEmployees={refetch}
//             />
//
//             {/* Компонент для печати отчета в PDF */}
//             <EmployeesReportPDF
//                 employeesReportRef={employeesReportRef}
//                 currentUser={user}
//                 employeeSearchQuery={employeeSearchQuery}
//                 selectedEmployeeDepartment={
//                     departments.find((dept) => dept.id === selectedEmployeeDepartment)?.name || ''
//                 }
//                 employeesExportData={employeesExportData}
//             />
//         </>
//     );
// };
//
// export default EmployeesTab;
