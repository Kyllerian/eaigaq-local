import {
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';

import { useEffect, useRef, useState } from 'react';
import { StyledButton } from '../ui/StyledComponents';
import axios from '../../axiosConfig';
import DashboardDialog from '../ui/DashboardDialog';

export default function DialogChangeInvestigator({ open, setOpenDialog, user, caseItem, setCaseItem, setSnackbar, id }) {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [exportFilters, setExportFilters] = useState({
        department: 'all_depart',
        employee: '',
    });
    const [exportData, setExportData] = useState([]);
    const [error, setError] = useState(null);


    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEmployees([]);
        setDepartments([]);
    };


    const handleExportFilterChange = (event) => {
        const { name, value } = event.target;
        setExportFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));

        if (name === 'department') {
            setExportFilters((prevFilters) => ({
                ...prevFilters,
                employee: '',
            }));
        }
    };

    useEffect(() => {
        if (!user) return;

        if (user.role === 'DEPARTMENT_HEAD') {
            axios
                .get('/api/users/')
                .then((response) => {
                    setEmployees(response.data.filter((emp) => caseItem.investigator != emp.id));
                })
                .catch((error) => {
                    setError('Ошибка при загрузке сотрудников.');
                });
        } else if (user.role === 'REGION_HEAD') {
            axios
                .get('/api/users/all_departments/')
                .then((response) => {
                    setEmployees(response.data.filter((emp) => caseItem.investigator != emp.id));
                })
                .catch((error) => {
                    setError('Ошибка при загрузке сотрудников.');
                });

            axios
                .get('/api/departments/')
                .then((response) => {
                    setDepartments(response.data);
                })
                .catch((error) => {
                    setError('Ошибка при загрузке отделений.');
                });
        }
    }, [user]);


    const handleExportSubmit = () => {
        let params = {};

        if (user.role === 'DEPARTMENT_HEAD') {
            if (exportFilters.employee) {
                params.user_id = exportFilters.employee;
            } else {
                params.department_id = user.department.id;
            }
        } else if (user.role === 'REGION_HEAD') {
            if (exportFilters.department) {
                params.department_id = exportFilters.department;
                if (exportFilters.employee) {
                    params.user_id = exportFilters.employee;
                }
            } else {
                params.region = user.region;
            }
        }
        handleChangeInvestigator(params.user_id, params.department_id)
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
                    message: 'Дело успешно переназначено.',
                    severity: 'success',
                });
            })
            .catch((error) => {
                console.error('Ошибка при переназначении дела:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при переназначении дела.',
                    severity: 'error',
                });
            });
        handleCloseDialog();
    };
    return (
        <>
            <DashboardDialog open={open} setOpen={setOpenDialog} title={"Выберите пользователя на которого переназначите дело"}  >
                {{
                    content: (
                        <>
                            {user.role === 'REGION_HEAD' && (
                                <FormControl fullWidth margin="dense">
                                    <InputLabel id="export-department-label">Отделение</InputLabel>
                                    <Select
                                        labelId="export-department-label"
                                        name="department"
                                        value={exportFilters.department}
                                        onChange={handleExportFilterChange}
                                        label="Отделение"
                                    >
                                        {departments.map((dept) => (
                                            <MenuItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            {(user.role === 'DEPARTMENT_HEAD' || exportFilters.department) && (
                                <FormControl fullWidth margin="dense">
                                    <InputLabel id="export-employee-label">Сотрудник</InputLabel>
                                    <Select
                                        labelId="export-employee-label"
                                        name="employee"
                                        value={exportFilters.employee}
                                        onChange={handleExportFilterChange}
                                        label="Сотрудник"
                                    >
                                        {employees
                                            .filter((emp) =>
                                                user.role === 'DEPARTMENT_HEAD'
                                                    ? true
                                                    : emp.department &&
                                                    emp.department.id === parseInt(exportFilters.department)
                                            )
                                            .map((emp) => (
                                                <MenuItem key={emp.id} value={emp.id}>
                                                    {emp.first_name} {emp.last_name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            )}
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseDialog}>Отмена</Button>
                            <StyledButton onClick={handleExportSubmit}>Переназначить</StyledButton>
                        </>
                    )
                }}
            </DashboardDialog>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
        </>
    );
}