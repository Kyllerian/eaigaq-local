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
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledButton } from '../ui/StyledComponents';
import axios from '../../axiosConfig';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import { useReactToPrint } from 'react-to-print';
import EvidenceReport from './Evidence/EvidenceReport';
import EvidenceTable from './Evidence/EvidenceTable';

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

    // Handlers
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

    // Export Handlers
    const handleEvidenceExport = () => {
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
                setEvidenceShouldPrint(true);
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
                    {/* Export Button */}
                    <StyledButton
                        onClick={handleEvidenceExport}
                        startIcon={<PrintIcon />}
                        sx={{ ml: 'auto' }}
                    >
                        <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Экспорт отчета</span>
                    </StyledButton>
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