import { forwardRef } from 'react';
import {
    Button,
} from '@mui/material';
import CameraIcon from '@mui/icons-material/Camera';

const BiometricAuthButton = forwardRef(({ onClick, text, ...props }, ref) => {
    return (
        <Button ref={ref}
        variant="contained"
        color="primary"
        onClick={onClick}
        sx={{
          mb: 2,
          padding: '0.75em 1.5em',
          borderRadius: '30px',
          display: 'flex',
          m: 'auto',
          fontWeight: 'bold',
          fontSize: '1rem',
          textTransform: 'none',
        }}
        startIcon={<CameraIcon />}
        {...props}
      >
        <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}> {text} </span>
      </Button>
    )
})

BiometricAuthButton.displayName = "BiometricAuthButton";

export { BiometricAuthButton }