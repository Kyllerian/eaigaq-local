// frontend/src/components/Dashboard/Affairs/Table.js
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { Paper, Box, Typography } from '@mui/material';
import Loading from '../../Loading';
import { formatDate } from '../../../constants/formatDate';
import { LicenseInfo } from '@mui/x-license';
import { useTheme } from '@emotion/react';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { StyledDataGridPro } from '../../ui/Tables';

// Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

export default function AffairsTable({
    user,
    isLoading,
    cases,
    handleCaseSelect,
    selectedCase,
    sortConfig,
    setSortConfig,
}) {
    const theme = useTheme();
    const tableContainerRef = useRef(null);
    const stripeRef = useRef(null);
    const [stripeStyle, setStripeStyle] = useState({
        top: 0,
        height: 0,
    });

    // Обработка сортировки при клике на заголовки колонок
    const handleSortClick = (field) => {
        console.log(sortConfig, 'field Sort', field);
        let direction = 'asc';
        if (sortConfig.key === field && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        console.log({ key: field, direction }, 'field Sort direction', direction);
        setSortConfig({ key: field, direction });
    };

    // Определение колонок для DataGrid
    const columns = useMemo(
        () => [
            {
                field: 'name',
                headerName: 'Дело',
                flex: 30,
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
                field: 'investigator_name',
                headerName: 'Следователь и отделение',
                flex: 15,
                minWidth: 100,
                sortable: false,
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.investigator_name}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {params.row.department_name || 'Не указано'}
                        </Typography>
                    </Box>
                ),
            },
            {
                field: 'created',
                headerName: 'Дата создания и обновления',
                flex: 10,
                minWidth: 100,
                sortable: false,
                renderHeader: () => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
                        <div
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleSortClick('created')}
                        >
                            Дата создания
                            {sortConfig.key === 'created' && (
                                // Используем иконки MUI вместо символов
                                sortConfig.direction === 'asc' ? (
                                    <ArrowUpward fontSize="small" />
                                ) : (
                                    <ArrowDownward fontSize="small" />
                                )
                            )}
                        </div>
                        <div
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleSortClick('updated')}
                        >
                            Дата обновления
                            {sortConfig.key === 'updated' && (
                                // Используем иконки MUI для сортировки по дате обновления
                                sortConfig.direction === 'asc' ? (
                                    <ArrowUpward fontSize="small" />
                                ) : (
                                    <ArrowDownward fontSize="small" />
                                )
                            )}
                        </div>
                    </div>
                ),
                // renderHeader: () => (
                //     <div style={{display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0'}}>
                //         <div
                //             style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
                //             onClick={() => handleSortClick('created')}
                //         >
                //             Дата создания
                //             {sortConfig.key === 'created' && (
                //                 <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                //             )}
                //         </div>
                //         <div
                //             style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
                //             onClick={() => handleSortClick('updated')}
                //         >
                //             Дата обновления
                //             {sortConfig.key === 'updated' && (
                //                 <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                //             )}
                //         </div>
                //     </div>
                // ),
                renderCell: (params) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography
                            variant="body2"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {formatDate(params.row.created)}
                        </Typography>
                        <Typography
                            variant="body2"
                            color="textSecondary"
                            noWrap
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            {formatDate(params.row.updated)}
                        </Typography>
                    </Box>
                ),
            },
        ],
        [sortConfig]
    );

    // Преобразование данных в формат, подходящий для DataGrid
    const rows = useMemo(
        () =>
            cases.map((caseItem) => ({
                id: caseItem.id,
                name: caseItem.name || 'Без названия',
                description: caseItem.description || 'Описание не указано',
                investigator_name: caseItem.investigator_name || 'Не указано',
                department_name: caseItem.department_name || 'Не указано',
                created: caseItem.created || '',
                updated: caseItem.updated || '',
            })),
        [cases]
    );

    // Обработка клика по строке
    const handleRowClick = (params) => {
        const caseItem = cases.find((item) => item.id === params.id);
        handleCaseSelect(caseItem);
    };

    // Обновление позиции полоски при изменении выбранной строки
    useEffect(() => {
        const updateStripe = () => {
            if (!selectedCase || !tableContainerRef.current) {
                setStripeStyle({ top: 0, height: 0 });
                return;
            }

            // Найти DOM элемент выбранной строки
            const rowElement = tableContainerRef.current.querySelector(`[data-id="${selectedCase.id}"]`);
            if (rowElement) {
                const tableRect = tableContainerRef.current.getBoundingClientRect();
                const rowRect = rowElement.getBoundingClientRect();

                const top = rowRect.top - tableRect.top + tableContainerRef.current.scrollTop;
                const height = rowRect.height;

                setStripeStyle({
                    top: top,
                    height: height,
                });
            } else {
                // Выбранная строка не видна (из-за виртуализации)
                setStripeStyle({ top: 0, height: 0 });
            }
        };

        // Инициализировать положение полоски
        updateStripe();

        // Добавить обработчики событий для обновления полоски при скролле и изменении размера
        const scrollableContainer = tableContainerRef.current.querySelector('.MuiDataGrid-virtualScroller');
        if (scrollableContainer) {
            scrollableContainer.addEventListener('scroll', updateStripe);
        }

        window.addEventListener('resize', updateStripe);

        // Очистка при размонтировании
        return () => {
            if (scrollableContainer) {
                scrollableContainer.removeEventListener('scroll', updateStripe);
            }
            window.removeEventListener('resize', updateStripe);
        };
    }, [selectedCase, cases]);

    return (
        <Box sx={{ position: 'relative' }} ref={tableContainerRef}>
            {/* Полоска индикатора */}
            <Box
                sx={{
                    position: 'absolute',
                    left: 10, // Позиционируем полоску слева от таблицы
                    top: stripeStyle.top,
                    width: 6,
                    height: stripeStyle.height,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '4px 0 0 4px',
                    transition: 'top 0.2s, height 0.2s',
                    zIndex: 1, // Убедитесь, что полоска находится поверх таблицы
                }}
            />

            <Paper
                sx={{
                    width: '100%',
                    mt: 2,
                    p: 2,
                    boxShadow: 3,
                    boxSizing: 'border-box',
                    overflow: 'visible', // Разрешаем элементам выходить за пределы Paper
                }}
            >
                {isLoading ? (
                    <Loading />
                ) : (

                    <StyledDataGridPro rows={rows}
                        columns={columns.map((col) => ({
                            ...col,
                            flex: col.flex || 1,
                            minWidth: col.minWidth || 150,
                        }))} 
                        selected={true}
                        selected_column={selectedCase}
                        handleRowClick={handleRowClick}
                    />
                    // <DataGridPro
                    //     rows={rows}
                    //     columns={columns.map((col) => ({
                    //         ...col,
                    //         flex: col.flex || 1,
                    //         minWidth: col.minWidth || 150,
                    //     }))}
                    //     disableColumnMenu
                    //     disableSelectionOnClick
                    //     getRowHeight={() => 'auto'}
                    //     hideFooter
                    //     sortingMode="server"
                    //     onRowClick={(params) => handleRowClick(params.row)}
                    //     getRowClassName={(params) =>
                    //         selectedCase && selectedCase.id === params.id ? 'selected-row' : ''
                    //     }
                    //     sx={{
                    //         '& .MuiDataGrid-cell': {
                    //             whiteSpace: 'nowrap',
                    //             overflow: 'hidden',
                    //             textOverflow: 'ellipsis',
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
                    //             cursor: 'pointer',
                    //         },
                    //         '& .MuiDataGrid-row:hover': {
                    //             backgroundColor: theme.palette.action.selected,
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
                    //         '& .selected-row': {
                    //             backgroundColor: "rgba(25, 118, 210, 0.08) !important",
                    //             color: theme.palette.text.primary,
                    //             fontWeight: '500',
                    //             boxShadow: `
                    //                 inset 0 0 10px rgba(0, 0, 0, 0.1), 
                    //                 0 4px 6px rgba(0, 0, 0, 0.05)`,
                    //             // borderRadius: '4px',
                    //             transition: 'all 0.1s ease-in-out',
                    //             // Убираем borderLeft, так как полоска отдельно
                    //         },
                    //     }}
                    // />
                )}
            </Paper>
        </Box>
    );
}
// // frontend/src/components/Dashboard/Affairs/Table.js
// import React, {useMemo} from 'react';
// import {DataGrid} from '@mui/x-data-grid';
// import {Box, Paper, Typography} from '@mui/material';
// import Loading from '../../Loading';
// import {formatDate} from '../../../constants/formatDate';
// import {DataGridPro} from '@mui/x-data-grid-pro';
// import {LicenseInfo} from '@mui/x-license';
// // import {useTheme} from '@emotion/react';
// import { useTheme } from '@mui/material/styles';
// // Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
// LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

