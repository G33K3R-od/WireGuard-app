import type { RuntimeState } from "../electron/shared/types";

export type UiLanguage = "ru" | "en";

export type I18nKey =
  | "app.subtitle"
  | "nav.connect"
  | "nav.profiles"
  | "nav.settings"
  | "nav.logs"
  | "common.refresh"
  | "common.sections"
  | "status.disconnected"
  | "status.connecting"
  | "status.connected"
  | "status.error"
  | "connect.title"
  | "connect.desc"
  | "connect.releasesLink"
  | "connect.currentProfile"
  | "connect.notSelected"
  | "connect.server"
  | "connect.missingRuntimeTitle"
  | "connect.missingRuntimeHint"
  | "connect.missingRuntimeRefreshHint"
  | "connect.readmeSee"
  | "connect.connectBtn"
  | "connect.disconnectBtn"
  | "connect.componentsTitle"
  | "connect.componentFound"
  | "connect.componentMissing"
  | "connect.profilesCount"
  | "profiles.title"
  | "profiles.desc"
  | "profiles.newProfile"
  | "profiles.name"
  | "profiles.namePlaceholder"
  | "profiles.conf"
  | "profiles.confPlaceholder"
  | "profiles.import"
  | "profiles.importing"
  | "profiles.importNoName"
  | "profiles.importShortConf"
  | "profiles.importFailed"
  | "profiles.saved"
  | "profiles.empty"
  | "profiles.active"
  | "profiles.makeActive"
  | "profiles.mode"
  | "profiles.mode.full"
  | "profiles.mode.split"
  | "profiles.delete"
  | "settings.title"
  | "settings.desc"
  | "settings.startWithWindows"
  | "settings.startWithWindowsDesc"
  | "settings.autoReconnect"
  | "settings.autoReconnectDesc"
  | "settings.theme"
  | "settings.themeDesc"
  | "settings.theme.light"
  | "settings.theme.system"
  | "settings.theme.dark"
  | "settings.language"
  | "settings.languageDesc"
  | "settings.language.ru"
  | "settings.language.en"
  | "settings.debug"
  | "settings.debugDesc"
  | "settings.save"
  | "settings.yes"
  | "settings.no"
  | "settings.currentValues"
  | "logs.title"
  | "logs.desc"
  | "logs.entries"
  | "logs.copy"
  | "logs.empty"
  | "logs.aria"
  | "tray.show"
  | "tray.connect"
  | "tray.disconnect"
  | "tray.quit";

