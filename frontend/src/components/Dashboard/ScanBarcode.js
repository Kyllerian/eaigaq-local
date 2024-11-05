import {
    Button,
    TextField,
} from '@mui/material';

import axios from '../axiosConfig';

import { StyledButton } from '../ui/StyledComponents';
import DashboardDialog from '../ui/DashboardDialog';
import { useNavigate } from 'react-router-dom';

export default function DialogSeenBarcode({ open, setOpenBarcodeDialog, barcodeInputRef, scannedBarcode, setSnackbar, setScannedBarcode }) {
    const navigate = useNavigate();

    const handleBarcodeInputChange = (event) => {
        setScannedBarcode(event.target.value);
    };

    const handleBarcodeSubmit = async (event) => {
        event.preventDefault();
        if (!scannedBarcode) {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, отсканируйте штрихкод.',
                severity: 'error',
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
            setOpenBarcodeDialog(false);
        }
    };
    return (
        <>
            {/* Диалоговое окно для сканирования штрихкода */}
            <DashboardDialog title={"Сканирование штрихкода"} open={open} setOpen={setOpenBarcodeDialog}>
                {{
                    content: (
                        <>
                            <TextField
                                autoFocus
                                inputRef={barcodeInputRef}
                                margin="dense"
                                label="Штрихкод"
                                value={scannedBarcode}
                                onChange={handleBarcodeInputChange}
                                fullWidth
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleBarcodeSubmit(event);
                                    }
                                }}
                            />
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={() => setOpenBarcodeDialog(false)}>Отмена</Button>
                            <StyledButton onClick={handleBarcodeSubmit}>
                                Найти
                            </StyledButton>
                        </>
                    )
                }}
            </DashboardDialog>
        </>
    );
}