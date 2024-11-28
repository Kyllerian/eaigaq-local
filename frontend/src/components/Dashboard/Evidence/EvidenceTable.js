// src/components/Evidence/EvidenceTable.js

import React, { useState, useRef } from 'react';
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import Loading from '../../Loading';
import {
    OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { StyledTableCell } from '../../ui/StyledComponents';
import { useNavigate } from 'react-router-dom';
import DialogSeenBarcode from '../../CaseDetailComponents/DialogSeenBarcode';
import { useReactToPrint } from 'react-to-print';

export default function EvidenceTable({ evidences, isLoading, setSnackbar }) {
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
            {/* Таблица вещественных доказательств */}
            <Paper elevation={1}>
                <TableContainer sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Table
                        aria-label="Таблица вещественных доказательств"
                        stickyHeader
                        sx={{ tableLayout: 'fixed', minWidth: 650 }}
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '20%' }}>
                                    Название ВД
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '25%' }}>
                                    Описание ВД
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '10%' }}>Тип ВД</StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>Дело</StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>Отделение</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Loading />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
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
                                                    {evidence.type_display}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {evidence.case_id ? (
                                                        <Button
                                                            variant="text"
                                                            color="primary"
                                                            onClick={() =>
                                                                navigate(`/cases/${evidence.case_id}/`)
                                                            }
                                                            sx={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                            startIcon={<OpenInNewIcon />}
                                                        >
                                                            {evidence.case_name || 'Дело'}
                                                        </Button>
                                                    ) : (
                                                        'Не назначено'
                                                    )}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {evidence.department_name || 'Не указано'}
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
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Диалог для отображения штрихкода */}
            <DialogSeenBarcode
                open={openBarcodeDisplayDialog}
                setOpenBarcodeDialog={() => setOpenBarcodeDisplayDialog(false)}
                barcodeValueToDisplay={scannedBarcode}
                barcodeRef={barcodeRef}
                handlePrintBarcode={handlePrintBarcode}
            />
        </>
    );
}