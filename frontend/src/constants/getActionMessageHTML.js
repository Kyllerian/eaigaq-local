// frontend/src/constants/getActionMessageHTML.js
export default function getActionMessage_html(log) {
    console.log('adasd');
    if (log.class_name === 'Case' && log.action === 'create') {
        return <span><span style={{ fontWeight: 'bold' }}>Создание дела</span></span>;
    } else if (log.class_name === 'Case' && log.action === 'update') {
        return <span><span style={{ fontWeight: 'bold' }}>Изменение данных дела</span></span>;
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'create'
    ) {
        return <span><span style={{ fontWeight: 'bold' }}>Добавлено вещественное доказательство</span>{/* {log.object_name || ''}*/} </span>;
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'update'
    ) {
        return <span><span style={{ fontWeight: 'bold' }}>Изменение статуса вещественного доказательства:</span> {log.object_name || ''}</span>;
    } else if (log.class_name === 'Document' && log.action === 'create') {
        return <span><span style={{ fontWeight: 'bold' }}>Добавлен файл</span>{/*  {log.object_name || ''}*/}</span>;
    } else {
        // Другие случаи
        return <span><span style={{ fontWeight: 'bold' }}>{log.class_name_display}</span> - {log.action}</span>;
    }
};