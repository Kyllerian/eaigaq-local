// frontend\src\constants\getActionMessage.js

import i18n from '../utils/i18n';
// Получение сообщения действия

export default function getActionMessage(log) {
    const t = i18n.t.bind(i18n);

    if (log.class_name === 'Case' && log.action === 'create') {
        return t('common.action_message.create_case')+':';
    } else if (log.class_name === 'Case' && log.action === 'update') {
        return t('common.action_message.edit_data_case');
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'create'
    ) {
        return `${t('common.action_message.added_evidence')}: ${/*log.object_name ||*/ ''}`;
    } else if (
        log.class_name === 'MaterialEvidence' &&
        log.action === 'update'
    ) {
        return `${t('common.action_message.edit_status_evidence')}: ${log.object_name || ''}`;
    } else if (log.class_name === 'Document' && log.action === 'create') {
        return `${t('common.action_message.added_file')}: ${log.object_name || ''}`;
    } else {
        // Другие случаи
        return `${log.class_name_display} - ${log.action}`;
    }
};