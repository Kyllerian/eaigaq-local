// frontend/src/components/Dashboard/Evidence/EvidenceReport.js

import React from 'react';
import Barcode from 'react-barcode'; // Импортируем react-barcode

import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { formatDate } from '../../../constants/formatDate';
import { useEvidenceTypes } from '../../../constants/evidenceTypes';
import { useEvidenceStatuses } from '../../../constants/evidenceStatuses';
import { useTranslation } from 'react-i18next';

export default function EvidenceReport({
    evidenceReportRef,
    currentUser,
    evidenceSearchQuery,
    evidenceTypeFilter,
    evidenceStatusFilter,
    dateAddedFrom,
    dateAddedTo,
    evidenceExportData,
}) {
    const { t } = useTranslation();
    const EVIDENCE_TYPES = useEvidenceTypes();
    const EVIDENCE_STATUSES = useEvidenceStatuses();
    return (
        <>
            {/* Скрытый компонент для печати */}
            <div style={{ display: 'none' }}>
                <div
                    ref={evidenceReportRef}
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
                            th:nth-child(2), td:nth-child(2) { width: 25%; }  /* ВД (название и описание) */
                            th:nth-child(3), td:nth-child(3) { width: 12%; }  /* Тип и статус ВД */
                            th:nth-child(4), td:nth-child(4) { width: 15%; }  /* Дело */
                            th:nth-child(5), td:nth-child(5) { width: 12%; }  /* Следователь */
                            th:nth-child(6), td:nth-child(6) { width: 15%; }  /* Отделение и регион */
                            th:nth-child(7), td:nth-child(7) { width: 18%; }  /* Дата создания и баркод */
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
                            <p><strong>{t('common.report.titles.report_evidence')}</strong></p>
                            <p>{t('common.report.employee_label')}{' '}{currentUser ? `${currentUser.last_name} ${currentUser.first_name}` : t('common.messages.not_specified')}</p>
                            <p>{t('common.report.report_date_label')}{' '}{formatDate(new Date().toISOString())}</p>
                            {/* Фильтры */}
                            {evidenceSearchQuery && (
                                <p>{t('common.report.search_label')}{' '}{evidenceSearchQuery}</p>
                            )}
                            {evidenceTypeFilter && (
                                <p> {t('common.report.type_label')}{' '}
                                    {EVIDENCE_TYPES.find(
                                        (type) => type.value === evidenceTypeFilter
                                    )?.label || evidenceTypeFilter}
                                </p>
                            )}
                            {evidenceStatusFilter && (
                                <p>{t('common.report.status_label')}{' '}
                                    {EVIDENCE_STATUSES.find(
                                        (status) => status.value === evidenceStatusFilter
                                    )?.label || evidenceStatusFilter}
                                </p>
                            )}
                            {(dateAddedFrom || dateAddedTo) && (
                                <p>{t('common.report.date_added_label')}{' '}{dateAddedFrom || '...'} - {dateAddedTo || '...'}</p>
                            )}
                        </div>
                    </div>

                    {/* Контент */}
                    <div className="content">
                        <table aria-label="Отчет по вещественным доказательствам">
                            <thead>
                                <tr>
                                    <th>{t('common.table_headers.number')}</th>
                                    <th>{t('common.table_headers.evidence')}</th>
                                    <th>{t('common.table_headers.type_status')}</th>
                                    <th>{t('cases.case_default')}</th>
                                    <th>{t('common.table_headers.investigator')}</th>
                                    <th>{t('common.table_headers.department_and_region')}</th>
                                    <th>{t('common.report.date_created')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {evidenceExportData.map((evidence, index) => (
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
                                {evidenceExportData.length === 0 && (
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