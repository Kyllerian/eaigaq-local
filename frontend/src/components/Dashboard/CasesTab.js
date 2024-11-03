// src/components/CasesTab.js

import React, { useState, useRef } from 'react';
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
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    OpenInNew as OpenInNewIcon,
    Circle as CircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledButton, StyledTableCell } from '../ui/StyledComponents';
import axios from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import AffairsToolbar from './Affairs/Toolbar';
import AffairsTable from './Affairs/Table';
import DialogNewAffairs from './Affairs/DialogNewAffairs';
import DialogScanBarcode from './Affairs/DialogScanBarcode';

const CasesTab = ({
    user,
    cases,
    setCases,
    departments,
    fetchCases,
    snackbar,
    setSnackbar,
    setError,
}) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [openCaseDialog, setOpenCaseDialog] = useState(false);
    const [newCase, setNewCase] = useState({
        name: '',
        description: '',
    });

    // Обработка выбора отделения для фильтрации
    const handleDepartmentChange = (event) => {
        const value = event.target.value;
        setSelectedDepartment(value);
    };
    // Добавлен стейт для поиска
    const [searchQuery, setSearchQuery] = useState('');

    // Штрихкод
    const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');
    const barcodeInputRef = useRef();

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
        const { name, value } = event.target;
        setNewCase({ ...newCase, [name]: value });
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

        axios
            .get(`/api/material-evidences/?barcode=${scannedBarcode}`)
            .then((response) => {
                if (response.data.length > 0) {
                    const evidence = response.data[0];
                    if (evidence.case) {
                        navigate(`/cases/${evidence.case.id}/`);
                    } else {
                        setSnackbar({
                            open: true,
                            message: 'Вещдок не связан с делом.',
                            severity: 'info',
                        });
                    }
                } else {
                    setSnackbar({
                        open: true,
                        message: 'Вещдок не найден.',
                        severity: 'error',
                    });
                }
            })
            .catch((error) => {
                console.error('Ошибка при поиске вещдока по штрихкоду:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при поиске вещдока.',
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

    // Фильтрация дел на основе поискового запроса
    const filteredCases = cases.filter((caseItem) => {
        const query = searchQuery.toLowerCase();
        const name = caseItem.name.toLowerCase();
        const description = caseItem.description.toLowerCase();
        const creatorName = caseItem.creator_name?.toLowerCase() || '';
        const { id } = caseItem.department;
        return ((
            name.includes(query) ||
            description.includes(query) ||
            creatorName.includes(query)) && (id === selectedDepartment || selectedDepartment === '')
        );
    });

    return (
        <>
            {/* Поле поиска и кнопка штрихкода */}
            {/* Поля поиска и фильтрации */}
            <AffairsToolbar user={user}
                departments={departments}
                searchQuery={searchQuery}
                handleSearchChange={handleSearchChange}
                handleOpenBarcodeDialog={handleOpenBarcodeDialog}
                handleDepartmentChange={handleDepartmentChange}
                handleOpenCaseDialog={handleOpenCaseDialog}
                selectedDepartment={selectedDepartment}
                selectedCase={selectedCase}
                handleOpenCaseDetails={handleOpenCaseDetails}
            />

            {/* Таблица дел */}
            <AffairsTable user={user} cases={cases} handleCaseSelect={handleCaseSelect} selectedCase={selectedCase} />

            {/* Диалоги */}
            {user.role !== 'REGION_HEAD' && (
                <DialogNewAffairs
                    openCaseDialog={openCaseDialog}
                    setOpenCaseDialog={setOpenCaseDialog}
                    setSnackbar={setSnackbar}
                    setCases={setCases}
                    cases={cases}

                />
            )}

            {/* Диалог сканирования штрихкода */}
            <DialogScanBarcode openBarcodeDialog={openBarcodeDialog}
                setOpenBarcodeDialog={setOpenBarcodeDialog}
                barcodeInputRef={barcodeInputRef}
                scannedBarcode={scannedBarcode}
                handleBarcodeInputChange={handleBarcodeInputChange}
                handleBarcodeSubmit={handleBarcodeSubmit}
            />
        </>
    );
};

export default CasesTab;