// src/components/EmployeesTab.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledButton, StyledTableCell } from './StyledComponents';
import axios from '../axiosConfig';
import { useReactToPrint } from 'react-to-print';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';

const EmployeesTab = ({
  user,
  employees,
  departments,
  snackbar,
  setSnackbar,
  setError,
  setEmployees,
}) => {
  const theme = useTheme();
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState('');
  const [selectedEmployeeDepartment, setSelectedEmployeeDepartment] =
    useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
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
  const [employeePassword, setEmployeePassword] = useState('');
  const [newEmployeeCreated, setNewEmployeeCreated] = useState(null);
  const [openPrintDialog, setOpenPrintDialog] = useState(false);
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    department: '',
    employee: '',
  });
  const [exportData, setExportData] = useState([]);
  const reportRef = useRef();
  const [shouldPrint, setShouldPrint] = useState(false);

  // Added loginDetailsRef and handlePrintLoginDetails
  const loginDetailsRef = useRef();

  const handlePrintLoginDetails = useReactToPrint({
    content: loginDetailsRef,
    documentTitle: 'Данные для входа сотрудника',
    onAfterPrint: () => {
      handleClosePrintDialog();
    },
  });

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
  };

  const handleEmployeeInputChange = (event) => {
    const { name, value } = event.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleEmployeeFormSubmit = (event) => {
    event.preventDefault();

    if (newEmployee.password !== newEmployee.confirm_password) {
      setSnackbar({
        open: true,
        message: 'Пароли не совпадают. Пожалуйста, попробуйте еще раз.',
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
          message: 'Пожалуйста, выберите отделение для нового сотрудника.',
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
          message: 'Выбранное отделение не принадлежит вашему региону.',
          severity: 'error',
        });
        return;
      }
    } else {
      setSnackbar({
        open: true,
        message: 'У вас нет прав для создания пользователей.',
        severity: 'error',
      });
      return;
    }

    delete employeeData.department;
    delete employeeData.confirm_password;

    axios
        .post('/api/users/', employeeData)
        .then((response) => {
          // Обновляем список сотрудников
          setEmployees([...employees, response.data]);

          setNewEmployeeCreated(response.data);
          setOpenPrintDialog(true);
          setSnackbar({
            open: true,
            message: 'Сотрудник успешно добавлен.',
            severity: 'success',
          });
          handleCloseEmployeeDialog();
        })
        .catch((error) => {
          console.error(
              'Ошибка при добавлении сотрудника:',
              error.response?.data || error
          );
          setSnackbar({
            open: true,
            message: 'Ошибка при добавлении сотрудника.',
            severity: 'error',
          });
        });
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



  // const handleToggleActive = () => {
  //   if (selectedEmployee.id === user.id) {
  //     setSnackbar({
  //       open: true,
  //       message: 'Вы не можете деактивировать свой собственный аккаунт.',
  //       severity: 'error',
  //     });
  //     return;
  //   }
  //
  //   axios
  //       .patch(`/api/users/${selectedEmployee.id}/`, {
  //         is_active: !selectedEmployee.is_active,
  //       })
  //       .then((response) => {
  //         // Обновляем состояние employees
  //         const updatedEmployees = employees.map((emp) =>
  //             emp.id === selectedEmployee.id ? response.data : emp
  //         );
  //         setSelectedEmployee(null);
  //
  //         setSnackbar({
  //           open: true,
  //           message: 'Статус сотрудника изменен.',
  //           severity: 'success',
  //         });
  //         setSelectedEmployee(null);
  //       })
  //       .catch((error) => {
  //         setSnackbar({
  //           open: true,
  //           message: 'Ошибка при изменении статуса сотрудника.',
  //           severity: 'error',
  //         });
  //       });
  // };

  // Export Handlers
  const handleOpenExportDialog = () => {
    setOpenExportDialog(true);
    setExportFilters({
      department: '',
      employee: '',
    });
  };

  const handleCloseExportDialog = () => {
    setOpenExportDialog(false);
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
        handleCloseExportDialog();
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
}, [shouldPrint, exportData]); // Удалили handlePrintReport из зависимостей

  const handleClosePrintDialog = () => {
    setOpenPrintDialog(false);
    setNewEmployeeCreated(null);
    setEmployeePassword('');
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleDateString('ru-RU', options);
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(
      (d) => d.id === parseInt(departmentId)
    );
    return department ? department.name : 'Все отделения';
  };

  const getEmployeeFullName = (employeeId) => {
    const employee = employees.find((e) => e.id === parseInt(employeeId));
    return employee ? `${employee.first_name} ${employee.last_name}` : '';
  };

  return (
    <>
      {/* Search and Filter */}
      {(user.role === 'REGION_HEAD' || user.role === 'DEPARTMENT_HEAD') && (
          <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: theme.spacing(2),
                mb: theme.spacing(2),
              }}
          >
            <TextField
                label="Поиск по имени или фамилии"
                variant="outlined"
                value={employeeSearchQuery}
                onChange={handleEmployeeSearchChange}
                size="small"
                sx={{flexGrow: 1}}
                InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action"/>
                      </InputAdornment>
                  ),
                }}
            />
            {user.role === 'REGION_HEAD' && (
                <FormControl sx={{minWidth: 200}} variant="outlined" size="small">
                  <InputLabel id="employee-department-filter-label">
                    Отделение
                  </InputLabel>
                  <Select
                      labelId="employee-department-filter-label"
                      name="department"
                      value={selectedEmployeeDepartment}
                      onChange={handleEmployeeDepartmentChange}
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
          </Box>
      )}


      {/* Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: theme.spacing(2),
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: theme.spacing(2),
        }}
      >
        <Box>
          <StyledButton
            onClick={handleOpenEmployeeDialog}
            startIcon={<AddIcon />}
            sx={{ mr: 2 }}
          >
            Добавить сотрудника
          </StyledButton>
          <StyledButton
            onClick={handleOpenExportDialog}
            startIcon={<PrintIcon />}
          >
            Экспорт отчета
          </StyledButton>
        </Box>
        {selectedEmployee && (
          <StyledButton
            onClick={handleToggleActive}
            sx={{
              backgroundColor: selectedEmployee.is_active
                ? theme.palette.error.main
                : theme.palette.success.main,
              '&:hover': {
                backgroundColor: selectedEmployee.is_active
                  ? theme.palette.error.dark
                  : theme.palette.success.dark,
              },
            }}
          >
            {selectedEmployee.is_active ? 'Деактивировать' : 'Активировать'}
          </StyledButton>
        )}
      </Box>

      {/* Employees Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table
            aria-label="Таблица сотрудников"
            sx={{ tableLayout: 'fixed', minWidth: 800 }}
          >
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '15%' }}>Фамилия</StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>Имя</StyledTableCell>
                <StyledTableCell sx={{ width: '10%' }}>Звание</StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>Роль</StyledTableCell>
                <StyledTableCell sx={{ width: '20%' }}>
                  Электронная почта
                </StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>
                  Отделение
                </StyledTableCell>
                <StyledTableCell sx={{ width: '10%' }}>Статус</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees
                  .filter((employee) => {
                    // Фильтрация по отделению
                    if (user.role === 'REGION_HEAD') {
                      if (selectedEmployeeDepartment) {
                        return (
                            employee.department &&
                            employee.department.id === parseInt(selectedEmployeeDepartment)
                        );
                      }
                      return true; // Если отделение не выбрано, показываем всех
                    } else if (user.role === 'DEPARTMENT_HEAD') {
                      // Для главы отделения показываем только сотрудников своего отделения
                      return (
                          employee.department &&
                          employee.department.id === user.department.id
                      );
                    } else {
                      return false; // Другие роли не имеют доступа
                    }
                  })
                  .filter((employee) => {
                    // Фильтрация по поисковому запросу
                    if (employeeSearchQuery) {
                      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
                      const reverseFullName = `${employee.last_name} ${employee.first_name}`.toLowerCase();
                      return (
                          employee.first_name
                              .toLowerCase()
                              .includes(employeeSearchQuery.toLowerCase()) ||
                          employee.last_name
                              .toLowerCase()
                              .includes(employeeSearchQuery.toLowerCase()) ||
                          fullName.includes(employeeSearchQuery.toLowerCase()) ||
                          reverseFullName.includes(employeeSearchQuery.toLowerCase())
                      );
                    }
                    return true;
                  })
                  .map((employee) => (
                      <TableRow
                          key={employee.id}
                          hover
                          selected={
                              selectedEmployee && selectedEmployee.id === employee.id
                          }
                          onClick={() => handleEmployeeSelect(employee)}
                          style={{cursor: 'pointer'}}
                      >
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {employee.last_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {employee.first_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {employee.rank}
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {employee.role_display}
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {employee.email}
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {employee.department
                        ? employee.department.name
                        : 'Не указано'}
                    </TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {employee.is_active ? 'Активен' : 'Неактивен'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialogs */}
      <Dialog
        open={openEmployeeDialog}
        onClose={handleCloseEmployeeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Добавить нового сотрудника</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Имя пользователя"
            name="username"
            value={newEmployee.username}
            onChange={handleEmployeeInputChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Пароль"
            name="password"
            type="password"
            value={newEmployee.password}
            onChange={handleEmployeeInputChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Подтвердите пароль"
            name="confirm_password"
            type="password"
            value={newEmployee.confirm_password}
            onChange={handleEmployeeInputChange}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="Имя"
            name="first_name"
            value={newEmployee.first_name}
            onChange={handleEmployeeInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Фамилия"
            name="last_name"
            value={newEmployee.last_name}
            onChange={handleEmployeeInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Электронная почта"
            name="email"
            value={newEmployee.email}
            onChange={handleEmployeeInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Номер телефона"
            name="phone_number"
            value={newEmployee.phone_number}
            onChange={handleEmployeeInputChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Звание"
            name="rank"
            value={newEmployee.rank}
            onChange={handleEmployeeInputChange}
            fullWidth
          />
          {user.role === 'REGION_HEAD' && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="role-label">Роль</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={newEmployee.role}
                  onChange={handleEmployeeInputChange}
                  label="Роль"
                >
                  <MenuItem value="USER">Обычный пользователь</MenuItem>
                  <MenuItem value="DEPARTMENT_HEAD">
                    Главный по отделению
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense">
                <InputLabel id="department-label">Отделение</InputLabel>
                <Select
                  labelId="department-label"
                  name="department"
                  value={newEmployee.department}
                  onChange={handleEmployeeInputChange}
                  label="Отделение"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmployeeDialog}>Отмена</Button>
          <StyledButton onClick={handleEmployeeFormSubmit}>Создать</StyledButton>
        </DialogActions>
      </Dialog>

      {/* Print Dialog */}
      <Dialog
        open={openPrintDialog}
        onClose={handleClosePrintDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Сотрудник успешно добавлен</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePrintDialog}>Нет</Button>
          <StyledButton onClick={handlePrintLoginDetails}>
            Да, распечатать
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={openExportDialog}
        onClose={handleCloseExportDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Экспорт отчета о сессиях сотрудников</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExportDialog}>Отмена</Button>
          <StyledButton onClick={handleExportSubmit}>
            Сформировать отчет
          </StyledButton>
        </DialogActions>
      </Dialog>

      {/* Hidden Print Component for Session Report */}
      <div style={{ display: 'none' }}>
        <div
          ref={reportRef}
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
              Отчет о сессиях сотрудников
            </Typography>
            <Typography variant="subtitle1">
              Дата формирования отчета: {formatDate(new Date().toISOString())}
            </Typography>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: '20px' }}>
            {user.role === 'REGION_HEAD' && (
              <Typography variant="h6">
                Регион: {user.region_display}
              </Typography>
            )}
            {exportFilters.department && (
              <Typography variant="h6">
                Отделение: {getDepartmentName(exportFilters.department)}
              </Typography>
            )}
            {exportFilters.employee && (
              <Typography variant="h6">
                Сотрудник: {getEmployeeFullName(exportFilters.employee)}
              </Typography>
            )}
          </div>

          {/* Session Table */}
          <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
            <Table
              aria-label="Отчет по сессиям"
              style={{
                tableLayout: 'fixed',
                width: '100%',
                fontSize: '12px',
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Фамилия</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Имя</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Звание</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Роль</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Вход</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Выход</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exportData.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.user.last_name}</TableCell>
                    <TableCell>{session.user.first_name}</TableCell>
                    <TableCell>{session.user.rank}</TableCell>
                    <TableCell>{session.user.role_display}</TableCell>
                    <TableCell>{formatDate(session.login)}</TableCell>
                    <TableCell>
                      {session.logout
                        ? formatDate(session.logout)
                        : 'Активен'}
                    </TableCell>
                  </TableRow>
                ))}
                {exportData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Нет данных для отображения.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} Министерство внутренних дел Республики
              Казахстан.
            </Typography>
          </div>
        </div>
      </div>

      {/* Hidden Print Component for Login Details */}
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
};

export default EmployeesTab;