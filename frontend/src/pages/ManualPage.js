// #ManualPage.js
// #ManualPage.js
import React, { useState } from 'react'
import {
    Avatar,
    Box,
    Button,
    Chip,
    Divider,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
    OpenInNew as OpenInNewIcon,
    CheckCircle as CheckCircleIcon,
    Add as AddIcon,
    Close as CloseIcon,
    Print as PrintIcon,
    GetApp as GetAppIcon,
} from '@mui/icons-material'

import LogoMVDKZ from '../assets/Logo_MVD_KZ.webp';


import Certificate_manual_1 from '../assets/certificate_manual_1.png';
import Certificate_manual_2 from '../assets/certificate_manual_2.png';
import Certificate_manual_3 from '../assets/certificate_manual_3.png';
import Certificate_manual_4 from '../assets/certificate_manual_4.png';
import Certificate_manual_5 from '../assets/certificate_manual_5.png';
import Certificate_manual_6 from '../assets/certificate_manual_6.png';
import Certificate_manual_7 from '../assets/certificate_manual_7.png';
import Certificate_manual_8 from '../assets/certificate_manual_8.png';
import Certificate_manual_9 from '../assets/certificate_manual_9.png';
import Certificate_manual_10 from '../assets/certificate_manual_10.png';

import Cases_manual_1 from '../assets/cases_manual_1.png';
import Cases_manual_2 from '../assets/cases_manual_2.png';
import Cases_manual_3 from '../assets/cases_manual_3.png';
import Cases_manual_4 from '../assets/cases_manual_4.png';
import Cases_manual_5 from '../assets/cases_manual_5.png';
import Cases_manual_6 from '../assets/cases_manual_6.png';

import Cases_manual_1_without_region_head from '../assets/cases_manual_1_without_region_head.png';
import Cases_manual_1_user from '../assets/cases_manual_1_user.png';
import Cases_manual_2_user from '../assets/cases_manual_2_user.png';
import Cases_manual_4_user from '../assets/cases_manual_4_user.png';
import Cases_manual_5_user from '../assets/cases_manual_5_user.png';
import Cases_manual_6_user from '../assets/cases_manual_6_user.png';

import Employees_manual_1 from '../assets/employees_manual_1.png';
import Employees_manual_2 from '../assets/employees_manual_2.png';
import Employees_manual_3 from '../assets/employees_manual_3.png';
import Employees_manual_1_without_region_head from '../assets/employees_manual_1_without_region_head.png';
import Employees_manual_2_without_region_head from '../assets/employees_manual_2_without_region_head.png';
import Employees_manual_3_without_region_head from '../assets/employees_manual_3_without_region_head.png';
import Evidence_manual_1 from '../assets/evidence_manual_1.png';
import Evidence_manual_1_without_region_head from '../assets/evidence_manual_1_without_region_head.png';
import Evidence_manual_1_user from '../assets/evidence_manual_1_user.png';
import Header from '../components/Header';
import { StyledButton } from '../components/ui/StyledComponents';
// import { useReactToPrint } from 'react-to-print';

const Image556 = styled('img')(({ theme }) => ({
    maxWidth: '556px',
    width: '100%',
    height: 'auto',
}));
const Image356 = styled('img')(({ theme }) => ({
    maxWidth: '356px',
    width: '100%',
    height: 'auto',
}));
const Image797 = styled('img')(({ theme }) => ({
    maxWidth: '797px',
    width: '100%',
    height: 'auto',
}));

