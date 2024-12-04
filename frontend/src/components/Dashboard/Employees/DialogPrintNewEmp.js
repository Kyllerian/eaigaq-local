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

export default function DialogPrintNewEmp({
    openPrintDialog, setOpenPrintDialog, handleClosePrintDialog, newEmployeeCreated, handlePrintLoginDetails, employeePassword, loginDetailsRef
}) {

    // Функция для экспорта в Excel
    const handleExportExcel = async () => {
        if (!newEmployeeCreated) {
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Данные для входа сотрудника');

            let currentRow = 1;

            // Заголовок отчёта
            worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const headerCell = worksheet.getCell(`A${currentRow}`);
            headerCell.value = 'Данные для входа сотрудника';
            headerCell.font = { bold: true, size: 16 };
            headerCell.alignment = { horizontal: 'center' };
            currentRow += 1;

            // Дата создания отчёта
            worksheet.mergeCells(`A${currentRow}:B${currentRow}`);
            const dateCell = worksheet.getCell(`A${currentRow}`);
            dateCell.value = `Дата создания: ${formatDate(new Date().toISOString())}`;
            dateCell.font = { bold: true, size: 12 };
            dateCell.alignment = { horizontal: 'center' };
            currentRow += 2; // Добавить пустую строку после даты

            // Добавление заголовков таблицы
            const headers = ['Поле', 'Значение'];
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
            const data = [
                { field: 'Имя пользователя', value: newEmployeeCreated.username || 'Неизвестно' },
                { field: 'Пароль', value: employeePassword || 'Неизвестно' },
                { field: 'Имя', value: `${newEmployeeCreated.first_name || ''} ${newEmployeeCreated.last_name || ''}`.trim() || 'Неизвестно' },
                { field: 'Роль', value: newEmployeeCreated.role_display || 'Неизвестно' },
            ];

            if (newEmployeeCreated.department && newEmployeeCreated.department.name) {
                data.push({ field: 'Отделение', value: newEmployeeCreated.department.name });
            }

            // Добавление данных сессий
            data.forEach((item) => {
                worksheet.addRow([
                    item.field || '',
                    item.value || 'Неизвестно',
                ]);
                currentRow += 1;
            });
            // data.forEach(item => {
            //     const row = worksheet.addRow({ field: item.field, value: item.value });
            //     row.alignment = { vertical: 'middle', wrapText: true };
            // });

            // Добавление пустой строки перед футером
            worksheet.addRow([]);

            // Футер
            worksheet.mergeCells(`A${worksheet.rowCount}:B${worksheet.rowCount}`);
            const footerCell = worksheet.getCell(`A${worksheet.rowCount}`);
            footerCell.value = `© ${new Date().getFullYear()} Министерство внутренних дел Республики Казахстан.`;
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
            saveAs(blob, `Данные_для_входа_${newEmployeeCreated.first_name || 'Сотрудник'}.xlsx`);

        } catch (error) {
            console.error('Ошибка при экспорте в Excel:', error);
        }
        handleClosePrintDialog();
    };
    return (
        <>
            <DashboardDialog open={openPrintDialog} setOpen={setOpenPrintDialog} title={"Сотрудник успешно добавлен"}  >
                {{
                    content: (
                        <>
                            <Typography variant="body1">
                                Сотрудник{' '}
                                {newEmployeeCreated
                                    ? `${newEmployeeCreated.first_name} ${newEmployeeCreated.last_name}`
                                    : ''}
                                {' '}успешно добавлен.
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2 }}>
                                Вы хотите распечатать данные для входа сотрудника?
                            </Typography>
                        </>
                    ),
                    actions: (
                        <>
                            <Button onClick={handleClosePrintDialog}>Нет</Button>
                            <StyledButton onClick={handlePrintLoginDetails}>
                                Да, распечатать
                            </StyledButton>
                            <StyledButton onClick={handleExportExcel}>
                                Экспорт Excel
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
