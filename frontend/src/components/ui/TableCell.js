import { forwardRef, useRef, useEffect, useState } from 'react';
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


const TableCellWrap = forwardRef(({ children, ...props }, ref) => {
    return (
        <TableCell ref={ref}
            sx={{
                whiteSpace: 'wrap',
                textWrap: 'wrap',
                overflowWrap: 'anywhere',
            }}
            {...props}
        >
            {children}
        </TableCell>
    )
})

TableCellWrap.displayName = "TableCellWrap";

const ResizableTableCell = (({ width, onResize, children, ...props }) => {
    const cellRef = useRef(null);
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = (e) => {
        setIsResizing(true);
    };

    const handleMouseMove = (e) => {
        if (!isResizing) return;
        const newWidth = e.clientX - cellRef.current.getBoundingClientRect().left;
        if (newWidth > 50) { // Минимальная ширина 50px
            onResize(newWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return (
        <TableCell
            {...props}
            ref={cellRef}
            style={{ width, minWidth: width, maxWidth: width, position: 'relative', userSelect: 'none', borderRight: '1px rgba(0,0,0,0.4) solid', textAlign: 'center', textOverflow: 'ellipsis', overflow: 'hidden', }}
        >
            {children}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '5px',
                    cursor: 'col-resize',
                    userSelect: 'none',
                    height: '100%',
                }}
            />
        </TableCell>
    );
});

export { TableCellSx, TableCellWrap, ResizableTableCell }