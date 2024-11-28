// frontend/src/components/Dashboard/Affairs/CaseReport.js

import React from 'react';
import { formatDate } from '../../../constants/formatDate';

const CaseReport = ({
    caseReportRef,
    searchQuery,
    dateAddedFrom,
    dateAddedTo,
    casesExportData,
}) => {
    return (
        <div ref={caseReportRef}>
            <h1>Отчет по делам</h1>
            <p>
                Поиск: {searchQuery || 'Не задан'}<br />
                Дата создания от: {dateAddedFrom || 'Не задана'}<br />
                Дата создания до: {dateAddedTo || 'Не задана'}
            </p>
            <table border="1" cellPadding="5" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Название дела</th>
                        <th>Описание дела</th>
                        <th>Следователь</th>
                        <th>Отделение</th>
                        <th>Дата создания</th>
                    </tr>
                </thead>
                <tbody>
                    {casesExportData.map((caseItem) => (
                        <tr key={caseItem.id}>
                            <td>{caseItem.name}</td>
                            <td>{caseItem.description}</td>
                            <td>{caseItem.investigator_name || 'Не указано'}</td>
                            <td>{caseItem.department_name || 'Не указано'}</td>
                            <td>{formatDate(caseItem.created)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CaseReport;
