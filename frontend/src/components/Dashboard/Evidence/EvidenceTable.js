import React, { useState, useEffect, useRef } from 'react';
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
    Box,
} from '@mui/material';
import Loading from '../../Loading';

import {
    OpenInNew as OpenInNewIcon,
    Print as PrintIcon,
} from '@mui/icons-material';
import { EVIDENCE_TYPES } from '../../../constants/evidenceTypes';
import { StyledTableCell } from '../../ui/StyledComponents';
import { useNavigate } from 'react-router-dom';
import DialogSeenBarcode from '../../CaseDetailComponents/DialogSeenBarcode';
import { useReactToPrint } from 'react-to-print';
import { PaginationStyled } from '../../ui/PaginationUI';
import calculateRowsPerPage from '../../../constants/calculateRowsPerPage';

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

    // Пагинация
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Начальное значение
    const [totalPages, setTotalPages] = useState(1);

    // Refs для измерения высоты
    const tableContainerRef = useRef(null);
    const tableRowRef = useRef(null);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        calculateRowsPerPage(tableContainerRef, tableRowRef, evidences, setRowsPerPage, setTotalPages, page, setPage);
        window.addEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, evidences, setRowsPerPage, setTotalPages, page, setPage));
        return () => {
            window.removeEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, evidences, setRowsPerPage, setTotalPages, page, setPage));
        };
    }, [evidences, isLoading]);

    // Пагинированные данные
    const paginatedEvidences = evidences.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <>
            {/* Таблица вещдоков */}
            <Paper elevation={1}>
                <TableContainer ref={tableContainerRef}>
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
                            {isLoading ?
                                (
                                    <Loading />
                                )
                                :
                                (
                                    <>
                                        {paginatedEvidences.length > 0 ? (
                                            paginatedEvidences.map((evidence, index) => (
                                                <TableRow key={evidence.id} hover ref={index === 0 ? tableRowRef : null}>
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
                                                    <TableCell
                                                        sx={{
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
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
                                    </>
                                )
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Пагинация */}
                {totalPages > 1 && (
                    <PaginationStyled totalPages={totalPages} page={page} handleChangePage={handleChangePage} />
                )}
            </Paper>

            {/* Barcode Dialog */}
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
