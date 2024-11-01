import {
    Typography,
    Container,
    Box,
    Button,
    Tabs,
    Tab,
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
    Snackbar,
    Alert,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Tooltip,
    Select,
    MenuItem,
    FormControl,
    InputLabel, // Добавлено
} from '@mui/material';

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

export default function CaseDetailInfromation({ caseItem, handleInfoChange, canEdit, handleInfoSave }) {
    const theme = useTheme();

    return (
        <>
            <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
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
        </>
    );
}