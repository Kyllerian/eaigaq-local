// Получение сообщения действия
export default function getActionMessage(log) {
    console.log('adasd');
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
    } else if (log.class_name === 'Document' && log.action === 'create') {
        return `Добавлен файл: ${log.object_name || ''}`;
    } else {
        // Другие случаи
        return `${log.class_name_display} - ${log.action}`;
    }
};