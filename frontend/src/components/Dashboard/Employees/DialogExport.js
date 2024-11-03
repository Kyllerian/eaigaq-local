import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';

import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import axios from '../../../axiosConfig';
import PrintSessionReport from './PrintSessionReport';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';


export default function DialogExportEmpolyees({ user, departments, employees, openExportDialog, setOpenExportDialog, setSnackbar,
    setOpenEmployeeDialog, 
}) {
    const reportRef = useRef();
    const [exportData, setExportData] = useState([]);
    const [shouldPrint, setShouldPrint] = useState(false);

    const [exportFilters, setExportFilters] = useState({
        department: '',
        employee: '',
    });

    // Printing
    const handlePrintReport = useReactToPrint({
        contentRef: reportRef,
        documentTitle: 'Отчет по сессиям сотрудников',
    });
    useEffect(() => {
        if (shouldPrint && exportData.length > 0) {
            handlePrintReport();
            setShouldPrint(false);
        }
    }, [shouldPrint, exportData, handlePrintReport]); // Удалили handlePrintReport из зависимостей
    
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

        axios
            .get('/api/sessions/', { params })
            .then((response) => {
                setExportData(response.data);
                setShouldPrint(true);
                setOpenExportDialog(false);
            })
            .catch((error) => {
                console.error('Ошибка при получении данных сессий:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при получении данных сессий.',
                    severity: 'error',
                });
            });
    };
    return (
        <>
            <DashboardDialog open={openExportDialog} setOpen={setOpenExportDialog} title={"Экспорт отчета о сессиях сотрудников"}  >
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
                                        <MenuItem value="">
                                            <em>Все отделения</em>
                                        </MenuItem>
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
                                        <MenuItem value="">
                                            <em>Все сотрудники</em>
                                        </MenuItem>
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
                            <Button onClick={() => setOpenEmployeeDialog(false)}>Отмена</Button>
                            <StyledButton onClick={handleExportSubmit}>Сформировать отчет</StyledButton>

                        </>
                    )
                }}
            </DashboardDialog>

            
            {/* Hidden Print Component for Session Report */}
            <PrintSessionReport user={user} reportRef={reportRef} exportData={exportData} exportFilters={exportFilters} 
                departments={departments} employees={employees} 
            />
        </>
    );
}
