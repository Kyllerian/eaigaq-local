import {
    Button,
    TextField,
} from '@mui/material';

import { StyledButton, } from '../ui/StyledComponents';
import { useState } from 'react';
import axios from '../../axiosConfig';
import StyledDialog from '../ui/StyledDialog';

export default function DialogNewGroup({ open, setOpenGroupDialog, setGroups, setSnackbar, groups, id }) {
    const [newGroup, setNewGroup] = useState({ name: '' });

    const handleCloseGroupDialog = () => {
        setOpenGroupDialog(false);
        setNewGroup({ name: '' });
    };

    const handleGroupInputChange = (event) => {
        const { name, value } = event.target;
        setNewGroup({ ...newGroup, [name]: value });
    };

    const handleGroupFormSubmit = (event) => {
        event.preventDefault();

        axios
            .post('/api/evidence-groups/', {
                name: newGroup.name,
                case: id,
            })
            .then((response) => {
                setGroups([...groups, response.data]);
                handleCloseGroupDialog();
                setSnackbar({
                    open: true,
                    message: 'Группа успешно добавлена.',
                    severity: 'success',
                });
            })
            .catch((error) => {
                console.error(
                    'Ошибка при добавлении группы:',
                    error.response?.data || error
                );
                setSnackbar({
                    open: true,
                    message: 'Ошибка при добавлении группы.',
                    severity: 'error',
                });
            });
    };
    return (
        <>
            {/* Диалоговое окно для добавления новой группы */}
            <StyledDialog title={"Добавить группу"} open={open} setOpen={setOpenGroupDialog} setState={setNewGroup} >
                {{
                    content: (
                        <>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Название группы"
                                name="name"
                                value={newGroup.name}
                                onChange={handleGroupInputChange}
                                fullWidth
                                required
                            />
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleCloseGroupDialog}>Отмена</Button>
                            <StyledButton onClick={handleGroupFormSubmit}>
                                Добавить
                            </StyledButton>
                        </>
                    )
                }}
            </StyledDialog>
        </>
    );
}