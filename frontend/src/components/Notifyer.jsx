import { Alert, Snackbar } from '@mui/material';

export default function Notifyer({ snackbarOpened, setSnackbarOpen, message, severity }) {

    const handleSnackbarClose = () => {
        setSnackbarOpen({
            severity: severity,
            message: message,
            open: false
        });
    };
    return (
        <Snackbar
            open={snackbarOpened}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert
                onClose={handleSnackbarClose}
                severity={severity}
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}
