import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import RuFlag from '../../assets/flags/ru.png';
import KzFlag from '../../assets/flags/kz.png';

// Для примера используем простые эмоджи флагов.
// Вы можете заменить их на настоящие картинки или другие иконки.
const langs = {
    //   en: { name: 'English', flag: 'en' },
    ru: { name: 'Русский', flag: RuFlag },
    kz: { name: 'Қазақ', flag: KzFlag },
}

export const LangsSwitcher = () => {
    const { i18n } = useTranslation()
    const [open, setOpen] = useState(false)

    // Функция переключения видимости меню
    const handleToggle = () => setOpen(!open)

    // Текущий язык из i18n
    const currentLang = i18n.resolvedLanguage

    // Отображаем флаг текущего языка, если он есть в словаре.
    // Если вдруг нет, используем «глобус».
    const currentFlag = <img src={langs[currentLang]?.flag} alt={langs[currentLang]?.name} width="30" height="30" /> || '🌐'

    // При клике на конкретный язык — меняем язык
    const handleChangeLanguage = (lng) => {
        i18n.changeLanguage(lng)
        setOpen(false) // закрываем меню после выбора
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9999, // чтобы было поверх других элементов
        }}>
            {/* Меню с языками. Показываем, только если open === true */}
            {open && (
                <div
                    style={{
                        marginBottom: '10px',
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyItems: 'center'
                    }}
                >
                    {Object.keys(langs).map((lng) => (
                        <button
                            key={lng}
                            onClick={() => handleChangeLanguage(lng)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '24px',
                                padding: '4px 0',
                                textAlign: 'left',
                            }}
                        >
                            {langs[lng].name}
                        </button>
                    ))}
                </div>
            )}
            {/* Кнопка с флагом текущего языка */}
            <button
                onClick={handleToggle}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    // Можно добавить стили для лучшего внешнего вида
                    background: '#fff',
                    boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                {currentFlag}
            </button>
        </div>
    )
}

// import React from 'react'
// import { useTranslation, } from 'react-i18next';

// const langs = {
//     en: { nativeName: 'English' },
//     ru: { nativeName: 'Русский' },
//     kz: { nativeName: 'Қазақ' },
// };

// export const LangsSwitcher = () => {
//     const { i18n } = useTranslation();

//     return (
//         <div style={{position: "fixed", top: 0, right: 0, }}>
//             {Object.keys(langs).map((lng) => (
//                 <button key={lng} style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }} type="submit" onClick={() => i18n.changeLanguage(lng)}>
//                     {langs[lng].nativeName}
//                 </button>
//             ))}
//         </div>
//     )
// }
