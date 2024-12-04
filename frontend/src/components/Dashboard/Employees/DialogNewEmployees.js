// frontend/src/components/Dashboard/Employees/DialogNewEmployees.js

import {
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from '@mui/material';
import axios from '../../../axiosConfig';

import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import DialogPrintNewEmp from './DialogPrintNewEmp';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { StyledTextField } from '../../ui/StyledTextfield';

export default function DialogNewEmployees({
                                               user,
                                               departments,
                                               setSnackbar,
                                               openEmployeeDialog,
                                               setOpenEmployeeDialog,
                                               refetchEmployees, // Добавляем функцию для обновления списка сотрудников
                                           }) {
    // Ссылки и состояния
    const loginDetailsRef = useRef();

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

    const [errors, setErrors] = useState({
        password: '',
        confirm_password: '',
    });

    const [employeePassword, setEmployeePassword] = useState('');
    const [newEmployeeCreated, setNewEmployeeCreated] = useState(null);
    const [openPrintDialog, setOpenPrintDialog] = useState(false);

    const handlePrintLoginDetails = useReactToPrint({
        contentRef: loginDetailsRef,
        documentTitle: 'Данные для входа сотрудника',
        onAfterPrint: () => {
            handleClosePrintDialog();
        },
    });

    const handleEmployeeInputChange = (event) => {
        const { name, value } = event.target;
        setNewEmployee({ ...newEmployee, [name]: value });

        // Выполняем валидацию
        let newErrors = { ...errors };

        if (name === 'password') {
            if (value.length < 8) {
                newErrors.password = 'Пароль должен содержать минимум 8 символов.';
            } else {
                newErrors.password = '';
            }

            // Проверяем подтверждение пароля, если оно не пустое
            if (newEmployee.confirm_password) {
                if (value !== newEmployee.confirm_password) {
                    newErrors.confirm_password = 'Пароли не совпадают.';
                } else {
                    newErrors.confirm_password = '';
                }
            }
        }

        if (name === 'confirm_password') {
            if (value !== newEmployee.password) {
                newErrors.confirm_password = 'Пароли не совпадают.';
            } else {
                newErrors.confirm_password = '';
            }
        }

        setErrors(newErrors);
    };

    const handleEmployeeFormSubmit = (event) => {
        event.preventDefault();

        // Проверяем наличие ошибок перед отправкой
        if (errors.password || errors.confirm_password) {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, исправьте ошибки в форме.',
                severity: 'error',
            });
            return;
        }

        if (newEmployee.password !== newEmployee.confirm_password) {
            setSnackbar({
                open: true,
                message: 'Пароли не совпадают. Пожалуйста, попробуйте еще раз.',
                severity: 'error',
            });
            return;
        }

        if (newEmployee.password.length < 8) {
            setSnackbar({
                open: true,
                message: 'Пароль должен содержать минимум 8 символов.',
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
                // Обновляем список сотрудников через refetch
                refetchEmployees();

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
        setErrors({
            password: '',
            confirm_password: '',
        });
    };

    const handleClosePrintDialog = () => {
        setOpenPrintDialog(false);
        setNewEmployeeCreated(null);
        setEmployeePassword('');
    };

    return (
        <>
            <DashboardDialog
                open={openEmployeeDialog}
                setOpen={setOpenEmployeeDialog}
                title={'Добавить нового сотрудника'}
            >
                {{
                    content: (
                        <>
                            <StyledTextField
                                autoFocus
                                label="Имя пользователя"
                                name="username"
                                value={newEmployee.username}
                                onChange={handleEmployeeInputChange}
                                required
                            />
                            <StyledTextField
                                label="Пароль"
                                name="password"
                                type="password"
                                value={newEmployee.password}
                                onChange={handleEmployeeInputChange}
                                required
                                error={Boolean(errors.password)}
                                helperText={errors.password}
                            />
                            <StyledTextField
                                label="Подтвердите пароль"
                                name="confirm_password"
                                type="password"
                                value={newEmployee.confirm_password}
                                onChange={handleEmployeeInputChange}
                                required
                                error={Boolean(errors.confirm_password)}
                                helperText={errors.confirm_password}
                            />
                            <StyledTextField
                                label="Имя"
                                name="first_name"
                                value={newEmployee.first_name}
                                onChange={handleEmployeeInputChange}
                            />
                            <StyledTextField
                                label="Фамилия"
                                name="last_name"
                                value={newEmployee.last_name}
                                onChange={handleEmployeeInputChange}
                            />
                            <StyledTextField
                                label="Электронная почта"
                                name="email"
                                value={newEmployee.email}
                                onChange={handleEmployeeInputChange}
                            />
                            <StyledTextField
                                label="Номер телефона"
                                name="phone_number"
                                value={newEmployee.phone_number}
                                onChange={handleEmployeeInputChange}
                            />
                            <StyledTextField
                                label="Звание"
                                name="rank"
                                value={newEmployee.rank}
                                onChange={handleEmployeeInputChange}
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
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseEmployeeDialog}>Отмена</Button>
                            <StyledButton onClick={handleEmployeeFormSubmit}>Создать</StyledButton>
                        </>
                    ),
                }}
            </DashboardDialog>

            {/* Диалог для печати */}
            <DialogPrintNewEmp
                newEmployeeCreated={newEmployeeCreated}
                handlePrintLoginDetails={handlePrintLoginDetails}
                openPrintDialog={openPrintDialog}
                setOpenPrintDialog={setOpenPrintDialog}
                handleClosePrintDialog={handleClosePrintDialog}
                employeePassword={employeePassword}
                loginDetailsRef={loginDetailsRef}
            />
        </>
    );
}

// // frontend/src/components/Dashboard/Employees/DialogNewEmployees.js
// import {
//     Button,
//     FormControl,
//     InputLabel,
//     MenuItem,
//     Select,
//     TextField,
// } from '@mui/material';
// import axios from '../../../axiosConfig';
//
// import { StyledButton } from '../../ui/StyledComponents';
// import DashboardDialog from '../../ui/DashboardDialog';
// import DialogPrintNewEmp from './DialogPrintNewEmp';
// import { useRef, useState } from 'react';
// import { useReactToPrint } from 'react-to-print';
// import { StyledTextField } from '../../ui/StyledTextfield';
//
// export default function DialogNewEmpolyees({
//     user,
//     departments,
//     setSnackbar,
//     setEmployees,
//     employees,
//     openEmployeeDialog,
//     setOpenEmployeeDialog,
// }) {
//     // Ссылки и состояния
//     const loginDetailsRef = useRef();
//
//     const [newEmployee, setNewEmployee] = useState({
//         username: '',
//         password: '',
//         confirm_password: '',
//         first_name: '',
//         last_name: '',
//         email: '',
//         rank: '',
//         role: 'USER',
//         department: '',
//         phone_number: '',
//     });
//
//     const [errors, setErrors] = useState({
//         password: '',
//         confirm_password: '',
//     });
//
//     const [employeePassword, setEmployeePassword] = useState('');
//     const [newEmployeeCreated, setNewEmployeeCreated] = useState(null);
//     const [openPrintDialog, setOpenPrintDialog] = useState(false);
//
//     const handlePrintLoginDetails = useReactToPrint({
//         contentRef: loginDetailsRef,
//         documentTitle: 'Данные для входа сотрудника',
//         onAfterPrint: () => {
//             handleClosePrintDialog();
//         },
//     });
//
//     const handleEmployeeInputChange = (event) => {
//         const { name, value } = event.target;
//         setNewEmployee({ ...newEmployee, [name]: value });
//
//         // Выполняем валидацию
//         let newErrors = { ...errors };
//
//         if (name === 'password') {
//             if (value.length < 8) {
//                 newErrors.password = 'Пароль должен содержать минимум 8 символов.';
//             } else {
//                 newErrors.password = '';
//             }
//
//             // Проверяем подтверждение пароля, если оно не пустое
//             if (newEmployee.confirm_password) {
//                 if (value !== newEmployee.confirm_password) {
//                     newErrors.confirm_password = 'Пароли не совпадают.';
//                 } else {
//                     newErrors.confirm_password = '';
//                 }
//             }
//         }
//
//         if (name === 'confirm_password') {
//             if (value !== newEmployee.password) {
//                 newErrors.confirm_password = 'Пароли не совпадают.';
//             } else {
//                 newErrors.confirm_password = '';
//             }
//         }
//
//         setErrors(newErrors);
//     };
//
//     const handleEmployeeFormSubmit = (event) => {
//         event.preventDefault();
//
//         // Проверяем наличие ошибок перед отправкой
//         if (errors.password || errors.confirm_password) {
//             setSnackbar({
//                 open: true,
//                 message: 'Пожалуйста, исправьте ошибки в форме.',
//                 severity: 'error',
//             });
//             return;
//         }
//
//         if (newEmployee.password !== newEmployee.confirm_password) {
//             setSnackbar({
//                 open: true,
//                 message: 'Пароли не совпадают. Пожалуйста, попробуйте еще раз.',
//                 severity: 'error',
//             });
//             return;
//         }
//
//         if (newEmployee.password.length < 8) {
//             setSnackbar({
//                 open: true,
//                 message: 'Пароль должен содержать минимум 8 символов.',
//                 severity: 'error',
//             });
//             return;
//         }
//
//         setEmployeePassword(newEmployee.password);
//         let employeeData = { ...newEmployee };
//
//         if (user.role === 'DEPARTMENT_HEAD') {
//             employeeData.role = 'USER';
//             employeeData.department_id = user.department.id;
//         } else if (user.role === 'REGION_HEAD') {
//             if (!employeeData.role) {
//                 employeeData.role = 'USER';
//             }
//             if (!employeeData.department) {
//                 setSnackbar({
//                     open: true,
//                     message: 'Пожалуйста, выберите отделение для нового сотрудника.',
//                     severity: 'error',
//                 });
//                 return;
//             }
//             employeeData.department_id = employeeData.department;
//
//             const selectedDept = departments.find(
//                 (dept) => dept.id === employeeData.department_id
//             );
//             if (!selectedDept || selectedDept.region !== user.region) {
//                 setSnackbar({
//                     open: true,
//                     message: 'Выбранное отделение не принадлежит вашему региону.',
//                     severity: 'error',
//                 });
//                 return;
//             }
//         } else {
//             setSnackbar({
//                 open: true,
//                 message: 'У вас нет прав для создания пользователей.',
//                 severity: 'error',
//             });
//             return;
//         }
//
//         delete employeeData.department;
//         delete employeeData.confirm_password;
//
//         axios
//             .post('/api/users/', employeeData)
//             .then((response) => {
//                 // Обновляем список сотрудников
//                 setEmployees([...employees, response.data]);
//
//                 setNewEmployeeCreated(response.data);
//                 setOpenPrintDialog(true);
//                 setSnackbar({
//                     open: true,
//                     message: 'Сотрудник успешно добавлен.',
//                     severity: 'success',
//                 });
//                 handleCloseEmployeeDialog();
//             })
//             .catch((error) => {
//                 console.error(
//                     'Ошибка при добавлении сотрудника:',
//                     error.response?.data || error
//                 );
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при добавлении сотрудника.',
//                     severity: 'error',
//                 });
//             });
//     };
//
//     const handleCloseEmployeeDialog = () => {
//         setOpenEmployeeDialog(false);
//         setNewEmployee({
//             username: '',
//             password: '',
//             confirm_password: '',
//             first_name: '',
//             last_name: '',
//             email: '',
//             rank: '',
//             role: 'USER',
//             department: '',
//             phone_number: '',
//         });
//         setErrors({
//             password: '',
//             confirm_password: '',
//         });
//     };
//
//     const handleClosePrintDialog = () => {
//         setOpenPrintDialog(false);
//         setNewEmployeeCreated(null);
//         setEmployeePassword('');
//     };
//
//     return (
//         <>
//             <DashboardDialog
//                 open={openEmployeeDialog}
//                 setOpen={setOpenEmployeeDialog}
//                 title={'Добавить нового сотрудника'}
//             >
//                 {{
//                     content: (
//                         <>
//                             <StyledTextField
//                                 autoFocus
//                                 label="Имя пользователя"
//                                 name="username"
//                                 value={newEmployee.username}
//                                 onChange={handleEmployeeInputChange}
//                                 required
//                             />
//                             <StyledTextField
//                                 label="Пароль"
//                                 name="password"
//                                 type="password"
//                                 value={newEmployee.password}
//                                 onChange={handleEmployeeInputChange}
//                                 required
//                                 error={Boolean(errors.password)}
//                                 helperText={errors.password}
//                             />
//                             <StyledTextField
//                                 label="Подтвердите пароль"
//                                 name="confirm_password"
//                                 type="password"
//                                 value={newEmployee.confirm_password}
//                                 onChange={handleEmployeeInputChange}
//                                 required
//                                 error={Boolean(errors.confirm_password)}
//                                 helperText={errors.confirm_password}
//                             />
//                             <StyledTextField
//                                 label="Имя"
//                                 name="first_name"
//                                 value={newEmployee.first_name}
//                                 onChange={handleEmployeeInputChange}
//                             />
//                             <StyledTextField
//                                 label="Фамилия"
//                                 name="last_name"
//                                 value={newEmployee.last_name}
//                                 onChange={handleEmployeeInputChange}
//                             />
//                             <StyledTextField
//                                 label="Электронная почта"
//                                 name="email"
//                                 value={newEmployee.email}
//                                 onChange={handleEmployeeInputChange}
//                             />
//                             <StyledTextField
//                                 label="Номер телефона"
//                                 name="phone_number"
//                                 value={newEmployee.phone_number}
//                                 onChange={handleEmployeeInputChange}
//                             />
//                             <StyledTextField
//                                 label="Звание"
//                                 name="rank"
//                                 value={newEmployee.rank}
//                                 onChange={handleEmployeeInputChange}
//                             />
//                             {user.role === 'REGION_HEAD' && (
//                                 <>
//                                     <FormControl fullWidth margin="dense">
//                                         <InputLabel id="role-label">Роль</InputLabel>
//                                         <Select
//                                             labelId="role-label"
//                                             name="role"
//                                             value={newEmployee.role}
//                                             onChange={handleEmployeeInputChange}
//                                             label="Роль"
//                                         >
//                                             <MenuItem value="USER">Обычный пользователь</MenuItem>
//                                             <MenuItem value="DEPARTMENT_HEAD">
//                                                 Главный по отделению
//                                             </MenuItem>
//                                         </Select>
//                                     </FormControl>
//                                     <FormControl fullWidth margin="dense">
//                                         <InputLabel id="department-label">Отделение</InputLabel>
//                                         <Select
//                                             labelId="department-label"
//                                             name="department"
//                                             value={newEmployee.department}
//                                             onChange={handleEmployeeInputChange}
//                                             label="Отделение"
//                                         >
//                                             {departments.map((dept) => (
//                                                 <MenuItem key={dept.id} value={dept.id}>
//                                                     {dept.name}
//                                                 </MenuItem>
//                                             ))}
//                                         </Select>
//                                     </FormControl>
//                                 </>
//                             )}
//                         </>
//                     ),
//                     actions: (
//                         <>
//                             <Button onClick={handleCloseEmployeeDialog}>Отмена</Button>
//                             <StyledButton onClick={handleEmployeeFormSubmit}>Создать</StyledButton>
//                         </>
//                     ),
//                 }}
//             </DashboardDialog>
//
//             {/* Диалог для печати */}
//             <DialogPrintNewEmp
//                 newEmployeeCreated={newEmployeeCreated}
//                 handlePrintLoginDetails={handlePrintLoginDetails}
//                 openPrintDialog={openPrintDialog}
//                 setOpenPrintDialog={setOpenPrintDialog}
//                 handleClosePrintDialog={handleClosePrintDialog}
//                 employeePassword={employeePassword}
//                 loginDetailsRef={loginDetailsRef}
//             />
//         </>
//     );
// }