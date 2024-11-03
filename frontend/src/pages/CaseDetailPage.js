// src/pages/CaseDetailPage.js

import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  Typography,
  Container,
  Box,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axiosConfig';
import { AuthContext } from '../contexts/AuthContext';
import Header from '../components/Header';
import { useReactToPrint } from 'react-to-print';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png'; // Импорт логотипа
import { EVIDENCE_TYPES } from '../constants/evidenceTypes'; // Импорт типов ВД
import { evidenceStatuses } from '../constants/evidenceStatuses'; // Импорт статусов ВД

// Import custom components
import { StyledButton, StyledTableCell } from '../components/StyledComponents';
import CaseInformationTab from '../components/CaseInformationTab';
import EvidenceTab from '../components/EvidenceTab';
import ChangeHistoryTab from '../components/ChangeHistoryTab';
import Loading from '../components/Loading';

const CaseDetailPage = () => {
  const { id } = useParams(); // Получаем ID дела из URL
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const [caseItem, setCaseItem] = useState(null);
  const [groups, setGroups] = useState([]);
  const [changeLogs, setChangeLogs] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const reportRef = useRef();

  // Права доступа
  const isCreatorOrInvestigator =
    user && (user.id === caseItem?.creator || user.id === caseItem?.investigator);
  const canView =
    isCreatorOrInvestigator ||
    user.role === 'DEPARTMENT_HEAD' ||
    user.role === 'REGION_HEAD';
  const canEdit = isCreatorOrInvestigator && user.role !== 'REGION_HEAD';
  const canAddGroup = isCreatorOrInvestigator && user.role !== 'REGION_HEAD';
  const canViewHistory =
    (user.role === 'DEPARTMENT_HEAD' ||
      user.role === 'REGION_HEAD' ||
      isCreatorOrInvestigator) &&
    canView;

  useEffect(() => {
    // Получаем детали дела
    axios
      .get(`/api/cases/${id}/`)
      .then((response) => {
        setCaseItem(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при получении деталей дела:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при загрузке дела.',
          severity: 'error',
        });
      });

    // Получаем группы и вещественные доказательства
    axios
      .get(`/api/evidence-groups/?case=${id}`)
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при получении групп:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при загрузке групп.',
          severity: 'error',
        });
      });

    // Получаем историю изменений, если пользователь имеет право на просмотр
    if (canViewHistory) {
      axios
        .get(`/api/audit-entries/?case_id=${id}`)
        .then((response) => {
          setChangeLogs(response.data);
        })
        .catch((error) => {
          console.error('Ошибка при получении истории изменений:', error);
          setSnackbar({
            open: true,
            message: 'Ошибка при загрузке истории изменений.',
            severity: 'error',
          });
        });
    }
  }, [id, canViewHistory]);

  // Обработчик изменения вкладки
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Обработчик переключения статуса дела
  const handleStatusToggle = () => {
    const updatedStatus = !caseItem.active;
    axios
      .patch(`/api/cases/${id}/`, {
        active: updatedStatus,
      })
      .then((response) => {
        setCaseItem(response.data);
        setSnackbar({
          open: true,
          message: `Дело ${updatedStatus ? 'активировано' : 'закрыто'}.`,
          severity: 'success',
        });
      })
      .catch((error) => {
        console.error('Ошибка при изменении статуса дела:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при изменении статуса дела.',
          severity: 'error',
        });
      });
  };

  // Обработчик печати отчёта
  const handlePrintReport = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Отчет по делу ${caseItem?.name}`,
    pageStyle: `
    @media print {
      body {
        -webkit-print-color-adjust: exact;
      }
    }
  `,
  });

  // Функции для форматирования и отображения данных

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleDateString('ru-RU', options);
  };

  // Получение сообщения действия
  const getActionMessage = (log) => {
    if (log.class_name === 'Case' && log.action === 'create') {
      return 'Создание дела';
    } else if (log.class_name === 'Case' && log.action === 'update') {
      return 'Изменение данных дела';
    } else if (
      log.class_name === 'MaterialEvidence' &&
      log.action === 'create'
    ) {
      return `Добавлено вещественное доказательство: ${log.object_name || ''}`;
    } else if (
      log.class_name === 'MaterialEvidence' &&
      log.action === 'update'
    ) {
      return `Изменение статуса вещественного доказательства: ${
        log.object_name || ''
      }`;
    } else {
      // Другие случаи
      return `${log.class_name_display} - ${log.action}`;
    }
  };

  // Получение отображаемого статуса
  const getStatusLabel = (value) => {
    const status = evidenceStatuses.find((status) => status.value === value);
    return status ? status.label : value;
  };

  // Получение отображаемого типа
  const getTypeLabel = (value) => {
    const type = EVIDENCE_TYPES.find((type) => type.value === value);
    return type ? type.label : value;
  };

  // Отображаемые названия полей
  const fieldLabels = {
    name: 'Название',
    description: 'Описание',
    status: 'Статус',
    type: 'Тип ВД',
    updated: 'Обновлено',
    created: 'Создано',
    case: 'Дело',
    group: 'Группа',
  };

  // Закрытие Snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!caseItem) {
    return (
      <Container>
        <Loading />
      </Container>
    );
  }

  if (!canView) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          У вас нет прав для просмотра этого дела.
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#e9edf5', minHeight: '100vh' }}>
      {/* Header */}
      <Header onLogout={() => navigate('/login')} />

      {/* Main Content */}
      <Container sx={{ marginTop: theme.spacing(12), pb: theme.spacing(4) }}>
        {/* Back Button and Title */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: theme.spacing(2),
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Детали дела</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {/* Export Button */}
          {canView && (
            <StyledButton
              onClick={handlePrintReport}
              startIcon={<PrintIcon />}
              sx={{ mr: 2 }}
            >
              Экспорт
            </StyledButton>
          )}
          {/* Activate/Close Button */}
          {canEdit && (
            <StyledButton
              onClick={handleStatusToggle}
              sx={{
                backgroundColor: caseItem.active
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                '&:hover': {
                  backgroundColor: caseItem.active
                    ? theme.palette.error.dark
                    : theme.palette.success.dark,
                },
              }}
              startIcon={caseItem.active ? <CloseIcon /> : <CheckCircleIcon />}
            >
              {caseItem.active ? 'Закрыть' : 'Активировать'}
            </StyledButton>
          )}
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ marginBottom: theme.spacing(3) }}
          TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
          textColor="inherit"
        >
          <Tab label="Информация" value={0} />
          <Tab label="Вещдоки" value={1} />
          {canViewHistory && <Tab label="История изменений" value={2} />}
        </Tabs>

        {/* Tab Content */}
        {tabValue === 0 && (
          <CaseInformationTab
            caseItem={caseItem}
            canEdit={canEdit}
            setCaseItem={setCaseItem}
            setSnackbar={setSnackbar}
          />
        )}
        {tabValue === 1 && (
          <EvidenceTab
            caseId={id}
            user={user}
            groups={groups}
            setGroups={setGroups}
            canAddGroup={canAddGroup}
            canEdit={canEdit}
            setSnackbar={setSnackbar}
            setChangeLogs={setChangeLogs} // Передаем setChangeLogs
          />
        )}
        {canViewHistory && tabValue === 2 && (
          <ChangeHistoryTab changeLogs={changeLogs} setSnackbar={setSnackbar} />
        )}
      </Container>

      {/* Report Print Component */}
      <div style={{ display: 'none' }}>
        <div
          ref={reportRef}
          style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#000',
            fontSize: '12px', // Уменьшили шрифт
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src={LogoMVDKZ}
              alt="Логотип"
              style={{ maxWidth: '100px', marginBottom: '10px' }}
            />
            <Typography variant="h5" gutterBottom>
              Отчет по делу
            </Typography>
            <Typography variant="subtitle1">
              Дата формирования отчета: {formatDate(new Date().toISOString())}
            </Typography>
          </div>

          {/* Информация о деле */}
          <div style={{ marginBottom: '20px' }}>
            <Typography variant="body1">
              <strong>Название дела:</strong> {caseItem.name}
            </Typography>
            <Typography variant="body1">
              <strong>Описание:</strong> {caseItem.description}
            </Typography>
            <Typography variant="body1">
              <strong>Следователь:</strong>{' '}
              {caseItem.investigator.full_name || 'Неизвестно'}
            </Typography>
            <Typography variant="body1">
              <strong>Регион:</strong>{' '}
              {caseItem.department.region_display || 'Неизвестно'}
            </Typography>
            <Typography variant="body1">
              <strong>Отделение:</strong>{' '}
              {caseItem.department.name || 'Неизвестно'}
            </Typography>
          </div>

          {/* Вещественные доказательства */}
          <div style={{ marginBottom: '20px' }}>
            <Typography variant="h6" gutterBottom>
              Вещественные доказательства
            </Typography>
            {groups.map((group) => (
              <Box key={group.id} mb={2}>
                <Typography variant="subtitle1">{group.name}</Typography>
                <TableContainer
                  component={Paper}
                  style={{ boxShadow: 'none' }}
                >
                  <Table
                    aria-label={`Таблица ВД группы ${group.name}`}
                    style={{
                      tableLayout: 'fixed',
                      width: '100%',
                      fontSize: '12px',
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '25%' }}>
                          <strong>Название</strong>
                        </TableCell>
                        <TableCell style={{ width: '25%' }}>
                          <strong>Описание</strong>
                        </TableCell>
                        <TableCell style={{ width: '20%' }}>
                          <strong>Тип ВД</strong>
                        </TableCell>
                        <TableCell style={{ width: '30%' }}>
                          <strong>Статус</strong>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.material_evidences &&
                      group.material_evidences.length > 0 ? (
                        group.material_evidences.map((evidence) => (
                          <TableRow key={evidence.id}>
                            <TableCell
                              style={{
                                width: '25%',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                              }}
                            >
                              {evidence.name}
                            </TableCell>
                            <TableCell
                              style={{
                                width: '25%',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                              }}
                            >
                              {evidence.description}
                            </TableCell>
                            <TableCell
                              style={{
                                width: '20%',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                              }}
                            >
                              {getTypeLabel(evidence.type)}
                            </TableCell>
                            <TableCell
                              style={{
                                width: '30%',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                              }}
                            >
                              {getStatusLabel(evidence.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            Нет вещественных доказательств.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </div>

          {/* История изменений */}
          {canViewHistory && (
            <div
              style={{
                pageBreakBefore: 'always',
                marginBottom: '20px',
              }}
            >
              <Typography variant="h6" gutterBottom>
                История изменений
              </Typography>
              <TableContainer
                component={Paper}
                style={{ boxShadow: 'none' }}
              >
                <Table
                  aria-label="Таблица истории изменений"
                  style={{
                    tableLayout: 'fixed',
                    width: '100%',
                    fontSize: '12px',
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Дата и время</StyledTableCell>
                      <StyledTableCell>Пользователь</StyledTableCell>
                      <StyledTableCell>Действие</StyledTableCell>
                      <StyledTableCell>Изменения</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {changeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.created)}</TableCell>
                        <TableCell>
                          {log.user ? log.user.full_name : 'Система'}
                        </TableCell>
                        <TableCell>{getActionMessage(log)}</TableCell>
                        <TableCell>
                          {(() => {
                            if (log.data && log.data.trim() !== '') {
                              try {
                                const data = JSON.parse(log.data);
                                if (log.action === 'update') {
                                  const displayFields = [
                                    'name',
                                    'description',
                                    'status',
                                    'type',
                                  ];
                                  return Object.entries(data).map(
                                    ([field, values]) => {
                                      if (displayFields.includes(field)) {
                                        return (
                                          <div key={field}>
                                            <strong>
                                              {fieldLabels[field] || field}
                                            </strong>
                                            :{' '}
                                            {field === 'status'
                                              ? getStatusLabel(values.old)
                                              : field === 'type'
                                              ? getTypeLabel(values.old)
                                              : values.old}{' '}
                                            →{' '}
                                            {field === 'status'
                                              ? getStatusLabel(values.new)
                                              : field === 'type'
                                              ? getTypeLabel(values.new)
                                              : values.new}
                                          </div>
                                        );
                                      } else {
                                        return null;
                                      }
                                    }
                                  );
                                } else if (log.action === 'create') {
                                  const displayFields = [
                                    'name',
                                    'description',
                                    'status',
                                    'type',
                                  ];
                                  return (
                                    <div>
                                      {Object.entries(data).map(
                                        ([field, value]) => {
                                          if (displayFields.includes(field)) {
                                            return (
                                              <div key={field}>
                                                <strong>
                                                  {fieldLabels[field] || field}
                                                </strong>
                                                :{' '}
                                                {field === 'status'
                                                  ? getStatusLabel(value)
                                                  : field === 'type'
                                                  ? getTypeLabel(value)
                                                  : value}
                                              </div>
                                            );
                                          } else {
                                            return null;
                                          }
                                        }
                                      )}
                                    </div>
                                  );
                                } else if (log.action === 'delete') {
                                  return <div>Объект был удален.</div>;
                                } else {
                                  return 'Нет данных об изменениях.';
                                }
                              } catch (error) {
                                console.error(
                                  'Ошибка парсинга данных лога:',
                                  error
                                );
                                return 'Нет данных об изменениях.';
                              }
                            } else {
                              return 'Нет данных об изменениях.';
                            }
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} Министерство внутренних дел Республики
              Казахстан.
            </Typography>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CaseDetailPage;