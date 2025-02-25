// src\components\Dashboard\Employees\PrintSessionReport.js

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
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { TableCellWrap } from '../../ui/TableCell';
import { useTranslation } from 'react-i18next';

export default function PrintSessionReport({ user, reportRef, exportData, exportFilters, departments, employees
}) {
    const { t } = useTranslation();

    const getEmployeeFullName = (employeeId) => {
        const employee = employees.find((e) => e.id === parseInt(employeeId));
        return employee ? `${employee.first_name} ${employee.last_name}` : '';
    };

    const getDepartmentName = (departmentId) => {
        const department = departments.find(
            (d) => d.id === parseInt(departmentId)
        );
        return department ? department.name : t('common.standard.option_all_departments');
    };
    return (
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
                        alt={t('common.logo_alt')}
                        style={{ maxWidth: '100px', marginBottom: '10px' }}
                    />
                    <Typography variant="h4" gutterBottom>
                        {t('common.report.titles.report_sessions_employees')}
                    </Typography>
                    <Typography variant="subtitle1">
                        {t('common.report.report_date_label')}:{' '}{formatDate(new Date().toISOString())}
                    </Typography>
                </div>

                {/* Filters */}
                <div style={{ marginBottom: '20px' }}>
                    {user.role === 'REGION_HEAD' && (
                        <Typography variant="h6">
                            {t('common.report.region_label')}: {user.region_display}
                        </Typography>
                    )}
                    {exportFilters.department && (
                        <Typography variant="h6">
                            {t('common.report.department_label')}: {getDepartmentName(exportFilters.department)}
                        </Typography>
                    )}
                    {exportFilters.employee && (
                        <Typography variant="h6">
                            {t('common.report.employee_label')}: {getEmployeeFullName(exportFilters.employee)}
                        </Typography>
                    )}
                </div>

                {/* Session Table */}
                <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
                    <Table
                        aria-label={t('dashboard.print_session_report.report_title')}
                        style={{
                            tableLayout: 'fixed',
                            width: '100%',
                            fontSize: '12px',
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>{t('common.standard.label_last_name')}</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>{t('common.standard.label_first_name')}</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>{t('common.standard.label_rank')}</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>{t('common.standard.label_role')}</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>{t('common.report.login')}</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>{t('common.report.logout')}</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {exportData.map((session) => (
                                <TableRow key={session.id}>
                                    <TableCellWrap>{session.user.last_name}</TableCellWrap>
                                    <TableCellWrap>{session.user.first_name}</TableCellWrap>
                                    <TableCellWrap>{session.user.rank}</TableCellWrap>
                                    <TableCellWrap>{session.user.role_display}</TableCellWrap>
                                    <TableCellWrap>{formatDate(session.login)}</TableCellWrap>
                                    <TableCellWrap>
                                        {session.logout
                                            ? formatDate(session.logout)
                                            : t('common.status.now_active')}
                                    </TableCellWrap>
                                </TableRow>
                            ))}
                            {exportData.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        {t('common.messages.no_data_views')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer */}
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <Typography variant="body2">
                        {t('common.report.footer_message', {
                            currentYear: new Date().getFullYear(),
                        })}
                    </Typography>
                </div>
            </div>
        </div >
    );
}
