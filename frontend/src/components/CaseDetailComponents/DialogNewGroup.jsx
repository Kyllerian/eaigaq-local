// frontend/src/components/CaseDetailComponents/DialogNewGroup.jsx

import { Button } from '@mui/material';
import { StyledButton } from '../ui/StyledComponents';
import { useState } from 'react';
import axios from '../../axiosConfig';
import StyledDialog from '../ui/StyledDialog';
import { StyledTextField } from '../ui/StyledTextfield';
import { useTranslation } from 'react-i18next';

export default function DialogNewGroup({ open, setOpenGroupDialog, setGroups, setSnackbar, groups, id, caseItem }) {
    const { t } = useTranslation();
    const [newGroup, setNewGroup] = useState({ storage_place: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleCloseGroupDialog = () => {
        setOpenGroupDialog(false);
        setNewGroup({ storage_place: '' });
    };

    const handleGroupInputChange = (event) => {
        const { name, value } = event.target;
        setNewGroup({ ...newGroup, [name]: value });
    };

    const handleGroupFormSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            // Получаем evidence_group_count из caseItem
            const evidenceGroupCount = caseItem.department.evidence_group_count || 0;

            // Генерируем название группы
            const groupName = `Группа${evidenceGroupCount + 1}`;

            // Создаём новую группу
            const response = await axios.post('/api/evidence-groups/', {
                name: groupName,
                storage_place: newGroup.storage_place,
                case: id,
            });

            // Обновляем evidence_group_count в caseItem на фронте
            caseItem.department.evidence_group_count = evidenceGroupCount + 1;

            // Обновляем список групп на фронте
            setGroups([...groups, response.data]);

            handleCloseGroupDialog();
            setSnackbar({
                open: true,
                message: t('common.success.success_add_group'),
                severity: 'success',
            });
        } catch (error) {
            console.error(t('common.errors.error_add_group'), error.response?.data || error);
            setSnackbar({
                open: true,
                message: t('common.errors.error_add_group'),
                severity: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <StyledDialog title={t('case_detail.tabs.evidence.button_add_group')} open={open} setOpen={setOpenGroupDialog} setState={setNewGroup}>
            {{
                content: (
                    <StyledTextField
                        label={t('case_detail.tabs.evidence.label_storage_place')}
                        name="storage_place"
                        value={newGroup.storage_place}
                        onChange={handleGroupInputChange}
                        required
                    />
                ),
                actions: (
                    <>
                        <Button onClick={handleCloseGroupDialog}>{t('common.buttons.cancel')}</Button>
                        <StyledButton onClick={handleGroupFormSubmit} disabled={isLoading}>
                            {t('common.buttons.add')}
                        </StyledButton>
                    </>
                ),
            }}
        </StyledDialog>
    );
}