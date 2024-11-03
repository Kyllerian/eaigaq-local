import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';

import Barcode from 'react-barcode';
import { StyledButton } from '../ui/StyledComponents';

export default function DialogSeenBarcode({ open, setOpenBarcodeDialog, barcodeValueToDisplay, barcodeRef, handlePrintBarcode }) {
  const theme = useTheme();

  return (
    <>
      <Dialog
        open={open}
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