// src/components/EvidenceSearchTab.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Tooltip,
  IconButton,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  OpenInNew as OpenInNewIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledButton, StyledTableCell } from './StyledComponents';
import axios from '../axiosConfig';
import { EVIDENCE_TYPES } from '../constants/evidenceTypes';
import { useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import LogoMVDKZ from '../assets/Logo_MVD_KZ.png';
import Barcode from 'react-barcode';

const EvidenceSearchTab = ({ snackbar, setSnackbar, setError }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [evidenceSearchQuery, setEvidenceSearchQuery] = useState('');
  const [evidenceTypeFilter, setEvidenceTypeFilter] = useState('');
  const [dateAddedFrom, setDateAddedFrom] = useState('');
  const [dateAddedTo, setDateAddedTo] = useState('');
  const [evidences, setEvidences] = useState([]);
  const [evidenceExportData, setEvidenceExportData] = useState([]);
  const [evidenceShouldPrint, setEvidenceShouldPrint] = useState(false);
  const evidenceReportRef = useRef();

  // Handlers
  const handleEvidenceSearchChange = (event) => {
    setEvidenceSearchQuery(event.target.value);
  };

  const handleEvidenceTypeFilterChange = (event) => {
    setEvidenceTypeFilter(event.target.value);
  };

  const handleDateAddedFromChange = (event) => {
    setDateAddedFrom(event.target.value);
  };

  const handleDateAddedToChange = (event) => {
    setDateAddedTo(event.target.value);
  };

  const fetchEvidences = useCallback(() => {
    const params = {};

    if (evidenceSearchQuery) {
      params.search = evidenceSearchQuery;
    }

    if (evidenceTypeFilter) {
      params.type = evidenceTypeFilter;
    }

    if (dateAddedFrom) {
      params['created__gte'] = dateAddedFrom;
    }

    if (dateAddedTo) {
      params['created__lte'] = dateAddedTo;
    }

    axios
      .get('/api/material-evidences/', { params })
      .then((response) => {
        setEvidences(response.data);
      })
      .catch((error) => {
        console.error('Ошибка при поиске вещдоков:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при поиске вещдоков.',
          severity: 'error',
        });
      });
  }, [evidenceSearchQuery, evidenceTypeFilter, dateAddedFrom, dateAddedTo]);

  useEffect(() => {
    fetchEvidences();
  }, [fetchEvidences]);

  // Export Handlers
  const handleEvidenceExport = () => {
    const params = {};

    if (evidenceSearchQuery) {
      params.search = evidenceSearchQuery;
    }

    if (evidenceTypeFilter) {
      params.type = evidenceTypeFilter;
    }

    if (dateAddedFrom) {
      params['created__gte'] = dateAddedFrom;
    }

    if (dateAddedTo) {
      params['created__lte'] = dateAddedTo;
    }

    axios
      .get('/api/material-evidences/', { params })
      .then((response) => {
        setEvidenceExportData(response.data);
        setEvidenceShouldPrint(true);
      })
      .catch((error) => {
        console.error('Ошибка при экспорте вещественных доказательств:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при экспорте вещественных доказательств.',
          severity: 'error',
        });
      });
  };

  const handlePrintEvidenceReport = useReactToPrint({
    contentRef: evidenceReportRef,
    documentTitle: 'Отчет по вещественным доказательствам',
  });

  useEffect(() => {
    if (evidenceShouldPrint && evidenceExportData.length > 0) {
      handlePrintEvidenceReport();
      setEvidenceShouldPrint(false);
    }
  }, [evidenceExportData, evidenceShouldPrint, handlePrintEvidenceReport]);

  // Barcode Dialog
  const [openBarcodeDisplayDialog, setOpenBarcodeDisplayDialog] =
    useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const barcodeRef = useRef();

  const handlePrintEvidenceBarcode = (evidence) => {
    if (evidence.barcode) {
      setScannedBarcode(evidence.barcode);
      setOpenBarcodeDisplayDialog(true);
    } else {
      setSnackbar({
        open: true,
        message: 'Штрихкод вещдока недоступен.',
        severity: 'error',
      });
    }
  };

  const handlePrintBarcode = useReactToPrint({
    contentRef: barcodeRef,
    documentTitle: 'Штрихкод Вещдока',
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

  // Helper function
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return date.toLocaleDateString('ru-RU', options);
  };

  return (
    <>
      {/* Search and Filter Fields */}
      <Box sx={{ mb: theme.spacing(3) }}>
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
            label="Поиск по названию или описанию"
            variant="outlined"
            value={evidenceSearchQuery}
            onChange={handleEvidenceSearchChange}
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
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="evidence-type-filter-label">Тип ВД</InputLabel>
            <Select
              labelId="evidence-type-filter-label"
              value={evidenceTypeFilter}
              onChange={handleEvidenceTypeFilterChange}
              label="Тип ВД"
            >
              <MenuItem value="">
                <em>Все типы</em>
              </MenuItem>
              {EVIDENCE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Дата добавления от"
            type="date"
            variant="outlined"
            value={dateAddedFrom}
            onChange={handleDateAddedFromChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Дата добавления до"
            type="date"
            variant="outlined"
            value={dateAddedTo}
            onChange={handleDateAddedToChange}
            size="small"
            InputLabelProps={{
              shrink: true,
            }}
          />
          {/* Export Button */}
          <StyledButton
            onClick={handleEvidenceExport}
            startIcon={<PrintIcon />}
            sx={{ ml: 'auto' }}
          >
            Экспорт отчета
          </StyledButton>
        </Box>

        {/* Evidence Table */}
        <Paper elevation={1}>
          <TableContainer>
            <Table
              aria-label="Таблица вещдоков"
              sx={{ tableLayout: 'fixed', minWidth: 650 }}
            >
              <TableHead>
                <TableRow>
                  <StyledTableCell sx={{ width: '15%' }}>
                    Название ВД
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '35%' }}>
                    Описание ВД
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>Тип ВД</StyledTableCell>
                  <StyledTableCell sx={{ width: '15%' }}>Дело</StyledTableCell>
                  <StyledTableCell sx={{ width: '20%' }}>
                    Действия
                  </StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evidences.length > 0 ? (
                  evidences.map((evidence) => (
                    <TableRow key={evidence.id} hover>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {evidence.name}
                      </TableCell>
                      <TableCell
                        sx={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {evidence.description}
                      </TableCell>
                      <TableCell>
                        {EVIDENCE_TYPES.find(
                          (type) => type.value === evidence.type
                        )?.label || evidence.type}
                      </TableCell>
                      <TableCell>
                        {evidence.case ? (
                          <Button
                            variant="text"
                            color="primary"
                            onClick={() =>
                              navigate(`/cases/${evidence.case.id}/`)
                            }
                            startIcon={<OpenInNewIcon />}
                          >
                            {evidence.case.name || 'Дело'}
                          </Button>
                        ) : (
                          'Не назначено'
                        )}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Печать штрихкода">
                          <IconButton
                            color="primary"
                            onClick={() =>
                              handlePrintEvidenceBarcode(evidence)
                            }
                          >
                            <PrintIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Нет результатов.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        <div
          ref={evidenceReportRef}
          style={{
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#000',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img
              src={LogoMVDKZ}
              alt="Логотип"
              style={{ maxWidth: '100px', marginBottom: '10px' }}
            />
            <Typography variant="h4" gutterBottom>
              Отчет по вещественным доказательствам
            </Typography>
            <Typography variant="subtitle1">
              Дата формирования отчета: {formatDate(new Date().toISOString())}
            </Typography>
          </div>

          {/* Filters */}
          <div style={{ marginBottom: '20px' }}>
            {evidenceSearchQuery && (
              <Typography variant="h6">
                Поиск: {evidenceSearchQuery}
              </Typography>
            )}
            {evidenceTypeFilter && (
              <Typography variant="h6">
                Тип ВД:{' '}
                {EVIDENCE_TYPES.find(
                  (type) => type.value === evidenceTypeFilter
                )?.label || evidenceTypeFilter}
              </Typography>
            )}
            {(dateAddedFrom || dateAddedTo) && (
              <Typography variant="h6">
                Дата добавления: {dateAddedFrom || '...'} -{' '}
                {dateAddedTo || '...'}
              </Typography>
            )}
          </div>

          {/* Evidence Table */}
          <TableContainer component={Paper} style={{ boxShadow: 'none' }}>
            <Table
              aria-label="Отчет по вещественным доказательствам"
              style={{
                tableLayout: 'fixed',
                width: '100%',
                fontSize: '12px',
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Название ВД</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Описание ВД</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Тип ВД</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Дело</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Дата создания</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evidenceExportData.map((evidence) => (
                  <TableRow key={evidence.id}>
                    <TableCell>{evidence.name}</TableCell>
                    <TableCell>{evidence.description}</TableCell>
                    <TableCell>
                      {EVIDENCE_TYPES.find(
                        (type) => type.value === evidence.type
                      )?.label || evidence.type}
                    </TableCell>
                    <TableCell>
                      {evidence.case ? evidence.case.name : 'Не назначено'}
                    </TableCell>
                    <TableCell>{formatDate(evidence.created)}</TableCell>
                  </TableRow>
                ))}
                {evidenceExportData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Нет данных для отображения.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <Typography variant="body2">
              © {new Date().getFullYear()} Министерство внутренних дел Республики
              Казахстан.
            </Typography>
          </div>
        </div>
      </div>

      {/* Barcode Dialog */}
      <Dialog
        open={openBarcodeDisplayDialog}
        onClose={() => setOpenBarcodeDisplayDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Штрихкод</DialogTitle>
        <DialogContent
          sx={{
            textAlign: 'center',
            padding: theme.spacing(2),
          }}
        >
          {scannedBarcode && (
            <div id="barcode-container" ref={barcodeRef}>
              <div id="barcode">
                <Barcode
                  value={scannedBarcode}
                  format="EAN13"
                  displayValue={false}
                  margin={0}
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBarcodeDisplayDialog(false)}>
            Закрыть
          </Button>
          <StyledButton onClick={handlePrintBarcode}>Печать</StyledButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EvidenceSearchTab;
