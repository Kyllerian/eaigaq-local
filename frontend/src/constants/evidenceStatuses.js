// src/constants/evidenceStatuses.js
import { useTranslation } from 'react-i18next';

export function useEvidenceStatuses() {
  const { t } = useTranslation();

  // Возвращаем массив со статусами
  return [
    { value: 'IN_STORAGE',    label: t('common.status_evidences.in_storage') },
    { value: 'DESTROYED',     label: t('common.status_evidences.destroyed') },
    { value: 'TAKEN',         label: t('common.status_evidences.taken') },
    { value: 'ON_EXAMINATION',label: t('common.status_evidences.on_examination') },
    { value: 'ARCHIVED',      label: t('common.status_evidences.archived') },
  ];
}

export const evidenceStatuses = [
  { value: 'IN_STORAGE', label: 'На хранении' },
  { value: 'DESTROYED', label: 'Уничтожен' },
  { value: 'TAKEN', label: 'Возвращен' },
  { value: 'ON_EXAMINATION', label: 'На экспертизе' },
  { value: 'ARCHIVED', label: 'Выдан следователю' },
];
