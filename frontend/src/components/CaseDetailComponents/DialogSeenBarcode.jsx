// frontend/src/components/CaseDetailComponents/DialogSeenBarcode.jsx

import React, { useRef } from 'react';
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
import { useReactToPrint } from 'react-to-print';
import { useTranslation } from 'react-i18next';

export default function DialogSeenBarcode({
  open,
  setOpenBarcodeDialog,
  barcodeValueToDisplay,
  groupName,
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Extract group number from groupName (e.g., from "Группа3" extract "3")
  const groupNumber = groupName ? groupName.replace(/^\D+/g, '') : '';
  const barcodeRef = useRef();



  console.log(barcodeValueToDisplay, 'barcodeValueToDisplay', groupName);

  // ТУТ НИЧЕГО НЕ МЕНЯТЬ!
  const handlePrintBarcode = useReactToPrint({
    contentRef: barcodeRef,
    documentTitle: t('common.barcode.label_barcode'),
    pageStyle: `
        @page {
          size: 58mm 40mm !important;
          margin: 0 !important;
        }
        @media print {
          body {
            margin: 0 !important;
          }
          #barcode-container {
            width: 58mm !important;
            height: 40mm !important;
            padding: 6.36mm !important;
            box-sizing: border-box !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          #barcode-wrapper {
            position: relative !important;
            display: inline-block !important;
          }
          #barcode-wrapper svg {
            display: block !important;
          }
          #left-text, #right-text {
            display: block !important;
            position: absolute !important;
            bottom: -12px !important;
            font-size: 14px !important;
            text-align: center !important;
            transform: translateX(-50%) !important;
          }
          #left-text {
            left: 25% !important;
          }
          #right-text {
            left: 75% !important;
          }
        }
      `,
  });
  return (
    <Dialog
      open={open}
      onClose={() => setOpenBarcodeDialog(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{t('common.barcode.label_barcode')}</DialogTitle>
      <DialogContent
        sx={{
          textAlign: 'center',
          padding: theme.spacing(2),
        }}
      >
        {barcodeValueToDisplay && (
          <div id="barcode-container" ref={barcodeRef}>
            <div
              id="barcode-wrapper"
              style={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              <Barcode
                value={barcodeValueToDisplay}
                format="EAN13"
                displayValue={false}
                margin={0}
              />
              {/* Hidden in dialog, shown when printing */}
              {groupName && (
                <>
                  <div
                    id="left-text"
                    style={{
                      position: 'absolute',
                      display: 'none',
                    }}
                  >
                    {t('common.table_headers.group')}
                  </div>
                  <div
                    id="right-text"
                    style={{
                      position: 'absolute',
                      display: 'none',
                    }}
                  >
                    {groupNumber}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenBarcodeDialog(false)}>{t('common.buttons.close')}</Button>
        <StyledButton onClick={handlePrintBarcode}>{t('common.buttons.print')}</StyledButton>
      </DialogActions>
    </Dialog>
  );
}