// frontend/src/components/Dashboard/Employees/EmployeesReportStatsPDF.js

import React from 'react';
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { formatDate } from '../../../constants/formatDate';
import { useTranslation } from 'react-i18next';

export default function EmployeesReportStatsPDF({
    employeesReportRef,
    currentUser,
    employeeSearchQuery,
    selectedEmployeeDepartment,
    employeesExportData,
}) {
    const { t } = useTranslation();

    return (
        <>
            {/* Скрытый компонент для печати */}
            <div style={{ display: 'none' }}>
                <div
                    ref={employeesReportRef}
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        color: '#000',
                    }}
                >
                    {/* Стили для печати */}
                    <style type="text/css" media="print">
                        {`
                            @page {
                                size: A4 landscape;
                                margin: 12mm;
                            }

                            body {
                                margin: 0;
                                padding: 0;
                            }

                            .header {
                                display: flex;
                                align-items: flex-start;
                                margin-bottom: 10px;
                                font-size: 12pt;
                            }

                            .header img {
                                max-width: 80px;
                                margin-right: 20px;
                            }

                            .header-info {
                                flex: 1;
                            }

                            .header-info p {
                                margin: 2px 0;
                            }

                            .content {
                                margin-bottom: 20px;
                            }

                            table {
                                border-collapse: collapse;
                                width: 100%;
                                table-layout: fixed;
                            }

                            th, td {
                                border: 1px solid #000;
                                padding: 4px;
                                font-size: 9pt;
                                word-wrap: break-word;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }

                            th {
                                background-color: #f0f0f0;
                                text-align: center;
                            }

                            td {
                                vertical-align: top;
                            }

                            tr {
                                page-break-inside: avoid;
                            }

                            /* Фиксированные ширины колонок */
                            th:nth-child(1), td:nth-child(1) { width: 3%; }   /* № */
                            th:nth-child(2), td:nth-child(2) { width: 20%; }  /* ФИО и Звание */
                            th:nth-child(3), td:nth-child(3) { width: 15%; }  /* Роль */
                            th:nth-child(4), td:nth-child(4) { width: 20%; }  /* Электронная почта и телефон */
                            th:nth-child(5), td:nth-child(5) { width: 20%; }  /* Отделение и регион */
                            th:nth-child(6), td:nth-child(6) { width: 10%; }  /* Статус */
                            th:nth-child(7), td:nth-child(7) { width: 20%; }  /* Дела */
                            /* Итого 100% */
                        `}
                    </style>

                    {/* Заголовок */}
                    <div className="header">
                        <img
                            src={LogoMVDKZ}
                            alt={t('common.logo_alt')}
                        />
                        <div className="header-info">
                            <p><strong>{t('common.report.titles.report_employees')}</strong></p>
                            <p>
                                {t('common.report.employee_label')}{' '}
                                {currentUser
                                    ? `${currentUser.last_name} ${currentUser.first_name}`
                                    : t('common.messages.unknown')}
                            </p>
                            <p>
                                {t('common.report.report_date_label')}{' '}
                                {formatDate(new Date().toISOString())}
                            </p>
                            {/* Фильтры */}
                            {employeeSearchQuery && (
                                <p>
                                    {t('common.report.search_label')}{' '}
                                    {employeeSearchQuery}
                                </p>
                            )}
                            {selectedEmployeeDepartment && (
                                <p>
                                    {t('common.standard.label_department')}{' '}
                                    {selectedEmployeeDepartment}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Контент */}
                    <div className="content">
                        <table aria-label={t('common.report.titles.report_employees')}>
                            <thead>
                                <tr>
                                    <th>{t('common.table_headers.number')}</th>
                                    <th>{t('common.table_headers.full_name_and_rank')}</th>
                                    <th>{t('common.standard.label_role')}</th>
                                    <th>{t('common.table_headers.email_and_phone')}</th>
                                    <th>{t('common.table_headers.department_and_region')}</th>
                                    <th>{t('common.table_headers.status')}</th>
                                    <th>{t('common.table_headers.cases')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeesExportData.map((employee, index) => (
                                    <tr key={employee.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div>
                                                <strong>{employee.last_name} {employee.first_name}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employee.rank || t('common.messages.unknown')}</div>
                                        </td>
                                        <td>{employee.role_display || t('common.messages.unknown')}</td>
                                        <td>
                                            <div>{employee.email || t('common.messages.unknown')}</div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employee.phone_number || t('common.messages.unknown')}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{employee.department_name || t('common.messages.unknown')}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employee.region_display || t('common.messages.unknown')}</div>
                                        </td>
                                        <td>
                                            {employee.is_active
                                                ? t('common.status.active')
                                                : t('common.status.inactive')}
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{t('common.report.cases_total')}:{' '}{employee.cases?.length}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>
                                                {t('common.report.cases_opened')}:{' '}
                                                {employee.openedCasesCount}
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>
                                                {t('common.status.closed')}:{' '}
                                                {employee.closedCasesCount}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {employeesExportData.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center' }}>
                                            {t('common.messages.no_data_views')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