// export default function AffairsTable({
//                                          user,
//                                          isLoading,
//                                          cases,
//                                          handleCaseSelect,
//                                          selectedCase,
//                                          sortConfig,
//                                          setSortConfig,
//                                      }) {
//     const theme = useTheme();

//     // Обработка сортировки при клике на заголовки колонок
//     const handleSortClick = (field) => {
//         console.log(sortConfig, 'field Sort', field)
//         let direction = 'asc';
//         if (sortConfig.key === field && sortConfig.direction === 'asc') {
//             direction = 'desc';
//         }
//         console.log({key: field, direction}, 'field Sort direction', direction)
//         setSortConfig({key: field, direction});
//     };

//     // Определение колонок для DataGrid
//     const columns = useMemo(
//         () => [
//             {
//                 field: 'name', // Обновлено: соответствует ключу в rows
//                 headerName: 'Дело',
//                 flex: 1,
//                 minWidth: 200,
//                 sortable: false,
//                 renderCell: (params) => (
//                     <Box sx={{display: 'flex', flexDirection: 'column'}}>
//                         <Typography
//                             variant="subtitle2"
//                             noWrap
//                             sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}
//                         >
//                             {params.row.name}
//                         </Typography>
//                         <Typography
//                             variant="body2"
//                             color="textSecondary"
//                             noWrap
//                             sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}
//                         >
//                             {params.row.description}
//                         </Typography>
//                     </Box>
//                     // <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
//                     //     <div style={{ fontWeight: 'bold' }}>{params.row.name}</div>
//                     //     <div
//                     //         style={{
//                     //             borderTop: '1px solid #e0e0e0',
//                     //             margin: '4px 0',
//                     //         }}
//                     //     ></div>
//                     //     <div>{params.row.description}</div>
//                     // </div>
//                 ),
//             },
//             {
//                 field: 'investigator_name', // Обновлено
//                 headerName: 'Следователь и отделение',
//                 flex: 1,
//                 minWidth: 100,
//                 sortable: false,
//                 renderCell: (params) => (
//                     <Box sx={{display: 'flex', flexDirection: 'column'}}>
//                         <Typography
//                             variant="body2"
//                             noWrap
//                             sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}
//                         >
//                             {params.row.investigator_name}
//                         </Typography>
//                         <Typography
//                             variant="body2"
//                             color="textSecondary"
//                             noWrap
//                             sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}
//                         >
//                             {params.row.department_name || 'Не указано'}
//                         </Typography>
//                     </Box>
//                     // <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
//                     //     <div>{params.row.investigator_name}</div>
//                     //     <div
//                     //         style={{
//                     //             borderTop: '1px solid #e0e0e0',
//                     //             margin: '4px 0',
//                     //         }}
//                     //     ></div>
//                     //     <div>{params.row.department_name || 'Не указано'}</div>
//                     // </div>
//                 ),
//             },
//             {
//                 field: 'created', // Обновлено
//                 headerName: 'Дата создания и обновления',
//                 flex: 1,
//                 minWidth: 100,
//                 sortable: false,
//                 renderHeader: () => (
//                     <div style={{display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0'}}>
//                         <div
//                             style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
//                             onClick={() => handleSortClick('created')}
//                         >
//                             Дата создания
//                             {sortConfig.key === 'created' && (
//                                 <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
//                             )}
//                         </div>
//                         <div
//                             style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
//                             onClick={() => handleSortClick('updated')}
//                         >
//                             Дата обновления
//                             {sortConfig.key === 'updated' && (
//                                 <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
//                             )}
//                         </div>
//                     </div>
//                 ),
//                 renderCell: (params) => (
//                     <Box sx={{display: 'flex', flexDirection: 'column'}}>
//                         <Typography
//                             variant="body2"
//                             noWrap
//                             sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}
//                         >
//                             {formatDate(params.row.created)}
//                         </Typography>
//                         <Typography
//                             variant="body2"
//                             color="textSecondary"
//                             noWrap
//                             sx={{overflow: 'hidden', textOverflow: 'ellipsis'}}
//                         >
//                             {formatDate(params.row.updated)}
//                         </Typography>
//                     </Box>
//                     // <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
//                     //     <div>{formatDate(params.row.created)}</div>
//                     //     <div
//                     //         style={{
//                     //             borderTop: '1px solid #e0e0e0',
//                     //             margin: '4px 0',
//                     //         }}
//                     //     ></div>
//                     //     <div>{formatDate(params.row.updated)}</div>
//                     // </div>
//                 ),
//             },
//         ],
//         [sortConfig]
//     );

