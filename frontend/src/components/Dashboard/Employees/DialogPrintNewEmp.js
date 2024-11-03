import {
    Button,
    Typography,
} from '@mui/material';

import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import PrintLoginDetails from './PrintLoginDetails';


export default function DialogPrintNewEmp({  
    openPrintDialog, setOpenPrintDialog, handleClosePrintDialog, newEmployeeCreated, handlePrintLoginDetails, employeePassword, loginDetailsRef
}) {
    

    return (
        <>
            <DashboardDialog open={openPrintDialog} setOpen={setOpenPrintDialog} title={"Сотрудник успешно добавлен"}  >
                {{
                    content: (
                        <>
                            <Typography variant="body1">
                                Сотрудник{' '}
                                {newEmployeeCreated
                                    ? `${newEmployeeCreated.first_name} ${newEmployeeCreated.last_name}`
                                    : ''}
                                {' '}успешно добавлен.
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Вы хотите распечатать данные для входа сотрудника?
                            </Typography>
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleClosePrintDialog}>Нет</Button>
                            <StyledButton onClick={handlePrintLoginDetails}>
                                Да, распечатать
                            </StyledButton>
                        </>
                    )
                }}
            </DashboardDialog>

            
            {/* Hidden Print Component for Login Details */}
            <PrintLoginDetails loginDetailsRef={loginDetailsRef} newEmployeeCreated={newEmployeeCreated} employeePassword={employeePassword} />
        </>
    );
}
