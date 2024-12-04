// frontend/src/components/CaseDetailComponents/DialogAlertNewStatus.jsx

import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

export default function DialogAlertNewStatus({
  open,
  setOpenAlertNewStatusDialog,
  SubmitChangeEvidenceStatus,
  evidenceId,
  newStatus,
  setSnackbar,
  id, // ID дела
}) {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      // Получаем список документов, прикрепленных к делу
      axios
        .get(`/api/documents/?case_id=${id}`)
        .then((response) => {
          setDocuments(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Ошибка при получении документов:', error);
          setSnackbar({
            open: true,
            message: 'Ошибка при загрузке документов.',
            severity: 'error',
          });
          setLoading(false);
        });
    }
  }, [open, id, setSnackbar]);

  const handleCloseDialog = () => {
    setOpenAlertNewStatusDialog(false);
    setSelectedDocumentId('');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!selectedDocumentId) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, выберите документ.',
        severity: 'error',
      });
      return;
    }
    // Передаем выбранный документ для дальнейшей обработки
    SubmitChangeEvidenceStatus(evidenceId, newStatus, selectedDocumentId);
    handleCloseDialog();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
      <DialogTitle>Изменение статуса вещественного доказателства</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <p>
              Пожалуйста, выберите документ, на основании которого производится
              действие.
            </p>
            <FormControl fullWidth>
              <InputLabel id="document-select-label">Документ</InputLabel>
              <Select
                labelId="document-select-label"
                value={selectedDocumentId}
                label="Документ"
                onChange={(e) => setSelectedDocumentId(e.target.value)}
              >
                {documents.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.description || doc.file}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Отмена</Button>
        <Button onClick={handleFormSubmit} color="primary" disabled={loading}>
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
}


// // frontend/src/components/CaseDetailComponents/DialogAlertNewStatus.jsx
// import {
//     Button,
//     TextField,
//     FormControl,
//     InputLabel,
//     Select,
//     MenuItem,
// } from '@mui/material';
//
// import { StyledButton } from '../ui/StyledComponents';
// import { useState } from 'react';
// import axios from '../../axiosConfig';
// import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
// import StyledDialog from '../ui/StyledDialog';
// import { StyledTextField } from '../ui/StyledTextfield';
//
// export default function DialogAlertNewStatus({ open, setOpenAlertNewStatusDialog, SubmitChangeEvidenceStatus,evidenceId, newStatus, setSnackbar, id }) {
//
//     const handleCloseDialog = () => {
//         setOpenAlertNewStatusDialog(false);
//     };
//
//     const handleFormSubmit = (event) => {
//         event.preventDefault();
//         SubmitChangeEvidenceStatus(evidenceId, newStatus);
//         handleCloseDialog();
//     };
//     return (
//         <>
//             <StyledDialog title={"Изменить статус вещдока"} open={open} setOpen={setOpenAlertNewStatusDialog} >
//                 {{
//                     content: (
//                         <>
//                             <p>Уверены, что хотите изменить статус?
//                                 Это действие нельзя отменить
//                             </p>
//                         </>
//                     ),
//                     actions: (
//                         <>
//                             <Button onClick={handleCloseDialog}>Отмена</Button>
//                             <StyledButton onClick={handleFormSubmit}>Подтвердить</StyledButton>
//                         </>
//                     )
//                 }}
//             </StyledDialog>
//         </>
//     );
// }
