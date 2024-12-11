// frontend/src/components/Dashboard/Employees/TableSessions.js
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Paper, Typography, Box, Chip, Tooltip, useTheme } from '@mui/material';
import Loading from '../../Loading';
import { format } from 'date-fns';
import ruLocale from 'date-fns/locale/ru';
import { LicenseInfo } from '@mui/x-license';
import PropTypes from 'prop-types';
import { StyledDataGridPro } from '../../ui/Tables';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

const EmployeesTableSessions = ({
    user,
    isLoading,
    employees,
    selectedEmployee,
    handleEmployeeSelect,
    tableHeight,
}) => {
    const theme = useTheme();
    const tableContainerRef = useRef(null);
    const stripeRef = useRef(null);
    const [stripeStyle, setStripeStyle] = useState({
        top: 0,
        height: 0,
    });
    console.log(employees, "EmployeesSessions");

    // Преобразование данных сотрудников для DataGridPro
    const rows = useMemo(
        () =>
            employees.map((employee) => ({
                id: employee.id, // Уникальный идентификатор
                name: `${employee.user.last_name || 'Не указано'} ${employee.user.first_name || 'Не указано'}`,
                email: employee.user.email || 'Не указано',
                rank: employee.user.rank || 'Не указано',
                role_display: employee.role_display || 'Не указано',
                department_name: employee.department_name || 'Не указано',
                active: employee.active,
                active_display: employee.active ? 'В сети' : 'Не в сети',
                // Создаём поле 'sessions' для объединения входа и выхода
                sessions: {
                    login: employee.login
                        ? format(new Date(employee.login), 'dd.MM.yyyy HH:mm', { locale: ruLocale })
                        : 'Никогда',
                    logout: employee.logout
                        ? format(new Date(employee.logout), 'dd.MM.yyyy HH:mm', { locale: ruLocale })
                        : 'Никогда',
                },
            })),
        [employees]
    );

    // Определение столбцов для DataGridPro с объединённой колонкой 'Сессии'
    const columns = useMemo(
        () => [
            {
                field: 'name',
                headerName: 'Сотрудник',
                flex: 1,
                minWidth: 230,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.value}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.email}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'rank_role',
                headerName: 'Звание и Роль',
                flex: 1,
                minWidth: 200,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.rank || 'Не указано'}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.role_display || 'Не указано'}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'department_name',
                headerName: 'Отделение',
                flex: 1,
                minWidth: 200,
                sortable: false,
                renderCell: (params) => (
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                        {params.value || 'Не указано'}
                    </Typography>
                ),
            },
            {
                field: 'active_display',
                headerName: 'Статус',
                flex: 0.5,
                minWidth: 100,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {params.value === 'В сети' ? (
                            <CheckCircleIcon color="success" sx={{ mr: 0.5 }} />
                        ) : (
                            <CancelIcon color="error" sx={{ mr: 0.5 }} />
                        )}
                        <Typography
                            variant="body2"
                            color={params.value === 'В сети' ? 'success.main' : 'error.main'}
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.value}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'sessions',
                headerName: 'Сессии',
                flex: 0.7,
                minWidth: 200,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Дата последнего входа */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Tooltip title="Последний вход" arrow>
                                <EventAvailableIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                            </Tooltip>
                            <Chip
                                label={params.value.login}
                                color={params.value.login !== 'Никогда' ? 'primary' : 'default'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>
                        {/* Дата последнего выхода */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Последний выход" arrow>
                                <EventBusyIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                            </Tooltip>
                            <Chip
                                label={params.value.logout}
                                color={params.value.logout !== 'Никогда' ? 'secondary' : 'default'}
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Box>
                    </Box>
                ),
            },
        ],
        []
    );

    // console.log('я перезагрузился');

    // Обновление позиции полоски при изменении выбранной строки
    useEffect(() => {
        const updateStripe = () => {
            if (!selectedEmployee || !tableContainerRef.current) {
                setStripeStyle({ top: 0, height: 0 });
                return;
            }

            // Найти DOM элемент выбранной строки
            const rowElement = tableContainerRef.current.querySelector(`[data-id="${selectedEmployee.id}"]`);
            if (rowElement) {
                const tableRect = tableContainerRef.current.getBoundingClientRect();
                const rowRect = rowElement.getBoundingClientRect();

                const top = rowRect.top - tableRect.top + tableContainerRef.current.scrollTop;
                const height = rowRect.height;

                setStripeStyle({
                    top: top,
                    height: height,
                });
            } else {
                // Выбранная строка не видна (из-за виртуализации)
                setStripeStyle({ top: 0, height: 0 });
            }
        };

        // Инициализировать положение полоски
        updateStripe();

        // Добавить обработчики событий для обновления полоски при скролле и изменении размера
        const scrollableContainer = tableContainerRef.current
            ? tableContainerRef.current.querySelector('.MuiDataGrid-virtualScroller')
            : null;
        if (scrollableContainer) {
            scrollableContainer.addEventListener('scroll', updateStripe);
        }

        window.addEventListener('resize', updateStripe);

        // Очистка при размонтировании
        return () => {
            if (scrollableContainer) {
                scrollableContainer.removeEventListener('scroll', updateStripe);
            }
            window.removeEventListener('resize', updateStripe);
        };
    }, [selectedEmployee, employees]);

    return (
        <Box sx={{ position: 'relative' }} ref={tableContainerRef}>
            {/* Полоска индикатора */}
            <Box
                sx={{
                    position: 'absolute',
                    left: 10, // Позиционируем полоску слева от таблицы
                    top: stripeStyle.top,
                    width: 6,
                    height: stripeStyle.height,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '4px 0 0 4px',
                    transition: 'top 0.2s, height 0.2s',
                    zIndex: 1, // Убедитесь, что полоска находится поверх таблицы
                }}
            />

            <Paper
                sx={{
                    width: '100%',
                    mt: 2,
                    p: 2,
                    boxShadow: 3,
                    boxSizing: 'border-box',
                    overflow: 'visible', // Разрешаем элементам выходить за пределы Paper
                }}
            >
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: tableHeight }}>
                        <Loading />
                    </Box>
                ) : (
                    <StyledDataGridPro rows={rows}
                        columns={columns.map((col) => ({
                            ...col,
                            flex: col.flex || 1,
                            minWidth: col.minWidth || 150,
                        }))}
                        selected={true}
                        selected_column={selectedEmployee}
                        handleRowClick={handleEmployeeSelect}
                        sx={{
                            '& .MuiDataGrid-cell': {
                                py: 1, // Уменьшаем вертикальные отступы для более компактного вида
                            },
                        }}
                    />
                )}
            </Paper>
        </Box>
    );
};

