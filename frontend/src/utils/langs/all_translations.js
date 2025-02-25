const en = {
    translation: {
        common: {
            buttons: {
                cancel: 'Cancel',
                create: 'Create',
                yes: 'Yes',
                no: 'No',
                save_changes: 'Save changes',
                upload_files: 'Upload files',
                export: 'Export',
                export_pdf: 'Export PDF',
                export_excel: 'Export Excel',
                creating: 'Creating...',
                find: 'Find',
                pdf: 'Generate PDF',
                yes_print: 'Yes, print',
                confirm: 'Confirm',
                reassign: 'Reassign',
                add: 'Add',
                close: 'Close',
                print: 'Print',
                clear_button: 'Clear',
                scan_barcode: 'Scan barcode',
                button_print_barcode: 'Print barcode',
                find_button: 'Find',
                download_doc: 'Download document',
                activate: 'Activate',
                deactivate: 'Deactivate'
            },
            standard: {
                label_department: 'Department',
                option_all_departments: 'All departments',
                label_employee: 'Employee',
                option_all_employees: 'All employees',
                label_date_from: 'Date from',
                label_date_to: 'Date to',
                label_first_name: 'First name',
                label_last_name: 'Last name',
                label_evidence_type: 'Evidence type',
                label_role: 'Role',
                label_rank: 'Rank',
                information: "Information",
                evidence: "Evidence",
            },
            sorts: {
                asc: 'Ascending',
                desc: 'Descending'
            },
            logo_alt: 'MVD logo',
            messages: {
                no_data: 'No data',
                no_description: 'No description',
                no_available_employees: 'No available employees',
                not_specified: 'Not specified',
                no_data_views: 'No data to display.',
                no_access_message: 'You do not have permission to view this case.',
                no_evidences: 'No evidence found.',
                empty_group_evidences: 'No evidence in this group.',
                empty_history_logs: 'No history records.',
                no_change_data: 'No change data.',
                file_not_found: 'File not found.',
                not_selected: 'Not selected',

                unknown: 'Unknown',

                object_deleted: 'Object was deleted.',

                excel_loading: 'Preparing export...',
                status_emp_changed: 'Employee status changed.',

                success_status_update: 'Evidence status updated.',
                biometric_canceled: 'Biometric authentication was canceled.'
            },
            barcode: {
                no_barcode: 'No barcode',
                no_barcode_error: 'Evidence barcode not available.',
                barcode_unavailable: 'Barcode unavailable.',
                barcode_group_unavailable: 'Group barcode unavailable.',

                dialog_title: 'Scan barcode',
                label_barcode: 'Barcode',
                error_no_barcode: 'Please scan a barcode.',
                error_find_case: 'Error finding case by barcode.'
            },
            errors: {
                error_no_data_for_export: 'No data for export.',
                error_export_excel: 'Error exporting to Excel.',
                error_fetch_data: 'Error fetching data.',
                error_fill_required_fields: 'Please fill in all required fields.',
                error_fill_form: 'Please correct the form errors.',
                error_alert: 'Error',

                error_file_upload: 'Error uploading file.',
                error_load_documents: 'Error loading documents.',
                error_select_files: 'Please select files to upload.',
                error_fetch_documents_log: 'Error fetching documents:',
                error_select_document: 'Please select a document.',
                error_file_update: 'Error updating document.',

                error_case_updated: 'Error updating case.',
                error_load_case: 'Error loading case.',
                error_load_history_edits: 'Error loading change history.',
                error_load_groups: 'Error loading groups.',
                error_update_status_case: 'Error changing case status.',
                error_get_investigator_name: 'Error fetching investigator name.',
                error_no_department: 'Select a department to reassign.',
                error_case_reassign: 'Error reassigning case.',
                error_add_evidence: 'Error adding evidence.',
                error_add_group: 'Error adding group.',
                error_status_update: 'Error updating evidence status.',

                error_load_departments: 'Error loading departments.',
                error_department_no_region: 'Selected department does not belong to your region.',

                error_export_users: 'Error exporting employees.',
                error_load_employees: 'Error loading employees.',
                error_get_sessions_msg: 'Error fetching session data.',
                error_add_employee: 'Error adding employee.',
                error_status_emp_changed: 'Error changing employee status.',
                error_deactivate_your_account: 'You cannot deactivate your own account.',
                error_no_employee: 'Select an employee to reassign.',

                error_fetch_evidences: 'Error fetching evidence.',
                error_export_evidences: 'Error exporting evidence.'
            },
            success: {
                export_excel_success: 'Export to Excel completed.',
                success_case_reassigned: 'Case reassigned successfully.',
                success_case_updated: 'Case updated successfully.',

                success_files_uploaded: 'Files uploaded successfully.',
                success_file_update: 'Document updated:',

                success_alert: 'Success',

                success_add_evidence: 'Evidence added successfully.',
                success_add_group: 'Group added successfully.'
            },
            status: {
                active: 'Active',
                closed: 'Closed',

                online: 'Online',
                offline: 'Offline',
                inactive: 'Inactive',
                now_active: 'Active',
                never: 'Never'
            },
            status_evidences: {
                in_storage: "In storage",
                destroyed: "Destroyed",
                taken: "Returned",
                on_examination: "Under examination",
                archived: "Issued to the investigator"
            },
            evidence_types: {
                firearm: "Firearm",
                cold_weapon: "Cold weapon",
                drugs: "Drugs",
                other: "Other"
            },
            fields: {
                name: "Name",
                description: "Description",
                status: "Status",
                type: "Evidence type",
                updated: "Updated",
                created: "Created",
                case: "Case",
                group: "Group",
                creator: "Creator",
                investigator: "Investigator",
                department: "Department"
            },
            action_message: {
                create_case: "Case creation",
                edit_data_case: "Case data editing",
                added_evidence: "Evidence added",
                edit_status_evidence: "Evidence status updated",
                added_file: "File added",
            },
            table_headers: {
                number: 'No.',
                title_and_description: 'Title and description',
                name: 'Title',
                description: 'Description',
                case_name_investigator: 'Case title and investigator',

                investigator_dept_region: 'Investigator, department and region',
                investigator: 'Investigator',

                change_date_user: 'Date & time',

                full_name_and_rank: 'Full name and rank',
                full_name_email_phone: 'Full name, email and phone',

                role_rank: 'Rank & role',

                email_and_phone: 'Email and phone',

                department_and_region: 'Department and region',
                region_department: 'Region and department',

                status: 'Status',
                type_status: 'Type & status',

                sessions: 'Sessions',

                cases: 'Cases',
                case_investigator: 'Case and investigator',

                created: 'Created',
                updated: 'Updated',

                evidence: 'Evidence',
                name_evidence: 'Evidence name',
                description_evidence: 'Evidence description',
                type_status_evidence: 'Type and status',

                actions: 'Action',

                group: 'Group',
                change_user: 'User',
                change_data: 'Changes'
            },
            table_data: {
                not_assigned: 'Not assigned',
                no_name: 'No name',
                description_not_specified: 'No description specified',

                field_old_new_separator: ' → ',
                field_separator: '; ',

                system_user: 'System'
            },
            report: {
                titles: {
                    report_case: "Case Report",
                    report_cases: "Cases Report",
                    report_case_name: "Case Report: {{caseName}}",
                    file_name_case: "Case_Report_",
                    file_name_cases: "Cases_Report",
                    case_info: "Case Information",

                    report_login_data_employee: "Employee Login Data",
                    stats_employees: "Employee Statistics",
                    stats_employee: "Employee Statistic",
                    file_name_stats: "Employee_Statistics",
                    file_name_employees: "Employee_Report",
                    file_name_data_employee: "Login_Data_",
                    file_name_employee: "Employee_Report",
                    file_name_sessions: "Employee_Sessions_Report",
                    report_sessions_employees: "Employee Sessions Report",
                    report_employees: "Employees Report",
                    report_employee: "Employee Report",
                    report_employee_name: "Employee Report {{employeeName}}",
                    cases_employee: "Employee Cases",
                    evidence_employee: "Employee's Case Evidences",

                    file_name_evidence: "Evidence_Report.xlsx",
                    report_evidence: "Evidence Report",
                    evidence_table: "Evidences",

                    history_title: "Change History",
                },
                employee_label: 'Employee:',
                filter_date_created: 'Created date: {{dateFrom}} - {{dateTo}}',
                created_date_label: 'Created date:',
                updated_date_label: 'Updated date:',
                date_added_label: 'Date added:',
                report_date_label: 'Report date:',
                report_date: 'Report date: {{reportDate}}',
                search_label: 'Search:',
                department_label: 'Department:',

                employee_received: 'Received by: {{employeeName}}',

                type_label: 'Evidence type:',
                status_label: 'Evidence status:',

                cases_total: 'Total',
                cases_opened: 'Opened',
                tooltip_cases_total: 'Total number of cases',
                tooltip_cases_opened: 'Number of opened cases',
                tooltip_cases_closed: 'Number of closed cases',

                investigator_and_department: 'Investigator and department',
                created_updated_date: 'Created & updated date',
                date_created: 'Created date',
                date_updated: 'Updated date',
                period: "Period:",
                from: "from",
                to: "to",

                investigator_label: 'Investigator:',
                region_label: 'Region:',
                case_description_label: 'Case description:',

                login: 'Login',
                logout: 'Logout',
                field: 'Field',
                value: 'Value',

                footer_message: '© {{currentYear}} Ministry of Internal Affairs of the Republic of Kazakhstan.'
            },
            toolbar: {
                label_date_range: 'Date created from - to'
            },
            logins: {
                input_name: 'Username',
                password: 'Password',
                label_confirm_password: 'Confirm password',
                label_email: 'Email',
                label_phone_number: 'Phone number',
                role_user: 'Regular user',
                role_department_head: 'Department head'
            }
        },
        header: {
            logout: 'Logout'
        },
        login_page: {
            title: 'Log in',
            button_login: 'Login',
            download_cert: 'Download certificate',
            open_manual: 'Open manual'
        },
        dashboard: {
            my_cases: 'My cases',
            tabs: {
                cases: {
                    title: 'Cases',
                    toolbar: {
                        search_placeholder: 'Search by title, description or investigator name',
                        button_add_case: 'Add case',
                        button_open_case: 'Open case'
                    },
                    dialog_new_affairs: {
                        dialog_title: 'Add new case',
                        error_create_case: 'Error creating case.',
                        success_case_created: 'Case created successfully.'
                    }
                },
                employees: {
                    title: 'Employees',
                    dialog_export: {
                        title: 'Export employees sessions report'
                    },
                    dialog_new_employee: {
                        title: 'Add new employee',
                        error: {
                            password_length: 'Password must be at least 8 characters.',
                            password_confirm: 'Passwords do not match.',
                            email_required: 'Email is required.',
                            email_incorrect: 'Enter a valid email address.',
                            select_department: 'Please select a department for the new employee.',
                            no_permission: 'You do not have permission to create users.'
                        },
                        success_employee_added: 'Employee added successfully'
                    },
                    dialog_print_new_emp: {
                        message_employee_added: 'Employee {{employeeName}} successfully added.',
                        message_print_login_data: 'Do you want to print login details?'
                    },
                    employees_report_session_pdf: {
                        session_in: 'Login:',
                        session_out: 'Logout:'
                    },
                    tableSessions: {
                        tooltip_last_login: 'Last login',
                        tooltip_last_logout: 'Last logout'
                    },
                    toolbar: {
                        search_placeholder: 'Search by name, rank, role or email',
                        date_last_login_label: 'Last login date',
                        button_add_employee: 'Add employee'
                    }
                },
                camera: {
                    title: 'Cameras'
                },
                search_evidence: {
                    title: 'Evidence search',
                    toolbar: {
                        label_search_query: 'Search by name, description, barcode or case data',
                        option_all_types: 'All types',
                        label_evidence_status: 'Evidence status',
                        option_all_statuses: 'All statuses'
                    },
                    evidence_table: {
                        column_evidence: 'Evidence'
                    }
                }
            }
        },
        documents: {
            documents_title: 'Documents',
            document: 'Document',
            dropzone_hint_inactive: 'Drag files here or click to select',
            dropzone_hint_active: 'Release files to upload',
            files_to_upload: 'Files to upload:',
            file_description_label: 'File description',
            button_upload_files: 'Upload files',
            attached_documents_label: 'Attached documents:',
            no_attached_documents: 'No attached documents.',
            upload_progress: 'Uploading...',
            uploaded_date: 'Uploaded date'
        },
        cases: {
            case_default: 'Case',
            investigator_label: 'Investigator:',
            case_name_label: 'Case title',
            case_description_label: 'Case description',
            case_activated: 'Case activated',
            case_closed: 'Case closed',
            pdf_export_loading: 'Preparing PDF...',
            title: 'Case details',
            reassign_case_button: 'Reassign case',
            close_case_button: 'Close case',
            activate_case_button: 'Activate case'
        },
        case_detail: {
            tabs: {
                evidence: {
                    button_add_group: 'Add group',
                    button_add_evidence: 'Add evidence',
                    label_storage_place: 'Storage place'
                }
            },
            components: {
                dialog_alert_new_status: {
                    title: 'Changing evidence status',
                    description: 'Please select a document for this action.'
                },
                dialog_change_investigator: {
                    title_dialog: 'Select an employee to reassign'
                }
            }
        },
        biometric: {
            biometric_registration: {
                page_title: 'Biometric registration',
                page_description: 'Make sure your face is clearly visible...',
                camera_access_error: 'Could not access camera. Please allow permission.',
                ws_connection_established: 'WebSocket connection established.',
                ws_connection_closed: 'WebSocket connection closed.',
                ws_connection_error: 'Error establishing WebSocket connection.',

                registration_in_progress: 'Registration in progress...',
                seconds: 'second(s)',
                start_registration_button: 'Start registration'
            },
            biometric_authentication: {
                page_title: 'Biometric authentication',
                start_authentication_button: 'Start authentication',
                authentication_in_progress: 'Authentication in progress...',
                auth_success_message: 'Biometric authentication succeeded.',
                auth_failed: 'Could not confirm biometric data. Please try again.'
            }
        }
    }
}
const ru = {
    translation: {
        common: {
            buttons: {
                cancel: "Отмена",
                create: "Создать",
                yes: "Да",
                no: "Нет",
                save_changes: "Сохранить изменения",
                upload_files: "Загрузить файлы",
                export: "Экспорт",
                export_pdf: "Экспорт PDF",
                export_excel: "Экспорт Excel",
                creating: "Создание...",
                find: "Найти",
                pdf: "Сформировать PDF",
                yes_print: "Да, распечатать",
                confirm: "Подтвердить",
                reassign: "Переназначить",
                add: "Добавить",
                close: "Закрыть",
                print: "Печать",
                clear_button: "Очистить",
                scan_barcode: "Сканировать штрихкод",
                button_print_barcode: "Печать штрихкода",
                find_button: "Найти",
                download_doc: "Скачать документ",
                activate: "Активировать",
                deactivate: "Деактивировать",
            },
            standard: {
                label_department: "Отделение",
                option_all_departments: "Все отделения",
                label_employee: "Сотрудник",
                option_all_employees: "Все сотрудники",
                label_date_from: "Дата от",
                label_date_to: "Дата до",
                label_first_name: "Имя",
                label_last_name: "Фамилия",
                label_evidence_type: "Тип ВД",
                label_role: "Роль",
                label_rank: "Звание",
                information: "Информация",
                evidence: "Вещдоки",
            },
            sorts: {
                asc: "По возрастанию",
                desc: "По убыванию"
            },
            logo_alt: "Логотип МВД",
            messages: {
                no_data: "Нет данных",
                no_description: "Нет описания",
                no_available_employees: "Нет доступных сотрудников",
                not_specified: "Не указано",
                no_data_views: "Нет данных для отображения.",
                no_access_message: "У вас нет прав для просмотра этого дела.",
                no_evidences: "Нет вещественных доказательств.",
                empty_group_evidences: "Нет вещественных доказательств в этой группе",
                empty_history_logs: "Нет записей истории изменений.",
                no_change_data: "Нет данных об изменениях.",
                file_not_found: "Файл не найден.",
                not_selected: "Не выбрано",

                unknown: "Неизвестно",

                object_deleted: "Объект был удален.",

                excel_loading: "Идёт подготовка к экспорту...",

                status_emp_changed: "Статус сотрудника изменен.",

                success_status_update: "Статус вещественного доказательства обновлен.",
                biometric_canceled: "Аутентификация была отменена.",
            },
            barcode: {
                no_barcode: "Нет штрихкода",
                no_barcode_error: "Штрихкод вещественного доказательства недоступен.",
                barcode_unavailable: "Штрихкод недоступен.",
                barcode_group_unavailable: "Штрихкод группы недоступен.",

                dialog_title: "Сканирование штрихкода",
                label_barcode: "Штрихкод",
                error_no_barcode: "Пожалуйста, отсканируйте штрихкод.",
                error_find_case: "Ошибка при поиске дела по штрихкоду.",
            },
            errors: {
                error_no_data_for_export: "Нет данных для экспорта.",
                error_export_excel: "Ошибка при экспорте в Excel.",
                error_fetch_data: "Ошибка при получении данных.",
                error_fill_required_fields: "Пожалуйста, заполните все обязательные поля.",
                error_fill_form: "Пожалуйста, исправьте ошибки в форме.",
                error_alert: "Ошибка",

                error_file_upload: "Ошибка при загрузке документа",
                error_load_documents: "Ошибка при загрузке документов.",
                error_select_files: "Пожалуйста, выберите файлы для загрузки.",
                error_fetch_documents_log: "Ошибка при получении документов:",
                error_select_document: "Пожалуйста, выберите документ.",
                error_file_update: "Ошибка при обновлении документа.",

                error_case_updated: "Ошибка при обновлении дела.",
                error_load_case: "Ошибка при загрузке дела.",
                error_load_history_edits: "Ошибка при загрузке истории изменений.",
                error_load_groups: "Ошибка при загрузке групп.",
                error_update_status_case: "Ошибка при изменении статуса дела.",
                error_get_investigator_name: "Ошибка при получении полного имени следователя",
                error_no_department: "Выберите отделение для переназначения.",
                error_case_reassign: "Ошибка при переназначении дела.",
                error_add_evidence: "Ошибка при добавлении вещественного доказательства.",
                error_add_group: "Ошибка при добавлении группы.",
                error_status_update: "Ошибка при обновлении статуса вещественного доказательства.",

                error_load_departments: "Ошибка при загрузке отделений.",
                error_department_no_region: "Выбранное отделение не принадлежит вашему региону.",

                error_export_users: "Ошибка при экспорте сотрудников.",
                error_load_employees: "Ошибка при загрузке сотрудников.",
                error_get_sessions_msg: "Ошибка при получении данных сессий.",
                error_add_employee: "Ошибка при добавлении сотрудника.",
                error_status_emp_changed: "Ошибка при изменении статуса сотрудника.",
                error_deactivate_your_account: "Вы не можете деактивировать свой собственный аккаунт.",
                error_no_employee: "Выберите сотрудника для переназначения.",

                error_fetch_evidences: "Ошибка при получении вещественных доказательств.",
                error_export_evidences: "Ошибка при экспорте вещественных доказательств.",
            },
            success: {
                export_excel_success: "Экспорт в Excel успешно выполнен.",

                success_case_reassigned: "Дело успешно переназначено.",
                success_case_updated: "Дело успешно обновлено.",

                success_files_uploaded: "Документы успешно загружены.",
                success_file_update: "Документ успешно обновлен:",

                success_alert: "Успешно",

                success_add_evidence: "Вещественное доказательство добавлено.",
                success_add_group: "Группа успешно добавлена.",
            },
            status: {
                active: "Активно",
                closed: "Закрыто",

                online: "В сети",
                offline: "Не в сети",
                inactive: "Неактивен",
                now_active: "Активен",
                never: "Никогда",
            },
            status_evidences: {
                in_storage: "На хранении",
                destroyed: "Уничтожен",
                taken: "Возвращен",
                on_examination: "На экспертизе",
                archived: "Выдан следователю"
            },
            evidence_types: {
                firearm: "Огнестрельное оружие",
                cold_weapon: "Холодное оружие",
                drugs: "Наркотики",
                other: "Другое"
            },
            fields: {
                name: "Название",
                description: "Описание",
                status: "Статус",
                type: "Тип ВД",
                updated: "Обновлено",
                created: "Создано",
                case: "Дело",
                group: "Группа",
                creator: "Создатель",
                investigator: "Следователь",
                department: "Департамент"
            },
            action_message: {
                create_case: "Создание дела",
                edit_data_case: "Изменение данных дела",
                added_evidence: "Добавлено вещественное доказательство",
                edit_status_evidence: "Изменение статуса вещественного доказательства",
                added_file: "Добавлен файл",
            },
            table_headers: {
                number: "№",
                title_and_description: "Название и описание",
                name: "Название",
                description: "Описание",
                case_name_investigator: "Название дела и следователь",

                investigator_dept_region: "Следователь, отделение и регион",
                investigator: "Следователь",

                change_date_user: "Дата и время",

                full_name_and_rank: "ФИО и Звание",
                full_name_email_phone: "ФИО, почта и телефон",

                role_rank: "Звание и Роль",

                email_and_phone: "Эл. почта и телефон",

                department_and_region: "Отделение и регион",
                region_department: "Регион и Отделение",

                status: "Статус",
                type_status: "Тип и Статус",

                sessions: "Сессии",

                cases: "Дела",
                case_investigator: "Дело и следователь",

                created: "Создано",
                updated: "Обновлено",

                evidence: "ВД",
                name_evidence: "Название ВД",
                description_evidence: "Описание ВД",
                type_status_evidence: "Тип и статус ВД",

                actions: "Действие",

                group: "Группа",
                change_user: "Пользователь",
                change_data: "Изменения",
            },
            table_data: {
                not_assigned: "Не назначено",
                no_name: "Без названия",
                description_not_specified: "Описание не указано",

                field_old_new_separator: " → ",
                field_separator: "; ",

                system_user: "Система",
            },
            report: {
                titles: {
                    report_case: "Отчет по делу",
                    report_cases: "Отчет по делам",
                    report_case_name: "Отчет по делу: {{caseName}}",
                    file_name_case: "Отчет_по_делу_",
                    file_name_cases: "Отчет_по_делам",
                    case_info: "Информация о деле",

                    report_login_data_employee: "Данные для входа сотрудника",
                    stats_employees: "Статистика сотрудников",
                    stats_employee: "Статистика сотрудника",
                    file_name_stats: "Статистика_сотрудников",
                    file_name_employees: "Отчет_по_сотрудникам",
                    file_name_data_employee: "Данные_для_входа_",
                    file_name_employee: "Отчет_по_сотруднику",
                    file_name_sessions: "Отчет_по_сессиям_сотрудников",
                    report_sessions_employees: "Отчет о сессиях сотрудников",
                    report_employees: "Отчет по сотрудникам",
                    report_employee: "Отчет по сотруднику",
                    report_employee_name: "Отчет по сотруднику {{employeeName}}",
                    cases_employee: "Дела сотрудника",
                    evidence_employee: "Вещдоки к делам сотрудника",

                    file_name_evidence: "Отчет_по_вещественным_доказательствам.xlsx",
                    report_evidence: "Отчет по вещественным доказательствам",
                    evidence_table: "Вещественные доказательства",

                    history_title: "История изменений",
                },
                employee_label: "Сотрудник:",
                filter_date_created: "Дата создания: {{dateFrom}} - {{dateTo}}",
                created_date_label: "Дата создания:",
                updated_date_label: "Дата обновления:",
                date_added_label: "Дата добавления:",
                report_date_label: "Дата формирования отчета:",
                report_date: "Дата формирования отчета: {{reportDate}}",
                search_label: "Поиск:",
                department_label: "Отделение:",

                employee_received: "Получено сотрудником: {{employeeName}}",

                type_label: "Тип ВД:",
                status_label: "Статус ВД:",

                cases_total: "Всего",
                cases_opened: "Открыто",

                tooltip_cases_total: "Общее количество дел",
                tooltip_cases_opened: "Количество открытых дел",
                tooltip_cases_closed: "Количество закрытых дел",

                investigator_and_department: "Следователь и отделение",
                created_updated_date: "Дата создания и обновления",
                date_created: "Дата создания",
                date_updated: "Дата обновления",
                period: "Период:",
                from: "от",
                to: "до",

                investigator_label: "Следователь:",
                region_label: "Регион:",
                case_description_label: "Описание дела:",

                login: "Вход",
                logout: "Выход",
                field: "Поле",
                value: "Значение",

                footer_message: "© {{currentYear}} Министерство внутренних дел Республики Казахстан.",
            },
            toolbar: {
                label_date_range: "Дата создания от - до",
            },
            logins: {
                input_name: "Имя пользователя",
                password: "Пароль",
                label_confirm_password: "Подтвердите пароль",
                label_email: "Электронная почта",
                label_phone_number: "Номер телефона",
                role_user: "Обычный пользователь",
                role_department_head: "Главный по отделению",
            },
        },
        header: {
            logout: "Выйти",
        },
        login_page: {
            title: "Вход",
            button_login: "войти",
            download_cert: "скачать сертификат",
            open_manual: "Открыть руководство",
        },
        dashboard: {
            my_cases: "Мои дела",
            tabs: {
                cases: {
                    title: "Дела",
                    toolbar: {
                        search_placeholder: "Поиск по названию, описанию или имени следователя",
                        button_add_case: "Добавить дело",
                        button_open_case: "Открыть дело",
                    },
                    dialog_new_affairs: {
                        dialog_title: "Добавить новое дело",
                        error_create_case: "Ошибка при создании дела.",
                        success_case_created: "Дело успешно создано."
                    },
                },
                employees: {
                    title: "Сотрудники",
                    dialog_export: {
                        title: "Экспорт отчета о сессиях сотрудников",
                    },
                    dialog_new_employee: {
                        title: "Добавить нового сотрудника",
                        error: {
                            password_length: "Пароль должен содержать минимум 8 символов.",
                            password_confirm: "Пароли не совпадают.",
                            email_required: "Электронная почта обязательна для заполнения.",
                            email_incorrect: "Введите корректный адрес электронной почты.",
                            select_department: "Пожалуйста, выберите отделение для нового сотрудника.",
                            no_permission: "У вас нет прав для создания пользователей.",
                        },
                        success_employee_added: "Сотрудник успешно добавлен",
                    },
                    dialog_print_new_emp: {
                        message_employee_added: "Сотрудник {{employeeName}} успешно добавлен.",
                        message_print_login_data: "Вы хотите распечатать данные для входа сотрудника?",
                    },
                    employees_report_session_pdf: {
                        session_in: "Вход:",
                        session_out: "Выход:"
                    },
                    tableSessions: {
                        tooltip_last_login: "Последний вход",
                        tooltip_last_logout: "Последний выход",
                    },
                    toolbar: {
                        search_placeholder: "Поиск по имени, фамилии, званию, роли или email",
                        date_last_login_label: "Дата последнего входа",
                        button_add_employee: "Добавить сотрудника",
                    },
                },
                camera: {
                    title: "Камеры",
                },
                search_evidence: {
                    title: "Поиск Вещдоков",
                    toolbar: {
                        label_search_query: "Поиск по названию, описанию, штрихкоду или данным дела",
                        option_all_types: "Все типы",
                        label_evidence_status: "Статус ВД",
                        option_all_statuses: "Все статусы",
                    },
                    evidence_table: {
                        column_evidence: "Вещественное доказательство",
                    }
                },
            },
        },
        documents: {
            documents_title: "Документы",
            document: "Документ",
            dropzone_hint_inactive: "Перетащите файлы сюда или нажмите для выбора",
            dropzone_hint_active: "Отпустите файлы для загрузки",
            files_to_upload: "Файлы для загрузки:",
            file_description_label: "Описание файла",
            button_upload_files: "Загрузить файлы",
            attached_documents_label: "Прикрепленные документы:",
            no_attached_documents: "Нет прикрепленных документов.",
            upload_progress: "Загрузка...",
            uploaded_date: "Дата загрузки",
        },
        cases: {
            case_default: "Дело",
            investigator_label: "Следователь по делу:",
            case_name_label: "Название дела",
            case_description_label: "Описание дела",
            case_activated: "Дело активировано",
            case_closed: "Дело закрыто",
            pdf_export_loading: "Идёт подготовка PDF...",
            title: "Детали дела",
            reassign_case_button: "Переназначить дело",
            close_case_button: "Закрыть дело",
            activate_case_button: "Активировать дело",
        },
        case_detail: {
            tabs: {
                evidence: {
                    button_add_group: "Добавить группу",
                    button_add_evidence: "Добавить вещественное доказательство",
                    label_storage_place: "Место хранения",
                },
            },
            components: {
                dialog_alert_new_status: {
                    title: "Изменение статуса вещественного доказательства",
                    description: "Пожалуйста, выберите документ, на основании которого производится действие.",
                },
                dialog_change_investigator: {
                    title_dialog: "Выберите сотрудника для переназначения дела",
                },
            }
        },
        biometric: {
            biometric_registration: {
                page_title: "Регистрация биометрии",
                page_description: "Пожалуйста, убедитесь, что Ваше лицо хорошо видно и Вы находитесь в хорошо освещенном месте без посторонних лиц в кадре. Нажмите кнопку ниже, чтобы начать процесс аутентификации.",
                camera_access_error: "Не удалось получить доступ к камере. Пожалуйста, разрешите доступ.",
                ws_connection_established: "WebSocket соединение установлено.",
                ws_connection_closed: "WebSocket соединение закрыто.",
                ws_connection_error: "Произошла ошибка при установлении соединения с сервером.",

                registration_in_progress: "Идет регистрация...",
                seconds: "секунд(ы)",
                start_registration_button: "Начать регистрацию",
            },
            biometric_authentication: {
                page_title: "Биометрическая аутентификация",
                start_authentication_button: "Начать аутентификацию",
                authentication_in_progress: "Идет аутентификация...",
                auth_success_message: "Биометрическая аутентификация успешно пройдена.",
                auth_failed: "Не удалось подтвердить биометрические данные. Попробуйте еще раз.",
            },
        }
    }
}

