// frontend\src\constants\fieldsLabels.js
import { useTranslation } from 'react-i18next';

export function useFieldLabels() {
  const { t } = useTranslation();
  return {
    name: t('common.fields.name'),
    description: t('common.fields.description'),
    status: t('common.fields.status'),
    type: t('common.fields.type'),
    updated: t('common.fields.updated'),
    created: t('common.fields.created'),
    case: t('common.fields.case'),
    group: t('common.fields.group'),
    creator: t('common.fields.creator'),
    investigator: t('common.fields.investigator'),
    department: t('common.fields.department'),
  };
}

export const fieldLabels = {
    name: 'Название',
    description: 'Описание',
    status: 'Статус',
    type: 'Тип ВД',
    updated: 'Обновлено',
    created: 'Создано',
    case: 'Дело',
    group: 'Группа',
    creator: 'Создатель',
    investigator: 'Следователь',
    department: 'Департамент'
};
  