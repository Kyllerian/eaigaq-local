import {
    Button,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';

import {
    OpenInNew as OpenInNewIcon,
    Print as PrintIcon,
} from '@mui/icons-material';
import { EVIDENCE_TYPES } from '../../../constants/evidenceTypes';
import { StyledTableCell } from '../../ui/StyledComponents';
import { useNavigate } from 'react-router-dom';
import DialogSeenBarcode from '../../CaseDetailComponents/DialogSeenBarcode';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';


export default function EvidenceTable({ evidences, setSnackbar }) {
    const navigate = useNavigate();

    // Barcode Dialog
    const [openBarcodeDisplayDialog, setOpenBarcodeDisplayDialog] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');
    const barcodeRef = useRef();

    const handlePrintEvidenceBarcode = (evidence) => {
        if (evidence.barcode) {
            setScannedBarcode(evidence.barcode);
            setOpenBarcodeDisplayDialog(true);
        } else {
            setSnackbar({
                open: true,
                message: 'Штрихкод вещдока недоступен.',
                severity: 'error',
            });
        }
    };
    
    const handlePrintBarcode = useReactToPrint({
        contentRef: barcodeRef,
        documentTitle: 'Штрихкод Вещдока',
        pageStyle: `
      @page {
        size: 58mm 40mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
        }
        #barcode-container {
          width: 58mm;
          height: 40mm;
          padding: 6.36mm;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #barcode svg {
          width: auto;
          height: 70%;
        }
      }
    `,
    });

    return (
        <>
            {/* Hidden Print Component */}
            <Paper elevation={1}>
                <TableContainer>
                    <Table
                        aria-label="Таблица вещдоков"
                        sx={{ tableLayout: 'fixed', minWidth: 650 }}
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '15%' }}>
                                    Название ВД
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '35%' }}>
                                    Описание ВД
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>Тип ВД</StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>Дело</StyledTableCell>
                                <StyledTableCell sx={{ width: '20%' }}>
                                    Действия
                                </StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {evidences.length > 0 ? (
                                evidences.map((evidence) => (
                                    <TableRow key={evidence.id} hover>
                                        <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {evidence.name}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {evidence.description}
                                        </TableCell>
                                        <TableCell>
                                            {EVIDENCE_TYPES.find(
                                                (type) => type.value === evidence.type
                                            )?.label || evidence.type}
                                        </TableCell>
                                        <TableCell>
                                            {evidence.case ? (
                                                <Button
                                                    variant="text"
                                                    color="primary"
                                                    onClick={() =>
                                                        navigate(`/cases/${evidence.case.id}/`)
                                                    }
                                                    startIcon={<OpenInNewIcon />}
                                                >
                                                    {evidence.case.name || 'Дело'}
                                                </Button>
                                            ) : (
                                                'Не назначено'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Печать штрихкода">
                                                <IconButton
                                                    color="primary"
                                                    onClick={() =>
                                                        handlePrintEvidenceBarcode(evidence)
                                                    }
                                                >
                                                    <PrintIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Нет результатов.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            
            {/* Barcode Dialog */}
            <DialogSeenBarcode open={openBarcodeDisplayDialog}
                 setOpenBarcodeDialog={() => setOpenBarcodeDisplayDialog(false)}
                 barcodeValueToDisplay={scannedBarcode}
                 barcodeRef={barcodeRef}
                 handlePrintBarcode={handlePrintBarcode}
            />
        </>
    );
}
