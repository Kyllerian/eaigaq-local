import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

import { styled, useTheme } from '@mui/material/styles';

import Barcode from 'react-barcode';

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: '5px',
    textTransform: 'none',
    backgroundColor: '#1976d2',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#0d47a1',
    },
    '&.Mui-disabled': {
        backgroundColor: '#cfd8dc',
        color: '#ffffff',
        opacity: 0.7,
    },
}));

export default function DialogSeenBarcode({ openBarcodeDialog, setOpenBarcodeDialog, barcodeValueToDisplay, barcodeRef, handlePrintBarcode }) {
    const theme = useTheme();

    return (
        <>
            <Dialog
        open={openBarcodeDialog}
        onClose={() => setOpenBarcodeDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Штрихкод</DialogTitle>
        <DialogContent
          sx={{
            textAlign: 'center',
            padding: theme.spacing(2),
          }}
        >
          {barcodeValueToDisplay && (
            <div id="barcode-container" ref={barcodeRef}>
              <div id="barcode">
                <Barcode
                  value={barcodeValueToDisplay}
                  format="EAN13"
                  displayValue={false}
                  margin={0}
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBarcodeDialog(false)}>Закрыть</Button>
          <StyledButton onClick={handlePrintBarcode}>Печать</StyledButton>
        </DialogActions>
      </Dialog>
        </>
    );
}