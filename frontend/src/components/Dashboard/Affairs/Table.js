import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    Box,
} from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { StyledTableCell } from '../../ui/StyledComponents';
import { TableCellSx } from '../../ui/TableCell';
import { formatDate } from '../../../constants/formatDate';
import { PaginationStyled } from '../../ui/PaginationUI';
import calculateRowsPerPage from '../../../constants/calculateRowsPerPage';

export default function AffairsTable({ user, cases, handleCaseSelect, selectedCase, filteredCases }) {
    // Состояние для пагинации
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Начальное значение, будет пересчитано
    const [totalPages, setTotalPages] = useState(1);

    // Рефы для измерения высоты строки и таблицы
    const tableContainerRef = useRef(null);
    const tableRowRef = useRef(null);

    // Обработчик изменения страницы
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Вызываем вычисление при монтировании и при изменении размеров окна
    useEffect(() => {
        calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage);
        window.addEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage));
        return () => {
            window.removeEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage));
        };
    }, [filteredCases]);

    // Пагинированные данные
    const paginatedCases = filteredCases.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <>
            {/* Таблица с делами */}
            <Paper elevation={1}>
                <TableContainer ref={tableContainerRef}>
                    <Table
                        aria-label="Таблица дел"
                        sx={{ tableLayout: 'fixed', minWidth: 650 }}
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '20%' }}>
                                    Название дела
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '30%' }}>
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
                                <StyledTableCell sx={{ width: '25%' }}>
                                    Дата создания
                                </StyledTableCell>

                                <StyledTableCell sx={{ width: '25%' }}>
                                    Дата обновления
                                </StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedCases.map((caseItem, index) => (
                                <TableRow
                                    key={caseItem.id}
                                    hover
                                    selected={selectedCase && selectedCase.id === caseItem.id}
                                    onClick={() => handleCaseSelect(caseItem)}
                                    style={{ cursor: 'pointer' }}
                                    ref={index === 0 ? tableRowRef : null} // Реф на первую строку
                                >
                                    <TableCellSx component="th" scope="row">
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
                                    )}
                                    <TableCellSx>
                                        {formatDate(caseItem.created)}
                                    </TableCellSx>
                                    <TableCellSx>
                                        {formatDate(caseItem.updated)}
                                    </TableCellSx>
                                </TableRow>
                            ))}
                            {paginatedCases.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={user && user.role === 'REGION_HEAD' ? 4 : 3} align="center">
                                        Нет результатов.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Компонент пагинации */}
                {totalPages > 1 && (
                    <PaginationStyled totalPages={totalPages} page={page} handleChangePage={handleChangePage} />
                )}
            </Paper>
        </>
    );
}

// import {
//     Paper,
//     Table,
//     TableContainer,
//     TableHead,
//     TableRow,
//     TableBody,
//     TableCell,
// } from '@mui/material';

// import { StyledTableCell } from '../../ui/StyledComponents';
// import { TableCellSx } from '../../ui/TableCell';


// export default function AffairsTable({ user, cases, handleCaseSelect, selectedCase, filteredCases }) {

//     return (
//         <>
//             {/* Таблица с делами */}
//             <Paper elevation={1}>
//                 <TableContainer>
//                     <Table
//                         aria-label="Таблица дел"
//                         sx={{ tableLayout: 'fixed', minWidth: 650 }}
//                     >
//                         <TableHead>
//                             <TableRow>
//                                 <StyledTableCell sx={{ width: '20%' }}>
//                                     Название дела
//                                 </StyledTableCell>
//                                 <StyledTableCell sx={{ width: '50%' }}>
//                                     Описание
//                                 </StyledTableCell>
//                                 <StyledTableCell sx={{ width: '15%' }}>
//                                     Следователь
//                                 </StyledTableCell>
//                                 {user && user.role === 'REGION_HEAD' && (
//                                     <StyledTableCell sx={{ width: '15%' }}>
//                                         Отделение
//                                     </StyledTableCell>
//                                 )}
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {filteredCases.map((caseItem) => (
//                                 <TableRow
//                                     key={caseItem.id}
//                                     hover
//                                     selected={selectedCase && selectedCase.id === caseItem.id}
//                                     onClick={() => handleCaseSelect(caseItem)}
//                                     style={{ cursor: 'pointer' }}
//                                 >
//                                     <TableCellSx
//                                         component="th"
//                                         scope="row"
//                                     >
//                                         {caseItem.name}
//                                     </TableCellSx>
//                                     <TableCellSx>
//                                         {caseItem.description}
//                                     </TableCellSx>
//                                     <TableCellSx>
//                                         {caseItem.creator_name}
//                                     </TableCellSx>
//                                     {user && user.role === 'REGION_HEAD' && (
//                                         <TableCellSx>
//                                             {caseItem.department_name ||
//                                                 (caseItem.department && caseItem.department.name) ||
//                                                 'Не указано'}
//                                         </TableCellSx>
//                                         // <TableCell
//                                         //     sx={{
//                                         //         whiteSpace: 'nowrap',
//                                         //         overflow: 'hidden',
//                                         //         textOverflow: 'ellipsis',
//                                         //     }}
//                                         // >
//                                         //     {caseItem.department_name ||
//                                         //         (caseItem.department && caseItem.department.name) ||
//                                         //         'Не указано'}
//                                         // </TableCell>
//                                     )}
//                                 </TableRow>
//                             ))}
//                             {filteredCases.length === 0 && (
//                                 <TableRow>
//                                     <TableCell colSpan={user && user.role === 'REGION_HEAD' ? 4 : 3} align="center">
//                                         Нет результатов.
//                                     </TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Paper>

//         </>
//     );
// }
