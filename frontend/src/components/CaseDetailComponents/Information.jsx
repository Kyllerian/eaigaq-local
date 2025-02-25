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
  Box,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from '../../axiosConfig';
import { StyledButton } from '../ui/StyledComponents';
import { StyledTextFieldWithoutMargin } from '../ui/StyledTextfield';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDropzone } from 'react-dropzone';
import { getFileTypeIcon } from '../../utils/fileTypeIcons';
import { useTranslation } from 'react-i18next';

export default function CaseDetailInformation({
  id,
  caseItem,
  canEdit,
  setCaseItem,
  setSnackbar,
  InvestigatorName,
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

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
          message: t('common.success.success_case_updated'),
          severity: 'success',
        });
      })
      .catch((error) => {
        console.error(t('common.errors.error_case_updated'), error);
        setSnackbar({
          open: true,
          message: t('common.errors.error_case_updated'),
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

  // Используем react-dropzone для удобной загрузки файлов
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': [],
      'image/*': [],
      'text/plain': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'audio/*': [], // Принимаем все аудиофайлы
      // Добавьте другие типы файлов по необходимости
    },
    onDrop: (acceptedFiles) => {
      // Добавляем файл и его описание в состояние selectedFiles
      const filesWithDescriptions = acceptedFiles.map((file) => ({
        file,
        description: '',
      }));
      setSelectedFiles((prev) => [...prev, ...filesWithDescriptions]);
    },
  });

  const handleFileUpload = () => {
    if (selectedFiles.length === 0) {
      setSnackbar({
        open: true,
        message: t('common.errors.error_select_files'),
        severity: 'warning',
      });
      return;
    }

    setUploading(true);

    const uploadPromises = selectedFiles.map(({ file, description }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description || file.name);
      formData.append('case_id', id);

      return axios
        .post('/api/documents/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          setDocuments((prev) => [...prev, response.data]);
        })
        .catch((error) => {
          console.error(t('common.errors.error_file_upload'), error);
          setSnackbar({
            open: true,
            message: `${t('common.errors.error_file_upload')} ${file.name}.`,
            severity: 'error',
          });
        });
    });

    Promise.all(uploadPromises)
      .then(() => {
        setSelectedFiles([]);
        setSnackbar({
          open: true,
          message: t('common.success.success_files_uploaded'),
          severity: 'success',
        });
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleDescriptionChange = (index, value) => {
    setSelectedFiles((prev) => {
      const updatedFiles = [...prev];
      updatedFiles[index].description = value;
      return updatedFiles;
    });
  };

  return (
    <>
      <Paper elevation={1} sx={{ padding: theme.spacing(3), marginBottom: theme.spacing(2) }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2">
              <strong>{t('cases.investigator_label')}</strong> {InvestigatorName}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <StyledTextFieldWithoutMargin
              label={t('cases.case_name_label')}
              name="name"
              value={caseItem.name}
              onChange={handleInfoChange}
              disabled={!canEdit}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <StyledTextFieldWithoutMargin
              label={t('cases.case_description_label')}
              name="description"
              value={caseItem.description}
              onChange={handleInfoChange}
              multiline
              rows={4}
              disabled={!canEdit}
              fullWidth
            />
          </Grid>
          {canEdit && (
            <Grid item xs={12} sx={{ textAlign: 'right' }}>
              <StyledButton onClick={handleInfoSave}>
                {t('common.buttons.save_changes')}
              </StyledButton>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
        <Typography variant="h6" gutterBottom>
          {t('documents.documents_title')}
        </Typography>
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? theme.palette.primary.main : theme.palette.grey[400],
            padding: theme.spacing(2),
            textAlign: 'center',
            backgroundColor: isDragActive ? theme.palette.action.hover : 'inherit',
            cursor: 'pointer',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.grey[600] }} />
          <Typography variant="body1">
            {isDragActive
              ? t('documents.dropzone_hint_active')
              : t('documents.dropzone_hint_inactive')}
          </Typography>
        </Box>

        {selectedFiles.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ marginTop: theme.spacing(2) }}>
              {t('documents.files_to_upload')}
            </Typography>
            <List>
              {selectedFiles.map((fileObj, index) => (
                <ListItem key={fileObj.file.name} alignItems="flex-start">
                  <Box sx={{ marginRight: theme.spacing(2) }}>
                    {getFileTypeIcon(fileObj.file.name)}
                  </Box>
                  <ListItemText
                    primary={fileObj.file.name}
                    secondary={
                      <TextField
                        label={t('documents.file_description_label')}
                        value={fileObj.description}
                        onChange={(e) => handleDescriptionChange(index, e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                        sx={{ marginTop: theme.spacing(1) }}
                      />
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ textAlign: 'right' }}>
              <StyledButton onClick={handleFileUpload} disabled={uploading}>
                {uploading ? <CircularProgress size={24} /> : t('documents.button_upload_files')}
              </StyledButton>
            </Box>
          </>
        )}

        <Divider sx={{ marginY: theme.spacing(2) }} />

        <Typography variant="subtitle1" gutterBottom>
          {t('documents.attached_documents_label')}
        </Typography>
        {documents.length > 0 ? (
          <List>
            {documents.map((doc) => (
              <ListItem key={doc.id}>
                <Box sx={{ marginRight: theme.spacing(2) }}>
                  {getFileTypeIcon(doc.file)}
                </Box>
                <ListItemText
                  primary={
                    <a href={doc.file} target="_blank" rel="noopener noreferrer">
                      {doc.description || `${t('documents.document')} ${doc.id}`}
                    </a>
                  }
                  secondary={`${t('documents.uploaded_date')}: ${new Date(doc.uploaded_at).toLocaleString()}`}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>{t('documents.no_attached_documents')}</Typography>
        )}
      </Paper>
    </>
  );
}

// // frontend/src/components/CaseDetailComponents/Information.jsx
//
// import React, { useState, useEffect } from 'react';
// import {
//   Paper,
//   Typography,
//   Grid,
//   TextField,
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Box,
//   Divider,
//   CircularProgress,
//   Tooltip,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import axios from '../../axiosConfig';
// import { StyledButton } from '../ui/StyledComponents';
// import { StyledTextFieldWithoutMargin } from '../ui/StyledTextfield';
// import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
// import DeleteIcon from '@mui/icons-material/Delete';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import { useDropzone } from 'react-dropzone';
// import { getFileTypeIcon } from '../../utils/fileTypeIcons'; // Создадим утилиту для определения иконки по типу файла
//
// export default function CaseDetailInformation({
//   id,
//   caseItem,
//   canEdit,
//   setCaseItem,
//   setSnackbar,
//   InvestigatorName,
// }) {
//   const theme = useTheme();
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [documents, setDocuments] = useState([]);
//   const [uploading, setUploading] = useState(false);
//
//   const handleInfoChange = (event) => {
//     const { name, value } = event.target;
//     setCaseItem((prev) => ({ ...prev, [name]: value }));
//   };
//
//   const handleInfoSave = () => {
//     axios
//       .put(`/api/cases/${id}/`, {
//         name: caseItem.name,
//         description: caseItem.description,
//         active: caseItem.active,
//       })
//       .then((response) => {
//         setCaseItem(response.data);
//         setSnackbar({
//           open: true,
//           message: 'Дело успешно обновлено.',
//           severity: 'success',
//         });
//       })
//       .catch((error) => {
//         console.error('Ошибка при обновлении дела:', error);
//         setSnackbar({
//           open: true,
//           message: 'Ошибка при обновлении дела.',
//           severity: 'error',
//         });
//       });
//   };
//
//   const fetchDocuments = () => {
//     axios
//       .get('/api/documents/', {
//         params: {
//           case_id: id,
//         },
//       })
//       .then((response) => {
//         setDocuments(response.data);
//       })
//       .catch((error) => {
//         console.error('Ошибка при получении документов:', error);
//       });
//   };
//
//   useEffect(() => {
//     fetchDocuments();
//   }, []);
//
//     // Используем react-dropzone для удобной загрузки файлов
//     const {getRootProps, getInputProps, isDragActive} = useDropzone({
//         accept: {
//             'application/pdf': [],
//             'image/*': [],
//             'text/plain': [],
//             'application/msword': [],
//             'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
//             'audio/*': [], // Принимаем все аудиофайлы
//             // Добавьте другие типы файлов по необходимости
//         },
//         onDrop: (acceptedFiles) => {
//             setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
//         },
//   });
//
//   const handleFileUpload = () => {
//     if (selectedFiles.length === 0) {
//       setSnackbar({
//         open: true,
//         message: 'Пожалуйста, выберите файлы для загрузки.',
//         severity: 'warning',
//       });
//       return;
//     }
//
//     setUploading(true);
//
//     const uploadPromises = selectedFiles.map((file) => {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('description', file.name);
//       formData.append('case_id', id);
//
//       return axios
//         .post('/api/documents/', formData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         })
//         .then((response) => {
//           setDocuments((prev) => [...prev, response.data]);
//         })
//         .catch((error) => {
//           console.error('Ошибка при загрузке документа:', error);
//           setSnackbar({
//             open: true,
//             message: `Ошибка при загрузке документа ${file.name}.`,
//             severity: 'error',
//           });
//         });
//     });
//
//     Promise.all(uploadPromises)
//       .then(() => {
//         setSelectedFiles([]);
//         setSnackbar({
//           open: true,
//           message: 'Документы успешно загружены.',
//           severity: 'success',
//         });
//       })
//       .finally(() => {
//         setUploading(false);
//       });
//   };
//
//   const handleRemoveSelectedFile = (fileName) => {
//     setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName));
//   };
//
//   const handleDeleteDocument = (docId) => {
//     axios
//       .delete(`/api/documents/${docId}/`)
//       .then(() => {
//         setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
//         setSnackbar({
//           open: true,
//           message: 'Документ успешно удален.',
//           severity: 'success',
//         });
//       })
//       .catch((error) => {
//         console.error('Ошибка при удалении документа:', error);
//         setSnackbar({
//           open: true,
//           message: 'Ошибка при удалении документа.',
//           severity: 'error',
//         });
//       });
//   };
//
//   return (
//     <>
//       <Paper elevation={1} sx={{ padding: theme.spacing(3), marginBottom: theme.spacing(2) }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12}>
//             <Typography variant="body2">
//               <strong>Следователь по делу:</strong> {InvestigatorName}
//             </Typography>
//           </Grid>
//           <Grid item xs={12}>
//             <StyledTextFieldWithoutMargin
//               label="Название дела"
//               name="name"
//               value={caseItem.name}
//               onChange={handleInfoChange}
//               disabled={!canEdit}
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <StyledTextFieldWithoutMargin
//               label="Описание дела"
//               name="description"
//               value={caseItem.description}
//               onChange={handleInfoChange}
//               multiline
//               rows={4}
//               disabled={!canEdit}
//               fullWidth
//             />
//           </Grid>
//           {canEdit && (
//             <Grid item xs={12} sx={{ textAlign: 'right' }}>
//               <StyledButton onClick={handleInfoSave}>
//                 Сохранить изменения
//               </StyledButton>
//             </Grid>
//           )}
//         </Grid>
//       </Paper>
//
//       <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
//         <Typography variant="h6" gutterBottom>
//           Документы
//         </Typography>
//         <Box
//           {...getRootProps()}
//           sx={{
//             border: '2px dashed',
//             borderColor: isDragActive ? theme.palette.primary.main : theme.palette.grey[400],
//             padding: theme.spacing(2),
//             textAlign: 'center',
//             backgroundColor: isDragActive ? theme.palette.action.hover : 'inherit',
//             cursor: 'pointer',
//           }}
//         >
//           <input {...getInputProps()} />
//           <CloudUploadIcon sx={{ fontSize: 48, color: theme.palette.grey[600] }} />
//           <Typography variant="body1">
//             {isDragActive
//               ? 'Отпустите файлы для загрузки'
//               : 'Перетащите файлы сюда или нажмите для выбора'}
//           </Typography>
//         </Box>
//
//         {selectedFiles.length > 0 && (
//           <>
//             <Typography variant="subtitle1" sx={{ marginTop: theme.spacing(2) }}>
//               Файлы для загрузки:
//             </Typography>
//             <List>
//               {selectedFiles.map((file) => (
//                 <ListItem
//                   key={file.name}
//                   secondaryAction={
//                     <IconButton
//                       edge="end"
//                       aria-label="delete"
//                       onClick={() => handleRemoveSelectedFile(file.name)}
//                     >
//                       <DeleteIcon />
//                     </IconButton>
//                   }
//                 >
//                   <ListItemText primary={file.name} />
//                 </ListItem>
//               ))}
//             </List>
//             <Box sx={{ textAlign: 'right' }}>
//               <StyledButton onClick={handleFileUpload} disabled={uploading}>
//                 {uploading ? <CircularProgress size={24} /> : 'Загрузить файлы'}
//               </StyledButton>
//             </Box>
//           </>
//         )}
//
//         <Divider sx={{ marginY: theme.spacing(2) }} />
//
//         <Typography variant="subtitle1" gutterBottom>
//           Прикрепленные документы:
//         </Typography>
//         {documents.length > 0 ? (
//           <List>
//             {documents.map((doc) => (
//               <ListItem
//                 key={doc.id}
//                 secondaryAction={
//                   <Tooltip title="Удалить документ">
//                     <IconButton
//                       edge="end"
//                       aria-label="delete"
//                       onClick={() => handleDeleteDocument(doc.id)}
//                     >
//                       <DeleteIcon />
//                     </IconButton>
//                   </Tooltip>
//                 }
//               >
//                 <Box sx={{ marginRight: theme.spacing(2) }}>
//                   {getFileTypeIcon(doc.file)}
//                 </Box>
//                 <ListItemText
//                   primary={
//                     <a href={doc.file} target="_blank" rel="noopener noreferrer">
//                       {doc.description || `Документ ${doc.id}`}
//                     </a>
//                   }
//                   secondary={`Дата загрузки: ${new Date(doc.uploaded_at).toLocaleString()}`}
//                 />
//               </ListItem>
//             ))}
//           </List>
//         ) : (
//           <Typography>Нет прикрепленных документов.</Typography>
//         )}
//       </Paper>
//     </>
//   );
// }

// // frontend/src/components/CaseDetailComponents/Information.jsx
// import React, { useState, useEffect } from 'react';
// import {
//     Paper,
//     Typography,
//     Grid,
//     TextField,
//     List,
//     ListItem,
//     ListItemText,
//     IconButton,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import axios from '../../axiosConfig';
// import { StyledButton } from '../ui/StyledComponents';
// import { StyledTextFieldWithoutMargin } from '../ui/StyledTextfield';
// import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
// import DescriptionIcon from '@mui/icons-material/Description';
//
// export default function CaseDetailInformation({ id, caseItem, canEdit, setCaseItem, setSnackbar, InvestigatorName }) {
//     const theme = useTheme();
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [fileDescription, setFileDescription] = useState('');
//     const [documents, setDocuments] = useState([]);
//
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
//
//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         setSelectedFile(file);
//         setFileDescription(file ? file.name : '');
//     };
//
//     const handleDescriptionChange = (event) => {
//         setFileDescription(event.target.value);
//     };
//
//     const handleFileUpload = () => {
//         if (!selectedFile) {
//             setSnackbar({
//                 open: true,
//                 message: 'Пожалуйста, выберите файл для загрузки.',
//                 severity: 'warning',
//             });
//             return;
//         }
//
//         const formData = new FormData();
//         formData.append('file', selectedFile);
//         formData.append('description', fileDescription);
//         formData.append('case_id', id);
//
//         axios
//             .post('/api/documents/', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//             })
//             .then((response) => {
//                 setDocuments((prev) => [...prev, response.data]);
//                 setSelectedFile(null);
//                 setFileDescription('');
//                 setSnackbar({
//                     open: true,
//                     message: 'Документ успешно загружен.',
//                     severity: 'success',
//                 });
//             })
//             .catch((error) => {
//                 console.error('Ошибка при загрузке документа:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при загрузке документа.',
//                     severity: 'error',
//                 });
//             });
//     };
//
//     const fetchDocuments = () => {
//         axios
//             .get('/api/documents/', {
//                 params: {
//                     case_id: id,
//                 },
//             })
//             .then((response) => {
//                 setDocuments(response.data);
//             })
//             .catch((error) => {
//                 console.error('Ошибка при получении документов:', error);
//             });
//     };
//
//     useEffect(() => {
//         fetchDocuments();
//     }, []);
//
//     return (
//         <>
//             <Paper elevation={1} sx={{ padding: theme.spacing(3) }}>
//                 <Grid container spacing={2}>
//                     <Grid item xs={12}>
//                         <Typography variant="body2">Следователь по делу: {InvestigatorName}</Typography>
//                     </Grid>
//                     <Grid item xs={12}>
//                         <StyledTextFieldWithoutMargin
//                             label="Название дела"
//                             name="name"
//                             value={caseItem.name}
//                             onChange={handleInfoChange}
//                             disabled={!canEdit}
//                         />
//                     </Grid>
//                     <Grid item xs={12}>
//                         <StyledTextFieldWithoutMargin
//                             label="Описание дела"
//                             name="description"
//                             value={caseItem.description}
//                             onChange={handleInfoChange}
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
//                     <Grid item xs={12}>
//                         <Typography variant="h6">Документы</Typography>
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                         <input
//                             type="file"
//                             onChange={handleFileChange}
//                         />
//                     </Grid>
//                     <Grid item xs={12} sm={6}>
//                         {selectedFile && (
//                             <TextField
//                                 label="Описание файла"
//                                 value={fileDescription}
//                                 onChange={handleDescriptionChange}
//                                 fullWidth
//                             />
//                         )}
//                     </Grid>
//                     {selectedFile && (
//                         <Grid item xs={12} sx={{ textAlign: 'right' }}>
//                             <StyledButton onClick={handleFileUpload}>
//                                 Загрузить документ
//                             </StyledButton>
//                         </Grid>
//                     )}
//                     <Grid item xs={12}>
//                         {documents.length > 0 ? (
//                             <List>
//                                 {documents.map((doc) => (
//                                     <ListItem key={doc.id}>
//                                         <InsertDriveFileIcon sx={{ marginRight: theme.spacing(1) }} />
//                                         <ListItemText
//                                             primary={
//                                                 <a href={doc.file} target="_blank" rel="noopener noreferrer">
//                                                     {doc.description || `Документ ${doc.id}`}
//                                                 </a>
//                                             }
//                                             secondary={`Дата загрузки: ${new Date(doc.uploaded_at).toLocaleString()}`}
//                                         />
//                                     </ListItem>
//                                 ))}
//                             </List>
//                         ) : (
//                             <Typography>Нет прикреплённых документов.</Typography>
//                         )}
//                     </Grid>
//                 </Grid>
//             </Paper>
//         </>
//     );
// }