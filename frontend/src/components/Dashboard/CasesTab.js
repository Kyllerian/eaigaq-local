// src/components/CasesTab.js

import { useState, useRef, useEffect, useMemo } from 'react';
import axios from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';
import AffairsToolbar from './Affairs/Toolbar';
import AffairsTable from './Affairs/Table';
import DialogNewAffairs from './Affairs/DialogNewAffairs';
import DialogScanBarcode from './Affairs/DialogScanBarcode';

const CasesTab = ({
    user,
    departments,
    setSnackbar,
    setError
}) => {

    const [cases, setCases] = useState([]);
    const navigate = useNavigate();
    const [selectedCase, setSelectedCase] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [openCaseDialog, setOpenCaseDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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


    // Fetch Cases
    const fetchCases = () => {
        axios
            .get('/api/cases/')
            .then((response) => {
                setCases(response.data);
                setIsLoading(false);
            })
            .catch((error) => {
                setError('Ошибка при загрузке дел.');
            });
    };

    useEffect(() => {
        if (!user) return;
        fetchCases();
    }, [user]);


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
            // Перенаправляем на страницу деталей дела
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

    // Обработчик изменения поиска
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    // Фильтрация дел на основе поискового запроса и фильтров
    const filteredCases = useMemo(() => {
        return cases.filter((caseItem) => {
            const query = searchQuery.toLowerCase();
            const name = caseItem.name.toLowerCase();
            const description = caseItem.description.toLowerCase();
            const creatorName = caseItem.creator_name?.toLowerCase() || '';
            const departmentId = caseItem.department.id;
            console.log('adasdasdasd')
            return (
                (
                    name.includes(query) ||
                    description.includes(query) ||
                    creatorName.includes(query)
                ) && (
                    departmentId === selectedDepartment || selectedDepartment === ''
                )
            );
        });
    }, [cases, searchQuery, selectedDepartment]);

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
            <AffairsTable user={user} isLoading={isLoading} handleCaseSelect={handleCaseSelect} selectedCase={selectedCase}
                filteredCases={filteredCases} />

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