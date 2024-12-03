// frontend/src/components/Dashboard/EvidenceSearchTab.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    Pagination,
    useMediaQuery,
    Button,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Search as SearchIcon,
    GetApp as GetAppIcon,
    PictureAsPdf as PictureAsPdfIcon,
    Description as DescriptionIcon,
    Event as CalendarIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from '../../axiosConfig';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import { evidenceStatuses as EVIDENCE_STATUSES } from '../../constants/evidenceStatuses';
import { useReactToPrint } from 'react-to-print';
import EvidenceReport from './Evidence/EvidenceReport';
import EvidenceTable from './Evidence/EvidenceTable';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../constants/formatDate';

import { useQuery } from 'react-query';
import Loading from '../Loading';

import { LocalizationProvider, DateRangePicker, SingleInputDateRangeField } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ru';
import { ruRU } from '@mui/x-date-pickers/locales';
import { LicenseInfo } from '@mui/x-license';
import dayjs from 'dayjs';

// Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

// Хук для дебаунса
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(
        () => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);

            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay]
    );

    return debouncedValue;
}

const EvidenceSearchTab = ({ setSnackbar }) => {
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
    const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('');
    const [evidenceStatusFilter, setEvidenceStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [selectedEvidence, setSelectedEvidence] = useState(null);

    const [loadLoading, setLoading] = useState(false);
    const [evidenceExportData, setEvidenceExportData] = useState([]);
    const evidenceReportRef = useRef();

    const [currentUser, setCurrentUser] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [departmentFilter, setDepartmentFilter] = useState('');
    const [cases, setCases] = useState([]);

    // Экспорт данных
    const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);

    // Дебаунс для поля поиска
    const debouncedEvidenceSearchQuery = useDebounce(evidenceSearchQuery, 800);

    // Высота заголовков и фильтров
    const headerAndFiltersHeight = isSmallScreen ? 300 : 200;

    // Высота пагинации и отступов под таблицей
    const footerHeight = 100;

    // Фиксированные высоты строк и заголовков
    const rowHeight = 52; // Стандартная высота строки
    const headerHeight = 56; // Высота заголовка таблицы

    // Рассчитываем pageSize в зависимости от высоты окна
    const calculatePageSize = useCallback(() => {
        const height = window.innerHeight;
        const availableHeight = height - headerAndFiltersHeight - footerHeight;
        let calculatedPageSize = Math.floor(availableHeight / rowHeight) - 6;
        return calculatedPageSize > 0 ? calculatedPageSize : 1; // Минимум 1 элемент на странице
    }, [headerAndFiltersHeight, footerHeight, rowHeight]);

    useEffect(() => {
        const handleResize = () => {
            setPageSize(calculatePageSize());
        };

        window.addEventListener('resize', handleResize);
        // Инициализируем pageSize при монтировании
        setPageSize(calculatePageSize());

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [calculatePageSize]);

    // Получение текущего пользователя и списка отделений и дел при монтировании компонента
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/current-user/');
                setCurrentUser(response.data);

                if (response.data.role === 'REGION_HEAD') {
                    const departmentsResponse = await axios.get('/api/departments/');
                    setDepartments(departmentsResponse.data);
                }

                const casesResponse = await axios.get('/api/cases/', {
                    params: {
                        active: true,
                        page_size: 1000,
                    },
                });
                setCases(casesResponse.data.results);
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при получении данных пользователя или списка дел.',
                    severity: 'error',
                });
            }
        };

        fetchData();
    }, [setSnackbar]);

    // Функция для получения данных
    const fetchEvidences = async ({ queryKey }) => {
        const [_key, params] = queryKey;
        const response = await axios.get('/api/material-evidences/', { params });
        return response.data;
    };

    // Параметры запроса
    const params = {
        search: debouncedEvidenceSearchQuery || undefined,
        type: evidenceTypeFilter || undefined,
        status: evidenceStatusFilter || undefined,
        created__gte: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
        created__lte: dateRange[1] ? dateRange[1].add(1, 'day').format('YYYY-MM-DD') : undefined,
        page: currentPage,
        page_size: pageSize,
        'case__department': departmentFilter || undefined,
    };

    // Используем useQuery для получения данных
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery(['evidences', params], fetchEvidences, {
        keepPreviousData: true,
    });

    const evidences = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Устанавливаем tableHeight на основе количества строк
    const tableHeight = (evidences.length > 0 ? Math.min(evidences.length, pageSize) : 1) * rowHeight + headerHeight;

    useEffect(() => {
        if (isError) {
            console.error('Ошибка при получении вещественных доказательств:', error);
            setSnackbar({
                open: true,
                message: 'Ошибка при получении вещественных доказательств.',
                severity: 'error',
            });
        }
    }, [isError, error, setSnackbar]);

    // Обработчики для фильтров и поиска
    const handleEvidenceSearchChange = useCallback((event) => {
        setEvidenceSearchQuery(event.target.value);
        setCurrentPage(1); // Сбрасываем на первую страницу
    }, []);

    const handleEvidenceTypeFilterChange = useCallback((event) => {
        setEvidenceTypeFilter(event.target.value);
        setCurrentPage(1);
    }, []);

    const handleEvidenceStatusFilterChange = useCallback((event) => {
        setEvidenceStatusFilter(event.target.value);
        setCurrentPage(1);
    }, []);

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange); // Обновляем состояние диапазона дат
        setCurrentPage(1);
    };

    const handleDepartmentFilterChange = useCallback((event) => {
        setDepartmentFilter(event.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((event, value) => {
        setCurrentPage(value);
        setSelectedEvidence(null); // Сбрасываем выделение при смене страницы
    }, []);

    // Обработчик выбора вещественного доказательства
    const handleEvidenceSelect = (evidence) => {
        if (selectedEvidence && selectedEvidence.id === evidence.id) {
            setSelectedEvidence(null);
        } else {
            setSelectedEvidence(evidence);
        }
    };

    // Обработчики для экспорта
    const handleExportMenuOpen = (event) => {
        setExportMenuAnchorEl(event.currentTarget);
    };
    const handleExportMenuClose = () => {
        setExportMenuAnchorEl(null);
    };

    // Функция для печати отчета в PDF
    const handlePrintEvidenceReport = useReactToPrint({
        contentRef: evidenceReportRef,
        documentTitle: 'Отчет по вещественным доказательствам',
        onAfterPrint: () => {
            setEvidenceExportData([]); // Очищаем данные после печати
            setLoading(false);
        },
    });

    // Используем useEffect для вызова печати после обновления данных
    useEffect(() => {
        if (evidenceExportData.length > 0) {
            handlePrintEvidenceReport();
        }
    }, [evidenceExportData, handlePrintEvidenceReport]);

    const handleEvidenceExport = useCallback(
        (type) => {
            setLoading(true);
            handleExportMenuClose();
            const exportParams = {
                ...params,
                page_size: totalCount || 1000, // Получаем все записи
            };

            axios
                .get('/api/material-evidences/', { params: exportParams })
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
                            setLoading(false);
                            return;
                        }
                        setEvidenceExportData(exportData);
                        // handlePrintEvidenceReport будет вызван в useEffect
                    }
                })
                .catch((error) => {
                    console.error('Ошибка при экспорте вещественных доказательств:', error);
                    setSnackbar({
                        open: true,
                        message: 'Ошибка при экспорте вещественных доказательств.',
                        severity: 'error',
                    });
                    setLoading(false);
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
                setLoading(false);
                return;
            }
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Отчет');

                // Добавляем заголовки
                worksheet.columns = [
                    { header: 'Название ВД', key: 'name', width: 30 },
                    { header: 'Описание ВД', key: 'description', width: 30 },
                    { header: 'Тип ВД', key: 'type_display', width: 20 },
                    { header: 'Статус ВД', key: 'status_display', width: 20 },
                    { header: 'Дело', key: 'case_name', width: 30 },
                    { header: 'Создатель дела', key: 'creator_name', width: 30 },
                    { header: 'Следователь', key: 'investigator_name', width: 30 },
                    { header: 'Отделение', key: 'department_name', width: 30 },
                    { header: 'Дата создания', key: 'created', width: 20 },
                ];

                // Добавляем данные
                exportData.forEach((evidence) => {
                    worksheet.addRow({
                        name: evidence.name,
                        description: evidence.description,
                        type_display: evidence.type_display,
                        status_display: evidence.status_display,
                        case_name: evidence.case_name || 'Не назначено',
                        creator_name: evidence.creator_name || 'Не указано',
                        investigator_name: evidence.investigator_name || 'Не указано',
                        department_name: evidence.department_name || 'Не указано',
                        created: formatDate(evidence.created),
                    });
                });

                // Применяем стили к заголовкам
                worksheet.getRow(1).font = { bold: true };

                worksheet.eachRow({ includeEmpty: true }, (row) => {
                    row.alignment = { wrapText: true };
                });

                // Генерируем буфер
                const buffer = await workbook.xlsx.writeBuffer();

                // Сохраняем файл
                const blob = new Blob([buffer], { type: 'application/octet-stream' });
                saveAs(blob, 'Отчет_по_вещественным_доказательствам.xlsx');
            } catch (error) {
                console.error('Ошибка при экспорте в Excel:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при экспорте в Excel.',
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        },
        [setSnackbar]
    );

    return (
        <>
            {/* Основной контейнер с гибким расположением */}
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* Поля поиска и фильтров */}
                <Box>
                {/*<Box sx={{ width: '100%', p: 2 }}>*/}
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: theme.spacing(2),
                            // mb: theme.spacing(2),
                        }}
                    >
                        <TextField
                            label="Поиск по названию, описанию, штрихкоду или данным дела"
                            variant="outlined"
                            value={evidenceSearchQuery}
                            onChange={handleEvidenceSearchChange}
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
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, maxWidth: 150 }}>
                            <InputLabel id="evidence-type-filter-label">Тип ВД</InputLabel>
                            <Select
                                labelId="evidence-type-filter-label"
                                value={evidenceTypeFilter}
                                onChange={handleEvidenceTypeFilterChange}
                                label="Тип ВД"
                            >
                                <MenuItem value="">
                                    <em>Все типы</em>
                                </MenuItem>
                                {EVIDENCE_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, maxWidth: 150 }}>
                            <InputLabel id="evidence-status-filter-label">Статус ВД</InputLabel>
                            <Select
                                labelId="evidence-status-filter-label"
                                value={evidenceStatusFilter}
                                onChange={handleEvidenceStatusFilterChange}
                                label="Статус ВД"
                            >
                                <MenuItem value="">
                                    <em>Все статусы</em>
                                </MenuItem>
                                {EVIDENCE_STATUSES.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                                label="Дата создания от - до"
                                slots={{ field: SingleInputDateRangeField }}
                                slotProps={{
                                    field: {
                                        size: 'small',
                                        label: 'Дата создания от - до',
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
                        {/* Фильтр по отделению для REGION_HEAD */}
                        {currentUser?.role === 'REGION_HEAD' && (
                            <FormControl variant="outlined" size="small" sx={{ minWidth: 200, maxWidth: 200 }}>
                                <InputLabel id="department-filter-label">Отделение</InputLabel>
                                <Select
                                    labelId="department-filter-label"
                                    value={departmentFilter}
                                    onChange={handleDepartmentFilterChange}
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
                                <MenuItem onClick={() => handleEvidenceExport('pdf')}>
                                    <ListItemIcon>
                                        <PictureAsPdfIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Экспорт PDF</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleEvidenceExport('excel')}>
                                    <ListItemIcon>
                                        <DescriptionIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Экспорт Excel</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                </Box>

                {/* Таблица вещественных доказательств */}
                <EvidenceTable
                    evidences={evidences}
                    isLoading={isLoading}
                    setSnackbar={setSnackbar}
                    selectedEvidence={selectedEvidence}
                    handleEvidenceSelect={handleEvidenceSelect}
                    tableHeight={tableHeight}
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

            {loadLoading && (
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
            {/* Скрытый компонент для печати */}
            <EvidenceReport
                evidenceReportRef={evidenceReportRef}
                evidenceSearchQuery={evidenceSearchQuery}
                evidenceTypeFilter={evidenceTypeFilter}
                evidenceStatusFilter={evidenceStatusFilter}
                dateAddedFrom={dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : ''}
                dateAddedTo={dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : ''}
                evidenceExportData={evidenceExportData}
                currentUser={currentUser}
            />
        </>
    );
};

export default EvidenceSearchTab;


// // frontend/src/components/Dashboard/EvidenceSearchTab.js
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
//     Pagination,
//     useMediaQuery,
//     Button,
//     Menu,
//     ListItemIcon,
//     ListItemText,
// } from '@mui/material';
// import {
//     Search as SearchIcon,
//     GetApp as GetAppIcon,
//     PictureAsPdf as PictureAsPdfIcon,
//     Description as DescriptionIcon,
//     Event as CalendarIcon,
// } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import axios from '../../axiosConfig';
// import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
// import { evidenceStatuses as EVIDENCE_STATUSES } from '../../constants/evidenceStatuses';
// import { useReactToPrint } from 'react-to-print';
// import EvidenceReport from './Evidence/EvidenceReport';
// import EvidenceTable from './Evidence/EvidenceTable';
//
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { formatDate } from '../../constants/formatDate';
//
// import { useQuery } from 'react-query';
// import Loading from '../Loading';
//
// import { LocalizationProvider, DateRangePicker, SingleInputDateRangeField } from '@mui/x-date-pickers-pro';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import 'dayjs/locale/ru';
// import { ruRU } from '@mui/x-date-pickers/locales';
// import { LicenseInfo } from '@mui/x-license';
// import dayjs from 'dayjs';
//
// // Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
// LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');
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
// const EvidenceSearchTab = ({ setSnackbar }) => {
//     const theme = useTheme();
//     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
//     const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
//     const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('');
//     const [evidenceStatusFilter, setEvidenceStatusFilter] = useState('');
//     const [dateRange, setDateRange] = useState([null, null]);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [pageSize, setPageSize] = useState(10);
//
//     const [selectedEvidence, setSelectedEvidence] = useState(null);
//
//     const [loadLoading, setLoading] = useState(false);
//     const [evidenceExportData, setEvidenceExportData] = useState([]);
//     const evidenceReportRef = useRef();
//
//     const [currentUser, setCurrentUser] = useState(null);
//     const [departments, setDepartments] = useState([]);
//     const [departmentFilter, setDepartmentFilter] = useState('');
//     const [cases, setCases] = useState([]);
//
//     // Экспорт данных
//     const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
//
//     // Дебаунс для поля поиска
//     const debouncedEvidenceSearchQuery = useDebounce(evidenceSearchQuery, 800);
//
//     // Высота заголовков и фильтров
//     const headerAndFiltersHeight = isSmallScreen ? 300 : 200;
//
//     // Высота пагинации и отступов под таблицей
//     const footerHeight = 100;
//
//     // Фиксированные высоты строк и заголовков
//     const rowHeight = 52; // Стандартная высота строки
//     const headerHeight = 56; // Высота заголовка таблицы
//
//     // Рассчитываем pageSize в зависимости от высоты окна
//     const calculatePageSize = useCallback(() => {
//         const height = window.innerHeight;
//         const availableHeight = height - headerAndFiltersHeight - footerHeight;
//         let calculatedPageSize = Math.floor(availableHeight / rowHeight) - 7;
//         return calculatedPageSize > 0 ? calculatedPageSize : 1; // Минимум 1 элемент на странице
//     }, [headerAndFiltersHeight, footerHeight, rowHeight]);
//
//     useEffect(() => {
//         const handleResize = () => {
//             setPageSize(calculatePageSize());
//         };
//
//         window.addEventListener('resize', handleResize);
//         // Инициализируем pageSize при монтировании
//         setPageSize(calculatePageSize());
//
//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, [calculatePageSize]);
//
//     // Получение текущего пользователя и списка отделений и дел при монтировании компонента
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get('/api/current-user/');
//                 setCurrentUser(response.data);
//
//                 if (response.data.role === 'REGION_HEAD') {
//                     const departmentsResponse = await axios.get('/api/departments/');
//                     setDepartments(departmentsResponse.data);
//                 }
//
//                 const casesResponse = await axios.get('/api/cases/', {
//                     params: {
//                         active: true,
//                         page_size: 1000,
//                     },
//                 });
//                 setCases(casesResponse.data.results);
//             } catch (error) {
//                 console.error('Ошибка при получении данных:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при получении данных пользователя или списка дел.',
//                     severity: 'error',
//                 });
//             }
//         };
//
//         fetchData();
//     }, [setSnackbar]);
//
//     // Функция для получения данных
//     const fetchEvidences = async ({ queryKey }) => {
//         const [_key, params] = queryKey;
//         const response = await axios.get('/api/material-evidences/', { params });
//         return response.data;
//     };
//
//     // Параметры запроса
//     const params = {
//         search: debouncedEvidenceSearchQuery || undefined,
//         type: evidenceTypeFilter || undefined,
//         status: evidenceStatusFilter || undefined,
//         created__gte: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
//         created__lte: dateRange[1] ? dateRange[1].add(1, 'day').format('YYYY-MM-DD') : undefined,
//         page: currentPage,
//         page_size: pageSize,
//         'case__department': departmentFilter || undefined,
//     };
//
//     // Используем useQuery для получения данных
//     const {
//         data,
//         isLoading,
//         isError,
//         error,
//         refetch,
//     } = useQuery(['evidences', params], fetchEvidences, {
//         keepPreviousData: true,
//     });
//
//     const evidences = data?.results || [];
//     const totalCount = data?.count || 0;
//     const totalPages = Math.ceil(totalCount / pageSize);
//
//     // Устанавливаем tableHeight на основе количества строк
//     const tableHeight = (evidences.length > 0 ? Math.min(evidences.length, pageSize) : 1) * rowHeight + headerHeight;
//
//     useEffect(() => {
//         if (isError) {
//             console.error('Ошибка при получении вещественных доказательств:', error);
//             setSnackbar({
//                 open: true,
//                 message: 'Ошибка при получении вещественных доказательств.',
//                 severity: 'error',
//             });
//         }
//     }, [isError, error, setSnackbar]);
//
//     // Обработчики для фильтров и поиска
//     const handleEvidenceSearchChange = useCallback((event) => {
//         setEvidenceSearchQuery(event.target.value);
//         setCurrentPage(1); // Сбрасываем на первую страницу
//     }, []);
//
//     const handleEvidenceTypeFilterChange = useCallback((event) => {
//         setEvidenceTypeFilter(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handleEvidenceStatusFilterChange = useCallback((event) => {
//         setEvidenceStatusFilter(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handleDateRangeChange = (newRange) => {
//         setDateRange(newRange); // Обновляем состояние диапазона дат
//         setCurrentPage(1);
//     };
//
//     const handleDepartmentFilterChange = useCallback((event) => {
//         setDepartmentFilter(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handlePageChange = useCallback((event, value) => {
//         setCurrentPage(value);
//         setSelectedEvidence(null); // Сбрасываем выделение при смене страницы
//     }, []);
//
//     // Обработчик выбора вещественного доказательства
//     const handleEvidenceSelect = (evidence) => {
//         if (selectedEvidence && selectedEvidence.id === evidence.id) {
//             setSelectedEvidence(null);
//         } else {
//             setSelectedEvidence(evidence);
//         }
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
//     const handlePrintEvidenceReport = useReactToPrint({
//         contentRef: evidenceReportRef,
//         documentTitle: 'Отчет по вещественным доказательствам',
//         onAfterPrint: () => {
//             setEvidenceExportData([]); // Очищаем данные после печати
//             setLoading(false);
//         },
//     });
//
//     // Используем useEffect для вызова печати после обновления данных
//     useEffect(() => {
//         if (evidenceExportData.length > 0) {
//             handlePrintEvidenceReport();
//         }
//     }, [evidenceExportData, handlePrintEvidenceReport]);
//
//     const handleEvidenceExport = useCallback(
//         (type) => {
//             setLoading(true);
//             handleExportMenuClose();
//             const exportParams = {
//                 ...params,
//                 page_size: totalCount || 1000, // Получаем все записи
//             };
//
//             axios
//                 .get('/api/material-evidences/', { params: exportParams })
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
//                             setLoading(false);
//                             return;
//                         }
//                         setEvidenceExportData(exportData);
//                         // handlePrintEvidenceReport будет вызван в useEffect
//                     }
//                 })
//                 .catch((error) => {
//                     console.error('Ошибка при экспорте вещественных доказательств:', error);
//                     setSnackbar({
//                         open: true,
//                         message: 'Ошибка при экспорте вещественных доказательств.',
//                         severity: 'error',
//                     });
//                     setLoading(false);
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
//                 setLoading(false);
//                 return;
//             }
//             try {
//                 const workbook = new ExcelJS.Workbook();
//                 const worksheet = workbook.addWorksheet('Отчет');
//
//                 // Добавляем заголовки
//                 worksheet.columns = [
//                     { header: 'Название ВД', key: 'name', width: 30 },
//                     { header: 'Описание ВД', key: 'description', width: 30 },
//                     { header: 'Тип ВД', key: 'type_display', width: 20 },
//                     { header: 'Статус ВД', key: 'status_display', width: 20 },
//                     { header: 'Дело', key: 'case_name', width: 30 },
//                     { header: 'Создатель дела', key: 'creator_name', width: 30 },
//                     { header: 'Следователь', key: 'investigator_name', width: 30 },
//                     { header: 'Отделение', key: 'department_name', width: 30 },
//                     { header: 'Дата создания', key: 'created', width: 20 },
//                 ];
//
//                 // Добавляем данные
//                 exportData.forEach((evidence) => {
//                     worksheet.addRow({
//                         name: evidence.name,
//                         description: evidence.description,
//                         type_display: evidence.type_display,
//                         status_display: evidence.status_display,
//                         case_name: evidence.case_name || 'Не назначено',
//                         creator_name: evidence.creator_name || 'Не указано',
//                         investigator_name: evidence.investigator_name || 'Не указано',
//                         department_name: evidence.department_name || 'Не указано',
//                         created: formatDate(evidence.created),
//                     });
//                 });
//
//                 // Применяем стили к заголовкам
//                 worksheet.getRow(1).font = { bold: true };
//
//                 worksheet.eachRow({ includeEmpty: true }, (row) => {
//                     row.alignment = { wrapText: true };
//                 });
//
//                 // Генерируем буфер
//                 const buffer = await workbook.xlsx.writeBuffer();
//
//                 // Сохраняем файл
//                 const blob = new Blob([buffer], { type: 'application/octet-stream' });
//                 saveAs(blob, 'Отчет_по_вещественным_доказательствам.xlsx');
//             } catch (error) {
//                 console.error('Ошибка при экспорте в Excel:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при экспорте в Excel.',
//                     severity: 'error',
//                 });
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [setSnackbar]
//     );
//
//     return (
//         <>
//             {/* Основной контейнер с гибким расположением */}
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
//                             label="Поиск по названию, описанию, штрихкоду или данным дела"
//                             variant="outlined"
//                             value={evidenceSearchQuery}
//                             onChange={handleEvidenceSearchChange}
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
//                         <FormControl variant="outlined" size="small" sx={{ minWidth: 150, maxWidth: 150 }}>
//                             <InputLabel id="evidence-type-filter-label">Тип ВД</InputLabel>
//                             <Select
//                                 labelId="evidence-type-filter-label"
//                                 value={evidenceTypeFilter}
//                                 onChange={handleEvidenceTypeFilterChange}
//                                 label="Тип ВД"
//                             >
//                                 <MenuItem value="">
//                                     <em>Все типы</em>
//                                 </MenuItem>
//                                 {EVIDENCE_TYPES.map((type) => (
//                                     <MenuItem key={type.value} value={type.value}>
//                                         {type.label}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                         <FormControl variant="outlined" size="small" sx={{ minWidth: 150, maxWidth: 150 }}>
//                             <InputLabel id="evidence-status-filter-label">Статус ВД</InputLabel>
//                             <Select
//                                 labelId="evidence-status-filter-label"
//                                 value={evidenceStatusFilter}
//                                 onChange={handleEvidenceStatusFilterChange}
//                                 label="Статус ВД"
//                             >
//                                 <MenuItem value="">
//                                     <em>Все статусы</em>
//                                 </MenuItem>
//                                 {EVIDENCE_STATUSES.map((status) => (
//                                     <MenuItem key={status.value} value={status.value}>
//                                         {status.label}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                         <LocalizationProvider
//                             dateAdapter={AdapterDayjs}
//                             adapterLocale="ru"
//                             localeText={{
//                                 ...ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
//                                 clearButtonLabel: 'Очистить',
//                             }}
//                         >
//                             <DateRangePicker
//                                 value={dateRange}
//                                 onChange={handleDateRangeChange}
//                                 label="Дата создания от - до"
//                                 slots={{ field: SingleInputDateRangeField }}
//                                 slotProps={{
//                                     field: {
//                                         size: 'small',
//                                         label: 'Дата создания от - до',
//                                         InputProps: {
//                                             endAdornment: (
//                                                 <InputAdornment position="end">
//                                                     <CalendarIcon />
//                                                 </InputAdornment>
//                                             ),
//                                         },
//                                         InputLabelProps: { shrink: true },
//                                     },
//                                     actionBar: {
//                                         actions: ['clear'],
//                                     },
//                                 }}
//                             />
//                         </LocalizationProvider>
//                         {/* Фильтр по отделению для REGION_HEAD */}
//                         {currentUser?.role === 'REGION_HEAD' && (
//                             <FormControl variant="outlined" size="small" sx={{ minWidth: 200, maxWidth: 200 }}>
//                                 <InputLabel id="department-filter-label">Отделение</InputLabel>
//                                 <Select
//                                     labelId="department-filter-label"
//                                     value={departmentFilter}
//                                     onChange={handleDepartmentFilterChange}
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
//                                 <MenuItem onClick={() => handleEvidenceExport('pdf')}>
//                                     <ListItemIcon>
//                                         <PictureAsPdfIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт PDF</ListItemText>
//                                 </MenuItem>
//                                 <MenuItem onClick={() => handleEvidenceExport('excel')}>
//                                     <ListItemIcon>
//                                         <DescriptionIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт Excel</ListItemText>
//                                 </MenuItem>
//                             </Menu>
//                         </Box>
//                     </Box>
//                 </Box>
//
//                 {/* Контейнер для таблицы и пагинации */}
//                 <Box>
//                     {/* Таблица вещественных доказательств */}
//                     <EvidenceTable
//                         evidences={evidences}
//                         isLoading={isLoading}
//                         setSnackbar={setSnackbar}
//                         selectedEvidence={selectedEvidence}
//                         handleEvidenceSelect={handleEvidenceSelect}
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
//             {loadLoading && (
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
//             {/* Скрытый компонент для печати */}
//             <EvidenceReport
//                 evidenceReportRef={evidenceReportRef}
//                 evidenceSearchQuery={evidenceSearchQuery}
//                 evidenceTypeFilter={evidenceTypeFilter}
//                 evidenceStatusFilter={evidenceStatusFilter}
//                 dateAddedFrom={dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : ''}
//                 dateAddedTo={dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : ''}
//                 evidenceExportData={evidenceExportData}
//                 currentUser={currentUser}
//             />
//         </>
//     );
// };
//
// export default EvidenceSearchTab;


// -------------------------------


// // frontend/src/components/Dashboard/EvidenceSearchTab.js
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
//     Pagination,
//     useMediaQuery,
//     Button,
//     Menu,
//     ListItemIcon,
//     ListItemText,
// } from '@mui/material';
// import {
//     Search as SearchIcon,
//     GetApp as GetAppIcon,
//     PictureAsPdf as PictureAsPdfIcon,
//     Description as DescriptionIcon,
//     Event as CalendarIcon,
// } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import axios from '../../axiosConfig';
// import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
// import {evidenceStatuses as EVIDENCE_STATUSES} from '../../constants/evidenceStatuses'; // Импортируем статусы
// import { useReactToPrint } from 'react-to-print';
// import EvidenceReport from './Evidence/EvidenceReport';
// import EvidenceTable from './Evidence/EvidenceTable';
//
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { formatDate } from '../../constants/formatDate';
//
// import { useQuery } from 'react-query';
// import Loading from '../Loading';
//
// // Импортируем компоненты для выбора даты
// import { LocalizationProvider, DateRangePicker, SingleInputDateRangeField } from '@mui/x-date-pickers-pro';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import 'dayjs/locale/ru';
// import { ruRU } from '@mui/x-date-pickers/locales';
// import { LicenseInfo } from '@mui/x-license';
// import dayjs from 'dayjs';
//
// // Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
// LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');
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
// const EvidenceSearchTab = ({ setSnackbar }) => {
//     const theme = useTheme();
//     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
//     const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
//     const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('');
//     const [evidenceStatusFilter, setEvidenceStatusFilter] = useState(''); // Новый фильтр по статусу
//     const [dateRange, setDateRange] = useState([null, null]); // Используем массив для диапазона дат
//     const [currentPage, setCurrentPage] = useState(1);
//     const [countAll, setCountAll] = useState(null);
//     const [pageSize, setPageSize] = useState(20);
//     const [loadLoading, setLoading] = useState(false);
//     const [evidenceExportData, setEvidenceExportData] = useState([]);
//     const [evidenceShouldPrint, setEvidenceShouldPrint] = useState(false);
//     const evidenceReportRef = useRef();
//
//     const [currentUser, setCurrentUser] = useState(null);
//     const [departments, setDepartments] = useState([]);
//     const [departmentFilter, setDepartmentFilter] = useState('');
//     // const [caseFilter, setCaseFilter] = useState(''); // Новый фильтр по делу
//     const [cases, setCases] = useState([]); // Список дел для фильтрации
//
//     // Дебаунс для поля поиска
//     const debouncedEvidenceSearchQuery = useDebounce(evidenceSearchQuery, 800);
//
//     // Рассчитываем pageSize в зависимости от высоты окна
//     const calculatePageSize = useCallback(() => {
//         const height = window.innerHeight;
//         const itemHeight = 64; // Примерная высота строки таблицы
//         const headerHeight = isSmallScreen ? 300 : 200; // Высота заголовков и фильтров
//         const footerHeight = 56; // Высота пагинации
//         const availableHeight = height - headerHeight - footerHeight;
//         let calculatedPageSize = Math.floor(availableHeight / itemHeight) - 6; // Отнимаем 4 строки
//         return calculatedPageSize > 0 ? calculatedPageSize : 5; // Минимум 10 элементов на странице
//     }, [isSmallScreen]);
//
//     useEffect(() => {
//         const handleResize = () => {
//             setPageSize(calculatePageSize());
//         };
//
//         window.addEventListener('resize', handleResize);
//         // Инициализируем pageSize при монтировании
//         setPageSize(calculatePageSize());
//
//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, [calculatePageSize]);
//
//     // Получение текущего пользователя и списка отделений и дел при монтировании компонента
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axios.get('/api/current-user/');
//                 setCurrentUser(response.data);
//
//                 if (response.data.role === 'REGION_HEAD') {
//                     // Если пользователь глава региона, получаем список отделений
//                     const departmentsResponse = await axios.get('/api/departments/');
//                     setDepartments(departmentsResponse.data);
//                 }
//
//                 // Получаем список дел для фильтрации
//                 const casesResponse = await axios.get('/api/cases/', {
//                     params: {
//                         active: true,
//                         page_size: 1000, // Устанавливаем разумный максимум
//                     },
//                 });
//                 setCases(casesResponse.data.results);
//             } catch (error) {
//                 console.error('Ошибка при получении данных:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при получении данных пользователя или списка дел.',
//                     severity: 'error',
//                 });
//             }
//         };
//
//         fetchData();
//     }, [setSnackbar]);
//
//     // Функция для получения данных
//     const fetchEvidences = async ({ queryKey }) => {
//         const [_key, params] = queryKey;
//         const response = await axios.get('/api/material-evidences/', { params });
//         setCountAll(response.data.count);
//         return response.data;
//     };
//
//     // Параметры запроса
//     const params = {
//         search: debouncedEvidenceSearchQuery || undefined,
//         type: evidenceTypeFilter || undefined,
//         status: evidenceStatusFilter || undefined,
//         created__gte: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
//         created__lte: dateRange[1] ? dateRange[1].add(1, 'day').format('YYYY-MM-DD') : undefined,
//         page: currentPage,
//         page_size: pageSize,
//         'case__department': departmentFilter || undefined,
//         // case_id: caseFilter || undefined,
//     };
//
//     // Используем useQuery для получения данных
//     const {
//         data,
//         isLoading,
//         isError,
//         error,
//     } = useQuery(['evidences', params], fetchEvidences, {
//         keepPreviousData: true,
//     });
//
//     const evidences = data?.results || [];
//     const totalPages = Math.ceil((data?.count || 0) / pageSize);
//
//     useEffect(() => {
//         if (isError) {
//             console.error('Ошибка при получении вещественных доказательств:', error);
//             setSnackbar({
//                 open: true,
//                 message: 'Ошибка при получении вещественных доказательств.',
//                 severity: 'error',
//             });
//         }
//     }, [isError, error, setSnackbar]);
//
//     // Обработчики для фильтров и поиска
//     const handleEvidenceSearchChange = useCallback((event) => {
//         setEvidenceSearchQuery(event.target.value);
//         setCurrentPage(1); // Сбрасываем на первую страницу
//     }, []);
//
//     const handleEvidenceTypeFilterChange = useCallback((event) => {
//         setEvidenceTypeFilter(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handleEvidenceStatusFilterChange = useCallback((event) => {
//         setEvidenceStatusFilter(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handleDateRangeChange = (newRange) => {
//         setDateRange(newRange); // Обновляем состояние диапазона дат
//         setCurrentPage(1);
//     };
//
//     const handleDepartmentFilterChange = useCallback((event) => {
//         setDepartmentFilter(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//
//     const handlePageChange = useCallback((event, value) => {
//         setCurrentPage(value);
//     }, []);
//
//     // Экспорт в PDF и Excel
//     const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
//     const handleExportMenuOpen = (event) => {
//         setExportMenuAnchorEl(event.currentTarget);
//     };
//     const handleExportMenuClose = () => {
//         setExportMenuAnchorEl(null);
//     };
//
//     const handleEvidenceExport = useCallback(
//         (type) => {
//             setLoading(true);
//             handleExportMenuClose();
//             const exportParams = {
//                 search: evidenceSearchQuery || undefined,
//                 type: evidenceTypeFilter || undefined,
//                 status: evidenceStatusFilter || undefined,
//                 created__gte: dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : undefined,
//                 created__lte: dateRange[1] ? dateRange[1].add(1, 'day').format('YYYY-MM-DD') : undefined,
//                 page_size: countAll || 1000, // Устанавливаем разумный максимум
//                 'case__department': departmentFilter || undefined,
//                 // case_id: caseFilter || undefined,
//             };
//
//             axios
//                 .get('/api/material-evidences/', { params: exportParams })
//                 .then((response) => {
//                     const exportData = response.data.results || [];
//                     setEvidenceExportData(exportData);
//                     if (type === 'pdf') {
//                         setEvidenceShouldPrint(true);
//                     } else {
//                         handleExportExcel(exportData);
//                     }
//                     // setLoading(false);
//                 })
//                 .catch((error) => {
//                     console.error('Ошибка при экспорте вещественных доказательств:', error);
//                     setSnackbar({
//                         open: true,
//                         message: 'Ошибка при экспорте вещественных доказательств.',
//                         severity: 'error',
//                     });
//                     setLoading(false);
//                 });
//         },
//         [
//             evidenceSearchQuery,
//             evidenceTypeFilter,
//             evidenceStatusFilter,
//             dateRange,
//             departmentFilter,
//             // caseFilter,
//             countAll,
//             setSnackbar,
//         ]
//     );
//
//     // НЕ ТРОГАТЬ!
//     const handlePrintEvidenceReport = useReactToPrint({
//         contentRef: evidenceReportRef,
//         documentTitle: 'Отчет по вещественным доказательствам',
//     });
//
//     useEffect(() => {
//         if (evidenceShouldPrint && evidenceExportData.length > 0) {
//             handlePrintEvidenceReport();
//             setEvidenceShouldPrint(false);
//             setLoading(false);
//         }
//     }, [evidenceExportData, evidenceShouldPrint, handlePrintEvidenceReport]);
//
//     // Обработчик экспорта в Excel
//     const handleExportExcel = useCallback(
//         async (exportData) => {
//             setLoading(false);
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
//                 const worksheet = workbook.addWorksheet('Отчет');
//
//                 // Добавляем заголовки
//                 worksheet.columns = [
//                     { header: 'Название ВД', key: 'name', width: 30 },
//                     { header: 'Описание ВД', key: 'description', width: 30 },
//                     { header: 'Тип ВД', key: 'type_display', width: 20 },
//                     { header: 'Статус ВД', key: 'status_display', width: 20 },
//                     { header: 'Дело', key: 'case_name', width: 30 },
//                     { header: 'Создатель дела', key: 'creator_name', width: 30 },
//                     { header: 'Следователь', key: 'investigator_name', width: 30 },
//                     { header: 'Отделение', key: 'department_name', width: 30 },
//                     { header: 'Дата создания', key: 'created', width: 20 },
//                 ];
//
//                 // Добавляем данные
//                 exportData.forEach((evidence) => {
//                     worksheet.addRow({
//                         name: evidence.name,
//                         description: evidence.description,
//                         type_display: evidence.type_display,
//                         status_display: evidence.status_display,
//                         case_name: evidence.case_name || 'Не назначено',
//                         creator_name: evidence.creator_name || 'Не указано',
//                         investigator_name: evidence.investigator_name || 'Не указано',
//                         department_name: evidence.department_name || 'Не указано',
//                         created: formatDate(evidence.created),
//                     });
//                 });
//
//                 // Применяем стили к заголовкам
//                 worksheet.getRow(1).font = { bold: true };
//
//                 worksheet.eachRow({ includeEmpty: true }, (row) => {
//                     row.alignment = { wrapText: true };
//                 });
//
//                 // Генерируем буфер
//                 const buffer = await workbook.xlsx.writeBuffer();
//
//                 // Сохраняем файл
//                 const blob = new Blob([buffer], { type: 'application/octet-stream' });
//                 saveAs(blob, 'Отчет_по_вещественным_доказательствам.xlsx');
//             } catch (error) {
//                 console.error('Ошибка при экспорте в Excel:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при экспорте в Excel.',
//                     severity: 'error',
//                 });
//             }
//         },
//         [setSnackbar]
//     );
//
//     return (
//         <>
//             {/* Основной контейнер с гибким расположением */}
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
//                             label="Поиск по названию, описанию, штрихкоду или данным дела"
//                             variant="outlined"
//                             value={evidenceSearchQuery}
//                             onChange={handleEvidenceSearchChange}
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
//                         <FormControl variant="outlined" size="small" sx={{ minWidth: 150,  maxWidth: 150 }}>
//                             <InputLabel id="evidence-type-filter-label">Тип ВД</InputLabel>
//                             <Select
//                                 labelId="evidence-type-filter-label"
//                                 value={evidenceTypeFilter}
//                                 onChange={handleEvidenceTypeFilterChange}
//                                 label="Тип ВД"
//                             >
//                                 <MenuItem value="">
//                                     <em>Все типы</em>
//                                 </MenuItem>
//                                 {EVIDENCE_TYPES.map((type) => (
//                                     <MenuItem key={type.value} value={type.value}>
//                                         {type.label}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                         <FormControl variant="outlined" size="small" sx={{ minWidth: 150,  maxWidth: 150 }}>
//                             <InputLabel id="evidence-status-filter-label">Статус ВД</InputLabel>
//                             <Select
//                                 labelId="evidence-status-filter-label"
//                                 value={evidenceStatusFilter}
//                                 onChange={handleEvidenceStatusFilterChange}
//                                 label="Статус ВД"
//                             >
//                                 <MenuItem value="">
//                                     <em>Все статусы</em>
//                                 </MenuItem>
//                                 {EVIDENCE_STATUSES.map((status) => (
//                                     <MenuItem key={status.value} value={status.value}>
//                                         {status.label}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                         <LocalizationProvider
//                             dateAdapter={AdapterDayjs}
//                             adapterLocale="ru"
//                             localeText={{
//                                 ...ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
//                                 clearButtonLabel: 'Очистить', // Изменяем текст кнопки "Clear"
//                             }}
//                         >
//                             <DateRangePicker
//                                 value={dateRange}
//                                 onChange={handleDateRangeChange}
//                                 label="Дата создания от - до"
//                                 slots={{ field: SingleInputDateRangeField }}
//                                 slotProps={{
//                                     field: {
//                                         size: 'small',
//                                         label: 'Дата создания от - до',
//                                         InputProps: {
//                                             endAdornment: (
//                                                 <InputAdornment position="end">
//                                                     <CalendarIcon />
//                                                 </InputAdornment>
//                                             ),
//                                         },
//                                         InputLabelProps: { shrink: true },
//                                     },
//                                     actionBar: {
//                                         actions: ['clear'],
//                                     },
//                                 }}
//                             />
//                         </LocalizationProvider>
//                         {/* Фильтр по отделению для REGION_HEAD */}
//                         {currentUser?.role === 'REGION_HEAD' && (
//                             <FormControl variant="outlined" size="small" sx={{ minWidth: 200,  maxWidth: 200 }}>
//                                 <InputLabel id="department-filter-label">Отделение</InputLabel>
//                                 <Select
//                                     labelId="department-filter-label"
//                                     value={departmentFilter}
//                                     onChange={handleDepartmentFilterChange}
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
//                                 <MenuItem onClick={() => handleEvidenceExport('pdf')}>
//                                     <ListItemIcon>
//                                         <PictureAsPdfIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт PDF</ListItemText>
//                                 </MenuItem>
//                                 <MenuItem onClick={() => handleEvidenceExport('excel')}>
//                                     <ListItemIcon>
//                                         <DescriptionIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт Excel</ListItemText>
//                                 </MenuItem>
//                             </Menu>
//                         </Box>
//                     </Box>
//                 </Box>
//
//                 {/* Контейнер для таблицы и пагинации */}
//                 <Box>
//                     {/* Таблица вещественных доказательств */}
//                     <EvidenceTable
//                         evidences={evidences}
//                         isLoading={isLoading}
//                         setSnackbar={setSnackbar}
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
//             {loadLoading &&
//                 <div style={{ position: 'absolute', top: 0, left: 0, height: '100vh', width: '100vw', background: 'rgba(0,0,0, 0.25)', zIndex: '99999' }}>
//                     <Loading />
//                 </div>
//             }
//             {/* Скрытый компонент для печати */}
//             <div style={{ display: 'none' }}>
//                 <EvidenceReport
//                     evidenceReportRef={evidenceReportRef}
//                     evidenceSearchQuery={evidenceSearchQuery}
//                     evidenceTypeFilter={evidenceTypeFilter}
//                     evidenceStatusFilter={evidenceStatusFilter}
//                     dateAddedFrom={dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : ''}
//                     dateAddedTo={dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : ''}
//                     evidenceExportData={evidenceExportData}
//                     currentUser={currentUser}
//                 />
//             </div>
//         </>
//     );
// };
//
// export default EvidenceSearchTab;
