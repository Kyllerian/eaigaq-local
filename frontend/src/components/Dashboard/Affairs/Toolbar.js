import {
    Box,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
} from '@mui/material';

import {
    Add as AddIcon,
    OpenInNew as OpenInNewIcon,
    Circle as CircleIcon,
    Search as SearchIcon,
} from '@mui/icons-material';

import { useTheme } from '@mui/material/styles';
import { StyledButton } from '../../ui/StyledComponents';


export default function AffairsToolbar({ user, departments, searchQuery, handleSearchChange, handleOpenBarcodeDialog, handleDepartmentChange, handleOpenCaseDialog, selectedDepartment, selectedCase, handleOpenCaseDetails }) {
    const theme = useTheme();

    return (
        <>
            {/* Поля поиска и фильтрации */}
            <Box sx={{ mb: theme.spacing(3) }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: theme.spacing(2),
                        mb: theme.spacing(2),
                    }}
                >
                    <TextField
                        label="Поиск по названию или имени создателя"
                        variant="outlined"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        size="small"
                        sx={{ flexGrow: 1 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <StyledButton
                        onClick={handleOpenBarcodeDialog}
                        sx={{ height: '40px' }}
                    >
                        Сканировать штрихкод
                    </StyledButton>
                    {user.role === 'REGION_HEAD' && (
                        <FormControl
                            sx={{ minWidth: 200 }}
                            variant="outlined"
                            size="small"
                        >
                            <InputLabel id="department-filter-label">
                                Отделение
                            </InputLabel>
                            <Select
                                labelId="department-filter-label"
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                label="Отделение"
                            >
                                <MenuItem value="">
                                    <em>Все отделения</em>
                                </MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: theme.spacing(2),
                    }}
                >
                    {user.role !== 'REGION_HEAD' ? (
                        <StyledButton
                            onClick={handleOpenCaseDialog}
                            startIcon={<AddIcon />}
                        >
                            Добавить дело
                        </StyledButton>
                    ) : (
                        <Box sx={{ width: 128 }} />
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: theme.spacing(1),
                        }}
                    >
                        <Tooltip
                            title={
                                selectedCase
                                    ? selectedCase.active
                                        ? 'Активно'
                                        : 'Закрыто'
                                    : 'Не выбрано'
                            }
                            placement="top"
                        >
                            <IconButton disabled>
                                <CircleIcon
                                    style={{
                                        color: selectedCase
                                            ? selectedCase.active
                                                ? theme.palette.success.main
                                                : theme.palette.error.main
                                            : theme.palette.grey[500],
                                        fontSize: 24,
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                        <StyledButton
                            onClick={handleOpenCaseDetails}
                            startIcon={<OpenInNewIcon />}
                            disabled={!selectedCase}
                        >
                            Открыть дело
                        </StyledButton>
                    </Box>
                </Box>
            </Box>

        </>
    );
}
