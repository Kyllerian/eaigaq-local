// src/components/ChangeHistoryTab.js

import React from 'react';
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { StyledTableCell } from './StyledComponents';
import { evidenceStatuses } from '../constants/evidenceStatuses';
import { EVIDENCE_TYPES } from '../constants/evidenceTypes';



const ChangeHistoryTab = ({ changeLogs }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return date.toLocaleDateString('ru-RU', options);
  };

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
      return `Изменение статуса вещественного доказательства: ${
        log.object_name || ''
      }`;
    } else {
      return `${log.class_name_display} - ${log.action}`;
    }
  };

  const getStatusLabel = (value) => {
    const status = evidenceStatuses.find((status) => status.value === value);
    return status ? status.label : value;
  };

  const getTypeLabel = (value) => {
    const type = EVIDENCE_TYPES.find((type) => type.value === value);
    return type ? type.label : value;
  };

  const fieldLabels = {
    name: 'Название',
    description: 'Описание',
    status: 'Статус',
    type: 'Тип ВД',
    updated: 'Обновлено',
    created: 'Создано',
    case: 'Дело',
    group: 'Группа',
  };

  return (
    <Paper elevation={1} sx={{ padding: 3 }}>
      <Typography variant="h6" gutterBottom>
        История изменений
      </Typography>
      <TableContainer component={Paper}>
        <Table aria-label="Таблица истории изменений">
          <TableHead>
            <TableRow>
              <StyledTableCell>Дата и время</StyledTableCell>
              <StyledTableCell>Пользователь</StyledTableCell>
              <StyledTableCell>Действие</StyledTableCell>
              <StyledTableCell>Изменения</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {changeLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{formatDate(log.created)}</TableCell>
                <TableCell>
                  {log.user ? log.user.full_name : 'Система'}
                </TableCell>
                <TableCell>{getActionMessage(log)}</TableCell>
                <TableCell>
                  {/* Render changes based on your logic */}
                  {(() => {
                    if (log.data && log.data.trim() !== '') {
                      try {
                        const data = JSON.parse(log.data);
                        if (log.action === 'update') {
                          const displayFields = [
                            'name',
                            'description',
                            'status',
                            'type',
                          ];
                          return Object.entries(data).map(
                            ([field, values]) => {
                              if (displayFields.includes(field)) {
                                return (
                                  <div key={field}>
                                    <strong>
                                      {fieldLabels[field] || field}
                                    </strong>
                                    :{' '}
                                    {field === 'status'
                                      ? getStatusLabel(values.old)
                                      : field === 'type'
                                      ? getTypeLabel(values.old)
                                      : values.old}{' '}
                                    →{' '}
                                    {field === 'status'
                                      ? getStatusLabel(values.new)
                                      : field === 'type'
                                      ? getTypeLabel(values.new)
                                      : values.new}
                                  </div>
                                );
                              } else {
                                return null;
                              }
                            }
                          );
                        } else if (log.action === 'create') {
                          const displayFields = [
                            'name',
                            'description',
                            'status',
                            'type',
                          ];
                          return (
                            <div>
                              {Object.entries(data).map(([field, value]) => {
                                if (displayFields.includes(field)) {
                                  return (
                                    <div key={field}>
                                      <strong>
                                        {fieldLabels[field] || field}
                                      </strong>
                                      :{' '}
                                      {field === 'status'
                                        ? getStatusLabel(value)
                                        : field === 'type'
                                        ? getTypeLabel(value)
                                        : value}
                                    </div>
                                  );
                                } else {
                                  return null;
                                }
                              })}
                            </div>
                          );
                        } else if (log.action === 'delete') {
                          return <div>Объект был удален.</div>;
                        } else {
                          return 'Нет данных об изменениях.';
                        }
                      } catch (error) {
                        console.error(
                          'Ошибка парсинга данных лога:',
                          error
                        );
                        return 'Нет данных об изменениях.';
                      }
                    } else {
                      return 'Нет данных об изменениях.';
                    }
                  })()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ChangeHistoryTab;
