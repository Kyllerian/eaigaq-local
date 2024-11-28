// frontend/src/components/Dashboard/CasesTab.js

import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box,
    Pagination,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useQuery } from 'react-query';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { formatDate } from '../../constants/formatDate';
import AffairsTable from './Affairs/Table';
import DialogNewAffairs from './Affairs/DialogNewAffairs';
import DialogScanBarcode from './Affairs/DialogScanBarcode';
import CaseReport from './Affairs/CaseReport';
import Loading from "../Loading";
import AffairsToolbar from './Affairs/Toolbar';


// Debounce hook to prevent excessive API calls
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

const CasesTab = ({
    user,
    departments,
    setSnackbar,
    setError
}) => {

    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    // States for export and report
    const [casesExportData, setCasesExportData] = useState([]);
    const [casesShouldPrint, setCasesShouldPrint] = useState(false);
    const caseReportRef = useRef();

    const [loadLoading, setLoading] = useState(false);

    // States for filters, search, and sorting
    const [searchQuery, setSearchQuery] = useState('');
    const [dateAddedFrom, setDateAddedFrom] = useState('');
    const [dateAddedTo, setDateAddedTo] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('');
    
    const [selectedCase, setSelectedCase] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [countAll, setCountAll] = useState(null);
    const [pageSize, setPageSize] = useState(20); // Default value

    // State for sorting
    const [sortConfig, setSortConfig] = useState({
        key: 'created', // Поле сортировки по умолчанию
        direction: 'desc', // Направление сортировки по умолчанию ('asc' или 'desc')
    });

    // Use debounce for search input
    const debouncedSearchQuery = useDebounce(searchQuery, 800);

    // Calculate pageSize based on window height
    const calculatePageSize = useCallback(() => {
        const height = window.innerHeight;
        const itemHeight = 64; // Approximate row height
        const headerHeight = isSmallScreen ? 300 : 200; // Header and filter heights
        const footerHeight = 56; // Pagination height
        const availableHeight = height - headerHeight - footerHeight;
        let calculatedPageSize = Math.floor(availableHeight / itemHeight) - 3; // Subtract 4 rows
        return calculatedPageSize > 0 ? calculatedPageSize : 10; // Minimum 10 items per page
    }, [isSmallScreen]);

    useEffect(() => {
        const handleResize = () => {
            setPageSize(calculatePageSize());
        };

        window.addEventListener('resize', handleResize);
        // Initialize pageSize on mount
        setPageSize(calculatePageSize());

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [calculatePageSize]);

    // Fetch cases using useQuery
    const fetchCases = async ({ queryKey }) => {
        const [_key, params] = queryKey;
        const response = await axios.get('/api/cases/', { params });
        setCountAll(response.data.count);
        return response.data;
    };

    // Query params
    const params = {
        search: debouncedSearchQuery || undefined,
        created__gte: dateAddedFrom || undefined,
        created__lte: dateAddedTo || undefined,
        page: currentPage,
        page_size: pageSize,
        department: departmentFilter || undefined,
        ordering: `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`,
    };

    // Use useQuery to fetch data
    const {
        data,
        isLoading,
        isError,
        error,
    } = useQuery(['cases', params], fetchCases, {
        keepPreviousData: true,
    });

    const cases = data?.results || [];
    const totalPages = Math.ceil((data?.count || 0) / pageSize);

    useEffect(() => {
        if (isError) {
            console.error('Ошибка при получении дел:', error);
            setSnackbar({
                open: true,
                message: 'Ошибка при получении дел.',
                severity: 'error',
            });
        }
    }, [isError, error, setSnackbar]);

    // Handlers for filters and search
    const handleSearchChange = useCallback((event) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1); // Reset to first page
    }, []);

    const handleDateAddedFromChange = useCallback((value) => {
        setDateAddedFrom(value);
        setCurrentPage(1);
    }, []);

    const handleDateAddedToChange = useCallback((value) => {
        setDateAddedTo(value);
        setCurrentPage(1);
    }, []);

    const handleDepartmentFilterChange = useCallback((event) => {
        setDepartmentFilter(event.target.value);
        setCurrentPage(1);
    }, []);

    const handlePageChange = useCallback((event, value) => {
        setCurrentPage(value);
    }, []);

    // Export to PDF and Excel
    const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
    const handleExportMenuOpen = (event) => {
        setExportMenuAnchorEl(event.currentTarget);
    };
    const handleExportMenuClose = () => {
        setExportMenuAnchorEl(null);
    };

    const handleCaseSelect = (caseItem) => {
        if (selectedCase && selectedCase.id === caseItem.id) {
            setSelectedCase(null);
        } else {
            setSelectedCase(caseItem);
        }
    };

    const handleOpenCaseDetails = () => {
        if (selectedCase) {
            navigate(`/cases/${selectedCase.id}/`);
        }
    };

    const handleCaseExport = useCallback(
        (type) => {
            setLoading(true);
            handleExportMenuClose();
            const exportParams = {
                search: searchQuery || undefined,
                created__gte: dateAddedFrom || undefined,
                created__lte: dateAddedTo || undefined,
                page_size: countAll || 1000, // Fetch all data or set a reasonable maximum
                department: departmentFilter || undefined,
                ordering: `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}`,
            };

            axios
                .get('/api/cases/', { params: exportParams })
                .then((response) => {
                    const exportData = response.data.results || [];
                    setCasesExportData(exportData);
                    if (type === 'pdf') {
                        setCasesShouldPrint(true);
                    } else {
                        handleExportExcel(exportData);
                    }
                })
                .catch((error) => {
                    console.error('Ошибка при экспорте дел:', error);
                    setSnackbar({
                        open: true,
                        message: 'Ошибка при экспорте дел.',
                        severity: 'error',
                    });
                    setLoading(false);
                });
        },
        [
            searchQuery,
            dateAddedFrom,
            dateAddedTo,
            departmentFilter,
            countAll,
            sortConfig,
            setSnackbar,
        ]
    );

    const handlePrintCaseReport = useReactToPrint({
        contentRef: caseReportRef,
        documentTitle: 'Отчет по делам',
        onAfterPrint: () => {
            setLoading(false);
        },
    });

    useEffect(() => {
        if (casesShouldPrint && casesExportData.length > 0) {
            handlePrintCaseReport();
            setCasesShouldPrint(false);
        }
    }, [casesExportData, casesShouldPrint, handlePrintCaseReport]);

    // Handle export to Excel
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

                // Add headers
                worksheet.columns = [
                    { header: 'Название дела', key: 'name', width: 30 },
                    { header: 'Описание дела', key: 'description', width: 30 },
                    { header: 'Следователь', key: 'investigator_name', width: 25 },
                    { header: 'Отделение', key: 'department_name', width: 30 },
                    { header: 'Дата создания', key: 'created', width: 20 },
                    { header: 'Дата обновления', key: 'updated', width: 20 },
                ];

                // Add data
                exportData.forEach((caseItem) => {
                    worksheet.addRow({
                        name: caseItem.name,
                        description: caseItem.description,
                        investigator_name: caseItem.investigator_name || 'Не указано',
                        department_name: caseItem.department_name || 'Не указано',
                        created: formatDate(caseItem.created),
                        updated: formatDate(caseItem.updated),
                    });
                });

                // Apply styles to headers
                worksheet.getRow(1).font = { bold: true };

                worksheet.eachRow({ includeEmpty: true }, (row) => {
                    row.alignment = { wrapText: true };
                });

                // Generate buffer
                const buffer = await workbook.xlsx.writeBuffer();

                // Save file
                const blob = new Blob([buffer], { type: 'application/octet-stream' });
                saveAs(blob, 'Отчет_по_делам.xlsx');
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

    // Handlers for barcode scanning
    const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');
    const barcodeInputRef = useRef();

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

    const handleBarcodeSubmit = async (event) => {
        event.preventDefault();

        if (scannedBarcode.trim() === '') {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, отсканируйте штрихкод.',
                severity: 'warning',
            });
            return;
        }

        try {
            const response = await axios.get('/api/cases/get_by_barcode/', {
                params: { barcode: scannedBarcode },
            });
            const caseData = response.data;
            // Redirect to case detail page
            navigate(`/cases/${caseData.id}/`);
        } catch (error) {
            console.error(
                'Ошибка при поиске дела по штрихкоду:',
                error.response?.data || error
            );
            setSnackbar({
                open: true,
                message:
                    error.response?.data?.detail ||
                    'Ошибка при поиске дела по штрихкоду.',
                severity: 'error',
            });
        } finally {
            handleCloseBarcodeDialog();
        }
    };

    // Open new case dialog
    const [openCaseDialog, setOpenCaseDialog] = useState(false);
    const handleOpenCaseDialog = () => {
        setOpenCaseDialog(true);
    };

    return (
        <>
            {/* Search and filter fields */}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <AffairsToolbar user={user} departments={departments} searchQuery={searchQuery} handleSearchChange={handleSearchChange}
                    dateAddedFrom={dateAddedFrom} handleDateAddedFromChange={handleDateAddedFromChange} dateAddedTo={dateAddedTo} 
                    handleDateAddedToChange={handleDateAddedToChange} 
                    handleOpenBarcodeDialog={handleOpenBarcodeDialog} handleDepartmentChange={handleDepartmentFilterChange}
                    handleExportMenuOpen={handleExportMenuOpen} exportMenuAnchorEl={exportMenuAnchorEl} 
                    handleExportMenuClose={handleExportMenuClose} handleCaseExport={handleCaseExport} 
                    handleOpenCaseDialog={handleOpenCaseDialog} selectedDepartment={departmentFilter} 
                    selectedCase={selectedCase} handleOpenCaseDetails={handleOpenCaseDetails} 
                />
                {/* <Box sx={{ mb: theme.spacing(3) }}>
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
                            label="Поиск по названию, описанию или имени следователя"
                            variant="outlined"
                            value={searchQuery}
                            onChange={handleSearchChange}
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
                        <TextField
                            label="Дата создания от"
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
                            label="Дата создания до"
                            type="date"
                            variant="outlined"
                            value={dateAddedTo}
                            onChange={handleDateAddedToChange}
                            size="small"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {/!* Department filter for REGION_HEAD *!/}
                        {user?.role === 'REGION_HEAD' && (
                            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
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

                        {/* Export button with menu *!/}
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
                                <MenuItem onClick={() => handleCaseExport('pdf')}>
                                    <ListItemIcon>
                                        <PictureAsPdfIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Экспорт PDF</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => handleCaseExport('excel')}>
                                    <ListItemIcon>
                                        <DescriptionIcon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Экспорт Excel</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>

                        {/* Barcode scan button *!/}
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={handleOpenBarcodeDialog}
                            sx={{ height: '40px' }}
                        >
                            Сканировать штрихкод
                        </Button>

                        {/* New case button (if allowed) *!/}
                        {user.role !== 'REGION_HEAD' && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenCaseDialog}
                                sx={{ height: '40px' }}
                            >
                                Новое дело
                            </Button>
                        )}
                    </Box>
                </Box> */}

                {/* Cases table */}
                <AffairsTable
                    cases={cases}
                    isLoading={isLoading}
                    setSnackbar={setSnackbar}
                    user={user}
                    handleCaseSelect={handleCaseSelect} 
                    selectedCase={selectedCase}
                    sortConfig={sortConfig}
                    setSortConfig={setSortConfig}
                />

                {/* Pagination */}
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
            {loadLoading &&
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '100vh', width: '100vw', background: 'rgba(0,0,0, 0.25)', zIndex: '99999' }}>
                    <Loading />
                </div>
            }
            {/* Dialogs */}
            {user.role !== 'REGION_HEAD' && (
                <DialogNewAffairs
                    openCaseDialog={openCaseDialog}
                    setOpenCaseDialog={setOpenCaseDialog}
                    setSnackbar={setSnackbar}
                />
            )}

            {/* Barcode scan dialog */}
            <DialogScanBarcode
                openBarcodeDialog={openBarcodeDialog}
                setOpenBarcodeDialog={setOpenBarcodeDialog}
                barcodeInputRef={barcodeInputRef}
                scannedBarcode={scannedBarcode}
                handleBarcodeInputChange={handleBarcodeInputChange}
                handleBarcodeSubmit={handleBarcodeSubmit}
            />

            {/* Hidden component for printing */}
            <div style={{ display: 'none' }}>
                <CaseReport
                    caseReportRef={caseReportRef}
                    searchQuery={searchQuery}
                    dateAddedFrom={dateAddedFrom}
                    dateAddedTo={dateAddedTo}
                    casesExportData={casesExportData}
                />
            </div>
        </>
    );
};

