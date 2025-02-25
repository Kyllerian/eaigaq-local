// frontend/src/components/CaseDetailComponents/MatEvidence.jsx

import React, {
    useState,
    lazy,
    Suspense,
    useCallback,
    useContext,
    useEffect,
} from 'react';
import {
    Typography,
    Box,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    Paper,
    useTheme,
    Button,
} from '@mui/material';
import {
    Add as AddIcon,
    ExpandMore as ExpandMoreIcon,
    Print as PrintIcon,
    GetApp as GetAppIcon,
} from '@mui/icons-material';
import { useEvidenceStatuses } from '../../constants/evidenceStatuses';
import axios from '../../axiosConfig';
import { useEvidenceTypes } from '../../constants/evidenceTypes';
import BiometricDialog from '../BiometricDialog';
import { StyledButton } from '../ui/StyledComponents';
import DialogSeenBarcode from './DialogSeenBarcode';
import Loading from '../Loading';
import { AuthContext } from '../../contexts/AuthContext';
import { LicenseInfo } from '@mui/x-license';
import { StyledDataGridPro } from '../ui/Tables';
import { useTranslation } from 'react-i18next';

// Устанавливаем лицензионный ключ для DataGridPro
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

const DialogNewGroup = lazy(() => import('./DialogNewGroup'));
const DialogNewEvidence = lazy(() => import('./DialogNewEvidence'));
const DialogAlertNewStatus = lazy(() => import('./DialogAlertNewStatus'));

