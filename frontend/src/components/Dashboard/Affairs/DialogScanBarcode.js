import {
    Button,
    TextField,
} from '@mui/material';

import { StyledButton } from '../../ui/StyledComponents';
import StyledDialog from '../../ui/StyledDialog';


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
