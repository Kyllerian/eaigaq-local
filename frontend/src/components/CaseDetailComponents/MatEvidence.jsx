import {
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel, // Добавлено
} from '@mui/material';

import {
    Add as AddIcon,
    ExpandMore as ExpandMoreIcon,
    Print as PrintIcon,
} from '@mui/icons-material';

import { styled, useTheme } from '@mui/material/styles';
import { evidenceStatuses } from '../../constants/evidenceStatuses';
import axios from '../../axiosConfig';
import { useRef, useState } from 'react';
import DialogSeenBarcode from './DialogSeenBarcode';
import { useReactToPrint } from 'react-to-print';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: '5px',
    textTransform: 'none',
    backgroundColor: '#1976d2',
    color: '#ffffff',
    '&:hover': {
        backgroundColor: '#0d47a1',
    },
    '&.Mui-disabled': {
        backgroundColor: '#cfd8dc',
        color: '#ffffff',
        opacity: 0.7,
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
}));

export default function CaseDetailMatEvidence({
    id, setGroups, setIsStatusUpdating, isStatusUpdating, setSnackbar, canEdit, canAddGroup, groups, }) {
    const theme = useTheme();
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [newGroup, setNewGroup] = useState({ name: '' });
    const [newEvidence, setNewEvidence] = useState({
      name: '',
      description: '',
      type: 'OTHER', // Добавлено
    });
    const [openGroupDialog, setOpenGroupDialog] = useState(false);
    const [openEvidenceDialog, setOpenEvidenceDialog] = useState(false);

    // Состояния для диалогового окна и значения штрихкода
    const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
    const [barcodeValueToDisplay, setBarcodeValueToDisplay] = useState('');
    const barcodeRef = useRef(); // Реф для печати штрихкода

    // Вкладка "Вещдоки"
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
                case: id,
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
                console.error(
                    'Ошибка при добавлении группы:',
                    error.response?.data || error
                );
                setSnackbar({
                    open: true,
                    message: 'Ошибка при добавлении группы.',
                    severity: 'error',
                });
            });
    };

    const handleGroupSelect = (groupId) => {
        setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
    };

    const handleOpenEvidenceDialog = () => {
        setOpenEvidenceDialog(true);
    };

    const handleCloseEvidenceDialog = () => {
        setOpenEvidenceDialog(false);
        setNewEvidence({ name: '', description: '', type: 'OTHER' }); // Добавлено сброс type
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
                case_id: id,
                group_id: selectedGroupId,
                type: newEvidence.type, // Добавлено
            })
            .then((response) => {
                // Обновляем список доказательств в группе
                setGroups((prevGroups) =>
                    prevGroups.map((group) =>
                        group.id === selectedGroupId
                            ? {
                                ...group,
                                material_evidences: [
                                    ...group.material_evidences,
                                    response.data,
                                ],
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
                console.error(
                    'Ошибка при добавлении вещественного доказательства:',
                    error.response?.data || error
                );
                setSnackbar({
                    open: true,
                    message: 'Ошибка при добавлении вещественного доказательства.',
                    severity: 'error',
                });
            });
    };



    // Получение отображаемого типа
    const getTypeLabel = (value) => {
        const type = EVIDENCE_TYPES.find((type) => type.value === value);
        return type ? type.label : value;
    };

    // Функция для изменения статуса вещественного доказательства
    const handleEvidenceStatusChange = (evidenceId, newStatus) => {
        if (isStatusUpdating) return; // Предотвращаем повторные запросы
        setIsStatusUpdating(true);

        axios
            .patch(`/api/material-evidences/${evidenceId}/`, { status: newStatus })
            .then((response) => {
                // Обновляем состояние групп с обновленным статусом вещественного доказательства
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
                    'Ошибка при обновлении статуса вещественного доказательства:',
                    error.response?.data || error
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

    // Функции для отображения и печати штрихкодов
    const handleOpenBarcodeDialog = (barcodeValue) => {
        if (!barcodeValue) {
            setSnackbar({
                open: true,
                message: 'Штрихкод недоступен.',
                severity: 'error',
            });
            return;
        }
        setBarcodeValueToDisplay(barcodeValue);
        setOpenBarcodeDialog(true);
    };

    const handlePrintEvidenceBarcode = (evidence) => {
        if (evidence.barcode) {
            handleOpenBarcodeDialog(evidence.barcode);
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
            handleOpenBarcodeDialog(group.barcode);
        } else {
            setSnackbar({
                open: true,
                message: 'Штрихкод группы недоступен.',
                severity: 'error',
            });
        }
    };

    return (
        <>
            <Box>
                {/* Кнопки над таблицей */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: theme.spacing(2),
                    }}
                >
                    {canAddGroup && (
                        <StyledButton
                            onClick={handleOpenGroupDialog}
                            startIcon={<AddIcon />}
                        >
                            Добавить группу
                        </StyledButton>
                    )}
                    {selectedGroupId && (
                        <Box sx={{ display: 'flex', gap: theme.spacing(2) }}>
                            {canAddGroup && (
                                <StyledButton
                                    onClick={handleOpenEvidenceDialog}
                                    startIcon={<AddIcon />}
                                >
                                    Добавить вещественное доказательство
                                </StyledButton>
                            )}
                            <StyledButton
                                onClick={() => handlePrintGroupBarcode(selectedGroupId)}
                                startIcon={<PrintIcon />}
                            >
                                Печать штрихкода
                            </StyledButton>
                        </Box>
                    )}
                </Box>

                {/* Таблица с группами и вещественными доказательствами */}
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
                                            {group.material_evidences &&
                                                group.material_evidences.length > 0 ? (
                                                group.material_evidences.map((evidence) => (
                                                    <TableRow key={evidence.id}>
                                                        <TableCell>{evidence.name}</TableCell>
                                                        <TableCell>{evidence.description}</TableCell>
                                                        <TableCell>
                                                            {getTypeLabel(evidence.type)} {/* Добавлено */}
                                                        </TableCell>
                                                        <TableCell>
                                                            {canEdit ? (
                                                                <FormControl fullWidth variant="standard">
                                                                    <Select
                                                                        value={evidence.status}
                                                                        onChange={(event) => {
                                                                            const selectedStatus =
                                                                                event.target.value;
                                                                            if (
                                                                                evidence.status !== selectedStatus
                                                                            ) {
                                                                                handleEvidenceStatusChange(
                                                                                    evidence.id,
                                                                                    selectedStatus
                                                                                );
                                                                            }
                                                                        }}
                                                                    >
                                                                        {evidenceStatuses.map((status) => (
                                                                            <MenuItem
                                                                                key={status.value}
                                                                                value={status.value}
                                                                            >
                                                                                {status.label}
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            ) : (
                                                                evidence.status_display ||
                                                                evidenceStatuses.find(
                                                                    (status) =>
                                                                        status.value === evidence.status
                                                                )?.label ||
                                                                evidence.status
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

                {/* Диалоговое окно для добавления новой группы */}
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
                        <Button onClick={handleCloseGroupDialog}>Отмена</Button>
                        <StyledButton onClick={handleGroupFormSubmit}>
                            Добавить
                        </StyledButton>
                    </DialogActions>
                </Dialog>

                {/* Диалоговое окно для добавления нового вещественного доказательства */}
                <Dialog
                    open={openEvidenceDialog}
                    onClose={handleCloseEvidenceDialog}
                >
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
                        <FormControl fullWidth margin="dense" required> {/* Добавлено */}
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
                        <Button onClick={handleCloseEvidenceDialog}>Отмена</Button>
                        <StyledButton onClick={handleEvidenceFormSubmit}>
                            Добавить
                        </StyledButton>
                    </DialogActions>
                </Dialog>
            </Box>

            {/* Диалоговое окно для отображения штрихкода */}
            <DialogSeenBarcode openBarcodeDialog={openBarcodeDialog}
                setOpenBarcodeDialog={setOpenBarcodeDialog}
                barcodeValueToDisplay={barcodeValueToDisplay}
                barcodeRef={barcodeRef}
                handlePrintBarcode={handlePrintBarcode}
            />
        </>
    );
}