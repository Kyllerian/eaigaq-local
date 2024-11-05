// src/components/EmployeesTab.js

import React, { useState } from 'react';
import axios from '../../../axiosConfig';
import EmployeesToolbar from './Toolbar';
import EmpolyeesTable from './Table';
import DialogNewEmpolyees from './DialogNewEmployees';
import DialogExportEmpolyees from './DialogExport';

const EmployeesTab = ({
    user,
    employees,
    departments,
    setSnackbar,
    setEmployees,
}) => {
    const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
    const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);

    const [openExportDialog, setOpenExportDialog] = useState(false);

    const handleEmployeeSearchChange = (event) => {
        setEmployeeSearchQuery(event.target.value);
    };

    const handleEmployeeDepartmentChange = (event) => {
        setSelectedEmployeeDepartment(event.target.value);
    };

    const handleEmployeeSelect = (employee) => {
        if (selectedEmployee && selectedEmployee.id === employee.id) {
            setSelectedEmployee(null);
        } else {
            setSelectedEmployee(employee);
        }
    };

    const handleOpenEmployeeDialog = () => {
        setOpenEmployeeDialog(true);
    };

    const handleToggleActive = () => {
        if (selectedEmployee.id === user.id) {
            setSnackbar({
                open: true,
                message: 'Вы не можете деактивировать свой собственный аккаунт.',
                severity: 'error',
            });
            return;
        }

        axios
            .patch(`/api/users/${selectedEmployee.id}/`, {
                is_active: !selectedEmployee.is_active,
            })
            .then((response) => {
                // Обновляем состояние employees
                const updatedEmployees = employees.map((emp) =>
                    emp.id === selectedEmployee.id ? response.data : emp
                );
                setEmployees(updatedEmployees); // Теперь эта функция определена

                setSnackbar({
                    open: true,
                    message: 'Статус сотрудника изменен.',
                    severity: 'success',
                });
                setSelectedEmployee(null);
            })
            .catch((error) => {
                setSnackbar({
                    open: true,
                    message: 'Ошибка при изменении статуса сотрудника.',
                    severity: 'error',
                });
            });
    };

    // Export Handlers
    const handleOpenExportDialog = () => {
        setOpenExportDialog(true);
    };

    return (
        <>
            <EmployeesToolbar
                user={user}
                employeeSearchQuery={employeeSearchQuery}
                departments={departments}
                handleEmployeeSearchChange={handleEmployeeSearchChange}
                selectedEmployeeDepartment={selectedEmployeeDepartment}
                handleEmployeeDepartmentChange={handleEmployeeDepartmentChange}
                handleOpenEmployeeDialog={handleOpenEmployeeDialog}
                handleOpenExportDialog={handleOpenExportDialog}
                selectedEmployee={selectedEmployee}
                handleToggleActive={handleToggleActive}
            />

            {/* Employees Table */}
            <EmpolyeesTable user={user} employees={employees}
                selectedEmployeeDepartment={selectedEmployeeDepartment}
                employeeSearchQuery={employeeSearchQuery}
                selectedEmployee={selectedEmployee}
                handleEmployeeSelect={handleEmployeeSelect}
            />

            {/* Dialogs */}
            <DialogNewEmpolyees
                user={user}
                departments={departments}
                openEmployeeDialog={openEmployeeDialog}
                setOpenEmployeeDialog={setOpenEmployeeDialog}
                setSnackbar={setSnackbar}
                setEmployees={setEmployees}
                employees={employees} 
            />

            {/* Export Dialog */}
            <DialogExportEmpolyees 
                user={user}
                departments={departments}
                employees={employees}
                openExportDialog={openExportDialog}
                setOpenExportDialog={setOpenExportDialog}
                setSnackbar={setSnackbar}
                setOpenEmployeeDialog={setOpenEmployeeDialog}  
            />
        </>
    );
};

export default EmployeesTab;