export default CasesTab;

// // frontend/src/components/Dashboard/CasesTab.js
//
// import { useState, useRef, useEffect, useCallback } from 'react';
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
// } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import axios from '../../axiosConfig';
// import { useNavigate } from 'react-router-dom';
// import { useReactToPrint } from 'react-to-print';
// import { useQuery } from 'react-query';
// import { saveAs } from 'file-saver';
// import ExcelJS from 'exceljs';
// import { formatDate } from '../../constants/formatDate';
// import AffairsTable from './Affairs/Table';
// import DialogNewAffairs from './Affairs/DialogNewAffairs';
// import DialogScanBarcode from './Affairs/DialogScanBarcode';
// import CaseReport from './Affairs/CaseReport';
//
// // Debounce hook to prevent excessive API calls
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
// const CasesTab = ({
//     user,
//     departments,
//     setSnackbar,
//     setError
// }) => {
//
//     const theme = useTheme();
//     const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
//     const navigate = useNavigate();
//
//     // States for export and report
//     const [casesExportData, setCasesExportData] = useState([]);
//     const [casesShouldPrint, setCasesShouldPrint] = useState(false);
//     const caseReportRef = useRef();
//
//     const [loadLoading, setLoading] = useState(false);
//
//     // States for filters and search
//     const [searchQuery, setSearchQuery] = useState('');
//     const [dateAddedFrom, setDateAddedFrom] = useState('');
//     const [dateAddedTo, setDateAddedTo] = useState('');
//     const [departmentFilter, setDepartmentFilter] = useState('');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [countAll, setCountAll] = useState(null);
//     const [pageSize, setPageSize] = useState(20); // Default value
//
//     // Use debounce for search input
//     const debouncedSearchQuery = useDebounce(searchQuery, 800);
//
//     // Calculate pageSize based on window height
//     const calculatePageSize = useCallback(() => {
//         const height = window.innerHeight;
//         const itemHeight = 64; // Approximate row height
//         const headerHeight = isSmallScreen ? 300 : 200; // Header and filter heights
//         const footerHeight = 56; // Pagination height
//         const availableHeight = height - headerHeight - footerHeight;
//         let calculatedPageSize = Math.floor(availableHeight / itemHeight) - 4; // Subtract 4 rows
//         return calculatedPageSize > 0 ? calculatedPageSize : 10; // Minimum 10 items per page
//     }, [isSmallScreen]);
//
//     useEffect(() => {
//         const handleResize = () => {
//             setPageSize(calculatePageSize());
//         };
//
//         window.addEventListener('resize', handleResize);
//         // Initialize pageSize on mount
//         setPageSize(calculatePageSize());
//
//         return () => {
//             window.removeEventListener('resize', handleResize);
//         };
//     }, [calculatePageSize]);
//
//     // Fetch cases using useQuery
//     const fetchCases = async ({ queryKey }) => {
//         const [_key, params] = queryKey;
//         const response = await axios.get('/api/cases/', { params });
//         setCountAll(response.data.count);
//         return response.data;
//     };
//
//     // Query params
//     const params = {
//         search: debouncedSearchQuery || undefined,
//         created__gte: dateAddedFrom || undefined,
//         created__lte: dateAddedTo || undefined,
//         page: currentPage,
//         page_size: pageSize,
//         department: departmentFilter || undefined,
//     };
//
//     // Use useQuery to fetch data
//     const {
//         data,
//         isLoading,
//         isError,
//         error,
//     } = useQuery(['cases', params], fetchCases, {
//         keepPreviousData: true,
//     });
//
//     const cases = data?.results || [];
//     const totalPages = Math.ceil((data?.count || 0) / pageSize);
//
//     useEffect(() => {
//         if (isError) {
//             console.error('Ошибка при получении дел:', error);
//             setSnackbar({
//                 open: true,
//                 message: 'Ошибка при получении дел.',
//                 severity: 'error',
//             });
//         }
//     }, [isError, error, setSnackbar]);
//
//     // Handlers for filters and search
//     const handleSearchChange = useCallback((event) => {
//         setSearchQuery(event.target.value);
//         setCurrentPage(1); // Reset to first page
//     }, []);
//
//     const handleDateAddedFromChange = useCallback((event) => {
//         setDateAddedFrom(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handleDateAddedToChange = useCallback((event) => {
//         setDateAddedTo(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handleDepartmentFilterChange = useCallback((event) => {
//         setDepartmentFilter(event.target.value);
//         setCurrentPage(1);
//     }, []);
//
//     const handlePageChange = useCallback((event, value) => {
//         setCurrentPage(value);
//     }, []);
//
//     // Export to PDF and Excel
//     const [exportMenuAnchorEl, setExportMenuAnchorEl] = useState(null);
//     const handleExportMenuOpen = (event) => {
//         setExportMenuAnchorEl(event.currentTarget);
//     };
//     const handleExportMenuClose = () => {
//         setExportMenuAnchorEl(null);
//     };
//
//     const handleCaseExport = useCallback(
//         (type) => {
//             setLoading(true);
//             handleExportMenuClose();
//             const exportParams = {
//                 search: searchQuery || undefined,
//                 created__gte: dateAddedFrom || undefined,
//                 created__lte: dateAddedTo || undefined,
//                 page_size: countAll || 1000, // Fetch all data or set a reasonable maximum
//                 department: departmentFilter || undefined,
//             };
//
//             axios
//                 .get('/api/cases/', { params: exportParams })
//                 .then((response) => {
//                     const exportData = response.data.results || [];
//                     setCasesExportData(exportData);
//                     if (type === 'pdf') {
//                         setCasesShouldPrint(true);
//                     } else {
//                         handleExportExcel(exportData);
//                     }
//                 })
//                 .catch((error) => {
//                     console.error('Ошибка при экспорте дел:', error);
//                     setSnackbar({
//                         open: true,
//                         message: 'Ошибка при экспорте дел.',
//                         severity: 'error',
//                     });
//                 });
//         },
//         [
//             searchQuery,
//             dateAddedFrom,
//             dateAddedTo,
//             departmentFilter,
//             countAll,
//             setSnackbar,
//         ]
//     );
//
//     const handlePrintCaseReport = useReactToPrint({
//         contentRef: caseReportRef,
//         documentTitle: 'Отчет по делам',
//     });
//
//     useEffect(() => {
//         if (casesShouldPrint && casesExportData.length > 0) {
//             handlePrintCaseReport();
//             setCasesShouldPrint(false);
//             setLoading(false);
//         }
//     }, [casesExportData, casesShouldPrint, handlePrintCaseReport]);
//
//     // Handle export to Excel
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
//                 // Add headers
//                 worksheet.columns = [
//                     { header: 'Название дела', key: 'name', width: 30 },
//                     { header: 'Описание дела', key: 'description', width: 30 },
//                     { header: 'Следователь', key: 'investigator_name', width: 25 },
//                     { header: 'Отделение', key: 'department_name', width: 30 },
//                     { header: 'Дата создания', key: 'created', width: 20 },
//                 ];
//
//                 // Add data
//                 exportData.forEach((caseItem) => {
//                     worksheet.addRow({
//                         name: caseItem.name,
//                         description: caseItem.description,
//                         investigator_name: caseItem.investigator_name || 'Не указано',
//                         department_name: caseItem.department_name || 'Не указано',
//                         created: formatDate(caseItem.created),
//                     });
//                 });
//
//                 // Apply styles to headers
//                 worksheet.getRow(1).font = { bold: true };
//
//                 worksheet.eachRow({ includeEmpty: true }, (row) => {
//                     row.alignment = { wrapText: true };
//                 });
//
//                 // Generate buffer
//                 const buffer = await workbook.xlsx.writeBuffer();
//
//                 // Save file
//                 const blob = new Blob([buffer], { type: 'application/octet-stream' });
//                 saveAs(blob, 'Отчет_по_делам.xlsx');
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
//     // Handlers for barcode scanning
//     const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
//     const [scannedBarcode, setScannedBarcode] = useState('');
//     const barcodeInputRef = useRef();
//
//     const handleOpenBarcodeDialog = () => {
//         setOpenBarcodeDialog(true);
//         setScannedBarcode('');
//         setTimeout(() => {
//             barcodeInputRef.current?.focus();
//         }, 100);
//     };
//
//     const handleCloseBarcodeDialog = () => {
//         setOpenBarcodeDialog(false);
//         setScannedBarcode('');
//     };
//
//     const handleBarcodeInputChange = (event) => {
//         setScannedBarcode(event.target.value);
//     };
//
//     const handleBarcodeSubmit = async (event) => {
//         event.preventDefault();
//
//         if (scannedBarcode.trim() === '') {
//             setSnackbar({
//                 open: true,
//                 message: 'Пожалуйста, отсканируйте штрихкод.',
//                 severity: 'warning',
//             });
//             return;
//         }
//
//         try {
//             const response = await axios.get('/api/cases/get_by_barcode/', {
//                 params: { barcode: scannedBarcode },
//             });
//             const caseData = response.data;
//             // Redirect to case detail page
//             navigate(`/cases/${caseData.id}/`);
//         } catch (error) {
//             console.error(
//                 'Ошибка при поиске дела по штрихкоду:',
//                 error.response?.data || error
//             );
//             setSnackbar({
//                 open: true,
//                 message:
//                     error.response?.data?.detail ||
//                     'Ошибка при поиске дела по штрихкоду.',
//                 severity: 'error',
//             });
//         } finally {
//             handleCloseBarcodeDialog();
//         }
//     };
//
//     // Open new case dialog
//     const [openCaseDialog, setOpenCaseDialog] = useState(false);
//     const handleOpenCaseDialog = () => {
//         setOpenCaseDialog(true);
//     };
//
//     return (
//         <>
//             {/* Search and filter fields */}
//             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
//                             label="Поиск по названию, описанию или имени следователя"
//                             variant="outlined"
//                             value={searchQuery}
//                             onChange={handleSearchChange}
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
//                         <TextField
//                             label="Дата создания от"
//                             type="date"
//                             variant="outlined"
//                             value={dateAddedFrom}
//                             onChange={handleDateAddedFromChange}
//                             size="small"
//                             InputLabelProps={{
//                                 shrink: true,
//                             }}
//                         />
//                         <TextField
//                             label="Дата создания до"
//                             type="date"
//                             variant="outlined"
//                             value={dateAddedTo}
//                             onChange={handleDateAddedToChange}
//                             size="small"
//                             InputLabelProps={{
//                                 shrink: true,
//                             }}
//                         />
//                         {/* Department filter for REGION_HEAD */}
//                         {user?.role === 'REGION_HEAD' && (
//                             <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
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
//
//                         {/* Export button with menu */}
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
//                                 <MenuItem onClick={() => handleCaseExport('pdf')}>
//                                     <ListItemIcon>
//                                         <PictureAsPdfIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт PDF</ListItemText>
//                                 </MenuItem>
//                                 <MenuItem onClick={() => handleCaseExport('excel')}>
//                                     <ListItemIcon>
//                                         <DescriptionIcon fontSize="small" />
//                                     </ListItemIcon>
//                                     <ListItemText>Экспорт Excel</ListItemText>
//                                 </MenuItem>
//                             </Menu>
//                         </Box>
//
//                         {/* Barcode scan button */}
//                         <Button
//                             variant="outlined"
//                             color="primary"
//                             onClick={handleOpenBarcodeDialog}
//                             sx={{ height: '40px' }}
//                         >
//                             Сканировать штрихкод
//                         </Button>
//
//                         {/* New case button (if allowed) */}
//                         {user.role !== 'REGION_HEAD' && (
//                             <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={handleOpenCaseDialog}
//                                 sx={{ height: '40px' }}
//                             >
//                                 Новое дело
//                             </Button>
//                         )}
//                     </Box>
//                 </Box>
//
//                 {/* Cases table */}
//                 <AffairsTable
//                     cases={cases}
//                     isLoading={isLoading}
//                     setSnackbar={setSnackbar}
//                     user={user}
//                 />
//
//                 {/* Pagination */}
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
//             {loadLoading &&
//                 <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', height: '100vh', width: '100vw', background: 'rgba(0,0,0, 0.25)', zIndex: '99999' }}>
//                     <Loading />
//                 </div>
//             }
//             {/* Dialogs */}
//             {user.role !== 'REGION_HEAD' && (
//                 <DialogNewAffairs
//                     openCaseDialog={openCaseDialog}
//                     setOpenCaseDialog={setOpenCaseDialog}
//                     setSnackbar={setSnackbar}
//                     // Pass any additional props as needed
//                 />
//             )}
//
//             {/* Barcode scan dialog */}
//             <DialogScanBarcode
//                 openBarcodeDialog={openBarcodeDialog}
//                 setOpenBarcodeDialog={setOpenBarcodeDialog}
//                 barcodeInputRef={barcodeInputRef}
//                 scannedBarcode={scannedBarcode}
//                 handleBarcodeInputChange={handleBarcodeInputChange}
//                 handleBarcodeSubmit={handleBarcodeSubmit}
//             />
//
//             {/* Hidden component for printing */}
//             <div style={{ display: 'none' }}>
//                 <CaseReport
//                     caseReportRef={caseReportRef}
//                     searchQuery={searchQuery}
//                     dateAddedFrom={dateAddedFrom}
//                     dateAddedTo={dateAddedTo}
//                     casesExportData={casesExportData}
//                 />
//             </div>
//         </>
//     );
// };
//
// export default CasesTab;
