// frontend/src/components/CaseDetailComponents/MatEvidence.jsx

import React, {
  useRef,
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
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Print as PrintIcon,
  GetApp as GetAppIcon, // Иконка для скачивания
} from '@mui/icons-material';
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

  // Реф для печати штрихкода
  const barcodeRef = useRef();

  // Состояния для биометрии
  const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Получаем текущего пользователя из контекста
  const { user } = useContext(AuthContext);
  // Проверяем, содержит ли имя пользователя подстроку "archive"
  const isArchiveUser = user?.username?.toLowerCase().includes('archive');

  // 🆕 Состояние для хранения документов
  const [documents, setDocuments] = useState([]);
  const [isRevalidate, setIsRevalidate] = useState(false);

  // 🆕 Загружаем документы при монтировании компонента
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
        console.error('Ошибка при получении документов:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при загрузке документов.',
          severity: 'error',
        });
      });
  }, [id, setSnackbar, isRevalidate]);

  // Функции для биометрии
  const handleOpenBiometricDialog = (action) => {
    if (isArchiveUser) {
      // Если пользователь "archive", выполняем действие без биометрии
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
      // Иначе запускаем биометрическую аутентификацию
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
        message: 'Штрихкод недоступен.',
        severity: 'error',
      });
    }
  };

  // ТУТ НИЧЕГО НЕ МЕНЯТЬ!
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
          align-items: center;
          justify-content: center;
        }
        #barcode-wrapper {
          position: relative;
          display: inline-block;
        }
        #barcode-wrapper svg {
          display: block;
        }
        #left-text, #right-text {
          display: block !important;
          position: absolute;
          bottom: -12px;
          font-size: 14px;
          text-align: center;
          transform: translateX(-50%);
        }
        #left-text {
          left: 25%;
        }
        #right-text {
          left: 75%;
        }
      }
    `,
  });

  const handlePrintGroupBarcode = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (group && group.barcode) {
      handleDialogOpen('openBarcodeDialog', group.barcode, '', group.name);
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
    if ('DESTROYED' === newStatus || 'TAKEN' === newStatus) {
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
              message: 'Статус вещественного доказательства обновлен.',
              severity: 'success',
            });
          })
          .catch((error) => {
            console.error(
              'Ошибка при обновлении статуса:',
              error.response?.data || error
            );
            setSnackbar({
              open: true,
              message:
                'Ошибка при обновлении статуса вещественного доказательства.',
              severity: 'error',
            });
          })
          .finally(() => {
            setIsStatusUpdating(false);
          });
      };

      if (documentId) {
        // Сначала обновляем документ, добавляя ссылку на вещественное доказательство
        axios
          .patch(`/api/documents/${documentId}/`, { material_evidence_id: evidenceId })
          .then((response) => {
            console.log('Документ успешно обновлен:', response.data);
            // После успешного обновления документа обновляем статус вещественного доказательства
            updateEvidenceStatus();
            setIsRevalidate(true);
          })
          .catch((error) => {
            console.error('Ошибка при обновлении документа:', error);
            setSnackbar({
              open: true,
              message: 'Ошибка при обновлении документа.',
              severity: 'error',
            });
            setIsStatusUpdating(false);
          });
      } else {
        // Если документ не выбран, просто обновляем статус
        updateEvidenceStatus();
      }
    },
    [isStatusUpdating, setGroups, setSnackbar, setIsStatusUpdating]
  );

  return (
    <Box>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', mb: theme.spacing(2) }}
      >
        {canAddGroup && (
          <StyledButton
            onClick={() => handleOpenBiometricDialog('openGroupDialog')}
            startIcon={<AddIcon />}
            disabled={isAuthenticating}
          >
            <span
              style={{
                height: '1ex',
                overflow: 'visible',
                lineHeight: '1ex',
                verticalAlign: 'bottom',
              }}
            >
              Добавить группу
            </span>
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
                <span
                  style={{
                    height: '1ex',
                    overflow: 'visible',
                    lineHeight: '1ex',
                    verticalAlign: 'bottom',
                  }}
                >
                  Добавить вещественное доказательство
                </span>
              </StyledButton>
            )}
            <PrintButton
              handlePrint={() => handlePrintGroupBarcode(selectedGroupId)}
              text="Печать штрихкода"
              disabled={isAuthenticating}
            />
          </Box>
        )}
      </Box>

      {groups.map((group) => (
        <Accordion
          key={group.id}
          expanded={selectedGroupId === group.id}
          onChange={() => toggleGroupSelect(group.id)}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6">{group.name}</Typography>
              <Typography variant="body2">
                Место хранения: {group.storage_place}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table aria-label={`Таблица ВД группы ${group.name}`}>
                <TableHead>
                  <TableRow>
                    <StyledTableCell sx={{ width: '20%' }}>Название</StyledTableCell>
                    <StyledTableCell sx={{ width: '30%' }}>Описание</StyledTableCell>
                    <StyledTableCell sx={{ width: '10%' }}>Тип ВД</StyledTableCell>
                    <StyledTableCell sx={{ width: '30%' }}>Статус</StyledTableCell>
                    <StyledTableCell sx={{ width: '10%' }}>Действия</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.material_evidences.length > 0 ? (
                    group.material_evidences.map((evidence) => {
                      // 🆕 Находим документ, связанный с вещественным доказательством
                      const associatedDocument = documents.find(
                        (doc) => doc.material_evidence === evidence.id
                      );

                      return (
                        <TableRow key={evidence.id}>
                          <TableCell>{evidence.name}</TableCell>
                          <TableCell>{evidence.description}</TableCell>
                          <TableCell>
                            {
                              EVIDENCE_TYPES.find(
                                (type) => type.value === evidence.type
                              )?.label || evidence.type
                            }
                          </TableCell>
                          <TableCell>
                            {canEdit ? (
                              <FormControl fullWidth variant="standard">
                                <Select
                                  value={evidence.status}
                                  disabled={'DESTROYED' === evidence.status || 'TAKEN' === evidence.status}
                                  onChange={(event) =>
                                    handleEvidenceStatusChange(
                                      evidence.id,
                                      event.target.value
                                    )
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
                              evidenceStatuses.find(
                                (status) => status.value === evidence.status
                              )?.label || evidence.status
                            )}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center' }}>
                            {evidence.status === 'DESTROYED' || evidence.status === 'TAKEN' ? (
                              associatedDocument ? (
                                <Tooltip title="Скачать документ">
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
                                <Typography variant="body2">Нет документа</Typography>
                              )
                            ) : (
                              <Tooltip title="Печать штрихкода">
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
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Нет вещественных доказательств.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
          id={id} // Передаем ID дела для получения документов
        />
      </Suspense>

      {/* Диалоговое окно для отображения штрихкода */}
      <DialogSeenBarcode
        open={dialogStates.openBarcodeDialog}
        setOpenBarcodeDialog={(open) =>
          setDialogStates((prev) => ({ ...prev, openBarcodeDialog: open }))
        }
        barcodeValueToDisplay={dialogStates.barcodeValueToDisplay}
        barcodeRef={barcodeRef}
        handlePrintBarcode={handlePrintBarcode}
        groupName={dialogStates.currentGroupName}
      />

      {/* Диалоговое окно биометрической аутентификации */}
      {biometricDialogOpen && !isArchiveUser && (
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

// // frontend/src/components/CaseDetailComponents/MatEvidence.jsx
//
// import React, { useRef, useState, lazy, Suspense, useCallback, useContext } from 'react';
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
// } from '@mui/icons-material';
// import { useTheme } from '@mui/material/styles';
// import { evidenceStatuses } from '../../constants/evidenceStatuses';
// import axios from '../../axiosConfig';
// import { useReactToPrint } from 'react-to-print';
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
//   // Реф для печати штрихкода
//   const barcodeRef = useRef();
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
//   // Функции для биометрии
//   const handleOpenBiometricDialog = (action) => {
//     console.log('handleOpenBiometricDialog documentId', action);
//
//     if (isArchiveUser) {
//       // Если пользователь "archive", выполняем действие без биометрии
//       if (action === 'openGroupDialog' || action === 'openEvidenceDialog') {
//         handleDialogOpen(action);
//       } else if (action.action === 'changeStatus') {
//         performEvidenceStatusChange(action.evidenceId, action.newStatus, action.documentId);
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
//     if (pendingAction === 'openGroupDialog' || pendingAction === 'openEvidenceDialog') {
//       handleDialogOpen(pendingAction);
//     } else if (pendingAction.action === 'changeStatus') {
//       performEvidenceStatusChange(pendingAction.evidenceId, pendingAction.newStatus, pendingAction.file);
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
//   // ТУТ НИЧЕГО НЕ МЕНЯТЬ!
//   const handlePrintBarcode = useReactToPrint({
//     contentRef: barcodeRef,
//     documentTitle: 'Штрихкод',
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
//           align-items: center;
//           justify-content: center;
//         }
//         #barcode-wrapper {
//           position: relative;
//           display: inline-block;
//         }
//         #barcode-wrapper svg {
//           display: block;
//         }
//         #left-text, #right-text {
//           display: block !important;
//           position: absolute;
//           bottom: -12px;
//           font-size: 14px;
//           text-align: center;
//           transform: translateX(-50%);
//         }
//         #left-text {
//           left: 25%;
//         }
//         #right-text {
//           left: 75%;
//         }
//       }
//     `,
//   });
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
//     if ('DESTROYED' === newStatus) {
//       handleDialogOpen('openAlertNewStatus', evidenceId, newStatus);
//     } else {
//       handleOpenBiometricDialog({ action: 'changeStatus', evidenceId, newStatus });
//     }
//   };
//
//   const SubmitChangeEvidenceStatus = (evidenceId, newStatus, documentId) => {
//     console.log('SubmitChangeEvidenceStatus documentId', documentId);
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
//       console.log(documentId, 'documentId')
//       if (documentId) {
//         // Сначала обновляем документ, добавляя ссылку на вещественное доказательство
//         axios
//             .patch(`/api/documents/${documentId}/`, {material_evidence_id: evidenceId})
//             .then((response) => {
//               console.log('Документ успешно обновлен:', response.data);
//               // После успешного обновления документа обновляем статус вещественного доказательства
//               updateEvidenceStatus();
//             })
//             .catch((error) => {
//               console.error('Ошибка при обновлении документа:', error);
//               setSnackbar({
//                 open: true,
//                 message: 'Ошибка при обновлении документа.',
//                 severity: 'error',
//               });
//               setIsStatusUpdating(false);
//             });
//       } else {
//         // Если документ не выбран, просто обновляем статус
//         updateEvidenceStatus();
//       }
//     },
//       [isStatusUpdating, setGroups, setSnackbar, setIsStatusUpdating]
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
//                     group.material_evidences.map((evidence) => (
//                       <TableRow key={evidence.id}>
//                         <TableCell>{evidence.name}</TableCell>
//                         <TableCell>{evidence.description}</TableCell>
//                         <TableCell>
//                           {
//                             EVIDENCE_TYPES.find(
//                               (type) => type.value === evidence.type
//                             )?.label || evidence.type
//                           }
//                         </TableCell>
//                         <TableCell>
//                           {canEdit ? (
//                             <FormControl fullWidth variant="standard">
//                               <Select
//                                 value={evidence.status}
//                                 disabled={'DESTROYED' === evidence.status}
//                                 onChange={(event) =>
//                                   handleEvidenceStatusChange(
//                                     evidence.id,
//                                     event.target.value
//                                   )
//                                 }
//                               >
//                                 {evidenceStatuses.map((status) => (
//                                   <MenuItem key={status.value} value={status.value}>
//                                     {status.label}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             </FormControl>
//                           ) : (
//                             evidenceStatuses.find(
//                               (status) => status.value === evidence.status
//                             )?.label || evidence.status
//                           )}
//                         </TableCell>
//                         <TableCell sx={{ textAlign: 'center' }}>
//                           <Tooltip title="Печать штрихкода">
//                             <IconButton
//                               color="primary"
//                               onClick={() =>
//                                 handlePrintEvidenceBarcode(evidence, group.name)
//                               }
//                             >
//                               <PrintIcon />
//                             </IconButton>
//                           </Tooltip>
//                         </TableCell>
//                       </TableRow>
//                     ))
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
//         barcodeRef={barcodeRef}
//         handlePrintBarcode={handlePrintBarcode}
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
