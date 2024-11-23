import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from '@mui/material';
import { StyledTableCell } from '../../ui/StyledComponents';
import { ResizableTableCell, TableCellSx } from '../../ui/TableCell';
import { formatDate } from '../../../constants/formatDate';
import { PaginationStyled } from '../../ui/PaginationUI';
import calculateRowsPerPage from '../../../constants/calculateRowsPerPage';
import Loading from '../../Loading';

export default function AffairsTable({ user, isLoading, handleCaseSelect, selectedCase, filteredCases }) {
    // Состояние для пагинации
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Начальное значение, будет пересчитано
    const [totalPages, setTotalPages] = useState(1);

    // Состояние для ширины столбцов
    const initialColumnWidths = {
        name: 200,
        description: 200,
        creator_name: 100,
        department_name: 150,
        created: 100,
        updated: 100,
    };

    const [columnWidths, setColumnWidths] = useState(initialColumnWidths);

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
        const handleResize = () => {
            calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage);
        };
        setPage(1);
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [filteredCases]);

    // Пагинированные данные
    const paginatedCases = filteredCases.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    // Обработчики изменения ширины столбцов
    const handleResize = (columnId, newWidth) => {
        setColumnWidths((prevWidths) => ({
            ...prevWidths,
            [columnId]: newWidth,
        }));
    };

    return (
        <>
            {/* Таблица с делами */}
            <Paper elevation={1}>
                <TableContainer ref={tableContainerRef} style={{ overflowX: 'auto' }}>
                    <Table
                        aria-label="Таблица дел"
                        sx={{ minWidth: 650 }} // Установите минимальную ширину, чтобы таблица не сжималась слишком сильно
                    >
                        <TableHead>
                            <TableRow>
                                <ResizableTableCell
                                    width={columnWidths.name}
                                    onResize={(newWidth) => handleResize('name', newWidth)}
                                >
                                    Название дела
                                </ResizableTableCell>
                                <ResizableTableCell
                                    width={columnWidths.description}
                                    onResize={(newWidth) => handleResize('description', newWidth)}
                                >
                                    Описание
                                </ResizableTableCell>
                                <ResizableTableCell
                                    width={columnWidths.creator_name}
                                    onResize={(newWidth) => handleResize('creator_name', newWidth)}
                                >
                                    Следователь
                                </ResizableTableCell>
                                {user && user.role === 'REGION_HEAD' && (
                                    <ResizableTableCell
                                        width={columnWidths.department_name}
                                        onResize={(newWidth) => handleResize('department_name', newWidth)}
                                    >
                                        Отделение
                                    </ResizableTableCell>
                                )}
                                <ResizableTableCell
                                    width={columnWidths.created}
                                    onResize={(newWidth) => handleResize('created', newWidth)}
                                >
                                    Дата создания
                                </ResizableTableCell>
                                <ResizableTableCell
                                    width={columnWidths.updated}
                                    onResize={(newWidth) => handleResize('updated', newWidth)}
                                >
                                    Дата обновления
                                </ResizableTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading ? (
                                <Loading />
                            ) : (
                                <>
                                    {paginatedCases.map((caseItem, index) => (
                                        <TableRow
                                            key={caseItem.id}
                                            hover
                                            selected={selectedCase && selectedCase.id === caseItem.id}
                                            onClick={() => handleCaseSelect(caseItem)}
                                            style={{ cursor: 'pointer' }}
                                            ref={index === 0 ? tableRowRef : null} // Реф на первую строку
                                        >
                                            <TableCellSx
                                                style={{
                                                    width: columnWidths.name,
                                                    minWidth: columnWidths.name,
                                                    maxWidth: columnWidths.name,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {caseItem.name}
                                            </TableCellSx>
                                            <TableCellSx
                                                style={{
                                                    width: columnWidths.description,
                                                    minWidth: columnWidths.description,
                                                    maxWidth: columnWidths.description,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {caseItem.description}
                                            </TableCellSx>
                                            <TableCellSx
                                                style={{
                                                    width: columnWidths.creator_name,
                                                    minWidth: columnWidths.creator_name,
                                                    maxWidth: columnWidths.creator_name,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                            >
                                                {caseItem.creator_name}
                                            </TableCellSx>
                                            {user && user.role === 'REGION_HEAD' && (
                                                <TableCellSx
                                                    style={{
                                                        width: columnWidths.department_name,
                                                        minWidth: columnWidths.department_name,
                                                        maxWidth: columnWidths.department_name,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {caseItem.department_name ||
                                                        (caseItem.department && caseItem.department.name) ||
                                                        'Не указано'}
                                                </TableCellSx>
                                            )}
                                            <TableCellSx
                                                style={{
                                                    width: columnWidths.created,
                                                    minWidth: columnWidths.created,
                                                    maxWidth: columnWidths.created,
                                                }}
                                            >
                                                {formatDate(caseItem.created)}
                                            </TableCellSx>
                                            <TableCellSx
                                                style={{
                                                    width: columnWidths.updated,
                                                    minWidth: columnWidths.updated,
                                                    maxWidth: columnWidths.updated,
                                                }}
                                            >
                                                {formatDate(caseItem.updated)}
                                            </TableCellSx>
                                        </TableRow>
                                    ))}
                                    {paginatedCases.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={user && user.role === 'REGION_HEAD' ? 6 : 5}
                                                align="center"
                                            >
                                                Нет результатов.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Компонент пагинации */}
                {totalPages > 1 && (
                    <PaginationStyled
                        totalPages={totalPages}
                        page={page}
                        handleChangePage={handleChangePage}
                    />
                )}
            </Paper>
        </>
    );
}

// import React, { useState, useEffect, useRef } from 'react';
// import {
//     Paper,
//     Table,
//     TableContainer,
//     TableHead,
//     TableRow,
//     TableCell,
//     TableBody,
// } from '@mui/material';
// import { ResizableTableCell, TableCellSx } from '../../ui/TableCell';
// import { formatDate } from '../../../constants/formatDate';
// import { PaginationStyled } from '../../ui/PaginationUI';
// import calculateRowsPerPage from '../../../constants/calculateRowsPerPage';
// import Loading from '../../Loading';

// export default function AffairsTable({ user, isLoading, handleCaseSelect, selectedCase, filteredCases }) {
//     // Состояние для пагинации
//     const [page, setPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(10); // Начальное значение, будет пересчитано
//     const [totalPages, setTotalPages] = useState(1);

//     // Состояние для ширины столбцов
//     const initialColumnWidths = {
//         name: 200,
//         description: 250,
//         creator_name: 15,
//         department_name: 150,
//         created: 150,
//         updated: 150,
//     };

//     const [columnWidths, setColumnWidths] = useState(initialColumnWidths);

//     const totalTableWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);

//     // Рефы для измерения высоты строки и таблицы
//     const tableContainerRef = useRef(null);
//     const tableRowRef = useRef(null);

//     // Обработчик изменения страницы
//     const handleChangePage = (event, newPage) => {
//         setPage(newPage);
//     };

//     // Вызываем вычисление при монтировании и при изменении размеров окна
//     useEffect(() => {
//         calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage);
//         setPage(1);
//         window.addEventListener('resize', () => {
//             calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage);
//         });
//         return () => {
//             window.removeEventListener('resize', () => {
//                 calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage);
//             });
//         };
//     }, [filteredCases]);

//     // Пагинированные данные
//     const paginatedCases = filteredCases.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//     // Обработчики изменения ширины столбцов
//     const handleResize = (columnId, newWidth) => {
//         setColumnWidths((prevWidths) => ({
//             ...prevWidths,
//             [columnId]: newWidth,
//         }));
//     };

//     return (
//         <>
//             {/* Таблица с делами */}
//             {/* <Paper elevation={1}>
//                 <TableContainer ref={tableContainerRef}>
//                     <Table
//                         aria-label="Таблица дел"
//                         sx={{ tableLayout: 'fixed', minWidth: 650 }}
//                     >
//                         <TableHead>
//                             <TableRow>
//                                 <ResizableTableCell
//                                     width={columnWidths.name}
//                                     onResize={(newWidth) => handleResize('name', newWidth)}
//                                 >
//                                     Название дела
//                                 </ResizableTableCell>
//                                 <ResizableTableCell
//                                     width={columnWidths.description}
//                                     onResize={(newWidth) => handleResize('description', newWidth)}
//                                 >
//                                     Описание
//                                 </ResizableTableCell>
//                                 <ResizableTableCell
//                                     width={columnWidths.creator_name}
//                                     onResize={(newWidth) => handleResize('creator_name', newWidth)}
//                                 >
//                                     Следователь
//                                 </ResizableTableCell>
//                                 {user && user.role === 'REGION_HEAD' && (
//                                     <ResizableTableCell
//                                         width={columnWidths.department_name}
//                                         onResize={(newWidth) => handleResize('department_name', newWidth)}
//                                     >
//                                         Отделение
//                                     </ResizableTableCell>
//                                 )}
//                                 <ResizableTableCell
//                                     width={columnWidths.created}
//                                     onResize={(newWidth) => handleResize('created', newWidth)}
//                                 >
//                                     Дата создания
//                                 </ResizableTableCell>
//                                 <ResizableTableCell
//                                     width={columnWidths.updated}
//                                     onResize={(newWidth) => handleResize('updated', newWidth)}
//                                 >
//                                     Дата обновления
//                                 </ResizableTableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {isLoading ? (
//                                 <Loading />
//                             ) : (
//                                 <>
//                                     {paginatedCases.map((caseItem, index) => (
//                                         <TableRow
//                                             key={caseItem.id}
//                                             hover
//                                             selected={selectedCase && selectedCase.id === caseItem.id}
//                                             onClick={() => handleCaseSelect(caseItem)}
//                                             style={{ cursor: 'pointer' }}
//                                             ref={index === 0 ? tableRowRef : null} // Реф на первую строку
//                                         >
//                                             <TableCellSx style={{ width: columnWidths.name }}>
//                                                 {caseItem.name}
//                                             </TableCellSx>
//                                             <TableCellSx style={{ width: columnWidths.description }}>
//                                                 {caseItem.description}
//                                             </TableCellSx>
//                                             <TableCellSx style={{ width: columnWidths.creator_name }}>
//                                                 {caseItem.creator_name}
//                                             </TableCellSx>
//                                             {user && user.role === 'REGION_HEAD' && (
//                                                 <TableCellSx style={{ width: columnWidths.department_name }}>
//                                                     {caseItem.department_name ||
//                                                         (caseItem.department && caseItem.department.name) ||
//                                                         'Не указано'}
//                                                 </TableCellSx>
//                                             )}
//                                             <TableCellSx style={{ width: columnWidths.created }}>
//                                                 {formatDate(caseItem.created)}
//                                             </TableCellSx>
//                                             <TableCellSx style={{ width: columnWidths.updated }}>
//                                                 {formatDate(caseItem.updated)}
//                                             </TableCellSx>
//                                         </TableRow>
//                                     ))}
//                                     {paginatedCases.length === 0 && (
//                                         <TableRow>
//                                             <TableCell
//                                                 colSpan={user && user.role === 'REGION_HEAD' ? 6 : 5}
//                                                 align="center"
//                                             >
//                                                 Нет результатов.
//                                             </TableCell>
//                                         </TableRow>
//                                     )}
//                                 </>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//                 {totalPages > 1 && (
//                     <PaginationStyled
//                         totalPages={totalPages}
//                         page={page}
//                         handleChangePage={handleChangePage}
//                     />
//                 )}
//             </Paper> */}
//             {/* Таблица с делами */}
//             <Paper elevation={1}>
//                 <TableContainer ref={tableContainerRef} style={{ overflowX: 'auto' }}>
//                     <Table
//                         aria-label="Таблица дел"
//                         sx={{ minWidth: totalTableWidth }}
//                     >
//                         <TableHead>
//                             <TableRow>
//                                 <ResizableTableCell
//                                     width={columnWidths.name}
//                                     onResize={(newWidth) => handleResize('name', newWidth)}
//                                 >
//                                     Название дела
//                                 </ResizableTableCell>
//                                 <ResizableTableCell
//                                     width={columnWidths.description}
//                                     onResize={(newWidth) => handleResize('description', newWidth)}
//                                 >
//                                     Описание
//                                 </ResizableTableCell>
//                                 <ResizableTableCell
//                                     width={columnWidths.creator_name}
//                                     onResize={(newWidth) => handleResize('creator_name', newWidth)}
//                                 >
//                                     Следователь
//                                 </ResizableTableCell>
//                                 {user && user.role === 'REGION_HEAD' && (
//                                     <ResizableTableCell
//                                         width={columnWidths.department_name}
//                                         onResize={(newWidth) => handleResize('department_name', newWidth)}
//                                     >
//                                         Отделение
//                                     </ResizableTableCell>
//                                 )}
//                                 <ResizableTableCell
//                                     width={columnWidths.created}
//                                     onResize={(newWidth) => handleResize('created', newWidth)}
//                                 >
//                                     Дата создания
//                                 </ResizableTableCell>
//                                 <ResizableTableCell
//                                     width={columnWidths.updated}
//                                     onResize={(newWidth) => handleResize('updated', newWidth)}
//                                 >
//                                     Дата обновления
//                                 </ResizableTableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {isLoading ? (
//                                 <Loading />
//                             ) : (
//                                 <>
//                                     {paginatedCases.map((caseItem, index) => (
//                                         <TableRow
//                                             key={caseItem.id}
//                                             hover
//                                             selected={selectedCase && selectedCase.id === caseItem.id}
//                                             onClick={() => handleCaseSelect(caseItem)}
//                                             style={{ cursor: 'pointer' }}
//                                             ref={index === 0 ? tableRowRef : null} // Реф на первую строку
//                                         >
//                                             <TableCellSx style={{ width: columnWidths.name }}>
//                                                 {caseItem.name}
//                                             </TableCellSx>
//                                             <TableCellSx style={{ width: columnWidths.description }}>
//                                                 {caseItem.description}
//                                             </TableCellSx>
//                                             <TableCellSx style={{ width: columnWidths.creator_name }}>
//                                                 {caseItem.creator_name}
//                                             </TableCellSx>
//                                             {user && user.role === 'REGION_HEAD' && (
//                                                 <TableCellSx style={{ width: columnWidths.department_name }}>
//                                                     {caseItem.department_name ||
//                                                         (caseItem.department && caseItem.department.name) ||
//                                                         'Не указано'}
//                                                 </TableCellSx>
//                                             )}
//                                             <TableCellSx style={{ width: columnWidths.created }}>
//                                                 {formatDate(caseItem.created)}
//                                             </TableCellSx>
//                                             <TableCellSx style={{ width: columnWidths.updated }}>
//                                                 {formatDate(caseItem.updated)}
//                                             </TableCellSx>
//                                         </TableRow>
//                                     ))}
//                                     {paginatedCases.length === 0 && (
//                                         <TableRow>
//                                             <TableCell
//                                                 colSpan={user && user.role === 'REGION_HEAD' ? 6 : 5}
//                                                 align="center"
//                                             >
//                                                 Нет результатов.
//                                             </TableCell>
//                                         </TableRow>
//                                     )}
//                                 </>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//                 {/* Компонент пагинации */}
//                 {totalPages > 1 && (
//                     <PaginationStyled
//                         totalPages={totalPages}
//                         page={page}
//                         handleChangePage={handleChangePage}
//                     />
//                 )}
//             </Paper>
//         </>
//     );
// }

// import React, { useState, useEffect, useRef } from 'react';
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
// import { formatDate } from '../../../constants/formatDate';
// import { PaginationStyled } from '../../ui/PaginationUI';
// import calculateRowsPerPage from '../../../constants/calculateRowsPerPage';
// import Loading from '../../Loading';

// export default function AffairsTable({ user, isLoading, handleCaseSelect, selectedCase, filteredCases }) {
//     // Состояние для пагинации
//     const [page, setPage] = useState(1);
//     const [rowsPerPage, setRowsPerPage] = useState(10); // Начальное значение, будет пересчитано
//     const [totalPages, setTotalPages] = useState(1);

//     // Рефы для измерения высоты строки и таблицы
//     const tableContainerRef = useRef(null);
//     const tableRowRef = useRef(null);

//     // Обработчик изменения страницы
//     const handleChangePage = (event, newPage) => {
//         setPage(newPage);
//     };

//     // Вызываем вычисление при монтировании и при изменении размеров окна
//     useEffect(() => {
//         calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage);
//         // setPage(1);
//         window.addEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage));
//         return () => {
//             window.removeEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, filteredCases, setRowsPerPage, setTotalPages, page, setPage));
//         };
//     }, [filteredCases]);

//     // Пагинированные данные
//     const paginatedCases = filteredCases.slice((page - 1) * rowsPerPage, page * rowsPerPage);

//     return (
//         <>
//             {/* Таблица с делами */}
//             <Paper elevation={1}>
//                 <TableContainer ref={tableContainerRef}>
//                     <Table
//                         aria-label="Таблица дел"
//                         sx={{ tableLayout: 'fixed', minWidth: 650 }}
//                     >
//                         <TableHead>
//                             <TableRow>
//                                 <StyledTableCell sx={{ width: '20%' }}>
//                                     Название дела
//                                 </StyledTableCell>
//                                 <StyledTableCell sx={{ width: '30%' }}>
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
//                                 <StyledTableCell sx={{ width: '25%' }}>
//                                     Дата создания
//                                 </StyledTableCell>

//                                 <StyledTableCell sx={{ width: '25%' }}>
//                                     Дата обновления
//                                 </StyledTableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {isLoading ?
//                                 (
//                                     <Loading />
//                                 )
//                                 :
//                                 (
//                                     <>
//                                         {paginatedCases.map((caseItem, index) => (
//                                             <TableRow
//                                                 key={caseItem.id}
//                                                 hover
//                                                 selected={selectedCase && selectedCase.id === caseItem.id}
//                                                 onClick={() => handleCaseSelect(caseItem)}
//                                                 style={{ cursor: 'pointer' }}
//                                                 ref={index === 0 ? tableRowRef : null} // Реф на первую строку
//                                             >
//                                                 <TableCellSx component="th" scope="row">
//                                                     {caseItem.name}
//                                                 </TableCellSx>
//                                                 <TableCellSx>
//                                                     {caseItem.description}
//                                                 </TableCellSx>
//                                                 <TableCellSx>
//                                                     {caseItem.creator_name}
//                                                 </TableCellSx>
//                                                 {user && user.role === 'REGION_HEAD' && (
//                                                     <TableCellSx>
//                                                         {caseItem.department_name ||
//                                                             (caseItem.department && caseItem.department.name) ||
//                                                             'Не указано'}
//                                                     </TableCellSx>
//                                                 )}
//                                                 <TableCellSx>
//                                                     {formatDate(caseItem.created)}
//                                                 </TableCellSx>
//                                                 <TableCellSx>
//                                                     {formatDate(caseItem.updated)}
//                                                 </TableCellSx>
//                                             </TableRow>
//                                         ))}
//                                         {paginatedCases.length === 0 && (
//                                             <TableRow>
//                                                 <TableCell colSpan={user && user.role === 'REGION_HEAD' ? 6 : 5} align="center">
//                                                     Нет результатов.
//                                                 </TableCell>
//                                             </TableRow>
//                                         )}
//                                     </>
//                                 )}
//                         </TableBody>
//                     </Table>
//                 </TableContainer>
//                 {/* Компонент пагинации */}
//                 {totalPages > 1 && (
//                     <PaginationStyled totalPages={totalPages} page={page} handleChangePage={handleChangePage} />
//                 )}
//             </Paper>
//         </>
//     );
// }

// // import {
// //     Paper,
// //     Table,
// //     TableContainer,
// //     TableHead,
// //     TableRow,
// //     TableBody,
// //     TableCell,
// // } from '@mui/material';

// // import { StyledTableCell } from '../../ui/StyledComponents';
// // import { TableCellSx } from '../../ui/TableCell';


// // export default function AffairsTable({ user, cases, handleCaseSelect, selectedCase, filteredCases }) {

// //     return (
// //         <>
// //             {/* Таблица с делами */}
// //             <Paper elevation={1}>
// //                 <TableContainer>
// //                     <Table
// //                         aria-label="Таблица дел"
// //                         sx={{ tableLayout: 'fixed', minWidth: 650 }}
// //                     >
// //                         <TableHead>
// //                             <TableRow>
// //                                 <StyledTableCell sx={{ width: '20%' }}>
// //                                     Название дела
// //                                 </StyledTableCell>
// //                                 <StyledTableCell sx={{ width: '50%' }}>
// //                                     Описание
// //                                 </StyledTableCell>
// //                                 <StyledTableCell sx={{ width: '15%' }}>
// //                                     Следователь
// //                                 </StyledTableCell>
// //                                 {user && user.role === 'REGION_HEAD' && (
// //                                     <StyledTableCell sx={{ width: '15%' }}>
// //                                         Отделение
// //                                     </StyledTableCell>
// //                                 )}
// //                             </TableRow>
// //                         </TableHead>
// //                         <TableBody>
// //                             {filteredCases.map((caseItem) => (
// //                                 <TableRow
// //                                     key={caseItem.id}
// //                                     hover
// //                                     selected={selectedCase && selectedCase.id === caseItem.id}
// //                                     onClick={() => handleCaseSelect(caseItem)}
// //                                     style={{ cursor: 'pointer' }}
// //                                 >
// //                                     <TableCellSx
// //                                         component="th"
// //                                         scope="row"
// //                                     >
// //                                         {caseItem.name}
// //                                     </TableCellSx>
// //                                     <TableCellSx>
// //                                         {caseItem.description}
// //                                     </TableCellSx>
// //                                     <TableCellSx>
// //                                         {caseItem.creator_name}
// //                                     </TableCellSx>
// //                                     {user && user.role === 'REGION_HEAD' && (
// //                                         <TableCellSx>
// //                                             {caseItem.department_name ||
// //                                                 (caseItem.department && caseItem.department.name) ||
// //                                                 'Не указано'}
// //                                         </TableCellSx>
// //                                         // <TableCell
// //                                         //     sx={{
// //                                         //         whiteSpace: 'nowrap',
// //                                         //         overflow: 'hidden',
// //                                         //         textOverflow: 'ellipsis',
// //                                         //     }}
// //                                         // >
// //                                         //     {caseItem.department_name ||
// //                                         //         (caseItem.department && caseItem.department.name) ||
// //                                         //         'Не указано'}
// //                                         // </TableCell>
// //                                     )}
// //                                 </TableRow>
// //                             ))}
// //                             {filteredCases.length === 0 && (
// //                                 <TableRow>
// //                                     <TableCell colSpan={user && user.role === 'REGION_HEAD' ? 4 : 3} align="center">
// //                                         Нет результатов.
// //                                     </TableCell>
// //                                 </TableRow>
// //                             )}
// //                         </TableBody>
// //                     </Table>
// //                 </TableContainer>
// //             </Paper>

// //         </>
// //     );
// // }
