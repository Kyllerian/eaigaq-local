import {
    Typography,
} from '@mui/material';

import { formatDate } from '../../../constants/formatDate';
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";

export default function PrintLoginDetails({ loginDetailsRef, newEmployeeCreated, employeePassword }) {
    return (
        <>
            <div style={{ display: 'none' }}>
                <div
                    ref={loginDetailsRef}
                    style={{
                        padding: '20px',
                        fontFamily: 'Arial, sans-serif',
                        color: '#000',
                    }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <img
                            src={LogoMVDKZ}
                            alt="Логотип"
                            style={{ maxWidth: '100px', marginBottom: '10px' }}
                        />
                        <Typography variant="h4" gutterBottom>
                            Данные для входа сотрудника
                        </Typography>
                        <Typography variant="subtitle1">
                            Дата создания: {formatDate(new Date().toISOString())}
                        </Typography>
                    </div>

                    {/* Employee Details */}
                    <Typography variant="body1" gutterBottom>
                        <strong>Имя пользователя:</strong> {newEmployeeCreated?.username}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Пароль:</strong> {employeePassword}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Имя:</strong> {newEmployeeCreated?.first_name}{' '}
                        {newEmployeeCreated?.last_name}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        <strong>Роль:</strong> {newEmployeeCreated?.role_display}
                    </Typography>
                    {newEmployeeCreated?.department && (
                        <Typography variant="body1" gutterBottom>
                            <strong>Отделение:</strong> {newEmployeeCreated.department.name}
                        </Typography>
                    )}

                    {/* Footer */}
                    <div style={{ marginTop: '40px', textAlign: 'center' }}>
                        <Typography variant="body2">
                            © {new Date().getFullYear()} Министерство внутренних дел Республики
                            Казахстан.
                        </Typography>
                    </div>
                </div>
            </div>
        </>
    );
}
