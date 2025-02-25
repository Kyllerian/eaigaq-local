// src\components\Dashboard\Employees\ExportExcelStatsOneEmployee.js
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../../constants/formatDate';
import i18n from 'i18next';

export default async function ExportExcelStatsOneEmployee(data, setSnackbar, setExportLoading) {
    const t = i18n.t.bind(i18n);

    const cases = data.cases;
    const evidence = data.evidence;
    console.log('cases', cases)
    console.log('evidence', evidence)
    console.log('data', data)

    try {
        const workbook = new ExcelJS.Workbook();

        // Лист 1: Информация о деле
        const sheetOneEmpStats = workbook.addWorksheet(t('common.report.titles.stats_employee'), { pageSetup: { orientation: 'landscape' } });

        // Добавляем заголовки
        const columns = [
            { header: t('common.table_headers.full_name_email_phone'), key: 'full_name', width: 30 },
            { header: t('common.table_headers.role_rank'), key: 'role_and_rank', width: 30 },
            { header: t('common.table_headers.department_and_region'), key: 'department_name', width: 25 },
            { header: t('common.table_headers.status'), key: 'is_active_display', width: 12 },
            { header: t('common.table_headers.cases'), key: 'cases', width: 17 },
        ];

        sheetOneEmpStats.columns = columns;

        // Добавляем данные
        const not_specified = t('common.messages.not_specified');
        const empStatus = data.is_active
            ? t('common.status.active')
            : t('common.status.inactive');

        const casesText = `${t('common.report.cases_total')}: ${data.cases?.length
            }\n${t('common.report.cases_opened')}: ${data.openedCasesCount
            }\n${t('common.status.closed')}: ${data.closedCasesCount
            }`;
        sheetOneEmpStats.addRow({
            full_name: `${data.last_name} ${data.first_name}\n${data.email}\n${data.phone_number || ''}`,
            role_and_rank: `${data.rank}\n${data.role_display}`,
            department_name: `${data.department_name || not_specified}\n${data.region_display || not_specified}`,
            is_active_display: empStatus,
            cases: casesText,
        });

        // Применяем перенос текста для ячеек с несколькими строками
        const lastRow = sheetOneEmpStats.lastRow;
        lastRow.getCell('cases').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        lastRow.getCell('full_name').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        lastRow.getCell('role_and_rank').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        lastRow.getCell('department_name').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        lastRow.getCell('is_active_display').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        // Опционально: Установить высоту строки, чтобы отобразить все строки текста
        lastRow.height = 90; // Задайте высоту по необходимости

        // Применяем стили к заголовкам
        const headerRow = sheetOneEmpStats.getRow(1);
        headerRow.font = { bold: true };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }, // Светло-серый цвет заливки для заголовков
            };
            cell.alignment = { wrapText: true };
        });

        // Применяем стили к остальным ячейкам
        sheetOneEmpStats.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Заголовки уже обработаны

            row.eachCell({ includeEmpty: true }, (cell) => {
                // Устанавливаем границы для каждой ячейки
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };

                // Чередующаяся заливка для строк (зебра-полосы)
                if (rowNumber % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEFEFEF' }, // Светло-серый цвет заливки для четных строк
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }, // Белый цвет заливки для нечетных строк
                    };
                }

                // Устанавливаем перенос текста, если еще не установлен
                if (cell.alignment && !cell.alignment.wrapText) {
                    cell.alignment = { wrapText: true };
                }
            });

            // Опционально: Устанавливаем высоту строки, если не установлена
            if (!row.height) {
                row.height = 20; // Настройте по необходимости
            }
        });


        // Лист 2: Дела

        const sheetCases = workbook.addWorksheet(t('common.table_headers.cases'), { pageSetup: { orientation: 'landscape' } });
        // Add headers
        sheetCases.columns = [
            { header: t('common.table_headers.title_and_description'), key: 'name_description', width: 61 },
            { header: t('common.table_headers.investigator_and_department'), key: 'investigator_department_region', width: 25 },
            { header: t('common.table_headers.created_updated_date'), key: 'created_and_updated', width: 28 },
        ];

        // Add data
        cases.forEach((caseItem) => {

            const nameDescription = `${caseItem.name}\n${caseItem.description}`;
            const investigatorDepartmentRegion = `${caseItem.investigator_name || not_specified}\n${caseItem.department_name || not_specified}\n${caseItem.region_name || not_specified}`;
            const createdAndUpdated = `${t('common.report.date_created')}: ${formatDate(caseItem
                .created)}\n${t('common.report.date_updated')}: ${formatDate(caseItem.updated)}`;
            sheetCases.addRow({
                name_description: nameDescription,
                investigator_department_region: investigatorDepartmentRegion,
                created_and_updated: createdAndUpdated,
            });

            // Применяем перенос текста для ячеек с несколькими строками
            const lastRowC = sheetCases.lastRow;
            ['name_description', 'investigator_department_region', 'created_and_updated'].forEach(
                (colKey) => {
                    lastRowC.getCell(colKey).alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true,
                    };
                }
            );

            // Рассчитываем высоту строки на основе количества символов
            const calculateRowHeight = (text, charPerLine) => {
                const lines = text.split('\n').reduce((acc, line) => {
                    return acc + Math.ceil(line.length / charPerLine);
                }, 0);
                return lines + 1;
            };

            const maxLines = Math.max(
                calculateRowHeight(nameDescription, 50), // Предполагаем, что в одну строку помещается 50 символов
                calculateRowHeight(investigatorDepartmentRegion, 50),
                calculateRowHeight(createdAndUpdated, 50)
            );

            lastRow.height = maxLines * 20; // 15 - высота одной строки
        });

        // Применяем стили к заголовкам
        const headerRowCases = sheetCases.getRow(1);
        headerRowCases.font = { bold: true };
        headerRowCases.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRowCases.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }, // Светло-серый цвет заливки для заголовков
            };
            cell.alignment = { wrapText: true };
        });

        // Применяем стили к остальным ячейкам
        sheetCases.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            if (rowNumber === 1) return; // Заголовки уже обработаны
            row.alignment = { wrapText: true };

            row.eachCell({ includeEmpty: true }, (cell) => {
                // Устанавливаем границы для каждой ячейки
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };

                // Чередующаяся заливка для строк (зебра-полосы)
                if (rowNumber % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEFEFEF' }, // Светло-серый цвет заливки для четных строк
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }, // Белый цвет заливки для нечетных строк
                    };
                }

                // Устанавливаем перенос текста, если еще не установлен
                if (cell.alignment && !cell.alignment.wrapText) {
                    cell.alignment = { wrapText: true };
                }
            });

            // Опционально: Устанавливаем высоту строки, если не установлена
            if (!row.height) {
                row.height = 20; // Настройте по необходимости
            }
        });

        sheetCases.eachRow({ includeEmpty: true }, (row) => {
            row.alignment = { wrapText: true };
        });

        // Лист 3: Вещественные доказательства

        const sheetEvidences = workbook.addWorksheet(t('common.report.evidence_employee'), { pageSetup: { orientation: 'landscape' } });

        // Добавляем заголовки
        sheetEvidences.columns = [
            { header: t('common.table_headers.number'), key: 'number', width: 5 },
            { header: t('common.table_headers.evidence'), key: 'vd', width: 30 },
            { header: t('common.table_headers.type_status_evidence'), key: 'type_status', width: 15 },
            { header: t('common.table_headers.case_investigator'), key: 'case_name_and_investigator', width: 20 },
            { header: t('common.table_headers.department_and_region'), key: 'department_region', width: 25 },
            { header: t('common.table_headers.created'), key: 'created_barcode', width: 18 },
        ];

        // Добавляем данные
        evidence.forEach((evidence, index) => {
            // Объединяем необходимые поля
            const vd = `${evidence.name}\n${evidence.description}`;
            const type_status = `${evidence.type_display}\n${evidence.status_display}`;
            const department_region = `${evidence.department_name || not_specified}\n${evidence.region_name || not_specified}`;
            const created = formatDate(evidence.created);
            const barcode = evidence.barcode ? evidence.barcode : '';

            sheetEvidences.addRow({
                number: index + 1,
                vd: vd,
                type_status: type_status,
                case_name_and_investigator: `${evidence.case_name || t('common.table_data.not_assigned')}\n${evidence.investigator_name || not_specified}`,
                department_region: department_region,
                created_barcode: created + (barcode ? `\n${barcode}` : ''),
            });

            // Применяем перенос текста для ячеек с несколькими строками
            const lastRowE = sheetEvidences.lastRow;
            ['vd', 'type_status', 'case_name_and_investigator', 'department_region', 'created_barcode'].forEach(
                (colKey) => {
                    lastRowE.getCell(colKey).alignment = {
                        vertical: 'middle',
                        horizontal: 'center',
                        wrapText: true,
                    };
                }
            );

            // Рассчитываем высоту строки на основе количества символов
            const calculateRowHeight = (text, charPerLine) => {
                const lines = text.split('\n').reduce((acc, line) => {
                    return acc + Math.ceil(line.length / charPerLine);
                }, 0);
                return lines + 3;
            };

            const maxLines = Math.max(
                calculateRowHeight(vd, 30), // Предполагаем, что в одну строку помещается 50 символов
                calculateRowHeight(type_status, 50),
                calculateRowHeight(department_region, 50),
            );
            console.log('maxLines', maxLines)
            lastRow.height = maxLines * 22; // 15 - высота одной строки
        });

        // Применяем стили к заголовкам
        const headerRowEvidence = sheetEvidences.getRow(1);
        headerRowEvidence.font = { bold: true };
        headerRowEvidence.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        headerRowEvidence.height = 20;
        headerRowEvidence.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }, // Светло-серый цвет заливки для заголовков
            };
            cell.alignment = { wrapText: true };
        });

        // Применяем стили к данным
        sheetEvidences.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            row.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            // row.height = 40; // Увеличиваем высоту строк для обтекания текста

            // Добавляем границы
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };

                // Чередующаяся заливка для строк (зебра-полосы)
                if (rowNumber % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEFEFEF' }, // Светло-серый цвет заливки для четных строк
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }, // Белый цвет заливки для нечетных строк
                    };
                }

                // Устанавливаем перенос текста, если еще не установлен
                if (cell.alignment && !cell.alignment.wrapText) {
                    cell.alignment = { wrapText: true };
                }
            });
        });

        // Установить выравнивание заголовков по центру
        sheetEvidences.columns.forEach((column) => {
            column.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        });

        // Генерация Excel-файла и его сохранение
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `${t('common.report.titles.file_name_employee')}${data?.full_name || 'Сотрудник'}.xlsx`);

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
    } finally {
        setExportLoading(false);
    }
};