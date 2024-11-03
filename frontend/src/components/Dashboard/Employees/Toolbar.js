import {
    Box,
    FormControl,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';

import {
    Add as AddIcon,
    Print as PrintIcon,
    Search as SearchIcon,
} from '@mui/icons-material';

import { useTheme } from '@mui/material/styles';
import { StyledButton } from '../../ui/StyledComponents';


export default function EmployeesToolbar({ user, employeeSearchQuery, departments, handleEmployeeSearchChange, selectedEmployeeDepartment, handleEmployeeDepartmentChange,
        handleOpenEmployeeDialog, handleOpenExportDialog, selectedEmployee, handleToggleActive }) {
    const theme = useTheme();

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
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {user.role === 'REGION_HEAD' && (
                        <FormControl sx={{ minWidth: 200 }} variant="outlined" size="small">
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

        </>
    );
}
