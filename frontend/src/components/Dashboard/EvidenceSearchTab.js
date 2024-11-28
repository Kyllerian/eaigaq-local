// src/components/EvidenceSearchTab.js

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
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axios from '../../axiosConfig';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import { useReactToPrint } from 'react-to-print';
import EvidenceReport from './Evidence/EvidenceReport';
import EvidenceTable from './Evidence/EvidenceTable';

// Импорт библиотек для Excel
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../constants/formatDate';

// Импорт React Query
import { useQuery } from 'react-query';
import Loading from '../Loading';

// Добавляем хук для дебаунса
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
    const [dateAddedFrom, setDateAddedFrom] = useState('');
    const [dateAddedTo, setDateAddedTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [countAll, setCountAll] = useState(null);
    const [pageSize, setPageSize] = useState(20);
    const [loadLoading, setLoading] = useState(false);
    const [evidenceExportData, setEvidenceExportData] = useState([]);
    const [evidenceShouldPrint, setEvidenceShouldPrint] = useState(false);
    const evidenceReportRef = useRef();

    // Новые состояния
    const [currentUser, setCurrentUser] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [departmentFilter, setDepartmentFilter] = useState('');

    // Используем дебаунс для поля поиска
    const debouncedEvidenceSearchQuery = useDebounce(evidenceSearchQuery, 800);

    // Рассчитываем pageSize в зависимости от высоты окна
    const calculatePageSize = useCallback(() => {
        const height = window.innerHeight;
        const itemHeight = 64; // Примерная высота строки таблицы
        const headerHeight = isSmallScreen ? 300 : 200; // Высота заголовков и фильтров
        const footerHeight = 56; // Высота пагинации
        const availableHeight = height - headerHeight - footerHeight;
        let calculatedPageSize = Math.floor(availableHeight / itemHeight) - 4; // Отнимаем 4 строки
        return calculatedPageSize > 0 ? calculatedPageSize : 10; // Минимум 10 элементов на странице
    }, [isSmallScreen]);

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

    // Получение текущего пользователя при монтировании компонента
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('/api/current-user/');
                setCurrentUser(response.data);

                if (response.data.role === 'REGION_HEAD') {
                    // Если пользователь глава региона, получаем список отделений
                    const departmentsResponse = await axios.get('/api/departments/');
                    setDepartments(departmentsResponse.data);
                }
            } catch (error) {
                console.error('Ошибка при получении текущего пользователя:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при получении данных пользователя.',
                    severity: 'error',
                });
            }
        };

        fetchCurrentUser();
    }, [setSnackbar]);

    // Функция для получения данных
    const fetchEvidences = async ({ queryKey }) => {
        const [_key, params] = queryKey;
        const response = await axios.get('/api/material-evidences/', { params });
        setCountAll(response.data.count);
        return response.data;
    };

    // Параметры запроса
    const params = {
        search: debouncedEvidenceSearchQuery || undefined,
        type: evidenceTypeFilter || undefined,
        created__gte: dateAddedFrom || undefined,
        created__lte: dateAddedTo || undefined,
        page: currentPage,
        page_size: pageSize,
        'case__department': departmentFilter || undefined, // Добавляем фильтр по отделению
    };

    // Используем useQuery для получения данных
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery(['evidences', params], fetchEvidences, {
        keepPreviousData: true,
    });

    const evidences = data?.results || [];
    const totalPages = Math.ceil((data?.count || 0) / pageSize);

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

    const handleDateAddedFromChange = useCallback((event) => {
        setDateAddedFrom(event.target.value);
        setCurrentPage(1);
    }, []);

    const handleDateAddedToChange = useCallback((event) => {
        setDateAddedTo(event.target.value);
        setCurrentPage(1);
    }, []);

    const handleDepartmentFilterChange = useCallback((event) => {
        setDepartmentFilter(event.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((event, value) => {
        setCurrentPage(value);
    }, []);

    // Экспорт в PDF и Excel
    const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
    const handleExportMenuOpen = (event) => {
        setExportMenuAnchorEl(event.currentTarget);
    };
    const handleExportMenuClose = () => {
        setExportMenuAnchorEl(null);
    };

    const handleEvidenceExport = useCallback(
        (type) => {
            setLoading(true);
            handleExportMenuClose();
            const exportParams = {
                search: evidenceSearchQuery || undefined,
                type: evidenceTypeFilter || undefined,
                created__gte: dateAddedFrom || undefined,
                created__lte: dateAddedTo || undefined,
                page_size: countAll, // Получаем все данные или устанавливаем разумный максимум
                'case__department': departmentFilter || undefined,
            };

            axios
                .get('/api/material-evidences/', { params: exportParams })
                .then((response) => {
                    const exportData = response.data.results || [];
                    setEvidenceExportData(exportData);
                    if (type === 'pdf') {
                        setEvidenceShouldPrint(true);
                    } else {
                        handleExportExcel(exportData);
                    }
                    // setLoading(false);
                })
                .catch((error) => {
                    console.error('Ошибка при экспорте вещественных доказательств:', error);
                    setSnackbar({
                        open: true,
                        message: 'Ошибка при экспорте вещественных доказательств.',
                        severity: 'error',
                    });
                });
        },
        [
            evidenceSearchQuery,
            evidenceTypeFilter,
            dateAddedFrom,
            dateAddedTo,
            departmentFilter,
            data?.count,//countAll,
            setSnackbar,
        ]
    );

    const handlePrintEvidenceReport = useReactToPrint({
        contentRef: evidenceReportRef,
        documentTitle: 'Отчет по вещественным доказательствам',
    });

    useEffect(() => {
        if (evidenceShouldPrint && evidenceExportData.length > 0) {
            handlePrintEvidenceReport();
            setEvidenceShouldPrint(false);
            setLoading(false);
        }
    }, [evidenceExportData, evidenceShouldPrint, handlePrintEvidenceReport]);

    // Обработчик экспорта в Excel
    const handleExportExcel = useCallback(
        async (exportData) => {
            setLoading(false);
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
                const worksheet = workbook.addWorksheet('Отчет');

                // Добавляем заголовки
                worksheet.columns = [
                    { header: 'Название ВД', key: 'name', width: 30 },
                    { header: 'Описание ВД', key: 'description', width: 30 },
                    { header: 'Тип ВД', key: 'type_display', width: 20 },
                    { header: 'Дело', key: 'case_name', width: 30 },
                    { header: 'Отделение', key: 'department_name', width: 30 }, // Добавляем отделение
                    { header: 'Дата создания', key: 'created', width: 20 },
                ];

                // Добавляем данные
                exportData.forEach((evidence) => {
                    worksheet.addRow({
                        name: evidence.name,
                        description: evidence.description,
                        type_display: evidence.type_display,
                        case_name: evidence.case_name || 'Не назначено',
                        department_name: evidence.department_name || 'Не указано', // Добавляем отделение
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
            }
        },
        [setSnackbar]
    );

    return (
        <>
            {/* Основной контейнер с гибким расположением */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Поля поиска и фильтров */}
                <Box sx={{ mb: theme.spacing(3) }}>
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
                            label="Поиск по названию, описанию или штрихкоду"
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
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
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
                        <TextField
                            label="Дата добавления от"
                            type="date"
                            variant="outlined"
                            value={dateAddedFrom}
                            onChange={handleDateAddedFromChange}
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <TextField
                            label="Дата добавления до"
                            type="date"
                            variant="outlined"
                            value={dateAddedTo}
                            onChange={handleDateAddedToChange}
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
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

                {/* Контейнер для таблицы и пагинации */}
                <Box>
                    {/* Таблица вещественных доказательств */}
                    <EvidenceTable
                        evidences={evidences}
                        isLoading={isLoading}
                        setSnackbar={setSnackbar}
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

            {loadLoading &&
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '100vh', width: '100vw', background: 'rgba(0,0,0, 0.25)', zIndex: '99999' }}>
                    <Loading />
                </div>
            }
            {/* Скрытый компонент для печати */}
            <div style={{ display: 'none' }}>
                <EvidenceReport
                    evidenceReportRef={evidenceReportRef}
                    evidenceSearchQuery={evidenceSearchQuery}
                    evidenceTypeFilter={evidenceTypeFilter}
                    dateAddedFrom={dateAddedFrom}
                    dateAddedTo={dateAddedTo}
                    evidenceExportData={evidenceExportData}
                />
            </div>
        </>
    );
};

export default EvidenceSearchTab;
