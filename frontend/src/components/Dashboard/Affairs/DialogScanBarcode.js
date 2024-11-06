import {
    Button,
} from '@mui/material';

import { StyledButton } from '../../ui/StyledComponents';
import StyledDialog from '../../ui/StyledDialog';
import { StyledTextField } from '../../ui/StyledTextfield';


export default function DialogScanBarcode({ openBarcodeDialog, setOpenBarcodeDialog, barcodeInputRef, scannedBarcode, handleBarcodeInputChange,
    handleBarcodeSubmit
 }) {

    const handleCloseBarcodeDialog = () => {
        setOpenBarcodeDialog(false);
    }
    return (
        <>
            <StyledDialog open={openBarcodeDialog} setOpen={setOpenBarcodeDialog} title={"Сканирование штрихкода"} >
                {{
                    content: (
                        <>
                            <StyledTextField
                                autoFocus
                                inputRef={barcodeInputRef}    
                                label="Штрихкод"
                                value={scannedBarcode}
                                onChange={handleBarcodeInputChange}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter') {
                                        handleBarcodeSubmit(event);
                                    }
                                }}
                            />
                            {/* <TextField
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
                            /> */}
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseBarcodeDialog}>Отмена</Button>
                            <StyledButton onClick={handleBarcodeSubmit}>
                                Найти
                            </StyledButton>
                        </>
                    )
                }}
            </StyledDialog>
        </>
    );
}
