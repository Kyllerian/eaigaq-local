// src/pages/Dashboard.js

import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import Header from '../components/Header';
import CasesTab from '../components/CasesTab';
import EmployeesTab from '../components/EmployeesTab';
import EvidenceSearchTab from '../components/EvidenceSearchTab';
import axios from '../axiosConfig';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [cases, setCases] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch Cases
  const fetchCases = () => {
    axios
      .get('/api/cases/')
      .then((response) => {
        setCases(response.data);
      })
      .catch((error) => {
        setError('Ошибка при загрузке дел.');
      });
  };

  useEffect(() => {
    if (!user) return;
    fetchCases();

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

  return (
    <Box sx={{ backgroundColor: '#e9edf5', minHeight: '100vh' }}>
      <Header onLogout={handleLogout} />

      <Container
        sx={{
          marginTop: theme.spacing(12),
          paddingTop: theme.spacing(4),
          pb: theme.spacing(4),
        }}
      >
        {user &&
        (user.role === 'DEPARTMENT_HEAD' || user.role === 'REGION_HEAD') ? (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ marginBottom: theme.spacing(3) }}
            TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
            textColor="inherit"
          >
            <Tab label="Дела" />
            <Tab label="Сотрудники" />
            <Tab label="Поиск Вещдоков" />
          </Tabs>
        ) : (
          <Typography variant="h4" gutterBottom>
            Мои дела
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {(tabValue === 0 ||
          (user &&
            user.role !== 'DEPARTMENT_HEAD' &&
            user.role !== 'REGION_HEAD')) && (
          <CasesTab
            user={user}
            cases={cases}
            departments={departments}
            fetchCases={fetchCases}
            snackbar={snackbar}
            setSnackbar={setSnackbar}
            setError={setError}
          />
        )}

        {tabValue === 1 &&
          (user.role === 'DEPARTMENT_HEAD' || user.role === 'REGION_HEAD') && (
            <EmployeesTab
              user={user}
              employees={employees}
              departments={departments}
              setEmployees={setEmployees}
              snackbar={snackbar}
              setSnackbar={setSnackbar}
              setError={setError}
            />
          )}

        {tabValue === 2 && (
          <EvidenceSearchTab
            snackbar={snackbar}
            setSnackbar={setSnackbar}
            setError={setError}
          />
        )}

        {/* Snackbar for notifications */}
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
      </Container>
    </Box>
  );
};

export default Dashboard;
