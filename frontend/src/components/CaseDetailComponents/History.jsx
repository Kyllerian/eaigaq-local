import {
    Typography,
    Paper,
    Box,
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import { TableHistoryChanges } from './TableHistoryChanges';
import { useTranslation } from 'react-i18next';

export default function History({ changeLogs, }) {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
            <Typography variant="h6" gutterBottom>
                {t('common.report.titles.history_title')}
            </Typography>

            <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <Paper sx={{ width: '100%', mt: 2, p: 2, boxShadow: 3, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                    <TableHistoryChanges changeLogs={changeLogs} />
                </Paper>
            </Box>
        </Paper>
    );
}