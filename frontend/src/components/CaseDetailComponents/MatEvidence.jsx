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

export default function CaseDetailMatEvidence({ handleCloseEvidenceDialog, handleCloseGroupDialog, handleEvidenceInputChange,
    handleEvidenceStatusChange, handleGroupFormSubmit, handleEvidenceFormSubmit, handleGroupInputChange, handleGroupSelect, handleOpenEvidenceDialog,
    handleOpenGroupDialog, handlePrintEvidenceBarcode, handlePrintGroupBarcode, canEdit, canAddGroup, selectedGroupId, groups, getTypeLabel, 
    evidenceStatuses, openGroupDialog, openEvidenceDialog, newEvidence, newGroup, EVIDENCE_TYPES }) {
    const theme = useTheme();

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
        </>
    );
}