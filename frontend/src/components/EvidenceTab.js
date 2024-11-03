// src/components/EvidenceTab.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Tooltip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import axios from '../axiosConfig';
import { evidenceStatuses } from '../constants/evidenceStatuses';
import { EVIDENCE_TYPES } from '../constants/evidenceTypes';
import { StyledButton } from './StyledComponents';
import BiometricDialog from './BiometricDialog';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

const EvidenceTab = ({
  caseId,
  user,
  groups,
  setGroups,
  canAddGroup,
  canEdit,
  setSnackbar,
  setChangeLogs,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '' });
  const [newEvidence, setNewEvidence] = useState({
    name: '',
    description: '',
    type: 'OTHER',
  });
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openEvidenceDialog, setOpenEvidenceDialog] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Состояния для биометрии
  const [biometricDialogOpen, setBiometricDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Локальное состояние для статусов вещественных доказательств
  const [evidenceStatusesState, setEvidenceStatusesState] = useState({});

  // Состояния для отображения и печати штрихкода
  const [openBarcodeDisplayDialog, setOpenBarcodeDisplayDialog] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const barcodeRef = useRef();

  // Функция для печати штрихкода
  const handlePrintBarcode = useReactToPrint({
    content: () => barcodeRef.current,
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
        #barcode-print {
          width: 58mm;
          height: 40mm;
          padding: 6.36mm;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #barcode-print svg {
          width: auto;
          height: 70%;
        }
      }
    `,
  });

  // Инициализируем состояние статусов при изменении групп
  useEffect(() => {
    const initialStatuses = {};
    groups.forEach((group) => {
      group.material_evidences.forEach((evidence) => {
        initialStatuses[evidence.id] = evidence.status;
      });
    });
    setEvidenceStatusesState(initialStatuses);
  }, [groups]);

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
  };

  // Функции для биометрии
  const handleOpenBiometricDialog = (action) => {
    setPendingAction(action);
    setBiometricDialogOpen(true);
    setIsAuthenticating(true);
  };

  const handleBiometricSuccess = () => {
    setBiometricDialogOpen(false);
    setIsAuthenticating(false);

    if (pendingAction === 'addGroup') {
      handleOpenGroupDialog();
    } else if (pendingAction === 'addEvidence') {
      handleOpenEvidenceDialog();
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

  // Добавление группы
  const handleAddGroup = () => {
    handleOpenBiometricDialog('addGroup');
  };

  const handleOpenGroupDialog = () => {
    setOpenGroupDialog(true);
  };

  const handleCloseGroupDialog = () => {
    setOpenGroupDialog(false);
    setNewGroup({ name: '' });
  };

  const handleGroupInputChange = (event) => {
    const { name, value } = event.target;
    setNewGroup({ ...newGroup, [name]: value });
  };

  const handleGroupFormSubmit = (event) => {
    event.preventDefault();

    axios
      .post('/api/evidence-groups/', {
        name: newGroup.name,
        case: caseId,
      })
      .then((response) => {
        setGroups([...groups, response.data]);
        handleCloseGroupDialog();
        setSnackbar({
          open: true,
          message: 'Группа успешно добавлена.',
          severity: 'success',
        });
      })
      .catch((error) => {
        console.error('Ошибка при добавлении группы:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при добавлении группы.',
          severity: 'error',
        });
      });
  };

  // Добавление вещественного доказательства
  const handleAddEvidence = () => {
    handleOpenBiometricDialog('addEvidence');
  };

  const handleOpenEvidenceDialog = () => {
    setOpenEvidenceDialog(true);
  };

  const handleCloseEvidenceDialog = () => {
    setOpenEvidenceDialog(false);
    setNewEvidence({ name: '', description: '', type: 'OTHER' });
  };

  const handleEvidenceInputChange = (event) => {
    const { name, value } = event.target;
    setNewEvidence({ ...newEvidence, [name]: value });
  };

  const handleEvidenceFormSubmit = (event) => {
    event.preventDefault();

    axios
      .post('/api/material-evidences/', {
        name: newEvidence.name,
        description: newEvidence.description,
        case_id: caseId,
        group_id: selectedGroupId,
        type: newEvidence.type,
      })
      .then((response) => {
        // Обновляем группу с новым вещественным доказательством
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === selectedGroupId
              ? {
                  ...group,
                  material_evidences: [...group.material_evidences, response.data],
                }
              : group
          )
        );
        handleCloseEvidenceDialog();
        setSnackbar({
          open: true,
          message: 'Вещественное доказательство добавлено.',
          severity: 'success',
        });
      })
      .catch((error) => {
        console.error('Ошибка при добавлении вещественного доказательства:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при добавлении вещественного доказательства.',
          severity: 'error',
        });
      });
  };

  // Изменение статуса вещественного доказательства
  const handleEvidenceStatusChange = (evidenceId, newStatus) => {
    handleOpenBiometricDialog({ action: 'changeStatus', evidenceId, newStatus });
  };

  const performEvidenceStatusChange = (evidenceId, newStatus) => {
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

        // Обновляем историю изменений после изменения статуса
        if (setChangeLogs) {
          axios
            .get(`/api/audit-entries/?case_id=${caseId}`)
            .then((response) => {
              setChangeLogs(response.data);
            })
            .catch((error) => {
              console.error('Ошибка при обновлении истории изменений:', error);
              setSnackbar({
                open: true,
                message: 'Ошибка при обновлении истории изменений.',
                severity: 'error',
              });
            });
        }

        setSnackbar({
          open: true,
          message: 'Статус вещественного доказательства обновлен.',
          severity: 'success',
        });
      })
      .catch((error) => {
        console.error(
          'Ошибка при обновлении статуса вещественного доказательства:',
          error
        );
        setSnackbar({
          open: true,
          message: 'Ошибка при обновлении статуса вещественного доказательства.',
          severity: 'error',
        });
      })
      .finally(() => {
        setIsStatusUpdating(false);
      });
  };

  const getStatusLabel = (value) => {
    const status = evidenceStatuses.find((status) => status.value === value);
    return status ? status.label : value;
  };

  const getTypeLabel = (value) => {
    const type = EVIDENCE_TYPES.find((type) => type.value === value);
    return type ? type.label : value;
  };

  // Функция для печати штрихкода группы
  const handlePrintGroupBarcode = (group) => {
    const barcodeValue = group.barcode;
    if (barcodeValue) {
      setScannedBarcode(barcodeValue);
      setOpenBarcodeDisplayDialog(true);
    } else {
      setSnackbar({
        open: true,
        message: 'Штрихкод группы недоступен.',
        severity: 'error',
      });
    }
  };

  // Функция для печати штрихкода вещественного доказательства
  const handlePrintEvidenceBarcode = (evidence) => {
    const barcodeValue = evidence.barcode;
    if (barcodeValue) {
      setScannedBarcode(barcodeValue);
      setOpenBarcodeDisplayDialog(true);
    } else {
      setSnackbar({
        open: true,
        message: 'Штрихкод вещественного доказательства недоступен.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      {/* Кнопки */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        {canAddGroup && (
          <StyledButton
            onClick={handleAddGroup}
            startIcon={<AddIcon />}
            disabled={isAuthenticating}
          >
            Добавить группу
          </StyledButton>
        )}
        {selectedGroupId && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {canAddGroup && (
              <StyledButton
                onClick={handleAddEvidence}
                startIcon={<AddIcon />}
                disabled={isAuthenticating}
              >
                Добавить вещественное доказательство
              </StyledButton>
            )}
            {/* Кнопка печати штрихкода группы */}
            <StyledButton
              onClick={() => {
                const group = groups.find((g) => g.id === selectedGroupId);
                if (group) handlePrintGroupBarcode(group);
              }}
              startIcon={<PrintIcon />}
              disabled={isAuthenticating}
            >
              Печать штрихкода группы
            </StyledButton>
          </Box>
        )}
      </Box>

      {/* Группы и вещественные доказательства */}
      <Box>
        {groups.map((group) => (
          <Accordion
            key={group.id}
            expanded={selectedGroupId === group.id}
            onChange={() => handleGroupSelect(group.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">{group.name}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* Верхняя часть с кнопкой печати штрихкода группы */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  Вещественные доказательства:
                </Typography>
                <Tooltip title="Печать штрихкода группы">
                  <IconButton
                    color="primary"
                    onClick={() => handlePrintGroupBarcode(group)}
                  >
                    <PrintIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <TableContainer component={Paper}>
                <Table aria-label={`Таблица ВД группы ${group.name}`}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>Описание</TableCell>
                      <TableCell>Тип ВД</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.material_evidences && group.material_evidences.length > 0 ? (
                      group.material_evidences.map((evidence) => (
                        <TableRow key={evidence.id}>
                          <TableCell>{evidence.name}</TableCell>
                          <TableCell>{evidence.description}</TableCell>
                          <TableCell>{getTypeLabel(evidence.type)}</TableCell>
                          <TableCell>
                            {canEdit ? (
                              <FormControl fullWidth variant="standard">
                                <Select
                                  value={
                                    evidenceStatusesState[evidence.id] || evidence.status
                                  }
                                  onChange={(event) => {
                                    const selectedStatus = event.target.value;
                                    if (
                                      evidenceStatusesState[evidence.id] !== selectedStatus
                                    ) {
                                      setEvidenceStatusesState((prevState) => ({
                                        ...prevState,
                                        [evidence.id]: selectedStatus,
                                      }));
                                      handleEvidenceStatusChange(
                                        evidence.id,
                                        selectedStatus
                                      );
                                    }
                                  }}
                                >
                                  {evidenceStatuses.map((status) => (
                                    <MenuItem key={status.value} value={status.value}>
                                      {status.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            ) : (
                              evidence.status_display || getStatusLabel(evidence.status)
                            )}
                          </TableCell>
                          <TableCell>
                            {/* Кнопка печати штрихкода ВД */}
                            <Tooltip title="Печать штрихкода ВД">
                              <IconButton
                                color="primary"
                                onClick={() => handlePrintEvidenceBarcode(evidence)}
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
      </Box>

      {/* Диалоговое окно для добавления группы */}
      <Dialog open={openGroupDialog} onClose={handleCloseGroupDialog}>
        <DialogTitle>Добавить группу</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название группы"
            name="name"
            value={newGroup.name}
            onChange={handleGroupInputChange}
            fullWidth
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGroupDialog} sx={{ fontWeight: 'bold' }}>
            Отмена
          </Button>
          <StyledButton onClick={handleGroupFormSubmit}>Добавить</StyledButton>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно для добавления вещественного доказательства */}
      <Dialog open={openEvidenceDialog} onClose={handleCloseEvidenceDialog}>
        <DialogTitle>Добавить вещественное доказательство</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название ВД"
            name="name"
            value={newEvidence.name}
            onChange={handleEvidenceInputChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Описание ВД"
            name="description"
            value={newEvidence.description}
            onChange={handleEvidenceInputChange}
            fullWidth
            multiline
            rows={4}
          />
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="evidence-type-label">Тип ВД</InputLabel>
            <Select
              labelId="evidence-type-label"
              label="Тип ВД"
              name="type"
              value={newEvidence.type}
              onChange={handleEvidenceInputChange}
            >
              {EVIDENCE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEvidenceDialog} sx={{ fontWeight: 'bold' }}>
            Отмена
          </Button>
          <StyledButton onClick={handleEvidenceFormSubmit}>Добавить</StyledButton>
        </DialogActions>
      </Dialog>

      {/* Диалоговое окно для отображения и печати штрихкода */}
      <Dialog
        open={openBarcodeDisplayDialog}
        onClose={() => setOpenBarcodeDisplayDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Штрихкод</DialogTitle>
        <DialogContent
          sx={{
            textAlign: 'center',
            padding: 2,
          }}
        >
          {scannedBarcode && (
            <div id="barcode-display">
              <Barcode
                value={scannedBarcode}
                format="EAN13"
                displayValue={false}
                margin={0}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBarcodeDisplayDialog(false)}>Закрыть</Button>
          <StyledButton onClick={handlePrintBarcode}>Печать</StyledButton>
        </DialogActions>
      </Dialog>

      {/* Скрытый компонент штрихкода для печати */}
      {scannedBarcode && (
        <div style={{ display: 'none' }}>
          <div id="barcode-print" ref={barcodeRef}>
            <Barcode
              value={scannedBarcode}
              format="EAN13"
              displayValue={false}
              margin={0}
            />
          </div>
        </div>
      )}

      {/* Диалоговое окно биометрической аутентификации */}
      <BiometricDialog
        open={biometricDialogOpen}
        onClose={() => {
          setBiometricDialogOpen(false);
          handleBiometricError('Аутентификация была отменена.');
        }}
        onSuccess={handleBiometricSuccess}
      />
    </Box>
  );
};

export default EvidenceTab;