EmployeesTableSessions.propTypes = {
    user: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    employees: PropTypes.array.isRequired,
    selectedEmployee: PropTypes.object,
    handleEmployeeSelect: PropTypes.func.isRequired,
    tableHeight: PropTypes.number.isRequired,
};

export default EmployeesTableSessions;

// // frontend/src/components/Dashboard/Employees/Table.js
// import React, { useMemo } from 'react';
// import { DataGridPro } from '@mui/x-data-grid-pro';
// import { Paper, Typography, Box, useTheme } from '@mui/material';
// import Loading from '../../Loading';
// import { format } from 'date-fns';
// import ruLocale from 'date-fns/locale/ru';
// import { LicenseInfo } from '@mui/x-license';
// import PropTypes from 'prop-types';

// // Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
// LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

// const EmployeesTable = ({
//                             user,
//                             isLoading,
//                             employees,
//                             selectedEmployee,
//                             handleEmployeeSelect,
//                             tableHeight,
//                         }) => {
//     const theme = useTheme();

//     // Преобразование данных сотрудников для DataGridPro
//     const rows = useMemo(
//         () =>
//             employees.map((employee) => ({
//                 id: employee.id,
//                 name: `${employee.last_name || 'Не указано'} ${employee.first_name || 'Не указано'}`,
//                 email: employee.email || 'Не указано',
//                 rank: employee.rank || 'Не указано',
//                 role_display: employee.role_display || 'Не указано',
//                 department_name: employee.department_name || 'Не указано',
//                 is_active: employee.is_active,
//                 is_active_display: employee.is_active ? 'Активен' : 'Неактивен',
//                 last_login: employee.last_login
//                     ? format(new Date(employee.last_login), 'dd.MM.yyyy HH:mm', { locale: ruLocale })
//                     : 'Никогда',
//             })),
//         [employees]
//     );