export default function CaseDetailMatEvidence({
    id,
    setGroups,
    setIsStatusUpdating,
    isStatusUpdating,
    setSnackbar,
    canEdit,
    canAddGroup,
    groups,
    caseItem,
}) {
    const { t } = useTranslation();
    const EVIDENCE_TYPES = useEvidenceTypes();
    const evidenceStatuses = useEvidenceStatuses();
    const theme = useTheme();

    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [dialogStates, setDialogStates] = useState({
        openGroupDialog: false,
        openEvidenceDialog: false,
        openAlertNewStatus: false,
        openBarcodeDialog: false,
        barcodeValueToDisplay: '',
        currentEvidenceId: '',
        currentNewStatus: '',
        currentGroupName: '',
    });

    // Состояния для биометрической аутентификации
    const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Получаем текущего пользователя из контекста
    const { user } = useContext(AuthContext);
    const isArchiveUser = user?.username?.toLowerCase().includes('archive');

    // Состояния для документов
    const [documents, setDocuments] = useState([]);
    const [isRevalidate, setIsRevalidate] = useState(false);

    // Загрузка документов при монтировании компонента
    useEffect(() => {
        axios
            .get('/api/documents/', {
                params: {
                    case_id: id,
                },
            })
            .then((response) => {
                setDocuments(response.data);
                setIsRevalidate(false);
            })
            .catch((error) => {
                console.error(t('common.errors.error_load_documents'), error);
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_load_documents'),
                    severity: 'error',
                });
            });
    }, [id, setSnackbar, isRevalidate, t]);

    // Функции для биометрической аутентификации
    const handleOpenBiometricDialog = (action) => {
        if (isArchiveUser) {
            if (action === 'openGroupDialog' || action === 'openEvidenceDialog') {
                handleDialogOpen(action);
            } else if (action.action === 'changeStatus') {
                performEvidenceStatusChange(
                    action.evidenceId,
                    action.newStatus,
                    action.documentId
                );
            }
        } else {
            setPendingAction(action);
            setBiometricDialogOpen(true);
            setIsAuthenticating(true);
        }
    };

    const handleBiometricSuccess = () => {
        setBiometricDialogOpen(false);
        setIsAuthenticating(false);
        if (
            pendingAction === 'openGroupDialog' ||
            pendingAction === 'openEvidenceDialog'
        ) {
            handleDialogOpen(pendingAction);
        } else if (pendingAction.action === 'changeStatus') {
            performEvidenceStatusChange(
                pendingAction.evidenceId,
                pendingAction.newStatus,
                pendingAction.documentId
            );
        }
        setPendingAction(null);
    };

    const handleBiometricError = (errorMessage) => {
        setBiometricDialogOpen(false);
        setIsAuthenticating(false);
        setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
        });
        setPendingAction(null);
    };

    const handlePrintEvidenceBarcode = (evidence, groupName) => {
        if (evidence.barcode) {
            handleDialogOpen('openBarcodeDialog', evidence.barcode, '', groupName);
        } else {
            setSnackbar({
                open: true,
                message: t('common.barcode.barcode_unavailable'),
                severity: 'error',
            });
        }
    };

    const handlePrintGroupBarcode = (groupId) => {
        const group = groups.find((g) => g.id === groupId);
        if (group && group.barcode) {
            handleDialogOpen('openBarcodeDialog', group.barcode, '', group.name);
        } else {
            setSnackbar({
                open: true,
                message: t('common.barcode.barcode_group_unavailable'),
                severity: 'error',
            });
        }
    };

    const toggleGroupSelect = (groupId) => {
        setSelectedGroupId(selectedGroupId === groupId ? null : groupId);
    };

    const handleDialogOpen = (
        dialogType,
        barcodeValue = '',
        newStatus = '',
        groupName = ''
    ) => {
        setDialogStates((prev) => ({
            ...prev,
            [dialogType]: true,
            barcodeValueToDisplay: barcodeValue,
            currentEvidenceId: barcodeValue,
            currentNewStatus: newStatus,
            currentGroupName: groupName,
        }));
    };

    const handleEvidenceStatusChange = (evidenceId, newStatus) => {
        if (['DESTROYED', 'TAKEN', 'ON_EXAMINATION'].includes(newStatus)) {
        // if ('DESTROYED' === newStatus || 'TAKEN' === newStatus) {
            handleDialogOpen('openAlertNewStatus', evidenceId, newStatus);
        } else {
            handleOpenBiometricDialog({ action: 'changeStatus', evidenceId, newStatus });
        }
    };

    const SubmitChangeEvidenceStatus = (evidenceId, newStatus, documentId) => {
        handleOpenBiometricDialog({
            action: 'changeStatus',
            evidenceId,
            newStatus,
            documentId,
        });
    };

    const performEvidenceStatusChange = useCallback(
        (evidenceId, newStatus, documentId) => {
            if (isStatusUpdating) return;
            setIsStatusUpdating(true);

            const updateEvidenceStatus = () => {
                axios
                    .patch(`/api/material-evidences/${evidenceId}/`, { status: newStatus })
                    .then((response) => {
                        setGroups((prevGroups) =>
                            prevGroups.map((group) => ({
                                ...group,
                                material_evidences: group.material_evidences.map((evidence) =>
                                    evidence.id === evidenceId ? response.data : evidence
                                ),
                            }))
                        );
                        setSnackbar({
                            open: true,
                            message: t('common.messages.success_status_update'),
                            severity: 'success',
                        });
                    })
                    .catch((error) => {
                        console.error(
                            t('common.errors.error_status_update'),
                            error.response?.data || error
                        );
                        setSnackbar({
                            open: true,
                            message: t('common.errors.error_status_update'),
                            severity: 'error',
                        });
                    })
                    .finally(() => {
                        setIsStatusUpdating(false);
                    });
            };

            if (documentId) {
                axios
                    .patch(`/api/documents/${documentId}/`, { material_evidence_id: evidenceId })
                    .then((response) => {
                        console.log(t('common.success.success_file_update'), response.data);
                        updateEvidenceStatus();
                        setIsRevalidate(true);
                    })
                    .catch((error) => {
                        console.error(t('common.errors.error_file_update'), error);
                        setSnackbar({
                            open: true,
                            message: t('common.errors.error_file_update'),
                            severity: 'error',
                        });
                        setIsStatusUpdating(false);
                    });
            } else {
                updateEvidenceStatus();
            }
        },
        [isStatusUpdating, setIsStatusUpdating, setGroups, setSnackbar, t]
    );

    // DataGrid columns
    const getColumns = useCallback(
        (group) => [
            {
                field: 'name',
                headerName: t('common.table_headers.name'),
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => (
                    <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }} // Позволяем перенос текста
                    >
                        {params.row.name}
                    </Typography>
                ),
            },
            {
                field: 'description',
                headerName: t('common.table_headers.description'),
                flex: 2,
                minWidth: 200,
                sortable: false,
                renderCell: (params) => (
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }} // Позволяем перенос текста
                    >
                        {params.row.description}
                    </Typography>
                ),
            },
            {
                field: 'type',
                headerName: t('common.standard.label_evidence_type'),
                flex: 1,
                minWidth: 100,
                sortable: false,
                renderCell: (params) => (
                    <Typography variant="body2">
                        {EVIDENCE_TYPES.find((type) => type.value === params.row.type)?.label ||
                            params.row.type}
                    </Typography>
                ),
            },
            {
                field: 'status',
                headerName: t('common.table_headers.status'),
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => {
                    const evidence = params.row;
                    return canEdit ? (
                        <FormControl fullWidth variant="standard">
                            <Select
                                value={evidence.status}
                                disabled={
                                    evidence.status === 'DESTROYED' || evidence.status === 'TAKEN'
                                }
                                onChange={(event) =>
                                    handleEvidenceStatusChange(evidence.id, event.target.value)
                                }
                            >
                                {evidenceStatuses.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                        {status.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : (
                        <Typography variant="body2">
                            {
                                evidenceStatuses.find((status) => status.value === evidence.status)
                                    ?.label || evidence.status
                            }
                        </Typography>
                    );
                },
            },
            {
                field: 'actions',
                headerName: t('common.table_headers.actions'),
                flex: 0.5,
                minWidth: 100,
                sortable: false,
                renderCell: (params) => {
                    const evidence = params.row;
                    const associatedDocument = documents.find(
                        (doc) => doc.material_evidence === evidence.id
                    );
                    return (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {evidence.status === 'DESTROYED' || evidence.status === 'TAKEN' ? (
                                associatedDocument ? (
                                    <Tooltip title={t('common.buttons.download_doc')}>
                                        <IconButton
                                            color="primary"
                                            href={associatedDocument.file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <GetAppIcon />
                                        </IconButton>
                                    </Tooltip>
                                ) : (
                                    <Tooltip title={t('common.messages.not_specified')}>
                                        <IconButton color="default" disabled>
                                            <GetAppIcon />
                                        </IconButton>
                                    </Tooltip>
                                )
                            ) : (
                                <Tooltip title={t('common.buttons.button_print_barcode')}>
                                    <IconButton
                                        color="primary"
                                        onClick={() =>
                                            handlePrintEvidenceBarcode(evidence, group.name)
                                        }
                                    >
                                        <PrintIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    );
                },
            },
        ],
        [canEdit, documents, handleEvidenceStatusChange, handlePrintEvidenceBarcode, t]
    );

    // Generate rows for DataGrid
    const getRows = (group) =>
        group.material_evidences.map((evidence) => ({
            id: evidence.id,
            name: evidence.name,
            description: evidence.description,
            type: evidence.type,
            status: evidence.status,
            barcode: evidence.barcode,
            evidence,
        }));

    return (
        <Box>
            <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: canAddGroup ? theme.spacing(2) : 0 }}
            >
                {canAddGroup && (
                    <StyledButton
                        onClick={() => handleOpenBiometricDialog('openGroupDialog')}
                        startIcon={<AddIcon />}
                        disabled={isAuthenticating}
                    >
                        {t('case_detail.tabs.evidence.button_add_group')}
                    </StyledButton>
                )}
                {selectedGroupId && (
                    <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
                        {canAddGroup && (
                            <StyledButton
                                onClick={() => handleOpenBiometricDialog('openEvidenceDialog')}
                                startIcon={<AddIcon />}
                                disabled={isAuthenticating}
                            >
                                {t('case_detail.tabs.evidence.button_add_evidence')}
                            </StyledButton>
                        )}
                    </Box>
                )}
            </Box>

            {groups.map((group) => (
                <Accordion
                    key={group.id}
                    expanded={selectedGroupId === group.id}
                    onChange={() => toggleGroupSelect(group.id)}
                    sx={{ mb: theme.spacing(2) }}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}
                        sx={{
                            '& .MuiAccordionSummary-content': {
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6">{group.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                                {t('case_detail.tabs.evidence.label_storage_place')}: {group.storage_place}
                            </Typography>
                        </Box>
                        {selectedGroupId === group.id && (

                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<PrintIcon />}
                                onClick={() => handlePrintGroupBarcode(selectedGroupId)}
                                disabled={isAuthenticating}
                                sx={{ mr: 2 }}
                            >
                                {t('common.buttons.button_print_barcode')}
                            </Button>
                        )}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Paper sx={{ p: 2 }}>
                            {group.material_evidences.length > 0 ? (
                                <StyledDataGridPro rows={getRows(group)}
                                    columns={getColumns(group)}
                                    autoHeight
                                />
                            ) : (
                                <Typography variant="body2" align="center">
                                    {t('common.messages.no_evidences')}
                                </Typography>
                            )}
                        </Paper>
                    </AccordionDetails>
                </Accordion>
            ))}

            <Suspense fallback={<Loading />}>
                <DialogNewGroup
                    open={dialogStates.openGroupDialog}
                    setOpenGroupDialog={(open) =>
                        setDialogStates((prev) => ({ ...prev, openGroupDialog: open }))
                    }
                    setGroups={setGroups}
                    setSnackbar={setSnackbar}
                    groups={groups}
                    id={id}
                    caseItem={caseItem}
                />
                <DialogNewEvidence
                    open={dialogStates.openEvidenceDialog}
                    setOpenEvidenceDialog={(open) =>
                        setDialogStates((prev) => ({ ...prev, openEvidenceDialog: open }))
                    }
                    setGroups={setGroups}
                    selectedGroupId={selectedGroupId}
                    setSnackbar={setSnackbar}
                    id={id}
                />
                <DialogAlertNewStatus
                    open={dialogStates.openAlertNewStatus}
                    setOpenAlertNewStatusDialog={(open) =>
                        setDialogStates((prev) => ({ ...prev, openAlertNewStatus: open }))
                    }
                    setSnackbar={setSnackbar}
                    evidenceId={dialogStates.currentEvidenceId}
                    newStatus={dialogStates.currentNewStatus}
                    SubmitChangeEvidenceStatus={SubmitChangeEvidenceStatus}
                    id={id}
                />
            </Suspense>

            {/* Диалог для отображения штрихкода */}
            <DialogSeenBarcode
                open={dialogStates.openBarcodeDialog}
                setOpenBarcodeDialog={(open) =>
                    setDialogStates((prev) => ({ ...prev, openBarcodeDialog: open }))
                }
                barcodeValueToDisplay={dialogStates.barcodeValueToDisplay}
                groupName={dialogStates.currentGroupName}
            />

            {/* Диалог биометрической аутентификации */}
            {biometricDialogOpen && !isArchiveUser && (
                <BiometricDialog
                    open={biometricDialogOpen}
                    onClose={() => {
                        setBiometricDialogOpen(false);
                        handleBiometricError(t('common.messages.biometric_canceled'));
                    }}
                    onSuccess={handleBiometricSuccess}
                />
            )}
        </Box>
    );
}





// // frontend/src/components/CaseDetailComponents/MatEvidence.jsx
// // frontend/src/components/CaseDetailComponents/MatEvidence.jsx
//
// import React, {
//   useState,
//   lazy,
//   Suspense,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useRef,
// } from 'react';
// import {
//   Typography,
//   Box,
//   Paper,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Tooltip,
//   IconButton,
//   Select,
//   MenuItem,
//   FormControl,
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   ExpandMore as ExpandMoreIcon,
//   Print as PrintIcon,
//   GetApp as GetAppIcon,
// } from '@mui/icons-material';
// import { DataGridPro } from '@mui/x-data-grid-pro';
// import { useTheme } from '@mui/material/styles';
// import { LicenseInfo } from '@mui/x-license';
// import PropTypes from 'prop-types';
// import axios from '../../axiosConfig';
// import { evidenceStatuses } from '../../constants/evidenceStatuses';
// import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
// import BiometricDialog from '../BiometricDialog';
// import { StyledButton, StyledTableCell } from '../ui/StyledComponents';
// import PrintButton from '../ui/PrintButton';
// import DialogSeenBarcode from './DialogSeenBarcode';
// import Loading from '../Loading';
// import { AuthContext } from '../../contexts/AuthContext';
//
// // Lazy loaded components
// const DialogNewGroup = lazy(() => import('./DialogNewGroup'));
// const DialogNewEvidence = lazy(() => import('./DialogNewEvidence'));
// const DialogAlertNewStatus = lazy(() => import('./DialogAlertNewStatus'));
//
// // Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
// LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');
//
// export default function CaseDetailMatEvidence({
//   id,
//   setGroups,
//   setIsStatusUpdating,
//   isStatusUpdating,
//   setSnackbar,
//   canEdit,
//   canAddGroup,
//   groups,
//   caseItem,
// }) {
//   const theme = useTheme();
//
//   // Состояния для групп и документов
//   const [selectedGroupId, setSelectedGroupId] = useState(null);
//   const [dialogStates, setDialogStates] = useState({
//     openGroupDialog: false,
//     openEvidenceDialog: false,
//     openAlertNewStatus: false,
//     openBarcodeDialog: false,
//     barcodeValueToDisplay: '',
//     currentEvidenceId: '',
//     currentNewStatus: '',
//     currentGroupName: '',
//   });
//
//   // Состояния для биометрии
//   const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);
//   const [pendingAction, setPendingAction] = useState(null);
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
//
//   // Получаем текущего пользователя из контекста
//   const { user } = useContext(AuthContext);
//   const isArchiveUser = user?.username?.toLowerCase().includes('archive');
//
//   // Состояние для документов
//   const [documents, setDocuments] = useState([]);
//   const [isRevalidate, setIsRevalidate] = useState(false);
//
//   // Загружаем документы при монтировании компонента
//   useEffect(() => {
//     axios
//       .get('/api/documents/', {
//         params: {
//           case_id: id,
//         },
//       })
//       .then((response) => {
//         setDocuments(response.data);
//         setIsRevalidate(false);
//       })
//       .catch((error) => {
//         console.error('Ошибка при получении документов:', error);
//         setSnackbar({
//           open: true,
//           message: 'Ошибка при загрузке документов.',
//           severity: 'error',
//         });
//       });
//   }, [id, setSnackbar, isRevalidate]);
//
//   // Функции для биометрии
//   const handleOpenBiometricDialog = (action) => {
//     if (isArchiveUser) {
//       if (action === 'openGroupDialog' || action === 'openEvidenceDialog') {
//         handleDialogOpen(action);
//       } else if (action.action === 'changeStatus') {
//         performEvidenceStatusChange(
//           action.evidenceId,
//           action.newStatus,
//           action.documentId
//         );
//       }
//     } else {
//       setPendingAction(action);
//       setBiometricDialogOpen(true);
//       setIsAuthenticating(true);
//     }
//   };
//
//   const handleBiometricSuccess = () => {
//     setBiometricDialogOpen(false);
//     setIsAuthenticating(false);
//     if (
//       pendingAction === 'openGroupDialog' ||
//       pendingAction === 'openEvidenceDialog'
//     ) {
//       handleDialogOpen(pendingAction);
//     } else if (pendingAction.action === 'changeStatus') {
//       performEvidenceStatusChange(
//         pendingAction.evidenceId,
//         pendingAction.newStatus,
//         pendingAction.documentId
//       );
//     }
//     setPendingAction(null);
//   };
//
//   const handleBiometricError = (errorMessage) => {
//     setBiometricDialogOpen(false);
//     setIsAuthenticating(false);
//     setSnackbar({
//       open: true,
//       message: errorMessage,
//       severity: 'error',
//     });
//     setPendingAction(null);
//   };
//
//   const handlePrintEvidenceBarcode = (evidence, groupName) => {
//     console.log(evidence, "evidence handlePrintEvidenceBarcode");
//     if (evidence.barcode) {
//       handleDialogOpen('openBarcodeDialog', evidence.barcode, '', groupName);
//     } else {
//       setSnackbar({
//         open: true,
//         message: 'Штрихкод недоступен.',
//         severity: 'error',
//       });
//     }
//   };
//
//   const handlePrintGroupBarcode = (groupId) => {
//     const group = groups.find((g) => g.id === groupId);
//     if (group && group.barcode) {
//       handleDialogOpen('openBarcodeDialog', group.barcode, '', group.name);
//     } else {
//       setSnackbar({
//         open: true,
//         message: 'Штрихкод группы недоступен.',
//         severity: 'error',
//       });
//     }
//   };
//
//   const toggleGroupSelect = (groupId) => {
//     setSelectedGroupId(selectedGroupId === groupId ? null : groupId);
//   };
//
//   const handleDialogOpen = (
//     dialogType,
//     barcodeValue = '',
//     newStatus = '',
//     groupName = ''
//   ) => {
//     setDialogStates((prev) => ({
//       ...prev,
//       [dialogType]: true,
//       barcodeValueToDisplay: barcodeValue,
//       currentEvidenceId: barcodeValue,
//       currentNewStatus: newStatus,
//       currentGroupName: groupName,
//     }));
//   };
//
//   const handleEvidenceStatusChange = (evidenceId, newStatus) => {
//     if ('DESTROYED' === newStatus || 'TAKEN' === newStatus) {
//       handleDialogOpen('openAlertNewStatus', evidenceId, newStatus);
//     } else {
//       handleOpenBiometricDialog({ action: 'changeStatus', evidenceId, newStatus });
//     }
//   };
//
//   const SubmitChangeEvidenceStatus = (evidenceId, newStatus, documentId) => {
//     handleOpenBiometricDialog({
//       action: 'changeStatus',
//       evidenceId,
//       newStatus,
//       documentId,
//     });
//   };
//
//   const performEvidenceStatusChange = useCallback(
//     (evidenceId, newStatus, documentId) => {
//       if (isStatusUpdating) return;
//       setIsStatusUpdating(true);
//
//       const updateEvidenceStatus = () => {
//         axios
//           .patch(`/api/material-evidences/${evidenceId}/`, { status: newStatus })
//           .then((response) => {
//             setGroups((prevGroups) =>
//               prevGroups.map((group) => ({
//                 ...group,
//                 material_evidences: group.material_evidences.map((evidence) =>
//                   evidence.id === evidenceId ? response.data : evidence
//                 ),
//               }))
//             );
//             setSnackbar({
//               open: true,
//               message: 'Статус вещественного доказательства обновлен.',
//               severity: 'success',
//             });
//           })
//           .catch((error) => {
//             console.error(
//               'Ошибка при обновлении статуса:',
//               error.response?.data || error
//             );
//             setSnackbar({
//               open: true,
//               message:
//                 'Ошибка при обновлении статуса вещественного доказательства.',
//               severity: 'error',
//             });
//           })
//           .finally(() => {
//             setIsStatusUpdating(false);
//           });
//       };
//
//       if (documentId) {
//         // Сначала обновляем документ, добавляя ссылку на вещественное доказательство
//         axios
//           .patch(`/api/documents/${documentId}/`, { material_evidence_id: evidenceId })
//           .then((response) => {
//             console.log('Документ успешно обновлен:', response.data);
//             // После успешного обновления документа обновляем статус вещественного доказательства
//             updateEvidenceStatus();
//             setIsRevalidate(true);
//           })
//           .catch((error) => {
//             console.error('Ошибка при обновлении документа:', error);
//             setSnackbar({
//               open: true,
//               message: 'Ошибка при обновлении документа.',
//               severity: 'error',
//             });
//             setIsStatusUpdating(false);
//           });
//       } else {
//         // Если документ не выбран, просто обновляем статус
//         updateEvidenceStatus();
//       }
//     },
//     [isStatusUpdating, setGroups, setSnackbar, setIsStatusUpdating]
//   );
//
//   // Определение столбцов для DataGridPro с заданными flex значениями
//   const columns = useMemo(
//     () => [
//       {
//         field: 'name',
//         headerName: 'Название',
//         flex: 25, // 50%
//         minWidth: 200,
//         sortable: false,
//         renderCell: (params) => (
//           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//             <Typography
//               variant="subtitle2"
//               fontWeight="bold"
//               noWrap
//               sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//             >
//               {params.row.name}
//             </Typography>
//             <Typography
//               variant="body2"
//               color="textSecondary"
//               noWrap
//               sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//             >
//               {params.row.description}
//             </Typography>
//           </Box>
//         ),
//       },
//       {
//         field: 'description',
//         headerName: 'Описание',
//         flex: 6, // 12%
//         minWidth: 150,
//         sortable: false,
//         renderCell: (params) => (
//           <Typography
//             variant="body2"
//             noWrap
//             sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//           >
//             {params.value || 'Не указано'}
//           </Typography>
//         ),
//       },
//       {
//         field: 'type',
//         headerName: 'Тип ВД',
//         flex: 6, // 12%
//         minWidth: 150,
//         sortable: false,
//         renderCell: (params) => (
//           <Typography
//             variant="body2"
//             noWrap
//             sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//           >
//             {
//               EVIDENCE_TYPES.find(
//                 (type) => type.value === params.value
//               )?.label || params.value
//             }
//           </Typography>
//         ),
//       },
//       {
//         field: 'status',
//         headerName: 'Статус',
//         flex: 6, // 12%
//         minWidth: 150,
//         sortable: false,
//         renderCell: (params) => (
//           canEdit ? (
//             <FormControl fullWidth variant="standard">
//               <Select
//                 value={params.value}
//                 disabled={'DESTROYED' === params.value || 'TAKEN' === params.value}
//                 onChange={(event) =>
//                   handleEvidenceStatusChange(
//                     params.row.id,
//                     event.target.value
//                   )
//                 }
//               >
//                 {evidenceStatuses.map((status) => (
//                   <MenuItem key={status.value} value={status.value}>
//                     {status.label}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           ) : (
//             <Typography
//               variant="body2"
//               color={params.value === 'Активен' ? 'success.main' : 'error.main'}
//               noWrap
//               sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
//             >
//               {evidenceStatuses.find(
//                 (status) => status.value === params.value
//               )?.label || params.value}
//             </Typography>
//           )
//         ),
//       },
//       {
//         field: 'actions',
//         headerName: 'Действия',
//         flex: 6, // 12%
//         minWidth: 150,
//         sortable: false,
//         renderCell: (params) => {
//           const evidence = params.row;
//           const associatedDocument = documents.find(
//             (doc) => doc.material_evidence === evidence.id
//           );
//
//           return (
//             <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
//               {evidence.status === 'DESTROYED' || evidence.status === 'TAKEN' ? (
//                 associatedDocument ? (
//                   <Tooltip title="Скачать документ">
//                     <IconButton
//                       color="primary"
//                       href={associatedDocument.file}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       <GetAppIcon />
//                     </IconButton>
//                   </Tooltip>
//                 ) : (
//                   <Typography variant="body2">Нет документа</Typography>
//                 )
//               ) : (
//                 <Tooltip title="Печать штрихкода">
//                   <IconButton
//                     color="primary"
//                     onClick={() =>
//                       handlePrintEvidenceBarcode(evidence, params.row.groupName)
//                     }
//                   >
//                     <PrintIcon />
//                   </IconButton>
//                 </Tooltip>
//               )}
//             </Box>
//           );
//         },
//       },
//     ],
//     [canEdit, handleEvidenceStatusChange, handlePrintEvidenceBarcode, documents]
//   );
//
//   // Преобразование данных в формат, подходящий для DataGridPro
//   const rows = useMemo(
//     () =>
//       groups.flatMap((group) =>
//         group.material_evidences.map((evidence) => ({
//           id: evidence.id,
//           name: evidence.name || 'Без названия',
//           description: evidence.description || 'Описание не указано',
//           type: evidence.type || 'Не указано',
//           status: evidence.status || 'Не указано',
//           groupName: group.name,
//           groupId: group.id,
//         }))
//       ),
//     [groups]
//   );
//
//   return (
//     <Box>
//       <Box
//         sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(2) }}
//       >
//         {canAddGroup && (
//           <StyledButton
//             onClick={() => handleOpenBiometricDialog('openGroupDialog')}
//             startIcon={<AddIcon />}
//             disabled={isAuthenticating}
//           >
//             Добавить группу
//           </StyledButton>
//         )}
//         {selectedGroupId && (
//           <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
//             {canAddGroup && (
//               <StyledButton
//                 onClick={() => handleOpenBiometricDialog('openEvidenceDialog')}
//                 startIcon={<AddIcon />}
//                 disabled={isAuthenticating}
//               >
//                 Добавить вещественное доказательство
//               </StyledButton>
//             )}
//             <PrintButton
//               handlePrint={() => handlePrintGroupBarcode(selectedGroupId)}
//               text="Печать штрихкода"
//               disabled={isAuthenticating}
//             />
//           </Box>
//         )}
//       </Box>
//
//       {groups.map((group) => (
//         <Accordion
//           key={group.id}
//           expanded={selectedGroupId === group.id}
//           onChange={() => toggleGroupSelect(group.id)}
//         >
//           <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//               <Typography variant="h6">{group.name}</Typography>
//               <Typography variant="body2">
//                 Место хранения: {group.storage_place}
//               </Typography>
//             </Box>
//           </AccordionSummary>
//           <AccordionDetails>
//             <Box sx={{ position: 'relative' }}>
//               <Paper
//                 sx={{
//                   width: '100%',
//                   p: 2,
//                   boxShadow: 3,
//                   boxSizing: 'border-box',
//                 }}
//               >
//                 <DataGridPro
//                   rows={rows.filter(row => row.groupId === group.id)}
//                   columns={columns.map((col) => ({
//                     ...col,
//                     flex: col.flex || 1,
//                     minWidth: col.minWidth || 150,
//                   }))}
//                   disableColumnMenu
//                   disableSelectionOnClick
//                   getRowHeight={() => 'auto'}
//                   hideFooter
//                   sortingMode="server"
//                   sx={{
//                     '& .MuiDataGrid-cell': {
//                       whiteSpace: 'nowrap',
//                       overflow: 'hidden',
//                       textOverflow: 'ellipsis',
//                       padding: theme.spacing(1),
//                       borderBottom: `1px solid ${theme.palette.divider}`,
//                     },
//                     '& .MuiDataGrid-columnHeaders': {
//                       backgroundColor: theme.palette.grey[100],
//                       borderBottom: `1px solid ${theme.palette.divider}`,
//                       fontWeight: 'bold',
//                       outline: 'none',
//                     },
//                     '& .MuiDataGrid-columnHeader:focus': {
//                       outline: 'none',
//                     },
//                     '& .MuiDataGrid-columnHeader:focus-within': {
//                       outline: 'none',
//                     },
//                     '& .MuiDataGrid-columnHeaderTitle': {
//                       fontWeight: 'bold',
//                     },
//                     '& .MuiDataGrid-row': {
//                       '&:nth-of-type(odd)': {
//                         backgroundColor: theme.palette.action.hover,
//                       },
//                       // cursor: 'pointer',
//                     },
//                     '& .MuiDataGrid-row:hover': {
//                       '&:nth-of-type(odd)': {
//                         backgroundColor: theme.palette.action.hover,
//                       },
//                       backgroundColor: "initial",
//                     },
//                     '& .MuiDataGrid-cell:focus': {
//                       outline: 'none',
//                     },
//                     '& .MuiDataGrid-row:focus': {
//                       outline: 'none',
//                     },
//                     '& .MuiDataGrid-cell:focus-within': {
//                       outline: 'none',
//                     },
//                     '& .MuiDataGrid-row.Mui-selected': {
//                       backgroundColor: 'inherit'
//                     },
//                   }}
//                 />
//               </Paper>
//             </Box>
//           </AccordionDetails>
//         </Accordion>
//       ))}
//
//       <Suspense fallback={<Loading />}>
//         <DialogNewGroup
//           open={dialogStates.openGroupDialog}
//           setOpenGroupDialog={(open) =>
//             setDialogStates((prev) => ({ ...prev, openGroupDialog: open }))
//           }
//           setGroups={setGroups}
//           setSnackbar={setSnackbar}
//           groups={groups}
//           id={id}
//           caseItem={caseItem}
//         />
//         <DialogNewEvidence
//           open={dialogStates.openEvidenceDialog}
//           setOpenEvidenceDialog={(open) =>
//             setDialogStates((prev) => ({ ...prev, openEvidenceDialog: open }))
//           }
//           setGroups={setGroups}
//           selectedGroupId={selectedGroupId}
//           setSnackbar={setSnackbar}
//           id={id}
//         />
//         <DialogAlertNewStatus
//           open={dialogStates.openAlertNewStatus}
//           setOpenAlertNewStatusDialog={(open) =>
//             setDialogStates((prev) => ({ ...prev, openAlertNewStatus: open }))
//           }
//           setSnackbar={setSnackbar}
//           evidenceId={dialogStates.currentEvidenceId}
//           newStatus={dialogStates.currentNewStatus}
//           SubmitChangeEvidenceStatus={SubmitChangeEvidenceStatus}
//           id={id}
//         />
//       </Suspense>
//
//       {/* Диалоговое окно для отображения штрихкода */}
//       <DialogSeenBarcode
//         open={dialogStates.openBarcodeDialog}
//         setOpenBarcodeDialog={(open) =>
//           setDialogStates((prev) => ({ ...prev, openBarcodeDialog: open }))
//         }
//         barcodeValueToDisplay={dialogStates.barcodeValueToDisplay}
//         groupName={dialogStates.currentGroupName}
//       />
//
//       {/* Диалоговое окно биометрической аутентификации */}
//       {biometricDialogOpen && !isArchiveUser && (
//         <BiometricDialog
//           open={biometricDialogOpen}
//           onClose={() => {
//             setBiometricDialogOpen(false);
//             handleBiometricError('Аутентификация была отменена.');
//           }}
//           onSuccess={handleBiometricSuccess}
//         />
//       )}
//     </Box>
//   );
// }
//
// CaseDetailMatEvidence.propTypes = {
//   id: PropTypes.string.isRequired,
//   setGroups: PropTypes.func.isRequired,
//   setIsStatusUpdating: PropTypes.func.isRequired,
//   isStatusUpdating: PropTypes.bool.isRequired,
//   setSnackbar: PropTypes.func.isRequired,
//   canEdit: PropTypes.bool.isRequired,
//   canAddGroup: PropTypes.bool.isRequired,
//   groups: PropTypes.array.isRequired,
//   caseItem: PropTypes.object.isRequired,
// };


// До новой таблицы--------------------------------------- исходная

// // frontend/src/components/CaseDetailComponents/MatEvidence.jsx
// import React, {
//   useState,
//   lazy,
//   Suspense,
//   useCallback,
//   useContext,
//   useEffect,
// } from 'react';
// import {
//   Typography,
//   Box,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Tooltip,
//   Select,
//   MenuItem,
//   FormControl,
// } from '@mui/material';
// import {
//   Add as AddIcon,
//   ExpandMore as ExpandMoreIcon,
//   Print as PrintIcon,
//   GetApp as GetAppIcon, // Иконка для скачивания
// } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import { evidenceStatuses } from '../../constants/evidenceStatuses';
// import axios from '../../axiosConfig';
// import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
// import BiometricDialog from '../BiometricDialog';
// import { StyledButton, StyledTableCell } from '../ui/StyledComponents';
// import PrintButton from '../ui/PrintButton';
// import DialogSeenBarcode from './DialogSeenBarcode';
// import Loading from '../Loading';
// import { AuthContext } from '../../contexts/AuthContext';
//
// const DialogNewGroup = lazy(() => import('./DialogNewGroup'));
// const DialogNewEvidence = lazy(() => import('./DialogNewEvidence'));
// const DialogAlertNewStatus = lazy(() => import('./DialogAlertNewStatus'));
//
// export default function CaseDetailMatEvidence({
//   id,
//   setGroups,
//   setIsStatusUpdating,
//   isStatusUpdating,
//   setSnackbar,
//   canEdit,
//   canAddGroup,
//   groups,
//   caseItem,
// }) {
//   const theme = useTheme();
//
//   const [selectedGroupId, setSelectedGroupId] = useState(null);
//   const [dialogStates, setDialogStates] = useState({
//     openGroupDialog: false,
//     openEvidenceDialog: false,
//     openAlertNewStatus: false,
//     openBarcodeDialog: false,
//     barcodeValueToDisplay: '',
//     currentEvidenceId: '',
//     currentNewStatus: '',
//     currentGroupName: '',
//   });
//
//   // Состояния для биометрии
//   const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);
//   const [pendingAction, setPendingAction] = useState(null);
//   const [isAuthenticating, setIsAuthenticating] = useState(false);
//
//   // Получаем текущего пользователя из контекста
//   const { user } = useContext(AuthContext);
//   // Проверяем, содержит ли имя пользователя подстроку "archive"
//   const isArchiveUser = user?.username?.toLowerCase().includes('archive');
//
//   // 🆕 Состояние для хранения документов
//   const [documents, setDocuments] = useState([]);
//   const [isRevalidate, setIsRevalidate] = useState(false);
//
//   // 🆕 Загружаем документы при монтировании компонента
//   useEffect(() => {
//     axios
//       .get('/api/documents/', {
//         params: {
//           case_id: id,
//         },
//       })
//       .then((response) => {
//         setDocuments(response.data);
//         setIsRevalidate(false);
//       })
//       .catch((error) => {
//         console.error('Ошибка при получении документов:', error);
//         setSnackbar({
//           open: true,
//           message: 'Ошибка при загрузке документов.',
//           severity: 'error',
//         });
//       });
//   }, [id, setSnackbar, isRevalidate]);
//
//   // Функции для биометрии
//   const handleOpenBiometricDialog = (action) => {
//     if (isArchiveUser) {
//       // Если пользователь "archive", выполняем действие без биометрии
//       if (action === 'openGroupDialog' || action === 'openEvidenceDialog') {
//         handleDialogOpen(action);
//       } else if (action.action === 'changeStatus') {
//         performEvidenceStatusChange(
//           action.evidenceId,
//           action.newStatus,
//           action.documentId
//         );
//       }
//     } else {
//       // Иначе запускаем биометрическую аутентификацию
//       setPendingAction(action);
//       setBiometricDialogOpen(true);
//       setIsAuthenticating(true);
//     }
//   };
//
//   const handleBiometricSuccess = () => {
//     setBiometricDialogOpen(false);
//     setIsAuthenticating(false);
//     if (
//       pendingAction === 'openGroupDialog' ||
//       pendingAction === 'openEvidenceDialog'
//     ) {
//       handleDialogOpen(pendingAction);
//     } else if (pendingAction.action === 'changeStatus') {
//       performEvidenceStatusChange(
//         pendingAction.evidenceId,
//         pendingAction.newStatus,
//         pendingAction.documentId
//       );
//     }
//     setPendingAction(null);
//   };
//
//   const handleBiometricError = (errorMessage) => {
//     setBiometricDialogOpen(false);
//     setIsAuthenticating(false);
//     setSnackbar({
//       open: true,
//       message: errorMessage,
//       severity: 'error',
//     });
//     setPendingAction(null);
//   };
//
//   const handlePrintEvidenceBarcode = (evidence, groupName) => {
//     if (evidence.barcode) {
//       handleDialogOpen('openBarcodeDialog', evidence.barcode, '', groupName);
//     } else {
//       setSnackbar({
//         open: true,
//         message: 'Штрихкод недоступен.',
//         severity: 'error',
//       });
//     }
//   };
//
//   const handlePrintGroupBarcode = (groupId) => {
//     const group = groups.find((g) => g.id === groupId);
//     if (group && group.barcode) {
//       handleDialogOpen('openBarcodeDialog', group.barcode, '', group.name);
//     } else {
//       setSnackbar({
//         open: true,
//         message: 'Штрихкод группы недоступен.',
//         severity: 'error',
//       });
//     }
//   };
//
//   const toggleGroupSelect = (groupId) => {
//     setSelectedGroupId(selectedGroupId === groupId ? null : groupId);
//   };
//
//   const handleDialogOpen = (
//     dialogType,
//     barcodeValue = '',
//     newStatus = '',
//     groupName = ''
//   ) => {
//     setDialogStates((prev) => ({
//       ...prev,
//       [dialogType]: true,
//       barcodeValueToDisplay: barcodeValue,
//       currentEvidenceId: barcodeValue,
//       currentNewStatus: newStatus,
//       currentGroupName: groupName,
//     }));
//   };
//
//   const handleEvidenceStatusChange = (evidenceId, newStatus) => {
//     if ('DESTROYED' === newStatus || 'TAKEN' === newStatus) {
//       handleDialogOpen('openAlertNewStatus', evidenceId, newStatus);
//     } else {
//       handleOpenBiometricDialog({ action: 'changeStatus', evidenceId, newStatus });
//     }
//   };
//
//   const SubmitChangeEvidenceStatus = (evidenceId, newStatus, documentId) => {
//     handleOpenBiometricDialog({
//       action: 'changeStatus',
//       evidenceId,
//       newStatus,
//       documentId,
//     });
//   };
//
//   const performEvidenceStatusChange = useCallback(
//     (evidenceId, newStatus, documentId) => {
//       if (isStatusUpdating) return;
//       setIsStatusUpdating(true);
//
//       const updateEvidenceStatus = () => {
//         axios
//           .patch(`/api/material-evidences/${evidenceId}/`, { status: newStatus })
//           .then((response) => {
//             setGroups((prevGroups) =>
//               prevGroups.map((group) => ({
//                 ...group,
//                 material_evidences: group.material_evidences.map((evidence) =>
//                   evidence.id === evidenceId ? response.data : evidence
//                 ),
//               }))
//             );
//             setSnackbar({
//               open: true,
//               message: 'Статус вещественного доказательства обновлен.',
//               severity: 'success',
//             });
//           })
//           .catch((error) => {
//             console.error(
//               'Ошибка при обновлении статуса:',
//               error.response?.data || error
//             );
//             setSnackbar({
//               open: true,
//               message:
//                 'Ошибка при обновлении статуса вещественного доказательства.',
//               severity: 'error',
//             });
//           })
//           .finally(() => {
//             setIsStatusUpdating(false);
//           });
//       };
//
//       if (documentId) {
//         // Сначала обновляем документ, добавляя ссылку на вещественное доказательство
//         axios
//           .patch(`/api/documents/${documentId}/`, { material_evidence_id: evidenceId })
//           .then((response) => {
//             console.log('Документ успешно обновлен:', response.data);
//             // После успешного обновления документа обновляем статус вещественного доказательства
//             updateEvidenceStatus();
//             setIsRevalidate(true);
//           })
//           .catch((error) => {
//             console.error('Ошибка при обновлении документа:', error);
//             setSnackbar({
//               open: true,
//               message: 'Ошибка при обновлении документа.',
//               severity: 'error',
//             });
//             setIsStatusUpdating(false);
//           });
//       } else {
//         // Если документ не выбран, просто обновляем статус
//         updateEvidenceStatus();
//       }
//     },
//     [isStatusUpdating, setGroups, setSnackbar, setIsStatusUpdating]
//   );
//
//   return (
//     <Box>
//       <Box
//         sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(2) }}
//       >
//         {canAddGroup && (
//           <StyledButton
//             onClick={() => handleOpenBiometricDialog('openGroupDialog')}
//             startIcon={<AddIcon />}
//             disabled={isAuthenticating}
//           >
//             <span
//               style={{
//                 height: '1ex',
//                 overflow: 'visible',
//                 lineHeight: '1ex',
//                 verticalAlign: 'bottom',
//               }}
//             >
//               Добавить группу
//             </span>
//           </StyledButton>
//         )}
//         {selectedGroupId && (
//           <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
//             {canAddGroup && (
//               <StyledButton
//                 onClick={() => handleOpenBiometricDialog('openEvidenceDialog')}
//                 startIcon={<AddIcon />}
//                 disabled={isAuthenticating}
//               >
//                 <span
//                   style={{
//                     height: '1ex',
//                     overflow: 'visible',
//                     lineHeight: '1ex',
//                     verticalAlign: 'bottom',
//                   }}
//                 >
//                   Добавить вещественное доказательство
//                 </span>
//               </StyledButton>
//             )}
//             <PrintButton
//               handlePrint={() => handlePrintGroupBarcode(selectedGroupId)}
//               text="Печать штрихкода"
//               disabled={isAuthenticating}
//             />
//           </Box>
//         )}
//       </Box>
//
//       {groups.map((group) => (
//         <Accordion
//           key={group.id}
//           expanded={selectedGroupId === group.id}
//           onChange={() => toggleGroupSelect(group.id)}
//         >
//           <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//             <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//               <Typography variant="h6">{group.name}</Typography>
//               <Typography variant="body2">
//                 Место хранения: {group.storage_place}
//               </Typography>
//             </Box>
//           </AccordionSummary>
//           <AccordionDetails>
//             <TableContainer component={Paper}>
//               <Table aria-label={`Таблица ВД группы ${group.name}`}>
//                 <TableHead>
//                   <TableRow>
//                     <StyledTableCell sx={{ width: '20%' }}>Название</StyledTableCell>
//                     <StyledTableCell sx={{ width: '30%' }}>Описание</StyledTableCell>
//                     <StyledTableCell sx={{ width: '10%' }}>Тип ВД</StyledTableCell>
//                     <StyledTableCell sx={{ width: '30%' }}>Статус</StyledTableCell>
//                     <StyledTableCell sx={{ width: '10%' }}>Действия</StyledTableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {group.material_evidences.length > 0 ? (
//                     group.material_evidences.map((evidence) => {
//                       // 🆕 Находим документ, связанный с вещественным доказательством
//                       const associatedDocument = documents.find(
//                         (doc) => doc.material_evidence === evidence.id
//                       );
//
//                       return (
//                         <TableRow key={evidence.id}>
//                           <TableCell>{evidence.name}</TableCell>
//                           <TableCell>{evidence.description}</TableCell>
//                           <TableCell>
//                             {
//                               EVIDENCE_TYPES.find(
//                                 (type) => type.value === evidence.type
//                               )?.label || evidence.type
//                             }
//                           </TableCell>
//                           <TableCell>
//                             {canEdit ? (
//                               <FormControl fullWidth variant="standard">
//                                 <Select
//                                   value={evidence.status}
//                                   disabled={'DESTROYED' === evidence.status || 'TAKEN' === evidence.status}
//                                   onChange={(event) =>
//                                     handleEvidenceStatusChange(
//                                       evidence.id,
//                                       event.target.value
//                                     )
//                                   }
//                                 >
//                                   {evidenceStatuses.map((status) => (
//                                     <MenuItem key={status.value} value={status.value}>
//                                       {status.label}
//                                     </MenuItem>
//                                   ))}
//                                 </Select>
//                               </FormControl>
//                             ) : (
//                               evidenceStatuses.find(
//                                 (status) => status.value === evidence.status
//                               )?.label || evidence.status
//                             )}
//                           </TableCell>
//                           <TableCell sx={{ textAlign: 'center' }}>
//                             {evidence.status === 'DESTROYED' || evidence.status === 'TAKEN' ? (
//                               associatedDocument ? (
//                                 <Tooltip title="Скачать документ">
//                                   <IconButton
//                                     color="primary"
//                                     href={associatedDocument.file}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                   >
//                                     <GetAppIcon />
//                                   </IconButton>
//                                 </Tooltip>
//                               ) : (
//                                 <Typography variant="body2">Нет документа</Typography>
//                               )
//                             ) : (
//                               <Tooltip title="Печать штрихкода">
//                                 <IconButton
//                                   color="primary"
//                                   onClick={() =>
//                                     // если что убирать тут (убрать номер группы у вещдока)
//                                     handlePrintEvidenceBarcode(evidence, group.name)
//                                   }
//                                 >
//                                   <PrintIcon />
//                                 </IconButton>
//                               </Tooltip>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       );
//                     })
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={5} align="center">
//                         Нет вещественных доказательств.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </AccordionDetails>
//         </Accordion>
//       ))}
//
//       <Suspense fallback={<Loading />}>
//         <DialogNewGroup
//           open={dialogStates.openGroupDialog}
//           setOpenGroupDialog={(open) =>
//             setDialogStates((prev) => ({ ...prev, openGroupDialog: open }))
//           }
//           setGroups={setGroups}
//           setSnackbar={setSnackbar}
//           groups={groups}
//           id={id}
//           caseItem={caseItem}
//         />
//         <DialogNewEvidence
//           open={dialogStates.openEvidenceDialog}
//           setOpenEvidenceDialog={(open) =>
//             setDialogStates((prev) => ({ ...prev, openEvidenceDialog: open }))
//           }
//           setGroups={setGroups}
//           selectedGroupId={selectedGroupId}
//           setSnackbar={setSnackbar}
//           id={id}
//         />
//         <DialogAlertNewStatus
//           open={dialogStates.openAlertNewStatus}
//           setOpenAlertNewStatusDialog={(open) =>
//             setDialogStates((prev) => ({ ...prev, openAlertNewStatus: open }))
//           }
//           setSnackbar={setSnackbar}
//           evidenceId={dialogStates.currentEvidenceId}
//           newStatus={dialogStates.currentNewStatus}
//           SubmitChangeEvidenceStatus={SubmitChangeEvidenceStatus}
//           id={id} // Передаем ID дела для получения документов
//         />
//       </Suspense>
//
//       {/* Диалоговое окно для отображения штрихкода */}
//       <DialogSeenBarcode
//         open={dialogStates.openBarcodeDialog}
//         setOpenBarcodeDialog={(open) =>
//           setDialogStates((prev) => ({ ...prev, openBarcodeDialog: open }))
//         }
//         barcodeValueToDisplay={dialogStates.barcodeValueToDisplay}
//         groupName={dialogStates.currentGroupName}
//       />
//
//       {/* Диалоговое окно биометрической аутентификации */}
//       {biometricDialogOpen && !isArchiveUser && (
//         <BiometricDialog
//           open={biometricDialogOpen}
//           onClose={() => {
//             setBiometricDialogOpen(false);
//             handleBiometricError('Аутентификация была отменена.');
//           }}
//           onSuccess={handleBiometricSuccess}
//         />
//       )}
//     </Box>
//   );
// }



// -----------------------------------------------------------------

// новая из чатгпт