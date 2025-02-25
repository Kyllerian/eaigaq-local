// src\components\CaseDetailComponents\ExportExcelCaseDetail.jsx
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { formatDate } from '../../constants/formatDate';
import getActionMessage from '../../constants/getActionMessage';
import i18n from '../../utils/i18n';

export default async function HandleExportExcel(
    caseItem,
    setSnackbar,
    changeLogs,
    InvestigatorName,
    canViewHistory,
    groups,
    setIsLoading,
    fieldLabels,
    evidenceTypes,
    evidenceStatuses
) {
    const t = i18n.t.bind(i18n);
    function GetStatusLabel(value) {
        const status = evidenceStatuses.find((s) => s.value === value);
        return status ? status.label : value;
    }
    function GetTypeLabel(value) {
        const typeObj = evidenceTypes.find((type) => type.value === value);
        return typeObj ? typeObj.label : value;
    }

    if (!caseItem) {
        setSnackbar({
            open: true,
            message: t('common.errors.error_no_data_for_export'),
            severity: 'warning',
        });
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();

        // -----------------------------------------------------------------------------
        // ЛИСТ 1: "Информация о деле"
        // -----------------------------------------------------------------------------

        const sheetCaseInfo = workbook.addWorksheet(t('common.report.titles.case_info'), {
            pageSetup: { orientation: 'landscape' },
        });

        // Определяем колонки
        sheetCaseInfo.columns = [
            { header: t('common.table_headers.case_name_investigator'), key: 'name_and_investigator', width: 33, },
            { header: t('common.table_headers.description'), key: 'description', width: 50, },
            { header: t('common.table_headers.region_department'), key: 'region_and_department', width: 30, },
        ];

        // Добавляем данные
        sheetCaseInfo.addRow({
            name_and_investigator: `${caseItem
                .name || t('common.messages.unknown')}\n${InvestigatorName || t('common.messages.unknown')
                }`,
            description: caseItem.description || t('common.messages.unknown'),
            region_and_department: `${caseItem.department
                ?.region_display || t('common.messages.unknown')}\n${caseItem.department?.name || t('common.messages.unknown')
                }`,
        });

        // ---------------------- СТИЛИЗАЦИЯ ЗАГОЛОВКА ----------------------
        const headerRowCaseInfo = sheetCaseInfo.getRow(1);
        headerRowCaseInfo.font = { bold: true };
        headerRowCaseInfo.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        };
        headerRowCaseInfo.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }, // светло-серый для заголовка
            };
        });

        // ---------------------- СТИЛИЗАЦИЯ ДАННЫХ ------------------------
        sheetCaseInfo.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            // Пропускаем строку заголовка
            if (rowNumber === 1) return;

            row.eachCell({ includeEmpty: true }, (cell) => {
                // Границы
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                // Зебра (чет/нечет)
                if (rowNumber % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEFEFEF' },
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' },
                    };
                }
                // Перенос текста
                if (!cell.alignment || !cell.alignment.wrapText) {
                    cell.alignment = {
                        wrapText: true,
                        vertical: 'middle',
                        horizontal: 'left',
                    };
                }
            });
        });

        // -----------------------------------------------------------------------------
        // ЛИСТ 2: "Вещественные доказательства"
        // -----------------------------------------------------------------------------

        const sheetEvidences = workbook.addWorksheet(t('common.report.titles.evidence_table'), {
            pageSetup: { orientation: 'landscape' },
        });

        // Определяем колонки
        sheetEvidences.columns = [
            { header: t('common.table_headers.group'), key: 'group', width: 15 },
            { header: t('common.table_headers.name_evidence'), key: 'name', width: 18 },
            { header: t('common.table_headers.description_evidence'), key: 'description', width: 50 },
            { header: t('common.standard.label_evidence_type'), key: 'type', width: 15 },
            { header: t('common.table_headers.status'), key: 'status', width: 15 },
        ];

        // Добавляем данные
        groups.forEach((group) => {
            if (group.material_evidences && group.material_evidences.length > 0) {
                group.material_evidences.forEach((evidence) => {
                    sheetEvidences.addRow({
                        group: group.name || t('common.messages.unknown'),
                        name: evidence.name || t('common.messages.unknown'),
                        description: evidence.description || t('common.messages.unknown'),
                        type: GetTypeLabel(evidence.type, t),
                        status: GetStatusLabel(evidence.status),
                    });
                });
            } else {
                sheetEvidences.addRow({
                    group: group.name || t('common.messages.unknown'),
                    name: t('common.messages.no_evidences'),
                    description: '',
                    type: '',
                    status: '',
                });
            }
        });

        // ---------------------- СТИЛИЗАЦИЯ ЗАГОЛОВКА ----------------------
        const headerRowEvidences = sheetEvidences.getRow(1);
        headerRowEvidences.font = { bold: true };
        headerRowEvidences.alignment = {
            vertical: 'middle',
            horizontal: 'center',
            wrapText: true,
        };
        headerRowEvidences.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' },
            };
        });

        // ---------------------- СТИЛИЗАЦИЯ ДАННЫХ ------------------------
        sheetEvidences.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            // Пропускаем строку заголовка
            if (rowNumber === 1) return;

            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                if (rowNumber % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFEFEFEF' },
                    };
                } else {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' },
                    };
                }
                if (!cell.alignment || !cell.alignment.wrapText) {
                    cell.alignment = {
                        wrapText: true,
                        vertical: 'middle',
                        horizontal: 'left',
                    };
                }
            });
        });

        // -----------------------------------------------------------------------------
        // ЛИСТ 3: "История изменений" (если доступна)
        // -----------------------------------------------------------------------------

        if (canViewHistory) {
            const sheetChangeLogs = workbook.addWorksheet(t('common.report.titles.history_title'), {
                pageSetup: { orientation: 'landscape' },
            });

            // Определяем колонки
            sheetChangeLogs.columns = [
                { header: t('common.table_headers.change_date_user'), key: 'created', width: 13 },
                { header: t('common.table_headers.change_user'), key: 'user', width: 20 },
                { header: t('common.table_headers.actions'), key: 'action', width: 25 },
                { header: t('common.table_headers.change_data'), key: 'changes', width: 50 },
            ];

            // Добавляем данные
            changeLogs.forEach((log) => {
                let changesText = '';

                if (log.data && log.data.trim() !== '') {
                    try {
                        const data = JSON.parse(log.data);
                        if (log.action === 'update') {
                            const displayFields = ['name', 'description', 'status', 'type'];
                            changesText = Object.entries(data)
                                .filter(([field]) => displayFields.includes(field))
                                .map(([field, values]) => {
                                    const fieldLabel = fieldLabels[field] || field;
                                    const oldValue =
                                        field === 'status'
                                            ? GetStatusLabel(values.old)
                                            : field === 'type'
                                                ? GetTypeLabel(values.old)
                                                : values.old;
                                    const newValue =
                                        field === 'status'
                                            ? GetStatusLabel(values.new)
                                            : field === 'type'
                                                ? GetTypeLabel(values.new)
                                                : values.new;
                                    return `${fieldLabel}: ${oldValue}${t('common.table_data.field_old_new_separator')}${newValue}`;
                                })
                                .join('; ');
                        } else if (log.action === 'create') {
                            const displayFields = ['name', 'description', 'status', 'type'];
                            changesText = Object.entries(data)
                                .filter(([field]) => displayFields.includes(field))
                                .map(([field, value]) => {
                                    const fieldLabel = fieldLabels[field] || field;
                                    const displayValue =
                                        field === 'status'
                                            ? GetStatusLabel(value)
                                            : field === 'type'
                                                ? GetTypeLabel(value)
                                                : value;
                                    return `${fieldLabel}: ${displayValue}`;
                                })
                                .join('; ');
                        } else if (log.action === 'delete') {
                            changesText = t('common.messages.object_deleted');
                        } else {
                            changesText = t('common.messages.no_change_data');
                        }
                    } catch (error) {
                        console.error('Ошибка парсинга данных лога:', error);
                        changesText = t('common.messages.no_change_data');
                    }
                } else {
                    changesText = t('common.messages.no_change_data');
                }

                sheetChangeLogs.addRow({
                    created: formatDate(log.created),
                    user: log.user ? log.user.full_name : t('common.table_data.system_user'),
                    action: getActionMessage(log),
                    changes: changesText,
                });
            });

            // ---------------------- СТИЛИЗАЦИЯ ЗАГОЛОВКА ------------------
            const headerRowLogs = sheetChangeLogs.getRow(1);
            headerRowLogs.font = { bold: true };
            headerRowLogs.alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true,
            };
            headerRowLogs.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFD3D3D3' },
                };
            });

            // ---------------------- СТИЛИЗАЦИЯ ДАННЫХ --------------------
            sheetChangeLogs.eachRow({ includeEmpty: false }, (row, rowNumber) => {
                if (rowNumber === 1) return; // пропускаем заголовок

                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    if (rowNumber % 2 === 0) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFEFEFEF' },
                        };
                    } else {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFFFFF' },
                        };
                    }
                    if (!cell.alignment || !cell.alignment.wrapText) {
                        cell.alignment = {
                            wrapText: true,
                            vertical: 'middle',
                            horizontal: 'left',
                        };
                    }
                });
            });
        }

        // -----------------------------------------------------------------------------
        // Генерация Excel-файла и сохранение
        // -----------------------------------------------------------------------------

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `${t('common.report.titles.file_name_case')}${caseItem.name || 'Номер'}.xlsx`);

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
        setIsLoading(false);
    }
}