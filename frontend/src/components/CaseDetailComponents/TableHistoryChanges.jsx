// frontend/src/components/CaseDetailComponents/TableHistoryChanges.jsx

import React, { forwardRef, useMemo } from 'react';
import { Typography, Box } from '@mui/material';
import { formatDate } from '../../constants/formatDate';
import getActionMessage_html from '../../constants/getActionMessageHTML';
import { useFieldLabels } from '../../constants/fieldsLabels';
import { LicenseInfo } from '@mui/x-license';
import { StyledDataGridPro } from "../ui/Tables";
import { useTranslation } from 'react-i18next';
import { useEvidenceStatuses } from '../../constants/evidenceStatuses';

// Установите ваш лицензионный ключ для DataGridPro
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

function getStatusLabel(value, statuses) {
    const status = statuses.find((item) => item.value === value);
    return status ? status.label : value;
}

const TableHistoryChanges = forwardRef(({ changeLogs, ...props }, ref) => {
    const { t } = useTranslation();
    const fieldLabels = useFieldLabels();
    const statuses = useEvidenceStatuses();

    // Преобразование данных в строки для DataGridPro
    const rows = useMemo(() => {
        return changeLogs.map((log, index) => {
            // Обработка поля data
            let changes = '';
            if (log.data && log.data.trim() !== '') {
                try {
                    const data = JSON.parse(log.data);
                    if (log.action === 'update') {
                        const displayFields = [
                            'name',
                            'description',
                            'status',
                            'investigator',
                            'department',
                        ];
                        changes = Object.entries(data)
                            .filter(([field]) => displayFields.includes(field))
                            .map(([field, values]) => (
                                <div key={field}>
                                    <strong>{fieldLabels[field] || field}</strong>: {field === 'status' ? getStatusLabel(values.old, statuses) : values.old} → {field === 'status' ? getStatusLabel(values.new, statuses) : values.new}
                                </div>
                            ));
                    } else if (log.action === 'create') {
                        const displayFields = ['name', 'description', 'status'];
                        changes = Object.entries(data)
                            .filter(([field]) => displayFields.includes(field))
                            .map(([field, value]) => (
                                <div key={field}>
                                    <strong>{fieldLabels[field] || field}</strong>: {field === 'status' ? getStatusLabel(value, statuses) : value}
                                </div>
                            ));
                    } else if (log.action === 'delete') {
                        changes = t('common.messages.object_deleted');
                    } else {
                        changes = t('common.messages.no_change_data');
                    }
                } catch (error) {
                    console.error('Ошибка парсинга данных лога:', error);
                    changes = t('common.messages.no_change_data');
                }
            } else {
                changes = t('common.messages.no_change_data');
            }

            return {
                id: index,
                dateTime: formatDate(log.created),
                user: log.user ? log.user.full_name : t('common.table_data.system_user'),
                action: getActionMessage_html(log),
                changes: changes,
            };
        });
    }, [changeLogs, t, statuses]);

    const columns = [
        {
            field: 'dateTime',
            headerName: t('common.table_headers.change_date_user'),
            sortable: false,
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2">{params.value}</Typography>
            ),
        },
        {
            field: 'user',
            headerName: t('common.table_headers.change_user'),
            sortable: false,
            width: 200,
            renderCell: (params) => (
                <Typography variant="body2">{params.value}</Typography>
            ),
        },
        {
            field: 'action',
            headerName: t('common.table_headers.actions'),
            sortable: false,
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2">{params.value}</Typography>
            ),
        },
        {
            field: 'changes',
            headerName: t('common.table_headers.change_data'),
            sortable: false,
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {Array.isArray(params.value) ? params.value : params.value}
                </Box>
            ),
        },
    ];

    return (
        <StyledDataGridPro rows={rows}
            columns={columns}
            autoHeight
            ref={ref} {...props}
        />
    );
});

TableHistoryChanges.displayName = "TableHistoryChanges";
export { TableHistoryChanges };