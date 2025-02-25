// src\components\Dashboard\Employees\DialogPrintNewEmp.js
import {
    Button,
    Typography,
} from '@mui/material';

import { StyledButton } from '../../ui/StyledComponents';
import DashboardDialog from '../../ui/DashboardDialog';
import PrintLoginDetails from './PrintLoginDetails';

import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../../constants/formatDate'; // Убедитесь, что путь корректен
import { useTranslation } from 'react-i18next';

export default function DialogPrintNewEmp({
    openPrintDialog, setOpenPrintDialog, handleClosePrintDialog, newEmployeeCreated, handlePrintLoginDetails, employeePassword, loginDetailsRef
}) {
    const { t } = useTranslation();
    // Функция для экспорта в Excel
    const handleExportExcel = async () => {
        if (!newEmployeeCreated) {
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(t('common.report.titles.report_login_data_employee'));

            let currentRow = 1;

            // Заголовок отчёта
            worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const headerCell = worksheet.getCell(`A${currentRow}`);
            headerCell.value = t('common.report.titles.report_login_data_employee');
            headerCell.font = { bold: true, size: 16 };
            headerCell.alignment = { horizontal: 'center' };
            currentRow += 1;

            // Дата создания отчёта
            worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const dateCell = worksheet.getCell(`A${currentRow}`);
            dateCell.value = `${t('common.report.date_created')}: ${formatDate(new Date().toISOString())}`;
            dateCell.font = { bold: true, size: 12 };
            dateCell.alignment = { horizontal: 'center' };
            currentRow += 2; // Добавить пустую строку после даты

            // Добавление заголовков таблицы
            const headers = [t('common.report.field'), t('common.report.value'),];
            headers.forEach((header, index) => {
                const cell = worksheet.getCell(
                    `${String.fromCharCode(65 + index)}${currentRow}`
                );
                cell.value = header;
                cell.font = { bold: true };
                cell.alignment = { horizontal: 'center' };
            });
            currentRow += 1;

            // Добавление данных
            const unknownField = t('common.messages.unknown');
            const data = [
                { field: t('common.logins.input_name'), value: newEmployeeCreated.username || unknownField },
                { field: t('common.logins.password'), value: employeePassword || unknownField },
                { field: t('common.standard.label_first_name'), value: `${newEmployeeCreated.first_name || ''} ${newEmployeeCreated.last_name || ''}`.trim() || unknownField },
                { field: t('common.standard.label_role'), value: newEmployeeCreated.role_display || unknownField },
            ];

            if (newEmployeeCreated.department && newEmployeeCreated.department.name) {
                data.push({ field: t('common.standard.label_department'), value: newEmployeeCreated.department.name });
            }

            // Добавление данных сессий
            data.forEach((item) => {
                worksheet.addRow([
                    item.field || '',
                    item.value || unknownField,
                ]);
                currentRow += 1;
            });

            // Добавление пустой строки перед футером
            worksheet.addRow([]);

            // Футер
            worksheet.mergeCells(`A${worksheet.rowCount}:B${worksheet.rowCount}`);
            const footerCell = worksheet.getCell(`A${worksheet.rowCount}`);
            footerCell.value = t('common.report.footer_message', {
                currentYear: new Date().getFullYear(),
            });
            footerCell.font = { italic: true, size: 10 };
            footerCell.alignment = { horizontal: 'center' };

            // Автоматическая подстройка ширины колонок
            worksheet.columns.forEach((column) => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const cellValue = cell.value ? cell.value.toString() : '';
                    if (cellValue.length > maxLength) {
                        maxLength = cellValue.length;
                    }
                });
                column.width = maxLength < 10 ? 10 : Math.min(maxLength + 2, 50); // Максимальная ширина 50
            });

            // Применение переноса текста
            worksheet.eachRow({ includeEmpty: true }, (row) => {
                row.alignment = { wrapText: true };
            });

            // Генерация Excel-файла и его сохранение
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            saveAs(blob, `${t('common.report.titles.file_name_data_employee')}${newEmployeeCreated.first_name || t('common.standard.label_employee')}.xlsx`);

        } catch (error) {
            console.error(t('common.errors.error_export_excel'), error);
        }
        handleClosePrintDialog();
    };
    return (
        <>
            <DashboardDialog open={openPrintDialog} setOpen={setOpenPrintDialog} title={t('dashboard.tabs.employees.dialog_new_employee.success_employee_added')}  >
                {{
                    content: (
                        <>
                            <Typography variant="body1">
                                {t('dashboard.tabs.employees.dialog_print_new_emp.message_employee_added', {
                                    employeeName: newEmployeeCreated
                                        ? `${newEmployeeCreated.first_name} ${newEmployeeCreated.last_name}`
                                        : '',
                                })}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                {t('dashboard.tabs.employees.dialog_print_new_emp.message_print_login_data')}
                            </Typography>
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleClosePrintDialog}>{t('common.buttons.no')}</Button>
                            <StyledButton onClick={handlePrintLoginDetails}>
                                {t('common.buttons.yes_print')}
                            </StyledButton>
                            <StyledButton onClick={handleExportExcel}>
                                {t('common.buttons.export_excel')}
                            </StyledButton>
                        </>
                    )
                }}
            </DashboardDialog>


            {/* Hidden Print Component for Login Details */}
            <PrintLoginDetails loginDetailsRef={loginDetailsRef} newEmployeeCreated={newEmployeeCreated} employeePassword={employeePassword} />
        </>
    );
}
