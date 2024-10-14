// src/pages/Dashboard.js

import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  OpenInNew as OpenInNewIcon,
  Circle as CircleIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [newCase, setNewCase] = useState({ name: '', description: '' });
  const [newEmployee, setNewEmployee] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    rank: '',
    role: 'USER',
    department: '',
    phone_number: '',
  });
  const [error, setError] = useState(null);
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const [openEmployeeDialog, setOpenEmployeeDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();

  // Состояния и рефы для сканирования штрихкода
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const barcodeInputRef = useRef(null);

  // Состояния для экспорта отчета
  const [openExportDialog, setOpenExportDialog] = useState(false);
  const [exportFilters, setExportFilters] = useState({
    department: '',
    employee: '',
  });
  const [exportData, setExportData] = useState([]);
  const reportRef = useRef();
  const [shouldPrint, setShouldPrint] = useState(false); // Новое состояние

  // Функция для печати отчета
  const handlePrintReport = useReactToPrint({
    contentRef:reportRef,
    documentTitle: 'Отчет по сессиям сотрудников',
  });

  useEffect(() => {
    if (!user) return;

    // Функция для загрузки дел с учетом параметров поиска и фильтрации
    const fetchCases = () => {
      let casesUrl = '/api/cases/';
      const params = {};

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedDepartment) {
        params.department = selectedDepartment;
      }

      axios
        .get(casesUrl, { params })
        .then((response) => {
          console.log('Полученные дела:', response.data);
          setCases(response.data);
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            navigate('/login');
          } else {
            setError('Ошибка при загрузке дел.');
          }
        });
    };

    fetchCases();

    // Загрузка сотрудников
    if (user.role === 'DEPARTMENT_HEAD') {
      axios
        .get('/api/users/')
        .then((response) => {
          setEmployees(response.data);
        })
        .catch((error) => {
          setError('Ошибка при загрузке сотрудников.');
        });
    } else if (user.role === 'REGION_HEAD') {
      axios
        .get('/api/users/all_departments/')
        .then((response) => {
          setEmployees(response.data);
        })
        .catch((error) => {
          setError('Ошибка при загрузке сотрудников.');
        });

      // Загрузка отделений региона
      axios
        .get('/api/departments/')
        .then((response) => {
          setDepartments(response.data);
        })
        .catch((error) => {
          setError('Ошибка при загрузке отделений.');
        });
    }
  }, [navigate, user, searchQuery, selectedDepartment]);

  useEffect(() => {
    if (shouldPrint && exportData.length > 0) {
      handlePrintReport();
      setShouldPrint(false);
    }
  }, [exportData, shouldPrint, handlePrintReport]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Обработка вкладок
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedCase(null);
    setSelectedEmployee(null);
  };

  // Обработка добавления дела
  const handleOpenCaseDialog = () => {
    setOpenCaseDialog(true);
  };

  const handleCloseCaseDialog = () => {
    setOpenCaseDialog(false);
    setNewCase({ name: '', description: '' });
  };

  const handleCaseInputChange = (event) => {
    const { name, value } = event.target;
    setNewCase({ ...newCase, [name]: value });
  };

  const handleCaseFormSubmit = (event) => {
    event.preventDefault();

    axios
      .post('/api/cases/', newCase)
      .then((response) => {
        const updatedCases = [...cases, response.data];
        setCases(updatedCases);
        handleCloseCaseDialog();
        setSnackbar({
          open: true,
          message: 'Дело успешно создано.',
          severity: 'success',
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: 'Ошибка при создании дела.',
          severity: 'error',
        });
      });
  };

  // Обработка выбора дела
  const handleCaseSelect = (caseItem) => {
    if (selectedCase && selectedCase.id === caseItem.id) {
      setSelectedCase(null);
    } else {
      setSelectedCase(caseItem);
    }
  };

  // Переход на страницу деталей дела
  const handleOpenCaseDetails = () => {
    navigate(`/cases/${selectedCase.id}/`);
  };

  // Обработка добавления сотрудника
  const handleOpenEmployeeDialog = () => {
    setOpenEmployeeDialog(true);
  };

  const handleCloseEmployeeDialog = () => {
    setOpenEmployeeDialog(false);
    setNewEmployee({
      username: '',
      password: '',
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

    // Копируем данные нового сотрудника
    let employeeData = {...newEmployee};

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

      // Проверяем, что выбранное отделение принадлежит региону пользователя
      const selectedDepartment = departments.find(
          (dept) => dept.id === employeeData.department_id
      );
      if (!selectedDepartment || selectedDepartment.region !== user.region) {
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

    // Удаляем department, чтобы не было конфликтов на сервере
    delete employeeData.department;

    axios
        .post('/api/users/', employeeData)
        .then((response) => {
          setEmployees([...employees, response.data]);
          handleCloseEmployeeDialog();
          setSnackbar({
            open: true,
            message: 'Сотрудник успешно добавлен.',
            severity: 'success',
          });
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

  // Обработка выбора сотрудника
  const handleEmployeeSelect = (employee) => {
    if (selectedEmployee && selectedEmployee.id === employee.id) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(employee);
    }
  };

  // Обработка активации/деактивации сотрудника
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
        const updatedEmployees = employees.map((emp) =>
          emp.id === selectedEmployee.id ? response.data : emp
        );
        setEmployees(updatedEmployees);
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

  // Обработка поиска по делам
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  // Обработка выбора отделения для фильтрации
  const handleDepartmentChange = (event) => {
    const value = event.target.value;
    setSelectedDepartment(value);
  };

  // Обработка закрытия Snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Обработчики для сканирования штрихкода
  const handleOpenBarcodeDialog = () => {
    setOpenBarcodeDialog(true);
    setScannedBarcode('');
    setTimeout(() => {
      if (barcodeInputRef.current) {
        barcodeInputRef.current.focus();
      }
    }, 100);
  };

  const handleCloseBarcodeDialog = () => {
    setOpenBarcodeDialog(false);
  };

  const handleBarcodeInputChange = (event) => {
    setScannedBarcode(event.target.value);
  };

  const handleBarcodeSubmit = async (event) => {
    event.preventDefault();
    if (!scannedBarcode) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, отсканируйте штрихкод.',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await axios.get('/api/cases/get_by_barcode/', {
        params: { barcode: scannedBarcode },
      });
      const caseData = response.data;
      // Перенаправляем на страницу деталей дела
      navigate(`/cases/${caseData.id}/`);
    } catch (error) {
      console.error(
        'Ошибка при поиске дела по штрихкоду:',
        error.response?.data || error
      );
      setSnackbar({
        open: true,
        message:
          error.response?.data?.detail ||
          'Ошибка при поиске дела по штрихкоду.',
        severity: 'error',
      });
    } finally {
      handleCloseBarcodeDialog();
    }
  };

  // Обработчики для экспорта отчета
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

    // Если выбран отдел, сбрасываем выбор сотрудника
    if (name === 'department') {
      setExportFilters((prevFilters) => ({
        ...prevFilters,
        employee: '',
      }));
    }
  };

  const handleExportSubmit = () => {
    // Подготавливаем параметры для запроса
    let params = {};

    if (user.role === 'DEPARTMENT_HEAD') {
      // Фильтрация по сотруднику
      if (exportFilters.employee) {
        params.user_id = exportFilters.employee;
      } else {
        // Все сотрудники отдела
        params.department_id = user.department.id;
      }
    } else if (user.role === 'REGION_HEAD') {
      // Фильтрация по отделу и сотруднику
      if (exportFilters.department) {
        params.department_id = exportFilters.department;
        if (exportFilters.employee) {
          params.user_id = exportFilters.employee;
        }
      } else {
        // Все отделы региона
        params.region = user.region;
      }
    }

    axios
      .get('/api/sessions/', { params })
      .then((response) => {
        setExportData(response.data);
        setShouldPrint(true); // Устанавливаем флаг для печати
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

  // Функция форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <Box>
      {/* Верхнее меню */}
      <AppBar position="fixed" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Дашборд
          </Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      {/* Основной контент */}
      <Container
        sx={{ marginTop: theme.spacing(12), paddingTop: theme.spacing(4) }}
      >
        {/* Вкладки */}
        {user &&
        (user.role === 'DEPARTMENT_HEAD' || user.role === 'REGION_HEAD') ? (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ marginBottom: theme.spacing(3) }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Дела" />
            <Tab label="Сотрудники" />
          </Tabs>
        ) : (
          <Typography variant="h4" gutterBottom>
            Мои дела
          </Typography>
        )}

        {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}

        {/* Вкладка "Дела" */}
        {(tabValue === 0 ||
          (user &&
            user.role !== 'DEPARTMENT_HEAD' &&
            user.role !== 'REGION_HEAD')) && (
          <>
            {/* Поля поиска и фильтрации */}
            <Box sx={{ mb: theme.spacing(3) }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: theme.spacing(2),
                  gap: theme.spacing(2),
                }}
              >
                <TextField
                  label="Поиск по названию или имени создателя"
                  variant="outlined"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  sx={{ flexGrow: 1 }}
                  size="small"
                />
                {user.role === 'REGION_HEAD' && (
                  <FormControl
                    sx={{ minWidth: 200 }}
                    variant="outlined"
                    size="small"
                  >
                    <InputLabel id="department-filter-label">
                      Отделение
                    </InputLabel>
                    <Select
                      labelId="department-filter-label"
                      value={selectedDepartment}
                      onChange={handleDepartmentChange}
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
                {/* Добавляем кнопку "Сканировать штрихкод" */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenBarcodeDialog}
                >
                  Сканировать штрихкод
                </Button>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: theme.spacing(2),
                }}
              >
                {user.role !== 'REGION_HEAD' ? (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCaseDialog}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Добавить
                  </Button>
                ) : (
                  <Box sx={{ width: 128 }} />
                )}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing(1),
                  }}
                >
                  <Tooltip
                    title={
                      selectedCase
                        ? selectedCase.active
                          ? 'Активно'
                          : 'Закрыто'
                        : 'Не выбрано'
                    }
                    placement="top"
                  >
                    <IconButton disabled>
                      <CircleIcon
                        style={{
                          color: selectedCase
                            ? selectedCase.active
                              ? theme.palette.success.main
                              : theme.palette.error.main
                            : theme.palette.grey[500],
                          fontSize: 24,
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<OpenInNewIcon />}
                    onClick={handleOpenCaseDetails}
                    disabled={!selectedCase}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Открыть
                  </Button>
                </Box>
              </Box>
            </Box>

            {/* Таблица с делами */}
            <Paper elevation={1}>
              <TableContainer>
                <Table aria-label="Таблица дел">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        Название дела
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        Описание
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        Создатель
                      </TableCell>
                      {user && user.role === 'REGION_HEAD' && (
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Отделение
                        </TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cases.map((caseItem) => (
                      <TableRow
                        key={caseItem.id}
                        hover
                        selected={
                          selectedCase && selectedCase.id === caseItem.id
                        }
                        onClick={() => handleCaseSelect(caseItem)}
                        style={{ cursor: 'pointer' }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            maxWidth: 200,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {caseItem.name}
                        </TableCell>
                        <TableCell
                          sx={{
                            maxWidth: 300,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {caseItem.description}
                        </TableCell>
                        <TableCell>{caseItem.creator_name}</TableCell>
                        {user && user.role === 'REGION_HEAD' && (
                          <TableCell>
                            {caseItem.department_name ||
                              (caseItem.department &&
                                caseItem.department.name) ||
                              'Не указано'}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Диалоговое окно для добавления нового дела */}
            {user.role !== 'REGION_HEAD' && (
              <Dialog
                open={openCaseDialog}
                onClose={handleCloseCaseDialog}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Добавить новое дело</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Название дела"
                    name="name"
                    value={newCase.name}
                    onChange={handleCaseInputChange}
                    fullWidth
                    required
                    inputProps={{ maxLength: 255 }}
                  />
                  <TextField
                    margin="dense"
                    label="Описание дела"
                    name="description"
                    value={newCase.description}
                    onChange={handleCaseInputChange}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    inputProps={{ maxLength: 1000 }}
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseCaseDialog}>Отмена</Button>
                  <Button
                    onClick={handleCaseFormSubmit}
                    variant="contained"
                    color="primary"
                  >
                    Создать
                  </Button>
                </DialogActions>
              </Dialog>
            )}

            {/* Диалоговое окно для сканирования штрихкода */}
            <Dialog
              open={openBarcodeDialog}
              onClose={handleCloseBarcodeDialog}
            >
              <DialogTitle>Сканирование штрихкода</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  inputRef={barcodeInputRef}
                  margin="dense"
                  label="Штрихкод"
                  value={scannedBarcode}
                  onChange={handleBarcodeInputChange}
                  fullWidth
                  onKeyPress={(event) => {
                    if (event.key === 'Enter') {
                      handleBarcodeSubmit(event);
                    }
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseBarcodeDialog}>Отмена</Button>
                <Button
                  onClick={handleBarcodeSubmit}
                  variant="contained"
                  color="primary"
                >
                  Найти
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {/* Вкладка "Сотрудники" */}
        {tabValue === 1 &&
          (user.role === 'DEPARTMENT_HEAD' ||
            user.role === 'REGION_HEAD') && (
            <>
              {/* Кнопки над таблицей */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: theme.spacing(2),
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenEmployeeDialog}
                    sx={{ whiteSpace: 'nowrap', mr: 2 }}
                  >
                    Добавить сотрудника
                  </Button>
                  <Button
                    variant="contained"
                    color="inherit"
                    startIcon={<PrintIcon />}
                    onClick={handleOpenExportDialog}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Экспорт
                  </Button>
                </Box>
                {selectedEmployee && (
                  <Button
                    variant="contained"
                    color={
                      selectedEmployee.is_active ? 'secondary' : 'success'
                    }
                    onClick={handleToggleActive}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {selectedEmployee.is_active
                      ? 'Деактивировать'
                      : 'Активировать'}
                  </Button>
                )}
              </Box>

              {/* Таблица с сотрудниками */}
              <Paper elevation={1}>
                <TableContainer>
                  <Table aria-label="Таблица сотрудников">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Фамилия
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Имя
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Звание
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Роль
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Электронная почта
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Отделение
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Статус
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow
                          key={employee.id}
                          hover
                          selected={
                            selectedEmployee &&
                            selectedEmployee.id === employee.id
                          }
                          onClick={() => handleEmployeeSelect(employee)}
                          style={{ cursor: 'pointer' }}
                        >
                          <TableCell>{employee.last_name}</TableCell>
                          <TableCell>{employee.first_name}</TableCell>
                          <TableCell>{employee.rank}</TableCell>
                          <TableCell>{employee.role_display}</TableCell>
                          <TableCell>{employee.email}</TableCell>
                          <TableCell>
                            {employee.department
                              ? employee.department.name
                              : 'Не указано'}
                          </TableCell>
                          <TableCell>
                            {employee.is_active ? 'Активен' : 'Неактивен'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Диалоговое окно для добавления нового сотрудника */}
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
                  {/* Для REGION_HEAD добавляем выбор роли и отделения */}
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
                          <MenuItem value="USER">
                            Обычный пользователь
                          </MenuItem>
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
                  <Button
                    onClick={handleEmployeeFormSubmit}
                    variant="contained"
                    color="primary"
                  >
                    Создать
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Диалоговое окно для экспорта отчета */}
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
                      <InputLabel id="export-department-label">
                        Отделение
                      </InputLabel>
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

                  {(user.role === 'DEPARTMENT_HEAD' ||
                    exportFilters.department) && (
                    <FormControl fullWidth margin="dense">
                      <InputLabel id="export-employee-label">
                        Сотрудник
                      </InputLabel>
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
                                emp.department.id ===
                                  parseInt(exportFilters.department)
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
                  <Button
                    onClick={handleExportSubmit}
                    variant="contained"
                    color="primary"
                  >
                    Сформировать отчет
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
      </Container>

      {/* Компонент для печати отчета */}
      <div style={{ display: 'none' }}>
        <div ref={reportRef}>
          <Container>
            <Typography variant="h4" gutterBottom>
              Отчет о сессиях сотрудников
            </Typography>
            {user.role === 'REGION_HEAD' && exportFilters.department && (
              <Typography variant="h6" gutterBottom>
                Отделение:{' '}
                {departments.find(
                  (d) => d.id === parseInt(exportFilters.department)
                )?.name || 'Все отделения'}
              </Typography>
            )}
            {exportFilters.employee && (
              <Typography variant="h6" gutterBottom>
                Сотрудник:{' '}
                {employees.find(
                  (e) => e.id === parseInt(exportFilters.employee)
                )?.first_name}{' '}
                {employees.find(
                  (e) => e.id === parseInt(exportFilters.employee)
                )?.last_name}
              </Typography>
            )}
            <TableContainer component={Paper}>
              <Table aria-label="Отчет по сессиям">
                <TableHead>
                  <TableRow>
                    <TableCell>Фамилия</TableCell>
                    <TableCell>Имя</TableCell>
                    <TableCell>Вход</TableCell>
                    <TableCell>Выход</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exportData.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.user.last_name}</TableCell>
                      <TableCell>{session.user.first_name}</TableCell>
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
                      <TableCell colSpan={4} align="center">
                        Нет данных для отображения.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </div>
      </div>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;
