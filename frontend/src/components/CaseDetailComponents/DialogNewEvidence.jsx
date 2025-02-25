// src\components\CaseDetailComponents\DialogNewEvidence.jsx
import {
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

import { StyledButton } from '../ui/StyledComponents';
import { useState } from 'react';
import axios from '../../axiosConfig';
import { useEvidenceTypes } from '../../constants/evidenceTypes';
import StyledDialog from '../ui/StyledDialog';
import { StyledTextField } from '../ui/StyledTextfield';
import { useTranslation } from 'react-i18next';

export default function DialogNewEvidence({ open, setOpenEvidenceDialog, setGroups, selectedGroupId, setSnackbar, id }) {
    const { t } = useTranslation();
    const EVIDENCE_TYPES = useEvidenceTypes();

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
                    message: t('common.success.success_add_evidence'),
                    severity: 'success',
                });
            })
            .catch((error) => {
                console.error(
                    t('common.errors.error_add_evidence'),
                    error.response?.data || error
                );
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_add_evidence'),
                    severity: 'error',
                });
            });
    };
    return (
        <>
            {/* Диалоговое окно для добавления новой группы */}
            <StyledDialog title={t('case_detail.tabs.evidence.button_add_evidence')} open={open} setOpen={setOpenEvidenceDialog} setState={setNewEvidence} >
                {{
                    content: (
                        <>
                            <StyledTextField autoFocus label={t('common.table_headers.name_evidence')} name="name" value={newEvidence.name} onChange={handleEvidenceInputChange} required />
                            <StyledTextField label={t('common.table_headers.description_evidence')} name="description" value={newEvidence.description} onChange={handleEvidenceInputChange} multiline rows={4} />
                            <FormControl fullWidth margin="dense" required> {/* Добавлено */}
                                <InputLabel id="evidence-type-label">{t('common.standard.label_evidence_type')}</InputLabel>
                                <Select
                                    labelId="evidence-type-label"
                                    label={t('common.standard.label_evidence_type')}
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
                            <Button onClick={handleCloseEvidenceDialog}>{t('common.buttons.cancel')}</Button>
                            <StyledButton onClick={handleEvidenceFormSubmit}>{t('common.buttons.add')}</StyledButton>
                        </>
                    )
                }}
            </StyledDialog>
        </>
    );
}