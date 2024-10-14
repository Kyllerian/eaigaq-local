// src/pages/CaseDetailPage.js

import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "../axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  AppBar,
  Toolbar,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Print as PrintIcon,
} from "@mui/icons-material";
import { AuthContext } from "../contexts/AuthContext";
import Barcode from "react-barcode";
import { useReactToPrint } from "react-to-print";

// Импортируем логотип
import LogoMVDKZ from "../assets/Logo_MVD_KZ.png";

const CaseDetailPage = () => {
  const { id } = useParams(); // Получаем ID дела из URL
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [caseItem, setCaseItem] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: "" });
  const [newEvidence, setNewEvidence] = useState({
    name: "",
    description: "",
  });
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openEvidenceDialog, setOpenEvidenceDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Состояния для диалогового окна и значения штрихкода
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [barcodeValueToDisplay, setBarcodeValueToDisplay] = useState("");
  const barcodeRef = useRef(); // Реф для печати штрихкода

  // Реф для печати отчета
  const reportRef = useRef();

  // Массив возможных статусов вещественного доказательства
  const evidenceStatuses = [
    { value: "IN_STORAGE", label: "На хранении" },
    { value: "DESTROYED", label: "Уничтожен" },
    { value: "TAKEN", label: "Взят" },
    { value: "ON_EXAMINATION", label: "На экспертизе" },
    { value: "ARCHIVED", label: "В архиве" },
  ];

  // Состояние для хранения логов изменений
  const [changeLogs, setChangeLogs] = useState([]);

  // Состояние для предотвращения повторных запросов
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Функция для печати только штрихкода
  const handlePrintBarcode = useReactToPrint({
    contentRef:barcodeRef,
    documentTitle: "Штрихкод",
    pageStyle: `
      @page {
        size: 58mm 40mm;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
        }
        #barcode-container {
          width: 58mm;
          height: 40mm;
          padding: 6.36mm;
          box-sizing: border-box;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #barcode svg {
          width: auto;
          height: 70%;
        }
      }
    `,
  });

  // Функция для печати отчета
  const handlePrintReport = useReactToPrint({
    contentRef:reportRef,
    documentTitle: `Отчет по делу ${caseItem?.name}`,
    pageStyle: `
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
      }
    `,
  });

  // Проверяем, является ли текущий пользователь создателем или следователем дела
  const isCreatorOrInvestigator =
    user && (user.id === caseItem?.creator || user.id === caseItem?.investigator);

  // Проверяем права просмотра
  const canView =
    isCreatorOrInvestigator ||
    user.role === "DEPARTMENT_HEAD" ||
    user.role === "REGION_HEAD";

  // Определяем, может ли пользователь редактировать дело
  const canEdit = isCreatorOrInvestigator && user.role !== "REGION_HEAD";

  // Определяем, может ли пользователь добавлять группы
  const canAddGroup = isCreatorOrInvestigator && user.role !== "REGION_HEAD";

  // Определяем, может ли пользователь видеть историю изменений
  const canViewHistory =
    (user.role === "DEPARTMENT_HEAD" ||
      user.role === "REGION_HEAD" ||
      isCreatorOrInvestigator) && canView;

  useEffect(() => {
    // Получаем детали дела
    axios
      .get(`/api/cases/${id}/`)
      .then((response) => {
        setCaseItem(response.data);
      })
      .catch((error) => {
        console.error("Ошибка при получении деталей дела:", error);
        setSnackbar({
          open: true,
          message: "Ошибка при загрузке дела.",
          severity: "error",
        });
      });

    // Получаем группы и связанные с ними вещественные доказательства
    axios
      .get(`/api/evidence-groups/?case=${id}`)
      .then((response) => {
        setGroups(response.data);
      })
      .catch((error) => {
        console.error("Ошибка при получении групп:", error);
        setSnackbar({
          open: true,
          message: "Ошибка при загрузке групп.",
          severity: "error",
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
          console.error("Ошибка при получении истории изменений:", error);
          setSnackbar({
            open: true,
            message: "Ошибка при загрузке истории изменений.",
            severity: "error",
          });
        });
    }
  }, [id, canViewHistory]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Вкладка "Информация"
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
          message: "Дело успешно обновлено.",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Ошибка при обновлении дела:", error);
        setSnackbar({
          open: true,
          message: "Ошибка при обновлении дела.",
          severity: "error",
        });
      });
  };

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
          message: `Дело ${updatedStatus ? "активировано" : "закрыто"}.`,
          severity: "success",
        });
      })
      .catch((error) => {
        console.error("Ошибка при изменении статуса дела:", error);
        setSnackbar({
          open: true,
          message: "Ошибка при изменении статуса дела.",
          severity: "error",
        });
      });
  };

  // Вкладка "Вещдоки"
  const handleOpenGroupDialog = () => {
    setOpenGroupDialog(true);
  };

  const handleCloseGroupDialog = () => {
    setOpenGroupDialog(false);
    setNewGroup({ name: "" });
  };

  const handleGroupInputChange = (event) => {
    const { name, value } = event.target;
    setNewGroup({ ...newGroup, [name]: value });
  };

  const handleGroupFormSubmit = (event) => {
    event.preventDefault();

    axios
      .post("/api/evidence-groups/", {
        name: newGroup.name,
        case: id,
      })
      .then((response) => {
        setGroups([...groups, response.data]);
        handleCloseGroupDialog();
        setSnackbar({
          open: true,
          message: "Группа успешно добавлена.",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error(
          "Ошибка при добавлении группы:",
          error.response?.data || error
        );
        setSnackbar({
          open: true,
          message: "Ошибка при добавлении группы.",
          severity: "error",
        });
      });
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroupId(groupId === selectedGroupId ? null : groupId);
  };

  const handleOpenEvidenceDialog = () => {
    setOpenEvidenceDialog(true);
  };

  const handleCloseEvidenceDialog = () => {
    setOpenEvidenceDialog(false);
    setNewEvidence({ name: "", description: "" });
  };

  const handleEvidenceInputChange = (event) => {
    const { name, value } = event.target;
    setNewEvidence({ ...newEvidence, [name]: value });
  };

  const handleEvidenceFormSubmit = (event) => {
    event.preventDefault();

    axios
      .post("/api/material-evidences/", {
        name: newEvidence.name,
        description: newEvidence.description,
        case_id: id,
        group_id: selectedGroupId,
      })
      .then((response) => {
        // Обновляем список доказательств в группе
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group.id === selectedGroupId
              ? {
                  ...group,
                  material_evidences: [
                    ...group.material_evidences,
                    response.data,
                  ],
                }
              : group
          )
        );
        handleCloseEvidenceDialog();
        setSnackbar({
          open: true,
          message: "Вещественное доказательство добавлено.",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error(
          "Ошибка при добавлении вещественного доказательства:",
          error.response?.data || error
        );
        setSnackbar({
          open: true,
          message: "Ошибка при добавлении вещественного доказательства.",
          severity: "error",
        });
      });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Функции для отображения и печати штрихкодов
  const handleOpenBarcodeDialog = (barcodeValue) => {
    if (!barcodeValue) {
      setSnackbar({
        open: true,
        message: "Штрихкод недоступен.",
        severity: "error",
      });
      return;
    }
    setBarcodeValueToDisplay(barcodeValue);
    setOpenBarcodeDialog(true);
  };

  const handlePrintGroupBarcode = (groupId) => {
    const group = groups.find((g) => g.id === groupId);
    if (group && group.barcode) {
      handleOpenBarcodeDialog(group.barcode);
    } else {
      setSnackbar({
        open: true,
        message: "Штрихкод группы недоступен.",
        severity: "error",
      });
    }
  };

  const handlePrintEvidenceBarcode = (evidence) => {
    if (evidence.barcode) {
      handleOpenBarcodeDialog(evidence.barcode);
    } else {
      setSnackbar({
        open: true,
        message: "Штрихкод недоступен.",
        severity: "error",
      });
    }
  };

  // Функция для изменения статуса вещественного доказательства
  const handleEvidenceStatusChange = (evidenceId, newStatus) => {
    if (isStatusUpdating) return; // Предотвращаем повторные запросы
    setIsStatusUpdating(true);

    axios
      .patch(`/api/material-evidences/${evidenceId}/`, { status: newStatus })
      .then((response) => {
        // Обновляем состояние групп с обновленным статусом вещественного доказательства
        setGroups((prevGroups) =>
          prevGroups.map((group) => ({
            ...group,
            material_evidences: group.material_evidences.map((evidence) =>
              evidence.id === evidenceId ? response.data : evidence
            ),
          }))
        );
        setSnackbar({
          open: true,
          message: "Статус вещественного доказательства обновлен.",
          severity: "success",
        });
      })
      .catch((error) => {
        console.error(
          "Ошибка при обновлении статуса вещественного доказательства:",
          error.response?.data || error
        );
        setSnackbar({
          open: true,
          message: "Ошибка при обновлении статуса вещественного доказательства.",
          severity: "error",
        });
      })
      .finally(() => {
        setIsStatusUpdating(false);
      });
  };

  // Функции для форматирования и отображения данных

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleDateString("ru-RU", options);
  };

  // Получение сообщения действия
  const getActionMessage = (log) => {
    if (log.class_name === "Case" && log.action === "create") {
      return "Создание дела";
    } else if (log.class_name === "Case" && log.action === "update") {
      return "Изменение данных дела";
    } else if (log.class_name === "MaterialEvidence" && log.action === "create") {
      return "Добавлено вещественное доказательство";
    } else if (log.class_name === "MaterialEvidence" && log.action === "update") {
      return "Изменение статуса вещественного доказательства";
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

  // Отображаемые названия полей
  const fieldLabels = {
    name: "Название",
    description: "Описание",
    status: "Статус",
    updated: "Обновлено",
    created: "Создано",
    case: "Дело",
    group: "Группа",
  };

  if (!caseItem) {
    return (
      <Container>
        <Typography variant="h6">Загрузка...</Typography>
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
    <Box>
      {/* Верхнее меню */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Детали дела
          </Typography>
          {/* Кнопка Экспорт */}
          {canView && (
            <Button
              variant="contained"
              color="inherit"
              startIcon={<PrintIcon />}
              onClick={handlePrintReport}
              sx={{ mr: 2 }}
            >
              Экспорт
            </Button>
          )}
          {canEdit && (
            <Tooltip
              title={caseItem.active ? "Закрыть дело" : "Активировать дело"}
            >
              <Button
                variant="contained"
                color={caseItem.active ? "secondary" : "primary"}
                startIcon={
                  caseItem.active ? <CloseIcon /> : <CheckCircleIcon />
                }
                onClick={handleStatusToggle}
              >
                {caseItem.active ? "Закрыть" : "Активировать"}
              </Button>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      {/* Основной контент */}
      <Container sx={{ marginTop: 10, paddingTop: 4 }}>
        {/* Вкладки */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ marginBottom: 2 }}
        >
          <Tab label="Информация" value={0} />
          <Tab label="Вещдоки" value={1} />
          {canViewHistory && <Tab label="История изменений" value={2} />}
        </Tabs>

        {/* Вкладка "Информация" */}
        {tabValue === 0 && (
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Название дела"
                  name="name"
                  value={caseItem.name}
                  onChange={handleInfoChange}
                  fullWidth
                  disabled={!canEdit}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Описание дела"
                  name="description"
                  value={caseItem.description}
                  onChange={handleInfoChange}
                  fullWidth
                  multiline
                  rows={4}
                  disabled={!canEdit}
                />
              </Grid>
              {canEdit && (
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleInfoSave}
                  >
                    Сохранить изменения
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Вкладка "Вещдоки" */}
        {tabValue === 1 && (
          <Box>
            {/* Кнопки над таблицей */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              {canAddGroup && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenGroupDialog}
                >
                  Добавить группу
                </Button>
              )}
              {selectedGroupId && (
                <Box sx={{ display: "flex", gap: 2 }}>
                  {canAddGroup && (
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AddIcon />}
                      onClick={handleOpenEvidenceDialog}
                    >
                      Добавить вещественное доказательство
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrintGroupBarcode(selectedGroupId)}
                  >
                    Печать штрихкода
                  </Button>
                </Box>
              )}
            </Box>

            {/* Таблица с группами и вещественными доказательствами */}
            <Box>
              {groups.map((group) => (
                <Accordion
                  key={group.id}
                  expanded={selectedGroupId === group.id}
                  onChange={() => handleGroupSelect(group.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="h6">{group.name}</Typography>
                      {/* Не отображаем штрихкод на странице */}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer component={Paper}>
                      <Table aria-label={`Таблица ВД группы ${group.name}`}>
                        <TableHead>
                          <TableRow>
                            <TableCell>Название</TableCell>
                            <TableCell>Описание</TableCell>
                            <TableCell>Статус</TableCell>
                            <TableCell>Действия</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.material_evidences &&
                          group.material_evidences.length > 0 ? (
                            group.material_evidences.map((evidence) => (
                              <TableRow key={evidence.id}>
                                <TableCell>{evidence.name}</TableCell>
                                <TableCell>{evidence.description}</TableCell>
                                <TableCell>
                                  {canEdit ? (
                                    <FormControl fullWidth variant="standard">
                                      <Select
                                        value={evidence.status}
                                        onChange={(event) => {
                                          const selectedStatus =
                                            event.target.value;
                                          if (evidence.status !== selectedStatus) {
                                            handleEvidenceStatusChange(
                                              evidence.id,
                                              selectedStatus
                                            );
                                          }
                                        }}
                                      >
                                        {evidenceStatuses.map((status) => (
                                          <MenuItem
                                            key={status.value}
                                            value={status.value}
                                          >
                                            {status.label}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  ) : (
                                    evidence.status_display ||
                                    evidenceStatuses.find(
                                      (status) =>
                                        status.value === evidence.status
                                    )?.label ||
                                    evidence.status
                                  )}
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handlePrintEvidenceBarcode(evidence)
                                    }
                                  >
                                    <PrintIcon />
                                  </IconButton>
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
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>

            {/* Диалоговое окно для добавления новой группы */}
            <Dialog open={openGroupDialog} onClose={handleCloseGroupDialog}>
              <DialogTitle>Добавить группу</DialogTitle>
              <DialogContent>
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
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseGroupDialog}>Отмена</Button>
                <Button
                  onClick={handleGroupFormSubmit}
                  variant="contained"
                  color="primary"
                >
                  Добавить
                </Button>
              </DialogActions>
            </Dialog>

            {/* Диалоговое окно для добавления нового вещественного доказательства */}
            <Dialog
              open={openEvidenceDialog}
              onClose={handleCloseEvidenceDialog}
            >
              <DialogTitle>Добавить вещественное доказательство</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Название ВД"
                  name="name"
                  value={newEvidence.name}
                  onChange={handleEvidenceInputChange}
                  fullWidth
                  required
                />
                <TextField
                  margin="dense"
                  label="Описание ВД"
                  name="description"
                  value={newEvidence.description}
                  onChange={handleEvidenceInputChange}
                  fullWidth
                  multiline
                  rows={4}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseEvidenceDialog}>Отмена</Button>
                <Button
                  onClick={handleEvidenceFormSubmit}
                  variant="contained"
                  color="primary"
                >
                  Добавить
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}

        {/* Вкладка "История изменений" */}
        {canViewHistory && tabValue === 2 && (
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              История изменений
            </Typography>
            <TableContainer component={Paper}>
              <Table aria-label="Таблица истории изменений">
                <TableHead>
                  <TableRow>
                    <TableCell>Дата и время</TableCell>
                    <TableCell>Пользователь</TableCell>
                    <TableCell>Действие</TableCell>
                    <TableCell>Изменения</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {changeLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{formatDate(log.created)}</TableCell>
                      <TableCell>
                        {log.user ? log.user.full_name : "Система"}
                      </TableCell>
                      <TableCell>{getActionMessage(log)}</TableCell>
                      <TableCell>
                        {(() => {
                          if (log.data && log.data.trim() !== "") {
                            try {
                              const data = JSON.parse(log.data);
                              if (log.action === "update") {
                                const displayFields = [
                                  "name",
                                  "description",
                                  "status",
                                ];
                                return Object.entries(data).map(
                                  ([field, values]) => {
                                    if (displayFields.includes(field)) {
                                      return (
                                        <div key={field}>
                                          <strong>
                                            {fieldLabels[field] || field}
                                          </strong>
                                          :{" "}
                                          {field === "status"
                                            ? getStatusLabel(values.old)
                                            : values.old}{" "}
                                          →{" "}
                                          {field === "status"
                                            ? getStatusLabel(values.new)
                                            : values.new}
                                        </div>
                                      );
                                    } else {
                                      return null;
                                    }
                                  }
                                );
                              } else if (log.action === "create") {
                                const displayFields = [
                                  "name",
                                  "description",
                                  "status",
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
                                              :{" "}
                                              {field === "status"
                                                ? getStatusLabel(value)
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
                              } else if (log.action === "delete") {
                                return <div>Объект был удален.</div>;
                              } else {
                                return "Нет данных об изменениях.";
                              }
                            } catch (error) {
                              console.error(
                                "Ошибка парсинга данных лога:",
                                error
                              );
                              return "Нет данных об изменениях.";
                            }
                          } else {
                            return "Нет данных об изменениях.";
                          }
                        })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>

      {/* Компонент для печати отчета */}
      <div style={{ display: "none" }}>
        <div
          ref={reportRef}
          style={{
            padding: "20px",
            fontFamily: "Arial, sans-serif",
            color: "#000",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={LogoMVDKZ}
              alt="Логотип"
              style={{ maxWidth: "100px", marginBottom: "10px" }}
            />
            <Typography variant="h3" gutterBottom>
              Отчет по делу
            </Typography>
            <Typography variant="subtitle1">
              Дата формирования отчета: {formatDate(new Date().toISOString())}
            </Typography>
          </div>

          {/* Информация о деле */}
          <div style={{ marginBottom: "20px" }}>
            <Typography variant="body1">
              <strong>Название дела:</strong> {caseItem.name}
            </Typography>
            <Typography variant="body1">
              <strong>Описание:</strong> {caseItem.description}
            </Typography>
            <Typography variant="body1">
              <strong>Следователь:</strong>{" "}
              {caseItem.investigator.full_name || "Неизвестно"}
            </Typography>
          </div>

          {/* Вещественные доказательства */}
          <div style={{ marginBottom: "20px" }}>
            <Typography variant="h5" gutterBottom>
              Вещественные доказательства
            </Typography>
            {groups.map((group) => (
              <Box key={group.id} mb={2}>
                <Typography variant="h6">{group.name}</Typography>
                <TableContainer
                  component={Paper}
                  style={{ boxShadow: "none" }}
                >
                  <Table
                    aria-label={`Таблица ВД группы ${group.name}`}
                    style={{ tableLayout: "fixed", width: "100%" }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: "30%" }}>
                          <strong>Название</strong>
                        </TableCell>
                        <TableCell style={{ width: "50%" }}>
                          <strong>Описание</strong>
                        </TableCell>
                        <TableCell style={{ width: "20%" }}>
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
                                width: "30%",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {evidence.name}
                            </TableCell>
                            <TableCell
                              style={{
                                width: "50%",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {evidence.description}
                            </TableCell>
                            <TableCell
                              style={{
                                width: "20%",
                                wordBreak: "break-word",
                                whiteSpace: "normal",
                              }}
                            >
                              {getStatusLabel(evidence.status)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">
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
                pageBreakBefore: "always",
                marginBottom: "20px",
              }}
            >
              <Typography variant="h5" gutterBottom>
                История изменений
              </Typography>
              <TableContainer
                component={Paper}
                style={{ boxShadow: "none" }}
              >
                <Table
                  aria-label="Таблица истории изменений"
                  style={{ tableLayout: "fixed", width: "100%" }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "20%" }}>
                        <strong>Дата и время</strong>
                      </TableCell>
                      <TableCell style={{ width: "20%" }}>
                        <strong>Пользователь</strong>
                      </TableCell>
                      <TableCell style={{ width: "20%" }}>
                        <strong>Действие</strong>
                      </TableCell>
                      <TableCell style={{ width: "40%" }}>
                        <strong>Изменения</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {changeLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell
                          style={{
                            width: "20%",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {formatDate(log.created)}
                        </TableCell>
                        <TableCell
                          style={{
                            width: "20%",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {log.user ? log.user.full_name : "Система"}
                        </TableCell>
                        <TableCell
                          style={{
                            width: "20%",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {getActionMessage(log)}
                        </TableCell>
                        <TableCell
                          style={{
                            width: "40%",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {(() => {
                            if (log.data && log.data.trim() !== "") {
                              try {
                                const data = JSON.parse(log.data);
                                if (log.action === "update") {
                                  const displayFields = [
                                    "name",
                                    "description",
                                    "status",
                                  ];
                                  return Object.entries(data).map(
                                    ([field, values]) => {
                                      if (displayFields.includes(field)) {
                                        return (
                                          <div key={field}>
                                            <strong>
                                              {fieldLabels[field] || field}
                                            </strong>
                                            :{" "}
                                            {field === "status"
                                              ? getStatusLabel(values.old)
                                              : values.old}{" "}
                                            →{" "}
                                            {field === "status"
                                              ? getStatusLabel(values.new)
                                              : values.new}
                                          </div>
                                        );
                                      } else {
                                        return null;
                                      }
                                    }
                                  );
                                } else if (log.action === "create") {
                                  const displayFields = [
                                    "name",
                                    "description",
                                    "status",
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
                                                :{" "}
                                                {field === "status"
                                                  ? getStatusLabel(value)
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
                                } else if (log.action === "delete") {
                                  return <div>Объект был удален.</div>;
                                } else {
                                  return "Нет данных об изменениях.";
                                }
                              } catch (error) {
                                console.error(
                                  "Ошибка парсинга данных лога:",
                                  error
                                );
                                return "Нет данных об изменениях.";
                              }
                            } else {
                              return "Нет данных об изменениях.";
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
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} Министерство внутренних дел Республики
              Казахстан.
            </Typography>
          </div>
        </div>
      </div>

      {/* Диалоговое окно для отображения штрихкода */}
      <Dialog
        open={openBarcodeDialog}
        onClose={() => setOpenBarcodeDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Штрихкод</DialogTitle>
        <DialogContent
          sx={{
            textAlign: "center",
            padding: "12px",
          }}
        >
          {barcodeValueToDisplay && (
            <div id="barcode-container" ref={barcodeRef}>
              <div id="barcode">
                <Barcode
                  value={barcodeValueToDisplay}
                  format="EAN13"
                  displayValue={false}
                  margin={0}
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBarcodeDialog(false)}>Закрыть</Button>
          <Button variant="contained" color="primary" onClick={handlePrintBarcode}>
            Печать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar для уведомлений */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CaseDetailPage;
