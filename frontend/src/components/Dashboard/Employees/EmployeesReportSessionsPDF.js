// frontend/src/components/Dashboard/Employees/EmployeesReportSessionsPDF.js

import React from 'react';
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { formatDate } from '../../../constants/formatDate';

export default function EmployeesReportSessionsPDF({
    employeesReportRef,
    currentUser,
    employeeSearchQuery,
    selectedEmployeeDepartment,
    employeesExportData,
}) {

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
                            th:nth-child(7), td:nth-child(7) { width: 20%; }  /* Дата последнего входа */
                            /* Итого 100% */
                        `}
                    </style>

                    {/* Заголовок */}
                    <div className="header">
                        <img
                            src={LogoMVDKZ}
                            alt="Логотип"
                        />
                        <div className="header-info">
                            <p><strong>Отчет по сотрудникам</strong></p>
                            <p>Сотрудник: {currentUser ? `${currentUser.last_name} ${currentUser.first_name}` : 'Неизвестно'}</p>
                            <p>Дата формирования отчета: {formatDate(new Date().toISOString())}</p>
                            {/* Фильтры */}
                            {employeeSearchQuery && (
                                <p>Поиск: {employeeSearchQuery}</p>
                            )}
                            {selectedEmployeeDepartment && (
                                <p>Отделение: {selectedEmployeeDepartment}</p>
                            )}
                        </div>
                    </div>

                    {/* Контент */}
                    <div className="content">
                        <table aria-label="Отчет по сотрудникам">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>ФИО и Звание</th>
                                    <th>Роль</th>
                                    <th>Эл. почта и телефон</th>
                                    <th>Отделение и регион</th>
                                    <th>Статус</th>
                                    <th>Сессии</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeesExportData.map((employee, index) => (
                                    <tr key={employee.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div>
                                                <strong>{employee.user.last_name} {employee.user.first_name}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employee.user.rank || 'Не указано'}</div>
                                        </td>
                                        <td>{employee.role_display || 'Не указано'}</td>
                                        <td>
                                            <div>{employee.user.email || 'Не указано'}</div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employee.user.phone_number || 'Не указано'}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{employee.department_name || 'Не указано'}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employee.region_name || 'Не указано'}</div>
                                        </td>
                                        <td>{employee.active ? 'В сети' : 'Не в сети'}</td>
                                        <td>
                                            <div><strong>Вход:</strong> {employee.login ? formatDate(employee.login) : 'Никогда'}</div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div><strong>Выход:</strong> {employee.logout ? formatDate(employee.logout) : 'Никогда'}</div>
                                        </td>
                                    </tr>
                                ))}
                                {employeesExportData.length === 0 && (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center' }}>
                                            Нет данных для отображения.
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
