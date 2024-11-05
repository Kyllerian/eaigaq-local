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

import { formatDate } from "../../../constants/formatDate";
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.png";

export default function PrintSessionReport({ user, reportRef, exportData, exportFilters, departments, employees
}) {

    
    const getEmployeeFullName = (employeeId) => {
        const employee = employees.find((e) => e.id === parseInt(employeeId));
        return employee ? `${employee.first_name} ${employee.last_name}` : '';
    };
    
    const getDepartmentName = (departmentId) => {
        const department = departments.find(
            (d) => d.id === parseInt(departmentId)
        );
        return department ? department.name : 'Все отделения';
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
                            Отчет о сессиях сотрудников
                        </Typography>
                        <Typography variant="subtitle1">
                            Дата формирования отчета: {formatDate(new Date().toISOString())}
                        </Typography>
                    </div>

                    {/* Filters */}
                    <div style={{ marginBottom: '20px' }}>
                        {user.role === 'REGION_HEAD' && (
                            <Typography variant="h6">
                                Регион: {user.region_display}
                            </Typography>
                        )}
                        {exportFilters.department && (
                            <Typography variant="h6">
                                Отделение: {getDepartmentName(exportFilters.department)}
                            </Typography>
                        )}
                        {exportFilters.employee && (
                            <Typography variant="h6">
                                Сотрудник: {getEmployeeFullName(exportFilters.employee)}
                            </Typography>
                        )}
                    </div>

                    {/* Session Table */}
                    <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                        <Table
                            aria-label="Отчет по сессиям"
                            style={{
                                tableLayout: 'fixed',
                                width: '100%',
                                fontSize: '12px',
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <strong>Фамилия</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Имя</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Звание</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Роль</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Вход</strong>
                                    </TableCell>
                                    <TableCell>
                                        <strong>Выход</strong>
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {exportData.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>{session.user.last_name}</TableCell>
                                        <TableCell>{session.user.first_name}</TableCell>
                                        <TableCell>{session.user.rank}</TableCell>
                                        <TableCell>{session.user.role_display}</TableCell>
                                        <TableCell>{formatDate(session.login)}</TableCell>
                                        <TableCell>
                                            {session.logout
                                                ? formatDate(session.logout)
                                                : 'Активен'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {exportData.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
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
