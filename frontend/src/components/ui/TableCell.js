// frontend/src/components/ui/TableCell.js

import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import { TableCell } from '@mui/material';

// Компонент TableCellSx для ячеек с обрезкой текста
export const TableCellSx = forwardRef(({ children, ...props }, ref) => {
    return (
        <TableCell
            ref={ref}
            sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}
            {...props}
        >
            {children}
        </TableCell>
    );
});

TableCellSx.displayName = 'TableCellSx';

// Компонент TableCellWrap для ячеек с переносом текста
export const TableCellWrap = forwardRef(({ children, ...props }, ref) => {
    return (
        <TableCell
            ref={ref}
            sx={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
            }}
            {...props}
        >
            {children}
        </TableCell>
    );
});

TableCellWrap.displayName = 'TableCellWrap';

// Компонент ResizableTableCell для ячеек с возможностью изменения ширины
export const ResizableTableCell = ({ width, onResize, children, ...props }) => {
    const cellRef = useRef(null);
    const [currentWidth, setCurrentWidth] = useState(width);
    const [isResizing, setIsResizing] = useState(false);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const handleMouseDown = (e) => {
        setIsResizing(true);
        startXRef.current = e.clientX;
        startWidthRef.current = cellRef.current.offsetWidth;
        e.preventDefault();
    };

    const handleMouseMove = useCallback(
        (e) => {
            if (!isResizing) return;
            const deltaX = e.clientX - startXRef.current;
            let newWidth = startWidthRef.current + deltaX;
            if (newWidth < 50) {
                newWidth = 50; // Минимальная ширина 50px
            }
            setCurrentWidth(newWidth);
            if (onResize) {
                onResize(newWidth);
            }
        },
        [isResizing, onResize]
    );

    const handleMouseUp = useCallback(() => {
        if (isResizing) {
            setIsResizing(false);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
        } else {
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <TableCell
            {...props}
            ref={cellRef}
            style={{
                width: currentWidth,
                minWidth: currentWidth,
                maxWidth: currentWidth,
                position: 'relative',
                userSelect: 'none',
                padding: '8px',
                boxSizing: 'border-box',
                borderRight: '1px solid rgba(224, 224, 224, 1)',
                backgroundColor: '#f5f5f5',
                fontWeight: 'bold',
                ...props.style,
            }}
        >
            {children}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '10px',
                    cursor: 'col-resize',
                    userSelect: 'none',
                    height: '100%',
                    zIndex: 1,
                }}
            />
        </TableCell>
    );
};

