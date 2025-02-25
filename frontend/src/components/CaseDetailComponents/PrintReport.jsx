// frontend/src/components/CaseDetailComponents/PrintReport.jsx

import React from 'react';
import Barcode from 'react-barcode';

import LogoMVDKZ from '../../assets/Logo_MVD_KZ.webp';
import { useEvidenceTypes } from '../../constants/evidenceTypes';
import { useEvidenceStatuses } from '../../constants/evidenceStatuses';
import { formatDate } from '../../constants/formatDate';
import { useFieldLabels } from '../../constants/fieldsLabels';
import getActionMessage_html from '../../constants/getActionMessageHTML';
import { useTranslation } from 'react-i18next';

export default function PrintReport({ caseItem, changeLogs, reportRef, groups, canViewHistory, currentUser }) {
    const { t } = useTranslation();

    const evidenceStatuses = useEvidenceStatuses();
    const EVIDENCE_TYPES = useEvidenceTypes();
    const fieldLabels = useFieldLabels();

    const getStatusLabel = (value) => {
        const status = evidenceStatuses.find((s) => s.value === value);
        return status ? status.label : value;
    };

    const getTypeLabel = (value) => {
        const typeObj = EVIDENCE_TYPES.find((type) => type.value === value);
        return typeObj ? typeObj.label : value;
    };
    return (
        <>
            {/* Скрытый компонент для печати */}
            <div style={{ display: 'none' }}>
                <div
                    ref={reportRef}
                    style={{
                        fontFamily: 'Arial, sans-serif',
                        color: '#000',
                    }}
                >
                    {/* Стили для печати */}
                    <style type="text/css" media="print">
                        {`
                            @page {
                                size: A4 portrait;
                                margin: 11mm;
                            }

                            body {
                                margin: 0;
                                padding: 0;
                            }
                            * {
                                box-sizing: border-box;
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
                                overflow: visible;
                            }

                            table {
                                border-collapse: collapse;
                                width: 100%; /* Убедитесь, что таблица занимает всю ширину доступной области */
                                max-width: 100%; /* Запрещает таблице выходить за пределы */
                                table-layout: fixed; /* Устанавливает фиксированную ширину колонок */
                            }

                            th, td {
                                border: 1px solid #000;
                                padding: 4px;
                                font-size: 9pt;
                                word-wrap: break-word;
                                overflow: visible;
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

                            /* Фиксированные ширины колонок для таблицы вещественных доказательств */
                            .evidence-table th:nth-child(1),
                            .evidence-table td:nth-child(1) { width: 5%; }   /* № */
                            .evidence-table th:nth-child(2),
                            .evidence-table td:nth-child(2) { width: 30%; }  /* Название и описание */
                            .evidence-table th:nth-child(3),
                            .evidence-table td:nth-child(3) { width: 25%; }  /* Тип и статус ВД */
                            .evidence-table th:nth-child(4),
                            .evidence-table td:nth-child(4) { width: 15%; }  /* Дата создания */
                            .evidence-table th:nth-child(5),
                            .evidence-table td:nth-child(5) { width: 25%; }  /* Штрихкод */
                            /* Итого 100% */

                            /* Фиксированные ширины колонок для таблицы истории изменений */
                            .history-table th:nth-child(1),
                            .history-table td:nth-child(1) { width: 20%; }  /* Дата и время */
                            .history-table th:nth-child(2),
                            .history-table td:nth-child(2) { width: 20%; }  /* Пользователь */
                            .history-table th:nth-child(3),
                            .history-table td:nth-child(3) { width: 30%; }  /* Действие */
                            .history-table th:nth-child(4),
                            .history-table td:nth-child(4) { width: 30%; }  /* Изменения */
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

                            /* Отступы для разделов */
                            .section {
                                margin-bottom: 20px;
                            }

                            /* Стиль для строки с названием группы */
                            .group-row td {
                                background-color: #e0e0e0;
                                font-weight: bold;
                                text-align: center;
                            }
                            
                            .case-info {
                                margin-bottom: 20px;
                            }
                            .case-info div {
                                margin-bottom: 5px;
                            }
                            .case-info div strong {
                                display: inline-block;
                                width: 170px;
                            }



                            // /* Стили для информации о деле */
                            // .case-info {
                            //     display: flex;
                            //     flex-wrap: wrap;
                            //     margin-bottom: 20px;
                            // }
                            // .case-info div {
                            //     flex: 1 1 45%;
                            //     margin-bottom: 5px;
                            // }
                            // .case-info div strong {
                            //     display: inline-block;
                            //     width: 150px;
                            // }
                        `}
                    </style>

                    {/* Заголовок */}
                    <div className="header">
                        <img
                            src={LogoMVDKZ}
                            alt={t('common.logo_alt')}
                        />
                        <div className="header-info">
                            <p><strong>{t('common.report.titles.report_case_name', { caseName: caseItem.name })}</strong></p>
                            <p>{t('common.report.employee_received', {
                                employeeName: currentUser ? currentUser.full_name : t('common.messages.unknown'),
                            })}</p>
                            <p>{t('common.report.report_date', {
                                reportDate: formatDate(new Date().toISOString()),
                            })}</p>
                        </div>
                    </div>

                    {/* Информация о деле */}
                    <div className="content">
                        <div className="section case-info">
                            <div>
                                <strong>{t('common.report.investigator_label')}</strong> {caseItem.investigator_name}
                            </div>
                            <div>
                                <strong>{t('common.report.region_label')}</strong> {caseItem.region_name}
                            </div>
                            <div>
                                <strong>{t('common.standard.label_department')}</strong> {caseItem.department_name}
                            </div>
                            <div>
                                <strong>{t('common.report.date_added_label')}</strong> {formatDate(caseItem.created)}
                            </div>
                            <div>
                                <strong>{t('common.report.case_description_label')}</strong> {caseItem.description}
                            </div>
                        </div>

                        {/* Вещественные доказательства */}
                        <div className="section">
                            <h3>{t('common.report.titles.evidence_table')}</h3>
                            <table className="evidence-table" aria-label={t('common.report.titles.evidence_table')}>
                                <thead>
                                    <tr>
                                        <th>{t('common.table_headers.number')}</th>
                                        <th>{t('common.table_headers.title_and_description')}</th>
                                        <th>{t('common.table_headers.type_status_evidence')}</th>
                                        <th>{t('common.report.date_created')}</th>
                                        <th>{t('common.barcode.label_barcode')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groups.length > 0 ? (
                                        groups.map((group) => (
                                            <React.Fragment key={group.id}>
                                                {/* Строка с названием группы */}
                                                <tr className="group-row">
                                                    <td colSpan="5">{group.name}</td>
                                                </tr>
                                                {group.material_evidences && group.material_evidences.length > 0 ? (
                                                    group.material_evidences.map((evidence, index) => (
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
                                                                    <strong>{getTypeLabel(evidence.type)}</strong>
                                                                </div>
                                                                <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '4px 0' }} />
                                                                <div>{getStatusLabel(evidence.status)}</div>
                                                            </td>
                                                            <td>{formatDate(evidence.created)}</td>
                                                            <td>
                                                                {evidence.barcode ? (
                                                                    <div className="barcode-container">
                                                                        <Barcode
                                                                            value={evidence.barcode}
                                                                            width={1}
                                                                            height={30}
                                                                            displayValue={false}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    t('common.barcode.no_barcode')
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} style={{ textAlign: 'center' }}>
                                                            {t('common.messages.empty_group_evidences')}
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center' }}>
                                                {t('common.messages.no_evidences')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* История изменений */}
                        {canViewHistory && (
                            <div className="section">
                                <h3>{t('common.report.titles.history_title')}</h3>
                                <table className="history-table" aria-label={t('common.report.titles.history_title')}>
                                    <thead>
                                        <tr>
                                            <th>{t('common.table_headers.change_date_user')}</th>
                                            <th>{t('common.table_headers.change_user')}</th>
                                            <th>{t('common.table_headers.actions')}</th>
                                            <th>{t('common.table_headers.change_data')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {changeLogs.length > 0 ? (
                                            changeLogs.map((log) => (
                                                <tr key={log.id}>
                                                    <td>{formatDate(log.created)}</td>
                                                    <td>{log.user ? log.user.full_name : t('common.table_data.system_user')}</td>
                                                    <td>{getActionMessage_html(log)}</td>
                                                    <td>
                                                        {(() => {
                                                            if (log.data && log.data.trim() !== '') {
                                                                try {
                                                                    const data = JSON.parse(log.data);
                                                                    if (log.action === 'update') {
                                                                        const displayFields = [
                                                                            'name',
                                                                            'description',
                                                                            'status',
                                                                            'type',
                                                                            'investigator',
                                                                            'department',
                                                                        ];
                                                                        return Object.entries(data)
                                                                            .filter(([field]) => displayFields.includes(field))
                                                                            .map(([field, values]) => {
                                                                                let oldValue = values.old;
                                                                                let newValue = values.new;

                                                                                if (field === 'status') {
                                                                                    oldValue = getStatusLabel(values.old);
                                                                                    newValue = getStatusLabel(values.new);
                                                                                } else if (field === 'type') {
                                                                                    oldValue = getTypeLabel(values.old);
                                                                                    newValue = getTypeLabel(values.new);
                                                                                } else if (field === 'investigator' || field === 'department') {
                                                                                    oldValue = values.old_name || values.old;
                                                                                    newValue = values.new_name || values.new;
                                                                                }

                                                                                return (
                                                                                    <div key={field}>
                                                                                        <strong>{fieldLabels[field] || field}</strong>: {oldValue} → {newValue}
                                                                                    </div>
                                                                                );
                                                                            });
                                                                    } else if (log.action === 'create') {
                                                                        const displayFields = ['name', 'description', 'status', 'type'];
                                                                        return Object.entries(data)
                                                                            .filter(([field]) => displayFields.includes(field))
                                                                            .map(([field, value]) => {
                                                                                if (field === 'status') {
                                                                                    value = getStatusLabel(value);
                                                                                } else if (field === 'type') {
                                                                                    value = getTypeLabel(value);
                                                                                }
                                                                                return (
                                                                                    <div key={field}>
                                                                                        <strong>{fieldLabels[field] || field}</strong>: {value}
                                                                                    </div>
                                                                                );
                                                                            });
                                                                    } else if (log.action === 'delete') {
                                                                        return t('common.messages.object_deleted');
                                                                    } else {
                                                                        return t('common.messages.no_change_data');
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Ошибка парсинга данных лога:', error);
                                                                    return t('common.messages.no_change_data');
                                                                }
                                                            } else {
                                                                return t('common.messages.no_change_data');
                                                            }
                                                        })()}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} style={{ textAlign: 'center' }}>
                                                    {t('common.messages.empty_history_logs')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
