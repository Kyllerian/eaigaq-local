// frontend/src/components/Dashboard/Evidence/EvidenceTable.js

import React, { useState, useMemo } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { Button, Paper, Typography, Box, useTheme, Tooltip, IconButton } from '@mui/material';
import Loading from '../../Loading';
import { OpenInNew as OpenInNewIcon, GetApp as GetAppIcon, Print as PrintIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import DialogSeenBarcode from '../../CaseDetailComponents/DialogSeenBarcode';
import axios from '../../../axiosConfig';
import { evidenceStatuses } from '../../../constants/evidenceStatuses';
import { LicenseInfo } from '@mui/x-license';
import { StyledDataGridPro } from '../../ui/Tables';

// Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

export default function EvidenceTable({ evidences, isLoading, setSnackbar, tableHeight, rowHeight }) {
    const navigate = useNavigate();
    const theme = useTheme();

    // Состояние для выбранного вещественного доказательства
    const [selectedEvidence, setSelectedEvidence] = useState(null);

    // Диалог для штрихкода
    const [openBarcodeDisplayDialog, setOpenBarcodeDisplayDialog] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState('');

    const handlePrintEvidenceBarcode = (evidence) => {
        if (evidence.barcode) {
            console.log("печать баркода - ", evidence.barcode)
            setScannedBarcode(evidence.barcode);
            setOpenBarcodeDisplayDialog(true);
        } else {
            setSnackbar({
                open: true,
                message: 'Штрихкод вещественного доказательства недоступен.',
                severity: 'error',
            });
        }
    };

    const CheckAssociatedDocument = (evidenceId) => {
        axios
            .get('/api/documents/', {
                params: {
                    material_evidence_id: evidenceId,
                },
            })
            .then((response) => {
                if (response.data[0]) {
                    const link = document.createElement('a');
                    link.href = response.data[0].file;
                    link.download = response.data[0].description || 'name';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    setSnackbar({
                        open: true,
                        message: 'Файл не найден.',
                        severity: 'error',
                    });
                }
            })
            .catch((error) => {
                console.error('Ошибка при получении документов:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при загрузке документов.',
                    severity: 'error',
                });
            });
    };

    // Обработчик выбора строки
    const handleEvidenceSelect = (evidence) => {
        if (selectedEvidence && selectedEvidence.id === evidence.id) {
            setSelectedEvidence(null);
        } else {
            setSelectedEvidence(evidence);
        }
    };

    // Преобразование данных для DataGridPro
    const rows = useMemo(
        () =>
            evidences.map((evidence) => ({
                id: evidence.id,
                name: evidence.name || 'Без названия',
                description: evidence.description || 'Описание не указано',
                type_display: evidence.type_display || 'Не указано',
                status_display: evidence.status || 'Не указано',
                status_label: evidenceStatuses.find((status) => status.value === evidence.status)?.label || evidence.status,
                case_id: evidence.case_id,
                case_name: evidence.case_name || 'Дело',
                department_name: evidence.department_name || 'Не указано',
                barcode: evidence.barcode,
            })),
        [evidences]
    );

    // Определение колонок для DataGridPro
    const columns = useMemo(
        () => [
            {
                field: 'name',
                headerName: 'Вещественное доказательство',
                flex: 1,
                minWidth: 200,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.description}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'type_status',
                headerName: 'Тип и Статус',
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.type_display}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.status_label}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'case',
                headerName: 'Дело',
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => {
                    const { case_id, case_name } = params.row;
                    if (case_id) {
                        return (
                            <Button
                                variant="text"
                                color="primary"
                                onClick={() => navigate(`/cases/${case_id}/`)}
                                startIcon={<OpenInNewIcon />}
                                sx={{
                                    textTransform: 'none',
                                    padding: 0,
                                    display: 'flex', // Используем flexbox
                                    alignItems: 'center', // Для выравнивания иконки и текста по центру
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '80%', // Устанавливаем ширину кнопки на 100% (чтобы текст не выходил за границу)
                                }}
                            >
                                <span style={{
                                    display: 'inline-block', // Это гарантирует, что текст будет в одной строке
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap', // Для запрета переноса текста
                                    width: '80%', // Делаем текст в одну строку
                                }}>
                                    {case_name}
                                </span>
                            </Button>
                        );
                    } else {
                        return (
                            <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                Не назначено
                            </Typography>
                        );
                    }
                },
            },
            // {
            //     field: 'case',
            //     headerName: 'Дело',
            //     flex: 1,
            //     minWidth: 150,
            //     sortable: false,
            //     renderCell: (params) => {
            //         const { case_id, case_name } = params.row;
            //         if (case_id) {
            //             return (
            //                 <Button
            //                     variant="text"
            //                     color="primary"
            //                     onClick={() => navigate(`/cases/${case_id}/`)}
            //                     startIcon={<OpenInNewIcon />}
            //                     sx={{ textTransform: 'none', padding: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
            //
            //                 >
            //                     <span style={{ textTransform: 'none', padding: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{case_name}</span>
            //                 </Button>
            //             );
            //         } else {
            //             return (
            //                 <Typography
            //                     variant="body2"
            //                     noWrap
            //                     sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
            //                 >
            //                     Не назначено
            //                 </Typography>
            //             );
            //         }
            //     },
            // },
            {
                field: 'department_name',
                headerName: 'Отделение',
                flex: 1,
                minWidth: 150,
                sortable: false,
                renderCell: (params) => (
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', height: 'fit-content' }}
                    >
                        {params.row.department_name}
                    </Typography>
                ),
            },
            {
                field: 'actions',
                headerName: 'Действие',
                flex: 0.5,
                minWidth: 100,
                sortable: false,
                renderCell: (params) => (
                    (params.row.status_display === 'DESTROYED' || params.row.status_display === 'TAKEN') ? (
                        <Tooltip title="Скачать документ">
                            <IconButton
                                color="primary"
                                onClick={() => CheckAssociatedDocument(params.row.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <GetAppIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title="Печать штрихкода">
                            <IconButton
                                color="primary"
                                onClick={() => handlePrintEvidenceBarcode(params.row)}
                            >
                                <PrintIcon />
                            </IconButton>
                        </Tooltip>
                    )
                ),
            },
        ],
        [navigate]
    );

    return (
        <>
            <Paper sx={{ width: '100%', mt: 2, p: 2, boxShadow: 3, boxSizing: 'border-box', }}>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: tableHeight }}>
                        <Loading />
                    </Box>
                ) : (
                    <StyledDataGridPro rows={rows}
                        columns={columns.map((col) => ({
                            ...col,
                            flex: col.flex || 1,
                            minWidth: col.minWidth || 150,
                        }))}
                    />
                    // <DataGridPro
                    //     rows={rows}
                    //     columns={columns}
                    //     disableColumnMenu
                    //     disableSelectionOnClick
                    //     hideFooter
                    //     getRowHeight={() => "auto"}
                    //     sx={{
                    //         '& .MuiDataGrid-cell': {
                    //             whiteSpace: 'nowrap',
                    //             overflow: 'hidden',
                    //             textOverflow: 'ellipsis',
                    //             display: 'flex',
                    //             alignItems: 'center',
                    //             padding: theme.spacing(1),
                    //             borderBottom: `1px solid ${theme.palette.divider}`,
                    //         },
                    //         '& .MuiDataGrid-columnHeaders': {
                    //             backgroundColor: theme.palette.grey[100],
                    //             borderBottom: `1px solid ${theme.palette.divider}`,
                    //             fontWeight: 'bold',
                    //             outline: 'none',
                    //         },
                    //         '& .MuiDataGrid-columnHeader:focus': {
                    //             outline: 'none',
                    //         },
                    //         '& .MuiDataGrid-columnHeader:focus-within': {
                    //             outline: 'none',
                    //         },
                    //         '& .MuiDataGrid-columnHeaderTitle': {
                    //             fontWeight: 'bold',
                    //         },
                    //         '& .MuiDataGrid-row': {
                    //             '&:nth-of-type(odd)': {
                    //                 backgroundColor: theme.palette.action.hover,
                    //             },
                    //             // cursor: 'pointer',
                    //         },
                    //         '& .MuiDataGrid-row:hover': {
                    //             '&:nth-of-type(odd)': {
                    //                 backgroundColor: theme.palette.action.hover,
                    //             },
                    //             backgroundColor: "initial",
                    //         },
                    //         '& .MuiDataGrid-cell:focus': {
                    //             outline: 'none',
                    //         },
                    //         '& .MuiDataGrid-row:focus': {
                    //             outline: 'none',
                    //         },
                    //         '& .MuiDataGrid-cell:focus-within': {
                    //             outline: 'none',
                    //         },
                    //         '& .MuiDataGrid-row.Mui-selected': {
                    //             backgroundColor: 'inherit'
                    //         },
                    //     }}
                    // />
                )}
            </Paper>

            {/* Диалог для отображения штрихкода */}
            <DialogSeenBarcode
                open={openBarcodeDisplayDialog}
                setOpenBarcodeDialog={() => setOpenBarcodeDisplayDialog(false)}
                barcodeValueToDisplay={scannedBarcode}
                setSnackbar={setSnackbar}
            />
        </>
    );
}


