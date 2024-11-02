import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';

import { styled, useTheme } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
}));

// Форматирование даты
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return date.toLocaleDateString('ru-RU', options);
};

export default function History({ changeLogs, getActionMessage, fieldLabels, getStatusLabel }) {
    const theme = useTheme();

    return (
        <>
            <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
                <Typography variant="h6" gutterBottom>
                    История изменений
                </Typography>
                <TableContainer component={Paper}>
                    <Table aria-label="Таблица истории изменений">
                        <TableHead>
                            <TableRow>
                                <StyledTableCell>Дата и время</StyledTableCell>
                                <StyledTableCell>Пользователь</StyledTableCell>
                                <StyledTableCell>Действие</StyledTableCell>
                                <StyledTableCell>Изменения</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {changeLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{formatDate(log.created)}</TableCell>
                                    <TableCell>
                                        {log.user ? log.user.full_name : 'Система'}
                                    </TableCell>
                                    <TableCell>{getActionMessage(log)}</TableCell>
                                    <TableCell>
                                        {(() => {
                                            if (log.data && log.data.trim() !== '') {
                                                try {
                                                    const data = JSON.parse(log.data);
                                                    if (log.action === 'update') {
                                                        const displayFields = [
                                                            'name',
                                                            'description',
                                                            'status',
                                                        ];
                                                        return Object.entries(data).map(
                                                            ([field, values]) => {
                                                                if (displayFields.includes(field)) {
                                                                    return (
                                                                        <div key={field}>
                                                                            <strong>
                                                                                {fieldLabels[field] || field}
                                                                            </strong>
                                                                            :{' '}
                                                                            {field === 'status'
                                                                                ? getStatusLabel(values.old)
                                                                                : values.old}{' '}
                                                                            →{' '}
                                                                            {field === 'status'
                                                                                ? getStatusLabel(values.new)
                                                                                : values.new}
                                                                        </div>
                                                                    );
                                                                } else {
                                                                    return null;
                                                                }
                                                            }
                                                        );
                                                    } else if (log.action === 'create') {
                                                        const displayFields = [
                                                            'name',
                                                            'description',
                                                            'status',
                                                        ];
                                                        return (
                                                            <div>
                                                                {Object.entries(data).map(
                                                                    ([field, value]) => {
                                                                        if (displayFields.includes(field)) {
                                                                            return (
                                                                                <div key={field}>
                                                                                    <strong>
                                                                                        {fieldLabels[field] || field}
                                                                                    </strong>
                                                                                    :{' '}
                                                                                    {field === 'status'
                                                                                        ? getStatusLabel(value)
                                                                                        : value}
                                                                                </div>
                                                                            );
                                                                        } else {
                                                                            return null;
                                                                        }
                                                                    }
                                                                )}
                                                            </div>
                                                        );
                                                    } else if (log.action === 'delete') {
                                                        return <div>Объект был удален.</div>;
                                                    } else {
                                                        return 'Нет данных об изменениях.';
                                                    }
                                                } catch (error) {
                                                    console.error(
                                                        'Ошибка парсинга данных лога:',
                                                        error
                                                    );
                                                    return 'Нет данных об изменениях.';
                                                }
                                            } else {
                                                return 'Нет данных об изменениях.';
                                            }
                                        })()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </>
    );
}