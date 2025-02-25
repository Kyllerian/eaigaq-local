// src/constants/evidenceTypes.js
import { useTranslation } from 'react-i18next';

export function useEvidenceTypes() {
  const { t } = useTranslation();
  return [
    { value: 'FIREARM', label: t('common.evidence_types.firearm') },
    { value: 'COLD_WEAPON', label: t('common.evidence_types.cold_weapon') },
    { value: 'DRUGS', label: t('common.evidence_types.drugs') },
    { value: 'OTHER', label: t('common.evidence_types.other') },
  ];
}

export const EVIDENCE_TYPES = [
  { value: 'FIREARM', label: 'Огнестрельное оружие' },
  { value: 'COLD_WEAPON', label: 'Холодное оружие' },
  { value: 'DRUGS', label: 'Наркотики' },
  { value: 'OTHER', label: 'Другое' },
];
