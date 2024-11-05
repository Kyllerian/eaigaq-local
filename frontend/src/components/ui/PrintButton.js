import { Print as PrintIcon,  } from '@mui/icons-material';
import { StyledButton } from './StyledComponents';


export default function PrintButton({ handlePrint, text }) {
    return (
        <>
            <StyledButton
              onClick={handlePrint}
              startIcon={<PrintIcon />}
              sx={{ mr: 2 }}
            >
              {text}
            </StyledButton>
        </>
    );
}