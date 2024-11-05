import {
    Paper,
    TextField,
    Grid,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import axios from '../../axiosConfig';
import { StyledButton } from '../ui/StyledComponents';
import { StyledTextFieldWithoutMargin } from '../ui/StyledTextfield';

export default function CaseDetailInfromation({ id, caseItem, canEdit, setCaseItem, setSnackbar }) {
    const theme = useTheme();
    const handleInfoChange = (event) => {
        const { name, value } = event.target;
        setCaseItem((prev) => ({ ...prev, [name]: value }));
    };

    const handleInfoSave = () => {
        axios
            .put(`/api/cases/${id}/`, {
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
        <>
            <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <StyledTextFieldWithoutMargin 
                            label="Название дела"
                            name="name"
                            
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
        </>
    );
}