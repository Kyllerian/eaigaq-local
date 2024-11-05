import {
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

import { StyledButton } from '../ui/StyledComponents';
import { useState } from 'react';
import axios from '../../axiosConfig';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import StyledDialog from '../ui/StyledDialog';
import { StyledTextField } from '../ui/StyledTextfield';

export default function DialogNewEvidence({ open, setOpenEvidenceDialog, setGroups, selectedGroupId, setSnackbar, id }) {
    const [newEvidence, setNewEvidence] = useState({
        name: '',
        description: '',
        type: 'OTHER', // Добавлено
    });

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
    return (
        <>
            {/* Диалоговое окно для добавления новой группы */}
            <StyledDialog title={"Добавить вещественное доказательство"} open={open} setOpen={setOpenEvidenceDialog} setState={setNewEvidence} >
                {{
                    content: (
                        <>
                            <StyledTextField autoFocus label="Название ВД" name="name" value={newEvidence.name} onChange={handleEvidenceInputChange} required />
                            {/* <TextField
                                autoFocus
                                margin="dense"
                                label="Название ВД"
                                name="name"
                                value={newEvidence.name}
                                onChange={handleEvidenceInputChange}
                                fullWidth
                                required
                            /> */}
                            <StyledTextField label="Описание ВД" name="description" value={newEvidence.description} onChange={handleEvidenceInputChange} multiline rows={4} />
                            {/* <TextField
                                margin="dense"
                                label="Описание ВД"
                                name="description"
                                value={newEvidence.description}
                                onChange={handleEvidenceInputChange}
                                fullWidth
                                multiline
                                rows={4}
                            /> */}
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
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseEvidenceDialog}>Отмена</Button>
                            <StyledButton onClick={handleEvidenceFormSubmit}>Добавить</StyledButton>
                        </>
                    )
                }}
            </StyledDialog>
        </>
    );
}