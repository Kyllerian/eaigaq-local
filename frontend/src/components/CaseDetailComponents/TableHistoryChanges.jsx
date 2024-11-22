import { forwardRef } from 'react';
import {
    Table,
    TableCell,
    TableRow,
    TableHead,
    TableBody,
} from '@mui/material';
import { TableCellWrap } from '../ui/TableCell';
import { formatDate } from '../../constants/formatDate';
import getActionMessage from '../../constants/getActionMessage';
import getStatusLabel from '../../constants/getStatusLabel';
import { StyledTableCell } from '../ui/StyledComponents';
import { fieldLabels } from '../../constants/fieldsLabels';


const TableHistoryChanges = forwardRef(({ changeLogs, ...props }, ref) => {
    return (
        <Table ref={ref} aria-label="Таблица истории изменений" {...props} >
            <TableHead>
                <TableRow>
                    <StyledTableCell sx={{ width: '15%' }}>Дата и время</StyledTableCell>
                    <StyledTableCell sx={{ width: '25%' }}>Пользователь</StyledTableCell>
                    <StyledTableCell sx={{ width: '30%' }}>Действие</StyledTableCell>
                    <StyledTableCell sx={{ width: '30%' }}>Изменения</StyledTableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {changeLogs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell>{formatDate(log.created)}</TableCell>
                        <TableCell>
                            {log.user ? log.user.full_name : 'Система'}
                        </TableCell>
                        <TableCellWrap>{getActionMessage(log)}</TableCellWrap>
                        <TableCell>
                            {(() => {
                                if (log.data && log.data.trim() !== '') {
                                    try {
                                        const data = JSON.parse(log.data);
                                        if (log.action === 'update') {
                                            console.log(data, 'data1')
                                            if ((log.fields).includes("investigator")) {
                                                const displayFields = [
                                                    'investigator',
                                                    'department',
                                                ];
                                                console.log(data, 'data2')
                                                return Object.entries(data).map(
                                                    ([field, values]) => {
                                                        console.log(displayFields.includes(field), 'field', field)
                                                        if (displayFields.includes(field)) {
                                                            return (
                                                                <div key={field}>
                                                                    <strong>
                                                                        {fieldLabels[field] || field}
                                                                    </strong>
                                                                    :{' '}
                                                                    {values.old}{' '}
                                                                    →{' '}
                                                                    {values.new}
                                                                </div>
                                                            );
                                                        } else {
                                                            return null;
                                                        }
                                                    }
                                                );
                                            } else {
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
                                            }
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
    )
})

TableHistoryChanges.displayName = "TableHistoryChanges";
export { TableHistoryChanges }