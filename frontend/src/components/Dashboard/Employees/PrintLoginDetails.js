// src\components\Dashboard\Employees\PrintLoginDetails.js
import {
    Typography,
} from '@mui/material';

import { formatDate } from '../../../constants/formatDate';
import LogoMVDKZ from "../../../assets/Logo_MVD_KZ.webp";
import { useTranslation } from 'react-i18next';

export default function PrintLoginDetails({ loginDetailsRef, newEmployeeCreated, employeePassword }) {
    const { t } = useTranslation();

    return (
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
                        alt={t('common.logo_alt')}
                        style={{ maxWidth: '100px', marginBottom: '10px' }}
                    />
                    <Typography variant="h4" gutterBottom>
                        {t('common.report.titles.report_login_data_employee')}
                    </Typography>
                    <Typography variant="subtitle1">
                        {t('common.report.created_date_label')}:{' '}{formatDate(new Date().toISOString())}
                    </Typography>
                </div>

                {/* Employee Details */}
                <Typography variant="body1" gutterBottom>
                    <strong>{t('common.logins.input_name')}:</strong> {newEmployeeCreated?.username}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>{t('common.logins.password')}:</strong> {employeePassword}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>{t('common.standard.label_first_name')}:</strong>{' '}
                    {newEmployeeCreated?.first_name}{' '}
                    {newEmployeeCreated?.last_name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>{t('common.standard.label_role')}:</strong> {newEmployeeCreated?.role_display}
                </Typography>
                {newEmployeeCreated?.department && (
                    <Typography variant="body1" gutterBottom>
                        <strong>{t('common.standard.label_department')}:</strong> {newEmployeeCreated.department.name}
                    </Typography>
                )}

                {/* Footer */}
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <Typography variant="body2">
                        {t('common.report.footer_message', {
                            currentYear: new Date().getFullYear(),
                        })}
                    </Typography>
                </div>
            </div>
        </div>
    );
}
