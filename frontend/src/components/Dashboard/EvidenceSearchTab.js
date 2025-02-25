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
import { useEvidenceTypes } from '../../constants/evidenceTypes';
import { useEvidenceStatuses } from '../../constants/evidenceStatuses';
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
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const EVIDENCE_TYPES = useEvidenceTypes();
    const EVIDENCE_STATUSES = useEvidenceStatuses();

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
    const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('');
    const [evidenceStatusFilter, setEvidenceStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState([null, null]);
    const [isLoadingPage, setIsLoading] = useState(false);

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

    useEffect(() => {
        if (!isLoadingPage) {
            setIsLoading(true);
            handleDateRangeChange([dayjs().subtract(2, 'week').startOf('day'),
            dayjs().endOf('day'),])
        }
    })

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
                    message: t('common.errors.error_fetch_data'),
                    severity: 'error',
                });
            }
        };

        fetchData();
    }, [setSnackbar, t]);

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
    } = useQuery(['evidences', params], fetchEvidences, {
        keepPreviousData: true,
    });

    const evidences = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Устанавливаем tableHeight на основе количества строк
    const tableHeight = (evidences.length > 0 ? Math.min(evidences.length, pageSize) : 7) * rowHeight + headerHeight;

    useEffect(() => {
        if (isError) {
            console.error('Ошибка при получении вещественных доказательств:', error);
            setSnackbar({
                open: true,
                message: t('common.errors.error_fetch_evidences'),
                severity: 'error',
            });
        }
    }, [isError, error, setSnackbar, t]);

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
        documentTitle: t('common.report.titles.report_evidence'),
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

    // Обработчик экспорта в Excel
    const handleExportExcel = useCallback(
        async (exportData) => {
            if (exportData.length === 0) {
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_no_data_for_export'),
                    severity: 'warning',
                });
                setLoading(false);
                return;
            }
            try {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet(t('common.standard.evidence'), {
                    pageSetup: { orientation: 'landscape' }
                });

                // Добавляем заголовки
                worksheet.columns = [
                    { header: t('common.table_headers.number'), key: 'number', width: 5 },
                    { header: t('common.table_headers.evidence'), key: 'vd', width: 30 },
                    { header: t('common.table_headers.type_status_evidence'), key: 'type_status', width: 15 },
                    { header: t('common.table_headers.case_investigator'), key: 'case_name_and_investigator', width: 20 },
                    { header: t('common.table_headers.department_and_region'), key: 'department_region', width: 25 },
                    { header: t('common.table_headers.created'), key: 'created_barcode', width: 18 },
                ];

                // Добавляем данные
                exportData.forEach((evidence, index) => {
                    // Объединяем необходимые поля
                    const vd = `${evidence.name}\n${evidence.description}`;
                    const type_status = `${EVIDENCE_TYPES.find(
                        (type) => type.value === evidence.type
                    )?.label || evidence.type_display}\n${EVIDENCE_STATUSES.find(
                        (status) => status.value === evidence.status
                    )?.label || evidence.status_display}`;//${evidence.status_display}`;

                    const department_region = `${evidence.department_name || t('common.messages.not_specified')}\n${evidence.region_name || t('common.messages.not_specified')}`;
                    const created = formatDate(evidence.created);
                    const barcode = evidence.barcode ? evidence.barcode : '';

                    worksheet.addRow({
                        number: index + 1,
                        vd: vd,
                        type_status: type_status,
                        case_name_and_investigator: `${evidence.case_name || t('common.table_data.not_assigned')}\n${evidence.investigator_name || t('common.messages.not_specified')}`,
                        department_region: department_region,
                        created_barcode: created + (barcode ? `\n${barcode}` : ''),
                    });

                    // Применяем перенос текста для ячеек с несколькими строками
                    const lastRow = worksheet.lastRow;
                    lastRow.getCell('vd').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    lastRow.getCell('type_status').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    lastRow.getCell('case_name_and_investigator').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    // lastRow.getCell('investigator_name').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    lastRow.getCell('department_region').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                    lastRow.getCell('created_barcode').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

                    // Рассчитываем высоту строки на основе количества символов
                    const calculateRowHeight = (text, charPerLine) => {
                        const lines = text.split('\n').reduce((acc, line) => {
                            return acc + Math.ceil(line.length / charPerLine);
                        }, 0);
                        return lines + 3;
                    };

                    const maxLines = Math.max(
                        calculateRowHeight(vd, 30), // Предполагаем, что в одну строку помещается 50 символов
                        calculateRowHeight(type_status, 50),
                        calculateRowHeight(department_region, 50),
                    );
                    lastRow.height = maxLines * 22; // 15 - высота одной строки
                });

                // Применяем стили к заголовкам
                const headerRow = worksheet.getRow(1);
                headerRow.font = { bold: true };
                headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                headerRow.height = 20;
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

                // Применяем стили к данным
                worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                    row.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
                    // row.height = 40; // Увеличиваем высоту строк для обтекания текста

                    // Добавляем границы
                    row.eachCell((cell) => {
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

                    // Специальное форматирование для строки с баркодом
                    if (rowNumber > 1) { // Пропускаем заголовок
                        // const barcodeCell = row.getCell('created_barcode');
                        if (exportData[rowNumber - 2].barcode) {
                            // Если хотите добавить изображение баркода, нужно предварительно сгенерировать изображение
                            // и вставить его как картинку. Это более сложный процесс и требует дополнительных библиотек.
                            // Здесь мы просто добавляем текст баркода.
                            // Альтернативно можно использовать шрифт с поддержкой баркодов.
                        }
                    }
                });

                // Установить выравнивание заголовков по центру
                worksheet.columns.forEach((column) => {
                    column.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                });

                // Генерируем буфер
                const buffer = await workbook.xlsx.writeBuffer();

                // Сохраняем файл
                const blob = new Blob([buffer], { type: 'application/octet-stream' });
                saveAs(blob, t('common.report.titles.file_name_evidence'));
            } catch (error) {
                console.error(t('common.errors.error_export_excel'), error);
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_export_excel'),
                    severity: 'error',
                });
            } finally {
                setLoading(false);
            }
        },
        [setSnackbar, t]
    );
    const handleEvidenceExport = useCallback(
        (type) => {
            setLoading(true);
            handleExportMenuClose();
            const exportParams = {
                ...params,
                page: 1,
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
                                message: t('common.errors.error_no_data_for_export'),
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
                        message: t('common.errors.error_export_evidences'),
                        severity: 'error',
                    });
                    setLoading(false);
                });
        },
        [params, totalCount, handleExportExcel, setSnackbar, t]
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
                            label={t('dashboard.tabs.search_evidence.toolbar.label_search_query')}
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
                            <InputLabel id="evidence-type-filter-label">{t('common.standard.label_evidence_type')}</InputLabel>
                            <Select
                                labelId="evidence-type-filter-label"
                                value={evidenceTypeFilter}
                                onChange={handleEvidenceTypeFilterChange}
                                label={t('common.standard.label_evidence_type')}
                            >
                                <MenuItem value="">
                                    <em>{t('dashboard.tabs.search_evidence.toolbar.option_all_types')}</em>
                                </MenuItem>
                                {EVIDENCE_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, maxWidth: 150 }}>
                            <InputLabel id="evidence-status-filter-label">{t('dashboard.tabs.search_evidence.toolbar.label_evidence_status')}</InputLabel>
                            <Select
                                labelId="evidence-status-filter-label"
                                value={evidenceStatusFilter}
                                onChange={handleEvidenceStatusFilterChange}
                                label={t('dashboard.tabs.search_evidence.toolbar.label_evidence_status')}
                            >
                                <MenuItem value="">
                                    <em>{t('dashboard.tabs.search_evidence.toolbar.option_all_statuses')}</em>
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
                                clearButtonLabel: t("common.buttons.clear_button"),
                            }}
                        >
                            <DateRangePicker
                                value={dateRange}
                                onChange={handleDateRangeChange}
                                label={t('common.toolbar.label_date_range')}
                                slots={{ field: SingleInputDateRangeField }}
                                slotProps={{
                                    field: {
                                        size: 'small',
                                        label: t('common.toolbar.label_date_range'),
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
                                <InputLabel id="department-filter-label">{t('common.standard.label_department')}</InputLabel>
                                <Select
                                    labelId="department-filter-label"
                                    value={departmentFilter}
                                    onChange={handleDepartmentFilterChange}
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
                                <MenuItem onClick={() => handleEvidenceExport('pdf')}>
                                    <ListItemIcon>
                                        <PictureAsPdfIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>{t('common.buttons.export_pdf')}</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleEvidenceExport('excel')}>
                                    <ListItemIcon>
                                        <DescriptionIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>{t('common.buttons.export_excel')}</ListItemText>
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