export const ManualPage = () => {
    const theme = useTheme();
    // const PrintRef = useRef(null)

    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const tabs = [
        { label: 'ГЛАВА РЕГИОНА', content: <></> },
        { label: 'ГЛАВА ОТДЕЛЕНИЯ', content: <></> },
        { label: 'ПОЛЬЗОВАТЕЛЬ', content: <></> },
    ];

    // const handlePrintManual = useReactToPrint({
    //     contentRef: PrintRef,
    //     documentTitle: 'Руководство',
    // });

    return (
        <Box sx={{ backgroundColor: '#E5E8F1', minHeight: '100vh' }}>
            <Header />
            <Box
                sx={{
                    display: 'none', // по умолчанию скрыт
                    '@media print': {
                        display: 'flex', // показываем при печати
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '8px',
                        mb: '1rem' // немного отступа снизу
                    }
                }}
            >
                <img src={LogoMVDKZ} alt="Logo MVD KZ" style={{ height: '20px', width: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Руководство
                </Typography>
            </Box>
            <Box
                sx={{
                    marginTop: theme.spacing(8),
                    pt: theme.spacing(4),
                    pb: theme.spacing(2),
                    width: '98vw',
                    maxWidth: '1440px',
                    mx: 'auto',
                    '@media print': {
                        margin: 0,
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: "flex-start",
                        gap: theme.spacing(11),
                        mb: theme.spacing(2),
                    }}
                >
                    {/* Левая колонка с кнопками-ссылками */}
                    <Box
                        sx={{
                            mt: '0.5rem',
                            display: 'flex',
                            flexDirection: "column",
                            gap: theme.spacing(12),
                            position: 'sticky',
                            top: theme.spacing(20),
                            // При необходимости можно подкорректировать top, чтобы учесть высоту шапки
                            zIndex: 999,
                            '@media print': {
                                display: 'none !important',
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }} >
                            <Button component="a" href={`#cases`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Дела
                            </Button>
                            {tabValue !== 2 && (
                                <Button component="a" href={`#employees`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                    Сотрудники
                                </Button>
                            )}
                            <Button component="a" href={`#searchevidence`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Поиск вещдоков
                            </Button>
                            <Button component="a" href={`#certificate`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Установка сертификата
                            </Button>

                            {/* <Divider sx={{ borderColor: '#000000', my: '0.5rem', width: "100%" }} />
                            {/* <Button component="a" href={`${process.env.REACT_APP_BACKEND_URL}api/download/manualKZ/`} download sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Скачать руководство KZ
                            </Button> */}
                            {/* <Button component="a" href={`${process.env.REACT_APP_BACKEND_URL}api/download/manualRU/`} download sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Скачать руководство RU
                            </Button> */}
                        </Box>
                    </Box>

                    {/* Центральная колонка с основным контентом - центрируем */}
                    <Box
                        className="print-container"
                        sx={{
                            display: 'flex',
                            flexDirection: "column",
                            justifyContent: "center",
                            flex: 2,
                            flexGrow: 1,
                            width: "100%",
                            // maxWidth: "797px",
                            alignItems: 'flex-start',
                            gap: theme.spacing(4),
                            mb: theme.spacing(2),
                            mx: 'auto', // Центрируем по горизонтали
                            '@media print': {
                                // maxWidth: '500px',
                                mx: "auto",
                            }
                        }}
                    >

                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            sx={{
                                alignSelf: 'center', width: '35vw', '@media print': {
                                    width: '100vw',
                                    mx: "auto",
                                }
                            }}
                            TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
                            textColor="inherit"
                        >
                            {tabs.map((tab, index) => (
                                <Tab key={index} label={tab.label} />
                            ))}
                        </Tabs>
                        {/* MainContainer */}
                        <Box sx={{ width: '100%' }} id="cases">
                            <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
                                <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>1</Avatar>
                                <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Дела"</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ maxWidth: "797px" }}>
                                        {tabValue === 0 &&
                                            <Image797 src={Cases_manual_1} alt="Cases_manual_1" />
                                        }
                                        {tabValue === 1 &&
                                            <Image797 src={Cases_manual_1_without_region_head} alt="Cases_manual_1" />
                                        }
                                        {tabValue === 2 &&
                                            <Image797 src={Cases_manual_1_user} alt="Cases_manual_1" />
                                        }
                                    </Box>
                                    <Box sx={{ width: '12.5rem' }}>
                                        <StyledButton
                                            sx={{ fontSize: '12px', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                            disabled
                                        >
                                            Сканировать штрихкод
                                        </StyledButton>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Сканировать штрихкод" открывает окно ввода или сканирования штрихкода для поиска конкретного дела</Typography>

                                        <Button
                                            variant="contained"
                                            disabled
                                            startIcon={<GetAppIcon />}
                                            sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                        >
                                            Экспорт
                                        </Button>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Экспорт" позволяет экспортировать данные из таблицы дел. Доступные форматы: PDF / Excel</Typography>
                                        {tabValue !== 0 && (
                                            <>
                                                <StyledButton
                                                    startIcon={<AddIcon />}
                                                    sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                                >
                                                    <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Добавить дело</span>
                                                </StyledButton>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Добавить дело" позволяет создать новое дело.</Typography>
                                            </>)}

                                        <StyledButton
                                            startIcon={<OpenInNewIcon />}
                                            sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                            disabled
                                        >
                                            <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
                                        </StyledButton>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Открыть дело" становится активной только при выделении одного дела в таблице. Открывает детализированную информацию о выбранном деле</Typography>

                                    </Box>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14), '@media print': { gap: theme.spacing(6) } }}>
                                    <Box sx={{ maxWidth: "797px", '@media print': { maxWidth: "797px" } }}>
                                        {(tabValue === 0 || tabValue === 1) &&
                                            <Image797 src={Cases_manual_2} sx={{ mb: '1px' }} alt="Cases_manual_2" />
                                        }
                                        {tabValue === 2 &&
                                            <Image797 src={Cases_manual_2_user} alt="Cases_manual_2" />
                                        }
                                        <Image797 src={Cases_manual_3} sx={{ mb: '1px' }} alt="Cases_manual_3" />

                                    </Box >
                                    <Box sx={{ width: '12.5rem', '@media print': { width: '14rem' } }}>
                                        <StyledButton
                                            startIcon={<OpenInNewIcon />}
                                            sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#0d47a1 !important', height: '33px', opacity: '1 !important' }}
                                            disabled
                                        >
                                            <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
                                        </StyledButton>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>После нажатия открывается вкладка "Детали дела", которая состоит из трех разделов: Информация, вещдоки, история изменений</Typography>
                                        <Typography sx={{ mt: "18px", alignSelf: 'center' }}>Кнопки "Экспорт Excel" и "Экспорт PDF" создает отчет о деле в соответствующих форматах</Typography>
                                        {tabValue !== 2 && (<>
                                            <StyledButton
                                                sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                                disabled
                                                startIcon={<CheckCircleIcon />}
                                            >
                                                <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Переназначить дело'}</span>
                                            </StyledButton>

                                            <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка позволяет изменить ответственного сотрудника или отделение, которое курирует данное дело</Typography>
                                        </>
                                        )}
                                        {tabValue === 2 && (
                                            <>
                                                <StyledButton
                                                    sx={{
                                                        fontSize: '12px',
                                                        backgroundColor: theme.palette.error.main + '!important',
                                                        height: '33px',
                                                        mt: '1rem',
                                                        opacity: '1 !important',
                                                        '&:hover': {
                                                            backgroundColor: theme.palette.error.dark
                                                        },
                                                    }}
                                                    disabled
                                                    startIcon={<CloseIcon />}
                                                >
                                                    <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Закрыть'}</span>
                                                </StyledButton>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Красная кнопка "Закрыть дело" завершает работу над текущим делом и переводит его в статус "Закрыто". При этом дело становится неактивным, но не удаляется.</Typography>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Если необходимо возобновить работу, на месте красной кнопки появляется зелёная кнопка "Активировать". Нажатие на неё возвращает дело в статус "Активно", и его можно снова редактировать и просматривать.</Typography>

                                            </>
                                        )}

                                    </Box>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: "797px" }}>
                                        {(tabValue === 0 || tabValue === 1) &&
                                            <Image797 src={Cases_manual_4} alt="Cases_manual_4" />
                                        }
                                        {tabValue === 2 &&
                                            <Image797 src={Cases_manual_4_user} alt="Cases_manual_4" />
                                        }
                                        {/* Стрелка */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: tabValue === 2 ? "18%" : '28%',
                                                left: '98%',
                                                transform: 'translateY(-50%)',
                                                width: '120px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography sx={{ width: '12.5rem', alignSelf: 'center' }}>Вкладка "Вещдоки"
                                        При нажатии на стрелку в правой части панели список разворачивается, предоставляя более подробную информацию</Typography>

                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: "797px" }}>
                                        {(tabValue === 0 || tabValue === 1) &&
                                            <Image797 src={Cases_manual_5} alt="Cases_manual_5" />
                                        }
                                        {tabValue === 2 &&
                                            <Image797 src={Cases_manual_5_user} alt="Cases_manual_5" />
                                        }

                                        {/* Стрелка */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: tabValue === 2 ? "50%" : '58%',
                                                left: '95%',
                                                transform: 'translateY(-50%)',
                                                width: '145px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography sx={{ width: '12.5rem', alignSelf: 'center' }}>При нажатии на кнопку система отображает штрихкод на экране, который можно распечатать. Штрихкод служит для идентификации вещественного доказательства в процессе хранения или перемещения</Typography>

                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', maxWidth: "797px" }}>
                                        {(tabValue === 0 || tabValue === 1) &&
                                            <Image797 src={Cases_manual_6} alt="Cases_manual_6" />
                                        }
                                        {tabValue === 2 &&
                                            <Image797 src={Cases_manual_6_user} alt="Cases_manual_6" />
                                        }
                                        {/* Стрелка */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '65%',
                                                left: '95%',
                                                transform: 'translateY(-50%)',
                                                width: '145px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography sx={{ width: '12.5rem', alignSelf: 'center' }}>Вкладка "История изменений"
                                        На данной вкладке отображается полный хронологический список изменений, внесенных в дело, что обеспечивает прозрачность его обработки</Typography>

                                </Box>
                            </Box>
                        </Box>
                        {tabValue !== 2 &&
                            <>
                                <Divider variant="middle" sx={{
                                    borderColor: '#000000', my: '2rem', width: '60vw', zIndex: 9999, '@media print': {
                                        width: "100vw"
                                    }
                                }} />
                                <Box sx={{ width: '100%', '@media print': { 'break-before': 'page' } }} id="employees">
                                    <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
                                        <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>2</Avatar>
                                        <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Сотрудники"</Typography>
                                    </Box>
                                    <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3), position: 'relative' }}>
                                        <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                            <Box sx={{ maxWidth: "797px" }}>
                                                {tabValue === 0 ?
                                                    <Image797 src={Employees_manual_1} alt="Employees_manual_1" />
                                                    :
                                                    <Image797 src={Employees_manual_1_without_region_head} alt="Employees_manual_1" />
                                                }
                                            </Box>
                                            <Box sx={{ width: '12.5rem' }}>
                                                <Button
                                                    variant="contained"
                                                    disabled
                                                    startIcon={<GetAppIcon />}
                                                    sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                                >
                                                    Экспорт
                                                </Button>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Формирует отчет со списком сотрудников Excel или PDF формате</Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    disabled
                                                    sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important', '@media print': { fontSize: '10px' } }}
                                                >
                                                    Добавить сотрудника
                                                </Button>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Новый сотрудник добавляется в список и становится активным пользователем системы</Typography>
                                            </Box>
                                        </Box>
                                        <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                        <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                            <Box sx={{ maxWidth: "797px" }}>
                                                {tabValue === 0 ?
                                                    <Image797 src={Employees_manual_2} alt="Employees_manual_2" />
                                                    :
                                                    <Image797 src={Employees_manual_2_without_region_head} alt="Employees_manual_2" />
                                                }
                                            </Box>
                                            <Box sx={{ width: '12.5rem' }}>
                                                <Button
                                                    variant="contained"
                                                    disabled
                                                    color={'error'}
                                                    sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#C61A25 !important', height: '33px', opacity: '1 !important' }}
                                                >
                                                    {'Деактивировать'}
                                                </Button>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>При выделении конкретного сотрудника кнопка "Деактивировать" становится доступной.
                                                    Нажатие на кнопку лишает сотрудника возможности войти в систему.
                                                    Повторное нажатие на кнопку (если она активируется) восстанавливает доступ</Typography>
                                                <Chip
                                                    label={`Всего: 0`}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '28px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Общее количество дел, связанных с сотрудником</Typography>
                                                <Chip
                                                    label={`Открыто: 0`}
                                                    color="success"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '22px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Количество дел, которые находятся в активной работе</Typography>
                                                <Chip
                                                    label={`Закрыто: 0`}
                                                    color="error"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '22px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Количество завершенных дел</Typography>
                                            </Box>
                                        </Box>
                                        <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                        <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                            <Box sx={{ maxWidth: "797px" }}>
                                                {tabValue === 0 ?
                                                    <Image797 src={Employees_manual_3} alt="Employees_manual_3" />
                                                    :
                                                    <Image797 src={Employees_manual_3_without_region_head} alt="Employees_manual_3" />
                                                }
                                            </Box>
                                            <Box sx={{ width: '12.5rem' }}>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>
                                                    <strong>Колонка "Сессии"</strong>
                                                    <p style={{ marginTop: 0 }}>В этой колонке отображается информация о действиях сотрудника на платформе</p>
                                                </Typography>
                                                <Chip
                                                    label={'16.11.2024 13:13'}
                                                    color={'primary'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '22px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Дата и время начала сессии (вход на платформу)</Typography>
                                                <Chip
                                                    label={'16.11.2024 13:13'}
                                                    color={'secondary'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '28px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Дата и время завершения сессии (выход с платформы или завершение активности)</Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </>
                        }
                        <Divider variant="middle" sx={{
                            borderColor: '#000000', my: '2rem', width: '60vw', zIndex: 9999, '@media print': {
                                width: "100vw"
                            }
                        }} />
                        <Box sx={{ width: '100%', '@media print': { 'break-before': 'page' } }} id="searchevidence">
                            <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
                                <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>3</Avatar>
                                <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Поиск вещдоков"</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ maxWidth: "797px" }}>
                                        {tabValue === 0 &&
                                            <Image797 src={Evidence_manual_1} alt="Evidence_manual_1" />
                                        }
                                        {tabValue === 1 &&
                                            <Image797 src={Evidence_manual_1_without_region_head} alt="Evidence_manual_1" />
                                        }
                                        {tabValue === 2 &&
                                            <Image797 src={Evidence_manual_1_user} alt="Evidence_manual_1" />
                                        }
                                    </Box>
                                    <Box sx={{ width: '12.5rem' }}>
                                        <Button
                                            variant="contained"
                                            disabled
                                            startIcon={<GetAppIcon />}
                                            sx={{ fontSize: '12px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                        >
                                            Экспорт
                                        </Button>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Формирует отчет по найденным вещественным доказательствам в Excel или PDF формате</Typography>

                                        <Box sx={{ mt: '28px', ml: '-14px' }}>
                                            <Box sx={{ display: 'flex', gap: theme.spacing(0.5) }}>
                                                <OpenInNewIcon color='primary' />
                                                <Typography sx={{ alignSelf: 'center' }}>Открывает вкладку "Детали дела", связанного с конкретным вещественным доказательством.</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
                                                <GetAppIcon color='primary' />
                                                <Typography sx={{ alignSelf: 'center' }}>Раздел "Действия"
                                                    Нажатие на иконку загрузки позволяет скачать связанный с вещ. док-вом документ
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
                                                <PrintIcon color='primary' />
                                                <Typography sx={{ alignSelf: 'center' }}>Нажатие на иконку принтера генерирует изображение штрихкода, которое можно сразу отправить на печать</Typography>
                                            </Box>
                                        </Box>

                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                        <Divider variant="middle" sx={{
                            borderColor: '#000000', my: '2rem', width: '60vw', zIndex: 9999, '@media print': {
                                width: "100vw"
                            }
                        }} />
                        <Box sx={{ width: '100%', pb: theme.spacing(36), '@media print': { 'break-before': 'page' } }} id="certificate">
                            <Box sx={{ display: "flex", gap: theme.spacing(2.5), width: '35vw' }}>
                                <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>4</Avatar>
                                <Typography variant="h5" sx={{ alignSelf: 'center' }}>Инструкция по устранению ошибки "Подключение не защищено" для доступа к платформе</Typography>
                            </Box>
                            <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image556 src={Certificate_manual_1} alt="Certificate_manual_1" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '84px',
                                                left: '20%',
                                                transform: 'translateY(-50%)',
                                                width: '746px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "690px" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "4rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        Нажмите кнопку «Дополнительные»
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image556 src={Certificate_manual_2} alt="Certificate_manual_2" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '43px',
                                                left: '30%',
                                                transform: 'translateY(-50%)',
                                                width: '666px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { left: '33%', width: "580px" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "0.7rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        В раскрытом меню нажмите на ссылку «Перейти на сайт»
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                {/* Далее все картинки и стрелки без изменений, т.к. изменения в них не требовались */}
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image556 src={Certificate_manual_3} alt="Certificate_manual_3" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '82px',
                                                left: '43%',
                                                transform: 'translateY(-50%)',
                                                width: '561px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "480px", left: "48%" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "0.7rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        На экране входа в систему найдите ссылку для загрузки сертификата. Нажмите на нее, чтобы скачать файл certificate.crt
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image556 src={Certificate_manual_4} alt="Certificate_manual_4" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '72px',
                                                left: '63%',
                                                transform: 'translateY(-50%)',
                                                width: '401px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "301px", left: '69%' }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "1.7rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        Перейдите в папку загрузок и откройте скачанный файл сертификата certificate.crt.
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image556 src={Certificate_manual_5} alt="Certificate_manual_5" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '41%',
                                                left: '66%',
                                                transform: 'translateY(-50%)',
                                                width: '376px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "406px", left: "57%" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "center",
                                            mb: "-4rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        Появится окно с предупреждением системы безопасности. Нажмите кнопку «Открыть»
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image556 src={Certificate_manual_6} alt="Certificate_manual_6" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '19.5%',
                                                left: '39%',
                                                transform: 'translateY(-50%)',
                                                width: '596px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "500px", left: "43%" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "6.5rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        Нажмите «Установить». Откроется Мастер импорта сертификатов
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image556 src={Certificate_manual_7} alt="Certificate_manual_7" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '6.5%',
                                                left: '57%',
                                                transform: 'translateY(-50%)',
                                                width: '451px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "364px", left: "63.5%" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "-1rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        Выберите расположение хранилища «Локальный компьютер» и нажмите  «Далее»
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image356 src={Certificate_manual_8} alt="Certificate_manual_8" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '6.5%',
                                                left: '36.5%',
                                                transform: 'translateY(-50%)',
                                                width: '616px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "492px", left: "42%" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "0.7rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        В мастере выберите параметр «Автоматически выбрать хранилище на основе типа сертификата» и нажмите «Далее»
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image356 src={Certificate_manual_9} alt="Certificate_manual_9" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '6.5%',
                                                left: '37%',
                                                transform: 'translateY(-50%)',
                                                width: '611px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "510px", left: "41%" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Typography
                                        sx={{
                                            alignSelf: "flex-end",
                                            mb: "0.7rem",
                                            width: '12.5rem',
                                        }}
                                    >
                                        Нажмите кнопку «Готово» для завершения процесса установки сертификата
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ position: 'relative', display: 'inline-block', width: "797px" }}>
                                        <Image356 src={Certificate_manual_10} alt="Certificate_manual_10" />
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '18%',
                                                left: '42%',
                                                transform: 'translateY(-50%)',
                                                width: '571px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
                                                pageBreakInside: 'avoid', /* чтобы не разрезать элемент стрелки при переносе */
                                                '-webkit-print-color-adjust': 'exact',
                                                'print-color-adjust': 'exact',
                                                '@media print': { width: "485px", left: "46%" }
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '0',
                                                    transform: 'translateY(-50%)',
                                                    width: '0',
                                                    height: '0',
                                                    borderLeft: '10px solid #175FC7',
                                                    borderTop: '5px solid transparent',
                                                    borderBottom: '5px solid transparent',
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ alignSelf: "flex-end" }}>
                                        <Typography
                                            sx={{
                                                alignSelf: "flex-end",
                                                mb: "0.7rem",
                                                width: '12.5rem',
                                            }}
                                        >
                                            Появится сообщение «Импорт успешно выполнен», подтверждающее завершение процедуры
                                        </Typography>
                                        <Typography sx={{ width: '12.5rem' }}>
                                            Теперь вы можете без проблем открыть сайт, авторизоваться и использовать платформу
                                        </Typography>
                                    </Box>
                                </Box>

                            </Box>
                        </Box>
                        {/* Стили для печати */}
                        <style type="text/css" media="print">
                            {`
                            @page {
                                size: A4 landscape;
                                margin: 12mm;
                            }

                            body {
                                margin: 0;
                                padding: 0;
                            }

                            .content {
                                margin-bottom: 20px;
                            }
                            .print-container { 
                                transform: scale(0.9); 
                                transform-origin: top left;
                                /* Можно настроить поля или отступы вокруг, если нужно */
                            }
                        `}
                        </style>
                    </Box>
                </Box>
            </Box>
        </Box >
    )
}
// import React, { useState } from 'react'
// import {
//     Avatar,
//     Box,
//     Button,
//     Chip,
//     Tab,
//     Tabs,
//     Typography,
// } from '@mui/material';
// import { styled, useTheme } from '@mui/material/styles';
// import {
//     OpenInNew as OpenInNewIcon,
//     CheckCircle as CheckCircleIcon,
//     Add as AddIcon,
//     Close as CloseIcon,
//     Print as PrintIcon,
//     GetApp as GetAppIcon,
// } from '@mui/icons-material'
// import Certificate_manual_1 from '../assets/certificate_manual_1.png';
// import Certificate_manual_2 from '../assets/certificate_manual_2.png';
// import Certificate_manual_3 from '../assets/certificate_manual_3.png';
// import Certificate_manual_4 from '../assets/certificate_manual_4.png';
// import Certificate_manual_5 from '../assets/certificate_manual_5.png';
// import Certificate_manual_6 from '../assets/certificate_manual_6.png';
// import Certificate_manual_7 from '../assets/certificate_manual_7.png';
// import Certificate_manual_8 from '../assets/certificate_manual_8.png';
// import Certificate_manual_9 from '../assets/certificate_manual_9.png';
// import Certificate_manual_10 from '../assets/certificate_manual_10.png';

// import Cases_manual_1 from '../assets/cases_manual_1.png';
// import Cases_manual_2 from '../assets/cases_manual_2.png';
// import Cases_manual_3 from '../assets/cases_manual_3.png';
// import Cases_manual_4 from '../assets/cases_manual_4.png';
// import Cases_manual_5 from '../assets/cases_manual_5.png';
// import Cases_manual_6 from '../assets/cases_manual_6.png';

// import Cases_manual_1_without_region_head from '../assets/cases_manual_1_without_region_head.png';
// import Cases_manual_1_user from '../assets/cases_manual_1_user.png';
// import Cases_manual_2_user from '../assets/cases_manual_2_user.png';
// import Cases_manual_4_user from '../assets/cases_manual_4_user.png';
// import Cases_manual_5_user from '../assets/cases_manual_5_user.png';
// import Cases_manual_6_user from '../assets/cases_manual_6_user.png';

// import Employees_manual_1 from '../assets/employees_manual_1.png';
// import Employees_manual_2 from '../assets/employees_manual_2.png';
// import Employees_manual_3 from '../assets/employees_manual_3.png';
// import Employees_manual_1_without_region_head from '../assets/employees_manual_1_without_region_head.png';
// import Employees_manual_2_without_region_head from '../assets/employees_manual_2_without_region_head.png';
// import Employees_manual_3_without_region_head from '../assets/employees_manual_3_without_region_head.png';
// import Evidence_manual_1 from '../assets/evidence_manual_1.png';
// import Evidence_manual_1_without_region_head from '../assets/evidence_manual_1_without_region_head.png';
// import Evidence_manual_1_user from '../assets/evidence_manual_1_user.png';
// import Header from '../components/Header';
// import { StyledButton } from '../components/ui/StyledComponents';

// const Image556 = styled('img')(({ theme }) => ({
//     maxWidth: '556px',
//     width: '100%',
//     height: 'auto',
// }));
// const Image356 = styled('img')(({ theme }) => ({
//     maxWidth: '356px',
//     width: '100%',
//     height: 'auto',
// }));
// const Image797 = styled('img')(({ theme }) => ({
//     maxWidth: '797px',
//     width: '100%',
//     height: 'auto',
// }));

// export const ManualPage = () => {
//     const theme = useTheme();

//     const [tabValue, setTabValue] = useState(0);

//     const handleTabChange = (event, newValue) => {
//         setTabValue(newValue);
//     };

//     const tabs = [
//         { label: 'ГЛАВА РЕГИОНА', content: <></> },
//         { label: 'ГЛАВА ОТДЕЛЕНИЯ', content: <></> },
//         { label: 'ПОЛЬЗОВАТЕЛЬ', content: <></> },
//     ];

//     return (
//         <Box sx={{ backgroundColor: '#E5E8F1', minHeight: '100vh' }}>
//             <Header />

//             <Box
//                 sx={{
//                     marginTop: theme.spacing(8),
//                     pt: theme.spacing(4),
//                     pb: theme.spacing(2),
//                     width: '98vw',
//                     maxWidth: '1440px',
//                     mx: 'auto'
//                 }}
//             >
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         alignItems: "flex-start",
//                         gap: theme.spacing(11),
//                         mb: theme.spacing(2),
//                     }}
//                 >
//                     {/* Левая колонка с кнопками-ссылками */}
//                     <Box
//                         sx={{
//                             mt: '0.5rem',
//                             display: 'flex',
//                             flexDirection: "column",
//                             gap: theme.spacing(12),
//                             position: 'sticky',
//                             top: theme.spacing(10),
//                             // При необходимости можно подкорректировать top, чтобы учесть высоту шапки
//                             zIndex: 999
//                         }}
//                     >
//                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }} >
//                             <Button component="a" href={`#cases`} sx={{ p: 0, justifyContent: 'flex-start' }}>
//                                 Дела
//                             </Button>
//                             {tabValue !== 2 && (
//                                 <Button component="a" href={`#employees`} sx={{ p: 0, justifyContent: 'flex-start' }}>
//                                     Сотрудники
//                                 </Button>
//                             )}
//                             <Button component="a" href={`#searchevidence`} sx={{ p: 0, justifyContent: 'flex-start' }}>
//                                 Поиск вещдоков
//                             </Button>
//                             <Button component="a" href={`#certificate`} sx={{ p: 0, justifyContent: 'flex-start' }}>
//                                 Установка сертификата
//                             </Button>
//                         </Box>
//                     </Box>

//                     {/* Центральная колонка с основным контентом - центрируем */}
//                     <Box
//                         sx={{
//                             display: 'flex',
//                             flexDirection: "column",
//                             justifyContent: "center",
//                             flex: 1,
//                             maxWidth: "797px",
//                             alignItems: 'flex-start',
//                             gap: theme.spacing(4),
//                             mb: theme.spacing(2),
//                             mx: 'auto' // Центрируем по горизонтали
//                         }}
//                     >
//                         <Tabs
//                             value={tabValue}
//                             onChange={handleTabChange}
//                             sx={{ alignSelf: 'center', width: '35vw' }}
//                             TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
//                             textColor="inherit"
//                         >
//                             {tabs.map((tab, index) => (
//                                 <Tab key={index} label={tab.label} />
//                             ))}
//                         </Tabs>
//                         {/* MainContainer */}
//                         <Box sx={{ width: '100%' }} id="cases">
//                             <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
//                                 <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>1</Avatar>
//                                 <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Дела"</Typography>
//                             </Box>
//                             <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: tabValue === 2 ? '420px' : '360px' }}>
//                                     {tabValue === 0 &&
//                                         <Image797 src={Cases_manual_1} alt="Cases_manual_1" />
//                                     }
//                                     {tabValue === 1 &&
//                                         <Image797 src={Cases_manual_1_without_region_head} alt="Cases_manual_1" />
//                                     }
//                                     {tabValue === 2 &&
//                                         <Image797 src={Cases_manual_1_user} alt="Cases_manual_1" />
//                                     }
//                                     <Box sx={{ position: 'absolute', top: "40px", right: '-253px', width: '12.5rem' }}>
//                                         <StyledButton
//                                             sx={{ fontSize: '12px', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
//                                             disabled
//                                         >
//                                             Сканировать штрихкод
//                                         </StyledButton>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Сканировать штрихкод" открывает окно ввода или сканирования штрихкода для поиска конкретного дела</Typography>

//                                         <Button
//                                             variant="contained"
//                                             disabled
//                                             startIcon={<GetAppIcon />}
//                                             sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
//                                         >
//                                             Экспорт
//                                         </Button>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Экспорт" позволяет экспортировать данные из таблицы дел. Доступные форматы: PDF / Excel</Typography>
//                                         {tabValue !== 0 && (
//                                             <>
//                                                 <StyledButton
//                                                     startIcon={<AddIcon />}
//                                                     sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
//                                                 >
//                                                     <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Добавить дело</span>
//                                                 </StyledButton>
//                                                 <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Добавить дело" позволяет создать новое дело.</Typography>
//                                             </>)}

//                                         <StyledButton
//                                             startIcon={<OpenInNewIcon />}
//                                             sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
//                                             disabled
//                                         >
//                                             <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
//                                         </StyledButton>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Открыть дело" становится активной только при выделении одного дела в таблице. Открывает детализированную информацию о выбранном деле</Typography>

//                                     </Box>
//                                 </Box>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: tabValue === 2 ? '320px' : '68px' }}>
//                                     <div>
//                                         {(tabValue === 0 || tabValue === 1) &&
//                                             <Image797 src={Cases_manual_2} sx={{ mb: '1px' }} alt="Cases_manual_2" />
//                                         }
//                                         {tabValue === 2 &&
//                                             <Image797 src={Cases_manual_2_user} alt="Cases_manual_2" />
//                                         }
//                                         <Image797 src={Cases_manual_3} sx={{ mb: '1px' }} alt="Cases_manual_3" />

//                                     </div>
//                                     <Box sx={{ position: 'absolute', top: "40px", right: '-253px', width: '12.5rem' }}>
//                                         <StyledButton
//                                             startIcon={<OpenInNewIcon />}
//                                             sx={{ mt: '28px', color: '#ffffff !important', backgroundColor: '#0d47a1 !important', height: '40px', opacity: '1 !important' }}
//                                             disabled
//                                         >
//                                             <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
//                                         </StyledButton>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>После нажатия открывается вкладка "Детали дела", которая состоит из трех разделов: Информация, вещдоки, история изменений</Typography>
//                                         <Typography sx={{ mt: "18px", alignSelf: 'center' }}>Кнопки "Экспорт Excel" и "Экспорт PDF" создает отчет о деле в соответствующих форматах</Typography>
//                                         {tabValue !== 2 && (<>
//                                                 <StyledButton
//                                                     sx={{ mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '40px', opacity: '1 !important' }}
//                                                     disabled
//                                                     startIcon={<CheckCircleIcon />}
//                                                 >
//                                                     <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Переназначить дело'}</span>
//                                                 </StyledButton>

//                                                 <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка позволяет изменить ответственного сотрудника или отделение, которое курирует данное дело</Typography>
//                                             </>
//                                         )}
//                                         {tabValue === 2 && (
//                                             <>
//                                                 <StyledButton
//                                                     sx={{
//                                                         backgroundColor: theme.palette.error.main + '!important',
//                                                         height: '40px',
//                                                         mt: '1rem',
//                                                         opacity: '1 !important',
//                                                         '&:hover': {
//                                                             backgroundColor: theme.palette.error.dark
//                                                         },
//                                                     }}
//                                                     disabled
//                                                     startIcon={<CloseIcon />}
//                                                 >
//                                                     <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Закрыть'}</span>
//                                                 </StyledButton>
//                                                 <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Красная кнопка "Закрыть дело" завершает работу над текущим делом и переводит его в статус "Закрыто". При этом дело становится неактивным, но не удаляется.</Typography>
//                                                 <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Если необходимо возобновить работу, на месте красной кнопки появляется зелёная кнопка "Активировать". Нажатие на неё возвращает дело в статус "Активно", и его можно снова редактировать и просматривать.</Typography>

//                                             </>
//                                         )}

//                                     </Box>
//                                 </Box>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         {(tabValue === 0 || tabValue === 1) &&
//                                             <Image797 src={Cases_manual_4} alt="Cases_manual_4" />
//                                         }
//                                         {tabValue === 2 &&
//                                             <Image797 src={Cases_manual_4_user} alt="Cases_manual_4" />
//                                         }
//                                         {/* Стрелка */}
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: tabValue === 2 ? "18%" : '28%',
//                                                 left: '98%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '59px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography sx={{ position: "absolute", bottom: "-15px", right: '-253px', width: '12.5rem', alignSelf: 'center' }}>Вкладка "Вещдоки"
//                                         При нажатии на стрелку в правой части панели список разворачивается, предоставляя более подробную информацию</Typography>

//                                 </Box>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         {(tabValue === 0 || tabValue === 1) &&
//                                             <Image797 src={Cases_manual_5} alt="Cases_manual_5" />
//                                         }
//                                         {tabValue === 2 &&
//                                             <Image797 src={Cases_manual_5_user} alt="Cases_manual_5" />
//                                         }

//                                         {/* Стрелка */}
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: tabValue === 2 ? "50%" : '58%',
//                                                 left: '95%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '80px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography sx={{ position: "absolute", bottom: "40px", right: '-253px', width: '12.5rem', alignSelf: 'center' }}>При нажатии на кнопку система отображает штрихкод на экране, который можно распечатать. Штрихкод служит для идентификации вещественного доказательства в процессе хранения или перемещения</Typography>

//                                 </Box>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         {(tabValue === 0 || tabValue === 1) &&
//                                             <Image797 src={Cases_manual_6} alt="Cases_manual_6" />
//                                         }
//                                         {tabValue === 2 &&
//                                             <Image797 src={Cases_manual_6_user} alt="Cases_manual_6" />
//                                         }
//                                         {/* Стрелка */}
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '65%',
//                                                 left: '95%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '80px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography sx={{ position: "absolute", bottom: "120px", right: '-253px', width: '12.5rem', alignSelf: 'center' }}>Вкладка "История изменений"
//                                         На данной вкладке отображается полный хронологический список изменений, внесенных в дело, что обеспечивает прозрачность его обработки</Typography>

//                                 </Box>
//                             </Box>
//                         </Box>
//                         {tabValue !== 2 && <Box sx={{ width: '100%' }} id="employees">
//                             <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
//                                 <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>2</Avatar>
//                                 <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Сотрудники"</Typography>
//                             </Box>
//                             <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3), position: 'relative' }}>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
//                                     {tabValue === 0 ?
//                                         <Image797 src={Employees_manual_1} alt="Employees_manual_1" />
//                                         :
//                                         <Image797 src={Employees_manual_1_without_region_head} alt="Employees_manual_1" />
//                                     }

//                                     <Box sx={{ position: 'absolute', top: "20px", right: '-253px', width: '12.5rem' }}>
//                                         <Button
//                                             variant="contained"
//                                             disabled
//                                             startIcon={<GetAppIcon />}
//                                             sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
//                                         >
//                                             Экспорт
//                                         </Button>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Формирует отчет со списком сотрудников Excel или PDF формате</Typography>
//                                         <Button
//                                             variant="contained"
//                                             color="primary"
//                                             disabled
//                                             sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
//                                         >
//                                             Добавить сотрудника
//                                         </Button>

//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Новый сотрудник добавляется в список и становится активным пользователем системы</Typography>

//                                     </Box>
//                                 </Box>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: '250px' }}>
//                                     {tabValue === 0 ?
//                                         <Image797 src={Employees_manual_2} alt="Employees_manual_2" />
//                                         :
//                                         <Image797 src={Employees_manual_2_without_region_head} alt="Employees_manual_2" />
//                                     }

//                                     <Box sx={{ position: 'absolute', top: "20px", right: '-253px', width: '12.5rem' }}>
//                                         <Button
//                                             variant="contained"
//                                             disabled
//                                             color={'error'}
//                                             sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#C61A25 !important', height: '33px', opacity: '1 !important' }}
//                                         >
//                                             {'Деактивировать'}
//                                         </Button>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>При выделении конкретного сотрудника кнопка "Деактивировать" становится доступной.
//                                             Нажатие на кнопку лишает сотрудника возможности войти в систему.
//                                             Повторное нажатие на кнопку (если она активируется) восстанавливает доступ</Typography>

//                                         <Chip
//                                             label={`Всего: 0`}
//                                             color="primary"
//                                             size="small"
//                                             sx={{ fontWeight: 'bold', mt: '28px' }}
//                                         />
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Общее количество дел, связанных с сотрудником</Typography>
//                                         <Chip
//                                             label={`Открыто: 0`}
//                                             color="success"
//                                             size="small"
//                                             sx={{ fontWeight: 'bold', mt: '22px' }}
//                                         />
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Количество дел, которые находятся в активной работе</Typography>
//                                         <Chip
//                                             label={`Закрыто: 0`}
//                                             color="error"
//                                             size="small"
//                                             sx={{ fontWeight: 'bold', mt: '22px' }}
//                                         />
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Количество завершенных дел</Typography>

//                                     </Box>
//                                 </Box>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: '128px' }}>
//                                     {tabValue === 0 ?
//                                         <Image797 src={Employees_manual_3} alt="Employees_manual_3" />
//                                         :
//                                         <Image797 src={Employees_manual_3_without_region_head} alt="Employees_manual_3" />
//                                     }

//                                     <Box sx={{ position: 'absolute', top: "20px", right: '-253px', width: '12.5rem' }}>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>
//                                             <strong>Колонка "Сессии"</strong>
//                                             <p style={{ marginTop: 0 }}>В этой колонке отображается информация о действиях сотрудника на платформе</p>
//                                         </Typography>

//                                         <Chip
//                                             label={'16.11.2024 13:13'}
//                                             color={'primary'}
//                                             size="small"
//                                             sx={{ fontWeight: 'bold', mt: '22px' }}
//                                         />

//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Дата и время начала сессии (вход на платформу)</Typography>
//                                         <Chip
//                                             label={'16.11.2024 13:13'}
//                                             color={'secondary'}
//                                             size="small"
//                                             sx={{ fontWeight: 'bold', mt: '28px' }}
//                                         />

//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Дата и время завершения сессии (выход с платформы или завершение активности)</Typography>

//                                     </Box>
//                                 </Box>
//                             </Box>
//                         </Box>}
//                         <Box sx={{ width: '100%' }} id="searchevidence">
//                             <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
//                                 <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>3</Avatar>
//                                 <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Поиск вещдоков"</Typography>
//                             </Box>
//                             <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
//                                 <Box sx={{ position: 'relative', display: 'inline-block', mb: '460px' }}>
//                                     {tabValue === 0 &&
//                                         <Image797 src={Evidence_manual_1} alt="Evidence_manual_1" />
//                                     }
//                                     {tabValue === 1 &&
//                                         <Image797 src={Evidence_manual_1_without_region_head} alt="Evidence_manual_1" />

//                                     }
//                                     {tabValue === 2 &&
//                                         <Image797 src={Evidence_manual_1_user} alt="Evidence_manual_1" />
//                                     }
//                                     <Box sx={{ position: 'absolute', top: "40px", right: '-253px', width: '12.5rem' }}>
//                                         <Button
//                                             variant="contained"
//                                             disabled
//                                             startIcon={<GetAppIcon />}
//                                             sx={{ fontSize: '12px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
//                                         >
//                                             Экспорт
//                                         </Button>
//                                         <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Формирует отчет по найденным вещественным доказательствам в Excel или PDF формате</Typography>

//                                         <Box sx={{ mt: '28px', ml: '-14px' }}>
//                                             <Box sx={{ display: 'flex', gap: theme.spacing(0.5) }}>
//                                                 <OpenInNewIcon color='primary' />
//                                                 <Typography sx={{ alignSelf: 'center' }}>Открывает вкладку "Детали дела", связанного с конкретным вещественным доказательством.</Typography>
//                                             </Box>
//                                             <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
//                                                 <GetAppIcon color='primary' />
//                                                 <Typography sx={{ alignSelf: 'center' }}>Раздел "Действия"
//                                                     Нажатие на иконку загрузки позволяет скачать связанный с вещ. док-вом документ
//                                                 </Typography>
//                                             </Box>
//                                             <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
//                                                 <PrintIcon color='primary' />
//                                                 <Typography sx={{ alignSelf: 'center' }}>Нажатие на иконку принтера генерирует изображение штрихкода, которое можно сразу отправить на печать</Typography>
//                                             </Box>
//                                         </Box>

//                                     </Box>
//                                 </Box>
//                             </Box>
//                         </Box>
//                         <Box sx={{ width: '100%', pb: theme.spacing(36) }} id="certificate">
//                             <Box sx={{ display: "flex", gap: theme.spacing(2.5), width: '35vw' }}>
//                                 <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>4</Avatar>
//                                 <Typography variant="h5" sx={{ alignSelf: 'center' }}>Инструкция по устранению ошибки "Подключение не защищено" для доступа к платформе</Typography>
//                             </Box>
//                             <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image556 src={Certificate_manual_1} alt="Certificate_manual_1" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '84px',
//                                                 left: '28%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '682px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '65px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         Нажмите кнопку «Дополнительные»
//                                     </Typography>
//                                 </Box>
//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image556 src={Certificate_manual_2} alt="Certificate_manual_2" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '43px',
//                                                 left: '44%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '597px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '8px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         В раскрытом меню нажмите на ссылку «Перейти на сайт»
//                                     </Typography>
//                                 </Box>
//                                 {/* Далее все картинки и стрелки без изменений, т.к. изменения в них не требовались */}
//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image556 src={Certificate_manual_3} alt="Certificate_manual_3" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '82px',
//                                                 left: '63%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '490px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '1px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         На экране входа в систему найдите ссылку для загрузки сертификата. Нажмите на нее, чтобы скачать файл certificate.crt
//                                     </Typography>
//                                 </Box>

//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image556 src={Certificate_manual_4} alt="Certificate_manual_4" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '72px',
//                                                 left: '93%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '323px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '25px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         Перейдите в папку загрузок и откройте скачанный файл сертификата certificate.crt.
//                                     </Typography>
//                                 </Box>

//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image556 src={Certificate_manual_5} alt="Certificate_manual_5" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '41%',
//                                                 left: '74%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '425px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '85px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         Появится окно с предупреждением системы безопасности. Нажмите кнопку «Открыть»
//                                     </Typography>
//                                 </Box>

//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image556 src={Certificate_manual_6} alt="Certificate_manual_6" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '19.5%',
//                                                 left: '57%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '520px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '100px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         Нажмите «Установить». Откроется Мастер импорта сертификатов
//                                     </Typography>
//                                 </Box>

//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image556 src={Certificate_manual_7} alt="Certificate_manual_7" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '6.5%',
//                                                 left: '82%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '380px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '-10px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         Выберите расположение хранилища «Локальный компьютер» и нажмите  «Далее»
//                                     </Typography>
//                                 </Box>

//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image356 src={Certificate_manual_8} alt="Certificate_manual_8" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '6.5%',
//                                                 left: '82%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '545px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '-10px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         В мастере выберите параметр «Автоматически выбрать хранилище на основе типа сертификата» и нажмите «Далее»
//                                     </Typography>
//                                 </Box>

//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image356 src={Certificate_manual_9} alt="Certificate_manual_9" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '6.5%',
//                                                 left: '82%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '545px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '-10px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         Нажмите кнопку «Готово» для завершения процесса установки сертификата
//                                     </Typography>
//                                 </Box>

//                                 <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
//                                         <Image356 src={Certificate_manual_10} alt="Certificate_manual_10" />
//                                         <Box
//                                             sx={{
//                                                 position: 'absolute',
//                                                 bottom: '18%',
//                                                 left: '93%',
//                                                 transform: 'translateY(-50%)',
//                                                 width: '505px',
//                                                 height: '2px',
//                                                 backgroundColor: '#175FC7',
//                                             }}
//                                         >
//                                             <Box
//                                                 sx={{
//                                                     position: 'absolute',
//                                                     top: '50%',
//                                                     right: '0',
//                                                     transform: 'translateY(-50%)',
//                                                     width: '0',
//                                                     height: '0',
//                                                     borderLeft: '10px solid #175FC7',
//                                                     borderTop: '5px solid transparent',
//                                                     borderBottom: '5px solid transparent',
//                                                 }}
//                                             />
//                                         </Box>
//                                     </Box>
//                                     <Typography
//                                         sx={{
//                                             position: 'absolute',
//                                             bottom: '10px',
//                                             right: '-253px',
//                                             width: '12.5rem',
//                                         }}
//                                     >
//                                         Появится сообщение «Импорт успешно выполнен», подтверждающее завершение процедуры
//                                     </Typography>
//                                     <Typography sx={{ position: "absolute", bottom: "-90px", right: '-253px', width: '12.5rem' }}>
//                                         Теперь вы можете без проблем открыть сайт, авторизоваться и использовать платформу
//                                     </Typography>
//                                 </Box>

//                             </Box>
//                         </Box>
//                     </Box>

//                     {/* Правая пустая колонка (если нужна) */}
//                     <Box sx={{ display: "flex", flexDirection: '', width: "16vw", bgcolor: '#ffffff' }}>
//                     </Box>
//                 </Box>
//             </Box>
//         </Box >
//     )
// }


// // import React, { useCallback, useState } from 'react'
// // import {
// //     Avatar,
// //     Box,
// //     Button,
// //     Chip,
// //     InputAdornment,
// //     Tab,
// //     Tabs,
// //     TextField,
// //     Typography,
// // } from '@mui/material';
// // import { styled, useTheme } from '@mui/material/styles';
// // import {
// //     Search as SearchIcon,
// //     OpenInNew as OpenInNewIcon,
// //     CheckCircle as CheckCircleIcon,
// //     Add as AddIcon,
// //     Close as CloseIcon,
// //     Print as PrintIcon,
// //     GetApp as GetAppIcon,
// // } from '@mui/icons-material'
// // import Certificate_manual_1 from '../assets/certificate_manual_1.png';
// // import Certificate_manual_2 from '../assets/certificate_manual_2.png';
// // import Certificate_manual_3 from '../assets/certificate_manual_3.png';
// // import Certificate_manual_4 from '../assets/certificate_manual_4.png';
// // import Certificate_manual_5 from '../assets/certificate_manual_5.png';
// // import Certificate_manual_6 from '../assets/certificate_manual_6.png';
// // import Certificate_manual_7 from '../assets/certificate_manual_7.png';
// // import Certificate_manual_8 from '../assets/certificate_manual_8.png';
// // import Certificate_manual_9 from '../assets/certificate_manual_9.png';
// // import Certificate_manual_10 from '../assets/certificate_manual_10.png';
// //
// // import Cases_manual_1 from '../assets/cases_manual_1.png';
// // import Cases_manual_2 from '../assets/cases_manual_2.png';
// // import Cases_manual_3 from '../assets/cases_manual_3.png';
// // import Cases_manual_4 from '../assets/cases_manual_4.png';
// // import Cases_manual_5 from '../assets/cases_manual_5.png';
// // import Cases_manual_6 from '../assets/cases_manual_6.png';
// //
// // import Cases_manual_1_without_region_head from '../assets/cases_manual_1_without_region_head.png';
// // import Cases_manual_1_user from '../assets/cases_manual_1_user.png';
// // import Cases_manual_2_user from '../assets/cases_manual_2_user.png';
// // import Cases_manual_4_user from '../assets/cases_manual_4_user.png';
// // import Cases_manual_5_user from '../assets/cases_manual_5_user.png';
// // import Cases_manual_6_user from '../assets/cases_manual_6_user.png';
// //
// // import Employees_manual_1 from '../assets/employees_manual_1.png';
// // import Employees_manual_2 from '../assets/employees_manual_2.png';
// // import Employees_manual_3 from '../assets/employees_manual_3.png';
// // import Employees_manual_1_without_region_head from '../assets/employees_manual_1_without_region_head.png';
// // import Employees_manual_2_without_region_head from '../assets/employees_manual_2_without_region_head.png';
// // import Employees_manual_3_without_region_head from '../assets/employees_manual_3_without_region_head.png';
// // import Evidence_manual_1 from '../assets/evidence_manual_1.png';
// // import Evidence_manual_1_without_region_head from '../assets/evidence_manual_1_without_region_head.png';
// // import Evidence_manual_1_user from '../assets/evidence_manual_1_user.png';
// // import Header from '../components/Header';
// // import { StyledButton } from '../components/ui/StyledComponents';
// //
// //
// // const Image556 = styled('img')(({ theme }) => ({
// //     width: '556px',
// // }));
// // const Image356 = styled('img')(({ theme }) => ({
// //     width: '356px',
// // }));
// // const Image797 = styled('img')(({ theme }) => ({
// //     width: '797px',
// // }));
// //
// // export const ManualPage = () => {
// //     const theme = useTheme();
// //     // States for filters, search, and sorting
// //     const [searchQuery, setSearchQuery] = useState('');
// //     const [tabValue, setTabValue] = useState(0);
// //
// //     // Handlers for filters and search
// //     const handleSearchChange = useCallback((event) => {
// //         setSearchQuery(event.target.value);
// //     }, []);
// //
// //     // Обработка вкладок
// //     const handleTabChange = (event, newValue) => {
// //         setTabValue(newValue);
// //     };
// //
// //     const tabs = [
// //         {
// //             label: 'ГЛАВА РЕГИОНА',
// //             content: (
// //                 <>
// //                 </>
// //             ),
// //         },
// //         {
// //             label: 'ГЛАВА ОТДЕЛЕНИЯ',
// //             content: (
// //                 <>
// //                 </>
// //             ),
// //         },
// //         {
// //             label: 'ПОЛЬЗОВАТЕЛЬ',
// //             content: (
// //                 <>
// //                 </>
// //             ),
// //         },
// //     ];
// //     return (
// //         <Box sx={{ backgroundColor: '#e9edf5' }}>
// //             <Header />
// //
// //             <Box sx={{ m: 'auto', marginTop: theme.spacing(8), pt: theme.spacing(4), pb: theme.spacing(2), width: '98vw', maxWidth: '1440px' }}>
// //                 {/* Toolbar */}
// //                 <Box
// //                     sx={{
// //                         display: 'flex',
// //                         alignItems: "flex-start",
// //                         gap: theme.spacing(11),
// //                         mb: theme.spacing(2),
// //                     }}
// //                 >
// //                     <Box sx={{ mt: '0.5rem', ml: '-4rem', display: 'flex', position: 'fixed', flexDirection: "column", gap: theme.spacing(12), }}>
// //                         <TextField
// //                             label="Поиск"
// //                             variant="outlined"
// //                             value={searchQuery}
// //                             onChange={handleSearchChange}
// //                             size="small"
// //                             InputProps={{
// //                                 startAdornment: (
// //                                     <InputAdornment position="start">
// //                                         <SearchIcon color="action" />
// //                                     </InputAdornment>
// //                                 ),
// //                             }}
// //                         />
// //
// //                         <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', justifyItems: 'flex-start', alignItems: 'flex-start', gap: '1rem' }} >
// //                             <Button component="a" href={`#cases`} sx={{ p: 0, justifyContent: 'flex-start' }}>
// //                                 Дела
// //                             </Button>
// //                             {tabValue !== '2' && <Button component="a" href={`#employees`} sx={{ p: 0, justifyContent: 'flex-start' }}>
// //                                 Сотрудники
// //                             </Button>}
// //                             <Button component="a" href={`#searchevidence`} sx={{ p: 0, justifyContent: 'flex-start' }}>
// //                                 Поиск вещдоков
// //                             </Button>
// //                             <Button component="a" href={`#certificate`} sx={{ p: 0, justifyContent: 'flex-start' }}>
// //                                 Установка сертификата
// //                             </Button>
// //                         </Box>
// //                     </Box>
// //                     <Box sx={{ display: 'flex', ml: theme.spacing(46), gap: theme.spacing(2) }}>
// //                         <Box
// //                             sx={{
// //                                 display: 'flex',
// //                                 flexDirection: "column",
// //                                 justifyContent: "center",
// //                                 flex: 1,
// //                                 maxWidth: "797px",
// //                                 alignItems: 'flex-start',
// //                                 gap: theme.spacing(4),
// //                                 mb: theme.spacing(2),
// //                             }}
// //                         >
// //                             <Tabs
// //                                 value={tabValue}
// //                                 onChange={handleTabChange}
// //                                 sx={{ alignSelf: 'center', width: '35vw' }}
// //                                 TabIndicatorProps={{ style: { backgroundColor: '#3d4785' } }}
// //                                 textColor="inherit"
// //                             >
// //                                 {tabs.map((tab, index) => (
// //                                     <Tab key={index} label={tab.label} />
// //                                 ))}
// //                             </Tabs>
// //                             {/* MainContainer */}
// //                             <Box sx={{ width: '100%' }} id="cases">
// //                                 <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
// //                                     <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>1</Avatar>
// //                                     <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Дела"</Typography>
// //                                 </Box>
// //                                 <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: tabValue === 2 ? '420px' : '360px' }}>
// //
// //
// //                                         {tabValue === 0 &&
// //                                             <Image797 src={Cases_manual_1} alt="Cases_manual_1" />
// //                                         }
// //                                         {tabValue === 1 &&
// //                                             <Image797 src={Cases_manual_1_without_region_head} alt="Cases_manual_1" />
// //                                         }
// //                                         {tabValue === 2 &&
// //                                             <Image797 src={Cases_manual_1_user} alt="Cases_manual_1" />
// //                                         }
// //                                         <Box sx={{ position: 'absolute', top: "40px", right: '-253px', width: '12.5rem' }}>
// //                                             <StyledButton
// //
// //                                                 sx={{ fontSize: '12px', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
// //                                                 disabled
// //                                             >
// //                                                 Сканировать штрихкод
// //                                             </StyledButton>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Сканировать штрихкод" открывает окно ввода или сканирования штрихкода для поиска конкретного дела</Typography>
// //
// //                                             <Button
// //                                                 variant="contained"
// //                                                 disabled
// //                                                 startIcon={<GetAppIcon />}
// //                                                 sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
// //                                             >
// //                                                 Экспорт
// //                                             </Button>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Экспорт" позволяет экспортировать данные из таблицы дел. Доступные форматы: PDF / Excel</Typography>
// //                                             {tabValue !== 0 && (
// //                                                 <>
// //                                                     <StyledButton
// //                                                         startIcon={<AddIcon />}
// //                                                         sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
// //                                                     >
// //                                                         <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Добавить дело</span>
// //                                                     </StyledButton>
// //                                                     <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Добавить дело" позволяет создать новое дело.</Typography>
// //                                                 </>)}
// //
// //                                             <StyledButton
// //                                                 startIcon={<OpenInNewIcon />}
// //                                                 sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
// //                                                 disabled
// //                                             >
// //                                                 <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
// //                                             </StyledButton>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка "Открыть дело" становится активной только при выделении одного дела в таблице. Открывает детализированную информацию о выбранном деле</Typography>
// //
// //                                         </Box>
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: tabValue === 2 ? '320px' : '68px' }}>
// //                                         <div>
// //                                             {(tabValue === 0 || tabValue === 1) &&
// //                                                 <Image797 src={Cases_manual_2} sx={{ mb: '1px' }} alt="Cases_manual_2" />
// //                                             }
// //                                             {tabValue === 2 &&
// //                                                 <Image797 src={Cases_manual_2_user} alt="Cases_manual_2" />
// //                                             }
// //                                             <Image797 src={Cases_manual_3} sx={{ mb: '1px' }} alt="Cases_manual_3" />
// //
// //                                         </div>
// //                                         <Box sx={{ position: 'absolute', top: "40px", right: '-253px', width: '12.5rem' }}>
// //                                             <StyledButton
// //                                                 startIcon={<OpenInNewIcon />}
// //                                                 sx={{ mt: '28px', color: '#ffffff !important', backgroundColor: '#0d47a1 !important', height: '40px', opacity: '1 !important' }}
// //                                                 disabled
// //                                             >
// //                                                 <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Открыть дело</span>
// //                                             </StyledButton>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>После нажатия открывается вкладка "Детали дела", которая состоит из трех разделов: Информация, вещдоки, история изменений</Typography>
// //                                             <Typography sx={{ mt: "18px", alignSelf: 'center' }}>Кнопки "Экспорт Excel" и "Экспорт PDF" создает отчет о деле в соответствующих форматах</Typography>
// //                                             {tabValue !== 2 && (<>
// //                                                 <StyledButton
// //                                                     // sx={{ mr: 2, height: '40px' }}
// //                                                     sx={{ mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '40px', opacity: '1 !important' }}
// //                                                     disabled
// //                                                     startIcon={<CheckCircleIcon />}
// //                                                 >
// //                                                     <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Переназначить дело'}</span>
// //                                                 </StyledButton>
// //
// //                                                 <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Кнопка позволяет изменить ответственного сотрудника или отделение, которое курирует данное дело</Typography>
// //                                             </>
// //                                             )}
// //                                             {tabValue === 2 && (
// //                                                 <>
// //                                                     <StyledButton
// //                                                         sx={{
// //                                                             backgroundColor: theme.palette.error.main + '!important',
// //                                                             height: '40px',
// //                                                             mt: '1rem',
// //                                                             opacity: '1 !important',
// //                                                             '&:hover': {
// //                                                                 backgroundColor: theme.palette.error.dark
// //                                                             },
// //                                                         }}
// //                                                         disabled
// //                                                         startIcon={<CloseIcon />}
// //                                                     >
// //                                                         <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Закрыть'}</span>
// //                                                     </StyledButton>
// //                                                     <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Красная кнопка "Закрыть дело" завершает работу над текущим делом и переводит его в статус "Закрыто". При этом дело становится неактивным, но не удаляется.</Typography>
// //                                                     <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Если необходимо возобновить работу, на месте красной кнопки появляется зелёная кнопка "Активировать". Нажатие на неё возвращает дело в статус "Активно", и его можно снова редактировать и просматривать.</Typography>
// //
// //                                                 </>
// //                                             )}
// //
// //                                         </Box>
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             {(tabValue === 0 || tabValue === 1) &&
// //                                                 <Image797 src={Cases_manual_4} alt="Cases_manual_4" />
// //                                             }
// //                                             {tabValue === 2 &&
// //                                                 <Image797 src={Cases_manual_4_user} alt="Cases_manual_4" />
// //                                             }
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: tabValue === 2 ? "18%" : '28%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '98%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '59px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //                                         <Typography sx={{ position: "absolute", bottom: "-15px", right: '-253px', width: '12.5rem', alignSelf: 'center' }}>Вкладка "Вещдоки"
// //                                             При нажатии на стрелку в правой части панели список разворачивается, предоставляя более подробную информацию</Typography>
// //
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             {(tabValue === 0 || tabValue === 1) &&
// //                                                 <Image797 src={Cases_manual_5} alt="Cases_manual_5" />
// //                                             }
// //                                             {tabValue === 2 &&
// //                                                 <Image797 src={Cases_manual_5_user} alt="Cases_manual_5" />
// //                                             }
// //
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: tabValue === 2 ? "50%" : '58%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '95%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '80px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //                                         <Typography sx={{ position: "absolute", bottom: "40px", right: '-253px', width: '12.5rem', alignSelf: 'center' }}>При нажатии на кнопку система отображает штрихкод на экране, который можно распечатать. Штрихкод служит для идентификации вещественного доказательства в процессе хранения или перемещения</Typography>
// //
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             {(tabValue === 0 || tabValue === 1) &&
// //                                                 <Image797 src={Cases_manual_6} alt="Cases_manual_6" />
// //                                             }
// //                                             {tabValue === 2 &&
// //                                                 <Image797 src={Cases_manual_6_user} alt="Cases_manual_6" />
// //                                             }
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '65%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '95%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '80px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //                                         <Typography sx={{ position: "absolute", bottom: "120px", right: '-253px', width: '12.5rem', alignSelf: 'center' }}>Вкладка "История изменений"
// //                                             На данной вкладке отображается полный хронологический список изменений, внесенных в дело, что обеспечивает прозрачность его обработки</Typography>
// //
// //                                     </Box>
// //                                 </Box>
// //                             </Box>
// //                             {tabValue !== 2 && <Box sx={{ width: '100%' }} id="employees">
// //                                 <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
// //                                     <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>2</Avatar>
// //                                     <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Сотрудники"</Typography>
// //                                 </Box>
// //                                 <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3), position: 'relative' }}>
// //                                     {/* Переключатель вкладок (Сотрудники/Сессии) - слева от таблицы, не смещая её */}
// //                                     <Box sx={{
// //                                         position: 'absolute',
// //                                         left: '-150px',
// //                                         top: '0',
// //                                         marginTop: '132px',
// //                                         display: 'flex',
// //                                         flexDirection: 'column',
// //                                         gap: theme.spacing(2)
// //                                     }}>
// //                                         <Tabs
// //                                             orientation="vertical"
// //                                             value={"employees"}
// //                                             sx={{ borderRight: 1, borderColor: 'divider' }}
// //                                         >
// //                                             <Tab label="Сотрудники" value="employees" />
// //                                             <Tab label="Сессии" value="sessions" />
// //                                         </Tabs>
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: '48px' }}>
// //                                         {tabValue === 0 ?
// //                                             <Image797 src={Employees_manual_1} alt="Employees_manual_1" />
// //                                             :
// //                                             <Image797 src={Employees_manual_1_without_region_head} alt="Employees_manual_1" />
// //                                         }
// //
// //                                         <Box sx={{ position: 'absolute', top: "20px", right: '-253px', width: '12.5rem' }}>
// //                                             <Button
// //                                                 variant="contained"
// //                                                 disabled
// //                                                 startIcon={<GetAppIcon />}
// //                                                 sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
// //                                             >
// //                                                 Экспорт
// //                                             </Button>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Формирует отчет со списком сотрудников Excel или PDF формате</Typography>                    <Button
// //                                                 variant="contained"
// //                                                 color="primary"
// //                                                 disabled
// //                                                 sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
// //
// //                                             >
// //                                                 Добавить сотрудника
// //                                             </Button>
// //
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Новый сотрудник добавляется в список и становится активным пользователем системы</Typography>
// //
// //                                         </Box>
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: '250px' }}>
// //                                         {/* Переключатель вкладок (Сотрудники/Сессии) - слева от таблицы, не смещая её */}
// //                                         <Box sx={{
// //                                             position: 'absolute',
// //                                             left: '-150px',
// //                                             top: '0',
// //                                             marginTop: '125px',
// //                                             display: 'flex',
// //                                             flexDirection: 'column',
// //                                             gap: theme.spacing(2)
// //                                         }}>
// //                                             <Tabs
// //                                                 orientation="vertical"
// //                                                 value={"employees"}
// //                                                 sx={{ borderRight: 1, borderColor: 'divider' }}
// //                                             >
// //                                                 <Tab label="Сотрудники" value="employees" />
// //                                                 <Tab label="Сессии" value="sessions" />
// //                                             </Tabs>
// //                                         </Box>
// //                                         {tabValue === 0 ?
// //                                             <Image797 src={Employees_manual_2} alt="Employees_manual_2" />
// //                                             :
// //                                             <Image797 src={Employees_manual_2_without_region_head} alt="Employees_manual_2" />
// //                                         }
// //
// //
// //
// //                                         <Box sx={{ position: 'absolute', top: "20px", right: '-253px', width: '12.5rem' }}>
// //                                             <Button
// //                                                 variant="contained"
// //                                                 disabled
// //
// //                                                 color={'error'}
// //                                                 sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#C61A25 !important', height: '33px', opacity: '1 !important' }}
// //
// //                                             >
// //                                                 {'Деактивировать'}
// //                                             </Button>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>При выделении конкретного сотрудника кнопка "Деактивировать" становится доступной.
// //                                                 Нажатие на кнопку лишает сотрудника возможности войти в систему.
// //                                                 Повторное нажатие на кнопку (если она активируется) восстанавливает доступ</Typography>
// //
// //                                             <Chip
// //                                                 label={`Всего: 0`}
// //                                                 color="primary"
// //                                                 size="small"
// //                                                 sx={{ fontWeight: 'bold', mt: '28px' }}
// //                                             />
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Общее количество дел, связанных с сотрудником</Typography>
// //                                             <Chip
// //                                                 label={`Открыто: 0`}
// //                                                 color="success"
// //                                                 size="small"
// //                                                 sx={{ fontWeight: 'bold', mt: '22px' }}
// //                                             />
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Количество дел, которые находятся в активной работе</Typography>
// //                                             <Chip
// //                                                 label={`Закрыто: 0`}
// //                                                 color="error"
// //                                                 size="small"
// //                                                 sx={{ fontWeight: 'bold', mt: '22px' }}
// //                                             />
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Количество завершенных дел</Typography>
// //
// //                                         </Box>
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: '128px' }}>
// //                                         {/* Переключатель вкладок (Сотрудники/Сессии) - слева от таблицы, не смещая её */}
// //                                         <Box sx={{
// //                                             position: 'absolute',
// //                                             left: '-150px',
// //                                             top: '0',
// //                                             marginTop: '120px',
// //                                             display: 'flex',
// //                                             flexDirection: 'column',
// //                                             gap: theme.spacing(2)
// //                                         }}>
// //                                             <Tabs
// //                                                 orientation="vertical"
// //                                                 value={"sessions"}
// //                                                 sx={{ borderRight: 1, borderColor: 'divider' }}
// //                                             >
// //                                                 <Tab label="Сотрудники" value="employees" />
// //                                                 <Tab label="Сессии" value="sessions" />
// //                                             </Tabs>
// //                                         </Box>
// //                                         {tabValue === 0 ?
// //                                             <Image797 src={Employees_manual_3} alt="Employees_manual_3" />
// //                                             :
// //                                             <Image797 src={Employees_manual_3_without_region_head} alt="Employees_manual_3" />
// //                                         }
// //
// //                                         <Box sx={{ position: 'absolute', top: "20px", right: '-253px', width: '12.5rem' }}>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>
// //                                                 <strong>Колонка "Сессии"</strong>
// //                                                 <p style={{ marginTop: 0 }}>В этой колонке отображается информация о действиях сотрудника на платформе</p>
// //                                             </Typography>
// //
// //                                             <Chip
// //                                                 label={'16.11.2024 13:13'}
// //                                                 color={'primary'}
// //                                                 size="small"
// //                                                 sx={{ fontWeight: 'bold', mt: '22px' }}
// //                                             />
// //
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Дата и время начала сессии (вход на платформу)</Typography>
// //                                             <Chip
// //                                                 label={'16.11.2024 13:13'}
// //                                                 color={'secondary'}
// //                                                 size="small"
// //                                                 sx={{ fontWeight: 'bold', mt: '28px' }}
// //                                             />
// //
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Дата и время завершения сессии (выход с платформы или завершение активности)</Typography>
// //
// //                                         </Box>
// //                                     </Box>
// //                                 </Box>
// //                             </Box>}
// //                             <Box sx={{ width: '100%' }} id="searchevidence">
// //                                 <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
// //                                     <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>3</Avatar>
// //                                     <Typography variant="h5" sx={{ alignSelf: 'center' }}>Раздел "Поиск вещдоков"</Typography>
// //                                 </Box>
// //                                 <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block', mb: '460px' }}>
// //                                         {tabValue === 0 &&
// //                                             <Image797 src={Evidence_manual_1} alt="Evidence_manual_1" />
// //                                         }
// //                                         {tabValue === 1 &&
// //                                             <Image797 src={Evidence_manual_1_without_region_head} alt="Evidence_manual_1" />
// //
// //                                         }
// //                                         {tabValue === 2 &&
// //                                             <Image797 src={Evidence_manual_1_user} alt="Evidence_manual_1" />
// //                                         }
// //                                         <Box sx={{ position: 'absolute', top: "40px", right: '-253px', width: '12.5rem' }}>
// //                                             <Button
// //                                                 variant="contained"
// //                                                 disabled
// //                                                 startIcon={<GetAppIcon />}
// //                                                 sx={{ fontSize: '12px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
// //                                             >
// //                                                 Экспорт
// //                                             </Button>
// //                                             <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Формирует отчет по найденным вещественным доказательствам в Excel или PDF формате</Typography>
// //
// //                                             <Box sx={{ mt: '28px', ml: '-14px' }}>
// //                                                 <Box sx={{ display: 'flex', gap: theme.spacing(0.5) }}>
// //                                                     <OpenInNewIcon color='primary' />
// //                                                     <Typography sx={{ alignSelf: 'center' }}>Открывает вкладку "Детали дела", связанного с конкретным вещественным доказательством.
// //                                                         (Детали этой вкладки мы уже рассмотрели ранее.)
// //                                                     </Typography>
// //
// //                                                 </Box>
// //                                                 <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
// //                                                     <GetAppIcon color='primary' />
// //                                                     <Typography sx={{ alignSelf: 'center' }}>Раздел "Действия"
// //                                                         Нажатие на иконку загрузки позволяет скачать связанный с вещ. док-вом документ
// //                                                     </Typography>
// //                                                 </Box>
// //                                                 <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
// //                                                     <PrintIcon color='primary' />
// //                                                     <Typography sx={{ alignSelf: 'center' }}>Нажатие на иконку принтера генерирует изображение штрихкода, которое можно сразу отправить на печать</Typography>
// //                                                 </Box>
// //                                             </Box>
// //
// //                                         </Box>
// //                                     </Box>
// //                                 </Box>
// //                             </Box>
// //                             <Box sx={{ width: '100%', pb: theme.spacing(36) }} id="certificate">
// //                                 <Box sx={{ display: "flex", gap: theme.spacing(2.5), width: '35vw' }}>
// //                                     <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>4</Avatar>
// //                                     <Typography variant="h5" sx={{ alignSelf: 'center' }}>Инструкция по устранению ошибки "Подключение не защищено" для доступа к платформе</Typography>
// //                                 </Box>
// //                                 <Box sx={{ display: "flex", flexDirection: 'column', gap: theme.spacing(2.5), mt: theme.spacing(3) }}>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image556 src={Certificate_manual_1} alt="Certificate_manual_1" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '84px', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '28%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '682px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '65px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             Нажмите кнопку «Дополнительные»
// //                                         </Typography>
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image556 src={Certificate_manual_2} alt="Certificate_manual_2" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '43px', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '44%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '597px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '8px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             В раскрытом меню нажмите на ссылку «Перейти на сайт»
// //                                         </Typography>
// //                                     </Box>
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image556 src={Certificate_manual_3} alt="Certificate_manual_3" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '82px', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '63%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '490px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '1px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             На экране входа в систему найдите ссылку для загрузки сертификата. Нажмите на нее, чтобы скачать файл certificate.crt
// //                                         </Typography>
// //                                     </Box>
// //
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image556 src={Certificate_manual_4} alt="Certificate_manual_4" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '72px', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '93%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '323px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '25px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             Перейдите в папку загрузок и откройте скачанный файл сертификата certificate.crt.
// //                                         </Typography>
// //                                     </Box>
// //
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image556 src={Certificate_manual_5} alt="Certificate_manual_5" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '41%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '74%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '425px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '85px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             Появится окно с предупреждением системы безопасности. Нажмите кнопку «Открыть»
// //                                         </Typography>
// //                                     </Box>
// //
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image556 src={Certificate_manual_6} alt="Certificate_manual_6" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '19.5%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '57%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '520px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '100px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             Нажмите «Установить». Откроется Мастер импорта сертификатов
// //                                         </Typography>
// //                                     </Box>
// //
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image556 src={Certificate_manual_7} alt="Certificate_manual_7" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '6.5%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '82%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '380px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '-10px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             Выберите расположение хранилища «Локальный компьютер» и нажмите  «Далее»
// //                                         </Typography>
// //                                     </Box>
// //
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image356 src={Certificate_manual_8} alt="Certificate_manual_8" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '6.5%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '82%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '545px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '-10px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             В мастере выберите параметр «Автоматически выбрать хранилище на основе типа сертификата» и нажмите «Далее»
// //                                         </Typography>
// //                                     </Box>
// //
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image356 src={Certificate_manual_9} alt="Certificate_manual_9" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '6.5%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '82%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '545px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '-10px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             Нажмите кнопку «Готово» для завершения процесса установки сертификата
// //                                         </Typography>
// //                                     </Box>
// //
// //                                     <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                         {/* Контейнер для изображения */}
// //                                         <Box sx={{ position: 'relative', display: 'inline-block' }}>
// //                                             <Image356 src={Certificate_manual_10} alt="Certificate_manual_10" />
// //                                             {/* Линия-стрелка. Начинаем справа от изображения (left: 100%) и идем к тексту */}
// //                                             <Box
// //                                                 sx={{
// //                                                     position: 'absolute',
// //                                                     bottom: '18%', // по вертикали выравниваем линию примерно по середине изображения
// //                                                     left: '93%', // стартуем справа от изображения
// //                                                     transform: 'translateY(-50%)', // выравниваем по центру высоты
// //                                                     width: '505px', // длина линии, подгоните по необходимости
// //                                                     height: '2px',
// //                                                     backgroundColor: '#175FC7', // цвет линии
// //                                                 }}
// //                                             >
// //                                                 {/* Сам наконечник стрелки - небольшой треугольник */}
// //                                                 <Box
// //                                                     sx={{
// //                                                         position: 'absolute',
// //                                                         top: '50%',
// //                                                         right: '0', // наконечник у правого конца линии
// //                                                         transform: 'translateY(-50%)',
// //                                                         width: '0',
// //                                                         height: '0',
// //                                                         borderLeft: '10px solid #175FC7',
// //                                                         borderTop: '5px solid transparent',
// //                                                         borderBottom: '5px solid transparent',
// //                                                     }}
// //                                                 />
// //                                             </Box>
// //                                         </Box>
// //
// //                                         {/* Текст, к которому ведет стрелка */}
// //                                         <Typography
// //                                             sx={{
// //                                                 position: 'absolute',
// //                                                 bottom: '10px',
// //                                                 right: '-253px',
// //                                                 width: '12.5rem',
// //                                             }}
// //                                         >
// //                                             Появится сообщение «Импорт успешно выполнен», подтверждающее завершение процедуры
// //                                         </Typography>
// //                                         <Typography sx={{ position: "absolute", bottom: "-90px", right: '-253px', width: '12.5rem' }}>{`Теперь вы можете без проблем открыть сайт, авторизоваться и использовать платформу`}</Typography>
// //
// //                                     </Box>
// //
// //                                 </Box>
// //                             </Box>
// //                         </Box>
// //                         {/* Manual */}
// //                         <Box sx={{ display: "flex", flexDirection: '', width: "16vw", bgcolor: '#ffffff' }}>
// //                         </Box>
// //                     </Box>
// //                 </Box>
// //             </Box>
// //         </Box >
// //     )
// // }