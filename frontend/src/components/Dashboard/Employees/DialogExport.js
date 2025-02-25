// src\components\Dashboard\Employees\DialogExport.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import axios from '../../../axiosConfig';
import PrintSessionReport from './PrintSessionReport';
import { useReactToPrint } from 'react-to-print';

// Импорт библиотек для Excel
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../../constants/formatDate';
import { useTranslation } from 'react-i18next';

export default function DialogExportEmployees({
  user,
  departments,
  employees,
  openExportDialog,
  setOpenExportDialog,
  setSnackbar,
}) {
  const { t } = useTranslation();
  const reportRef = useRef();
  const [exportData, setExportData] = useState([]);
  const [shouldPrint, setShouldPrint] = useState(false);

  const [exportFilters, setExportFilters] = useState({
    department: 'all_dept',
    employee: '',
  });

  // Новые состояния для фильтрации по дате
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Обработчики изменений даты
  const handleDateFromChange = (event) => {
    setDateFrom(event.target.value);
  };

  const handleDateToChange = (event) => {
    setDateTo(event.target.value);
  };

  // Printing
  const handlePrintReport = useReactToPrint({
    contentRef: reportRef,
    documentTitle: t('common.report.titles.report_sessions_employees'),
  });

  useEffect(() => {
    if (shouldPrint && exportData.length > 0) {
      handlePrintReport();
      setShouldPrint(false);
    }
  }, [shouldPrint, exportData, handlePrintReport]);

  const handleExportFilterChange = (event) => {
    const { name, value } = event.target;
    setExportFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));

    if (name === 'department') {
      setExportFilters((prevFilters) => ({
        ...prevFilters,
        employee: '',
      }));
    }
  };

  const handleExportSubmit = (type) => {
    let params = {};

    if (user.role === 'DEPARTMENT_HEAD') {
      if (exportFilters.employee) {
        params.user_id = exportFilters.employee;
      } else {
        params.department_id = user.department.id;
      }
    } else if (user.role === 'REGION_HEAD') {
      if (exportFilters.department !== 'all_dept') {
        params.department_id = exportFilters.department;
        if (exportFilters.employee) {
          params.user_id = exportFilters.employee;
        }
      } else {
        params.region = user.region;
      }
    }

    // Добавляем фильтрацию по дате
    if (dateFrom) {
      params['login__gte'] = dateFrom;
    }

    if (dateTo) {
      params['login__lte'] = dateTo;
    }

    axios
      .get('/api/sessions/', { params })
      .then((response) => {
        setExportData(response.data);
        if (type === 'pdf') {
          setShouldPrint(true);
        } else {
          handleExportExcel(response.data);
        }
        setOpenExportDialog(false);
      })
      .catch((error) => {
        console.error(t('common.errors.error_get_sessions_msg'), error);
        setSnackbar({
          open: true,
          message: t('common.errors.error_get_sessions_msg'),
          severity: 'error',
        });
      });
  };

  // Новая функция для экспорта в Excel
  const handleExportExcel = (data) => {
    if (data.length === 0) {
      setSnackbar({
        open: true,
        message: t('common.errors.error_no_data_for_export'),
        severity: 'warning',
      });
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(t('common.table_headers.sessions'));
      let currentRow = 1;

      // Добавление дополнительных строк перед таблицей

      // Регион (только для REGION_HEAD)
      if (user.role === 'REGION_HEAD') {
        worksheet.getCell(`A${currentRow}`).value = `${t('common.report.region_label')} ${user.region_display}`;
        worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        currentRow += 1;
      }

      // Отделение (если выбрано конкретное отделение)
      if (exportFilters.department) {
        let departmentName =
          departments.find(
            (dept) => dept.id === parseInt(exportFilters.department)
          )?.name || t('common.messages.unknown');
        if (exportFilters.department === 'all_dept') {
          departmentName = t('common.standard.option_all_departments');
        }
        worksheet.getCell(`A${currentRow}`).value = `${t('common.report.department_label')} ${departmentName}`;
        worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        currentRow += 1;
      }

      // Сотрудник (если выбран конкретный сотрудник)
      if (exportFilters.employee) {
        const employeeName =
          employees.find((emp) => emp.id === parseInt(exportFilters.employee))
            ?.full_name || 'Неизвестно';
        worksheet.getCell(`A${currentRow}`).value = `${t('common.report.employee_label')} ${employeeName}`;
        worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        currentRow += 1;
      }

      // Добавление даты фильтрации в отчет
      if (dateFrom || dateTo) {
        let dateFilterText = `${t('common.report.period')} `;
        if (dateFrom) {
          dateFilterText += `${t('common.report.from')} ${formatDate(dateFrom)}`;
        }
        if (dateTo) {
          dateFilterText += ` ${t('common.report.to')} ${formatDate(dateTo)}`;
        }
        worksheet.getCell(`A${currentRow}`).value = dateFilterText;
        worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        currentRow += 1;
      }

      // Добавление пустой строки для отделения информации от таблицы
      currentRow += 1;

      // Добавление заголовков таблицы
      const headers = [t('common.standard.label_last_name'), t('common.standard.label_first_name'), t('common.standard.label_rank'), t('common.standard.label_role'), t('common.report.login'), t('common.report.logout')];
      headers.forEach((header, index) => {
        const cell = worksheet.getCell(
          `${String.fromCharCode(65 + index)}${currentRow}`
        );
        cell.value = header;
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center' };
      });
      currentRow += 1;

      // Добавление данных сессий
      data.forEach((session) => {
        worksheet.addRow([
          session.user.last_name || '',
          session.user.first_name || '',
          session.user.rank || '',
          session.user.role_display || '',
          formatDate(session.login) || '',
          session.logout ? formatDate(session.logout) : t('common.status.now_active'),
        ]);
        currentRow += 1;
      });

      // Добавление строки "Нет данных" если data пустой
      if (data.length === 0) {
        worksheet.addRow([t('common.messages.now_active'), '', '', '', '', '']);
      }

      // Автоматическая подстройка ширины колонок
      worksheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : '';
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        });
        column.width = maxLength < 10 ? 10 : maxLength + 2;
      });

      // Применение переноса текста (опционально)
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        row.alignment = { wrapText: true };
      });

      // Генерация Excel-файла и его сохранение
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `${t('common.report.titles.file_name_sessions')}.xlsx`);
      });

      setSnackbar({
        open: true,
        message: t('common.success.export_excel_success'),
        severity: 'success',
      });
    } catch (error) {
      console.error(t('common.errors.error_export_excel'), error);
      setSnackbar({
        open: true,
        message: t('common.errors.error_export_excel'),
        severity: 'error',
      });
    }
  };

  return (
    <>
      <DashboardDialog
        open={openExportDialog}
        setOpen={setOpenExportDialog}
        title={t('dashboard.tabs.employees.dialog_export.title')}
      >
        {{
          content: (
            <>
              {user.role === 'REGION_HEAD' && (
                <FormControl fullWidth margin="dense">
                  <InputLabel id="export-department-label">{t('common.standard.label_department')}</InputLabel>
                  <Select
                    labelId="export-department-label"
                    name="department"
                    value={exportFilters.department}
                    onChange={handleExportFilterChange}
                    label={t('common.standard.label_department')}
                  >
                    <MenuItem value="all_dept">
                      <em>{t('common.standard.option_all_departments')}</em>
                    </MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {(user.role === 'DEPARTMENT_HEAD' ||
                exportFilters.department !== 'all_dept') && (
                <FormControl fullWidth margin="dense">
                  <InputLabel id="export-employee-label">{t('common.standard.label_employee')}</InputLabel>
                  <Select
                    labelId="export-employee-label"
                    name="employee"
                    value={exportFilters.employee}
                    onChange={handleExportFilterChange}
                    label={t('common.standard.label_employee')}
                  >
                    <MenuItem value="">
                      <em>{t('common.standard.option_all_employees')}</em>
                    </MenuItem>
                    {employees
                      .filter((emp) =>
                        user.role === 'DEPARTMENT_HEAD'
                          ? true
                          : emp.department &&
                            emp.department.id === parseInt(exportFilters.department)
                      )
                      .map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}

              {/* Новые поля ввода дат */}
              <TextField
                label={t('common.standard.label_date_from')}
                type="date"
                variant="outlined"
                value={dateFrom}
                onChange={handleDateFromChange}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                margin="dense"
              />
              <TextField
                label={t('common.standard.label_date_to')}
                type="date"
                variant="outlined"
                value={dateTo}
                onChange={handleDateToChange}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
                fullWidth
                margin="dense"
              />
            </>
          ),
          actions: (
            <>
              <Button onClick={() => setOpenExportDialog(false)}>{t('common.buttons.cancel')}</Button>
              <StyledButton onClick={() => handleExportSubmit('pdf')}>
              {t('common.buttons.pdf')}
              </StyledButton>
              <StyledButton onClick={() => handleExportSubmit('excel')}>
              {t('common.buttons.export_excel')}
              </StyledButton>
            </>
          ),
        }}
      </DashboardDialog>

      {/* Hidden Print Component for Session Report */}
      <PrintSessionReport
        user={user}
        reportRef={reportRef}
        exportData={exportData}
        exportFilters={exportFilters}
        departments={departments}
        employees={employees}
        // Передайте dateFrom и dateTo, если необходимо
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </>
  );
}
