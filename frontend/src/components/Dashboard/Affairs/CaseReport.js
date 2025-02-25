// frontend/src/components/Dashboard/Affairs/CaseReport.js

import React from 'react';
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { formatDate } from '../../../constants/formatDate';
import { useTranslation } from 'react-i18next';

export default function CaseReport({
    caseReportRef,
    user,
    searchQuery,
    dateAddedFrom,
    dateAddedTo,
    casesExportData,
}) {
    const { t } = useTranslation();
    return (
        <>
            {/* Скрытый компонент для печати */}
            <div style={{ display: 'none' }}>
                <div
                    ref={caseReportRef}
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
                            th:nth-child(2), td:nth-child(2) { width: 32%; }  /* Название и описание */
                            th:nth-child(3), td:nth-child(3) { width: 32%; }  /* Следователь, отделение и регион */
                            th:nth-child(4), td:nth-child(4) { width: 33%; }  /* Дата создания и обновления */
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
                            <p>
                                <strong>{t('common.report.titles.report_cases')}</strong>
                            </p>
                            <p>
                                {t('common.report.employee_label')}{' '}
                                {user ? `${user.last_name} ${user.first_name}` : t('common.messages.unknown')}
                            </p>
                            <p>
                                {t('common.report.report_date_label')}{' '}
                                {formatDate(new Date().toISOString())}
                            </p>
                            {/* Фильтры */}
                            {searchQuery && (
                                <p>
                                    {t('common.report.search_label')}{' '}
                                    {searchQuery}
                                </p>
                            )}
                            {(dateAddedFrom || dateAddedTo) && (
                                <p>
                                    {t('common.report.created_date_label')}{' '}
                                    {dateAddedFrom || '...'} - {dateAddedTo || '...'}
                                </p>
                                // Или использовать плейсхолдер:
                                // t('dashboard.case_report.filter_date_created', { dateFrom: dateAddedFrom || '...', dateTo: dateAddedTo || '...' })
                            )}
                        </div>
                    </div>

                    {/* Контент */}
                    <div className="content">
                        <table aria-label={t('common.report.titles.report_cases')}>
                            <thead>
                                <tr>
                                    <th>{t('common.table_headers.number')}</th>
                                    <th>{t('common.table_headers.title_and_description')}</th>
                                    <th>{t('common.table_headers.investigator_dept_region')}</th>
                                    <th>{t('common.report.created_updated_date')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {casesExportData.map((caseItem, index) => (
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
                                                <strong>{t('common.report.created_date_label')}</strong> {formatDate(caseItem.created)}
                                            </div>
                                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                            <div>
                                                <strong>{t('common.report.updated_date_label')}</strong> {formatDate(caseItem.updated)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {casesExportData.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center' }}>
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

// // frontend/src/components/Dashboard/Affairs/CaseReport.js
//
// import React from 'react';
// import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
// import { formatDate } from '../../../constants/formatDate';
//
// export default function CaseReport({
//                                        caseReportRef,
//                                        user,
//                                        searchQuery,
//                                        dateAddedFrom,
//                                        dateAddedTo,
//                                        casesExportData,
//                                    }) {
//     return (
//         <>
//             {/* Скрытый компонент для печати */}
//             <div style={{ display: 'none' }}>
//                 <div
//                     ref={caseReportRef}
//                     style={{
//                         fontFamily: 'Arial, sans-serif',
//                         color: '#000',
//                     }}
//                 >
//                     {/* Стили для печати */}
//                     <style type="text/css" media="print">
//                         {`
//                             @page {
//                                 size: A4 landscape;
//                                 margin: 12mm;
//                             }
//
//                             body {
//                                 margin: 0;
//                                 padding: 0;
//                             }
//
//                             .header {
//                                 display: flex;
//                                 align-items: flex-start;
//                                 margin-bottom: 10px;
//                                 font-size: 12pt;
//                             }
//
//                             .header img {
//                                 max-width: 80px;
//                                 margin-right: 20px;
//                             }
//
//                             .header-info {
//                                 flex: 1;
//                             }
//
//                             .header-info p {
//                                 margin: 2px 0;
//                             }
//
//                             .content {
//                                 margin-bottom: 20px;
//                             }
//
//                             table {
//                                 border-collapse: collapse;
//                                 width: 100%;
//                                 table-layout: fixed;
//                             }
//
//                             th, td {
//                                 border: 1px solid #000;
//                                 padding: 4px;
//                                 font-size: 9pt;
//                                 word-wrap: break-word;
//                                 overflow: hidden;
//                                 text-overflow: ellipsis;
//                             }
//
//                             th {
//                                 background-color: #f0f0f0;
//                                 text-align: center;
//                             }
//
//                             td {
//                                 vertical-align: top;
//                             }
//
//                             tr {
//                                 page-break-inside: avoid;
//                             }
//
//                             /* Фиксированные ширины колонок */
//                             th:nth-child(1), td:nth-child(1) { width: 35%; }  /* Название и описание */
//                             th:nth-child(2), td:nth-child(2) { width: 35%; }  /* Следователь, Отделение и Регион */
//                             th:nth-child(3), td:nth-child(3) { width: 30%; }  /* Дата создания и обновления */
//                             /* Итого 100% */
//                         `}
//                     </style>
//
//                     {/* Заголовок */}
//                     <div className="header">
//                         <img
//                             src={LogoMVDKZ}
//                             alt="Логотип"
//                         />
//                         <div className="header-info">
//                             <p><strong>Отчет по делам</strong></p>
//                             <p>Сотрудник: {user ? `${user.last_name} ${user.first_name}` : 'Неизвестно'}</p>
//                             <p>Дата формирования отчета: {formatDate(new Date().toISOString())}</p>
//                             {/* Фильтры */}
//                             {searchQuery && (
//                                 <p>Поиск: {searchQuery}</p>
//                             )}
//                             {(dateAddedFrom || dateAddedTo) && (
//                                 <p>Дата создания: {dateAddedFrom || '...'} - {dateAddedTo || '...'}</p>
//                             )}
//                         </div>
//                     </div>
//
//                     {/* Контент */}
//                     <div className="content">
//                         <table aria-label="Отчет по делам">
//                             <thead>
//                             <tr>
//                                 <th>Название и описание</th>
//                                 <th>Следователь, отделение и регион</th>
//                                 <th>Дата создания и обновления</th>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {casesExportData.map((caseItem) => (
//                                 <tr key={caseItem.id}>
//                                     <td>
//                                         <div>
//                                             <strong>{caseItem.name}</strong>
//                                         </div>
//                                         <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
//                                         <div>{caseItem.description || 'Нет описания'}</div>
//                                     </td>
//                                     <td>
//                                         <div>
//                                             <strong>{caseItem.investigator_name || 'Не указано'}</strong>
//                                         </div>
//                                         <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
//                                         <div>{caseItem.department_name || 'Не указано'}</div>
//                                         <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
//                                         <div>{caseItem.region_name || 'Не указано'}</div>
//                                     </td>
//                                     <td>
//                                         <div>
//                                             <strong>Дата создания:</strong> {formatDate(caseItem.created)}
//                                         </div>
//                                         <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
//                                         <div>
//                                             <strong>Дата обновления:</strong> {formatDate(caseItem.updated)}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                             {casesExportData.length === 0 && (
//                                 <tr>
//                                     <td colSpan={3} style={{ textAlign: 'center' }}>
//                                         Нет данных для отображения.
//                                     </td>
//                                 </tr>
//                             )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }
