import { evidenceStatuses } from "./evidenceStatuses";

// Получение отображаемого статуса
export default function getStatusLabel(value) {
    const status = evidenceStatuses.find((status) => status.value === value);
    return status ? status.label : value;
};