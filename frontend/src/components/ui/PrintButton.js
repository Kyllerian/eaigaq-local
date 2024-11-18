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
              <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>{text}</span>
            </StyledButton>
        </>
    );
}