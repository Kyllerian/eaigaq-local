// frontend/src/components/Dashboard/Affairs/Table.js

import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
} from '@mui/material';
import Loading from '../../Loading';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../constants/formatDate';
import { ResizableTableCell, TableCellSx } from '../../ui/TableCell';
import { TableSortLabel } from '@mui/material';

export default function AffairsTable({ user, isLoading, cases, handleCaseSelect, selectedCase, sortConfig, setSortConfig }) {
    const navigate = useNavigate();

    // Состояние для ширины столбцов
    const initialColumnWidths = {
        name: 200,
        description: 250,
        investigator_name: 150,
        department_name: 150,
        created: 120,
        updated: 120,
    };

    const [columnWidths, setColumnWidths] = useState(initialColumnWidths);

    // Обработчики изменения ширины столбцов
    const handleResize = (columnId, newWidth) => {
        setColumnWidths((prevWidths) => ({
            ...prevWidths,
            [columnId]: newWidth,
        }));
    };

    // Определение колонок
    const columns = [
        { id: 'name', label: 'Название дела' },
        { id: 'description', label: 'Описание' },
        { id: 'investigator_name', label: 'Следователь' },
        ...(user && user.role === 'REGION_HEAD'
            ? [{ id: 'department_name', label: 'Отделение' }]
            : []),
        { id: 'created', label: 'Дата создания' },
        { id: 'updated', label: 'Дата обновления' },
    ];

    // Функция для обработки клика по заголовку столбца
    const handleSort = (columnId) => {
        let direction = 'asc';
        if (sortConfig.key === columnId && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: columnId, direction });
    };

    return (
        <>
            <Paper elevation={1}>
                <TableContainer sx={{ overflowX: 'auto' }}>
                    <Table
                        aria-label="Таблица дел"
                        stickyHeader
                        sx={{ tableLayout: 'fixed', minWidth: 650 }}
                    >
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <ResizableTableCell
                                        key={column.id}
                                        width={columnWidths[column.id]}
                                        onResize={(newWidth) => handleResize(column.id, newWidth)}
                                        style={{ minWidth: 50 }}
                                    >
                                        {['created', 'updated'].includes(column.id) ? (
                                            <TableSortLabel
                                                active={sortConfig.key === column.id}
                                                direction={sortConfig.direction}
                                                onClick={() => handleSort(column.id)}
                                            >
                                                {column.label}
                                            </TableSortLabel>
                                        ) : (
                                            column.label
                                        )}
                                    </ResizableTableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center">
                                        <Loading />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <>
                                    {cases.length > 0 ? (
                                        cases.map((caseItem) => (
                                            <TableRow
                                                key={caseItem.id}
                                                hover
                                                style={{ cursor: 'pointer' }}
                                                selected={selectedCase && selectedCase.id === caseItem.id}
                                                onClick={() => handleCaseSelect(caseItem)}
                                            >
                                                {/* Используем TableCellSx для обрезки текста */}
                                                <TableCellSx
                                                    sx={{
                                                        width: columnWidths['name'],
                                                        minWidth: 50,
                                                        maxWidth: columnWidths['name'],
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {caseItem.name}
                                                </TableCellSx>
                                                {/* Используем TableCellSx для описания */}
                                                <TableCellSx
                                                    sx={{
                                                        width: columnWidths['description'],
                                                        minWidth: 50,
                                                        maxWidth: columnWidths['description'],
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {caseItem.description}
                                                </TableCellSx>
                                                <TableCellSx
                                                    sx={{
                                                        width: columnWidths['investigator_name'],
                                                        minWidth: 50,
                                                        maxWidth: columnWidths['investigator_name'],
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {caseItem.investigator_name}
                                                </TableCellSx>
                                                {user && user.role === 'REGION_HEAD' && (
                                                    <TableCellSx
                                                        sx={{
                                                            width: columnWidths['department_name'],
                                                            minWidth: 50,
                                                            maxWidth: columnWidths['department_name'],
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                        }}
                                                    >
                                                        {caseItem.department_name || 'Не указано'}
                                                    </TableCellSx>
                                                )}
                                                <TableCellSx
                                                    sx={{
                                                        width: columnWidths['created'],
                                                        minWidth: 50,
                                                        maxWidth: columnWidths['created'],
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {formatDate(caseItem.created)}
                                                </TableCellSx>
                                                <TableCellSx
                                                    sx={{
                                                        width: columnWidths['updated'],
                                                        minWidth: 50,
                                                        maxWidth: columnWidths['updated'],
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {formatDate(caseItem.updated)}
                                                </TableCellSx>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} align="center">
                                                Нет результатов.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </>
    );
}

// // frontend/src/components/Dashboard/Affairs/Table.js
//
// import React, { useState } from 'react';
// import {
//     Paper,
//     Table,
//     TableContainer,
//     TableHead,
//     TableRow,
//     TableBody,
//     TableCell,
//
// } from '@mui/material';
// import Loading from '../../Loading';
// import { useNavigate } from 'react-router-dom';
// import { formatDate } from '../../../constants/formatDate';
// import { ResizableTableCell, TableCellSx, TableCellWrap } from '../../ui/TableCell';
//
// export default function AffairsTable({ user, isLoading, cases, setSnackbar }) {
//     const navigate = useNavigate();
//
//     // Состояние для ширины столбцов
//     const initialColumnWidths = {
//         name: 200,
//         description: 250,
//         investigator_name: 150,
//         department_name: 150,
//         created: 120,
//         updated: 120,
//     };
//
//     const [columnWidths, setColumnWidths] = useState(initialColumnWidths);
//
//     // Обработчики изменения ширины столбцов
//     const handleResize = (columnId, newWidth) => {
//         setColumnWidths((prevWidths) => ({
//             ...prevWidths,
//             [columnId]: newWidth,
//         }));
//     };
//
//     // Определение колонок
//     const columns = [
//         { id: 'name', label: 'Название дела' },
//         { id: 'description', label: 'Описание' },
//         { id: 'investigator_name', label: 'Следователь' },
//         ...(user && user.role === 'REGION_HEAD'
//             ? [{ id: 'department_name', label: 'Отделение' }]
//             : []),
//         { id: 'created', label: 'Дата создания' },
//         { id: 'updated', label: 'Дата обновления' },
//     ];
//
//     return (
//         <>
//             <Paper elevation={1}>
//                 <TableContainer sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
//                     <Table
//                         aria-label="Таблица дел"
//                         stickyHeader
//                         sx={{ tableLayout: 'fixed', minWidth: 650 }}
//                     >
//                         <TableHead>
//                             <TableRow>
//                                 {columns.map((column) => (
//                                     <ResizableTableCell
//                                         key={column.id}
//                                         width={columnWidths[column.id]}
//                                         onResize={(newWidth) => handleResize(column.id, newWidth)}
//                                         style={{ minWidth: 50 }}
//                                     >
//                                         {column.label}
//                                     </ResizableTableCell>
//                                 ))}
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {isLoading ? (
//                                 <TableRow>
//                                     <TableCell colSpan={columns.length} align="center">
//                                         <Loading />
//                                     </TableCell>
//                                 </TableRow>
//                             ) : (
//                                 <>
//                                     {cases.length > 0 ? (
//                                         cases.map((caseItem) => (
//                                             <TableRow
//                                                 key={caseItem.id}
//                                                 hover
//                                                 style={{ cursor: 'pointer' }}
//                                                 onClick={() => navigate(`/cases/${caseItem.id}/`)}
//                                             >
//                                                 {/* Используем TableCellSx для обрезки текста */}
//                                                 <TableCellSx
//                                                     sx={{
//                                                         width: columnWidths['name'],
//                                                         minWidth: 50,
//                                                         maxWidth: columnWidths['name'],
//                                                         whiteSpace: 'nowrap',
//                                                         overflow: 'hidden',
//                                                         textOverflow: 'ellipsis',
//                                                     }}
//                                                 >
//                                                     {caseItem.name}
//                                                 </TableCellSx>
//                                                 {/* Используем TableCellWrap для переноса текста */}
//                                                 <TableCellWrap
//                                                     sx={{
//                                                         width: columnWidths['description'],
//                                                         minWidth: 50,
//                                                         maxWidth: columnWidths['description'],
//                                                     }}
//                                                 >
//                                                     {caseItem.description}
//                                                 </TableCellWrap>
//                                                 <TableCellSx
//                                                     sx={{
//                                                         width: columnWidths['investigator_name'],
//                                                         minWidth: 50,
//                                                         maxWidth: columnWidths['investigator_name'],
//                                                         whiteSpace: 'nowrap',
//                                                         overflow: 'hidden',
//                                                         textOverflow: 'ellipsis',
//                                                     }}
//                                                 >
//                                                     {caseItem.investigator_name}
//                                                 </TableCellSx>
//                                                 {user && user.role === 'REGION_HEAD' && (
//                                                     <TableCellSx
//                                                         sx={{
//                                                             width: columnWidths['department_name'],
//                                                             minWidth: 50,
//                                                             maxWidth: columnWidths['department_name'],
//                                                             whiteSpace: 'nowrap',
//                                                             overflow: 'hidden',
//                                                             textOverflow: 'ellipsis',
//                                                         }}
//                                                     >
//                                                         {caseItem.department_name || 'Не указано'}
//                                                     </TableCellSx>
//                                                 )}
//                                                 <TableCellSx
//                                                     sx={{
//                                                         width: columnWidths['created'],
//                                                         minWidth: 50,
//                                                         maxWidth: columnWidths['created'],
//                                                         whiteSpace: 'nowrap',
//                                                         overflow: 'hidden',
//                                                         textOverflow: 'ellipsis',
//                                                     }}
//                                                 >
//                                                     {formatDate(caseItem.created)}
//                                                 </TableCellSx>
//                                                 <TableCellSx
//                                                     sx={{
//                                                         width: columnWidths['updated'],
//                                                         minWidth: 50,
//                                                         maxWidth: columnWidths['updated'],
//                                                         whiteSpace: 'nowrap',
//                                                         overflow: 'hidden',
//                                                         textOverflow: 'ellipsis',
//                                                     }}
//                                                 >
//                                                     {formatDate(caseItem.updated)}
//                                                 </TableCellSx>
//                                             </TableRow>
//                                         ))
//                                     ) : (
//                                         <TableRow>
//                                             <TableCell colSpan={columns.length} align="center">
//                                                 Нет результатов.
//                                             </TableCell>
//                                         </TableRow>
//                                     )}
//                                 </>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//             </Paper>
//         </>
//     );
// }
