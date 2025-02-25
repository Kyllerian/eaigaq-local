// frontend\src\constants\getStatusLabel.js

import { useEvidenceStatuses } from "./evidenceStatuses";

// Получение отображаемого статуса
export default function GetStatusLabel(value) {
    const statuses = useEvidenceStatuses();
    const status = statuses.find((status) => status.value === value);
    return status ? status.label : value;
};