//     // Преобразование данных в формат, подходящий для DataGrid
//     const rows = useMemo(
//         () =>
//             cases.map((caseItem) => ({
//                 id: caseItem.id,
//                 name: caseItem.name || 'Без названия', // Если имя отсутствует
//                 description: caseItem.description || 'Описание не указано', // Если описание отсутствует
//                 investigator_name: caseItem.investigator_name || 'Не указано', // Если следователь не указан
//                 department_name: caseItem.department_name || 'Не указано', // Если отделение не указано
//                 created: caseItem.created || '', // Если дата создания отсутствует
//                 updated: caseItem.updated || '', // Если дата обновления отсутствует
//             })),
//         [cases]
//     );


//     // Обработка клика по строке
//     const handleRowClick = (params) => {
//         const caseItem = cases.find((item) => item.id === params.id);
//         handleCaseSelect(caseItem);
//     };

//     return (
//         <Paper
//             sx={{
//                 width: '100%',
//                 mt: 2,
//                 p: 2,
//                 boxShadow: 3,
//                 boxSizing: 'border-box',
//                 overflow: 'visible', // Разрешаем элементам выходить за пределы Paper
//             }}
//         >
//             {isLoading ? (
//                 <Loading/>
//             ) : (
//                 <DataGridPro
//                     rows={rows}
//                     columns={columns.map((col) => ({
//                         ...col,
//                         flex: col.flex || 1,
//                         minWidth: col.minWidth || 150,
//                     }))}
//                     disableColumnMenu
//                     disableSelectionOnClick
//                     getRowHeight={() => 'auto'}
//                     hideFooter
//                     sortingMode="server"

