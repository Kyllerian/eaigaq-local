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

export default function DialogExportEmployees({
  user,
  departments,
  employees,
  openExportDialog,
  setOpenExportDialog,
  setSnackbar,
}) {
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
    documentTitle: 'Отчет по сессиям сотрудников',
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
        console.error('Ошибка при получении данных сессий:', error);
        setSnackbar({
          open: true,
          message: 'Ошибка при получении данных сессий.',
          severity: 'error',
        });
      });
  };

  // Новая функция для экспорта в Excel
  const handleExportExcel = (data) => {
    if (data.length === 0) {
      setSnackbar({
        open: true,
        message: 'Нет данных для экспорта.',
        severity: 'warning',
      });
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Сессии сотрудников');
      let currentRow = 1;

      // Добавление дополнительных строк перед таблицей

      // Регион (только для REGION_HEAD)
      if (user.role === 'REGION_HEAD') {
        worksheet.getCell(`A${currentRow}`).value = `Регион: ${user.region_display}`;
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
          )?.name || 'Неизвестно';
        if (exportFilters.department === 'all_dept') {
          departmentName = 'Все отделения';
        }
        worksheet.getCell(`A${currentRow}`).value = `Отделение: ${departmentName}`;
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
        worksheet.getCell(`A${currentRow}`).value = `Сотрудник: ${employeeName}`;
        worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
        worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
        worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
        currentRow += 1;
      }

      // Добавление даты фильтрации в отчет
      if (dateFrom || dateTo) {
        let dateFilterText = 'Период: ';
        if (dateFrom) {
          dateFilterText += `от ${formatDate(dateFrom)}`;
        }
        if (dateTo) {
          dateFilterText += ` до ${formatDate(dateTo)}`;
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
      const headers = ['Фамилия', 'Имя', 'Звание', 'Роль', 'Вход', 'Выход'];
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
          session.logout ? formatDate(session.logout) : 'Активен',
        ]);
        currentRow += 1;
      });

      // Добавление строки "Нет данных" если data пустой
      if (data.length === 0) {
        worksheet.addRow(['Нет данных для отображения.', '', '', '', '', '']);
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
        saveAs(blob, 'Отчет_по_сессиям_сотрудников.xlsx');
      });

      setSnackbar({
        open: true,
        message: 'Экспорт в Excel успешно выполнен.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Ошибка при экспорте в Excel:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при экспорте в Excel.',
        severity: 'error',
      });
    }
  };

  return (
    <>
      <DashboardDialog
        open={openExportDialog}
        setOpen={setOpenExportDialog}
        title={'Экспорт отчета о сессиях сотрудников'}
      >
        {{
          content: (
            <>
              {user.role === 'REGION_HEAD' && (
                <FormControl fullWidth margin="dense">
                  <InputLabel id="export-department-label">Отделение</InputLabel>
                  <Select
                    labelId="export-department-label"
                    name="department"
                    value={exportFilters.department}
                    onChange={handleExportFilterChange}
                    label="Отделение"
                  >
                    <MenuItem value="all_dept">
                      <em>Все отделения</em>
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
                  <InputLabel id="export-employee-label">Сотрудник</InputLabel>
                  <Select
                    labelId="export-employee-label"
                    name="employee"
                    value={exportFilters.employee}
                    onChange={handleExportFilterChange}
                    label="Сотрудник"
                  >
                    <MenuItem value="">
                      <em>Все сотрудники</em>
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
                label="Дата от"
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
                label="Дата до"
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
              <Button onClick={() => setOpenExportDialog(false)}>Отмена</Button>
              <StyledButton onClick={() => handleExportSubmit('pdf')}>
                Сформировать PDF
              </StyledButton>
              <StyledButton onClick={() => handleExportSubmit('excel')}>
                Экспорт Excel
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

// // src/components/YourComponentPath/DialogExportEmployees.js

// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Button,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
// } from '@mui/material';
// import { StyledButton } from '../../ui/StyledComponents';
// import DashboardDialog from '../../ui/DashboardDialog';
// import axios from '../../../axiosConfig';
// import PrintSessionReport from './PrintSessionReport';
// import { useReactToPrint } from 'react-to-print';

// // Импорт библиотек для Excel
// import ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { formatDate } from '../../../constants/formatDate';

// export default function DialogExportEmployees({
//   user,
//   departments,
//   employees,
//   openExportDialog,
//   setOpenExportDialog,
//   setSnackbar,
// }) {
//   const reportRef = useRef();
//   const [exportData, setExportData] = useState([]);
//   const [shouldPrint, setShouldPrint] = useState(false);

//   const [exportFilters, setExportFilters] = useState({
//     department: 'all_dept',
//     employee: '',
//   });

//   // Printing
//   const handlePrintReport = useReactToPrint({
//     contentRef: reportRef,
//     documentTitle: 'Отчет по сессиям сотрудников',
//   });

//   useEffect(() => {
//     if (shouldPrint && exportData.length > 0) {
//       handlePrintReport();
//       setShouldPrint(false);
//     }
//   }, [shouldPrint, exportData, handlePrintReport]);

//   const handleExportFilterChange = (event) => {
//     const { name, value } = event.target;
//     setExportFilters((prevFilters) => ({
//       ...prevFilters,
//       [name]: value,
//     }));

//     if (name === 'department') {
//       setExportFilters((prevFilters) => ({
//         ...prevFilters,
//         employee: '',
//       }));
//     }
//   };

//   const handleExportSubmit = (type) => {
//     let params = {};

//     if (user.role === 'DEPARTMENT_HEAD') {
//       if (exportFilters.employee) {
//         params.user_id = exportFilters.employee;
//       } else {
//         params.department_id = user.department.id;
//       }
//     } else if (user.role === 'REGION_HEAD') {
//       if (exportFilters.department !== 'all_dept') {
//         params.department_id = exportFilters.department;
//         if (exportFilters.employee) {
//           params.user_id = exportFilters.employee;
//         }
//       } else {
//         params.region = user.region;
//       }
//     }

//     axios
//       .get('/api/sessions/', { params })
//       .then((response) => {
//         setExportData(response.data);
//         if(type === 'pdf'){
//             setShouldPrint(true);
//         }else{
//             handleExportExcel(response.data);
//         }
//         setOpenExportDialog(false);
//       })
//       .catch((error) => {
//         console.error('Ошибка при получении данных сессий:', error);
//         setSnackbar({
//           open: true,
//           message: 'Ошибка при получении данных сессий.',
//           severity: 'error',
//         });
//       });
//   };

//   // Новая функция для экспорта в Excel
//   const handleExportExcel = (data) => {
//     if (data.length === 0) {
//       setSnackbar({
//         open: true,
//         message: 'Нет данных для экспорта.',
//         severity: 'warning',
//       });
//       return;
//     }

//     try {
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Сессии сотрудников');
//         let currentRow = 1;

//       // Добавление дополнительных строк перед таблицей

//       // Регион (только для REGION_HEAD)
//       if (user.role === 'REGION_HEAD') {
//         worksheet.getCell(`A${currentRow}`).value = `Регион: ${user.region_display}`;
//         worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
//         worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
//         worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
//         currentRow += 1;
//       }

//       // Отделение (если выбрано конкретное отделение)
//       if (exportFilters.department) {
//         let departmentName = departments.find(
//             (dept) => dept.id === parseInt(exportFilters.department)
//           )?.name || 'Неизвестно';
//         if(exportFilters.department === 'all_dept'){
//             departmentName = 'Все отделения';
//         }
//         worksheet.getCell(`A${currentRow}`).value = `Отделение: ${departmentName}`;
//         worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
//         worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
//         worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
//         currentRow += 1;
//       }

//       // Сотрудник (если выбран конкретный сотрудник)
//       if (exportFilters.employee) {
//         const employeeName = employees.find(
//           (emp) => emp.id === parseInt(exportFilters.employee)
//         )?.full_name || 'Неизвестно';
//         worksheet.getCell(`A${currentRow}`).value = `Сотрудник: ${employeeName}`;
//         worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
//         worksheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left' };
//         worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
//         currentRow += 1;
//       }

//       // Добавление пустой строки для отделения информации от таблицы
//       currentRow += 1;

//       // Добавление заголовков таблицы
//       const headers = ['Фамилия', 'Имя', 'Звание', 'Роль', 'Вход', 'Выход'];
//       headers.forEach((header, index) => {
//         const cell = worksheet.getCell(
//           `${String.fromCharCode(65 + index)}${currentRow}`
//         );
//         cell.value = header;
//         cell.font = { bold: true };
//         cell.alignment = { horizontal: 'center' };
//       });
//       currentRow += 1;

//       // Добавление данных сессий
//       data.forEach((session) => {
//         worksheet.addRow([
//           session.user.last_name || '',
//           session.user.first_name || '',
//           session.user.rank || '',
//           session.user.role_display || '',
//           formatDate(session.login) || '',
//           session.logout ? formatDate(session.logout) : 'Активен',
//         ]);
//         currentRow += 1;
//       });

//       // Добавление строки "Нет данных" если data пустой
//       if (data.length === 0) {
//         worksheet.addRow(['Нет данных для отображения.', '', '', '', '', '']);
//       }

//       // Автоматическая подстройка ширины колонок
//       worksheet.columns.forEach((column) => {
//         let maxLength = 0;
//         column.eachCell({ includeEmpty: true }, (cell) => {
//           const cellValue = cell.value ? cell.value.toString() : '';
//           if (cellValue.length > maxLength) {
//             maxLength = cellValue.length;
//           }
//         });
//         column.width = maxLength < 10 ? 10 : maxLength + 2;
//       });

//       // Применение переноса текста (опционально)
//       worksheet.eachRow({ includeEmpty: true }, (row) => {
//         row.alignment = { wrapText: true };
//       });
  
//         // Генерация Excel-файла и его сохранение
//         // Сохранение файла
//         workbook.xlsx.writeBuffer().then((buffer) => {
//             const blob = new Blob([buffer], { type: 'application/octet-stream' });
//             saveAs(blob, 'Отчет_по_сессиям_сотрудников.xlsx');
//         });
  
//         setSnackbar({
//           open: true,
//           message: 'Экспорт в Excel успешно выполнен.',
//           severity: 'success',
//         });
//       } catch (error) {
//         console.error('Ошибка при экспорте в Excel:', error);
//         setSnackbar({
//           open: true,
//           message: 'Ошибка при экспорте в Excel.',
//           severity: 'error',
//         });
//       }
//   };

//   return (
//     <>
//       <DashboardDialog
//         open={openExportDialog}
//         setOpen={setOpenExportDialog}
//         title={'Экспорт отчета о сессиях сотрудников'}
//       >
//         {{
//           content: (
//             <>
//               {user.role === 'REGION_HEAD' && (
//                 <FormControl fullWidth margin="dense">
//                   <InputLabel id="export-department-label">Отделение</InputLabel>
//                   <Select
//                     labelId="export-department-label"
//                     name="department"
//                     value={exportFilters.department}
//                     onChange={handleExportFilterChange}
//                     label="Отделение"
//                   >
//                     <MenuItem value="all_dept">
//                       <em>Все отделения</em>
//                     </MenuItem>
//                     {departments.map((dept) => (
//                       <MenuItem key={dept.id} value={dept.id}>
//                         {dept.name}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               )}

//               {(user.role === 'DEPARTMENT_HEAD' ||
//                 exportFilters.department !== 'all_dept') && (
//                 <FormControl fullWidth margin="dense">
//                   <InputLabel id="export-employee-label">Сотрудник</InputLabel>
//                   <Select
//                     labelId="export-employee-label"
//                     name="employee"
//                     value={exportFilters.employee}
//                     onChange={handleExportFilterChange}
//                     label="Сотрудник"
//                   >
//                     <MenuItem value="">
//                       <em>Все сотрудники</em>
//                     </MenuItem>
//                     {employees
//                       .filter((emp) =>
//                         user.role === 'DEPARTMENT_HEAD'
//                           ? true
//                           : emp.department &&
//                             emp.department.id === parseInt(exportFilters.department)
//                       )
//                       .map((emp) => (
//                         <MenuItem key={emp.id} value={emp.id}>
//                           {emp.first_name} {emp.last_name}
//                         </MenuItem>
//                       ))}
//                   </Select>
//                 </FormControl>
//               )}
//             </>
//           ),
//           actions: (
//             <>
//               <Button onClick={() => setOpenExportDialog(false)}>Отмена</Button>
//               <StyledButton onClick={() => handleExportSubmit('pdf')}>
//                 Сформировать PDF
//               </StyledButton>
//               <StyledButton onClick={() => handleExportSubmit('excel')}>
//                 Экспорт Excel
//               </StyledButton>
//             </>
//           ),
//         }}
//       </DashboardDialog>

//       {/* Hidden Print Component for Session Report */}
//       <PrintSessionReport
//         user={user}
//         reportRef={reportRef}
//         exportData={exportData}
//         exportFilters={exportFilters}
//         departments={departments}
//         employees={employees}
//       />
//     </>
//   );
// }

// import {
//     Button,
//     FormControl,
//     InputLabel,
//     MenuItem,
//     Select,
// } from '@mui/material';

// import { StyledButton } from '../../ui/StyledComponents';
// import DashboardDialog from '../../ui/DashboardDialog';
// import axios from '../../../axiosConfig';
// import PrintSessionReport from './PrintSessionReport';
// import { useEffect, useRef, useState } from 'react';
// import { useReactToPrint } from 'react-to-print';


// export default function DialogExportEmpolyees({ user, departments, employees, openExportDialog, setOpenExportDialog, setSnackbar, 
// }) {
//     const reportRef = useRef();
//     const [exportData, setExportData] = useState([]);
//     const [shouldPrint, setShouldPrint] = useState(false);

//     const [exportFilters, setExportFilters] = useState({
//         department: 'all_dept',
//         employee: '',
//     });

//     // Printing
//     const handlePrintReport = useReactToPrint({
//         contentRef: reportRef,
//         documentTitle: 'Отчет по сессиям сотрудников',
//     });
//     useEffect(() => {
//         if (shouldPrint && exportData.length > 0) {
//             handlePrintReport();
//             setShouldPrint(false);
//         }
//     }, [shouldPrint, exportData, handlePrintReport]); // Удалили handlePrintReport из зависимостей
    
//     const handleExportFilterChange = (event) => {
//         const { name, value } = event.target;
//         setExportFilters((prevFilters) => ({
//             ...prevFilters,
//             [name]: value,
//         }));

//         if (name === 'department') {
//             setExportFilters((prevFilters) => ({
//                 ...prevFilters,
//                 employee: '',
//             }));
//         }
//     };

//     const handleExportSubmit = () => {
//         let params = {};

//         if (user.role === 'DEPARTMENT_HEAD') {
//             if (exportFilters.employee) {
//                 params.user_id = exportFilters.employee;
//             } else {
//                 params.department_id = user.department.id;
//             }
//         } else if (user.role === 'REGION_HEAD') {
//             if (exportFilters.department !== 'all_dept') {
//                 params.department_id = exportFilters.department;
//                 if (exportFilters.employee) {
//                     params.user_id = exportFilters.employee;
//                 }
//             } else {
//                 params.region = user.region;
//             }
//         }

//         axios
//             .get('/api/sessions/', { params })
//             .then((response) => {
//                 setExportData(response.data);
//                 setShouldPrint(true);
//                 setOpenExportDialog(false);
//             })
//             .catch((error) => {
//                 console.error('Ошибка при получении данных сессий:', error);
//                 setSnackbar({
//                     open: true,
//                     message: 'Ошибка при получении данных сессий.',
//                     severity: 'error',
//                 });
//             });
//     };
//     return (
//         <>
//             <DashboardDialog open={openExportDialog} setOpen={setOpenExportDialog} title={"Экспорт отчета о сессиях сотрудников"}  >
//                 {{
//                     content: (
//                         <>
//                             {user.role === 'REGION_HEAD' && (
//                                 <FormControl fullWidth margin="dense">
//                                     <InputLabel id="export-department-label">Отделение</InputLabel>
//                                     <Select
//                                         labelId="export-department-label"
//                                         name="department"
//                                         value={exportFilters.department}
//                                         onChange={handleExportFilterChange}
//                                         label="Отделение"
//                                     >
//                                         <MenuItem value="all_dept">
//                                             <em>Все отделения</em>
//                                         </MenuItem>
//                                         {departments.map((dept) => (
//                                             <MenuItem key={dept.id} value={dept.id}>
//                                                 {dept.name}
//                                             </MenuItem>
//                                         ))}
//                                     </Select>
//                                 </FormControl>
//                             )}

//                             {(user.role === 'DEPARTMENT_HEAD' || exportFilters.department !== 'all_dept') && (
//                                 <FormControl fullWidth margin="dense">
//                                     <InputLabel id="export-employee-label">Сотрудник</InputLabel>
//                                     <Select
//                                         labelId="export-employee-label"
//                                         name="employee"
//                                         value={exportFilters.employee}
//                                         onChange={handleExportFilterChange}
//                                         label="Сотрудник"
//                                     >
//                                         <MenuItem value="">
//                                             <em>Все сотрудники</em>
//                                         </MenuItem>
//                                         {employees
//                                             .filter((emp) =>
//                                                 user.role === 'DEPARTMENT_HEAD'
//                                                     ? true
//                                                     : emp.department &&
//                                                     emp.department.id === parseInt(exportFilters.department)
//                                             )
//                                             .map((emp) => (
//                                                 <MenuItem key={emp.id} value={emp.id}>
//                                                     {emp.first_name} {emp.last_name}
//                                                 </MenuItem>
//                                             ))}
//                                     </Select>
//                                 </FormControl>
//                             )}
//                         </>
//                     ),
//                     actions: (
//                         <>
//                             <Button onClick={() => setOpenExportDialog(false)}>Отмена</Button>
//                             <StyledButton onClick={handleExportSubmit}>Сформировать отчет</StyledButton>

//                         </>
//                     )
//                 }}
//             </DashboardDialog>

            
//             {/* Hidden Print Component for Session Report */}
//             <PrintSessionReport user={user} reportRef={reportRef} exportData={exportData} exportFilters={exportFilters} 
//                 departments={departments} employees={employees} 
//             />
//         </>
//     );
// }
