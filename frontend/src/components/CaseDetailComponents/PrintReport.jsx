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

import { styled } from '@mui/material/styles';
import LogoMVDKZ from '../../assets/Logo_MVD_KZ.png';

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

export default function PrintReport({ caseItem, changeLogs, getActionMessage, fieldLabels, getStatusLabel, reportRef, groups, getTypeLabel, canViewHistory }) {

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
                                                        <TableCell
                                                            style={{
                                                                width: '25%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {evidence.name}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: '25%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {evidence.description}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: '20%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {getTypeLabel(evidence.type)} {/* Добавлено */}
                                                        </TableCell>
                                                        <TableCell
                                                            style={{
                                                                width: '30%',
                                                                wordBreak: 'break-word',
                                                                whiteSpace: 'normal',
                                                            }}
                                                        >
                                                            {getStatusLabel(evidence.status)}
                                                        </TableCell>
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
                                                </TableCell>
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