// frontend/src/components/Dashboard/Employees/DialogNewEmployees.js

import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';
import axios from '../../../axiosConfig';

import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import DialogPrintNewEmp from './DialogPrintNewEmp';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { StyledTextField } from '../../ui/StyledTextfield';
import { useTranslation } from 'react-i18next';

export default function DialogNewEmployees({
    user,
    departments,
    setSnackbar,
    openEmployeeDialog,
    setOpenEmployeeDialog,
    refetchEmployees, // Добавляем функцию для обновления списка сотрудников
}) {

    const { t } = useTranslation();
    // Ссылки и состояния
    const loginDetailsRef = useRef();

    const [newEmployee, setNewEmployee] = useState({
        username: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        email: '',
        rank: '',
        role: 'USER',
        department: '',
        phone_number: '',
    });

    const [errors, setErrors] = useState({
        password: '',
        confirm_password: '',
        email: '',
    });

    const [employeePassword, setEmployeePassword] = useState('');
    const [newEmployeeCreated, setNewEmployeeCreated] = useState(null);
    const [openPrintDialog, setOpenPrintDialog] = useState(false);

    const handlePrintLoginDetails = useReactToPrint({
        contentRef: loginDetailsRef,
        documentTitle: t('common.report.titles.report_login_data_employee'),
        onAfterPrint: () => {
            handleClosePrintDialog();
        },
    });

    // Функция для проверки формата электронной почты
    const validateEmail = (email) => {
        // Простое регулярное выражение для проверки электронной почты
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleEmployeeInputChange = (event) => {
        const { name, value } = event.target;
        setNewEmployee({ ...newEmployee, [name]: value });

        // Выполняем валидацию
        let newErrors = { ...errors };

        if (name === 'password') {
            if (value.length < 8) {
                newErrors.password = t('dashboard.tabs.employees.dialog_new_employee.error.password_length');
            } else {
                newErrors.password = '';
            }

            // Проверяем подтверждение пароля, если оно не пустое
            if (newEmployee.confirm_password) {
                if (value !== newEmployee.confirm_password) {
                    newErrors.confirm_password = t('dashboard.tabs.employees.dialog_new_employee.error.password_confirm');
                } else {
                    newErrors.confirm_password = '';
                }
            }
        }

        if (name === 'confirm_password') {
            if (value !== newEmployee.password) {
                newErrors.confirm_password = t('dashboard.tabs.employees.dialog_new_employee.error.password_confirm');
            } else {
                newErrors.confirm_password = '';
            }
        }

        if (name === 'email') {
            if (value.trim() === '') {
                newErrors.email = t('dashboard.tabs.employees.dialog_new_employee.error.email_required');
            } else if (!validateEmail(value)) {
                newErrors.email = t('dashboard.tabs.employees.dialog_new_employee.error.email_incorrect');
            } else {
                newErrors.email = '';
            }
        }

        setErrors(newErrors);
    };

    const handleEmployeeFormSubmit = (event) => {
        event.preventDefault();

        // Выполняем финальную валидацию перед отправкой
        let finalErrors = { ...errors };

        // Проверка обязательных полей
        if (newEmployee.email.trim() === '') {
            finalErrors.email = t('dashboard.tabs.employees.dialog_new_employee.error.email_required');
        } else if (!validateEmail(newEmployee.email)) {
            finalErrors.email = t('dashboard.tabs.employees.dialog_new_employee.error.email_incorrect');
        }

        if (newEmployee.password.length < 8) {
            finalErrors.password = t('dashboard.tabs.employees.dialog_new_employee.error.password_length');
        }

        if (newEmployee.password !== newEmployee.confirm_password) {
            finalErrors.confirm_password = t('dashboard.tabs.employees.dialog_new_employee.error.password_confirm');
        }

        setErrors(finalErrors);

        // Проверяем наличие ошибок перед отправкой
        const hasErrors = Object.values(finalErrors).some((error) => error !== '');
        if (hasErrors) {
            setSnackbar({
                open: true,
                message: t('common.errors.error_fill_form'),
                severity: 'error',
            });
            return;
        }

        setEmployeePassword(newEmployee.password);
        let employeeData = { ...newEmployee };

        if (user.role === 'DEPARTMENT_HEAD') {
            employeeData.role = 'USER';
            employeeData.department_id = user.department.id;
        } else if (user.role === 'REGION_HEAD') {
            if (!employeeData.role) {
                employeeData.role = 'USER';
            }
            if (!employeeData.department) {
                setSnackbar({
                    open: true,
                    message: t('dashboard.tabs.employees.dialog_new_employee.error.select_department'),
                    severity: 'error',
                });
                return;
            }
            employeeData.department_id = employeeData.department;

            const selectedDept = departments.find(
                (dept) => dept.id === employeeData.department_id
            );
            if (!selectedDept || selectedDept.region !== user.region) {
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_department_no_region'),
                    severity: 'error',
                });
                return;
            }
        } else {
            setSnackbar({
                open: true,
                message: t('dashboard.tabs.employees.dialog_new_employee.error.no_permission'),
                severity: 'error',
            });
            return;
        }

        delete employeeData.department;
        delete employeeData.confirm_password;

        axios
            .post('/api/users/', employeeData)
            .then((response) => {
                // Обновляем список сотрудников через refetch
                refetchEmployees();

                setNewEmployeeCreated(response.data);
                setOpenPrintDialog(true);
                setSnackbar({
                    open: true,
                    message: t('dashboard.tabs.employees.dialog_new_employee.success_employee_added'),
                    severity: 'success',
                });
                handleCloseEmployeeDialog();
            })
            .catch((error) => {
                console.error(
                    t('common.errors.error_add_employee'),
                    error.response?.data || error
                );
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_add_employee'),
                    severity: 'error',
                });
            });
    };

    const handleCloseEmployeeDialog = () => {
        setOpenEmployeeDialog(false);
        setNewEmployee({
            username: '',
            password: '',
            confirm_password: '',
            first_name: '',
            last_name: '',
            email: '',
            rank: '',
            role: 'USER',
            department: '',
            phone_number: '',
        });
        setErrors({
            password: '',
            confirm_password: '',
            email: '',
        });
    };

    const handleClosePrintDialog = () => {
        setOpenPrintDialog(false);
        setNewEmployeeCreated(null);
        setEmployeePassword('');
    };

    return (
        <>
            <DashboardDialog
                open={openEmployeeDialog}
                setOpen={setOpenEmployeeDialog}
                title={t('dashboard.tabs.employees.dialog_new_employee.title')}
            >
                {{
                    content: (
                        <>
                            <StyledTextField
                                autoFocus
                                label={t('common.logins.input_name')}
                                name="username"
                                value={newEmployee.username}
                                onChange={handleEmployeeInputChange}
                                required
                                error={Boolean(errors.username)}
                                helperText={errors.username}
                            />
                            <StyledTextField
                                label={t('common.logins.password')}
                                name="password"
                                type="password"
                                value={newEmployee.password}
                                onChange={handleEmployeeInputChange}
                                required
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                            />
                            <StyledTextField
                                label={t('common.logins.label_confirm_password')}
                                name="confirm_password"
                                type="password"
                                value={newEmployee.confirm_password}
                                onChange={handleEmployeeInputChange}
                                required
                                error={Boolean(errors.confirm_password)}
                                helperText={errors.confirm_password}
                            />
                            <StyledTextField
                                label={t('common.standard.label_first_name')}
                                name="first_name"
                                value={newEmployee.first_name}
                                onChange={handleEmployeeInputChange}
                                error={Boolean(errors.first_name)}
                                helperText={errors.first_name}
                            />
                            <StyledTextField
                                label={t('common.standard.label_last_name')}
                                name="last_name"
                                value={newEmployee.last_name}
                                onChange={handleEmployeeInputChange}
                                error={Boolean(errors.last_name)}
                                helperText={errors.last_name}
                            />
                            <StyledTextField
                                label={t('common.logins.label_email')}
                                name="email"
                                value={newEmployee.email}
                                onChange={handleEmployeeInputChange}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                                required
                            />
                            <StyledTextField
                                label={t('common.logins.label_phone_number')}
                                name="phone_number"
                                value={newEmployee.phone_number}
                                onChange={handleEmployeeInputChange}
                                error={Boolean(errors.phone_number)}
                                helperText={errors.phone_number}
                            />
                            <StyledTextField
                                label={t('common.standard.label_rank')}
                                name="rank"
                                value={newEmployee.rank}
                                onChange={handleEmployeeInputChange}
                                error={Boolean(errors.rank)}
                                helperText={errors.rank}
                            />
                            {user.role === 'REGION_HEAD' && (
                                <>
                                    <FormControl fullWidth margin="dense">
                                        <InputLabel id="role-label">{t('common.standard.label_role')}</InputLabel>
                                        <Select
                                            labelId="role-label"
                                            name="role"
                                            value={newEmployee.role}
                                            onChange={handleEmployeeInputChange}
                                            label={t('common.standard.label_role')}
                                        >
                                            <MenuItem value="USER">{t('common.logins.role_user')}</MenuItem>
                                            <MenuItem value="DEPARTMENT_HEAD">
                                                {t('common.logins.role_department_head')}
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth margin="dense">
                                        <InputLabel id="department-label">{t('common.standard.label_department')}</InputLabel>
                                        <Select
                                            labelId="department-label"
                                            name="department"
                                            value={newEmployee.department}
                                            onChange={handleEmployeeInputChange}
                                            label={t('common.standard.label_department')}
                                            error={Boolean(errors.department)}
                                        >
                                            {departments.map((dept) => (
                                                <MenuItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.department && (
                                            <p style={{ color: 'red', fontSize: '0.8em' }}>
                                                {errors.department}
                                            </p>
                                        )}
                                    </FormControl>
                                </>
                            )}
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseEmployeeDialog}>{t('common.buttons.cancel')}</Button>
                            <StyledButton onClick={handleEmployeeFormSubmit}>{t('common.buttons.create')}</StyledButton>
                        </>
                    ),
                }}
            </DashboardDialog>

            {/* Диалог для печати */}
            <DialogPrintNewEmp
                newEmployeeCreated={newEmployeeCreated}
                handlePrintLoginDetails={handlePrintLoginDetails}
                openPrintDialog={openPrintDialog}
                setOpenPrintDialog={setOpenPrintDialog}
                handleClosePrintDialog={handleClosePrintDialog}
                employeePassword={employeePassword}
                loginDetailsRef={loginDetailsRef}
            />
        </>
    );
}