// src/components/CaseInformationTab.js

import React from 'react';
import { Paper, Grid, TextField } from '@mui/material';
import { StyledButton } from './StyledComponents';
import axios from '../axiosConfig';

const CaseInformationTab = ({ caseItem, canEdit, setCaseItem, setSnackbar }) => {
  const handleInfoChange = (event) => {
    const { name, value } = event.target;
    setCaseItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleInfoSave = () => {
    axios
      .put(`/api/cases/${caseItem.id}/`, {
        name: caseItem.name,
        description: caseItem.description,
        active: caseItem.active,
      })
      .then((response) => {
        setCaseItem(response.data);
        setSnackbar({
          open: true,
          message: 'Дело успешно обновлено.',
          severity: 'success',
        });
      })
      .catch((error) => {
        console.error('Ошибка при обновлении дела:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при обновлении дела.',
          severity: 'error',
        });
      });
  };

  return (
    <Paper elevation={1} sx={{ padding: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Название дела"
            name="name"
            value={caseItem.name}
            onChange={handleInfoChange}
            fullWidth
            disabled={!canEdit}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Описание дела"
            name="description"
            value={caseItem.description}
            onChange={handleInfoChange}
            fullWidth
            multiline
            rows={4}
            disabled={!canEdit}
          />
        </Grid>
        {canEdit && (
          <Grid item xs={12} sx={{ textAlign: 'right' }}>
            <StyledButton onClick={handleInfoSave}>
              Сохранить изменения
            </StyledButton>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default CaseInformationTab;
