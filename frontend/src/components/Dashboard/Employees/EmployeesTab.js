// frontend/src/components/Dashboard/Employees/EmployeesTab.js

import React, { useState } from 'react';
import { Typography, Box, Tab, Tabs, } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import EmployeesSessions from './EmployeesSessions';
import EmployeesStats from './EmployeesStats';
import { useTranslation } from 'react-i18next';

const EmployeesTab = ({ user, departments, setSnackbar }) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const [tabValue, setTabValue] = useState('employees');

    // Обработка вкладок
    const handleTabChange = (event, newValue) => {
        console.log(newValue)
        setTabValue(newValue);
    };

    return (
        <>
            {/* Основной контейнер */}
            <Box sx={{ position: 'relative' }}>
                {/* Вкладки */}
                {user ? (
                    <>
                        {/* Переключатель вкладок (Сотрудники/Сессии) - слева от таблицы, не смещая её */}
                        <Box sx={{
                            position: 'absolute',
                            left: '-150px',
                            top: '0',
                            marginTop: '120px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: theme.spacing(2)
                        }}>
                            <Tabs
                                orientation="vertical"
                                value={tabValue}
                                onChange={handleTabChange}
                                sx={{ borderRight: 1, borderColor: 'divider' }}
                            >
                                <Tab label={t('dashboard.tabs.employees.title')} value="employees" />
                                <Tab label={t('common.table_headers.sessions')} value="sessions" />
                            </Tabs>
                        </Box>

                        {/* Контент выбранной вкладки */}

                        {tabValue === "employees" ?
                            <EmployeesStats user={user} departments={departments} setSnackbar={setSnackbar} />
                            :
                            <EmployeesSessions user={user} departments={departments} setSnackbar={setSnackbar} />
                        }
                    </>
                ) : (
                    <Typography variant="h4" gutterBottom>
                        {t('dashboard.my_cases')}
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default EmployeesTab;