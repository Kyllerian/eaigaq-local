// frontend/src/components/Dashboard/Affairs/DialogNewAffairs.js

import {
    Button,
} from '@mui/material';

import axios from '../../../axiosConfig';
import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import { useState } from 'react';
import { StyledTextField } from '../../ui/StyledTextfield';
import { useMutation, useQueryClient } from 'react-query';
import { useTranslation } from 'react-i18next';

export default function DialogNewAffairs({ openCaseDialog, setOpenCaseDialog, setSnackbar }) {
    const { t } = useTranslation();
    const [newCase, setNewCase] = useState({ name: '', description: '' });

    const queryClient = useQueryClient();

    const handleCloseCaseDialog = () => {
        setOpenCaseDialog(false);
        setNewCase({ name: '', description: '' });
    };

    const handleCaseInputChange = (event) => {
        const { name, value } = event.target;
        setNewCase({ ...newCase, [name]: value });
    };

    // Используем useMutation для создания нового дела
    const createCaseMutation = useMutation(
        (newCaseData) => axios.post('/api/cases/', newCaseData),
        {
            onSuccess: (response) => {
                // Инвалидация и рефетч запросов, связанных с делами
                queryClient.invalidateQueries('cases');
                handleCloseCaseDialog();
                setSnackbar({
                    open: true,
                    message: t('dashboard.tabs.cases.dialog_new_affairs.success_case_created'),
                    severity: 'success',
                });
            },
            onError: (error) => {
                console.error(t('dashboard.tabs.cases.dialog_new_affairs.error_create_case'), error.response?.data || error);
                setSnackbar({
                    open: true,
                    message:
                        error.response?.data?.detail ||
                        t('dashboard.tabs.cases.dialog_new_affairs.error_create_case'),
                    severity: 'error',
                });
            },
        }
    );

    const handleCaseFormSubmit = (event) => {
        event.preventDefault();

        // Валидация формы
        if (!newCase.name.trim() || !newCase.description.trim()) {
            setSnackbar({
                open: true,
                message: t('common.errors.error_fill_required_fields'),
                severity: 'warning',
            });
            return;
        }

        // Запускаем мутацию для создания нового дела
        createCaseMutation.mutate(newCase);
    };

    return (
        <DashboardDialog
            open={openCaseDialog}
            title={t('dashboard.tabs.cases.dialog_new_affairs.dialog_title')}
            setState={setNewCase}
            setOpen={setOpenCaseDialog}
        >
            {{
                content: (
                    <>
                        <StyledTextField
                            autoFocus
                            label={t('cases.case_name_label')}
                            name="name"
                            value={newCase.name}
                            onChange={handleCaseInputChange}
                            required
                            inputProps={{ maxLength: 255 }}
                        />

                        <StyledTextField
                            label={t('cases.case_description_label')}
                            name="description"
                            value={newCase.description}
                            onChange={handleCaseInputChange}
                            required
                            multiline
                            rows={4}
                            inputProps={{ maxLength: 1000 }}
                        />
                    </>
                ),
                actions: (
                    <>
                        <Button onClick={handleCloseCaseDialog}>{t('common.buttons.cancel')}</Button>
                        <StyledButton
                            onClick={handleCaseFormSubmit}
                            disabled={createCaseMutation.isLoading}
                        >
                            {createCaseMutation.isLoading ? t('common.buttons.creating')
                                : t('common.buttons.create')}
                        </StyledButton>
                    </>
                )
            }}
        </DashboardDialog>
    );
}
