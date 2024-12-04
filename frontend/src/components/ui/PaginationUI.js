import { forwardRef } from 'react';
import {
    Box,
} from '@mui/material';
import Pagination from '@mui/material/Pagination';

const PaginationStyled = forwardRef(({ totalPages, page, handleChangePage, ...props }, ref) => {
    return (
        <Box display="flex" justifyContent="center" my={2} pb={'0.8rem'}>
            <Pagination ref={ref}
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                siblingCount={1}
                boundaryCount={1}
                showFirstButton
                showLastButton
                {...props}
            />
        </Box>
    )
})

PaginationStyled.displayName = "PaginationStyled";

export { PaginationStyled }