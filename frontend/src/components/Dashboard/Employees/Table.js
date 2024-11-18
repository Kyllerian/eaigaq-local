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
import { PaginationStyled } from '../../ui/PaginationUI';
import calculateRowsPerPage from '../../../constants/calculateRowsPerPage';

export default function EmployeesTable({
    user,
    employees,
    selectedEmployeeDepartment,
    employeeSearchQuery,
    selectedEmployee,
    handleEmployeeSelect,
}) {
    // Состояния для пагинации
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10); // Начальное значение, будет пересчитано
    const [totalPages, setTotalPages] = useState(1);

    // Refs для измерения высоты
    const tableContainerRef = useRef(null);
    const tableRowRef = useRef(null);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        calculateRowsPerPage(tableContainerRef, tableRowRef, filteredEmployees, setRowsPerPage, setTotalPages, page, setPage);
        window.addEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, filteredEmployees, setRowsPerPage, setTotalPages, page, setPage));
        return () => {
            window.removeEventListener('resize', calculateRowsPerPage(tableContainerRef, tableRowRef, filteredEmployees, setRowsPerPage, setTotalPages, page, setPage));
        };
    }, [employees, selectedEmployeeDepartment, employeeSearchQuery]);

    // Фильтрация сотрудников
    const filteredEmployees = employees
        .filter((employee) => {
            // Фильтрация по отделению
            if (user.role === 'REGION_HEAD') {
                if (selectedEmployeeDepartment) {
                    return (
                        employee.department &&
                        employee.department.id === parseInt(selectedEmployeeDepartment)
                    );
                }
                return true; // Если отделение не выбрано, показываем всех
            } else if (user.role === 'DEPARTMENT_HEAD') {
                // Для главы отделения показываем только сотрудников своего отделения
                return (
                    employee.department &&
                    employee.department.id === user.department.id
                );
            } else {
                return false; // Другие роли не имеют доступа
            }
        })
        .filter((employee) => {
            // Фильтрация по поисковому запросу
            if (employeeSearchQuery) {
                const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
                const reverseFullName = `${employee.last_name} ${employee.first_name}`.toLowerCase();
                return (
                    employee.first_name
                        .toLowerCase()
                        .includes(employeeSearchQuery.toLowerCase()) ||
                    employee.last_name
                        .toLowerCase()
                        .includes(employeeSearchQuery.toLowerCase()) ||
                    fullName.includes(employeeSearchQuery.toLowerCase()) ||
                    reverseFullName.includes(employeeSearchQuery.toLowerCase())
                );
            }
            return true;
        });

    // Пагинированные данные
    const paginatedEmployees = filteredEmployees.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    return (
        <>
            {/* Таблица с сотрудниками */}
            <Paper elevation={1}>
                <TableContainer ref={tableContainerRef}>
                    <Table
                        aria-label="Таблица сотрудников"
                        sx={{ tableLayout: 'fixed', minWidth: 800 }}
                    >
                        <TableHead>
                            <TableRow>
                                <StyledTableCell sx={{ width: '15%' }}>Фамилия</StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>Имя</StyledTableCell>
                                <StyledTableCell sx={{ width: '10%' }}>Звание</StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>Роль</StyledTableCell>
                                <StyledTableCell sx={{ width: '20%' }}>
                                    Электронная почта
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '15%' }}>
                                    Отделение
                                </StyledTableCell>
                                <StyledTableCell sx={{ width: '10%' }}>Статус</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedEmployees.length > 0 ? (
                                paginatedEmployees.map((employee, index) => (
                                    <TableRow
                                        key={employee.id}
                                        hover
                                        selected={
                                            selectedEmployee && selectedEmployee.id === employee.id
                                        }
                                        onClick={() => handleEmployeeSelect(employee)}
                                        style={{ cursor: 'pointer' }}
                                        ref={index === 0 ? tableRowRef : null}
                                    >
                                        <TableCellSx>
                                            {employee.last_name}
                                        </TableCellSx>
                                        <TableCellSx>
                                            {employee.first_name}
                                        </TableCellSx>
                                        <TableCellSx>
                                            {employee.rank}
                                        </TableCellSx>
                                        <TableCellSx>
                                            {employee.role_display}
                                        </TableCellSx>
                                        <TableCellSx>
                                            {employee.email}
                                        </TableCellSx>
                                        <TableCellSx>
                                            {employee.department
                                                ? employee.department.name
                                                : 'Не указано'}
                                        </TableCellSx>
                                        <TableCellSx>
                                            {employee.is_active ? 'Активен' : 'Неактивен'}
                                        </TableCellSx>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Нет результатов.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Пагинация */}
                {totalPages > 1 && (
                    <PaginationStyled totalPages={totalPages} page={page} handleChangePage={handleChangePage} />
                )}
            </Paper>
        </>
    );
}
