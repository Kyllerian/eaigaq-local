// src\components\Dashboard\Affairs\DialogScanBarcode.js
import {
    Button,
} from '@mui/material';

import { StyledButton } from '../../ui/StyledComponents';
import StyledDialog from '../../ui/StyledDialog';
import { StyledTextField } from '../../ui/StyledTextfield';
import { useTranslation } from 'react-i18next';


export default function DialogScanBarcode({ openBarcodeDialog, setOpenBarcodeDialog, barcodeInputRef, scannedBarcode, handleBarcodeInputChange,
    handleBarcodeSubmit
}) {
    const { t } = useTranslation();
    const handleCloseBarcodeDialog = () => {
        setOpenBarcodeDialog(false);
    }
    return (
        <StyledDialog open={openBarcodeDialog} setOpen={setOpenBarcodeDialog} title={t('common.barcode.dialog_title')} >
            {{
                content: (
                    <StyledTextField
                        autoFocus
                        inputRef={barcodeInputRef}
                        label={t('common.barcode.label_barcode')}
                        value={scannedBarcode}
                        onChange={handleBarcodeInputChange}
                        onKeyPress={(event) => {
                            if (event.key === 'Enter') {
                                handleBarcodeSubmit(event);
                            }
                        }}
                    />
                ),
                actions: (
                    <>
                        <Button onClick={handleCloseBarcodeDialog}>{t('common.buttons.cancel')}</Button>
                        <StyledButton onClick={handleBarcodeSubmit}>
                            {t('common.buttons.find')}
                        </StyledButton>
                    </>
                )
            }}
        </StyledDialog>
    );
}
