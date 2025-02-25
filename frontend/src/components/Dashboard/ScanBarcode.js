// src\components\Dashboard\ScanBarcode.js

import React from 'react';
import {
    Button,
} from '@mui/material';

import axios from '../axiosConfig';

import { StyledButton } from '../ui/StyledComponents';
import DashboardDialog from '../ui/DashboardDialog';
import { useNavigate } from 'react-router-dom';
import { StyledTextField } from '../ui/StyledTextfield';
import { useTranslation } from 'react-i18next';

export default function DialogSeenBarcode({ open, setOpenBarcodeDialog, barcodeInputRef, scannedBarcode, setSnackbar, setScannedBarcode }) {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleBarcodeInputChange = (event) => {
        setScannedBarcode(event.target.value);
    };

    const handleBarcodeSubmit = async (event) => {
        event.preventDefault();
        if (!scannedBarcode) {
            setSnackbar({
                open: true,
                message: t('common.barcode.error_no_barcode'),
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
                t('common.barcode.error_find_case'),
                error.response?.data || error
            );
            setSnackbar({
                open: true,
                message:
                    error.response?.data?.detail ||
                    t('common.barcode.error_find_case'),
                severity: 'error',
            });
        } finally {
            setOpenBarcodeDialog(false);
        }
    };
    return (
        <>
            {/* Диалоговое окно для сканирования штрихкода */}
            <DashboardDialog title={t('common.barcode.dialog_title')} open={open} setOpen={setOpenBarcodeDialog}>
                {{
                    content: (
                        <StyledTextField
                            autoFocus
                            inputRef={barcodeInputRef}
                            label={t('common.barcode.label_barcode')}
                            value={scannedBarcode}
                            onChange={handleBarcodeInputChange}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    handleBarcodeSubmit(event);
                                }
                            }}
                        />
                    ),
                    actions: (
                        <>
                            <Button onClick={() => setOpenBarcodeDialog(false)}>{t('common.buttons.cancel')}</Button>
                            <StyledButton onClick={handleBarcodeSubmit}>
                                {t('common.buttons.find_button')}
                            </StyledButton>
                        </>
                    )
                }}
            </DashboardDialog>
        </>
    );
}
