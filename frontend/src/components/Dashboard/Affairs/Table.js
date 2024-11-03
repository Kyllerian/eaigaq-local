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


export default function AffairsTable({ user, cases, handleCaseSelect, selectedCase }) {

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
                            {cases.map((caseItem) => (
                                <TableRow
                                    key={caseItem.id}
                                    hover
                                    selected={
                                        selectedCase && selectedCase.id === caseItem.id
                                    }
                                    onClick={() => handleCaseSelect(caseItem)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {caseItem.name}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {caseItem.description}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {caseItem.creator_name}
                                    </TableCell>
                                    {user && user.role === 'REGION_HEAD' && (
                                        <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {caseItem.department_name ||
                                                (caseItem.department &&
                                                    caseItem.department.name) ||
                                                'Не указано'}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </>
    );
}
