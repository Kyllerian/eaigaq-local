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

export default function DialogAlertNewStatus({ open, setOpenAlertNewStatusDialog, SubmitChangeEvidenceStatus,evidenceId, newStatus, setSnackbar, id }) {

    const handleCloseDialog = () => {
        setOpenAlertNewStatusDialog(false);
    };

    const handleFormSubmit = (event) => {
        event.preventDefault();
        SubmitChangeEvidenceStatus(evidenceId, newStatus);
        handleCloseDialog();
    };
    return (
        <>
            <StyledDialog title={"Изменить статус вещдока"} open={open} setOpen={setOpenAlertNewStatusDialog} >
                {{
                    content: (
                        <>
                            <p>Уверены, что хотите изменить статус на уничтожен?
                                Это нельзя будет изменить!!!
                            </p>
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseDialog}>Отмена</Button>
                            <StyledButton onClick={handleFormSubmit}>Подтвердить</StyledButton>
                        </>
                    )
                }}
            </StyledDialog>
        </>
    );
}