const kz = {
    translation: {
        common: {
            buttons: {
                cancel: 'Болдырмау',
                create: 'Жасау',
                yes: 'Иә',
                no: 'Жоқ',
                save_changes: 'Өзгерістерді сақтау',
                upload_files: 'Файлдарды жүктеу',
                export: 'Экспорт',
                export_pdf: 'PDF форматына экспорт',
                export_excel: 'Excel форматына экспорт',
                creating: 'Жасалуда...',
                find: 'Іздеу',
                pdf: 'PDF жасау',
                yes_print: 'Иә, басып шығару',
                confirm: 'Растау',
                reassign: 'Қайта тағайындау',
                add: 'Қосу',
                close: 'Жабу',
                print: 'Басып шығару',
                clear_button: 'Тазалау',
                scan_barcode: 'Штрихкод сканерлеу',
                button_print_barcode: 'Штрихкоды басып шығару',
                find_button: 'Іздеу',
                download_doc: 'Құжатты жүктеу',
                activate: 'Белсендіру',
                deactivate: 'Бұғаттау'
            },
            standard: {
                label_department: 'Бөлім',
                option_all_departments: 'Барлық бөлімдер',
                label_employee: 'Қызметкер',
                option_all_employees: 'Барлық қызметкерлер',
                label_date_from: 'Басталу күні',
                label_date_to: 'Аяқталу күні',
                label_first_name: 'Есім',
                label_last_name: 'Тегі',
                label_evidence_type: 'Дәлел түрі',
                label_role: 'Рөлі',
                label_rank: 'Дәрежесі',
                information: "Ақпарат",
                evidence: "Дәлелдер",
            },
            sorts: {
                asc: 'Өсу реті',
                desc: 'Кему реті'
            },
            logo_alt: 'ІІМ логотипі',
            messages: {
                no_data: 'Деректер жоқ',
                no_description: 'Сипаттама жоқ',
                no_available_employees: 'Қол жетімді қызметкерлер жоқ',
                not_specified: 'Көрсетілмеген',
                no_data_views: 'Көрсету үшін деректер жоқ',
                no_access_message: 'Бұл істі қарауға құқығыңыз жоқ',
                no_evidences: 'Дәлелдер жоқ',
                empty_group_evidences: 'Бұл топта дәлелдер жоқ',
                empty_history_logs: 'Өзгерістер тарихы жазбалары жоқ',
                no_change_data: 'Өзгерістер туралы деректер жоқ',
                file_not_found: 'Файл табылмады',
                not_selected: 'Таңдалмады',

                unknown: 'Белгісіз',

                object_deleted: 'Нысан жойылды',

                excel_loading: 'Экспорт дайындап жатыр...',
                status_emp_changed: 'Қызметкердің статусы өзгертілді',

                success_status_update: 'Дәлелдің статусы жаңартылды',
                biometric_canceled: 'Биометриялық аутентификация болдырылды'
            },
            barcode: {
                no_barcode: 'Штрихкод жоқ',
                no_barcode_error: 'Дәлелге тиесілі штрихкод қолжетімсіз',
                barcode_unavailable: 'Штрихкод қолжетімсіз',
                barcode_group_unavailable: 'Топтың штрихкоды қолжетімсіз',

                dialog_title: 'Штрихкодты сканерлеу',
                label_barcode: 'Штрихкод',
                error_no_barcode: 'Штрихкодты енгізіңіз немесе сканерлеңіз',
                error_find_case: 'Штрихкод арқылы істі іздеу қатесі'
            },
            errors: {
                error_no_data_for_export: 'Экспорттауға деректер жоқ',
                error_export_excel: 'Excel-ге экспорттауда қате кетті',
                error_fetch_data: 'Деректерді алу барысында қате болды',
                error_fill_required_fields: 'Міндетті жолдарды толтырыңыз',
                error_fill_form: 'Формадағы қателерді түзетіңіз',
                error_alert: 'Қате',

                error_file_upload: 'Файлды жүктеу қатесі',
                error_load_documents: 'Құжаттарды жүктеу қатесі',
                error_select_files: 'Жүктеу үшін файлдарды таңдаңыз',
                error_fetch_documents_log: 'Құжаттарды алу қатесі:',
                error_select_document: 'Пайдаланылатын құжатты таңдаңыз',
                error_file_update: 'Құжатты жаңарту қатесі',

                error_case_updated: 'Істі жаңарту қатесі',
                error_load_case: 'Істі жүктеу қатесі',
                error_load_history_edits: 'Өзгеріс тарихын жүктеу қатесі',
                error_load_groups: 'Топтарды алу қатесі',
                error_update_status_case: 'Іс статусы өзгерту қатесі',
                error_get_investigator_name: 'Тергеушінің толық есімін алу қатесі',
                error_no_department: 'Қайта тағайындау үшін бөлімді таңдаңыз',
                error_case_reassign: 'Істі қайта тағайындауда қате болды',
                error_add_evidence: 'Дәлелді қосу қате болды',
                error_add_group: 'Топты қосу қате болды',
                error_status_update: 'Дәлел статусын жаңартуда қате',

                error_load_departments: 'Бөлімдерді жүктеу қатесі',
                error_department_no_region: 'Таңдалған бөлім сіздің аймаққа жатпайды',

                error_export_users: 'Қызметкерлерді экспорттау қатесі',
                error_load_employees: 'Қызметкерлерді жүктеу қатесі',
                error_get_sessions_msg: 'Сессия деректерін алу қатесі',
                error_add_employee: 'Қызметкерді қосу қате болды',
                error_status_emp_changed: 'Қызметкер статусын өзгерту қате болды',
                error_deactivate_your_account: 'Өзіңізді өзіңіз деактивтеу мүмкін емес',
                error_no_employee: 'Қайта тағайындалатын қызметкерді таңдаңыз',

                error_fetch_evidences: 'Дәлелдерді алу қатесі',
                error_export_evidences: 'Дәлелдерді экспорттауда қате'
            },
            success: {
                export_excel_success: 'Excel-ге экспорт сәтті аяқталды',

                success_case_reassigned: 'Іс сәтті қайта тағайындалды',
                success_case_updated: 'Іс сәтті жаңартылды',

                success_files_uploaded: 'Файлдар сәтті жүктелді',
                success_file_update: 'Құжат сәтті жаңартылды:',

                success_alert: 'Сәтті',

                success_add_evidence: 'Дәлел сәтті қосылды',
                success_add_group: 'Топ сәтті қосылды'
            },
            status: {
                active: 'Белсенді',
                closed: 'Жабық',
                online: 'Желіде',
                offline: 'Желіде емес',
                inactive: 'Бейтарап',
                now_active: 'Белсенді',
                never: 'Ешқашан'
            },
            status_evidences: {
                in_storage: "Сақтауда",
                destroyed: "Жойылды",
                taken: "Қайтарылды",
                on_examination: "Сараптамада",
                archived: "Тергеушіге берілді"
            },
            evidence_types: {
                firearm: "Ату қаруы",
                cold_weapon: "Суық қару",
                drugs: "Есірткі",
                other: "Басқа"
            },
            fields: {
                name: "Атауы",
                description: "Сипаттамасы",
                status: "Мәртебесі",
                type: "Заттай дәлел түрі",
                updated: "Жаңартылды",
                created: "Құрылды",
                case: "Іс",
                group: "Топ",
                creator: "Құрушы",
                investigator: "Тергеуші",
                department: "Бөлімше"
            },
            action_message: {
                create_case: "Іс құру",
                edit_data_case: "Іс деректерін өзгерту",
                added_evidence: "Заттай дәлел қосылды",
                edit_status_evidence: "Заттай дәлел мәртебесі өзгертілді",
                added_file: "Файл қосылды",
            },
            table_headers: {
                number: '№',
                title_and_description: 'Атауы мен сипаттамасы',
                name: 'Атауы',
                description: 'Сипаттамасы',
                case_name_investigator: 'Іс атауы және тергеуші',

                investigator_dept_region: 'Тергеуші, бөлім және аймақ',
                investigator: 'Тергеуші',

                change_date_user: 'Күні мен уақыты',

                full_name_and_rank: 'Есім және дәреже',
                full_name_email_phone: 'Есім, e-mail және телефон',

                role_rank: 'Дәреже және рөл',

                email_and_phone: 'E-mail және телефон',

                department_and_region: 'Бөлім және аймақ',
                region_department: 'Аймақ және бөлім',

                status: 'Статус',
                type_status: 'Түрі және статусы',

                sessions: 'Сессиялар',

                cases: 'Істер',
                case_investigator: 'Іс және тергеуші',

                created: 'Жасалған',
                updated: 'Жаңартылған',

                evidence: 'Дәлел',
                name_evidence: 'Дәлел атауы',
                description_evidence: 'Дәлел сипаттамасы',
                type_status_evidence: 'Дәлел түрі мен статусы',

                actions: 'Әрекет',

                group: 'Топ',
                change_user: 'Пайдаланушы',
                change_data: 'Өзгерістер'
            },
            table_data: {
                not_assigned: 'Тағайындалмаған',
                no_name: 'Атауы жоқ',
                description_not_specified: 'Сипаттамасы көрсетілмеген',

                field_old_new_separator: ' → ',
                field_separator: '; ',

                system_user: 'Жүйе'
            },
            report: {
                titles: {
                    report_case: "Іс бойынша есеп",
                    report_cases: "Істер бойынша есеп",
                    report_case_name: "Іс бойынша есеп: {{caseName}}",
                    file_name_case: "Іс_бойынша_есеп_",
                    file_name_cases: "Істер_бойынша_есеп",
                    case_info: "Іс туралы ақпарат",

                    report_login_data_employee: "Қызметкердің кіру деректері",
                    stats_employees: "Қызметкерлер статистикасы",
                    stats_employee: "Қызметкер статистикасы",
                    file_name_stats: "Қызметкерлер_статистикасы",
                    file_name_employees: "Қызметкерлер_бойынша_есеп",
                    file_name_data_employee: "Кіру_деректері_",
                    file_name_employee: "Қызметкер_бойынша_есеп",
                    file_name_sessions: "Қызметкерлер_сессиясы_бойынша_есеп",
                    report_sessions_employees: "Қызметкерлер сессиясы бойынша есеп",
                    report_employees: "Қызметкерлер бойынша есеп",
                    report_employee: "Қызметкер бойынша есеп",
                    report_employee_name: "Қызметкер бойынша есеп: {{employeeName}}",
                    cases_employee: "Қызметкердің істері",
                    evidence_employee: "Қызметкердің істеріне қатысты дәлелдер",

                    file_name_evidence: "Вещественные_дәлелдер_бойынша_есеп.xlsx",
                    report_evidence: "Вещественные дәлелдер бойынша есеп",
                    evidence_table: "Вещественные дәлелдер",

                    history_title: "Өзгерістер тарихы",
                },
                employee_label: 'Қызметкер:',
                filter_date_created: 'Жасалған уақыты: {{dateFrom}} - {{dateTo}}',
                created_date_label: 'Жасалған күні:',
                updated_date_label: 'Жаңартылған күні:',
                date_added_label: 'Қосылған күні:',
                report_date_label: 'Есеп күні:',
                report_date: 'Есеп күні: {{reportDate}}',
                search_label: 'Іздеу:',
                department_label: 'Бөлім:',

                employee_received: 'Қабылдаған: {{employeeName}}',

                type_label: 'Дәлел түрі:',
                status_label: 'Дәлел статусы:',

                cases_total: 'Барлығы',
                cases_opened: 'Ашық',

                tooltip_cases_total: 'Істердің жалпы саны',
                tooltip_cases_opened: 'Ашық істер саны',
                tooltip_cases_closed: 'Жабық істер саны',

                investigator_and_department: 'Тергеуші және бөлім',
                created_updated_date: 'Жасалу және жаңарту уақыты',
                date_created: 'Жасалған күні',
                date_updated: 'Жаңартылған күні',
                period: "Кезең:",
                from: "бастап",
                to: "дейін",

                investigator_label: 'Тергеуші:',
                region_label: 'Аймақ:',
                case_description_label: 'Іс сипаттамасы:',

                login: 'Кіру',
                logout: 'Шығу',
                field: 'Өріс',
                value: 'Мән',

                footer_message: '© {{currentYear}} Қазақстан Республикасы Ішкі істер министрлігі'
            },
            toolbar: {
                label_date_range: 'Жасалған күні'
            },
            logins: {
                input_name: 'Пайдаланушы аты',
                password: 'Құпия сөз',
                label_confirm_password: 'Құпия сөзді растаңыз',
                label_email: 'Электрондық пошта',
                label_phone_number: 'Телефон нөмірі',
                role_user: 'Қарапайым пайдаланушы',
                role_department_head: 'Бөлім басшысы'
            }
        },
        header: {
            logout: 'Шығу'
        },
        login_page: {
            title: 'Кіру',
            button_login: 'Кіру',
            download_cert: 'Сертификатты жүктеу',
            open_manual: 'Нұсқаулықты ашу'
        },
        dashboard: {
            my_cases: 'Менің істерім',
            tabs: {
                cases: {
                    title: 'Істер',
                    toolbar: {
                        search_placeholder: 'Іс атауы, сипаттамасы немесе тергеушінің аты бойынша іздеу',
                        button_add_case: 'Іс қосу',
                        button_open_case: 'Істі ашу'
                    },
                    dialog_new_affairs: {
                        dialog_title: 'Жаңа іс қосу',
                        error_create_case: 'Іс құру қатесі',
                        success_case_created: 'Іс сәтті құрылды'
                    }
                },
                employees: {
                    title: 'Қызметкерлер',
                    dialog_export: {
                        title: 'Қызметкерлер сессия есебін экспорттау'
                    },
                    dialog_new_employee: {
                        title: 'Жаңа қызметкер қосу',
                        error: {
                            password_length: 'Құпия сөз кемінде 8 таңба болуы керек',
                            password_confirm: 'Құпия сөздер сәйкес келмейді',
                            email_required: 'Электрондық пошта міндетті',
                            email_incorrect: 'Дұрыс электрондық пошта енгізіңіз',
                            select_department: 'Жаңа қызметкер үшін бөлімді таңдаңыз',
                            no_permission: 'Сізге пайдаланушыларды құруға рұқсат жоқ'
                        },
                        success_employee_added: 'Қызметкер сәтті қосылды'
                    },
                    dialog_print_new_emp: {
                        message_employee_added: 'Қызметкер {{employeeName}} сәтті қосылды',
                        message_print_login_data: 'Қызметкердің кіру деректерін басып шығарғыңыз келе ме?'
                    },
                    employees_report_session_pdf: {
                        session_in: 'Кіру:',
                        session_out: 'Шығу:'
                    },
                    tableSessions: {
                        tooltip_last_login: 'Соңғы кіру',
                        tooltip_last_logout: 'Соңғы шығу'
                    },
                    toolbar: {
                        search_placeholder: 'Аты, дәрежесі, рөлі немесе email бойынша іздеу',
                        date_last_login_label: 'Соңғы кіру күні',
                        button_add_employee: 'Қызметкер қосу'
                    }
                },
                camera: {
                    title: 'Камералар'
                },
                search_evidence: {
                    title: 'Дәлелдерді іздеу',
                    toolbar: {
                        label_search_query: 'Атауы, сипаттамасы, штрихкод немесе іс деректері бойынша іздеу',
                        option_all_types: 'Барлық түрлер',
                        label_evidence_status: 'Дәлел статусы',
                        option_all_statuses: 'Барлық статустар'
                    },
                    evidence_table: {
                        column_evidence: 'Дәлел'
                    }
                }
            }
        },
        documents: {
            documents_title: 'Құжаттар',
            document: 'Құжат',
            dropzone_hint_inactive: 'Файлдарды осында апарып тастаңыз немесе таңдау үшін басыңыз',
            dropzone_hint_active: 'Файлдарды жүктеу үшін жіберіңіз',
            files_to_upload: 'Жүктелетін файлдар:',
            file_description_label: 'Файл сипаттамасы',
            button_upload_files: 'Файлдарды жүктеу',
            attached_documents_label: 'Тіркелген құжаттар:',
            no_attached_documents: 'Тіркелген құжаттар жоқ',
            upload_progress: 'Жүктелуде...',
            uploaded_date: 'Жүктелген күні'
        },
        cases: {
            case_default: 'Іс',
            investigator_label: 'Іс тергеушісі:',
            case_name_label: 'Іс атауы',
            case_description_label: 'Іс сипаттамасы',
            case_activated: 'Іс белсендірілді',
            case_closed: 'Іс жабылды',
            pdf_export_loading: 'PDF дайындалуда...',
            title: 'Іс жайлы мәлімет',
            reassign_case_button: 'Істі қайта тағайындау',
            close_case_button: 'Істі жабу',
            activate_case_button: 'Істі белсендіру'
        },
        case_detail: {
            tabs: {
                evidence: {
                    button_add_group: 'Топ қосу',
                    button_add_evidence: 'Дәлел қосу',
                    label_storage_place: 'Сақтау орны'
                }
            },
            components: {
                dialog_alert_new_status: {
                    title: 'Дәлел статусын өзгерту',
                    description: 'Осы әрекетке негіз болатын құжатты таңдаңыз'
                },
                dialog_change_investigator: {
                    title_dialog: 'Істі қайта тағайындау үшін қызметкерді таңдаңыз'
                }
            }
        },
        biometric: {
            biometric_registration: {
                page_title: 'Биометриялық тіркеу',
                page_description: 'Бетіңіз анық көрінетіндей орналасып...',
                camera_access_error: 'Камераға қолжетімділік болмады. Рұқсат беріңіз',
                ws_connection_established: 'WebSocket байланысы орнатылды',
                ws_connection_closed: 'WebSocket байланысы жабылды',
                ws_connection_error: 'Сервермен WebSocket қосылуына қате',

                registration_in_progress: 'Тіркелу үдерісі жүріп жатыр...',
                seconds: 'секунд(тар)',
                start_registration_button: 'Тіркеуді бастау'
            },
            biometric_authentication: {
                page_title: 'Биометриялық аутентификация',
                start_authentication_button: 'Аутентификацияны бастау',
                authentication_in_progress: 'Аутентификация жүріп жатыр...',
                auth_success_message: 'Биометриялық аутентификация сәтті өтті',
                auth_failed: 'Биометриялық деректерді растау мүмкін болмады. Қайта көріңіз'
            }
        }
    }
}

export { en, ru, kz }