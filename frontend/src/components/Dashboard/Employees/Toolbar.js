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
import OneEmployeeReportStatsPDF from './OneEmployeeReportStatsPDF';
import ExportExcelStatsOneEmployee from './ExportExcelStatsOneEmployee';
import { useTranslation } from 'react-i18next';

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

    const { t } = useTranslation();
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


    // Обработчик экспорта в Excel
    const handleExportExcel = useCallback(
        async (exportData, exportType) => {
            if (exportData.length === 0) {
                setSnackbar({
                    open: true,
                    message: t('common.errors.no_data_for_export'),
                    severity: 'warning',
                });
                return;
            }
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(exportType === 'stats' ? t('common.report.titles.stats_employees')
                    : t('common.report.titles.report_employees'), {
                    pageSetup: { orientation: 'landscape' }
                });

                // Определение столбцов в зависимости от типа экспорта
                let columns = [];
                if (exportType === 'stats') {
                    columns = [
                        { header: t('common.table_headers.full_name_email_phone'), key: 'full_name', width: 30, },
                        { header: t('common.table_headers.role_rank'), key: 'role_and_rank', width: 30, },
                        { header: t('common.table_headers.department_and_region'), key: 'department_name', width: 25, },
                        { header: t('common.table_headers.status'), key: 'is_active_display', width: 12, },
                        { header: t('common.table_headers.cases'), key: 'cases', width: 17, },
                    ];
                } else {
                    columns = [
                        { header: t('common.table_headers.full_name_email_phone'), key: 'full_name', width: 30 },
                        { header: t('common.table_headers.role_rank'), key: 'role_and_rank', width: 30, },
                        { header: t('common.table_headers.department_and_region'), key: 'department_name', width: 25, },
                        { header: t('common.table_headers.status'), key: 'is_active_display', width: 12, },
                        { header: t('common.table_headers.sessions'), key: 'sessions', width: 17, },
                    ];
                }

                worksheet.columns = columns;

                // Добавляем данные
                exportData.forEach((employee) => {
                    if (exportType === 'stats') {
                        worksheet.addRow({
                            full_name: `${employee.last_name} ${employee.first_name}\n${employee.email}\n${employee.phone_number || ''
                                }`,
                            role_and_rank: `${employee.rank}\n${employee.role_display}`,
                            department_name: `${employee.department_name || t('common.messages.not_specified')}\n${employee
                                .region_display || t('common.messages.not_specified')
                                }`,
                            is_active_display: employee.is_active
                                ? t('common.status.now_active')
                                : t('common.status.inactive'),
                            cases: `${t('common.report.cases_total')}: ${employee.cases?.length}\n${t(
                                'common.report.cases_opened'
                            )}: ${employee.openedCasesCount}\n${t(
                                'common.status.closed'
                            )}: ${employee.closedCasesCount}`,
                        });
                    } else {
                        worksheet.addRow({
                            full_name: `${employee.user.last_name} ${employee.user.first_name}\n${employee.user.email}\n${employee.user.phone_number || ''
                                }`,
                            role_and_rank: `${employee.user.rank}\n${employee.role_display}`,
                            department_name: `${employee.department_name || t('common.messages.not_specified')}\n${employee.region_name || t('common.messages.not_specified')
                                }`,
                            is_active_display: employee.active
                                ? t('common.status.online')
                                : t('common.status.offline'),
                            sessions: `${t('dashboard.tabs.employees.employees_report_session_pdf.session_in')}: ${employee.login ? formatDate(employee.login) : t('common.status.never')
                                }\n${t('dashboard.tabs.employees.employees_report_session_pdf.session_out')}: ${employee.logout ? formatDate(employee.logout) : t('common.status.never')
                                }`,
                        });
                    }
                    const lastRow = worksheet.lastRow;
                    if (!lastRow) return;

                    // Применяем перенос текста
                    columns.forEach((col) => {
                        lastRow.getCell(col.key).alignment = {
                            vertical: 'middle',
                            horizontal: 'center',
                            wrapText: true,
                        };
                    });
                    lastRow.height = 90; // Примерная высота
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
                saveAs(blob, exportType === 'stats' ? `${t('common.report.titles.file_name_stats')}.xlsx`
                    : `${t('common.report.titles.file_name_employees')}.xlsx`);

                setSnackbar({
                    open: true,
                    message: t('common.success.export_excel_success'),
                    severity: 'success',
                });
            } catch (error) {
                console.error(t('common.errors.error_export_excel'), error);
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_export_excel'),
                    severity: 'error',
                });
            } finally {
                setExportLoading(false);
            }
        },
        [setSnackbar, t]
    );


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
                if (selectedEmployee) {
                    axios
                        .get(`/api/users/${selectedEmployee.id}`)
                        .then(async (response) => {

                            let exportData = response.data || [];
                            console.log(exportData, 'exportData Stats1');
                            const casesMap = casesData.reduce((map, caseItem) => {
                                if (!map[caseItem.investigator]) {
                                    map[caseItem.investigator] = [];
                                }
                                map[caseItem.investigator].push(caseItem);
                                return map;
                            }, {});
                            console.log(exportData, 'exportData Stats2');
                            const userCases = casesMap[exportData.id] || [];
                            const openedCasesCount = userCases.filter(c => c.active).length;
                            const closedCasesCount = userCases.filter(c => !c.active).length;
                            let evidenceForCases;
                            if (userCases.length) {
                                const case_ids_for_emp = userCases.map(item => item.id)?.join(',');
                                const searchParams = {
                                    case_id__in: case_ids_for_emp
                                }
                                axios
                                    .get('/api/material-evidences/', { params: searchParams })
                                    .then(async (response) => {
                                        console.log(response, 'mat-evidences report stats for one emp')
                                        evidenceForCases = response.data;
                                        console.log('evidenceForCases', evidenceForCases)
                                        exportData = {
                                            ...exportData,
                                            cases: userCases,
                                            openedCasesCount,
                                            closedCasesCount,
                                            evidence: evidenceForCases,
                                        }
                                        console.log(exportData, 'exportData Stats3');

                                        if (type === 'excel') {
                                            await ExportExcelStatsOneEmployee(exportData, setSnackbar, setExportLoading);
                                        } else if (type === 'pdf') {
                                            if (exportData.length === 0) {
                                                setSnackbar({
                                                    open: true,
                                                    message: t('common.errors.no_data_for_export'),
                                                    severity: 'warning',
                                                });
                                                setExportLoading(false);
                                                return;
                                            }
                                            console.log('exportData', exportData)
                                            console.log('exportData', [exportData])
                                            setEmployeesExportData([exportData]);
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(t('common.errors.error_export_users'), error);
                                        setSnackbar({
                                            open: true,
                                            message: t('common.errors.error_export_users'),
                                            severity: 'error',
                                        });
                                        setExportLoading(false);
                                    });
                            } else {
                                exportData = {
                                    ...exportData,
                                    cases: userCases,
                                    openedCasesCount,
                                    closedCasesCount,
                                    evidence: [],
                                }
                                console.log(exportData, 'exportData Stats3');

                                if (type === 'excel') {
                                    await ExportExcelStatsOneEmployee(exportData, setSnackbar, setExportLoading);
                                } else if (type === 'pdf') {
                                    if (exportData.length === 0) {
                                        setSnackbar({
                                            open: true,
                                            message: t('common.errors.no_data_for_export'),
                                            severity: 'warning',
                                        });
                                        setExportLoading(false);
                                        return;
                                    }
                                    console.log('exportData', exportData)
                                    console.log('exportData', [exportData])
                                    setEmployeesExportData([exportData]);
                                }
                            }
                        })
                        .catch((error) => {
                            console.error(t('common.errors.error_export_users'), error);
                            setSnackbar({
                                open: true,
                                message: t('common.errors.error_export_users'),
                                severity: 'error',
                            });
                            setExportLoading(false);
                        });
                    console.log(selectedEmployee)
                    // {
                    //     "id": 58,
                    //     "name": "1231111 test111",
                    //     "email": "asfd@aksf.coooom",
                    //     "rank": "TEST",
                    //     "role_display": "Обычный пользователь",
                    //     "department_name": "Центральный ОП",
                    //     "is_active": true,
                    //     "is_active_display": "Активен",
                    //     "count_cases": 0,
                    //     "count_cases_opened": 0,
                    //     "count_cases_closed": 0
                    // }
                } else {

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
                                        message: t('common.errors.no_data_for_export'),
                                        severity: 'warning',
                                    });
                                    setExportLoading(false);
                                    return;
                                }
                                setEmployeesExportData(usersWithCases);
                            }
                        })
                        .catch((error) => {
                            console.error(t('common.errors.error_export_users'), error);
                            setSnackbar({
                                open: true,
                                message: t('common.errors.error_export_users'),
                                severity: 'error',
                            });
                            setExportLoading(false);
                        });
                }
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
                                    message: t('common.errors.no_data_for_export'),
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
                        console.error(t('common.errors.error_export_users'), error);
                        setSnackbar({
                            open: true,
                            message: t('common.errors.error_export_users'),
                            severity: 'error',
                        });
                        setExportLoading(false);
                    });
            }
        },
        [params, totalCount, tabSelected, selectedEmployee, casesData, setSnackbar, handleExportExcel]
    );
    // Функция для печати отчета в PDF
    const handlePrintEmployeesReport = useReactToPrint({
        contentRef: employeesReportRef,
        documentTitle: selectedEmployee != null ? `${t('common.report.titles.report_employee')} ${selectedEmployee.name}`
            : t('common.report.titles.report_employees'),
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
                        label={t('dashboard.tabs.employees.toolbar.search_placeholder')}
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
                                clearButtonLabel: t('common.buttons.clear_button'),
                            }}
                        >
                            <DateRangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                label={t('dashboard.tabs.employees.toolbar.date_last_login_label')}
                                slots={{ field: SingleInputDateRangeField }}
                                slotProps={{
                                    field: {
                                        size: 'small',
                                        label: t('dashboard.tabs.employees.toolbar.date_last_login_label'),
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
                            <InputLabel id="department-filter-label">{t('common.standard.label_department')}</InputLabel>
                            <Select
                                labelId="department-filter-label"
                                value={selectedEmployeeDepartment}
                                onChange={handleEmployeeDepartmentChange}
                                label={t('common.standard.label_department')}
                            >
                                <MenuItem value="">
                                    <em>{t('common.standard.option_all_departments')}</em>
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
                            {t('common.buttons.export')}
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
                                <ListItemText>{t('common.buttons.export_pdf')}</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleEmployeesExport('excel')}>
                                <ListItemIcon>
                                    <DescriptionIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t('common.buttons.export_excel')}</ListItemText>
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
                            {selectedEmployee.is_active ? t('common.buttons.deactivate')
                                : t('common.buttons.activate')}
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
                        {t('dashboard.tabs.employees.toolbar.button_add_employee')}
                    </Button>
                )}
            </Box>

            {/* Компонент для печати отчета в PDF */}
            {tabSelected === 'stats' ?
                selectedEmployee != null ?
                    (<OneEmployeeReportStatsPDF
                        employeesReportRef={employeesReportRef}
                        currentUser={user}
                        employeeSearchQuery={employeeSearchQuery}
                        selectedEmployeeDepartment={
                            departments.find((dept) => dept.id === selectedEmployeeDepartment)?.name || ''
                        }
                        employeesExportData={employeesExportData}
                    />)
                    :
                    (<EmployeesReportStatsPDF
                        employeesReportRef={employeesReportRef}
                        currentUser={user}
                        employeeSearchQuery={employeeSearchQuery}
                        selectedEmployeeDepartment={
                            departments.find((dept) => dept.id === selectedEmployeeDepartment)?.name || ''
                        }
                        employeesExportData={employeesExportData}
                    />)
                :
                <EmployeesReportSessionsPDF
                    employeesReportRef={employeesReportRef}
                    currentUser={user}
                    employeeSearchQuery={employeeSearchQuery}
                    selectedEmployeeDepartment={
                        departments.find((dept) => dept.id === selectedEmployeeDepartment)?.name || ''
                    }
                    employeesExportData={employeesExportData}
                />
            }

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