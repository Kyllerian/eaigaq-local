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
} from '@mui/material';
import {
    Search as SearchIcon,
    Print as PrintIcon,
    GetApp as GetAppIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledButton } from '../ui/StyledComponents';
import axios from '../../axiosConfig';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import { useReactToPrint } from 'react-to-print';
import EvidenceReport from './Evidence/EvidenceReport';
import EvidenceTable from './Evidence/EvidenceTable';

// Импорт библиотек для Excel
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../constants/formatDate'; // Убедитесь, что функция импортирована

const EvidenceSearchTab = ({ setSnackbar }) => {
    const theme = useTheme();
    const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
    const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('');
    const [dateAddedFrom, setDateAddedFrom] = useState('');
    const [dateAddedTo, setDateAddedTo] = useState('');
    const [evidences, setEvidences] = useState([]);
    const [evidenceExportData, setEvidenceExportData] = useState([]);
    const [evidenceShouldPrint, setEvidenceShouldPrint] = useState(false);
    const evidenceReportRef = useRef();

    // Handlers для поиска и фильтрации (остаются без изменений)
    const handleEvidenceSearchChange = (event) => {
        setEvidenceSearchQuery(event.target.value);
    };

    const handleEvidenceTypeFilterChange = (event) => {
        setEvidenceTypeFilter(event.target.value);
    };

    const handleDateAddedFromChange = (event) => {
        setDateAddedFrom(event.target.value);
    };

    const handleDateAddedToChange = (event) => {
        setDateAddedTo(event.target.value);
    };

    const fetchEvidences = useCallback(() => {
        const params = {};

        if (evidenceSearchQuery) {
            params.search = evidenceSearchQuery;
        }

        if (evidenceTypeFilter) {
            params.type = evidenceTypeFilter;
        }

        if (dateAddedFrom) {
            params['created__gte'] = dateAddedFrom;
        }

        if (dateAddedTo) {
            params['created__lte'] = dateAddedTo;
        }

        axios
            .get('/api/material-evidences/', { params })
            .then((response) => {
                setEvidences(response.data);
            })
            .catch((error) => {
                console.error('Ошибка при поиске вещдоков:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при поиске вещдоков.',
                    severity: 'error',
                });
            });
    }, [evidenceSearchQuery, evidenceTypeFilter, dateAddedFrom, dateAddedTo, setSnackbar]);

    useEffect(() => {
        fetchEvidences();
    }, [fetchEvidences]);

    // Экспорт в PDF (остается без изменений)
    const handleEvidenceExport = (type) => {
        const params = {};

        if (evidenceSearchQuery) {
            params.search = evidenceSearchQuery;
        }

        if (evidenceTypeFilter) {
            params.type = evidenceTypeFilter;
        }

        if (dateAddedFrom) {
            params['created__gte'] = dateAddedFrom;
        }

        if (dateAddedTo) {
            params['created__lte'] = dateAddedTo;
        }

        axios
            .get('/api/material-evidences/', { params })
            .then((response) => {
                setEvidenceExportData(response.data);
                if(type === 'pdf'){
                    setEvidenceShouldPrint(true);
                }else{
                    handleExportExcel(response.data);
                }
            })
            .catch((error) => {
                console.error('Ошибка при экспорте вещественных доказательств:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при экспорте вещественных доказательств.',
                    severity: 'error',
                });
            });
    };

    const handlePrintEvidenceReport = useReactToPrint({
        contentRef: evidenceReportRef,
        documentTitle: 'Отчет по вещественным доказательствам',
    });
    
    
    useEffect(() => {
        if (evidenceShouldPrint && evidenceExportData.length > 0) {
            handlePrintEvidenceReport();
            setEvidenceShouldPrint(false);
        }
    }, [evidenceExportData, evidenceShouldPrint, handlePrintEvidenceReport]);

    // Новый обработчик для экспорта в Excel с использованием ExcelJS
    const handleExportExcel = async (data) => {
        if (data.length === 0) {
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
                { header: 'Тип ВД', key: 'type', width: 20 },
                { header: 'Дело', key: 'case', width: 20 },
                { header: 'Дата создания', key: 'created', width: 20 },
            ];

            // Добавляем данные
            data.forEach((evidence) => {
                worksheet.addRow({
                    name: evidence.name,
                    description: evidence.description,
                    type: EVIDENCE_TYPES.find((type) => type.value === evidence.type)?.label || evidence.type,
                    case: evidence.case ? evidence.case.name : 'Не назначено',
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
    };

    return (
        <>
            {/* Search and Filter Fields */}
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
                        label="Поиск по названию или описанию"
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
                    {/* Export Buttons */}
                    <Box sx={{ display: 'flex', gap: theme.spacing(1), ml: 'auto' }}>
                        <StyledButton
                            onClick={() => handleEvidenceExport('pdf')}
                            startIcon={<PrintIcon />}
                            sx={{ height: '40px' }}
                        >
                            <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>Экспорт PDF</span>
                        </StyledButton>
                        <StyledButton
                            onClick={() => handleEvidenceExport('excel')}
                            startIcon={<GetAppIcon />}
                            sx={{ height: '40px' }}
                        >
                            <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>Экспорт Excel</span>
                        </StyledButton>
                    </Box>
                </Box>

                {/* Evidence Table */}
                <EvidenceTable evidences={evidences} setSnackbar={setSnackbar} />
            </Box>

            {/* Hidden Print Component */}
            <EvidenceReport
                evidenceReportRef={evidenceReportRef}
                evidenceSearchQuery={evidenceSearchQuery}
                evidenceTypeFilter={evidenceTypeFilter}
                dateAddedFrom={dateAddedFrom}
                dateAddedTo={dateAddedTo}
                evidenceExportData={evidenceExportData}
            />
        </>
    );
};

export default EvidenceSearchTab;


// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//     Box,
//     TextField,
//     InputAdornment,
//     FormControl,
//     Select,
//     MenuItem,
//     InputLabel,
// } from '@mui/material';
// import {
//     Search as SearchIcon,
//     Print as PrintIcon,
// } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import { StyledButton } from '../ui/StyledComponents';
// import axios from '../../axiosConfig';
// import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
// import { useReactToPrint } from 'react-to-print';
// import EvidenceReport from './Evidence/EvidenceReport';
// import EvidenceTable from './Evidence/EvidenceTable';

// const EvidenceSearchTab = ({ setSnackbar }) => {
//     const theme = useTheme();
//     const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
//     const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('');
//     const [dateAddedFrom, setDateAddedFrom] = useState('');
//     const [dateAddedTo, setDateAddedTo] = useState('');
//     const [evidences, setEvidences] = useState([]);
//     const [evidenceExportData, setEvidenceExportData] = useState([]);
//     const [evidenceShouldPrint, setEvidenceShouldPrint] = useState(false);
//     const evidenceReportRef = useRef();

//     // Handlers
//     const handleEvidenceSearchChange = (event) => {
//         setEvidenceSearchQuery(event.target.value);
//     };

//     const handleEvidenceTypeFilterChange = (event) => {
//         setEvidenceTypeFilter(event.target.value);
//     };

//     const handleDateAddedFromChange = (event) => {
//         setDateAddedFrom(event.target.value);
//     };

//     const handleDateAddedToChange = (event) => {
//         setDateAddedTo(event.target.value);
//     };

//     const fetchEvidences = useCallback(() => {
//         const params = {};

//         if (evidenceSearchQuery) {
//             params.search = evidenceSearchQuery;
//         }

//         if (evidenceTypeFilter) {
//             params.type = evidenceTypeFilter;
//         }

//         if (dateAddedFrom) {
//             params['created__gte'] = dateAddedFrom;
//         }

//         if (dateAddedTo) {
//             params['created__lte'] = dateAddedTo;
//         }

//         axios
//             .get('/api/material-evidences/', { params })
//             .then((response) => {
//                 setEvidences(response.data);
//             })
//             .catch((error) => {
//                 console.error('Ошибка при поиске вещдоков:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при поиске вещдоков.',
//                     severity: 'error',
//                 });
//             });
//     }, [evidenceSearchQuery, evidenceTypeFilter, dateAddedFrom, dateAddedTo, setSnackbar]);

//     useEffect(() => {
//         fetchEvidences();
//     }, [fetchEvidences]);

//     // Export Handlers
//     const handleEvidenceExport = () => {
//         const params = {};

//         if (evidenceSearchQuery) {
//             params.search = evidenceSearchQuery;
//         }

//         if (evidenceTypeFilter) {
//             params.type = evidenceTypeFilter;
//         }

//         if (dateAddedFrom) {
//             params['created__gte'] = dateAddedFrom;
//         }

//         if (dateAddedTo) {
//             params['created__lte'] = dateAddedTo;
//         }

//         axios
//             .get('/api/material-evidences/', { params })
//             .then((response) => {
//                 setEvidenceExportData(response.data);
//                 setEvidenceShouldPrint(true);
//             })
//             .catch((error) => {
//                 console.error('Ошибка при экспорте вещественных доказательств:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при экспорте вещественных доказательств.',
//                     severity: 'error',
//                 });
//             });
//     };

//     const handlePrintEvidenceReport = useReactToPrint({
//         contentRef: evidenceReportRef,
//         documentTitle: 'Отчет по вещественным доказательствам',
//     });

//     useEffect(() => {
//         if (evidenceShouldPrint && evidenceExportData.length > 0) {
//             handlePrintEvidenceReport();
//             setEvidenceShouldPrint(false);
//         }
//     }, [evidenceExportData, evidenceShouldPrint, handlePrintEvidenceReport]);

//     return (
//         <>
//             {/* Search and Filter Fields */}
//             <Box sx={{ mb: theme.spacing(3) }}>
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         flexWrap: 'wrap',
//                         alignItems: 'center',
//                         gap: theme.spacing(2),
//                         mb: theme.spacing(2),
//                     }}
//                 >
//                     <TextField
//                         label="Поиск по названию или описанию"
//                         variant="outlined"
//                         value={evidenceSearchQuery}
//                         onChange={handleEvidenceSearchChange}
//                         size="small"
//                         sx={{ flexGrow: 1 }}
//                         InputProps={{
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <SearchIcon color="action" />
//                                 </InputAdornment>
//                             ),
//                         }}
//                     />
//                     <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
//                         <InputLabel id="evidence-type-filter-label">Тип ВД</InputLabel>
//                         <Select
//                             labelId="evidence-type-filter-label"
//                             value={evidenceTypeFilter}
//                             onChange={handleEvidenceTypeFilterChange}
//                             label="Тип ВД"
//                         >
//                             <MenuItem value="">
//                                 <em>Все типы</em>
//                             </MenuItem>
//                             {EVIDENCE_TYPES.map((type) => (
//                                 <MenuItem key={type.value} value={type.value}>
//                                     {type.label}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                     <TextField
//                         label="Дата добавления от"
//                         type="date"
//                         variant="outlined"
//                         value={dateAddedFrom}
//                         onChange={handleDateAddedFromChange}
//                         size="small"
//                         InputLabelProps={{
//                             shrink: true,
//                         }}
//                     />
//                     <TextField
//                         label="Дата добавления до"
//                         type="date"
//                         variant="outlined"
//                         value={dateAddedTo}
//                         onChange={handleDateAddedToChange}
//                         size="small"
//                         InputLabelProps={{
//                             shrink: true,
//                         }}
//                     />
//                     {/* Export Button */}
//                     <StyledButton
//                         onClick={handleEvidenceExport}
//                         startIcon={<PrintIcon />}
//                         sx={{ ml: 'auto', height: '40px' }}
//                     >
//                         <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Экспорт отчета</span>
//                     </StyledButton>
//                 </Box>

//                 {/* Evidence Table */}
//                 <EvidenceTable evidences={evidences} setSnackbar={setSnackbar} />
//             </Box>

//             {/* Hidden Print Component */}
//             <EvidenceReport
//                 evidenceReportRef={evidenceReportRef}
//                 evidenceSearchQuery={evidenceSearchQuery}
//                 evidenceTypeFilter={evidenceTypeFilter}
//                 dateAddedFrom={dateAddedFrom}
//                 dateAddedTo={dateAddedTo}
//                 evidenceExportData={evidenceExportData}
//             />
//         </>
//     );
// };

// export default EvidenceSearchTab;