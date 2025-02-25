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

export const ManualPageKZ = () => {
    const theme = useTheme();

    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const tabs = [
        { label: 'Аймақ басшысы', content: <></> },
        { label: 'Бөлім басшысы', content: <></> },
        { label: 'Пайдаланушы', content: <></> },
    ];

    return (
        <Box sx={{ backgroundColor: '#E5E8F1', minHeight: '100vh' }}>
            <Header />
            <Box
                sx={{
                    display: 'none',
                    '@media print': {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: '8px',
                        mb: '1rem'
                    }
                }}
            >
                <img src={LogoMVDKZ} alt="Logo MVD KZ" style={{ height: '20px', width: 'auto' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Нұсқаулық
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
                            zIndex: 999,
                            '@media print': {
                                display: 'none !important',
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }} >
                            <Button component="a" href={`#cases`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Істер
                            </Button>
                            {tabValue !== 2 && (
                                <Button component="a" href={`#employees`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                    Қызметкерлер
                                </Button>
                            )}
                            <Button component="a" href={`#searchevidence`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Айғақтарды іздеу
                            </Button>
                            <Button component="a" href={`#certificate`} sx={{ p: 0, justifyContent: 'flex-start' }}>
                                Сертификатты орнату
                            </Button>
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
                            alignItems: 'flex-start',
                            gap: theme.spacing(4),
                            mb: theme.spacing(2),
                            mx: 'auto',
                            '@media print': {
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
                                <Typography variant="h5" sx={{ alignSelf: 'center' }}>«Істер» бөлімі</Typography>
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
                                            Штрихкодты сканирлеу
                                        </StyledButton>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>“Штрихкодты сканирлеу” батырмасы нақты істі іздеу үшін штрихкодты енгізу немесе сканирлеу терезесін ашады</Typography>

                                        <Button
                                            variant="contained"
                                            disabled
                                            startIcon={<GetAppIcon />}
                                            sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                        >
                                            Экспорттау
                                        </Button>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>“Экспорттау” батырмасы істер кестесіндегі деректерді экспорттауға мүмкіндік береді. Қолжетімді форматтар: PDF / Excel</Typography>
                                        {tabValue !== 0 && (
                                            <>
                                                <StyledButton
                                                    startIcon={<AddIcon />}
                                                    sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                                >
                                                    <span style={{ height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Іс қосу</span>
                                                </StyledButton>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>“Іс қосу” батырмасы жаңа іс жасауға мүмкіндік береді.</Typography>
                                            </>)}

                                        <StyledButton
                                            startIcon={<OpenInNewIcon />}
                                            sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                            disabled
                                        >
                                            <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Істі ашу</span>
                                        </StyledButton>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>“Істі ашу” батырмасы тек кестедегі бір істі таңдағанда белсенді болады. Таңдалған іс туралы егжей-тегжейлі ақпаратты ашады</Typography>

                                    </Box>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
                                <Box sx={{ position: 'relative', display: 'flex', gap: theme.spacing(14) }}>
                                    <Box sx={{ maxWidth: "797px" }}>
                                        {(tabValue === 0 || tabValue === 1) &&
                                            <Image797 src={Cases_manual_2} sx={{ mb: '1px' }} alt="Cases_manual_2" />
                                        }
                                        {tabValue === 2 &&
                                            <Image797 src={Cases_manual_2_user} alt="Cases_manual_2" />
                                        }
                                        <Image797 src={Cases_manual_3} sx={{ mb: '1px' }} alt="Cases_manual_3" />

                                    </Box >
                                    <Box sx={{ width: '12.5rem' }}>
                                        <StyledButton
                                            startIcon={<OpenInNewIcon />}
                                            sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#0d47a1 !important', height: '33px', opacity: '1 !important' }}
                                            disabled
                                        >
                                            <span style={{ color: '#ffffff', height: '1ex', lineHeight: '1ex', overflow: 'visible', verticalAlign: 'bottom' }}>Істі ашу</span>
                                        </StyledButton>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Батырманы басқаннан кейін “Іс мәліметтері” қосымшасы ашылады, ол үш бөлімнен тұрады: Ақпарат, айғақтар, өзгерістер тарихы</Typography>
                                        <Typography sx={{ mt: "18px", alignSelf: 'center' }}>“Excel-ге экспорттау” және “PDF-ке экспорттау” батырмалары істің есебін тиісті форматтарда жасайды</Typography>
                                        {tabValue !== 2 && (<>
                                                <StyledButton
                                                    sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                                    disabled
                                                    startIcon={<CheckCircleIcon />}
                                                >
                                                    <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Істі қайта тағайындау'}</span>
                                                </StyledButton>

                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Бұл батырма істі қадағалайтын жауапты қызметкерді немесе бөлімді өзгертуге мүмкіндік береді.</Typography>
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
                                                    <span style={{ height: '1ex', overflow: 'visible', lineHeight: '1ex', verticalAlign: 'bottom' }}>{'Жабу'}</span>
                                                </StyledButton>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Қызыл “Жабу” батырмасы ағымдағы істі аяқтап, оны “Жабық” күйге ауыстырады. Бұл істі белсенді емес етеді, бірақ оны жоймайды.</Typography>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Егер жұмысты жалғастыру қажет болса, қызыл батырманың орнында жасыл “Активтеу” батырмасы пайда болады. Оны басу арқылы іс қайтадан “Белсенді” күйге оралып, өңделуге қолжетімді болады.</Typography>

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
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: tabValue === 2 ? "18%" : '28%',
                                                left: '98%',
                                                transform: 'translateY(-50%)',
                                                width: '120px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
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
                                    <Typography sx={{ width: '12.5rem', alignSelf: 'center' }}>“Айғақтар” қосымшасы. Панельдің оң жақтағы көрсеткісін басқанда тізім ашылады және толығырақ ақпарат беріледі</Typography>

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

                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: tabValue === 2 ? "50%" : '58%',
                                                left: '95%',
                                                transform: 'translateY(-50%)',
                                                width: '145px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
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
                                    <Typography sx={{ width: '12.5rem', alignSelf: 'center' }}>Батырманы басқанда жүйе экранда штрихкодты көрсетеді, оны басып шығаруға болады. Штрихкод айғақты сақтау немесе тасымалдау процесінде сәйкестендіру үшін қызмет етеді</Typography>

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
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: '65%',
                                                left: '95%',
                                                transform: 'translateY(-50%)',
                                                width: '145px',
                                                height: '2px',
                                                backgroundColor: '#175FC7',
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
                                    <Typography sx={{ width: '12.5rem', alignSelf: 'center' }}>“Өзгерістер тарихы” қосымшасы іс бойынша жасалған барлық өзгерістердің толық хронологиялық тізімін көрсетеді, бұл оның өңдеудегі ашықтықты қамтамасыз етеді</Typography>

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
                                <Box sx={{ width: '100%' }} id="employees">
                                    <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
                                        <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>2</Avatar>
                                        <Typography variant="h5" sx={{ alignSelf: 'center' }}>«Қызметкерлер» бөлімі</Typography>
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
                                                    Экспорттау
                                                </Button>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Қызметкерлер тізімі бойынша есепті Excel немесе PDF форматында қалыптастырады</Typography>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    disabled
                                                    sx={{ fontSize: '12px', mt: '28px', color: '#ffffff !important', backgroundColor: '#1976d2 !important', height: '33px', opacity: '1 !important' }}
                                                >
                                                    Қызметкер қосу
                                                </Button>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Жаңа қызметкер тізімге қосылып, жүйенің белсенді пайдаланушысы болады</Typography>
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
                                                    Бейтараптандыру
                                                </Button>
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Белгілі бір қызметкерді таңдағанда “Бейтараптандыру” батырмасы қолжетімді болады.
                                                    Оны басу арқылы қызметкер жүйеге кіру құқығынан айырылады.
                                                    Егер кейінірек батырма қайтадан қолжетімді болса, оны басу арқылы қолжетімділікті қалпына келтіруге болады.</Typography>
                                                <Chip
                                                    label={`Всего: 0`}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '28px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Қызметкермен байланысты істердің жалпы саны</Typography>
                                                <Chip
                                                    label={`Открыто: 0`}
                                                    color="success"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '22px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Белсенді жұмыс істеп жатқан істердің саны</Typography>
                                                <Chip
                                                    label={`Закрыто: 0`}
                                                    color="error"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '22px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Аяқталған істердің саны</Typography>
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
                                                    <strong>“Сеанс” бағаны</strong>
                                                    <p style={{ marginTop: 0 }}>Бұл бағанда қызметкердің платформадағы әрекеттері туралы ақпарат көрсетіледі</p>
                                                </Typography>
                                                <Chip
                                                    label={'16.11.2024 13:13'}
                                                    color={'primary'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '22px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Сеанстың басталған күні мен уақыты (платформаға кіру)</Typography>
                                                <Chip
                                                    label={'16.11.2024 13:13'}
                                                    color={'secondary'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold', mt: '28px' }}
                                                />
                                                <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Сеанстың аяқталған күні мен уақыты (платформадан шығу немесе әрекеттің аяқталуы)</Typography>
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
                        <Box sx={{ width: '100%' }} id="searchevidence">
                            <Box sx={{ display: "flex", gap: theme.spacing(2.5) }}>
                                <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>3</Avatar>
                                <Typography variant="h5" sx={{ alignSelf: 'center' }}>«Айғақтарды іздеу» бөлімі</Typography>
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
                                            Экспорттау
                                        </Button>
                                        <Typography sx={{ mt: "10px", alignSelf: 'center' }}>Табылған айғақтар бойынша есепті Excel немесе PDF форматында жасайды</Typography>

                                        <Box sx={{ mt: '28px', ml: '-14px' }}>
                                            <Box sx={{ display: 'flex', gap: theme.spacing(0.5) }}>
                                                <OpenInNewIcon color='primary' />
                                                <Typography sx={{ alignSelf: 'center' }}>Қатысты істің “Іс мәліметтері” қосымшасын ашады.</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
                                                <GetAppIcon color='primary' />
                                                <Typography sx={{ alignSelf: 'center' }}>“Әрекеттер” бөлімі.
                                                    Жүктеу белгішесін басу айғаққа байланысты құжатты жүктеуге мүмкіндік береді.</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: theme.spacing(0.5), mt: theme.spacing(3.5) }}>
                                                <PrintIcon color='primary' />
                                                <Typography sx={{ alignSelf: 'center' }}>Принтер белгішесін басу штрихкодтың суретін жасайды, оны дереу басып шығаруға болады</Typography>
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
                        <Box sx={{ width: '100%', pb: theme.spacing(36) }} id="certificate">
                            <Box sx={{ display: "flex", gap: theme.spacing(2.5), width: '35vw' }}>
                                <Avatar sx={{ bgcolor: 'transparent', borderRadius: '9999px', border: 'solid 1px ' + theme.palette.primary.main, color: '#000000' }}>4</Avatar>
                                <Typography variant="h5" sx={{ alignSelf: 'center' }}>Платформаға қол жеткізу үшін "Қауіпсіз қосылу жоқ" қателігін жою бойынша нұсқаулық</Typography>
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
                                                pageBreakInside: 'avoid',
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
                                        “Қосымша” батырмасын басыңыз
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
                                                pageBreakInside: 'avoid',
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
                                        Ашылған мәзірден “Сайтқа өту” сілтемесін басыңыз
                                    </Typography>
                                </Box>
                                <Divider variant="middle" sx={{ borderColor: '#000000', my: '2rem', width: "797px" }} />
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
                                                pageBreakInside: 'avoid',
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
                                        Жүйеге кіру экранынан сертификатты жүктеу сілтемесін тауып, оны басып certificate.crt файлын жүктеңіз
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
                                                pageBreakInside: 'avoid',
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
                                        Жүктеулер қалтасына өтіп, certificate.crt жүктелген файлын ашыңыз
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
                                                pageBreakInside: 'avoid',
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
                                        Қауіпсіздік ескертуі бар терезе пайда болады. “Ашу” батырмасын басыңыз
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
                                                pageBreakInside: 'avoid',
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
                                        “Орнату” батырмасын басыңыз. Сертификатты импорттау шебері ашылады.
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
                                                pageBreakInside: 'avoid',
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
                                        Сертификаттар қоймасы ретінде “Жергілікті компьютер” орнын таңдаңыз да, “Келесі” түймесін басыңыз
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
                                                pageBreakInside: 'avoid',
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
                                        Шеберде “Сертификат түріне байланысты қойманы автоматты түрде таңдау” параметрін таңдап, “Келесі” түймесін басыңыз
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
                                                pageBreakInside: 'avoid',
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
                                        “Дайын” батырмасын басыңыз, бұл сертификатты орнатуды аяқтайды
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
                                                pageBreakInside: 'avoid',
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
                                            “Импорт сәтті орындалды” деген хабарлама шығады, бұл процедураның аяқталғанын растайды
                                        </Typography>
                                        <Typography sx={{ width: '12.5rem' }}>
                                            Енді сіз сайтты қиындықсыз аша аласыз, жүйеге кіріп, платформаны пайдалана аласыз
                                        </Typography>
                                    </Box>
                                </Box>

                            </Box>
                        </Box>
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
                            }
                        `}
                        </style>
                    </Box>
                </Box>
            </Box>
        </Box >
    )
}