//                     onRowClick={(params) => handleRowClick(params.row)}
//                     getRowClassName={(params) =>
//                         selectedCase && selectedCase.id === params.id ? 'selected-row' : ''
//                     }
//                     sx={{
//                         '& .MuiDataGrid-cell': {
//                             whiteSpace: 'nowrap',
//                             //overflow: 'hidden',
//                             textOverflow: 'ellipsis',
//                             padding: theme.spacing(1),
//                             borderBottom: `1px solid ${theme.palette.divider}`,
//                             overflow: 'visible',
//                         },
//                         '& .MuiDataGrid-columnHeaders': {
//                             backgroundColor: theme.palette.grey[100],
//                             borderBottom: `1px solid ${theme.palette.divider}`,
//                             fontWeight: 'bold',
//                             outline: 'none',
//                             overflow: 'visible',
//                         },
//                         '& .MuiDataGrid-columnHeader:focus': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-columnHeader:focus-within': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-columnHeaderTitle': {
//                             fontWeight: 'bold',
//                         },
//                         '& .MuiDataGrid-row': {
//                             '&:nth-of-type(odd)': {
//                                 backgroundColor: theme.palette.action.hover,
//                             },
//                             cursor: 'pointer',
//                             overflow: 'visible',
//                         },
//                         '& .MuiDataGrid-row:hover': {
//                             backgroundColor: theme.palette.action.selected,
//                         },
//                         '& .MuiDataGrid-cell:focus': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-row:focus': {
//                             outline: 'none',
//                         },
//                         '& .MuiDataGrid-cell:focus-within': {
//                             outline: 'none',
//                         },
//                         '& .selected-row': {
//                             backgroundColor: theme.palette.primary.light,
//                             color: theme.palette.text.primary,
//                             position: 'relative', // Для управления позиционированием полоски
//                             fontWeight: '500',
//                             boxShadow: `
//                             inset 0 0 10px rgba(0, 0, 0, 0.1),
//                             0 4px 6px rgba(0, 0, 0, 0.05)`,
//                             borderRadius: '4px',
//                             transition: 'all 0.1s ease-in-out',
//                             '&::before': {
//                                 content: '""', // Создаём псевдоэлемент
//                                 position: 'absolute',
//                                 top: 0,
//                                 left: '-6px', // Выносим полоску за пределы таблицы
//                                 height: '100%',
//                                 width: '6px',
//                                 backgroundColor: theme.palette.primary.main, // Цвет полоски
//                                 borderRadius: '4px 0 0 4px', // Скругляем только левый край
//                                 zIndex: 1,
//                             },

//                         },
//                         // Добавляем следующие стили для разрешения переполнения
//                         '& .MuiDataGrid-root': {
//                             overflow: 'visible',
//                         },
//                         '& .MuiDataGrid-main': {
//                             overflow: 'visible !important',
//                         },
//                         '& .MuiDataGrid-window': {
//                             overflow: 'visible !important',
//                         },
//                         '& .MuiDataGrid-virtualScroller': {
//                             overflow: 'visible !important',
//                         },
//                         '& .MuiDataGrid-virtualScrollerContent': {
//                             overflow: 'visible !important',
//                         },
//                         '& .MuiDataGrid-virtualScrollerRenderZone': {
//                             overflow: 'visible !important',
//                         },

