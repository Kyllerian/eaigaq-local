// src/pages/AllEmployeesPage.js

import React, { useState, useEffect, useContext } from 'react';
import axios from '../axiosConfig';
import {
  Typography,
  Container,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const AllEmployeesPage = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user.role !== 'REGION_HEAD') {
      navigate('/');
    }

    axios
      .get('/api/users/all_departments/')
      .then((response) => {
        setEmployees(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при загрузке сотрудников:', error);
      });
  }, [user, navigate]);

  const handleEmployeeSelect = (employee) => {
    if (selectedEmployee && selectedEmployee.id === employee.id) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(employee);
    }
  };

  const handleToggleActive = () => {
    axios
      .patch(`/api/users/${selectedEmployee.id}/`, { is_active: !selectedEmployee.is_active })
      .then((response) => {
        const updatedEmployees = employees.map((emp) =>
          emp.id === selectedEmployee.id ? response.data : emp
        );
        setEmployees(updatedEmployees);
        setSnackbar({ open: true, message: 'Статус сотрудника изменен.', severity: 'success' });
        setSelectedEmployee(null);
      })
      .catch((error) => {
        setSnackbar({ open: true, message: 'Ошибка при изменении статуса сотрудника.', severity: 'error' });
      });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
        <Typography variant="h6">Сотрудники всех отделений вашего региона</Typography>
        <Button variant="contained" onClick={handleBack}>
          Назад
        </Button>
      </Box>

      {selectedEmployee && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color={selectedEmployee.is_active ? 'secondary' : 'success'}
            onClick={handleToggleActive}
          >
            {selectedEmployee.is_active ? 'Деактивировать' : 'Активировать'}
          </Button>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table aria-label="Таблица сотрудников">
          <TableHead>
            <TableRow>
              <TableCell>Фамилия</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Звание</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell>Электронная почта</TableCell>
              <TableCell>Отделение</TableCell>
              <TableCell>Статус</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow
                key={employee.id}
                hover
                selected={selectedEmployee && selectedEmployee.id === employee.id}
                onClick={() => handleEmployeeSelect(employee)}
                style={{ cursor: 'pointer' }}
              >
                <TableCell>{employee.last_name}</TableCell>
                <TableCell>{employee.first_name}</TableCell>
                <TableCell>{employee.rank}</TableCell>
                <TableCell>{employee.role_display}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{employee.department.name}</TableCell>
                <TableCell>{employee.is_active ? 'Активен' : 'Неактивен'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AllEmployeesPage;
