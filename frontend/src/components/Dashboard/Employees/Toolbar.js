// frontend/src/components/Dashboard/Employees/Toolbar.js

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

export default function EmployeesToolbar({
    user,
    employeeSearchQuery,
    departments,
    handleEmployeeSearchChange,
    selectedEmployeeDepartment,
    handleEmployeeDepartmentChange,
    handleOpenEmployeeDialog,
    handleOpenExportDialog,
    selectedEmployee,
    handleToggleActive,
    ordering,
    handleOrderingChange,
}) {
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
                        // mb: theme.spacing(2),
                    }}
                >
                    <TextField
                        label="Поиск"
                        variant="outlined"
                        value={employeeSearchQuery}
                        onChange={handleEmployeeSearchChange}
                        size="small"
                        sx={{ flexGrow: 1 }}
                        placeholder="Имя, фамилия, звание, роль, email..."
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
                    {/* Добавляем выбор сортировки */}
                    <FormControl sx={{ minWidth: 200 }} variant="outlined" size="small">
                        <InputLabel id="employee-ordering-label">Сортировка</InputLabel>
                        <Select
                            labelId="employee-ordering-label"
                            name="ordering"
                            value={ordering}
                            onChange={handleOrderingChange}
                            label="Сортировка"
                        >
                            <MenuItem value="-date_joined">Дата регистрации (убыв.)</MenuItem>
                            <MenuItem value="date_joined">Дата регистрации (возр.)</MenuItem>
                            <MenuItem value="last_name">Фамилия (А-Я)</MenuItem>
                            <MenuItem value="-last_name">Фамилия (Я-А)</MenuItem>
                            <MenuItem value="first_name">Имя (А-Я)</MenuItem>
                            <MenuItem value="-first_name">Имя (Я-А)</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            )}

            {/* Buttons */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    // mb: theme.spacing(2),
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: theme.spacing(2),
                }}
            >
                <Box>
                    <StyledButton
                        onClick={handleOpenEmployeeDialog}
                        startIcon={<AddIcon />}
                        sx={{ mr: 2, height: '40px' }}
                    >
                        <span
                            style={{
                                height: '1ex',
                                overflow: 'visible',
                                lineHeight: '1ex',
                                verticalAlign: 'bottom',
                            }}
                        >
                            Добавить сотрудника
                        </span>
                    </StyledButton>
                    <StyledButton
                        onClick={handleOpenExportDialog}
                        startIcon={<PrintIcon />}
                        sx={{ height: '40px' }}
                    >
                        <span
                            style={{
                                height: '1ex',
                                overflow: 'visible',
                                lineHeight: '1ex',
                                verticalAlign: 'bottom',
                            }}
                        >
                            Экспорт отчета
                        </span>
                    </StyledButton>
                </Box>
                {selectedEmployee && (
                    <StyledButton
                        onClick={handleToggleActive}
                        sx={{
                            backgroundColor: selectedEmployee.is_active
                                ? theme.palette.error.main
                                : theme.palette.success.main,
                            height: '40px',
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

// import {
//     Box,
//     FormControl,
//     InputAdornment,
//     InputLabel,
//     MenuItem,
//     Select,
//     TextField,
// } from '@mui/material';
//
// import {
//     Add as AddIcon,
//     Print as PrintIcon,
//     Search as SearchIcon,
// } from '@mui/icons-material';
//
// import { useTheme } from '@mui/material/styles';
// import { StyledButton } from '../../ui/StyledComponents';
//
//
// export default function EmployeesToolbar({ user, employeeSearchQuery, departments, handleEmployeeSearchChange, selectedEmployeeDepartment, handleEmployeeDepartmentChange,
//         handleOpenEmployeeDialog, handleOpenExportDialog, selectedEmployee, handleToggleActive }) {
//     const theme = useTheme();
//
//     return (
//         <>
//             {/* Search and Filter */}
//             {(user.role === 'REGION_HEAD' || user.role === 'DEPARTMENT_HEAD') && (
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         flexWrap: 'wrap',
//                         alignItems: 'center',
//                         gap: theme.spacing(2),
//                         mb: theme.spacing(2),
//                     }}
//                 >
//                     <TextField
//                         label="Поиск по имени или фамилии"
//                         variant="outlined"
//                         value={employeeSearchQuery}
//                         onChange={handleEmployeeSearchChange}
//                         size="small"
//                         sx={{ flexGrow: 1 }}
//                         InputProps={{
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <SearchIcon color="action" />
//                                 </InputAdornment>
//                             ),
//                         }}
//                     />
//                     {user.role === 'REGION_HEAD' && (
//                         <FormControl sx={{ minWidth: 200 }} variant="outlined" size="small">
//                             <InputLabel id="employee-department-filter-label">
//                                 Отделение
//                             </InputLabel>
//                             <Select
//                                 labelId="employee-department-filter-label"
//                                 name="department"
//                                 value={selectedEmployeeDepartment}
//                                 onChange={handleEmployeeDepartmentChange}
//                                 label="Отделение"
//                             >
//                                 <MenuItem value="">
//                                     <em>Все отделения</em>
//                                 </MenuItem>
//                                 {departments.map((dept) => (
//                                     <MenuItem key={dept.id} value={dept.id}>
//                                         {dept.name}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                     )}
//                 </Box>
//             )}
//
//
//             {/* Buttons */}
//             <Box
//                 sx={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     mb: theme.spacing(2),
//                     alignItems: 'center',
//                     flexWrap: 'wrap',
//                     gap: theme.spacing(2),
//                 }}
//             >
//                 <Box>
//                     <StyledButton
//                         onClick={handleOpenEmployeeDialog}
//                         startIcon={<AddIcon />}
//                         sx={{ mr: 2, height: '40px' }}
//                     >
//                         <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>Добавить сотрудника</span>
//                     </StyledButton>
//                     <StyledButton
//                         onClick={handleOpenExportDialog}
//                         startIcon={<PrintIcon />}
//                         sx={{ height: '40px' }}
//                     >
//                         <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>Экспорт отчета</span>
//                     </StyledButton>
//                 </Box>
//                 {selectedEmployee && (
//                     <StyledButton
//                         onClick={handleToggleActive}
//                         sx={{
//                             backgroundColor: selectedEmployee.is_active
//                                 ? theme.palette.error.main
//                                 : theme.palette.success.main,
//                             height: '40px',
//                             '&:hover': {
//                                 backgroundColor: selectedEmployee.is_active
//                                     ? theme.palette.error.dark
//                                     : theme.palette.success.dark,
//                             },
//                         }}
//                     >
//                         {selectedEmployee.is_active ? 'Деактивировать' : 'Активировать'}
//                     </StyledButton>
//                 )}
//             </Box>
//
//         </>
//     );
// }
