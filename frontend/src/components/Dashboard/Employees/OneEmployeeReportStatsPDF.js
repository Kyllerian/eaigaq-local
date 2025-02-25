// frontend/src/components/Dashboard/Employees/OneEmployeeReportStatsPDF.js

import React from 'react';
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { formatDate } from '../../../constants/formatDate';
import Barcode from 'react-barcode'; // Импортируем react-barcode
import { useEvidenceTypes } from '../../../constants/evidenceTypes';
import { useEvidenceStatuses } from '../../../constants/evidenceStatuses';
import { useTranslation } from 'react-i18next';

export default function OneEmployeeReportStatsPDF({
    employeesReportRef,
    currentUser,
    employeeSearchQuery,
    selectedEmployeeDepartment,
    employeesExportData,
}) {
    const { t } = useTranslation();
    const EVIDENCE_TYPES = useEvidenceTypes();
    const EVIDENCE_STATUSES = useEvidenceStatuses();
    console.log('employeesExportData', employeesExportData)
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

                            
                            /* Стили для баркода */
                            .barcode-container {
                                width: 100%;
                                overflow: hidden;
                            }
                            .barcode-container svg {
                                width: 100%;
                                height: auto;
                            }
                        `}
                    </style>

                    {/* Заголовок */}
                    <div className="header">
                        <img
                            src={LogoMVDKZ}
                            alt={t('common.logo_alt')}
                        />
                        <div className="header-info">
                            <p><strong>
                                {t('common.report.titles.report_employee_name', {
                                    employeeName: employeesExportData[0]?.full_name,
                                })}
                            </strong></p>
                            <p>
                                {t('common.report.employee_label')}{' '}
                                {currentUser
                                    ? `${currentUser.last_name} ${currentUser.first_name}`
                                    : t('common.messages.not_specified')
                                }
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
                    <div className="title">
                        <h3>{t('common.report.titles.stats_employee')}</h3>
                    </div>
                    {/* Stats emp */}
                    <div className="content">
                        <table aria-label={t('common.report.titles.stats_employee')}>
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
                                {employeesExportData.length &&
                                    <tr>
                                        <td>1</td>
                                        <td>
                                            <div>
                                                <strong>{employeesExportData[0].full_name}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employeesExportData[0].rank || t('common.messages.not_specified')}</div>
                                        </td>
                                        <td>{employeesExportData[0].role_display || t('common.messages.not_specified')}</td>
                                        <td>
                                            <div>{employeesExportData[0].email || t('common.messages.not_specified')}</div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employeesExportData[0].phone_number || t('common.messages.not_specified')}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{employeesExportData[0].department_name || t('common.messages.not_specified')}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{employeesExportData[0].region_display || t('common.messages.not_specified')}</div>
                                        </td>
                                        <td>{employeesExportData[0].is_active
                                            ? t('common.status.active')
                                            : t('common.status.inactive')}
                                        </td>
                                        <td>
                                            <div>
                                                <strong>
                                                    {t('common.report.cases_total')}:{' '}
                                                    {employeesExportData[0].cases?.length}
                                                </strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>
                                                {t('common.report.cases_opened')}:{' '}
                                                {employeesExportData[0].openedCasesCount}
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>
                                                {t('common.status.closed')}:{' '}
                                                {employeesExportData[0].closedCasesCount}
                                            </div>
                                        </td>
                                    </tr>}
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
                    <div className="title">
                        <h3>{t('common.report.titles.cases_employee')}</h3>
                    </div>
                    {/* Cases report */}
                    <div className="content">
                        <table aria-label={t('common.report.titles.cases_employee')}>
                            <thead>
                                <tr>
                                    <th>{t('common.table_headers.number')}</th>
                                    <th>{t('common.table_headers.title_and_description')}</th>
                                    <th>{t('common.report.investigator_and_department')}</th>
                                    <th>{t('common.report.created_updated_date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeesExportData[0]?.cases.map((caseItem, index) => (
                                    <tr key={caseItem.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div>
                                                <strong>{caseItem.name}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{caseItem.description || t('common.messages.no_description')}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{caseItem.investigator_name || t('common.messages.not_specified')}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{caseItem.department_name || t('common.messages.not_specified')}</div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{caseItem.region_name || t('common.messages.not_specified')}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>{t('common.report.created_date_label')}:</strong> {formatDate(caseItem.created)}
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>
                                                <strong>{t('common.report.updated_date_label')}:</strong> {formatDate(caseItem.updated)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {employeesExportData[0]?.cases.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center' }}>
                                            {t('common.messages.no_data_views')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="title">
                        <h3>{t('common.report.titles.evidence_employee')}</h3>
                    </div>
                    {/* Mat. evidence report */}
                    <div className="content">
                        <table aria-label={t('common.report.titles.evidence_employee')}>
                            <thead>
                                <tr>
                                    <th>{t('common.table_headers.number')}</th>
                                    <th>{t('common.table_headers.evidence')}</th>
                                    <th>{t('common.table_headers.type_status_evidence')}</th>
                                    <th>{t('common.fields.case')}</th>
                                    <th>{t('common.table_headers.investigator')}</th>
                                    <th>{t('common.table_headers.department_and_region')}</th>
                                    <th>{t('common.table_headers.created')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeesExportData[0]?.evidence.map((evidence, index) => (
                                    <tr key={evidence.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div>
                                                <strong>{evidence.name}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{evidence.description}</div>
                                        </td>
                                        <td>
                                            <div>
                                                <strong>
                                                    {EVIDENCE_TYPES.find(
                                                        (type) => type.value === evidence.type
                                                    )?.label || evidence.type_display}
                                                </strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>
                                                {EVIDENCE_STATUSES.find(
                                                    (status) => status.value === evidence.status
                                                )?.label || evidence.status_display}
                                            </div>
                                        </td>
                                        <td>{evidence.case_name || t('common.table_data.not_assigned')}</td>
                                        <td>{evidence.investigator_name || t('common.messages.not_specified')}</td>
                                        <td>
                                            <div>
                                                <strong>{evidence.department_name || t('common.messages.not_specified')}</strong>
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>{evidence.region_name || t('common.messages.not_specified')}</div>
                                        </td>
                                        <td>
                                            <div>{formatDate(evidence.created)}</div>
                                            {evidence.barcode && (
                                                <>
                                                    <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                                    <div className="barcode-container">
                                                        <Barcode
                                                            value={evidence.barcode}
                                                            width={1}
                                                            height={30}
                                                            displayValue={false}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {employeesExportData[0]?.evidence.length === 0 && (
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
