// src/components/CasesTab.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledButton, StyledTableCell } from './StyledComponents';
import axios from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

const CasesTab = ({
  user,
  cases,
  departments,
  fetchCases,
  snackbar,
  setSnackbar,
  setError,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState(null);
  const [openCaseDialog, setOpenCaseDialog] = useState(false);
  const [newCase, setNewCase] = useState({
    name: '',
    description: '',
  });

  // Добавлен стейт для поиска
  const [searchQuery, setSearchQuery] = useState('');

  // Штрихкод
  const [openBarcodeDialog, setOpenBarcodeDialog] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const barcodeInputRef = useRef();

  const handleCaseSelect = (caseItem) => {
    if (selectedCase && selectedCase.id === caseItem.id) {
      setSelectedCase(null);
    } else {
      setSelectedCase(caseItem);
    }
  };

  const handleOpenCaseDialog = () => {
    setOpenCaseDialog(true);
  };

  const handleCloseCaseDialog = () => {
    setOpenCaseDialog(false);
    setNewCase({
      name: '',
      description: '',
    });
  };

  const handleCaseInputChange = (event) => {
    const { name, value } = event.target;
    setNewCase({ ...newCase, [name]: value });
  };

  const handleCaseFormSubmit = (event) => {
    event.preventDefault();

    const caseData = {
      ...newCase,
    };

    axios
      .post('/api/cases/', caseData)
      .then((response) => {
        setSnackbar({
          open: true,
          message: 'Дело успешно добавлено.',
          severity: 'success',
        });
        fetchCases();
        handleCloseCaseDialog();
      })
      .catch((error) => {
        console.error(
          'Ошибка при добавлении дела:',
          error.response?.data || error
        );
        setSnackbar({
          open: true,
          message: 'Ошибка при добавлении дела.',
          severity: 'error',
        });
      });
  };

  const handleOpenCaseDetails = () => {
    if (selectedCase) {
      navigate(`/cases/${selectedCase.id}/`);
    }
  };

  // Обработчики для штрихкода
  const handleOpenBarcodeDialog = () => {
    setOpenBarcodeDialog(true);
    setScannedBarcode('');
    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 100);
  };

  const handleCloseBarcodeDialog = () => {
    setOpenBarcodeDialog(false);
    setScannedBarcode('');
  };

  const handleBarcodeInputChange = (event) => {
    setScannedBarcode(event.target.value);
  };

  const handleBarcodeSubmit = (event) => {
    event.preventDefault();

    if (scannedBarcode.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, отсканируйте штрихкод.',
        severity: 'warning',
      });
      return;
    }

    axios
      .get(`/api/material-evidences/?barcode=${scannedBarcode}`)
      .then((response) => {
        if (response.data.length > 0) {
          const evidence = response.data[0];
          if (evidence.case) {
            navigate(`/cases/${evidence.case.id}/`);
          } else {
            setSnackbar({
              open: true,
              message: 'Вещдок не связан с делом.',
              severity: 'info',
            });
          }
        } else {
          setSnackbar({
            open: true,
            message: 'Вещдок не найден.',
            severity: 'error',
          });
        }
      })
      .catch((error) => {
        console.error('Ошибка при поиске вещдока по штрихкоду:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при поиске вещдока.',
          severity: 'error',
        });
      })
      .finally(() => {
        handleCloseBarcodeDialog();
      });
  };

  // Обработчик изменения поиска
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Фильтрация дел на основе поискового запроса
  const filteredCases = cases.filter((caseItem) => {
    const query = searchQuery.toLowerCase();
    const name = caseItem.name.toLowerCase();
    const description = caseItem.description.toLowerCase();
    const creatorName = caseItem.creator_name?.toLowerCase() || '';
    return (
      name.includes(query) ||
      description.includes(query) ||
      creatorName.includes(query)
    );
  });

  return (
    <>
      {/* Поле поиска и кнопка штрихкода */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: theme.spacing(2),
          mb: theme.spacing(2),
        }}
      >
        <TextField
          label="Поиск по делу"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <StyledButton
          onClick={handleOpenBarcodeDialog}
          startIcon={<SearchIcon />}
        >
          Поиск по штрихкоду
        </StyledButton>
      </Box>

      {/* Кнопки */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: theme.spacing(2),
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: theme.spacing(2),
        }}
      >
        {user.role !== 'REGION_HEAD' && (
          <StyledButton
            onClick={handleOpenCaseDialog}
            startIcon={<AddIcon />}
          >
            Добавить дело
          </StyledButton>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing(1),
          }}
        >
          <Tooltip
            title={
              selectedCase
                ? selectedCase.active
                  ? 'Активно'
                  : 'Закрыто'
                : 'Не выбрано'
            }
            placement="top"
          >
            <IconButton disabled>
              <CircleIcon
                style={{
                  color: selectedCase
                    ? selectedCase.active
                      ? theme.palette.success.main
                      : theme.palette.error.main
                    : theme.palette.grey[500],
                  fontSize: 24,
                }}
              />
            </IconButton>
          </Tooltip>
          <StyledButton
            onClick={handleOpenCaseDetails}
            startIcon={<OpenInNewIcon />}
            disabled={!selectedCase}
          >
            Открыть дело
          </StyledButton>
        </Box>
      </Box>

      {/* Таблица дел */}
      <Paper elevation={1}>
        <TableContainer>
          <Table
            aria-label="Таблица дел"
            sx={{ tableLayout: 'fixed', minWidth: 650 }}
          >
            <TableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '20%' }}>
                  Название дела
                </StyledTableCell>
                <StyledTableCell sx={{ width: '50%' }}>
                  Описание
                </StyledTableCell>
                <StyledTableCell sx={{ width: '15%' }}>
                  Следователь
                </StyledTableCell>
                {user && user.role === 'REGION_HEAD' && (
                  <StyledTableCell sx={{ width: '15%' }}>
                    Отделение
                  </StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCases.map((caseItem) => (
                <TableRow
                  key={caseItem.id}
                  hover
                  selected={selectedCase && selectedCase.id === caseItem.id}
                  onClick={() => handleCaseSelect(caseItem)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {caseItem.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {caseItem.description}
                  </TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {caseItem.creator_name}
                  </TableCell>
                  {user && user.role === 'REGION_HEAD' && (
                    <TableCell
                      sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {caseItem.department_name ||
                        (caseItem.department && caseItem.department.name) ||
                        'Не указано'}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredCases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={user && user.role === 'REGION_HEAD' ? 4 : 3} align="center">
                    Нет результатов.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалоги */}
      {user.role !== 'REGION_HEAD' && (
        <Dialog
          open={openCaseDialog}
          onClose={handleCloseCaseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Добавить новое дело</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Название дела"
              name="name"
              value={newCase.name}
              onChange={handleCaseInputChange}
              fullWidth
              required
              inputProps={{ maxLength: 255 }}
            />
            <TextField
              margin="dense"
              label="Описание дела"
              name="description"
              value={newCase.description}
              onChange={handleCaseInputChange}
              fullWidth
              required
              multiline
              rows={4}
              inputProps={{ maxLength: 1000 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCaseDialog}>Отмена</Button>
            <StyledButton onClick={handleCaseFormSubmit}>Создать</StyledButton>
          </DialogActions>
        </Dialog>
      )}

      {/* Диалог сканирования штрихкода */}
      <Dialog open={openBarcodeDialog} onClose={handleCloseBarcodeDialog}>
        <DialogTitle>Сканирование штрихкода</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            inputRef={barcodeInputRef}
            margin="dense"
            label="Штрихкод"
            value={scannedBarcode}
            onChange={handleBarcodeInputChange}
            fullWidth
            onKeyPress={(event) => {
              if (event.key === 'Enter') {
                handleBarcodeSubmit(event);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBarcodeDialog}>Отмена</Button>
          <StyledButton onClick={handleBarcodeSubmit}>Найти</StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CasesTab;