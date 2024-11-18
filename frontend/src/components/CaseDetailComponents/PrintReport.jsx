import {
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';

import LogoMVDKZ from '../../assets/Logo_MVD_KZ.webp';
import { fieldLabels } from '../../constants/fieldsLabels';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import { evidenceStatuses } from '../../constants/evidenceStatuses';
import { StyledTableCell } from '../ui/StyledComponents';
import { formatDate } from '../../constants/formatDate';
import { TableCellWrap } from '../ui/TableCell';

export default function PrintReport({ caseItem, changeLogs, reportRef, groups, canViewHistory }) {
    // Получение отображаемого типа
    const getTypeLabel = (value) => {
        const type = EVIDENCE_TYPES.find((type) => type.value === value);
        return type ? type.label : value;
    };
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
            <div style={{ display: 'none' }}>
                <div
                    ref={reportRef}
                    style={{
                        padding: '20px',
                        fontFamily: 'Arial, sans-serif',
                        color: '#000',
                        fontSize: '12px', // Уменьшили шрифт
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img
                            src={LogoMVDKZ}
                            alt="Логотип"
                            style={{ maxWidth: '100px', marginBottom: '10px' }}
                        />
                        <Typography variant="h5" gutterBottom>
                            Отчет по делу
                        </Typography>
                        <Typography variant="subtitle1">
                            Дата формирования отчета: {formatDate(new Date().toISOString())}
                        </Typography>
                    </div>

                    {/* Информация о деле */}
                    <div style={{ marginBottom: '20px' }}>
                        <Typography variant="body1">
                            <strong>Название дела:</strong> {caseItem.name}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Описание:</strong> {caseItem.description}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Следователь:</strong>{' '}
                            {caseItem.investigator.full_name || 'Неизвестно'}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Регион:</strong>{' '}
                            {caseItem.department.region_display || 'Неизвестно'}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Отделение:</strong>{' '}
                            {caseItem.department.name || 'Неизвестно'}
                        </Typography>
                    </div>

                    {/* Вещественные доказательства */}
                    <div style={{ marginBottom: '20px' }}>
                        <Typography variant="h6" gutterBottom>
                            Вещественные доказательства
                        </Typography>
                        {groups.map((group) => (
                            <Box key={group.id} mb={2}>
                                <Typography variant="subtitle1">{group.name}</Typography>
                                <TableContainer
                                    component={Paper}
                                    style={{ boxShadow: 'none' }}
                                >
                                    <Table
                                        aria-label={`Таблица ВД группы ${group.name}`}
                                        style={{
                                            tableLayout: 'fixed',
                                            width: '100%',
                                            fontSize: '12px',
                                        }}
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ width: '25%' }}>
                                                    <strong>Название</strong>
                                                </TableCell>
                                                <TableCell style={{ width: '25%' }}>
                                                    <strong>Описание</strong>
                                                </TableCell>
                                                <TableCell style={{ width: '20%' }}>
                                                    <strong>Тип ВД</strong> {/* Добавлено */}
                                                </TableCell>
                                                <TableCell style={{ width: '30%' }}>
                                                    <strong>Статус</strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {group.material_evidences &&
                                                group.material_evidences.length > 0 ? (
                                                group.material_evidences.map((evidence) => (
                                                    <TableRow key={evidence.id}>
                                                        <TableCellWrap>
                                                            {evidence.name}
                                                        </TableCellWrap>
                                                        <TableCellWrap>
                                                            {evidence.description}
                                                        </TableCellWrap>
                                                        <TableCellWrap>
                                                            {getTypeLabel(evidence.type)}
                                                        </TableCellWrap>
                                                        <TableCellWrap>
                                                            {getStatusLabel(evidence.status)}
                                                        </TableCellWrap>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} align="center">
                                                        Нет вещественных доказательств.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        ))}
                    </div>

                    {/* История изменений */}
                    {canViewHistory && (
                        <div
                            style={{
                                pageBreakBefore: 'always',
                                marginBottom: '20px',
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                История изменений
                            </Typography>
                            <TableContainer
                                component={Paper}
                                style={{ boxShadow: 'none' }}
                            >
                                <Table
                                    aria-label="Таблица истории изменений"
                                    style={{
                                        tableLayout: 'fixed',
                                        width: '100%',
                                        fontSize: '12px',
                                    }}
                                >
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
                                                <TableCellWrap>{formatDate(log.created)}</TableCellWrap>
                                                <TableCellWrap>
                                                    {log.user ? log.user.full_name : 'Система'}
                                                </TableCellWrap>
                                                <TableCellWrap>{getActionMessage(log)}</TableCellWrap>
                                                <TableCellWrap>
                                                    {(() => {
                                                        if (log.data && log.data.trim() !== '') {
                                                            try {
                                                                const data = JSON.parse(log.data);
                                                                if (log.action === 'update') {
                                                                    const displayFields = [
                                                                        'name',
                                                                        'description',
                                                                        'status',
                                                                        'type', // Добавлено
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
                                                                                            : field === 'type'
                                                                                                ? getTypeLabel(values.old)
                                                                                                : values.old}{' '}
                                                                                        →{' '}
                                                                                        {field === 'status'
                                                                                            ? getStatusLabel(values.new)
                                                                                            : field === 'type'
                                                                                                ? getTypeLabel(values.new)
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
                                                                        'type', // Добавлено
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
                                                                                                    : field === 'type'
                                                                                                        ? getTypeLabel(value)
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
                                                </TableCellWrap>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}

                    {/* Footer */}
                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <Typography variant="body2">
                            © {new Date().getFullYear()} Министерство внутренних дел Республики
                            Казахстан.
                        </Typography>
                    </div>
                </div>
            </div>
        </>
    );
}