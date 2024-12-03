// // frontend/src/components/CaseDetailComponents/DialogSeenBarcode.jsx
//
// import React, { useRef } from 'react';
// import {
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import Barcode from 'react-barcode';
// import { useReactToPrint } from 'react-to-print';
//
// export default function DialogSeenBarcode({
//                                             open,
//                                             setOpenBarcodeDialog,
//                                             barcodeValueToDisplay,
//                                             groupName,
//                                             setSnackbar,
//                                           }) {
//   const theme = useTheme();
//   const barcodeRef = useRef();
//
//   // Extract group number from groupName (e.g., from "Группа3" extract "3")
//   const groupNumber = groupName ? groupName.replace(/^\D+/g, '') : '';
//
//   const handlePrintBarcode = useReactToPrint({
//     contentRef: barcodeRef,
//     documentTitle: 'Штрихкод Вещдока',
//     pageStyle: `
//       @page {
//         size: 58mm 40mm;
//         margin: 0;
//       }
//       @media print {
//         body {
//           margin: 0;
//         }
//         #barcode-container {
//           width: 58mm;
//           height: 40mm;
//           padding: 6.36mm;
//           box-sizing: border-box;
//           display: flex;
//           justify-content: center;
//           align-items: center;
//         }
//         #barcode svg {
//           width: auto;
//           height: 70%;
//         }
//       }
//     `,
//     onAfterPrint: () => {
//       setOpenBarcodeDialog(false);
//       setSnackbar({
//         open: true,
//         message: 'Печать завершена.',
//         severity: 'success',
//       });
//     },
//   });
//
//   return (
//       <>
//         <Dialog
//             open={open}
//             onClose={() => setOpenBarcodeDialog(false)}
//             maxWidth="xs"
//             fullWidth
//         >
//           <DialogTitle>Штрихкод</DialogTitle>
//           <DialogContent
//               sx={{
//                 textAlign: 'center',
//                 padding: theme.spacing(2),
//               }}
//           >
//             {barcodeValueToDisplay && (
//                 <div id="barcode-container" ref={barcodeRef}>
//                   <div
//                       id="barcode-wrapper"
//                       style={{
//                         position: 'relative',
//                         display: 'inline-block',
//                       }}
//                   >
//                     <Barcode
//                         value={barcodeValueToDisplay}
//                         format="EAN13"
//                         displayValue={false}
//                         margin={0}
//                     />
//                     {/* Hidden in dialog, shown when printing */}
//                     <div
//                         id="left-text"
//                         style={{
//                           position: 'absolute',
//                           display: 'none',
//                         }}
//                     >
//                       Группа
//                     </div>
//                     <div
//                         id="right-text"
//                         style={{
//                           position: 'absolute',
//                           display: 'none',
//                         }}
//                     >
//                       {groupNumber}
//                     </div>
//                   </div>
//                 </div>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setOpenBarcodeDialog(false)}>Закрыть</Button>
//             <Button variant="contained" onClick={handlePrintBarcode}>
//               Печать
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </>
//   );
// }


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

export default function DialogSeenBarcode({
  open,
  setOpenBarcodeDialog,
  barcodeValueToDisplay,
  // barcodeRef,
  // handlePrintBarcode,
  groupName,
}) {
  const theme = useTheme();

  // Extract group number from groupName (e.g., from "Группа3" extract "3")
  const groupNumber = groupName ? groupName.replace(/^\D+/g, '') : '';
  const barcodeRef = useRef();



  console.log(barcodeValueToDisplay, 'barcodeValueToDisplay', groupName);

  // ТУТ НИЧЕГО НЕ МЕНЯТЬ!
  const handlePrintBarcode = useReactToPrint({
    contentRef: barcodeRef,
    documentTitle: 'Штрихкод',
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
                      Группа
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
          <Button onClick={() => setOpenBarcodeDialog(false)}>Закрыть</Button>
          <StyledButton onClick={handlePrintBarcode}>Печать</StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
}