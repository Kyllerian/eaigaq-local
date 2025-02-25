// frontend/src/components/Dashboard/Evidence/EvidenceTable.js

import React, { useState, useMemo } from 'react';
import { Button, Paper, Typography, Box, Tooltip, IconButton } from '@mui/material';
import Loading from '../../Loading';
import { OpenInNew as OpenInNewIcon, GetApp as GetAppIcon, Print as PrintIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import DialogSeenBarcode from '../../CaseDetailComponents/DialogSeenBarcode';
import axios from '../../../axiosConfig';
import { useEvidenceStatuses } from '../../../constants/evidenceStatuses';
import { LicenseInfo } from '@mui/x-license';
import { StyledDataGridPro } from '../../ui/Tables';
import { useTranslation } from 'react-i18next';
import { useEvidenceTypes } from '../../../constants/evidenceTypes';

// Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

export default function EvidenceTable({ evidences, isLoading, setSnackbar, tableHeight, rowHeight }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const evidenceStatuses = useEvidenceStatuses();
    const EVIDENCE_TYPES = useEvidenceTypes();
    // Состояние для выбранного вещественного доказательства

    // Диалог для штрихкода
    const [openBarcodeDisplayDialog, setOpenBarcodeDisplayDialog] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');

    const handlePrintEvidenceBarcode = (evidence) => {
        if (evidence.barcode) {
            console.log("печать баркода - ", evidence.barcode)
            setScannedBarcode(evidence.barcode);
            setOpenBarcodeDisplayDialog(true);
        } else {
            setSnackbar({
                open: true,
                message: t('common.barcode.no_barcode_error'),
                severity: 'error',
            });
        }
    };

    const CheckAssociatedDocument = (evidenceId) => {
        axios
            .get('/api/documents/', {
                params: {
                    material_evidence_id: evidenceId,
                },
            })
            .then((response) => {
                if (response.data[0]) {
                    const link = document.createElement('a');
                    link.href = response.data[0].file;
                    link.download = response.data[0].description || 'name';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    setSnackbar({
                        open: true,
                        message: t('common.messages.file_not_found'),
                        severity: 'error',
                    });
                }
            })
            .catch((error) => {
                console.error(t('common.errors.error_load_documents'), error);
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_load_documents'),
                    severity: 'error',
                });
            });
    };
    console.log('evidences',evidences)
    // Преобразование данных для DataGridPro
    const rows = useMemo(
        () =>
            evidences.map((evidence) => ({
                id: evidence.id,
                name: evidence.name || t('common.table_data.no_name'),
                description: evidence.description || t('common.table_data.description_not_specified'),
                type_display: EVIDENCE_TYPES.find(
                    (type) => type.value === evidence.type
                )?.label || evidence.type_display || t('common.messages.not_specified'),
                status_display: evidence.status || t('common.messages.not_specified'),
                status_label: evidenceStatuses.find((status) => status.value === evidence.status)?.label || evidence.status,
                case_id: evidence.case_id,
                case_name: evidence.case_name || t('cases.case_default'),
                department_name: evidence.department_name || t('common.messages.not_specified'),
                barcode: evidence.barcode,
            })),
        [evidences, t]
    );

    // Определение колонок для DataGridPro
    const columns = useMemo(
        () => [
            {
                field: 'name',
                headerName: t('dashboard.tabs.search_evidence.evidence_table.column_evidence'),
                flex: 1,
                minWidth: 200,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.description}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'type_status',
                headerName: t('common.table_headers.type_status'),
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.type_display}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.status_label}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'case',
                headerName: t('cases.case_default'),
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => {
                    const { case_id, case_name } = params.row;
                    if (case_id) {
                        return (
                            <Button
                                variant="text"
                                color="primary"
                                onClick={() => navigate(`/cases/${case_id}/`)}
                                startIcon={<OpenInNewIcon />}
                                sx={{
                                    textTransform: 'none',
                                    padding: 0,
                                    display: 'flex', // Используем flexbox
                                    alignItems: 'center', // Для выравнивания иконки и текста по центру
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '80%', // Устанавливаем ширину кнопки на 100% (чтобы текст не выходил за границу)
                                }}
                            >
                                <span style={{
                                    display: 'inline-block', // Это гарантирует, что текст будет в одной строке
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap', // Для запрета переноса текста
                                    width: '80%', // Делаем текст в одну строку
                                }}>
                                    {case_name}
                                </span>
                            </Button>
                        );
                    } else {
                        return (
                            <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {t('common.table_data.not_assigned')}
                            </Typography>
                        );
                    }
                },
            },
            {
                field: 'department_name',
                headerName: t('common.standard.label_department'),
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => (
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', height: 'fit-content' }}
                    >
                        {params.row.department_name}
                    </Typography>
                ),
            },
            {
                field: 'actions',
                headerName: t('common.table_headers.actions'),
                flex: 0.5,
                minWidth: 100,
                sortable: false,
                renderCell: (params) => (
                    (params.row.status_display === 'DESTROYED' || params.row.status_display === 'TAKEN') ? (
                        <Tooltip title={t('common.buttons.download_doc')}>
                            <IconButton
                                color="primary"
                                onClick={() => CheckAssociatedDocument(params.row.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <GetAppIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title={t('common.buttons.button_print_barcode')}>
                            <IconButton
                                color="primary"
                                onClick={() => handlePrintEvidenceBarcode(params.row)}
                            >
                                <PrintIcon />
                            </IconButton>
                        </Tooltip>
                    )
                ),
            },
        ],
        [CheckAssociatedDocument, handlePrintEvidenceBarcode, navigate, t]
    );

    return (
        <>
            <Paper sx={{ width: '100%', mt: 2, p: 2, boxShadow: 3, boxSizing: 'border-box', }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: tableHeight }}>
                        <Loading />
                    </Box>
                ) : (
                    <StyledDataGridPro rows={rows}
                        columns={columns.map((col) => ({
                            ...col,
                            flex: col.flex || 1,
                            minWidth: col.minWidth || 150,
                        }))}
                    />
                )}
            </Paper>

            {/* Диалог для отображения штрихкода */}
            <DialogSeenBarcode
                open={openBarcodeDisplayDialog}
                setOpenBarcodeDialog={() => setOpenBarcodeDisplayDialog(false)}
                barcodeValueToDisplay={scannedBarcode}
                setSnackbar={setSnackbar}
            />
        </>
    );
}