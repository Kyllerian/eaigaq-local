import {
    Button,
    TextField,
} from '@mui/material';

import axios from '../../../axiosConfig';
import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import { useState } from 'react';
import { StyledTextField } from '../../ui/StyledTextfield';


export default function DialogNewAffairs({ openCaseDialog, setOpenCaseDialog, setSnackbar, setCases, cases }) {
    const [newCase, setNewCase] = useState({ name: '', description: '' });
    
    const handleCloseCaseDialog = () => {
        setOpenCaseDialog(false);
        setNewCase({ name: '', description: '' });
    };

    
  const handleCaseInputChange = (event) => {
    const { name, value } = event.target;
    setNewCase({ ...newCase, [name]: value });
  };

  const handleCaseFormSubmit = (event) => {
    event.preventDefault();

    axios
      .post('/api/cases/', newCase)
      .then((response) => {
        const updatedCases = [...cases, response.data];
        setCases(updatedCases);
        handleCloseCaseDialog();
        setSnackbar({
          open: true,
          message: 'Дело успешно создано.',
          severity: 'success',
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: 'Ошибка при создании дела.',
          severity: 'error',
        });
      });
  };
    return (
        <>
            <DashboardDialog open={openCaseDialog} title={"Добавить новое дело"} setState={setNewCase} setOpen={setOpenCaseDialog} >
                {{
                    content: (
                        <>
                            <StyledTextField autoFocus 
                                label="Название дела"
                                name="name"
                                value={newCase.name}
                                onChange={handleCaseInputChange}    
                                required
                                inputProps={{ maxLength: 255 }}
                            />
                            {/* <TextField
                                autoFocus
                                margin="dense"
                                label="Название дела"
                                name="name"
                                value={newCase.name}
                                onChange={handleCaseInputChange}
                                fullWidth
                                required
                                inputProps={{ maxLength: 255 }}
                            /> */}
                            
                            <StyledTextField
                                label="Описание дела"
                                name="description"
                                value={newCase.description}
                                onChange={handleCaseInputChange}
                                required
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 1000 }}
                            />
                            {/* <TextField
                                margin="dense"
                                label="Описание дела"
                                name="description"
                                value={newCase.description}
                                onChange={handleCaseInputChange}
                                fullWidth
                                required
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 1000 }}
                            /> */}
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseCaseDialog}>Отмена</Button>
                            <StyledButton onClick={handleCaseFormSubmit}>
                                Создать
                            </StyledButton>
                        </>
                    )
                }}
            </DashboardDialog>
        </>
    );
}
