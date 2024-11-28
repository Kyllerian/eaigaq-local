// frontend/src/components/Dashboard/Affairs/DialogNewAffairs.js

import {
    Button,
} from '@mui/material';

import axios from '../../../axiosConfig';
import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import { useState } from 'react';
import { StyledTextField } from '../../ui/StyledTextfield';
import { useMutation, useQueryClient } from 'react-query';

export default function DialogNewAffairs({ openCaseDialog, setOpenCaseDialog, setSnackbar }) {
    const [newCase, setNewCase] = useState({ name: '', description: '' });

    const queryClient = useQueryClient();

    const handleCloseCaseDialog = () => {
        setOpenCaseDialog(false);
        setNewCase({ name: '', description: '' });
    };

    const handleCaseInputChange = (event) => {
        const { name, value } = event.target;
        setNewCase({ ...newCase, [name]: value });
    };

    // Используем useMutation для создания нового дела
    const createCaseMutation = useMutation(
        (newCaseData) => axios.post('/api/cases/', newCaseData),
        {
            onSuccess: (response) => {
                // Инвалидация и рефетч запросов, связанных с делами
                queryClient.invalidateQueries('cases');
                handleCloseCaseDialog();
                setSnackbar({
                    open: true,
                    message: 'Дело успешно создано.',
                    severity: 'success',
                });
            },
            onError: (error) => {
                console.error('Ошибка при создании дела:', error.response?.data || error);
                setSnackbar({
                    open: true,
                    message:
                        error.response?.data?.detail ||
                        'Ошибка при создании дела.',
                    severity: 'error',
                });
            },
        }
    );

    const handleCaseFormSubmit = (event) => {
        event.preventDefault();

        // Валидация формы
        if (!newCase.name.trim() || !newCase.description.trim()) {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, заполните все обязательные поля.',
                severity: 'warning',
            });
            return;
        }

        // Запускаем мутацию для создания нового дела
        createCaseMutation.mutate(newCase);
    };

    return (
        <>
            <DashboardDialog
                open={openCaseDialog}
                title={"Добавить новое дело"}
                setState={setNewCase}
                setOpen={setOpenCaseDialog}
            >
                {{
                    content: (
                        <>
                            <StyledTextField
                                autoFocus
                                label="Название дела"
                                name="name"
                                value={newCase.name}
                                onChange={handleCaseInputChange}
                                required
                                inputProps={{ maxLength: 255 }}
                            />

                            <StyledTextField
                                label="Описание дела"
                                name="description"
                                value={newCase.description}
                                onChange={handleCaseInputChange}
                                required
                                multiline
                                rows={4}
                                inputProps={{ maxLength: 1000 }}
                            />
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseCaseDialog}>Отмена</Button>
                            <StyledButton
                                onClick={handleCaseFormSubmit}
                                disabled={createCaseMutation.isLoading}
                            >
                                {createCaseMutation.isLoading ? 'Создание...' : 'Создать'}
                            </StyledButton>
                        </>
                    )
                }}
            </DashboardDialog>
        </>
    );
}

// // frontend/src/components/Dashboard/Affairs/DialogNewAffairs.js
// import {
//     Button,
//     TextField,
// } from '@mui/material';
//
// import axios from '../../../axiosConfig';
// import { StyledButton } from '../../ui/StyledComponents';
// import DashboardDialog from '../../ui/DashboardDialog';
// import { useState } from 'react';
// import { StyledTextField } from '../../ui/StyledTextfield';
//
//
// export default function DialogNewAffairs({ openCaseDialog, setOpenCaseDialog, setSnackbar, setCases, cases }) {
//     const [newCase, setNewCase] = useState({ name: '', description: '' });
//
//     const handleCloseCaseDialog = () => {
//         setOpenCaseDialog(false);
//         setNewCase({ name: '', description: '' });
//     };
//
//
//   const handleCaseInputChange = (event) => {
//     const { name, value } = event.target;
//     setNewCase({ ...newCase, [name]: value });
//   };
//
//   const handleCaseFormSubmit = (event) => {
//     event.preventDefault();
//
//     axios
//       .post('/api/cases/', newCase)
//       .then((response) => {
//         const updatedCases = [...cases, response.data];
//         setCases(updatedCases);
//         handleCloseCaseDialog();
//         setSnackbar({
//           open: true,
//           message: 'Дело успешно создано.',
//           severity: 'success',
//         });
//       })
//       .catch((error) => {
//         setSnackbar({
//           open: true,
//           message: 'Ошибка при создании дела.',
//           severity: 'error',
//         });
//       });
//   };
//     return (
//         <>
//             <DashboardDialog open={openCaseDialog} title={"Добавить новое дело"} setState={setNewCase} setOpen={setOpenCaseDialog} >
//                 {{
//                     content: (
//                         <>
//                             <StyledTextField autoFocus
//                                 label="Название дела"
//                                 name="name"
//                                 value={newCase.name}
//                                 onChange={handleCaseInputChange}
//                                 required
//                                 inputProps={{ maxLength: 255 }}
//                             />
//
//                             <StyledTextField
//                                 label="Описание дела"
//                                 name="description"
//                                 value={newCase.description}
//                                 onChange={handleCaseInputChange}
//                                 required
//                                 multiline
//                                 rows={4}
//                                 inputProps={{ maxLength: 1000 }}
//                             />
//                         </>
//                     ),
//                     actions: (
//                         <>
//                             <Button onClick={handleCloseCaseDialog}>Отмена</Button>
//                             <StyledButton onClick={handleCaseFormSubmit}>
//                                 Создать
//                             </StyledButton>
//                         </>
//                     )
//                 }}
//             </DashboardDialog>
//         </>
//     );
// }
