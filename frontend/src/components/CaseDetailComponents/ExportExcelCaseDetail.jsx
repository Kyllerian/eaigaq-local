// Новый обработчик для экспорта в Excel
import { fieldLabels } from '../../constants/fieldsLabels';
import { EVIDENCE_TYPES } from '../../constants/evidenceTypes';
import { evidenceStatuses } from '../../constants/evidenceStatuses';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { formatDate } from '../../constants/formatDate'; // Убедитесь, что путь корректен

export default async function handleExportExcel(caseItem, setSnackbar, changeLogs, InvestigatorName, canViewHistory, groups) {
    if (!caseItem) {
        setSnackbar({
            open: true,
            message: 'Нет данных для экспорта.',
            severity: 'warning',
        });
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();

        // Лист 1: Информация о деле
        const sheetCaseInfo = workbook.addWorksheet('Информация о деле');

        // Заголовки
        sheetCaseInfo.columns = [
            { header: 'Поле', key: 'field', width: 30 },
            { header: 'Значение', key: 'value', width: 50 },
        ];

        // Добавляем данные
        const caseInfoData = [
            { field: 'Название дела', value: caseItem.name || 'Неизвестно' },
            { field: 'Описание', value: caseItem.description || 'Неизвестно' },
            { field: 'Следователь', value: InvestigatorName || 'Неизвестно' },
            { field: 'Регион', value: caseItem.department?.region_display || 'Неизвестно' },
            { field: 'Отделение', value: caseItem.department?.name || 'Неизвестно' },
        ];

        caseInfoData.forEach((item) => {
            sheetCaseInfo.addRow(item);
        });

        // Применяем стили к заголовкам
        const headerRow = sheetCaseInfo.getRow(1);
        headerRow.font = { bold: true };

        // Автоматическая подстройка ширины колонок
        sheetCaseInfo.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellValue = cell.value ? cell.value.toString() : '';
                if (cellValue.length > maxLength) {
                    maxLength = cellValue.length;
                }
            });
            // Устанавливаем ширину колонки, добавляя небольшой буфер
            column.width = maxLength < 10 ? 10 : Math.min(maxLength + 2, 50); // Максимальная ширина 50
        });

        sheetCaseInfo.eachRow({ includeEmpty: true }, (row) => {
            row.alignment = { wrapText: true };
        });
        // Лист 2: Вещественные доказательства
        const sheetEvidences = workbook.addWorksheet('Вещественные доказательства');

        // Заголовки
        sheetEvidences.columns = [
            { header: 'Группа', key: 'group', width: 30 },
            { header: 'Название ВД', key: 'name', width: 30 },
            { header: 'Описание ВД', key: 'description', width: 50 },
            { header: 'Тип ВД', key: 'type', width: 20 },
            { header: 'Статус', key: 'status', width: 20 },
        ];

        // Применяем стили к заголовкам
        const headerRowEvidences = sheetEvidences.getRow(1);
        headerRowEvidences.font = { bold: true };

        // Добавляем данные
        groups.forEach((group) => {
            if (group.material_evidences && group.material_evidences.length > 0) {
                group.material_evidences.forEach((evidence) => {
                    sheetEvidences.addRow({
                        group: group.name || 'Неизвестно',
                        name: evidence.name || 'Неизвестно',
                        description: evidence.description || 'Неизвестно',
                        type: getTypeLabel(evidence.type),
                        status: getStatusLabel(evidence.status),
                    });
                });
            } else {
                sheetEvidences.addRow({
                    group: group.name || 'Неизвестно',
                    name: 'Нет вещественных доказательств.',
                    description: '',
                    type: '',
                    status: '',
                });
            }
        });

        // Автоматическая подстройка ширины колонок
        sheetEvidences.columns.forEach((column) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
                const cellValue = cell.value ? cell.value.toString() : '';
                if (cellValue.length > maxLength) {
                    maxLength = cellValue.length;
                }
            });
            // Устанавливаем ширину колонки, добавляя небольшой буфер
            column.width = maxLength < 10 ? 10 : Math.min(maxLength + 2, 50); // Максимальная ширина 50
        });

        sheetEvidences.eachRow({ includeEmpty: true }, (row) => {
            row.alignment = { wrapText: true };
        });

        // Лист 3: История изменений (если доступна)
        if (canViewHistory) {
            const sheetChangeLogs = workbook.addWorksheet('История изменений');

            // Заголовки
            sheetChangeLogs.columns = [
                { header: 'Дата и время', key: 'created', width: 25 },
                { header: 'Пользователь', key: 'user', width: 30 },
                { header: 'Действие', key: 'action', width: 40 },
                { header: 'Изменения', key: 'changes', width: 50 },
            ];

            // Применяем стили к заголовкам
            const headerRowLogs = sheetChangeLogs.getRow(1);
            headerRowLogs.font = { bold: true };

            // Добавляем данные
            changeLogs.forEach((log) => {
                let changesText = '';

                if (log.data && log.data.trim() !== '') {
                    try {
                        const data = JSON.parse(log.data);
                        if (log.action === 'update') {
                            const displayFields = [
                                'name',
                                'description',
                                'status',
                                'type', // Добавлено
                            ];
                            changesText = Object.entries(data)
                                .filter(([field, _]) => displayFields.includes(field))
                                .map(([field, values]) => {
                                    const fieldLabel = fieldLabels[field] || field;
                                    const oldValue =
                                        field === 'status'
                                            ? getStatusLabel(values.old)
                                            : field === 'type'
                                                ? getTypeLabel(values.old)
                                                : values.old;
                                    const newValue =
                                        field === 'status'
                                            ? getStatusLabel(values.new)
                                            : field === 'type'
                                                ? getTypeLabel(values.new)
                                                : values.new;
                                    return `${fieldLabel}: ${oldValue} → ${newValue}`;
                                })
                                .join('; ');
                        } else if (log.action === 'create') {
                            const displayFields = [
                                'name',
                                'description',
                                'status',
                                'type', // Добавлено
                            ];
                            changesText = Object.entries(data)
                                .filter(([field, _]) => displayFields.includes(field))
                                .map(([field, value]) => {
                                    const fieldLabel = fieldLabels[field] || field;
                                    const displayValue =
                                        field === 'status'
                                            ? getStatusLabel(value)
                                            : field === 'type'
                                                ? getTypeLabel(value)
                                                : value;
                                    return `${fieldLabel}: ${displayValue}`;
                                })
                                .join('; ');
                        } else if (log.action === 'delete') {
                            changesText = 'Объект был удален.';
                        } else {
                            changesText = 'Нет данных об изменениях.';
                        }
                    } catch (error) {
                        console.error('Ошибка парсинга данных лога:', error);
                        changesText = 'Нет данных об изменениях.';
                    }
                } else {
                    changesText = 'Нет данных об изменениях.';
                }

                sheetChangeLogs.addRow({
                    created: formatDate(log.created),
                    user: log.user ? log.user.full_name : 'Система',
                    action: getActionMessage(log),
                    changes: changesText,
                });
            });

            // Автоматическая подстройка ширины колонок
            sheetChangeLogs.columns.forEach((column) => {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const cellValue = cell.value ? cell.value.toString() : '';
                    if (cellValue.length > maxLength) {
                        maxLength = cellValue.length;
                    }
                });
                // Устанавливаем ширину колонки, добавляя небольшой буфер
                column.width = maxLength < 10 ? 10 : Math.min(maxLength + 2, 50); // Максимальная ширина 50
            });

            sheetChangeLogs.eachRow({ includeEmpty: true }, (row) => {
                row.alignment = { wrapText: true };
            });
        }

        // Генерация Excel-файла и его сохранение
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `Отчет_по_делу_${caseItem.name || 'Номер'}.xlsx`);

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

// Получение отображаемого типа
const getTypeLabel = (value) => {
    const type = EVIDENCE_TYPES.find((type) => type.value === value);
    return type ? type.label : value;
};

// Получение отображаемого статуса
const getStatusLabel = (value) => {
    const status = evidenceStatuses.find((status) => status.value === value);
    return status ? status.label : value;
};

// Получение сообщения действия
const getActionMessage = (log) => {
    if (log.class_name === 'Case' && log.action === 'create') {
        return 'Создание дела';
    } else if (log.class_name === 'Case' && log.action === 'update') {
        return 'Изменение данных дела';
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'create'
    ) {
        return `Добавлено вещественное доказательство: ${log.object_name || ''}`;
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'update'
    ) {
        return `Изменение статуса вещественного доказательства: ${log.object_name || ''}`;
    } else {
        // Другие случаи
        return `${log.class_name_display} - ${log.action}`;
    }
};