// // frontend/src/components/Dashboard/Evidence/EvidenceTable.js
//
// import React, { useState } from 'react';
// import { DataGrid } from '@mui/x-data-grid';
// import { Button, Paper, Tooltip, IconButton, Typography } from '@mui/material';
// import Loading from '../../Loading';
// import { OpenInNew as OpenInNewIcon, GetApp as GetAppIcon, } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
//
// import DialogSeenBarcode from '../../CaseDetailComponents/DialogSeenBarcode';
// import axios from '../../../axiosConfig';
// import { evidenceStatuses } from '../../../constants/evidenceStatuses';
//
// export default function EvidenceTable({ evidences, isLoading, setSnackbar }) {
//     const navigate = useNavigate();
//
//     // Диалог для штрихкода
//     const [openBarcodeDisplayDialog, setOpenBarcodeDisplayDialog] = useState(false);
//     const [scannedBarcode, setScannedBarcode] = useState('');
//
//
//     const handlePrintEvidenceBarcode = (evidence) => {
//         console.log(evidence);
//         if (evidence.barcode) {
//             setScannedBarcode(evidence.barcode);
//             setOpenBarcodeDisplayDialog(true);
//         } else {
//             setSnackbar({
//                 open: true,
//                 message: 'Штрихкод вещественного доказательства недоступен.',
//                 severity: 'error',
//             });
//         }
//     };
//
//     const CheckAssociatedDocument = (evidenceId) => {
//         console.log(evidenceId, 'evidenceId');
//         axios
//             .get('/api/documents/', {
//                 params: {
//                     material_evidence_id: evidenceId,
//                 },
//             })
//             .then((response) => {
//                 console.log(response.data[0], 'documents');
//                 if(response.data[0]){
//                     console.log(response.data[0].file, 'associatedDocument');
//
//                     const link = document.createElement('a');
//                     link.href = response.data[0].file;
//                     link.download = response.data[0].description || 'name';
//                     document.body.appendChild(link);
//                     link.click();
//                     document.body.removeChild(link);
//                 }else{
//                     setSnackbar({
//                         open: true,
//                         message: 'Файл не найден.',
//                         severity: 'error',
//                     });
//                 }
//             })
//             .catch((error) => {
//                 console.error('Ошибка при получении документов:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при загрузке документов.',
//                     severity: 'error',
//                 });
//             });
//     }
//     // Преобразование данных в формат, подходящий для DataGrid
//     const rows = evidences.map((evidence) => ({
//         id: evidence.id,
//         name: evidence.name || 'Без названия',
//         description: evidence.description || 'Описание не указано',
//         type_display: evidence.type_display || 'Не указано',
//         status_display: evidence.status || 'Не указано',
//         case_id: evidence.case_id,
//         case_name: evidence.case_name || 'Дело',
//         department_name: evidence.department_name || 'Не указано',
//         barcode: evidence.barcode,
//     }));
//
//     // Определение колонок для DataGrid
//     const columns = [
//         {
//             field: 'name',
//             headerName: 'Вещественное доказательство',
//             flex: 1,
//             sortable: false,
//             renderCell: (params) => (
//                 <div
//                     style={{
//                         width: '100%',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '10px',
//                         margin: '10px 0',
//                     }}
//                 >
//                     <div style={{ fontWeight: 'bold' }}>{params.row.name}</div>
//                     <div
//                         style={{
//                             borderTop: '1px solid #e0e0e0',
//                             margin: '4px 0',
//                         }}
//                     ></div>
//                     <div>{params.row.description}</div>
//                 </div>
//             ),
//         },
//         {
//             field: 'type_display',
//             headerName: 'Тип и Статус',
//             flex: 1,
//             sortable: false,
//             renderCell: (params) => (
//                 <div
//                     style={{
//                         width: '100%',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '10px',
//                         margin: '10px 0',
//                     }}
//                 >
//                     <div>{params.row.type_display}</div>
//                     <div
//                         style={{
//                             borderTop: '1px solid #e0e0e0',
//                             margin: '4px 0',
//                         }}
//                     ></div>
//                     <div>{evidenceStatuses.find((status) => status.value === params.row.status_display)?.label || params.row.status_display}</div>
//                 </div>
//             ),
//         },
//         {
//             field: 'case',
//             headerName: 'Дело',
//             flex: 1,
//             sortable: false,
//             renderCell: (params) => {
//                 const { case_id, case_name } = params.row;
//                 if (case_id) {
//                     return (
//                         <Button
//                             sx={{
//                                 margin: '10px 0px'
//                             }}
//                             variant="text"
//                             color="primary"
//                             onClick={() => navigate(`/cases/${case_id}/`)}
//                             startIcon={<OpenInNewIcon />}
//                         >
//                             {case_name}
//                         </Button>
//                     );
//                 } else {
//                     return 'Не назначено';
//                 }
//             },
//         },
//         {
//             field: 'department_name',
//             headerName: 'Отделение',
//             flex: 1,
//             sortable: false,
//             renderCell: (params) => <div style={{ margin: '10px 0px' }}>{params.row.department_name}</div>,
//         },
//         {
//             field: 'actions',
//             headerName: 'Действие',
//             flex: 1,
//             sortable: false,
//             renderCell: (params) => (
//                 (params.row.status_display === 'DESTROYED' || params.row.status_display === 'TAKEN') ? (
//                     <Tooltip title="Скачать документ">
//                         <IconButton
//                             color="primary"
//                             onClick={() => CheckAssociatedDocument(params.row.id)}
//                             // href={CheckAssociatedDocument(params.row.id).file}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                         >
//                             <GetAppIcon />
//                         </IconButton>
//                     </Tooltip>
//                 ) : (
//                     <Button
//                         variant="outlined"
//                         size="small"
//                         sx={{
//                             margin: '10px 0px'
//                         }}
//                         onClick={() => handlePrintEvidenceBarcode(params.row)}
//                     >
//                         Печать Штрихкода
//                     </Button >
//                 )
//             ),
//         },
//     ];
//
//     // Функция для динамической настройки высоты строк
//     const getRowHeight = (params) => {
//         const lineHeight = 20; // Высота одной строки текста
//         const padding = 16; // Отступы внутри ячейки
//
//         const nameLength = params.model?.name?.length || 0;
//         const descriptionLength = params.model?.description?.length || 0;
//         const typeLength = params.model?.type_display?.length || 0;
//         const statusLength = params.model?.status_display?.length || 0;
//
//         const nameLines = Math.ceil(nameLength / 30);
//         const descriptionLines = Math.ceil(descriptionLength / 30);
//         const typeLines = Math.ceil(typeLength / 30);
//         const statusLines = Math.ceil(statusLength / 30);
//
//         const evidenceLines = nameLines + descriptionLines + 2; // +2 для разделителя и отступов
//         const typeStatusLines = typeLines + statusLines + 2;
//
//         const totalLines = Math.max(evidenceLines, typeStatusLines) + 2; // +2 для дополнительного пространства
//
//         return totalLines * lineHeight + padding;
//     };
//
//     return (
//         <>
//             <Paper sx={{ width: '100%', mt: 2 }}>
//                 {isLoading ? (
//                     <Loading />
//                 ) : (
//                     <DataGrid
//                         rows={rows}
//                         columns={columns}
//                         autoHeight
//                         disableColumnMenu
//                         disableSelectionOnClick
//                         hideFooter
//                         getRowHeight={getRowHeight}
//                         sx={{
//                             '& .MuiDataGrid-cell': {
//                                 whiteSpace: 'normal',
//                                 wordWrap: 'break-word',
//                                 overflow: 'visible',
//                                 lineHeight: '1.5',
//                                 display: 'block',
//                             },
//                             '& .MuiDataGrid-cell:focus': {
//                                 outline: 'none',
//                             },
//                             '& .MuiDataGrid-row': {
//                                 alignItems: 'flex-start',
//                             },
//                             '& .MuiDataGrid-columnHeaders': {
//                                 backgroundColor: 'grey.200',
//                                 borderBottom: '1px solid',
//                                 borderColor: 'divider',
//                             },
//                         }}
//                     />
//                 )}
//             </Paper>
//
//             {/* Диалог для отображения штрихкода */}
//             {/* {scannedBarcode && ( */}
//             <DialogSeenBarcode
//                 open={openBarcodeDisplayDialog}
//                 setOpenBarcodeDialog={() => setOpenBarcodeDisplayDialog(false)}
//                 barcodeValueToDisplay={scannedBarcode}
//                 setSnackbar={setSnackbar}
//             // barcodeRef={barcodeRef}
//             // handlePrintBarcode={handlePrintBarcode}
//             />
//         </>
//     );
// }
