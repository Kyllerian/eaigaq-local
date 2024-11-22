import {
    Typography,
    TableContainer,
    Paper,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { TableHistoryChanges } from './TableHistoryChanges';

export default function History({ changeLogs, }) {
    const theme = useTheme();

    return (
        <>
            <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
                <Typography variant="h6" gutterBottom>
                    История изменений
                </Typography>
                <TableContainer component={Paper}>
                    <TableHistoryChanges changeLogs={changeLogs}  />
                </TableContainer>
            </Paper>
        </>
    );
}