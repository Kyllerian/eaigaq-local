// frontend/src/components/Dashboard/Employees/Toolbar.js
import { useRef, useEffect, useState, useCallback } from 'react';

import {
    Box,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Button,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';

import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
    Description as DescriptionIcon,
    PictureAsPdf as PictureAsPdfIcon,
    Event as CalendarIcon,
} from '@mui/icons-material';

import axios from '../../../axiosConfig';

import { useTheme } from '@mui/material/styles';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../../constants/formatDate';
import { useReactToPrint } from 'react-to-print';
import EmployeesReportSessionsPDF from './EmployeesReportSessionsPDF';
import Loading from '../../Loading';
import DialogNewEmployees from './DialogNewEmployees';
import EmployeesReportStatsPDF from './EmployeesReportStatsPDF';
import { LocalizationProvider, DateRangePicker, SingleInputDateRangeField } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ru';
import { ruRU } from '@mui/x-date-pickers/locales';

export default function EmployeesToolbar({
    user,
    employeeSearchQuery,
    departments,
    handleEmployeeSearchChange,
    selectedEmployeeDepartment,
    handleEmployeeDepartmentChange,
    selectedEmployee,
    handleToggleActive,
    setSnackbar,
    params,
    totalCount,
    refetch,

    casesData,
    tabSelected,

    dateRange,
    handleDateRangeChange
}) {
    const theme = useTheme();

    // Состояние для диалога добавления сотрудника
    const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);

    // Реф и состояние для отчета в PDF
    const employeesReportRef = useRef();
    const [employeesExportData, setEmployeesExportData] = useState([]);

    // Экспорт данных
    const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);

    // Обработчики для экспорта
    const handleExportMenuOpen = (event) => {
        setExportMenuAnchorEl(event.currentTarget);
    };
    const handleExportMenuClose = () => {
        setExportMenuAnchorEl(null);
    };

    const handleEmployeesExport = useCallback(
        (type) => {
            setExportLoading(true);
            handleExportMenuClose();
            const exportParams = {
                ...params,
                page: 1,
                page_size: totalCount || 1000, // Получаем все записи
            };
            if (tabSelected === 'stats') {

                axios
                    .get('/api/users/', { params: exportParams })
                    .then(async (response) => {

                        const exportData = response.data.results || [];
                        console.log(exportData, 'exportData Stats1');
                        let usersWithCases;
                        const casesMap = casesData.reduce((map, caseItem) => {
                            if (!map[caseItem.investigator]) {
                                map[caseItem.investigator] = [];
                            }
                            map[caseItem.investigator].push(caseItem);
                            return map;
                        }, {});
                        console.log(exportData, 'exportData Stats2');

                        usersWithCases = exportData.map((u) => {
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
                        console.log(exportData, 'exportData Stats3');

                        if (type === 'excel') {
                            await handleExportExcel(usersWithCases, 'stats');
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
                            setEmployeesExportData(usersWithCases);
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
            } else {
                axios
                    .get('/api/sessions/', { params: exportParams })
                    .then(async (response) => {

                        const exportData = response.data.results || [];
                        if (type === 'excel') {
                            await handleExportExcel(exportData, 'sessions');
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
            }
        },
        [params, totalCount, setSnackbar]
    );

    // Обработчик экспорта в Excel
    const handleExportExcel = useCallback(
        async (exportData, exportType) => {
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
                const worksheet = workbook.addWorksheet(exportType === 'stats' ? 'Статистика сотрудников' : 'Отчет по сотрудникам', {
                    pageSetup: { orientation: 'landscape' }
                });

                // Определение столбцов в зависимости от типа экспорта
                let columns = [];
                if (exportType === 'stats') {
                    // Добавляем заголовки
                    columns = [
                        { header: 'ФИО, почта и телефон', key: 'full_name', width: 30 },
                        { header: 'Звание и Роль', key: 'role_and_rank', width: 30 },
                        { header: 'Отделение и регион', key: 'department_name', width: 25 },
                        { header: 'Статус', key: 'is_active_display', width: 12 },
                        { header: 'Дела', key: 'cases', width: 17 },
                    ];
                } else {
                    // Добавляем заголовки
                    columns = [
                        { header: 'ФИО, почта и телефон', key: 'full_name', width: 30 },
                        { header: 'Звание и роль', key: 'role_and_rank', width: 30 },
                        { header: 'Отделение и регион', key: 'department_name', width: 25 },
                        { header: 'Статус', key: 'is_active_display', width: 12 },
                        { header: 'Сессии', key: 'sessions', width: 17 },
                    ];
                }

                worksheet.columns = columns;

                // Добавляем данные
                exportData.forEach((employee) => {
                    if (exportType === 'stats') {
                        worksheet.addRow({
                            full_name: `${employee.last_name} ${employee.first_name}\n${employee.email}\n${employee.phone_number || ''}`,
                            role_and_rank: `${employee.rank}\n${employee.role_display}`,
                            department_name: `${employee.department_name || 'Не указано'}\n${employee.region_display || 'Не указано'}`,
                            is_active_display: employee.is_active ? 'Активен' : 'Неактивен',
                            cases: `Всего: ${employee.cases?.length}\nОткрыто: ${employee.openedCasesCount}\nЗакрыто: ${employee.closedCasesCount}`,
                        });

                        // Применяем перенос текста для ячеек с несколькими строками
                        const lastRow = worksheet.lastRow;
                        lastRow.getCell('cases').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('full_name').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('role_and_rank').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('department_name').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('is_active_display').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        // Опционально: Установить высоту строки, чтобы отобразить все строки текста
                        lastRow.height = 90; // Задайте высоту по необходимости
                    } else {
                        worksheet.addRow({
                            full_name: `${employee.user.last_name} ${employee.user.first_name}\n${employee.user.email}\n${employee.user.phone_number || ''}`,
                            role_and_rank: `${employee.user.rank}\n${employee.role_display}`,
                            department_name: `${employee.department_name || 'Не указано'}\n${employee.region_name || 'Не указано'}`,
                            is_active_display: employee.active ? 'В сети' : 'Не в сети',
                            sessions: `Вход: ${employee.login
                                ? formatDate(employee.login)
                                : 'Никогда'}\nВыход: ${employee.logout ? formatDate(employee.logout)
                                    : 'Никогда'}`,
                        });

                        // Применяем перенос текста для ячеек с несколькими строками
                        const lastRow = worksheet.lastRow;
                        lastRow.getCell('sessions').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('full_name').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('role_and_rank').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('department_name').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                        lastRow.getCell('is_active_display').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

                        // Опционально: Установить высоту строки, чтобы отобразить все строки текста
                        lastRow.height = 90; // Задайте высоту по необходимости
                    }
                });

                // Применяем стили к заголовкам
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                headerRow.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFD3D3D3' }, // Светло-серый цвет заливки для заголовков
                    };
                    cell.alignment = { wrapText: true };
                });

                // Применяем стили к остальным ячейкам
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    if (rowNumber === 1) return; // Заголовки уже обработаны

                    row.eachCell({ includeEmpty: true }, (cell) => {
                        // Устанавливаем границы для каждой ячейки
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' },
                        };

                        // Чередующаяся заливка для строк (зебра-полосы)
                        if (rowNumber % 2 === 0) {
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFEFEFEF' }, // Светло-серый цвет заливки для четных строк
                            };
                        } else {
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFFFFFF' }, // Белый цвет заливки для нечетных строк
                            };
                        }

                        // Устанавливаем перенос текста, если еще не установлен
                        if (cell.alignment && !cell.alignment.wrapText) {
                            cell.alignment = { wrapText: true };
                        }
                    });

                    // Опционально: Устанавливаем высоту строки, если не установлена
                    if (!row.height) {
                        row.height = 20; // Настройте по необходимости
                    }
                });

                // Генерируем буфер
                const buffer = await workbook.xlsx.writeBuffer();

                // Сохраняем файл
                const blob = new Blob([buffer], { type: 'application/octet-stream' });
                saveAs(blob, exportType === 'stats' ? 'Статистика_сотрудников.xlsx' : 'Отчет_по_сотрудникам.xlsx');
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

    // Функция для печати отчета в PDF
    const handlePrintEmployeesReport = useReactToPrint({
        contentRef: employeesReportRef,
        documentTitle: 'Отчет по сотрудникам',
        onAfterPrint: () => {
            setEmployeesExportData([]); // Очищаем данные после печати
            setExportLoading(false);
        },
    });

    // Используем useEffect для вызова печати после обновления данных
    useEffect(() => {
        if (employeesExportData.length > 0) {
            handlePrintEmployeesReport();
        }
    }, [employeesExportData, handlePrintEmployeesReport]);

    return (
        <>
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
                    {tabSelected === 'sessions' &&
                        <LocalizationProvider
                            dateAdapter={AdapterDayjs}
                            adapterLocale="ru"
                            localeText={{
                                ...ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
                                clearButtonLabel: 'Очистить',
                            }}
                        >
                            <DateRangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                label="Дата последнего входа"
                                slots={{ field: SingleInputDateRangeField }}
                                slotProps={{
                                    field: {
                                        size: 'small',
                                        label: 'Дата последнего входа',
                                        InputProps: {
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <CalendarIcon />
                                                </InputAdornment>
                                            ),
                                        },
                                        InputLabelProps: { shrink: true },
                                    },
                                    actionBar: {
                                        actions: ['clear'],
                                    },
                                }}
                            />
                        </LocalizationProvider>
                    }
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
                            <MenuItem onClick={() => handleEmployeesExport('pdf')}>
                                <ListItemIcon>
                                    <PictureAsPdfIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Экспорт PDF</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleEmployeesExport('excel')}>
                                <ListItemIcon>
                                    <DescriptionIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Экспорт Excel</ListItemText>
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

            {/* Компонент для печати отчета в PDF */}
            {tabSelected === 'stats' ?
                <EmployeesReportStatsPDF
                    employeesReportRef={employeesReportRef}
                    currentUser={user}
                    employeeSearchQuery={employeeSearchQuery}
                    selectedEmployeeDepartment={
                        departments.find((dept) => dept.id === selectedEmployeeDepartment)?.name || ''
                    }
                    employeesExportData={employeesExportData}
                />
                :
                <EmployeesReportSessionsPDF
                    employeesReportRef={employeesReportRef}
                    currentUser={user}
                    employeeSearchQuery={employeeSearchQuery}
                    selectedEmployeeDepartment={
                        departments.find((dept) => dept.id === selectedEmployeeDepartment)?.name || ''
                    }
                    employeesExportData={employeesExportData}
                />}

            {exportLoading && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0vh',
                        left: '0vw',
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
        </>
    );
}