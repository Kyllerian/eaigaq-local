// frontend/src/constants/getActionMessageHTML.js
import i18n from '../utils/i18n';

export default function getActionMessage_html(log) {
    const t = i18n.t.bind(i18n);

    if (log.class_name === 'Case' && log.action === 'create') {
        return <span><span style={{ fontWeight: 'bold' }}>{t('common.action_message.create_case')}</span></span>;
    } else if (log.class_name === 'Case' && log.action === 'update') {
        return <span><span style={{ fontWeight: 'bold' }}>{t('common.action_message.edit_data_case')}</span></span>;
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'create'
    ) {
        return <span><span style={{ fontWeight: 'bold' }}>{t('common.action_message.added_evidence')}</span>{/* {log.object_name || ''}*/} </span>;
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'update'
    ) {
        return <span><span style={{ fontWeight: 'bold' }}>{t('common.action_message.edit_status_evidence')}:</span> {log.object_name || ''}</span>;
    } else if (log.class_name === 'Document' && log.action === 'create') {
        return <span><span style={{ fontWeight: 'bold' }}>{t('common.action_message.added_file')}</span>{/*  {log.object_name || ''}*/}</span>;
    } else {
        // Другие случаи
        return <span><span style={{ fontWeight: 'bold' }}>{log.class_name_display}</span> - {log.action}</span>;
    }
};