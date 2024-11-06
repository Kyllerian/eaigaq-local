import {
    Paper,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableBody,
} from '@mui/material';

import { StyledTableCell } from '../../ui/StyledComponents';
import { TableCellSx } from '../../ui/TableCell';


export default function EmpolyeesTable({ user, employees, selectedEmployeeDepartment, employeeSearchQuery, selectedEmployee, handleEmployeeSelect }) {

    return (
        <>
            {/* Таблица с сотрудниками */}
            <Paper elevation={1}>
                <TableContainer>
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
                            {employees
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
                                })
                                .map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        hover
                                        selected={
                                            selectedEmployee && selectedEmployee.id === employee.id
                                        }
                                        onClick={() => handleEmployeeSelect(employee)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <TableCellSx>
                                            {employee.last_name}
                                        </TableCellSx>
                                        {/* <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {employee.last_name}
                                        </TableCell> */}
                                        <TableCellSx>
                                            {employee.first_name}
                                        </TableCellSx>
                                        {/* <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {employee.first_name}
                                        </TableCell> */}
                                        <TableCellSx>
                                            {employee.rank}
                                        </TableCellSx>
                                        {/* <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {employee.rank}
                                        </TableCell> */}
                                        <TableCellSx>
                                            {employee.role_display}
                                        </TableCellSx>
                                        {/* <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {employee.role_display}
                                        </TableCell> */}
                                        <TableCellSx>
                                            {employee.email}
                                        </TableCellSx>
                                        {/* <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {employee.email}
                                        </TableCell> */}
                                        <TableCellSx>
                                            {employee.department
                                                ? employee.department.name
                                                : 'Не указано'}
                                        </TableCellSx>
                                        {/* <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {employee.department
                                                ? employee.department.name
                                                : 'Не указано'}
                                        </TableCell> */}
                                        <TableCellSx>
                                            {employee.is_active ? 'Активен' : 'Неактивен'}
                                        </TableCellSx>
                                        {/* <TableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {employee.is_active ? 'Активен' : 'Неактивен'}
                                        </TableCell> */}
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </>
    );
}
