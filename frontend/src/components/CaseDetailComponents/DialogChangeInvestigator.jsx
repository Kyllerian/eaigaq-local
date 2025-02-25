// frontend/src/components/CaseDetailComponents/DialogChangeInvestigator.jsx

import {
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Typography,
    CircularProgress,
} from '@mui/material';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { StyledButton } from '../ui/StyledComponents';
import axios from '../../axiosConfig';
import DashboardDialog from '../ui/DashboardDialog';
import { useTranslation } from 'react-i18next';

export default function DialogChangeInvestigator({
    open,
    setOpenDialog,
    user,
    caseItem,
    setCaseItem,
    setSnackbar,
    id,
}) {
    const { t } = useTranslation();

    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [exportFilters, setExportFilters] = useState({
        department: '',
        employee: '',
    });
    const [error, setError] = useState(null);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    // Создаем refs для Select компонентов
    const departmentSelectRef = useRef(null);
    const employeeSelectRef = useRef(null);

    // Состояния для хранения ширины Select
    const [departmentSelectWidth, setDepartmentSelectWidth] = useState(null);
    const [employeeSelectWidth, setEmployeeSelectWidth] = useState(null);

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEmployees([]);
        setDepartments([]);
        setExportFilters({
            department: '',
            employee: '',
        });
    };

    const handleExportFilterChange = (event) => {
        const { name, value } = event.target;
        setExportFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));

        if (name === 'department') {
            // Сбросить выбранного сотрудника при изменении отделения
            setExportFilters((prevFilters) => ({
                ...prevFilters,
                employee: '',
            }));
        }
    };

    // Измеряем ширину Select компонентов после рендеринга
    useLayoutEffect(() => {
        if (departmentSelectRef.current) {
            const width = departmentSelectRef.current.clientWidth;
            setDepartmentSelectWidth(width);
        }
        if (employeeSelectRef.current) {
            const width = employeeSelectRef.current.clientWidth;
            setEmployeeSelectWidth(width);
        }
    }, [open, departments, employees]); // Обновляем при открытии диалога или изменении данных

    // Загружаем отделения при монтировании компонента
    useEffect(() => {
        if (user?.role === 'REGION_HEAD') {
            setLoadingDepartments(true);
            axios
                .get('/api/departments/')
                .then((response) => {
                    setDepartments(response.data);
                    setLoadingDepartments(false);
                })
                .catch((error) => {
                    setError(t('common.errors.error_load_departments'));
                    setLoadingDepartments(false);
                });
        }
    }, [t, user]);

    // Загружаем сотрудников при изменении отделения или пользователя
    useEffect(() => {
        if (!user) return;

        if (user.role === 'DEPARTMENT_HEAD') {
            setLoadingEmployees(true);
            axios
                .get('/api/users/', {
                    params: { department: user.department.id }, // Изменено здесь
                })
                .then((response) => {
                    setEmployees(
                        response.data.filter(
                            (emp) => caseItem.investigator !== emp.id
                        )
                    );
                    setLoadingEmployees(false);
                })
                .catch((error) => {
                    setError(t('common.errors.error_load_employees'));
                    setLoadingEmployees(false);
                });
        } else if (user.role === 'REGION_HEAD') {
            if (exportFilters.department) {
                setLoadingEmployees(true);
                axios
                    .get('/api/users/', {
                        params: { department: exportFilters.department }, // И здесь
                    })
                    .then((response) => {
                        setEmployees(
                            response.data.filter(
                                (emp) => caseItem.investigator !== emp.id
                            )
                        );
                        setLoadingEmployees(false);
                    })
                    .catch((error) => {
                        setError(t('common.errors.error_load_employees'));
                        setLoadingEmployees(false);
                    });
            } else {
                // Если отделение не выбрано, очищаем список сотрудников
                setEmployees([]);
            }
        }
    }, [user, exportFilters.department, caseItem.investigator]);

    const handleExportSubmit = () => {
        let params = {};

        if (user.role === 'DEPARTMENT_HEAD') {
            if (exportFilters.employee) {
                params.user_id = exportFilters.employee;
            } else {
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_no_employee'),
                    severity: 'error',
                });
                return;
            }
            params.department_id = user.department.id;
        } else if (user.role === 'REGION_HEAD') {
            if (exportFilters.department) {
                params.department_id = exportFilters.department;
                if (exportFilters.employee) {
                    params.user_id = exportFilters.employee;
                } else {
                    setSnackbar({
                        open: true,
                        message: t('common.errors.error_no_employee'),
                        severity: 'error',
                    });
                    return;
                }
            } else {
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_no_department'),
                    severity: 'error',
                });
                return;
            }
        }

        handleChangeInvestigator(params.user_id, params.department_id);
    };

    const handleChangeInvestigator = (NewInvestigatorId, NewDepartmentId) => {
        axios
            .put(`/api/cases/${id}/`, {
                name: caseItem.name,
                description: caseItem.description,
                investigator: NewInvestigatorId,
                creator: NewInvestigatorId,
                department_id: NewDepartmentId,
            })
            .then((response) => {
                setCaseItem(response.data);
                setSnackbar({
                    open: true,
                    message: t('common.success.success_case_reassigned'),
                    severity: 'success',
                });
                handleCloseDialog();
            })
            .catch((error) => {
                console.error(t('common.errors.error_case_reassign'), error);
                setSnackbar({
                    open: true,
                    message: t('common.errors.error_case_reassign'),
                    severity: 'error',
                });
            });
    };

    return (
        <>
            <DashboardDialog
                open={open}
                setOpen={setOpenDialog}
                title={t('case_detail.components.dialog_change_investigator.title_dialog')}
            >
                {{
                    content: (
                        <>
                            {user.role === 'REGION_HEAD' && (
                                <FormControl fullWidth margin="dense">
                                    <InputLabel id="department-label">{t('common.standard.label_department')}</InputLabel>
                                    <Select
                                        labelId="department-label"
                                        name="department"
                                        value={exportFilters.department}
                                        onChange={handleExportFilterChange}
                                        label={t('common.standard.label_department')}
                                        ref={departmentSelectRef} // Присваиваем ref
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                    width: departmentSelectWidth
                                                        ? `${departmentSelectWidth}px`
                                                        : 'auto', // Устанавливаем ширину выпадающего меню равной ширине Select
                                                },
                                            },
                                            MenuListProps: {
                                                sx: {
                                                    overflowX: 'hidden', // Запрет горизонтальной прокрутки
                                                },
                                            },
                                        }}
                                        sx={{
                                            '& .MuiMenuItem-root': {
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {loadingDepartments ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={24} />
                                            </MenuItem>
                                        ) : (
                                            departments.map((dept) => (
                                                <MenuItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>
                            )}

                            {(user.role === 'DEPARTMENT_HEAD' || exportFilters.department) && (
                                <FormControl fullWidth margin="dense">
                                    <InputLabel id="employee-label">{t('common.standard.label_employee')}</InputLabel>
                                    <Select
                                        labelId="employee-label"
                                        name="employee"
                                        value={exportFilters.employee}
                                        onChange={handleExportFilterChange}
                                        label={t('common.standard.label_employee')}
                                        ref={employeeSelectRef} // Присваиваем ref
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 200,
                                                    width: employeeSelectWidth
                                                        ? `${employeeSelectWidth}px`
                                                        : 'auto', // Устанавливаем ширину выпадающего меню равной ширине Select
                                                },
                                            },
                                            MenuListProps: {
                                                sx: {
                                                    overflowX: 'hidden', // Запрет горизонтальной прокрутки
                                                },
                                            },
                                        }}
                                        sx={{
                                            '& .MuiMenuItem-root': {
                                                textOverflow: 'ellipsis',
                                                overflow: 'hidden',
                                                whiteSpace: 'nowrap',
                                            },
                                        }}
                                        fullWidth
                                    >
                                        {loadingEmployees ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={24} />
                                            </MenuItem>
                                        ) : employees.length > 0 ? (
                                            employees.map((emp) => (
                                                <MenuItem key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>
                                                <Typography variant="body2">
                                                    {t('common.messages.no_available_employees')}
                                                </Typography>
                                            </MenuItem>
                                        )}
                                    </Select>
                                </FormControl>
                            )}
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseDialog}>{t('common.buttons.cancel')}</Button>
                            <StyledButton onClick={handleExportSubmit}>
                                {t('common.buttons.reassign')}
                            </StyledButton>
                        </>
                    ),
                }}
            </DashboardDialog>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}
        </>
    );
}