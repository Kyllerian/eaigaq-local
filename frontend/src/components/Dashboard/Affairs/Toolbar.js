// frontend/src/components/Dashboard/Affairs/Toolbar.js

import React, { useState } from 'react';
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
    Button,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
// import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
    Add as AddIcon,
    OpenInNew as OpenInNewIcon,
    Circle as CircleIcon,
    Search as SearchIcon,
    GetApp as GetAppIcon,
    PictureAsPdf as PictureAsPdfIcon,
    Description as DescriptionIcon,
    Event as CalendarIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledButton } from '../../ui/StyledComponents';

import { LocalizationProvider, DateRangePicker, SingleInputDateRangeField } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/ru';
import { ruRU } from '@mui/x-date-pickers/locales';
import { LicenseInfo } from '@mui/x-license';

LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');

export default function AffairsToolbar(props) {
    const {
        user,
        departments,
        searchQuery,
        handleSearchChange,
        handleOpenBarcodeDialog,
        handleDepartmentChange,
        handleExportMenuOpen,
        exportMenuAnchorEl,
        handleExportMenuClose,
        handleCaseExport,
        handleOpenCaseDialog,
        selectedDepartment,
        selectedCase,
        handleOpenCaseDetails,
        handleDateAddedFromChange,
        handleDateAddedToChange,
    } = props;

    const theme = useTheme();

    const [dateRange, setDateRange] = useState([null, null]);

    const handleDateRangeChange = (newRange) => {
        setDateRange(newRange); // Обновляем локальное состояние
        const [startDate, endDate] = newRange || []; // Если newRange null, получаем пустой массив
        handleDateAddedFromChange(startDate ? startDate.format('YYYY-MM-DD') : null);
        handleDateAddedToChange(endDate ? endDate.add(1, 'day').format('YYYY-MM-DD') : null);
    };

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
                        label="Поиск по названию, описанию или имени следователя"
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
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru"
                        localeText={{
                            ...ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
                            clearButtonLabel: 'Очистить', // Изменяем текст кнопки "Clear"
                        }}
                    >
                        <DateRangePicker
                            value={dateRange}
                            onChange={handleDateRangeChange}
                            label="Дата создания от - до"
                            slots={{ field: SingleInputDateRangeField }}
                            slotProps={{
                                field: {
                                    size: 'small',
                                    label: 'Дата создания от - до',
                                    InputProps: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CalendarIcon />
                                            </InputAdornment>
                                        ),
                                    },
                                    InputLabelProps: { shrink: true },
                                },
                                actionBar: {
                                    actions: ['clear'],
                                },
                            }}
                        />
                    </LocalizationProvider>
                    {user.role === 'REGION_HEAD' && (
                        <FormControl sx={{ minWidth: 200, maxWidth: 200 }} variant="outlined" size="small">
                            <InputLabel id="department-filter-label">Отделение</InputLabel>
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
                    <StyledButton
                        onClick={handleOpenBarcodeDialog}
                        sx={{ height: '40px' }}
                    >
                        Сканировать штрихкод
                    </StyledButton>

                    {/* Export button with menu */}
                    <Box sx={{ display: 'flex', gap: theme.spacing(1), ml: 'auto' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleExportMenuOpen}
                            startIcon={<GetAppIcon />}
                            sx={{ height: '40px' }}
                        >
                            Экспорт
                        </Button>
                        <Menu
                            anchorEl={exportMenuAnchorEl}
                            open={Boolean(exportMenuAnchorEl)}
                            onClose={handleExportMenuClose}
                        >
                            <MenuItem onClick={() => handleCaseExport('pdf')}>
                                <ListItemIcon>
                                    <PictureAsPdfIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Экспорт PDF</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => handleCaseExport('excel')}>
                                <ListItemIcon>
                                    <DescriptionIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Экспорт Excel</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
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
                            sx={{ height: '40px' }}
                        >
                            <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Добавить дело</span>
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
                            sx={{ height: '40px' }}
                            disabled={!selectedCase}
                        >
                            <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
                        </StyledButton>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

//
// // frontend/src/components/Dashboard/Affairs/Toolbar.js
// import {
//     Box,
//     FormControl,
//     IconButton,
//     InputAdornment,
//     InputLabel,
//     MenuItem,
//     Select,
//     TextField,
//     Tooltip,
//     Button,
//     Menu,
//     ListItemIcon,
//     ListItemText,
// } from '@mui/material';
// import {
//     Add as AddIcon,
//     OpenInNew as OpenInNewIcon,
//     Circle as CircleIcon,
//     Search as SearchIcon,
//     GetApp as GetAppIcon,
//     PictureAsPdf as PictureAsPdfIcon,
//     Description as DescriptionIcon,
// } from '@mui/icons-material';
// import Calendar from '@mui/icons-material/Event';
//
// import { useTheme } from '@mui/material/styles';
// import { StyledButton } from '../../ui/StyledComponents';
//
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
// import { SingleInputDateRangeField } from '@mui/x-date-pickers-pro/SingleInputDateRangeField';
// import './aphsubersh.css'
// import { useState } from 'react';
//
// import 'dayjs/locale/ru';
//
// import { LicenseInfo } from '@mui/x-license';
//
// LicenseInfo.setLicenseKey('d7a42a252b29f214a57d3d3f80b1e8caTz0xMjM0NSxFPTE3MzI1NzE1ODEwNTczLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1wZXJwZXR1YWwsS1Y9Mg==');
//
//
//
// export default function AffairsToolbar({ user, departments, searchQuery, handleSearchChange,
//     dateAddedFrom, handleDateAddedFromChange, dateAddedTo, handleDateAddedToChange,
//     handleOpenBarcodeDialog, handleDepartmentChange,
//     handleExportMenuOpen, exportMenuAnchorEl, handleExportMenuClose, handleCaseExport,
//     handleOpenCaseDialog, selectedDepartment, selectedCase, handleOpenCaseDetails }) {
//     const theme = useTheme();
//
//
//     const [dateRange, setDateRange] = useState([null, null]); // Начальное состояние диапазона
//
//     const handleDateRangeChange = (newRange) => {
//         setDateRange(newRange); // Обновляем локальное состояние
//         const [startDate, endDate] = newRange || []; // Если newRange null, получаем пустой массив
//         handleDateAddedFromChange(startDate ? startDate.format('YYYY-MM-DD') : null);
//         handleDateAddedToChange(endDate ? endDate.format('YYYY-MM-DD') : null);
//     };
//
//     return (
//         <>
//             {/* Поля поиска и фильтрации */}
//             <Box sx={{ mb: theme.spacing(3) }}>
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         flexWrap: 'wrap',
//                         alignItems: 'center',
//                         gap: theme.spacing(2),
//                         mb: theme.spacing(2),
//                     }}
//                 >
//                     <TextField
//                         label="Поиск по названию, описанию или имени следователя"
//                         variant="outlined"
//                         value={searchQuery}
//                         onChange={handleSearchChange}
//                         size="small"
//                         sx={{ flexGrow: 1 }}
//                         InputProps={{
//                             startAdornment: (
//                                 <InputAdornment position="start">
//                                     <SearchIcon color="action" />
//                                 </InputAdornment>
//                             ),
//                         }}
//                     />
//                     {/*<LocalizationProvider dateAdapter={AdapterDateFns} locale={ru}>*/}
//                     {/*    <DateRangePicker*/}
//                     {/*        startText="Дата от"*/}
//                     {/*        endText="Дата до"*/}
//                     {/*        value={dateRange}*/}
//                     {/*        onChange={handleDateRangeChange}*/}
//                     {/*        renderInput={(startProps, endProps) => (*/}
//                     {/*            <>*/}
//                     {/*                <TextField {...startProps} size="small" />*/}
//                     {/*                <Box sx={{ mx: 2 }}> – </Box>*/}
//                     {/*                <TextField {...endProps} size="small" />*/}
//                     {/*            </>*/}
//                     {/*        )}*/}
//                     {/*    />*/}
//                     {/*</LocalizationProvider>*/}
//                     <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
//                         <DateRangePicker
//                             label="Дата создания от - до"
//                             slots={{ field: SingleInputDateRangeField }}
//                             value={dateRange}
//                             onChange={handleDateRangeChange}
//                             sx={{
//                                 '& .MuiOutlinedInput-root': {
//                                     height: '40px',
//                                 },
//                             }}
//                             // slotProps={{ textField: { InputProps: { endAdornment: <Calendar /> },InputLabelProps: { shrink: true, }, } }}
//                             name="allowedRange"
//                         />
//                     </LocalizationProvider>
//                     {user.role === 'REGION_HEAD' && (
//                         <FormControl sx={{ minWidth: 200 }} variant="outlined" size="small">
//                             <InputLabel id="department-filter-label">Отделение</InputLabel>
//                             <Select
//                                 labelId="department-filter-label"
//                                 value={selectedDepartment}
//                                 onChange={handleDepartmentChange}
//                                 label="Отделение"
//                             >
//                                 <MenuItem value="">
//                                     <em>Все отделения</em>
//                                 </MenuItem>
//                                 {departments.map((dept) => (
//                                     <MenuItem key={dept.id} value={dept.id}>
//                                         {dept.name}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                     )}
//                     <StyledButton
//                         onClick={handleOpenBarcodeDialog}
//                         sx={{ height: '40px' }}
//                     >
//                         Сканировать штрихкод
//                     </StyledButton>
//
//                     {/* Export button with menu */}
//                     <Box sx={{ display: 'flex', gap: theme.spacing(1), ml: 'auto' }}>
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             onClick={handleExportMenuOpen}
//                             startIcon={<GetAppIcon />}
//                             sx={{ height: '40px' }}
//                         >
//                             Экспорт
//                         </Button>
//                         <Menu
//                             anchorEl={exportMenuAnchorEl}
//                             open={Boolean(exportMenuAnchorEl)}
//                             onClose={handleExportMenuClose}
//                         >
//                             <MenuItem onClick={() => handleCaseExport('pdf')}>
//                                 <ListItemIcon>
//                                     <PictureAsPdfIcon fontSize="small" />
//                                 </ListItemIcon>
//                                 <ListItemText>Экспорт PDF</ListItemText>
//                             </MenuItem>
//                             <MenuItem onClick={() => handleCaseExport('excel')}>
//                                 <ListItemIcon>
//                                     <DescriptionIcon fontSize="small" />
//                                 </ListItemIcon>
//                                 <ListItemText>Экспорт Excel</ListItemText>
//                             </MenuItem>
//                         </Menu>
//                     </Box>
//                 </Box>
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         justifyContent: 'space-between',
//                         alignItems: 'center',
//                         flexWrap: 'wrap',
//                         gap: theme.spacing(2),
//                     }}
//                 >
//                     {user.role !== 'REGION_HEAD' ? (
//                         <StyledButton
//                             onClick={handleOpenCaseDialog}
//                             startIcon={<AddIcon />}
//                             sx={{ height: '40px' }}
//                         >
//                             <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Добавить дело</span>
//                         </StyledButton>
//                     ) : (
//                         <Box sx={{ width: 128 }} />
//                     )}
//                     <Box
//                         sx={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: theme.spacing(1),
//                         }}
//                     >
//                         <Tooltip
//                             title={
//                                 selectedCase
//                                     ? selectedCase.active
//                                         ? 'Активно'
//                                         : 'Закрыто'
//                                     : 'Не выбрано'
//                             }
//                             placement="top"
//                         >
//                             <IconButton disabled>
//                                 <CircleIcon
//                                     style={{
//                                         color: selectedCase
//                                             ? selectedCase.active
//                                                 ? theme.palette.success.main
//                                                 : theme.palette.error.main
//                                             : theme.palette.grey[500],
//                                         fontSize: 24,
//                                     }}
//                                 />
//                             </IconButton>
//                         </Tooltip>
//                         <StyledButton
//                             onClick={handleOpenCaseDetails}
//                             startIcon={<OpenInNewIcon />}
//                             sx={{ height: '40px' }}
//                             disabled={!selectedCase}
//                         >
//                             <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
//                         </StyledButton>
//                     </Box>
//                 </Box>
//             </Box>
//
//         </>
//     );
// }
