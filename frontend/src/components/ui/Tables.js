// frontend/src/components/ui/Tables.js

import React, { forwardRef } from 'react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { LicenseInfo } from '@mui/x-license';
import { useTheme } from '@emotion/react';

// Устанавливаем лицензионный ключ (замените на ваш собственный ключ)
LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

const StyledDataGridPro = forwardRef(({ rows, columns, selected, selected_column, handleRowClick, sx, ...props }, ref) => {
    const theme = useTheme();
    return (
        <DataGridPro ref={ref}
            rows={rows}
            columns={columns}
            disableColumnMenu
            disableSelectionOnClick
            hideFooter
            getRowHeight={() => "auto"}
            onRowClick={(params) => selected ? handleRowClick(params.row) : ''}
            getRowClassName={(params) =>
                selected && selected_column && selected_column.id === params.id ? 'selected-row' : ''
            }
            sx={{
                '& .MuiDataGrid-cell': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    padding: theme.spacing(1),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: theme.palette.grey[100],
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    fontWeight: 'bold',
                    outline: 'none',
                },
                '& .MuiDataGrid-columnHeader:focus': {
                    outline: 'none',
                },
                '& .MuiDataGrid-columnHeader:focus-within': {
                    outline: 'none',
                },
                '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 'bold',
                },
                '& .MuiDataGrid-row': {
                    '&:nth-of-type(odd)': {
                        backgroundColor: theme.palette.action.hover,
                    },
                    cursor: selected ? 'pointer' : 'inherit',
                },
                '& .MuiDataGrid-row:hover': {
                    backgroundColor: selected ? theme.palette.action.selected : "transparent",
                    '&:nth-of-type(odd)': {
                        backgroundColor: selected ? theme.palette.action.selected : theme.palette.action.hover,
                    },
                },
                '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                },
                '& .MuiDataGrid-row:focus': {
                    outline: 'none',
                },
                '& .MuiDataGrid-cell:focus-within': {
                    outline: 'none',
                },
                '& .MuiDataGrid-row.Mui-selected': {
                    '&:hover': {
                        '&:nth-of-type(odd)': {
                            backgroundColor: selected ? theme.palette.action.selected : theme.palette.action.hover,
                        },
                        backgroundColor: selected ? theme.palette.action.selected : "initial",
                    },
                    backgroundColor: 'inherit',
                    '&:nth-of-type(odd)': {
                        backgroundColor: theme.palette.action.hover,
                    },
                },
                '& .selected-row': {
                    backgroundColor: "rgba(25, 118, 210, 0.08) !important",
                    color: theme.palette.text.primary,
                    fontWeight: '500',
                    boxShadow: `
                        inset 0 0 10px rgba(0, 0, 0, 0.1), 
                        0 4px 6px rgba(0, 0, 0, 0.05)`,
                    transition: 'all 0.1s ease-in-out',
                },
                ...sx
            }}
            {...props}
        />
    );
});

StyledDataGridPro.displayName = 'StyledDataGridPro';

export { StyledDataGridPro }