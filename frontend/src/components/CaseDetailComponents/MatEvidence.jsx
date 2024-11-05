import React, { useRef, useState, lazy, Suspense, useCallback, useContext } from 'react';
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
} from '@mui/material';
import { Add as AddIcon, ExpandMore as ExpandMoreIcon, Print as PrintIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { evidenceStatuses } from '../../constants/evidenceStatuses';
import axios from '../../axiosConfig';
import { useReactToPrint } from 'react-to-print';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import BiometricDialog from '../BiometricDialog';
import { StyledButton, StyledTableCell } from '../ui/StyledComponents';
import PrintButton from '../ui/PrintButton';
import DialogSeenBarcode from './DialogSeenBarcode';
import Loading from '../Loading';
import { AuthContext } from '../../contexts/AuthContext';

const DialogNewGroup = lazy(() => import('./DialogNewGroup'));
const DialogNewEvidence = lazy(() => import('./DialogNewEvidence'));

export default function CaseDetailMatEvidence({
    id, setGroups, setIsStatusUpdating, isStatusUpdating, setSnackbar, canEdit, canAddGroup, groups,
}) {
    const theme = useTheme();

    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [dialogStates, setDialogStates] = useState({
        openGroupDialog: false,
        openEvidenceDialog: false,
        openBarcodeDialog: false,
        barcodeValueToDisplay: '',
    });
    
    // Состояния для диалогового окна и значения штрихкода
    const barcodeRef = useRef(); // Реф для печати штрихкода


    // Состояния для биометрии
    const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    // Получаем текущего пользователя из контекста
    const { user  } = useContext(AuthContext);
    // Проверяем, содержит ли имя пользователя подстроку "archive"
    const isArchiveUser = user?.username?.toLowerCase().includes('archive');

  // Функции для биометрии
  const handleOpenBiometricDialog = (action) => {

    console.log('Текущий пользователь:', user);
    if (isArchiveUser) {
      // Если пользователь "archive", выполняем действие без биометрии
    //   if (action === 'addGroup') {
    //     handleOpenGroupDialog();
    //   } else if (action === 'addEvidence') {
    //     handleOpenEvidenceDialog();
    //   } else if (action.action === 'changeStatus') {
    //     performEvidenceStatusChange(action.evidenceId, action.newStatus);
    //   }
      setPendingAction(action);
      handleBiometricSuccess();

    } else {
      // Иначе запускаем биометрическую аутентификацию
      setPendingAction(action);
      setBiometricDialogOpen(true);
      setIsAuthenticating(true);
    }
  };

  const handleBiometricSuccess = () => {
    setBiometricDialogOpen(false);
    setIsAuthenticating(false);

    if (pendingAction === 'openGroupDialog' || pendingAction === 'openEvidenceDialog') {
        handleDialogOpen(pendingAction);
    } else if (pendingAction.action === 'changeStatus') {
      performEvidenceStatusChange(pendingAction.evidenceId, pendingAction.newStatus);
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

    const handlePrintEvidenceBarcode = (evidence) => {
        if (evidence.barcode) {
            handleDialogOpen('openBarcodeDialog', evidence.barcode);
        } else {
            setSnackbar({
                open: true,
                message: 'Штрихкод недоступен.',
                severity: 'error',
            });
        }
    };

    // Функция для печати только штрихкода
    const handlePrintBarcode = useReactToPrint({
        contentRef: barcodeRef,
        documentTitle: 'Штрихкод',
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

    const handlePrintGroupBarcode = (groupId) => {
        const group = groups.find((g) => g.id === groupId);
        if (group && group.barcode) {
            handleDialogOpen('openBarcodeDialog', group.barcode);
        } else {
            setSnackbar({
                open: true,
                message: 'Штрихкод группы недоступен.',
                severity: 'error',
            });
        }
    };



    const toggleGroupSelect = (groupId) => {
        setSelectedGroupId(selectedGroupId === groupId ? null : groupId);
    };

    const handleDialogOpen = (dialogType, barcodeValue = '') => {
        setDialogStates((prev) => ({
            ...prev,
            [dialogType]: true,
            barcodeValueToDisplay: barcodeValue,
        }));
    };

    const handleEvidenceStatusChange = (evidenceId, newStatus) => {
        handleOpenBiometricDialog({ action: 'changeStatus', evidenceId, newStatus });
    };
    const performEvidenceStatusChange = useCallback((evidenceId, newStatus) => {
        if (isStatusUpdating) return;
        setIsStatusUpdating(true);

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
                    message: 'Статус вещественного доказательства обновлен.',
                    severity: 'success',
                });
            })
            .catch((error) => {
                console.error('Ошибка при обновлении статуса:', error.response?.data || error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при обновлении статуса вещественного доказательства.',
                    severity: 'error',
                });
            })
            .finally(() => {
                setIsStatusUpdating(false);
            });
    }, [isStatusUpdating, setGroups, setSnackbar, setIsStatusUpdating]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(2) }}>
                {canAddGroup && (
                    <StyledButton onClick={() => handleOpenBiometricDialog('openGroupDialog')} startIcon={<AddIcon />}
                        disabled={isAuthenticating}        
                    >
                        Добавить группу
                    </StyledButton>
                )}
                {selectedGroupId && (
                    <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
                        {canAddGroup && (
                            <StyledButton onClick={() => handleOpenBiometricDialog('openEvidenceDialog')} startIcon={<AddIcon />}
                                disabled={isAuthenticating}                            
                            >
                                Добавить вещественное доказательство
                            </StyledButton>
                        )}
                        <PrintButton handlePrint={() => handlePrintGroupBarcode(selectedGroupId)} text="Печать штрихкода" 
                            disabled={isAuthenticating}
                        />
                    </Box>
                )}
            </Box>

            {groups.map((group) => (
                <Accordion key={group.id} expanded={selectedGroupId === group.id} onChange={() => toggleGroupSelect(group.id)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">{group.name}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <TableContainer component={Paper}>
                            <Table aria-label={`Таблица ВД группы ${group.name}`}>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell>Название</StyledTableCell>
                                        <StyledTableCell>Описание</StyledTableCell>
                                        <StyledTableCell>Тип ВД</StyledTableCell>
                                        <StyledTableCell>Статус</StyledTableCell>
                                        <StyledTableCell>Действия</StyledTableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {group.material_evidences.length > 0 ? group.material_evidences.map((evidence) => (
                                        <TableRow key={evidence.id}>
                                            <TableCell>{evidence.name}</TableCell>
                                            <TableCell>{evidence.description}</TableCell>
                                            <TableCell>{EVIDENCE_TYPES.find((type) => type.value === evidence.type)?.label || evidence.type}</TableCell>
                                            <TableCell>
                                                {canEdit ? (
                                                    <FormControl fullWidth variant="standard">
                                                        <Select value={evidence.status} onChange={(event) => handleEvidenceStatusChange(evidence.id, event.target.value)}>
                                                            {evidenceStatuses.map((status) => (
                                                                <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                ) : (
                                                    evidenceStatuses.find((status) => status.value === evidence.status)?.label || evidence.status
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Печать штрихкода">
                                                    <IconButton color="primary" onClick={() => 
                                                        handlePrintEvidenceBarcode(evidence)
                                                    }>
                                                        <PrintIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">Нет вещественных доказательств.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </AccordionDetails>
                </Accordion>
            ))}
            
            <Suspense fallback={<Loading/>}>
                <DialogNewGroup
                    open={dialogStates.openGroupDialog}
                    setOpenGroupDialog={(open) => setDialogStates((prev) => ({ ...prev, openGroupDialog: open }))}
                    setGroups={setGroups}
                    setSnackbar={setSnackbar}
                    groups={groups}
                    id={id}
                />
                <DialogNewEvidence
                    open={dialogStates.openEvidenceDialog}
                    setOpenEvidenceDialog={(open) => setDialogStates((prev) => ({ ...prev, openEvidenceDialog: open }))}
                    setGroups={setGroups}
                    selectedGroupId={selectedGroupId}
                    setSnackbar={setSnackbar}
                    id={id}
                />
            </Suspense>
                
            {/* Диалоговое окно для отображения штрихкода */}
            <DialogSeenBarcode open={dialogStates.openBarcodeDialog}
                 setOpenBarcodeDialog={(open) => setDialogStates((prev) => ({ ...prev, openBarcodeDialog: open }))}
                 barcodeValueToDisplay={dialogStates.barcodeValueToDisplay}
                 barcodeRef={barcodeRef}
                 handlePrintBarcode={handlePrintBarcode}
            />

            {/* Диалоговое окно биометрической аутентификации */}
            {!isArchiveUser && (
                <BiometricDialog
                    open={biometricDialogOpen}
                    onClose={() => {
                        setBiometricDialogOpen(false);
                        handleBiometricError('Аутентификация была отменена.');
                    }}
                    onSuccess={handleBiometricSuccess}
                />
            )}
        </Box>
    );
}


// import {
//     Typography,
//     Box,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper,
//     IconButton,
//     Accordion,
//     AccordionSummary,
//     AccordionDetails,
//     Tooltip,
//     Select,
//     MenuItem,
//     FormControl,
// } from '@mui/material';

// import {
//     Add as AddIcon,
//     ExpandMore as ExpandMoreIcon,
//     Print as PrintIcon,
// } from '@mui/icons-material';

// import { useTheme } from '@mui/material/styles';
// import { evidenceStatuses } from '../../constants/evidenceStatuses';
// import axios from '../../axiosConfig';
// import { useRef, useState } from 'react';
// import DialogSeenBarcode from './DialogSeenBarcode';
// import { useReactToPrint } from 'react-to-print';
// import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
// import { StyledButton, StyledTableCell } from '../ui/StyledComponents';
// import PrintButton from '../ui/PrintButton';
// import DialogNewGroup from './DialogNewGroup';
// import DialogNewEvidence from './DialogNewEvidence';

// export default function CaseDetailMatEvidence({
//     id, setGroups, setIsStatusUpdating, isStatusUpdating, setSnackbar, canEdit, canAddGroup, groups, }) {
//     const theme = useTheme();
//     const [selectedGroupId, setSelectedGroupId] = useState(null);
//     const [openGroupDialog, setOpenGroupDialog] = useState(false);
//     const [openEvidenceDialog, setOpenEvidenceDialog] = useState(false);

//     // Состояния для диалогового окна и значения штрихкода
//     const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
//     const [barcodeValueToDisplay, setBarcodeValueToDisplay] = useState('');
//     const barcodeRef = useRef(); // Реф для печати штрихкода

//     // Вкладка "Вещдоки"
//     const handleOpenGroupDialog = () => {
//         setOpenGroupDialog(true);
//     };    

//     const handleGroupSelect = (groupId) => {
//         setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
//     };

//     const handleOpenEvidenceDialog = () => {
//         setOpenEvidenceDialog(true);
//     };


//     // Получение отображаемого типа
//     const getTypeLabel = (value) => {
//         const type = EVIDENCE_TYPES.find((type) => type.value === value);
//         return type ? type.label : value;
//     };

//     // Функция для изменения статуса вещественного доказательства
//     const handleEvidenceStatusChange = (evidenceId, newStatus) => {
//         if (isStatusUpdating) return; // Предотвращаем повторные запросы
//         setIsStatusUpdating(true);

//         axios
//             .patch(`/api/material-evidences/${evidenceId}/`, { status: newStatus })
//             .then((response) => {
//                 // Обновляем состояние групп с обновленным статусом вещественного доказательства
//                 setGroups((prevGroups) =>
//                     prevGroups.map((group) => ({
//                         ...group,
//                         material_evidences: group.material_evidences.map((evidence) =>
//                             evidence.id === evidenceId ? response.data : evidence
//                         ),
//                     }))
//                 );
//                 setSnackbar({
//                     open: true,
//                     message: 'Статус вещественного доказательства обновлен.',
//                     severity: 'success',
//                 });
//             })
//             .catch((error) => {
//                 console.error(
//                     'Ошибка при обновлении статуса вещественного доказательства:',
//                     error.response?.data || error
//                 );
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при обновлении статуса вещественного доказательства.',
//                     severity: 'error',
//                 });
//             })
//             .finally(() => {
//                 setIsStatusUpdating(false);
//             });
//     };

//     // Функции для отображения и печати штрихкодов
//     const handleOpenBarcodeDialog = (barcodeValue) => {
//         if (!barcodeValue) {
//             setSnackbar({
//                 open: true,
//                 message: 'Штрихкод недоступен.',
//                 severity: 'error',
//             });
//             return;
//         }
//         setBarcodeValueToDisplay(barcodeValue);
//         setOpenBarcodeDialog(true);
//     };

    // const handlePrintEvidenceBarcode = (evidence) => {
    //     if (evidence.barcode) {
    //         handleOpenBarcodeDialog(evidence.barcode);
    //     } else {
    //         setSnackbar({
    //             open: true,
    //             message: 'Штрихкод недоступен.',
    //             severity: 'error',
    //         });
    //     }
    // };

    // // Функция для печати только штрихкода
    // const handlePrintBarcode = useReactToPrint({
    //     contentRef: barcodeRef,
    //     documentTitle: 'Штрихкод',
    //     pageStyle: `
    //   @page {
    //     size: 58mm 40mm;
    //     margin: 0;
    //   }
    //   @media print {
    //     body {
    //       margin: 0;
    //     }
    //     #barcode-container {
    //       width: 58mm;
    //       height: 40mm;
    //       padding: 6.36mm;
    //       box-sizing: border-box;
    //       display: flex;
    //       justify-content: center;
    //       align-items: center;
    //     }
    //     #barcode svg {
    //       width: auto;
    //       height: 70%;
    //     }
    //   }
    // `,
    // });

    // const handlePrintGroupBarcode = (groupId) => {
    //     const group = groups.find((g) => g.id === groupId);
    //     if (group && group.barcode) {
    //         handleOpenBarcodeDialog(group.barcode);
    //     } else {
    //         setSnackbar({
    //             open: true,
    //             message: 'Штрихкод группы недоступен.',
    //             severity: 'error',
    //         });
    //     }
    // };

//     return (
//         <>
//             <Box>
//                 {/* Кнопки над таблицей */}
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         mb: theme.spacing(2),
//                     }}
//                 >
//                     {canAddGroup && (
//                         <StyledButton
//                             onClick={handleOpenGroupDialog}
//                             startIcon={<AddIcon />}
//                         >
//                             Добавить группу
//                         </StyledButton>
//                     )}
//                     {selectedGroupId && (
//                         <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
//                             {canAddGroup && (
//                                 <StyledButton
//                                     onClick={handleOpenEvidenceDialog}
//                                     startIcon={<AddIcon />}
//                                 >
//                                     Добавить вещественное доказательство
//                                 </StyledButton>
//                             )}
//                             <PrintButton handlePrint={() => handlePrintGroupBarcode(selectedGroupId)} text={"Печать штрихкода"}/>
//                         </Box>
//                     )}
//                 </Box>

//                 {/* Таблица с группами и вещественными доказательствами */}
//                 <Box>
//                     {groups.map((group) => (
//                         <Accordion
//                             key={group.id}
//                             expanded={selectedGroupId === group.id}
//                             onChange={() => handleGroupSelect(group.id)}
//                         >
//                             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                                 <Box sx={{ display: 'flex', flexDirection: 'column' }}>
//                                     <Typography variant="h6">{group.name}</Typography>
//                                 </Box>
//                             </AccordionSummary>
//                             <AccordionDetails>
//                                 <TableContainer component={Paper}>
//                                     <Table aria-label={`Таблица ВД группы ${group.name}`}>
//                                         <TableHead>
//                                             <TableRow>
//                                                 <StyledTableCell>Название</StyledTableCell>
//                                                 <StyledTableCell>Описание</StyledTableCell>
//                                                 <StyledTableCell>Тип ВД</StyledTableCell>
//                                                 <StyledTableCell>Статус</StyledTableCell>
//                                                 <StyledTableCell>Действия</StyledTableCell>
//                                             </TableRow>
//                                         </TableHead>
//                                         <TableBody>
//                                             {group.material_evidences &&
//                                                 group.material_evidences.length > 0 ? (
//                                                 group.material_evidences.map((evidence) => (
//                                                     <TableRow key={evidence.id}>
//                                                         <TableCell>{evidence.name}</TableCell>
//                                                         <TableCell>{evidence.description}</TableCell>
//                                                         <TableCell>
//                                                             {getTypeLabel(evidence.type)} {/* Добавлено */}
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             {canEdit ? (
//                                                                 <FormControl fullWidth variant="standard">
//                                                                     <Select
//                                                                         value={evidence.status}
//                                                                         onChange={(event) => {
//                                                                             const selectedStatus =
//                                                                                 event.target.value;
//                                                                             if (
//                                                                                 evidence.status !== selectedStatus
//                                                                             ) {
//                                                                                 handleEvidenceStatusChange(
//                                                                                     evidence.id,
//                                                                                     selectedStatus
//                                                                                 );
//                                                                             }
//                                                                         }}
//                                                                     >
//                                                                         {evidenceStatuses.map((status) => (
//                                                                             <MenuItem
//                                                                                 key={status.value}
//                                                                                 value={status.value}
//                                                                             >
//                                                                                 {status.label}
//                                                                             </MenuItem>
//                                                                         ))}
//                                                                     </Select>
//                                                                 </FormControl>
//                                                             ) : (
//                                                                 evidence.status_display ||
//                                                                 evidenceStatuses.find(
//                                                                     (status) =>
//                                                                         status.value === evidence.status
//                                                                 )?.label ||
//                                                                 evidence.status
//                                                             )}
//                                                         </TableCell>
//                                                         <TableCell>
//                                                             <Tooltip title="Печать штрихкода">
//                                                                 <IconButton
//                                                                     color="primary"
//                                                                     onClick={() =>
//                                                                         handlePrintEvidenceBarcode(evidence)
//                                                                     }
//                                                                 >
//                                                                     <PrintIcon />
//                                                                 </IconButton>
//                                                             </Tooltip>
//                                                         </TableCell>
//                                                     </TableRow>
//                                                 ))
//                                             ) : (
//                                                 <TableRow>
//                                                     <TableCell colSpan={5} align="center">
//                                                         Нет вещественных доказательств.
//                                                     </TableCell>
//                                                 </TableRow>
//                                             )}
//                                         </TableBody>
//                                     </Table>
//                                 </TableContainer>
//                             </AccordionDetails>
//                         </Accordion>
//                     ))}
//                 </Box>
                
//                 {/* Диалоговое окно для добавления новой группы */}
//                 <DialogNewGroup openGroupDialog={openGroupDialog} setOpenGroupDialog={setOpenGroupDialog}
//                     setGroups={setGroups}
//                     setSnackbar={setSnackbar}
//                     groups={groups}
//                     id={id}
//                 />
                
//                 {/* Диалоговое окно для добавления нового вещественного доказательства */}
//                 <DialogNewEvidence openEvidenceDialog={openEvidenceDialog} setOpenEvidenceDialog={setOpenEvidenceDialog}
//                     setGroups={setGroups}
//                     selectedGroupId={selectedGroupId}
//                     setSnackbar={setSnackbar}
//                     id={id}
//                 />
//             </Box>

//             {/* Диалоговое окно для отображения штрихкода */}
//             <DialogSeenBarcode openBarcodeDialog={openBarcodeDialog}
//                 setOpenBarcodeDialog={setOpenBarcodeDialog}
//                 barcodeValueToDisplay={barcodeValueToDisplay}
//                 barcodeRef={barcodeRef}
//                 handlePrintBarcode={handlePrintBarcode}
//             />
//         </>
//     );
// }