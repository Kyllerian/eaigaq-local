// frontend/src/pages/CaseDetailPage.js


import React, { useEffect, useState, useContext, useRef } from 'react';
import axios from '../axiosConfig';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import Layout from '../components/Layout';
import CaseDetailInfromation from '../components/CaseDetailComponents/Information';
import CaseDetailMatEvidence from '../components/CaseDetailComponents/MatEvidence';
import History from '../components/CaseDetailComponents/History';
import BackButton from '../components/Buttons/Back';
import PrintReport from '../components/CaseDetailComponents/PrintReport';
import Loading from '../components/Loading';
import Notifyer from '../components/Notifyer';
import { StyledButton } from '../components/ui/StyledComponents';
import PrintButton from '../components/ui/PrintButton';
import DialogChangeInvestigator from '../components/CaseDetailComponents/DialogChangeInvestigator';

// Импорт библиотек для Excel
import HandleExportExcel from '../components/CaseDetailComponents/ExportExcelCaseDetail';
import { useTranslation } from 'react-i18next';

// Подключаем наши хуки
import { useFieldLabels } from '../constants/fieldsLabels';
import { useEvidenceTypes } from '../constants/evidenceTypes';
import { useEvidenceStatuses } from '../constants/evidenceStatuses';


const CaseDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // Получаем ID дела из URL
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [caseItem, setCaseItem] = useState(null);
  const [groups, setGroups] = useState([]);
  const [openDialogChangeInvestigator, setOpenDialogChangeInvestigator] = useState(false);
  const [InvestigatorName, setInvestigatorName] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Реф для печати отчета
  const reportRef = useRef();

  // Состояние для хранения логов изменений
  const [changeLogs, setChangeLogs] = useState([]);

  // Состояние для предотвращения повторных запросов
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Получаем значения из хуков ОДИН раз в компоненте:
  const fieldLabels = useFieldLabels();
  const evidenceTypes = useEvidenceTypes();
  const evidenceStatuses = useEvidenceStatuses();

  // Функция для печати отчета
  const handlePrintReport = useReactToPrint({
    contentRef: reportRef,
    documentTitle: t('common.report.titles.report_case') + ` ${caseItem?.name}`,
    pageStyle: `
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
    onAfterPrint: () => {
      setIsLoading(false);
    },
  });

  // Проверяем, является ли текущий пользователь создателем или следователем дела
  const isCreatorOrInvestigator =
    user &&
    (user.id === caseItem?.creator || user.id === caseItem?.investigator);

  // Проверяем права просмотра
  const canView =
    isCreatorOrInvestigator ||
    user.role === 'DEPARTMENT_HEAD' ||
    user.role === 'REGION_HEAD';

  // Определяем, может ли пользователь редактировать дело
  const canEdit = isCreatorOrInvestigator && user.role !== 'REGION_HEAD';

  // Определяем, может ли пользователь добавлять группы
  const canAddGroup = isCreatorOrInvestigator && user.role !== 'REGION_HEAD';

  // Определяем, может ли пользователь видеть историю изменений
  const canViewHistory =
    (user.role === 'DEPARTMENT_HEAD' ||
      user.role === 'REGION_HEAD' ||
      isCreatorOrInvestigator) &&
    canView;

  const canChangeInvestigator = user.role === 'DEPARTMENT_HEAD' || user.role === 'REGION_HEAD';

  const handlePrint = (type) => {
    setIsLoading(true);

    if (type === 'pdf') {
      // Получаем историю изменений дела, если пользователь имеет право ее видеть
      if (canViewHistory) {
        axios
          .get(`/api/audit-entries/?case_id=${id}`)
          .then((response) => {
            setChangeLogs(response.data);
          })
          .catch((error) => {
            console.error(t('common.errors.error_load_history_edits'), error);
            setSnackbar({
              open: true,
              message: t('common.errors.error_load_history_edits'),
              severity: 'error',
            });
          });
      }
      handlePrintReport();
    } else if (type === 'excel') {
      HandleExportExcel(caseItem, setSnackbar, changeLogs, InvestigatorName, canViewHistory, groups, setIsLoading, fieldLabels, evidenceTypes, evidenceStatuses);
    }
  };
  useEffect(() => {
    // Получаем детали дела
    axios
      .get(`/api/cases/${id}/`)
      .then((response) => {
        setCaseItem(response.data);

        // получаем следователя этого дела 
        axios
          .get(`/api/users/${response.data?.investigator}/`)
          .then((response) => {
            setInvestigatorName(response.data?.full_name);
          })
          .catch((error) => {
            console.error(t('common.errors.error_get_investigator_name'), error);
            setSnackbar({
              open: true,
              message: t('common.errors.error_load_case'),
              severity: 'error',
            });
          });
      })
      .catch((error) => {
        console.error(t('common.errors.error_load_case'), error);
        setSnackbar({
          open: true,
          message: t('common.errors.error_load_case'),
          severity: 'error',
        });
      });

    // Получаем группы и связанные с ними вещественные доказательства
    axios
      .get(`/api/evidence-groups/?case=${id}`)
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error(t('common.errors.error_load_groups'), error);
        setSnackbar({
          open: true,
          message: t('common.errors.error_load_groups'),
          severity: 'error',
        });
      });

    // Получаем историю изменений дела, если пользователь имеет право ее видеть
    if (canViewHistory) {
      axios
        .get(`/api/audit-entries/?case_id=${id}`)
        .then((response) => {
          setChangeLogs(response.data);
        })
        .catch((error) => {
          console.error(t('common.errors.error_load_history_edits'), error);
          setSnackbar({
            open: true,
            message: t('common.errors.error_load_history_edits'),
            severity: 'error',
          });
        });
    }
  }, [id, canViewHistory, t]);

  useEffect(() => {
    if (tabValue === 2) {
      // Получаем историю изменений дела, если пользователь имеет право ее видеть
      if (canViewHistory) {
        axios
          .get(`/api/audit-entries/?case_id=${id}`)
          .then((response) => {
            setChangeLogs(response.data);
          })
          .catch((error) => {
            console.error(t('common.errors.error_load_history_edits'), error);
            setSnackbar({
              open: true,
              message: t('common.errors.error_load_history_edits'),
              severity: 'error',
            });
          });
      }
    }
  }, [canViewHistory, id, t, tabValue])
  // Обработка вкладок
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // открытие/закрытие дела
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
          message: `${updatedStatus ? t('cases.case_activated') : t('cases.case_closed')}.`,
          severity: 'success',
        });
      })
      .catch((error) => {
        console.error(t('common.errors.error_update_status_case'), error);
        setSnackbar({
          open: true,
          message: t('common.errors.error_update_status_case'),
          severity: 'error',
        });
      });
  };

  const handleOpenDialogChangeInvestigator = () => {
    setOpenDialogChangeInvestigator(true);
  }

  if (!caseItem) {
    return (
      <Loading />
    );
  }

  if (!canView) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          {t('common.messages.no_access_message')}
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#e9edf5', minHeight: '100vh' }}>
      {/* Основной контент */}
      <Layout>
        {/* Кнопка "Назад" и заголовок */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: theme.spacing(2),
          }}
        >
          <BackButton />
          <Typography variant="h5">{t('cases.title')}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {/* Кнопки "Экспорт PDF" и "Экспорт Excel" */}
          {canView && (
            <Box sx={{ display: 'flex', mr: 2 }}>
              <PrintButton handlePrint={() => handlePrint('pdf')} text={t('common.buttons.export_pdf')} />
              <StyledButton
                onClick={() => handlePrint('excel')}
                startIcon={<GetAppIcon />}
                sx={{ height: '40px' }}
              >
                <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{t('common.buttons.export_excel')}</span>
              </StyledButton>
            </Box>
          )}
          {isLoading && (
            <div
              style={{
                position: 'fixed',
                top: '0vh',
                left: '0vw',
                height: '100vh',
                width: '100vw',
                background: 'rgba(0,0,0, 0.25)',
                zIndex: '99999',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Loading />
            </div>
          )}

          {/* Кнопка "Переназначить дело" */}
          {canChangeInvestigator && (
            <StyledButton
              sx={{ mr: 2, height: '40px' }}
              onClick={handleOpenDialogChangeInvestigator}
              startIcon={<CheckCircleIcon />}
            >
              <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{t('cases.reassign_case_button')}</span>
            </StyledButton>
          )}
          {/* Кнопка "Активировать/Закрыть" */}
          {canEdit && (
            <Tooltip
              title={caseItem.active ? t('cases.close_case_button')
                : t('cases.activate_case_button')}
            >
              <StyledButton
                onClick={handleStatusToggle}
                sx={{
                  backgroundColor: caseItem.active
                    ? theme.palette.error.main
                    : theme.palette.success.main,
                  height: '40px',
                  '&:hover': {
                    backgroundColor: caseItem.active
                      ? theme.palette.error.dark
                      : theme.palette.success.dark,
                  },
                }}
                startIcon={caseItem.active ? <CloseIcon /> : <CheckCircleIcon />}
              >
                <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{caseItem.active ? t('common.buttons.close')
                  : t('common.buttons.activate')}</span>
              </StyledButton>
            </Tooltip>
          )}
        </Box>

        {/* Вкладки */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ marginBottom: theme.spacing(3) }}
          TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
          textColor="inherit"
        >
          <Tab label={t('common.standard.information')} value={0} />
          <Tab label={t('common.standard.evidence')} value={1} />
          {canViewHistory && <Tab label={t('common.report.titles.history_title')} value={2} />}
        </Tabs>

        {/* Вкладка "Информация" */}
        {tabValue === 0 && (
          <CaseDetailInfromation id={id} caseItem={caseItem} setSnackbar={setSnackbar} setCaseItem={setCaseItem} canEdit={canEdit} InvestigatorName={InvestigatorName} />
        )}

        {/* Вкладка "Вещдоки" */}
        {tabValue === 1 && (
          <CaseDetailMatEvidence
            id={id}
            canEdit={canEdit}
            canAddGroup={canAddGroup}
            groups={groups}
            setGroups={setGroups}
            setIsStatusUpdating={setIsStatusUpdating}
            isStatusUpdating={isStatusUpdating}
            setSnackbar={setSnackbar}
            caseItem={caseItem}
          />
        )}

        {/* Вкладка "История изменений" */}
        {canViewHistory && tabValue === 2 && (
          <History changeLogs={changeLogs} />
        )}
      </Layout>

      {/* Компонент для печати отчета */}
      <PrintReport
        reportRef={reportRef}
        caseItem={caseItem}
        changeLogs={changeLogs}
        groups={groups}
        canViewHistory={canViewHistory}
        currentUser={user}
      />

      {openDialogChangeInvestigator && (
        <DialogChangeInvestigator open={openDialogChangeInvestigator}
          setOpenDialog={(open) => setOpenDialogChangeInvestigator(open)}
          user={user}
          caseItem={caseItem}
          setCaseItem={setCaseItem}
          setSnackbar={setSnackbar}
          id={id}
        />
      )}

      {/* Snackbar для уведомлений */}
      <Notifyer snackbarOpened={snackbar.open} setSnackbarOpen={setSnackbar} message={snackbar.message} severity={snackbar.severity} />
    </Box>
  );
};

export default CaseDetailPage;