const dict: Record<UiLanguage, Record<I18nKey, string>> = {
  ru: {
    "app.subtitle": "WireGuard для Windows",
    "nav.connect": "Подключение",
    "nav.profiles": "Профили",
    "nav.settings": "Настройки",
    "nav.logs": "Журнал",
    "common.refresh": "Обновить данные",
    "common.sections": "Разделы",
    "status.disconnected": "Отключено",
    "status.connecting": "Подключение…",
    "status.connected": "Подключено",
    "status.error": "Ошибка",
    "connect.title": "Подключение",
    "connect.desc": "Выберите профиль и подключитесь к VPN. Статус и диагностика обновляются автоматически.",
    "connect.releasesLink": "Релизы и установщики на GitHub",
    "connect.currentProfile": "Текущий профиль",
    "connect.notSelected": "Не выбран",
    "connect.server": "Сервер",
    "connect.missingRuntimeTitle": "Нет файлов WireGuard runtime.",
    "connect.missingRuntimeHint": "Положите в папку:",
    "connect.missingRuntimeRefreshHint": "После копирования нажмите «Обновить данные» в боковой панели.",
    "connect.readmeSee": "см.",
    "connect.connectBtn": "Подключиться",
    "connect.disconnectBtn": "Отключить",
    "connect.componentsTitle": "Состояние компонентов",
    "connect.componentFound": "Найден",
    "connect.componentMissing": "Нет файла",
    "connect.profilesCount": "Профилей",
    "profiles.title": "Профили",
    "profiles.desc": "Импортируйте конфиг WireGuard и выберите активный профиль для подключения.",
    "profiles.newProfile": "Новый профиль",
    "profiles.name": "Имя",
    "profiles.namePlaceholder": "Например: Работа",
    "profiles.conf": "Содержимое .conf",
    "profiles.confPlaceholder": "Вставьте полный текст конфигурации WireGuard…",
    "profiles.import": "Импортировать",
    "profiles.importing": "Импорт…",
    "profiles.importNoName": "Укажите имя профиля.",
    "profiles.importShortConf": "Текст конфига слишком короткий. Вставьте полный .conf.",
    "profiles.importFailed": "Импорт не удался",
    "profiles.saved": "Сохранённые профили",
    "profiles.empty": "Профилей пока нет. Импортируйте конфиг выше.",
    "profiles.active": "Активен",
    "profiles.makeActive": "Сделать активным",
    "profiles.mode": "Режим",
    "profiles.mode.full": "Полный туннель",
    "profiles.mode.split": "Split routes",
    "profiles.delete": "Удалить",
    "settings.title": "Настройки",
    "settings.desc": "Поведение приложения и интерфейса.",
    "settings.startWithWindows": "Запускать вместе с Windows",
    "settings.startWithWindowsDesc": "WirePN стартует при входе в систему.",
    "settings.autoReconnect": "Автопереподключение",
    "settings.autoReconnectDesc": "Пытаться восстановить туннель после неожиданного обрыва.",
    "settings.theme": "Тема",
    "settings.themeDesc": "Светлая, системная или тёмная тема интерфейса.",
    "settings.theme.light": "Светлая",
    "settings.theme.system": "Системная",
    "settings.theme.dark": "Тёмная",
    "settings.language": "Язык",
    "settings.languageDesc": "Язык интерфейса приложения.",
    "settings.language.ru": "Русский",
    "settings.language.en": "English",
    "settings.debug": "Отладка",
    "settings.debugDesc": "Показывать вкладку журнала и блок состояния компонентов на странице подключения.",
    "settings.save": "Сохранить",
    "settings.yes": "да",
    "settings.no": "нет",
    "settings.currentValues": "Текущие значения",
    "logs.title": "Журнал",
    "logs.desc": "События подключения и диагностика. Можно скопировать целиком для отчёта.",
    "logs.entries": "записей",
    "logs.copy": "Скопировать журнал",
    "logs.empty": "Записей пока нет.",
    "logs.aria": "Журнал событий",
    "tray.show": "Показать WirePN",
    "tray.connect": "Connect",
    "tray.disconnect": "Disconnect",
    "tray.quit": "Выход"
  },
  en: {
    "app.subtitle": "WireGuard for Windows",
    "nav.connect": "Connect",
    "nav.profiles": "Profiles",
    "nav.settings": "Settings",
    "nav.logs": "Logs",
    "common.refresh": "Refresh",
    "common.sections": "Sections",
    "status.disconnected": "Disconnected",
    "status.connecting": "Connecting…",
    "status.connected": "Connected",
    "status.error": "Error",
    "connect.title": "Connection",
    "connect.desc": "Choose a profile and connect to VPN. Status and diagnostics update automatically.",
    "connect.releasesLink": "Releases and installers on GitHub",
    "connect.currentProfile": "Current profile",
    "connect.notSelected": "Not selected",
    "connect.server": "Server",
    "connect.missingRuntimeTitle": "WireGuard runtime files are missing.",
    "connect.missingRuntimeHint": "Place files into:",
    "connect.missingRuntimeRefreshHint": "After copying files, click Refresh in the sidebar.",
    "connect.readmeSee": "see",
    "connect.connectBtn": "Connect",
    "connect.disconnectBtn": "Disconnect",
    "connect.componentsTitle": "Components status",
    "connect.componentFound": "Found",
    "connect.componentMissing": "Missing",
    "connect.profilesCount": "Profiles",
    "profiles.title": "Profiles",
    "profiles.desc": "Import WireGuard config and choose an active profile.",
    "profiles.newProfile": "New profile",
    "profiles.name": "Name",
    "profiles.namePlaceholder": "Example: Work",
    "profiles.conf": ".conf content",
    "profiles.confPlaceholder": "Paste full WireGuard config text…",
    "profiles.import": "Import",
    "profiles.importing": "Importing…",
    "profiles.importNoName": "Enter profile name.",
    "profiles.importShortConf": "Config text is too short. Paste full .conf.",
    "profiles.importFailed": "Import failed",
    "profiles.saved": "Saved profiles",
    "profiles.empty": "No profiles yet. Import config above.",
    "profiles.active": "Active",
    "profiles.makeActive": "Set active",
    "profiles.mode": "Mode",
    "profiles.mode.full": "Full tunnel",
    "profiles.mode.split": "Split routes",
    "profiles.delete": "Delete",
    "settings.title": "Settings",
    "settings.desc": "Application and interface behavior.",
    "settings.startWithWindows": "Start with Windows",
    "settings.startWithWindowsDesc": "WirePN starts on system sign-in.",
    "settings.autoReconnect": "Auto reconnect",
    "settings.autoReconnectDesc": "Try to restore tunnel after unexpected drop.",
    "settings.theme": "Theme",
    "settings.themeDesc": "Light, system, or dark app theme.",
    "settings.theme.light": "Light",
    "settings.theme.system": "System",
    "settings.theme.dark": "Dark",
    "settings.language": "Language",
    "settings.languageDesc": "Application interface language.",
    "settings.language.ru": "Russian",
    "settings.language.en": "English",
    "settings.debug": "Debug",
    "settings.debugDesc": "Show Logs tab and components status block on Connection page.",
    "settings.save": "Save",
    "settings.yes": "yes",
    "settings.no": "no",
    "settings.currentValues": "Current values",
    "logs.title": "Logs",
    "logs.desc": "Connection events and diagnostics. You can copy all entries for reports.",
    "logs.entries": "entries",
    "logs.copy": "Copy logs",
    "logs.empty": "No entries yet.",
    "logs.aria": "Event log",
    "tray.show": "Show WirePN",
    "tray.connect": "Connect",
    "tray.disconnect": "Disconnect",
    "tray.quit": "Quit"
  }
};

export const t = (lang: UiLanguage, key: I18nKey): string => dict[lang][key];

export const statusText = (lang: UiLanguage, status: RuntimeState["status"]): string => t(lang, `status.${status}` as I18nKey);
