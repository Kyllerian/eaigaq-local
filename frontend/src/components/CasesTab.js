// src/components/CasesTab.js

import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tooltip,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Divider,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    OpenInNew as OpenInNewIcon,
    Circle as CircleIcon,
    Print as PrintIcon,
} from '@mui/icons-material';
import {useTheme} from '@mui/material/styles';
import {StyledButton, StyledTableCell} from './StyledComponents';
import axios from '../axiosConfig';
import {useNavigate} from 'react-router-dom';
import {useReactToPrint} from 'react-to-print';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';
import {EVIDENCE_TYPES} from '../constants/evidenceTypes';
import {evidenceStatuses} from '../constants/evidenceStatuses';

const CasesTab = ({
                      user,
                      departments,
                      snackbar,
                      setSnackbar,
                      setError,
                  }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [selectedCase, setSelectedCase] = useState(null);
    const [openCaseDialog, setOpenCaseDialog] = useState(false);
    const [newCase, setNewCase] = useState({
        name: '',
        description: '',
    });

    // Добавлен стейт для поиска
    const [searchQuery, setSearchQuery] = useState('');

    // Штрихкод
    const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');
    const barcodeInputRef = useRef();

    // Добавляем стейт для фильтрации по датам
    const [dateCreatedFrom, setDateCreatedFrom] = useState('');
    const [dateCreatedTo, setDateCreatedTo] = useState('');

    // Добавляем стейт для фильтрации по отделению (только для REGION_HEAD)
    const [departmentFilter, setDepartmentFilter] = useState('');

    // Стейт для экспорта отчета
    const [casesExportData, setCasesExportData] = useState([]);
    const [shouldPrint, setShouldPrint] = useState(false);
    const reportRef = useRef();

    // Функция для получения дел с учетом фильтров
    const fetchCases = useCallback(() => {
        const params = {};

        if (searchQuery) {
            params.search = searchQuery;
        }

        if (dateCreatedFrom) {
            params['created__gte'] = dateCreatedFrom;
        }

        if (dateCreatedTo) {
            params['created__lte'] = dateCreatedTo;
        }

        // Добавляем фильтр по отделению, если роль REGION_HEAD и отделение выбрано
        if (user.role === 'REGION_HEAD' && departmentFilter) {
            params.department = departmentFilter;
        }

        axios
            .get('/api/cases/', {params})
            .then((response) => {
                setCases(response.data);
            })
            .catch((error) => {
                console.error('Ошибка при загрузке дел:', error);
                setError('Ошибка при загрузке дел.');
            });
    }, [
        searchQuery,
        dateCreatedFrom,
        dateCreatedTo,
        departmentFilter,
        user.role,
        setError,
    ]);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    const handleCaseSelect = (caseItem) => {
        if (selectedCase && selectedCase.id === caseItem.id) {
            setSelectedCase(null);
        } else {
            setSelectedCase(caseItem);
        }
    };

    const handleOpenCaseDialog = () => {
        setOpenCaseDialog(true);
    };

    const handleCloseCaseDialog = () => {
        setOpenCaseDialog(false);
        setNewCase({
            name: '',
            description: '',
        });
    };

    const handleCaseInputChange = (event) => {
        const {name, value} = event.target;
        setNewCase({...newCase, [name]: value});
    };

    const handleCaseFormSubmit = (event) => {
        event.preventDefault();

        const caseData = {
            ...newCase,
        };

        axios
            .post('/api/cases/', caseData)
            .then((response) => {
                setSnackbar({
                    open: true,
                    message: 'Дело успешно добавлено.',
                    severity: 'success',
                });
                fetchCases();
                handleCloseCaseDialog();
            })
            .catch((error) => {
                console.error(
                    'Ошибка при добавлении дела:',
                    error.response?.data || error
                );
                setSnackbar({
                    open: true,
                    message: 'Ошибка при добавлении дела.',
                    severity: 'error',
                });
            });
    };

    const handleOpenCaseDetails = () => {
        if (selectedCase) {
            navigate(`/cases/${selectedCase.id}/`);
        }
    };

    // Обработчики для штрихкода
    const handleOpenBarcodeDialog = () => {
        setOpenBarcodeDialog(true);
        setScannedBarcode('');
        setTimeout(() => {
            barcodeInputRef.current?.focus();
        }, 100);
    };

    const handleCloseBarcodeDialog = () => {
        setOpenBarcodeDialog(false);
        setScannedBarcode('');
    };

    const handleBarcodeInputChange = (event) => {
        setScannedBarcode(event.target.value);
    };

    const handleBarcodeSubmit = (event) => {
        event.preventDefault();

        if (scannedBarcode.trim() === '') {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, отсканируйте штрихкод.',
                severity: 'warning',
            });
            return;
        }

        // Функция для обработки результата поиска
        const handleSearchResult = (caseId) => {
            if (caseId) {
                navigate(`/cases/${caseId}/`);
            } else {
                setSnackbar({
                    open: true,
                    message: 'Дело не найдено.',
                    severity: 'error',
                });
            }
        };

        // Ищем дело по штрихкоду
        axios
            .get(`/api/cases/get_by_barcode/?barcode=${scannedBarcode}`)
            .then((response) => {
                const caseData = response.data;
                handleSearchResult(caseData.id);
            })
            .catch((error) => {
                console.error('Ошибка при поиске дела по штрихкоду:', error);
                setSnackbar({
                    open: true,
                    message: 'Дело не найдено или у вас нет доступа.',
                    severity: 'error',
                });
            })
            .finally(() => {
                handleCloseBarcodeDialog();
            });
    };

    // Обработчик изменения поиска
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Обработчики изменения дат
    const handleDateCreatedFromChange = (event) => {
        setDateCreatedFrom(event.target.value);
    };

    const handleDateCreatedToChange = (event) => {
        setDateCreatedTo(event.target.value);
    };

    // Обработчик изменения фильтра по отделению
    const handleDepartmentFilterChange = (event) => {
        setDepartmentFilter(event.target.value);
    };

    // Функции для форматирования и отображения данных

    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };
        return date.toLocaleDateString('ru-RU', options);
    };

    // Получение отображаемого статуса
    const getStatusLabel = (value) => {
        const status = evidenceStatuses.find((status) => status.value === value);
        return status ? status.label : value;
    };

    // Получение отображаемого типа
    const getTypeLabel = (value) => {
        const type = EVIDENCE_TYPES.find((type) => type.value === value);
        return type ? type.label : value;
    };

    // Функция экспорта отчета
    const handleExportReport = () => {
        const params = {};

        if (searchQuery) {
            params.search = searchQuery;
        }

        if (dateCreatedFrom) {
            params['created__gte'] = dateCreatedFrom;
        }

        if (dateCreatedTo) {
            params['created__lte'] = dateCreatedTo;
        }

        if (user.role === 'REGION_HEAD' && departmentFilter) {
            params.department = departmentFilter;
        }

        axios
            .get('/api/cases/', {params})
            .then(async (response) => {
                const casesData = response.data;

                // Для каждого дела получаем список вещественных доказательств и данные о следователе
                const casesWithDetails = await Promise.all(
                    casesData.map(async (caseItem) => {
                        // Получаем вещественные доказательства
                        const evidencesResponse = await axios.get(
                            `/api/material-evidences/?case=${caseItem.id}`
                        );

                        // Получаем данные о следователе и отделении
                        const caseDetailResponse = await axios.get(
                            `/api/cases/${caseItem.id}/`
                        );

                        return {
                            ...caseItem,
                            evidences: evidencesResponse.data,
                            investigator: caseDetailResponse.data.investigator,
                            department: caseDetailResponse.data.department,
                        };
                    })
                );

                setCasesExportData(casesWithDetails);
                setShouldPrint(true);
            })
            .catch((error) => {
                console.error('Ошибка при экспорте отчета:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при экспорте отчета.',
                    severity: 'error',
                });
            });
    };

    const handlePrintReport = useReactToPrint({
        contentRef: reportRef,
        documentTitle: 'Отчет по делам',
        pageStyle: `
      @page {
        margin: 10mm 10mm 10mm 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          display: table;
        }
        body::after {
          display: table-footer-group;
          position: fixed;
          bottom: 0;
          right: 0;
          font-size: 12px;
        }
        /* Стили для предотвращения разрыва внутри дела */
        .case-container {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    `,
    });

    useEffect(() => {
        if (shouldPrint && casesExportData.length > 0) {
            handlePrintReport();
            setShouldPrint(false);
        }
    }, [shouldPrint, casesExportData, handlePrintReport]);

    return (
        <>
            {/* Поля поиска и фильтрации */}
            <Box sx={{mb: theme.spacing(3)}}>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: theme.spacing(1),
                        mb: theme.spacing(2),
                    }}
                >
                    <TextField
                        label="Поиск по названию или создателю"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        size="small"
                        sx={{flexGrow: 1}}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action"/>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Дата создания от"
                        type="date"
                        variant="outlined"
                        value={dateCreatedFrom}
                        onChange={handleDateCreatedFromChange}
                        size="small"
                        sx={{maxWidth: 150}}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Дата создания до"
                        type="date"
                        variant="outlined"
                        value={dateCreatedTo}
                        onChange={handleDateCreatedToChange}
                        size="small"
                        sx={{maxWidth: 150}}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    {/* Фильтр по отделению для REGION_HEAD */}
                    {user.role === 'REGION_HEAD' && (
                        <FormControl
                            variant="outlined"
                            size="small"
                            sx={{minWidth: 150}}
                        >
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
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <StyledButton
                        onClick={handleOpenBarcodeDialog}
                        startIcon={<SearchIcon/>}
                        size="small"
                        sx={{
                            height: '40px',
                            flexShrink: 0,
                        }}
                    >
                        Поиск по штрихкоду
                    </StyledButton>
                    {/* Кнопка экспорта отчета */}
                    <StyledButton
                        onClick={handleExportReport}
                        startIcon={<PrintIcon/>}
                        size="small"
                        sx={{
                            height: '40px',
                            width: '200px',
                            flexShrink: 0,
                        }}
                    >
                        Экспорт отчета
                    </StyledButton>
                </Box>

                {/* Кнопки */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: theme.spacing(2),
                        flexWrap: 'wrap',
                        gap: theme.spacing(2),
                    }}
                >
                    {user.role !== 'REGION_HEAD' && (
                        <StyledButton
                            onClick={handleOpenCaseDialog}
                            startIcon={<AddIcon/>}
                            sx={{
                                height: '40px',
                                width: '200px',
                            }}
                        >
                            Добавить дело
                        </StyledButton>
                    )}
                    {/* Добавляем пустой блок, чтобы кнопка "Открыть дело" была справа */}
                    <Box sx={{flexGrow: 1}}/>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing(1),
                        }}
                    >
                        <Tooltip
                            title={
                                selectedCase
                                    ? selectedCase.active
                                        ? 'Активно'
                                        : 'Закрыто'
                                    : 'Не выбрано'
                            }
                            placement="top"
                        >
                            <IconButton disabled>
                                <CircleIcon
                                    style={{
                                        color: selectedCase
                                            ? selectedCase.active
                                                ? theme.palette.success.main
                                                : theme.palette.error.main
                                            : theme.palette.grey[500],
                                        fontSize: 24,
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                        <StyledButton
                            onClick={handleOpenCaseDetails}
                            startIcon={<OpenInNewIcon/>}
                            disabled={!selectedCase}
                            sx={{
                                height: '40px',
                                width: '200px',
                            }}
                        >
                            Открыть дело
                        </StyledButton>
                    </Box>
                </Box>

                {/* Таблица дел */}
                <Paper elevation={1}>
                    <TableContainer>
                        <Table
                            aria-label="Таблица дел"
                            sx={{tableLayout: 'fixed', minWidth: 650}}
                        >
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell sx={{width: '20%'}}>
                                        Название дела
                                    </StyledTableCell>
                                    <StyledTableCell sx={{width: '40%'}}>
                                        Описание
                                    </StyledTableCell>
                                    <StyledTableCell sx={{width: '15%'}}>
                                        Создатель
                                    </StyledTableCell>
                                    <StyledTableCell sx={{width: '15%'}}>
                                        Дата создания
                                    </StyledTableCell>
                                    {user && user.role === 'REGION_HEAD' && (
                                        <StyledTableCell sx={{width: '10%'}}>
                                            Отделение
                                        </StyledTableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cases.length > 0 ? (
                                    cases.map((caseItem) => (
                                        <TableRow
                                            key={caseItem.id}
                                            hover
                                            selected={selectedCase && selectedCase.id === caseItem.id}
                                            onClick={() => handleCaseSelect(caseItem)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <TableCell
                                                component="th"
                                                scope="row"
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {caseItem.name}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {caseItem.description}
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {caseItem.creator_name}
                                            </TableCell>
                                            <TableCell>{formatDate(caseItem.created)}</TableCell>
                                            {user && user.role === 'REGION_HEAD' && (
                                                <TableCell
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {caseItem.department_name ||
                                                        (caseItem.department && caseItem.department.name) ||
                                                        'Не указано'}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={user && user.role === 'REGION_HEAD' ? 5 : 4}
                                            align="center"
                                        >
                                            Нет результатов.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* Скрытый компонент для печати отчета */}
            <div style={{display: 'none'}}>
                <div
                    ref={reportRef}
                    style={{
                        padding: '10mm',
                        fontFamily: 'Arial, sans-serif',
                        color: '#000',
                        fontSize: '12px',
                    }}
                >
                    {/* Header */}
                    <div style={{textAlign: 'center', marginBottom: '20px'}}>
                        <img
                            src={LogoMVDKZ}
                            alt="Логотип"
                            style={{maxWidth: '100px', marginBottom: '10px'}}
                        />
                        <Typography variant="h5" gutterBottom>
                            Отчет по делам
                        </Typography>
                        {/* Добавляем регион */}
                        <Typography variant="subtitle1">
                            Регион: {user.region_display || 'Неизвестно'}
                        </Typography>
                        <Typography variant="subtitle1">
                            Дата формирования отчета: {formatDate(new Date().toISOString())}
                        </Typography>
                    </div>

                    {/* Filters */}
                    <div style={{marginBottom: '20px'}}>
                        {searchQuery && (
                            <Typography variant="h6">Поиск: {searchQuery}</Typography>
                        )}
                        {(dateCreatedFrom || dateCreatedTo) && (
                            <Typography variant="h6">
                                Дата создания: {dateCreatedFrom || '...'} -{' '}
                                {dateCreatedTo || '...'}
                            </Typography>
                        )}
                        {user.role === 'REGION_HEAD' && departmentFilter && (
                            <Typography variant="h6">
                                Отделение:{' '}
                                {
                                    departments.find((dept) => dept.id === departmentFilter)
                                        ?.name
                                }
                            </Typography>
                        )}
                    </div>

                    {/* Cases Report */}
                    {casesExportData.map((caseItem, index) => (
                        <div
                            key={caseItem.id}
                            className="case-container"
                            style={{
                                marginBottom: '40px',
                                pageBreakInside: 'avoid',
                                breakInside: 'avoid',
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                Дело: {caseItem.name}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Следователь:</strong>{' '}
                                {caseItem.investigator
                                    ? caseItem.investigator.full_name
                                    : 'Неизвестно'}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Дата создания:</strong> {formatDate(caseItem.created)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Дата обновления:</strong> {formatDate(caseItem.updated)}
                            </Typography>
                            <Typography variant="body1">
                                <strong>Активно:</strong> {caseItem.active ? 'Да' : 'Нет'}
                            </Typography>

                            {/* Вещественные доказательства */}
                            <div style={{marginTop: '20px'}}>
                                <Typography variant="subtitle1" gutterBottom>
                                    Вещественные доказательства
                                </Typography>
                                {caseItem.evidences.length > 0 ? (
                                    <TableContainer
                                        component={Paper}
                                        style={{boxShadow: 'none'}}
                                    >
                                        <Table
                                            aria-label="Таблица вещественных доказательств"
                                            style={{
                                                tableLayout: 'fixed',
                                                width: '100%',
                                                fontSize: '12px',
                                            }}
                                        >
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell style={{width: '25%'}}>
                                                        <strong>Название</strong>
                                                    </TableCell>
                                                    <TableCell style={{width: '25%'}}>
                                                        <strong>Описание</strong>
                                                    </TableCell>
                                                    <TableCell style={{width: '20%'}}>
                                                        <strong>Тип ВД</strong>
                                                    </TableCell>
                                                    <TableCell style={{width: '30%'}}>
                                                        <strong>Статус</strong>
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {caseItem.evidences.map((evidence) => (
                                                    <TableRow key={evidence.id}>
                                                        <TableCell
                                                            style={{
                                                                width: '25%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {evidence.name}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: '25%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {evidence.description}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: '20%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {getTypeLabel(evidence.type)}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: '30%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {getStatusLabel(evidence.status)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Typography variant="body2">
                                        Нет вещественных доказательств.
                                    </Typography>
                                )}
                            </div>

                            {/* Добавляем разделитель между делами, кроме последнего */}
                            {index < casesExportData.length - 1 && (
                                <Divider style={{margin: '40px 0'}}/>
                            )}
                        </div>
                    ))}

                    {/* Footer с нумерацией страниц */}
                    {/* Нумерация страниц будет отображаться через body::after */}
                </div>
            </div>

            {/* Диалоги */}
            {user.role !== 'REGION_HEAD' && (
                <Dialog
                    open={openCaseDialog}
                    onClose={handleCloseCaseDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Добавить новое дело</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Название дела"
                            name="name"
                            value={newCase.name}
                            onChange={handleCaseInputChange}
                            fullWidth
                            required
                            inputProps={{maxLength: 255}}
                        />
                        <TextField
                            margin="dense"
                            label="Описание дела"
                            name="description"
                            value={newCase.description}
                            onChange={handleCaseInputChange}
                            fullWidth
                            required
                            multiline
                            rows={4}
                            inputProps={{maxLength: 1000}}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCaseDialog}>Отмена</Button>
                        <StyledButton onClick={handleCaseFormSubmit}>Создать</StyledButton>
                    </DialogActions>
                </Dialog>
            )}

            {/* Диалог сканирования штрихкода */}
            <Dialog open={openBarcodeDialog} onClose={handleCloseBarcodeDialog}>
                <DialogTitle>Сканирование штрихкода</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        inputRef={barcodeInputRef}
                        margin="dense"
                        label="Штрихкод"
                        value={scannedBarcode}
                        onChange={handleBarcodeInputChange}
                        fullWidth
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                handleBarcodeSubmit(event);
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBarcodeDialog}>Отмена</Button>
                    <StyledButton onClick={handleBarcodeSubmit}>Найти</StyledButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CasesTab;