//                     }}
//                 />
//             )}
//         </Paper>
//     );

// return (
//     <Paper sx={{ width: '100%', mt: 2, p: 2, boxShadow: 3, boxSizing: 'border-box', }}>
//         {isLoading ? (
//             <Loading />
//         ) : (
//             <DataGridPro
//                 rows={rows}
//                 columns={columns.map((col) => ({
//                     ...col,
//                     flex: col.flex || 1,
//                     minWidth: col.minWidth || 150,
//                 }))}
//                 disableColumnMenu
//                 disableSelectionOnClick
//                 getRowHeight={() => 'auto'}
//                 hideFooter
//                 sortingMode="server"
//                 onRowClick={(params) => handleRowClick(params.row)}
//                 getRowClassName={(params) =>
//                     selectedCase && selectedCase.id === params.id ? 'selected-row' : ''
//                 }
//                 // getRowHeight={getRowHeight}
//                 sx={{
//                     '& .MuiDataGrid-cell': {
//                         whiteSpace: 'nowrap',
//                         overflow: 'hidden',
//                         textOverflow: 'ellipsis',
//                         padding: theme.spacing(1),
//                         borderBottom: `1px solid ${theme.palette.divider}`,
//                     },
//                     '& .MuiDataGrid-columnHeaders': {
//                         backgroundColor: theme.palette.grey[100],
//                         borderBottom: `1px solid ${theme.palette.divider}`,
//                         fontWeight: 'bold',
//                         outline: 'none',
//                     },
//                     '& .MuiDataGrid-columnHeader:focus': {
//                         outline: 'none',
//                     },
//                     '& .MuiDataGrid-columnHeader:focus-within': {
//                         outline: 'none',
//                     },
//                     '& .MuiDataGrid-columnHeaderTitle': {
//                         fontWeight: 'bold',
//                     },
//                     '& .MuiDataGrid-row': {
//                         '&:nth-of-type(odd)': {
//                             backgroundColor: theme.palette.action.hover,
//                         },
//                         '& .Mui-selected': {
//                             backgroundColor: 'transparent',
//                         },
//                         cursor: 'pointer',
//                     },
//                     '& .MuiDataGrid-row.Mui-selected': {
//                         backgroundColor: 'transparent',
//                     },
//                     '& .MuiDataGrid-row:hover': {
//                         backgroundColor: theme.palette.action.selected,
//                     },
//                     '& .MuiDataGrid-cell:focus': {
//                         outline: 'none',
//                     },
//                     '& .MuiDataGrid-row:focus': {
//                         outline: 'none',
//                     },
//                     '& .MuiDataGrid-cell:focus-within': {
//                         outline: 'none',
//                     },
//                     '& .selected-row': {
//                         backgroundColor: theme.palette.primary.light,
//                         color: theme.palette.text.primary,
//                         position: 'relative', // Для управления позиционированием полоски
//                         fontWeight: '500',
//                         boxShadow: `
//                             inset 0 0 10px rgba(0, 0, 0, 0.1),
//                             0 4px 6px rgba(0, 0, 0, 0.05)`,
//                         borderRadius: '4px',
//                         transition: 'all 0.1s ease-in-out',
//                         '&::before': {
//                             content: '""', // Создаём псевдоэлемент
//                             position: 'absolute',
//                             top: 0,
//                             left: '-6px', // Выносим полоску за пределы таблицы
//                             height: '100%',
//                             width: '6px',
//                             backgroundColor: theme.palette.primary.main, // Цвет полоски
//                             borderRadius: '4px 0 0 4px', // Скругляем только левый край
//                         },
//                     },
//
//                     // '& .selected-row': {
//                     //     backgroundColor: "rgba(25, 118, 210, 0.08) !important",
//                     //     color: theme.palette.text.primary,
//                     //     borderLeft: `6px solid ${theme.palette.primary.main}`,
//                     //     fontWeight: '500',
//                     //     boxShadow: `
//                     //         inset 0 0 10px rgba(0, 0, 0, 0.1),
//                     //         0 4px 6px rgba(0, 0, 0, 0.05)`,
//                     //     borderRadius: '4px',
//                     //     transition: 'all 0.1s ease-in-out',
//                     // },
//                 }}
//             />
//         )}
//     </Paper>
// );
////}