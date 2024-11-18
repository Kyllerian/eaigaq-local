import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';

import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { formatDate } from '../../../constants/formatDate';
import { EVIDENCE_TYPES } from '../../../constants/evidenceTypes';
import { TableCellWrap } from '../../ui/TableCell';


export default function EvidenceReport({ evidenceReportRef, evidenceSearchQuery, evidenceTypeFilter, dateAddedFrom, dateAddedTo, evidenceExportData }) {

    return (
        <>
            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                <div
                    ref={evidenceReportRef}
                    style={{
                        padding: '20px',
                        fontFamily: 'Arial, sans-serif',
                        color: '#000',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img
                            src={LogoMVDKZ}
                            alt="Логотип"
                            style={{ maxWidth: '100px', marginBottom: '10px' }}
                        />
                        <Typography variant="h4" gutterBottom>
                            Отчет по вещественным доказательствам
                        </Typography>
                        <Typography variant="subtitle1">
                            Дата формирования отчета: {formatDate(new Date().toISOString())}
                        </Typography>
                    </div>

                    {/* Filters */}
                    <div style={{ marginBottom: '20px' }}>
                        {evidenceSearchQuery && (
                            <Typography variant="h6">
                                Поиск: {evidenceSearchQuery}
                            </Typography>
                        )}
                        {evidenceTypeFilter && (
                            <Typography variant="h6">
                                Тип ВД:{' '}
                                {EVIDENCE_TYPES.find(
                                    (type) => type.value === evidenceTypeFilter
                                )?.label || evidenceTypeFilter}
                            </Typography>
                        )}
                        {(dateAddedFrom || dateAddedTo) && (
                            <Typography variant="h6">
                                Дата добавления: {dateAddedFrom || '...'} -{' '}
                                {dateAddedTo || '...'}
                            </Typography>
                        )}
                    </div>

                    {/* Evidence Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                        <Table
                            aria-label="Отчет по вещественным доказательствам"
                            style={{
                                tableLayout: 'fixed',
                                width: '100%',
                                fontSize: '12px',
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <strong>Название ВД</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Описание ВД</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Тип ВД</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Дело</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Дата создания</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {evidenceExportData.map((evidence) => (
                                    <TableRow key={evidence.id}>
                                        <TableCellWrap>{evidence.name}</TableCellWrap>
                                        <TableCellWrap>{evidence.description}</TableCellWrap>
                                        <TableCellWrap>
                                            {EVIDENCE_TYPES.find(
                                                (type) => type.value === evidence.type
                                            )?.label || evidence.type}
                                        </TableCellWrap>
                                        <TableCellWrap>
                                            {evidence.case ? evidence.case.name : 'Не назначено'}
                                        </TableCellWrap>
                                        <TableCellWrap>{formatDate(evidence.created)}</TableCellWrap>
                                    </TableRow>
                                ))}
                                {evidenceExportData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Нет данных для отображения.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

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
