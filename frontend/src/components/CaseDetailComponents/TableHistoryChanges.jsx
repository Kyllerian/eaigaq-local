// frontend/src/components/CaseDetailComponents/TableHistoryChanges.jsx

import React, { forwardRef, useMemo } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { Typography, Box, useTheme } from '@mui/material';
import { formatDate } from '../../constants/formatDate';
import getActionMessage_html from '../../constants/getActionMessageHTML';
import getStatusLabel from '../../constants/getStatusLabel';
import { fieldLabels } from '../../constants/fieldsLabels';
import { LicenseInfo } from '@mui/x-license';
import {StyledDataGridPro} from "../ui/Tables";

// Установите ваш лицензионный ключ для DataGridPro
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

const TableHistoryChanges = forwardRef(({ changeLogs, ...props }, ref) => {
    const theme = useTheme();

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
                                    <strong>{fieldLabels[field] || field}</strong>: {field === 'status' ? getStatusLabel(values.old) : values.old} → {field === 'status' ? getStatusLabel(values.new) : values.new}
                                </div>
                            ));
                    } else if (log.action === 'create') {
                        const displayFields = ['name', 'description', 'status'];
                        changes = Object.entries(data)
                            .filter(([field]) => displayFields.includes(field))
                            .map(([field, value]) => (
                                <div key={field}>
                                    <strong>{fieldLabels[field] || field}</strong>: {field === 'status' ? getStatusLabel(value) : value}
                                </div>
                            ));
                    } else if (log.action === 'delete') {
                        changes = 'Объект был удален.';
                    } else {
                        changes = 'Нет данных об изменениях.';
                    }
                } catch (error) {
                    console.error('Ошибка парсинга данных лога:', error);
                    changes = 'Нет данных об изменениях.';
                }
            } else {
                changes = 'Нет данных об изменениях.';
            }

            return {
                id: index,
                dateTime: formatDate(log.created),
                user: log.user ? log.user.full_name : 'Система',
                action: getActionMessage_html(log),
                changes: changes,
            };
        });
    }, [changeLogs]);

    const columns = [
        {
            field: 'dateTime',
            headerName: 'Дата и время',
            sortable: false,
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2">{params.value}</Typography>
            ),
        },
        {
            field: 'user',
            headerName: 'Пользователь',
            sortable: false,
            width: 200,
            renderCell: (params) => (
                <Typography variant="body2">{params.value}</Typography>
            ),
        },
        {
            field: 'action',
            headerName: 'Действие',
            sortable: false,
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Typography variant="body2">{params.value}</Typography>
            ),
        },
        {
            field: 'changes',
            headerName: 'Изменения',
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
        <>
            <StyledDataGridPro rows={rows}
                columns={columns}
                autoHeight
                ref={ref} {...props}
            />
        </>
    );
});

TableHistoryChanges.displayName = "TableHistoryChanges";
export { TableHistoryChanges };

