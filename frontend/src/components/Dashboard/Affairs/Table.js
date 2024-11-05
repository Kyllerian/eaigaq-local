import {
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@mui/material';

import { StyledTableCell } from '../../ui/StyledComponents';
import { TableCellSx } from '../../ui/TableCell';


export default function AffairsTable({ user, cases, handleCaseSelect, selectedCase, filteredCases }) {

    return (
        <>
            {/* Таблица с делами */}
            <Paper elevation={1}>
                <TableContainer>
                    <Table
                        aria-label="Таблица дел"
                        sx={{ tableLayout: 'fixed', minWidth: 650 }}
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '20%' }}>
                                    Название дела
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '50%' }}>
                                    Описание
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>
                                    Следователь
                                </StyledTableCell>
                                {user && user.role === 'REGION_HEAD' && (
                                    <StyledTableCell sx={{ width: '15%' }}>
                                        Отделение
                                    </StyledTableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCases.map((caseItem) => (
                                <TableRow
                                    key={caseItem.id}
                                    hover
                                    selected={selectedCase && selectedCase.id === caseItem.id}
                                    onClick={() => handleCaseSelect(caseItem)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCellSx
                                        component="th"
                                        scope="row"
                                    >
                                        {caseItem.name}
                                    </TableCellSx>
                                    <TableCellSx>
                                        {caseItem.description}
                                    </TableCellSx>
                                    <TableCellSx>
                                        {caseItem.creator_name}
                                    </TableCellSx>
                                    {user && user.role === 'REGION_HEAD' && (
                                        <TableCellSx>
                                            {caseItem.department_name ||
                                                (caseItem.department && caseItem.department.name) ||
                                                'Не указано'}
                                        </TableCellSx>
                                        // <TableCell
                                        //     sx={{
                                        //         whiteSpace: 'nowrap',
                                        //         overflow: 'hidden',
                                        //         textOverflow: 'ellipsis',
                                        //     }}
                                        // >
                                        //     {caseItem.department_name ||
                                        //         (caseItem.department && caseItem.department.name) ||
                                        //         'Не указано'}
                                        // </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {filteredCases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={user && user.role === 'REGION_HEAD' ? 4 : 3} align="center">
                                        Нет результатов.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

        </>
    );
}
