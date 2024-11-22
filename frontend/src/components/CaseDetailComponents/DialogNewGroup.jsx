// frontend/src/components/CaseDetailComponents/DialogNewGroup.jsx

import { Button } from '@mui/material';
import { StyledButton } from '../ui/StyledComponents';
import { useState } from 'react';
import axios from '../../axiosConfig';
import StyledDialog from '../ui/StyledDialog';
import { StyledTextField } from '../ui/StyledTextfield';

export default function DialogNewGroup({ open, setOpenGroupDialog, setGroups, setSnackbar, groups, id, caseItem }) {
    const [newGroup, setNewGroup] = useState({ storage_place: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleCloseGroupDialog = () => {
        setOpenGroupDialog(false);
        setNewGroup({ storage_place: '' });
    };

    const handleGroupInputChange = (event) => {
        const { name, value } = event.target;
        setNewGroup({ ...newGroup, [name]: value });
    };

    const handleGroupFormSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            // Получаем evidence_group_count из caseItem
            const evidenceGroupCount = caseItem.department.evidence_group_count || 0;

            // Генерируем название группы
            const groupName = `Группа${evidenceGroupCount + 1}`;

            // Создаём новую группу
            const response = await axios.post('/api/evidence-groups/', {
                name: groupName,
                storage_place: newGroup.storage_place,
                case: id,
            });

            // Обновляем evidence_group_count в caseItem на фронте
            caseItem.department.evidence_group_count = evidenceGroupCount + 1;

            // Обновляем список групп на фронте
            setGroups([...groups, response.data]);

            handleCloseGroupDialog();
            setSnackbar({
                open: true,
                message: 'Группа успешно добавлена.',
                severity: 'success',
            });
        } catch (error) {
            console.error('Ошибка при добавлении группы:', error.response?.data || error);
            setSnackbar({
                open: true,
                message: 'Ошибка при добавлении группы.',
                severity: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <StyledDialog title={"Добавить группу"} open={open} setOpen={setOpenGroupDialog} setState={setNewGroup}>
                {{
                    content: (
                        <>
                            <StyledTextField
                                label="Место хранения"
                                name="storage_place"
                                value={newGroup.storage_place}
                                onChange={handleGroupInputChange}
                                required
                            />
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseGroupDialog}>Отмена</Button>
                            <StyledButton onClick={handleGroupFormSubmit} disabled={isLoading}>
                                Добавить
                            </StyledButton>
                        </>
                    ),
                }}
            </StyledDialog>
        </>
    );
}


// // frontend/src/components/CaseDetailComponents/DialogNewGroup.jsx
// import {
//     Button,
// } from '@mui/material';
//
// import { StyledButton, } from '../ui/StyledComponents';
// import { useState } from 'react';
// import axios from '../../axiosConfig';
// import StyledDialog from '../ui/StyledDialog';
// import { StyledTextField } from '../ui/StyledTextfield';
//
// export default function DialogNewGroup({ open, setOpenGroupDialog, setGroups, setSnackbar, groups, id }) {
//     const [newGroup, setNewGroup] = useState({ name: '' });
//
//     const handleCloseGroupDialog = () => {
//         setOpenGroupDialog(false);
//         setNewGroup({ name: '' });
//     };
//
//     const handleGroupInputChange = (event) => {
//         const { name, value } = event.target;
//         setNewGroup({ ...newGroup, [name]: value });
//     };
//
//     const handleGroupFormSubmit = (event) => {
//         event.preventDefault();
//
//         axios
//             .post('/api/evidence-groups/', {
//                 name: newGroup.name,
//                 case: id,
//             })
//             .then((response) => {
//                 setGroups([...groups, response.data]);
//                 handleCloseGroupDialog();
//                 setSnackbar({
//                     open: true,
//                     message: 'Группа успешно добавлена.',
//                     severity: 'success',
//                 });
//             })
//             .catch((error) => {
//                 console.error(
//                     'Ошибка при добавлении группы:',
//                     error.response?.data || error
//                 );
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при добавлении группы.',
//                     severity: 'error',
//                 });
//             });
//     };
//     return (
//         <>
//             {/* Диалоговое окно для добавления новой группы */}
//             <StyledDialog title={"Добавить группу"} open={open} setOpen={setOpenGroupDialog} setState={setNewGroup} >
//                 {{
//                     content: (
//                         <>
//                             <StyledTextField label="Название группы" name="name" value={newGroup.name} onChange={handleGroupInputChange} required />
//
//                             {/* <TextField
//                                 autoFocus
//                                 margin="dense"
//                                 label="Название группы"
//                                 name="name"
//                                 value={newGroup.name}
//                                 onChange={handleGroupInputChange}
//                                 fullWidth
//                                 required
//                             /> */}
//                         </>
//                     ),
//                     actions: (
//                         <>
//                             <Button onClick={handleCloseGroupDialog}>Отмена</Button>
//                             <StyledButton onClick={handleGroupFormSubmit}>
//                                 Добавить
//                             </StyledButton>
//                         </>
//                     )
//                 }}
//             </StyledDialog>
//         </>
//     );
// }