// import {forwardRef} from 'react';
// import {
//     Table,
//     TableCell,
//     TableRow,
//     TableHead,
//     TableBody,
// } from '@mui/material';
// import {TableCellWrap} from '../ui/TableCell';
// import {formatDate} from '../../constants/formatDate';
// import getActionMessage from '../../constants/getActionMessage';
// import getStatusLabel from '../../constants/getStatusLabel';
// import {StyledTableCell} from '../ui/StyledComponents';
// import {fieldLabels} from '../../constants/fieldsLabels';
//
//
// const TableHistoryChanges = forwardRef(({changeLogs, ...props}, ref) => {
//     return (
//         <Table ref={ref} aria-label="Таблица истории изменений" {...props} >
//             <TableHead>
//                 <TableRow>
//                     <StyledTableCell sx={{width: '15%'}}>Дата и время</StyledTableCell>
//                     <StyledTableCell sx={{width: '25%'}}>Пользователь</StyledTableCell>
//                     <StyledTableCell sx={{width: '30%'}}>Действие</StyledTableCell>
//                     <StyledTableCell sx={{width: '30%'}}>Изменения</StyledTableCell>
//                 </TableRow>
//             </TableHead>
//             <TableBody>
//                 {changeLogs.map((log) => (
//                     <TableRow key={log.id}>
//                         <TableCell>{formatDate(log.created)}</TableCell>
//                         <TableCell>
//                             {log.user ? log.user.full_name : 'Система'}
//                         </TableCell>
//                         <TableCellWrap>{getActionMessage(log)}</TableCellWrap>
//                         <TableCell style={{overflowWrap: 'anywhere', position: 'relative', paddingLeft: '1rem'}}>
//                             {(() => {
//                                 if (log.data && log.data.trim() !== '') {
//                                     try {
//                                         const data = JSON.parse(log.data);
//                                         if (log.action === 'update') {
//                                             if (log.fields.includes("investigator")) {
//                                                 const displayFields = ['investigator', 'department'];
//                                                 return Object.entries(data).map(([field, values]) => {
//                                                     if (displayFields.includes(field)) {
//                                                         return (
//                                                             <div
//                                                                 key={field}
//                                                                 style={{
//                                                                     borderLeft: '4px solid #ccc', // Полоска слева
//                                                                     paddingLeft: '1rem', // Отступ после полоски
//                                                                     marginBottom: '0.5rem', // Расстояние между элементами
//                                                                 }}
//                                                             >
//                                                                 <strong>
//                                                                     {fieldLabels[field] || field}
//                                                                 </strong>
//                                                                 : {values.old} → {values.new}
//                                                             </div>
//                                                         );
//                                                     } else {
//                                                         return null;
//                                                     }
//                                                 });
//                                             } else {
//                                                 const displayFields = ['name', 'description', 'status'];
//                                                 return Object.entries(data).map(([field, values]) => {
//                                                     if (displayFields.includes(field)) {
//                                                         return (
//                                                             <div
//                                                                 key={field}
//                                                                 style={{
//                                                                     borderLeft: '4px solid #ccc', // Полоска слева
//                                                                     paddingLeft: '1rem', // Отступ после полоски
//                                                                     marginBottom: '0.5rem', // Расстояние между элементами
//                                                                 }}
//                                                             >
//                                                                 <strong>
//                                                                     {fieldLabels[field] || field}
//                                                                 </strong>
//                                                                 :{' '}
//                                                                 {field === 'status'
//                                                                     ? getStatusLabel(values.old)
//                                                                     : values.old}{' '}
//                                                                 →{' '}
//                                                                 {field === 'status'
//                                                                     ? getStatusLabel(values.new)
//                                                                     : values.new}
//                                                             </div>
//                                                         );
//                                                     } else {
//                                                         return null;
//                                                     }
//                                                 });
//                                             }
//                                         } else if (log.action === 'create') {
//                                             const displayFields = ['name', 'description', 'status'];
//                                             return (
//                                                 <div>
//                                                     {Object.entries(data).map(([field, value]) => {
//                                                         if (displayFields.includes(field)) {
//                                                             return (
//                                                                 <div
//                                                                     key={field}
//                                                                     style={{
//                                                                         borderLeft: '4px solid #ccc', // Полоска слева
//                                                                         paddingLeft: '1rem', // Отступ после полоски
//                                                                         marginBottom: '0.5rem', // Расстояние между элементами
//                                                                     }}
//                                                                 >
//                                                                     <strong>
//                                                                         {fieldLabels[field] || field}
//                                                                     </strong>
//                                                                     :{' '}
//                                                                     {field === 'status'
//                                                                         ? getStatusLabel(value)
//                                                                         : value}
//                                                                 </div>
//                                                             );
//                                                         } else {
//                                                             return null;
//                                                         }
//                                                     })}
//                                                 </div>
//                                             );
//                                         } else if (log.action === 'delete') {
//                                             return <div>Объект был удален.</div>;
//                                         } else {
//                                             return 'Нет данных об изменениях.';
//                                         }
//                                     } catch (error) {
//                                         console.error('Ошибка парсинга данных лога:', error);
//                                         return 'Нет данных об изменениях.';
//                                     }
//                                 } else {
//                                     return 'Нет данных об изменениях.';
//                                 }
//                             })()}
//                         </TableCell>
//
//                         {/*<TableCell style={{overflowWrap: 'anywhere', textIndent: '-1em'}}>*/}
//                         {/*    {(() => {*/}
//                         {/*        if (log.data && log.data.trim() !== '') {*/}
//                         {/*            try {*/}
//                         {/*                const data = JSON.parse(log.data);*/}
//                         {/*                if (log.action === 'update') {*/}
//                         {/*                    console.log(data, 'data1')*/}
//                         {/*                    if ((log.fields).includes("investigator")) {*/}
//                         {/*                        const displayFields = [*/}
//                         {/*                            'investigator',*/}
//                         {/*                            'department',*/}
//                         {/*                        ];*/}
//                         {/*                        console.log(data, 'data2')*/}
//                         {/*                        return Object.entries(data).map(*/}
//                         {/*                            ([field, values]) => {*/}
//                         {/*                                console.log(displayFields.includes(field), 'field', field)*/}
//                         {/*                                if (displayFields.includes(field)) {*/}
//                         {/*                                    return (*/}
//                         {/*                                        <div key={field}>*/}
//                         {/*                                            <strong>*/}
//                         {/*                                                {fieldLabels[field] || field}*/}
//                         {/*                                            </strong>*/}
//                         {/*                                            :{' '}*/}
//                         {/*                                            {values.old}{' '}*/}
//                         {/*                                            →{' '}*/}
//                         {/*                                            {values.new}*/}
//                         {/*                                        </div>*/}
//                         {/*                                    );*/}
//                         {/*                                } else {*/}
//                         {/*                                    return null;*/}
//                         {/*                                }*/}
//                         {/*                            }*/}
//                         {/*                        );*/}
//                         {/*                    } else {*/}
//                         {/*                        const displayFields = [*/}
//                         {/*                            'name',*/}
//                         {/*                            'description',*/}
//                         {/*                            'status',*/}
//                         {/*                        ];*/}
//                         {/*                        return Object.entries(data).map(*/}
//                         {/*                            ([field, values]) => {*/}
//                         {/*                                if (displayFields.includes(field)) {*/}
//                         {/*                                    return (*/}
//                         {/*                                        <div key={field}>*/}
//                         {/*                                            <strong>*/}
//                         {/*                                                {fieldLabels[field] || field}*/}
//                         {/*                                            </strong>*/}
//                         {/*                                            :{' '}*/}
//                         {/*                                            {field === 'status'*/}
//                         {/*                                                ? getStatusLabel(values.old)*/}
//                         {/*                                                : values.old}{' '}*/}
//                         {/*                                            →{' '}*/}
//                         {/*                                            {field === 'status'*/}
//                         {/*                                                ? getStatusLabel(values.new)*/}
//                         {/*                                                : values.new}*/}
//                         {/*                                        </div>*/}
//                         {/*                                    );*/}
//                         {/*                                } else {*/}
//                         {/*                                    return null;*/}
//                         {/*                                }*/}
//                         {/*                            }*/}
//                         {/*                        );*/}
//                         {/*                    }*/}
//                         {/*                } else if (log.action === 'create') {*/}
//                         {/*                    const displayFields = [*/}
//                         {/*                        'name',*/}
//                         {/*                        'description',*/}
//                         {/*                        'status',*/}
//                         {/*                    ];*/}
//                         {/*                    return (*/}
//                         {/*                        <div>*/}
//                         {/*                            {Object.entries(data).map(*/}
//                         {/*                                ([field, value]) => {*/}
//                         {/*                                    if (displayFields.includes(field)) {*/}
//                         {/*                                        return (*/}
//                         {/*                                            <div key={field}>*/}
//                         {/*                                                <strong>*/}
//                         {/*                                                    {fieldLabels[field] || field}*/}
//                         {/*                                                </strong>*/}
//                         {/*                                                :{' '}*/}
//                         {/*                                                {field === 'status'*/}
//                         {/*                                                    ? getStatusLabel(value)*/}
//                         {/*                                                    : value}*/}
//                         {/*                                            </div>*/}
//                         {/*                                        );*/}
//                         {/*                                    } else {*/}
//                         {/*                                        return null;*/}
//                         {/*                                    }*/}
//                         {/*                                }*/}
//                         {/*                            )}*/}
//                         {/*                        </div>*/}
//                         {/*                    );*/}
//                         {/*                } else if (log.action === 'delete') {*/}
//                         {/*                    return <div>Объект был удален.</div>;*/}
//                         {/*                } else {*/}
//                         {/*                    return 'Нет данных об изменениях.';*/}
//                         {/*                }*/}
//                         {/*            } catch (error) {*/}
//                         {/*                console.error(*/}
//                         {/*                    'Ошибка парсинга данных лога:',*/}
//                         {/*                    error*/}
//                         {/*                );*/}
//                         {/*                return 'Нет данных об изменениях.';*/}
//                         {/*            }*/}
//                         {/*        } else {*/}
//                         {/*            return 'Нет данных об изменениях.';*/}
//                         {/*        }*/}
//                         {/*    })()}*/}
//                         {/*</TableCell>*/}
//                     </TableRow>
//                 ))}
//             </TableBody>
//         </Table>
//     )
// })
//
// TableHistoryChanges.displayName = "TableHistoryChanges";
// export {TableHistoryChanges}