//     // Определение столбцов для DataGridPro
//     const columns = useMemo(
//         () => [
//             {
//                 field: 'name',
//                 headerName: 'Сотрудник',
//                 flex: 1,
//                 minWidth: 200,
//                 sortable: false,
//                 renderCell: (params) => (
//                     <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                         <Typography
//                             variant="subtitle2"
//                             fontWeight="bold"
//                             noWrap
//                             sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//                         >
//                             {params.value}
//                         </Typography>
//                         <Typography
//                             variant="body2"
//                             color="textSecondary"
//                             noWrap
//                             sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//                         >
//                             {params.row.email}
//                         </Typography>
//                     </Box>
//                 ),
//             },
//             {
//                 field: 'rank_role',
//                 headerName: 'Звание и Роль',
//                 flex: 1,
//                 minWidth: 150,
//                 sortable: false,
//                 renderCell: (params) => (
//                     <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                         <Typography
//                             variant="body2"
//                             noWrap
//                             sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//                         >
//                             {params.row.rank || 'Не указано'}
//                         </Typography>
//                         <Typography
//                             variant="body2"
//                             color="textSecondary"
//                             noWrap
//                             sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//                         >
//                             {params.row.role_display || 'Не указано'}
//                         </Typography>
//                     </Box>
//                 ),
//             },
//             {
//                 field: 'department_name',
//                 headerName: 'Отделение',
//                 flex: 1,
//                 minWidth: 150,
//                 sortable: false,
//                 renderCell: (params) => (
//                     <Typography
//                         variant="body2"
//                         noWrap
//                         sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//                     >
//                         {params.value || 'Не указано'}
//                     </Typography>
//                 ),
//             },
//             {
//                 field: 'is_active_display',
//                 headerName: 'Статус',
//                 flex: 0.5,
//                 minWidth: 100,
//                 sortable: false,
//                 renderCell: (params) => (
//                     <Typography
//                         variant="body2"
//                         color={params.value === 'Активен' ? 'success.main' : 'error.main'}
//                         noWrap
//                         sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//                     >
//                         {params.value}
//                     </Typography>
//                 ),
//             },
//             {
//                 field: 'last_login',
//                 headerName: 'Дата последнего входа',
//                 flex: 1,
//                 minWidth: 160,
//                 sortable: false,
//                 renderCell: (params) => (
//                     <Typography
//                         variant="body2"
//                         noWrap
//                         sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//                     >
//                         {params.value}
//                     </Typography>
//                 ),
//             },
//         ],
//         []
//     );
//     console.log('я перезагрузился')
//     return (
//         <Paper sx={{ width: '100%', mt: 2, p: 2, boxShadow: 3, boxSizing: 'border-box', }}>
//             {isLoading ? (
//                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: tableHeight }}>
//                     <Loading />
//                 </Box>
//             ) : (
//                 <DataGridPro
//                     rows={rows}
//                     columns={columns.map((col) => ({
//                         ...col,
//                         flex: col.flex || 1,
//                         minWidth: col.minWidth || 150,
//                     }))}
//                     disableColumnMenu
//                     disableSelectionOnClick
//                     getRowHeight={() => 'auto'}
//                     hideFooter
//                     onRowClick={(params) => handleEmployeeSelect(params.row)}
//                     getRowClassName={(params) =>
//                         selectedEmployee && selectedEmployee.id === params.row.id ? 'selected-row' : ''
//                     }
//                     sx={{
//                         '& .MuiDataGrid-cell': {
//                             whiteSpace: 'nowrap',
//                             overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             padding: theme.spacing(1),
//                             borderBottom: `1px solid ${theme.palette.divider}`,
//                         },
//                         '& .MuiDataGrid-columnHeaders': {
//                             backgroundColor: theme.palette.grey[100],
//                             borderBottom: `1px solid ${theme.palette.divider}`,
//                             fontWeight: 'bold',
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-columnHeader:focus': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-columnHeader:focus-within': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-columnHeaderTitle': {
//                             fontWeight: 'bold',
//                         },
//                         '& .MuiDataGrid-row': {
//                             '&:nth-of-type(odd)': {
//                                 backgroundColor: theme.palette.action.hover,
//                             },
//                             cursor: 'pointer',
//                         },
//                         '& .MuiDataGrid-row:hover': {
//                             backgroundColor: theme.palette.action.selected,
//                         },
//                         '& .MuiDataGrid-cell:focus': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-row:focus': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-cell:focus-within': {
//                             outline: 'none',
//                         },
//                         '& .selected-row': {
//                             backgroundColor: theme.palette.primary.light,
//                             color: theme.palette.text.primary,
//                             borderLeft: `6px solid ${theme.palette.primary.main}`,
//                             fontWeight: '500',
//                             boxShadow: `
//                                 inset 0 0 10px rgba(0, 0, 0, 0.1),
//                                 0 4px 6px rgba(0, 0, 0, 0.05)`,
//                             borderRadius: '4px',
//                             transition: 'all 0.1s ease-in-out',
//                         },
//                     }}
//                 />
//             )}
//         </Paper>
//     );
// };

// EmployeesTable.propTypes = {
//     user: PropTypes.object.isRequired,
//     isLoading: PropTypes.bool.isRequired,
//     employees: PropTypes.array.isRequired,
//     selectedEmployee: PropTypes.object,
//     handleEmployeeSelect: PropTypes.func.isRequired,
//     tableHeight: PropTypes.number.isRequired,
// };

// export default EmployeesTable;