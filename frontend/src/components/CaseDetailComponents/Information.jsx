// frontend/src/components/CaseDetailComponents/Information.jsx
import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Grid,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from '../../axiosConfig';
import { StyledButton } from '../ui/StyledComponents';
import { StyledTextFieldWithoutMargin } from '../ui/StyledTextfield';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DescriptionIcon from '@mui/icons-material/Description';

export default function CaseDetailInformation({ id, caseItem, canEdit, setCaseItem, setSnackbar, InvestigatorName }) {
    const theme = useTheme();
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileDescription, setFileDescription] = useState('');
    const [documents, setDocuments] = useState([]);

    const handleInfoChange = (event) => {
        const { name, value } = event.target;
        setCaseItem((prev) => ({ ...prev, [name]: value }));
    };

    const handleInfoSave = () => {
        axios
            .put(`/api/cases/${id}/`, {
                name: caseItem.name,
                description: caseItem.description,
                active: caseItem.active,
            })
            .then((response) => {
                setCaseItem(response.data);
                setSnackbar({
                    open: true,
                    message: 'Дело успешно обновлено.',
                    severity: 'success',
                });
            })
            .catch((error) => {
                console.error('Ошибка при обновлении дела:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при обновлении дела.',
                    severity: 'error',
                });
            });
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        setFileDescription(file ? file.name : '');
    };

    const handleDescriptionChange = (event) => {
        setFileDescription(event.target.value);
    };

    const handleFileUpload = () => {
        if (!selectedFile) {
            setSnackbar({
                open: true,
                message: 'Пожалуйста, выберите файл для загрузки.',
                severity: 'warning',
            });
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('description', fileDescription);
        formData.append('case_id', id);

        axios
            .post('/api/documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                setDocuments((prev) => [...prev, response.data]);
                setSelectedFile(null);
                setFileDescription('');
                setSnackbar({
                    open: true,
                    message: 'Документ успешно загружен.',
                    severity: 'success',
                });
            })
            .catch((error) => {
                console.error('Ошибка при загрузке документа:', error);
                setSnackbar({
                    open: true,
                    message: 'Ошибка при загрузке документа.',
                    severity: 'error',
                });
            });
    };

    const fetchDocuments = () => {
        axios
            .get('/api/documents/', {
                params: {
                    case_id: id,
                },
            })
            .then((response) => {
                setDocuments(response.data);
            })
            .catch((error) => {
                console.error('Ошибка при получении документов:', error);
            });
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <>
            <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="body2">Следователь по делу: {InvestigatorName}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextFieldWithoutMargin
                            label="Название дела"
                            name="name"
                            value={caseItem.name}
                            onChange={handleInfoChange}
                            disabled={!canEdit}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <StyledTextFieldWithoutMargin
                            label="Описание дела"
                            name="description"
                            value={caseItem.description}
                            onChange={handleInfoChange}
                            multiline
                            rows={4}
                            disabled={!canEdit}
                        />
                    </Grid>
                    {canEdit && (
                        <Grid item xs={12} sx={{ textAlign: 'right' }}>
                            <StyledButton onClick={handleInfoSave}>
                                Сохранить изменения
                            </StyledButton>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Typography variant="h6">Документы</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <input
                            type="file"
                            onChange={handleFileChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        {selectedFile && (
                            <TextField
                                label="Описание файла"
                                value={fileDescription}
                                onChange={handleDescriptionChange}
                                fullWidth
                            />
                        )}
                    </Grid>
                    {selectedFile && (
                        <Grid item xs={12} sx={{ textAlign: 'right' }}>
                            <StyledButton onClick={handleFileUpload}>
                                Загрузить документ
                            </StyledButton>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        {documents.length > 0 ? (
                            <List>
                                {documents.map((doc) => (
                                    <ListItem key={doc.id}>
                                        <InsertDriveFileIcon sx={{ marginRight: theme.spacing(1) }} />
                                        <ListItemText
                                            primary={
                                                <a href={doc.file} target="_blank" rel="noopener noreferrer">
                                                    {doc.description || `Документ ${doc.id}`}
                                                </a>
                                            }
                                            secondary={`Дата загрузки: ${new Date(doc.uploaded_at).toLocaleString()}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Typography>Нет прикреплённых документов.</Typography>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </>
    );
}


// // frontend/src/components/CaseDetailComponents/Information.jsx
// import {
//     Paper,
//     Typography,
//     Grid,
// } from '@mui/material';
//
// import { useTheme } from '@mui/material/styles';
// import axios from '../../axiosConfig';
// import { StyledButton } from '../ui/StyledComponents';
// import { StyledTextFieldWithoutMargin } from '../ui/StyledTextfield';
//
// export default function CaseDetailInfromation({ id, caseItem, canEdit, setCaseItem, setSnackbar, InvestigatorName }) {
//     const theme = useTheme();
//     const handleInfoChange = (event) => {
//         const { name, value } = event.target;
//         setCaseItem((prev) => ({ ...prev, [name]: value }));
//     };
//
//     const handleInfoSave = () => {
//         axios
//             .put(`/api/cases/${id}/`, {
//                 name: caseItem.name,
//                 description: caseItem.description,
//                 active: caseItem.active,
//             })
//             .then((response) => {
//                 setCaseItem(response.data);
//                 setSnackbar({
//                     open: true,
//                     message: 'Дело успешно обновлено.',
//                     severity: 'success',
//                 });
//             })
//             .catch((error) => {
//                 console.error('Ошибка при обновлении дела:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при обновлении дела.',
//                     severity: 'error',
//                 });
//             });
//     };
//     return (
//         <>
//             <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
//                 <Grid container spacing={2}>
//                     <Typography variant="body2">Следователь по делу: {InvestigatorName}</Typography>
//                     <Grid item xs={12}>
//                         <StyledTextFieldWithoutMargin label="Название дела" name="name" value={caseItem.name} onChange={handleInfoChange} disabled={!canEdit} />
//
//                     </Grid>
//                     <Grid item xs={12}>
//                         <StyledTextFieldWithoutMargin label="Описание дела" name="description" value={caseItem.description} onChange={handleInfoChange}
//                             multiline
//                             rows={4}
//                             disabled={!canEdit}
//                         />
//                     </Grid>
//                     {canEdit && (
//                         <Grid item xs={12} sx={{ textAlign: 'right' }}>
//                             <StyledButton onClick={handleInfoSave}>
//                                 Сохранить изменения
//                             </StyledButton>
//                         </Grid>
//                     )}
//                 </Grid>
//             </Paper>
//         </>
//     );
// }