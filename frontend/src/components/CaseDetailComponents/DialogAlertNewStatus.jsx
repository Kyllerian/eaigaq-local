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
import { useTranslation } from 'react-i18next';

export default function DialogAlertNewStatus({
  open,
  setOpenAlertNewStatusDialog,
  SubmitChangeEvidenceStatus,
  evidenceId,
  newStatus,
  setSnackbar,
  id, // ID дела
}) {
  const { t } = useTranslation();
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
          console.error(t('common.errors.error_load_documents'), error);
          setSnackbar({
            open: true,
            message: t('common.errors.error_load_documents'),
            severity: 'error',
          });
          setLoading(false);
        });
    }
  }, [open, id, setSnackbar, t]);

  const handleCloseDialog = () => {
    setOpenAlertNewStatusDialog(false);
    setSelectedDocumentId('');
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (!selectedDocumentId) {
      setSnackbar({
        open: true,
        message: t('common.errors.error_select_document'),
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
      <DialogTitle>{t('case_detail.components.dialog_alert_new_status.title')}</DialogTitle>
      <DialogContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <p>
              {t('case_detail.components.dialog_alert_new_status.description')}
            </p>
            <FormControl fullWidth>
              <InputLabel id="document-select-label">{t('documents.document')}</InputLabel>
              <Select
                labelId="document-select-label"
                value={selectedDocumentId}
                label={t('documents.document')}
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
        <Button onClick={handleCloseDialog}>{t('common.buttons.cancel')}</Button>
        <Button onClick={handleFormSubmit} color="primary" disabled={loading}>
          {t('common.buttons.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}