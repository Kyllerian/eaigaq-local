import { IconButton, } from '@mui/material';
import { ArrowBack as ArrowBackIcon, } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function BackButton() {
    const navigate = useNavigate();
    return (
        <>
            <IconButton
                edge="start"
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{ mr: 1 }}
            >
                <ArrowBackIcon />
            </IconButton>
        </>
    );
}