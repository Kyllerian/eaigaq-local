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

import { useTheme } from '@mui/material/styles';
import { fieldLabels } from '../../constants/fieldsLabels';
import { evidenceStatuses } from '../../constants/evidenceStatuses';
import { StyledTableCell } from '../ui/StyledComponents';
import { formatDate } from '../../constants/formatDate';

export default function History({ changeLogs, }) {
    const theme = useTheme();
    // Получение отображаемого статуса
    const getStatusLabel = (value) => {
        const status = evidenceStatuses.find((status) => status.value === value);
        return status ? status.label : value;
    };

    // Получение сообщения действия
    const getActionMessage = (log) => {
        if (log.class_name === 'Case' && log.action === 'create') {
            return 'Создание дела';
        } else if (log.class_name === 'Case' && log.action === 'update') {
            return 'Изменение данных дела';
        } else if (
            log.class_name === 'MaterialEvidence' &&
            log.action === 'create'
        ) {
            return `Добавлено вещественное доказательство: ${log.object_name || ''}`;
        } else if (
            log.class_name === 'MaterialEvidence' &&
            log.action === 'update'
        ) {
            return `Изменение статуса вещественного доказательства: ${log.object_name || ''
                }`;
        } else {
            // Другие случаи
            return `${log.class_name_display} - ${log.action}`;
        }
    };
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