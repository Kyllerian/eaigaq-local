import { forwardRef } from 'react';
import {
    TableCell,
} from '@mui/material';

const TableCellSx = forwardRef(({ children, ...props }, ref) => {
    return (
        <TableCell ref={ref}
            sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
            {...props}
        >
            {children}
        </TableCell>
    )
})

TableCellSx.displayName = "TableCellSx";

export { TableCellSx }