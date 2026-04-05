import type { RuntimeState } from "../electron/shared/types";
import { RuntimeErrorCode } from "../electron/shared/runtimeErrorCodes";

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
  | "connect.errorTitle"
  | "connect.readmeSee"
  | "connect.connectBtn"
  | "connect.disconnectBtn"
  | "connect.componentsTitle"
  | "connect.componentFound"
  | "connect.componentMissing"
  | "connect.profilesCount"
  | "connect.statsTitle"
  | "connect.stats.rx"
  | "connect.stats.tx"
  | "connect.stats.handshake"
  | "connect.stats.connectedFor"
  | "connect.stats.na"
  | "connect.stats.handshakePending"
  | "connect.ping"
  | "connect.pingHint"
  | "connect.pingRun"
  | "connect.pingMs"
  | "connect.pingFail"
  | "connect.pingOnlyWindows"
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
  | "profiles.pickFile"
  | "profiles.exportConf"
  | "profiles.exportFailed"
  | "profiles.err.zod_name"
  | "profiles.err.zod_conf"
  | "profiles.err.zod_invalid"
  | "profiles.err.duplicate_name"
  | "profiles.err.empty_conf"
  | "profiles.err.missing_private_key"
  | "profiles.err.missing_address"
  | "profiles.err.missing_endpoint"
  | "profiles.err.missing_public_key"
  | "profiles.saved"
  | "profiles.empty"
  | "profiles.active"
  | "profiles.makeActive"
  | "profiles.mode"
  | "profiles.mode.full"
  | "profiles.mode.split"
  | "profiles.delete"
  | "profiles.routingTitle"
  | "profiles.routingBody"
  | "profiles.routingModesHint"
  | "profiles.routingAllowedIps"
  | "onboarding.title"
  | "onboarding.uac"
  | "onboarding.import"
  | "onboarding.links"
  | "onboarding.readme"
  | "onboarding.releases"
  | "onboarding.dismiss"
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
  | "settings.diagnosticsTitle"
  | "settings.diagnosticsDesc"
  | "settings.diagnosticsLoading"
  | "settings.diagnosticsStaleHint"
  | "settings.copySupportInfo"
  | "settings.copied"
  | "settings.updatesTitle"
  | "settings.updatesDesc"
  | "settings.updatesCheck"
  | "settings.updatesChecking"
  | "settings.updatesCurrent"
  | "settings.updatesAvailable"
  | "settings.updatesNone"
  | "settings.updatesError"
  | "settings.updatesDownload"
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
    "connect.errorTitle": "Ошибка подключения",
    "connect.readmeSee": "см.",
    "connect.connectBtn": "Подключиться",
    "connect.disconnectBtn": "Отключить",
    "connect.componentsTitle": "Состояние компонентов",
    "connect.componentFound": "Найден",
    "connect.componentMissing": "Нет файла",
    "connect.profilesCount": "Профилей",
    "connect.statsTitle": "Статистика туннеля",
    "connect.stats.rx": "Принято",
    "connect.stats.tx": "Отправлено",
    "connect.stats.handshake": "Последний handshake",
    "connect.stats.connectedFor": "Подключено",
    "connect.stats.na": "—",
    "connect.stats.handshakePending": "Ожидание handshake",
    "connect.ping": "Пинг до сервера",
    "connect.pingHint":
      "ICMP до хоста из Endpoint (активный профиль). Три запроса, показывается среднее время ответа.",
    "connect.pingRun": "Проверить",
    "connect.pingMs": "мс",
    "connect.pingFail": "Нет ответа",
    "connect.pingOnlyWindows": "Пинг доступен только в Windows.",
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
    "profiles.pickFile": "Выбрать файл…",
    "profiles.exportConf": "Экспорт .conf",
    "profiles.exportFailed": "Не удалось экспортировать",
    "profiles.err.zod_name": "Имя профиля: от 1 до 80 символов.",
    "profiles.err.zod_conf": "Вставьте полный текст .conf (не короче 20 символов).",
    "profiles.err.zod_invalid": "Проверьте поля формы импорта.",
    "profiles.err.duplicate_name": "Профиль с таким именем уже есть. Задайте другое имя.",
    "profiles.err.empty_conf": "Конфиг пустой. Вставьте или выберите .conf файл.",
    "profiles.err.missing_private_key": "В [Interface] нет строки PrivateKey.",
    "profiles.err.missing_address": "В [Interface] нет строки Address.",
    "profiles.err.missing_endpoint": "В [Peer] нет строки Endpoint.",
    "profiles.err.missing_public_key": "В [Peer] нет строки PublicKey.",
    "profiles.saved": "Сохранённые профили",
    "profiles.empty": "Профилей пока нет. Импортируйте конфиг выше.",
    "profiles.active": "Активен",
    "profiles.makeActive": "Сделать активным",
    "profiles.mode": "Режим",
    "profiles.mode.full": "Полный туннель",
    "profiles.mode.split": "Split routes",
    "profiles.delete": "Удалить",
    "profiles.routingTitle": "Маршруты и туннель",
    "profiles.routingBody":
      "Какие сети идут через VPN, определяет поле AllowedIPs в импортированном .conf — именно оно попадает в WireGuard при подключении.",
    "profiles.routingModesHint":
      "Метка «Полный туннель» / «Split routes» хранится в профиле для наглядности. Сейчас маршруты в ОС задаёт AllowedIPs из конфига; при смене режима в интерфейсе содержимое .conf не меняется автоматически.",
    "profiles.routingAllowedIps": "AllowedIPs",
    "onboarding.title": "Добро пожаловать в WirePN",
    "onboarding.uac":
      "Приложение запрашивает права администратора: без них WireGuard не сможет поднять туннель в Windows.",
    "onboarding.import":
      "Добавьте профиль на вкладке «Профили»: вставьте текст .conf или выберите файл с сервера.",
    "onboarding.links": "Документация и установщики:",
    "onboarding.readme": "README на GitHub",
    "onboarding.releases": "Релизы",
    "onboarding.dismiss": "Понятно",
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
    "settings.diagnosticsTitle": "Диагностика",
    "settings.diagnosticsDesc":
      "Версия WirePN, среда выполнения и пути — для сообщений об ошибках и поддержки.",
    "settings.diagnosticsLoading": "Загрузка…",
    "settings.diagnosticsStaleHint":
      "Версии не пришли из процесса приложения. Перезапустите после сборки: npm run build, или обновите установщик.",
    "settings.copySupportInfo": "Скопировать сведения",
    "settings.copied": "Скопировано",
    "settings.updatesTitle": "Обновления",
    "settings.updatesDesc":
      "Проверка последнего релиза на GitHub (без автоустановки). Установщик скачивается вручную.",
    "settings.updatesCheck": "Проверить обновления",
    "settings.updatesChecking": "Проверка…",
    "settings.updatesCurrent": "Текущая версия",
    "settings.updatesAvailable": "Доступна новая версия",
    "settings.updatesNone": "У вас уже последняя версия (или не удалось сравнить номера).",
    "settings.updatesError": "Не удалось проверить",
    "settings.updatesDownload": "Скачать релиз",
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
    "connect.errorTitle": "Connection error",
    "connect.readmeSee": "see",
    "connect.connectBtn": "Connect",
    "connect.disconnectBtn": "Disconnect",
    "connect.componentsTitle": "Components status",
    "connect.componentFound": "Found",
    "connect.componentMissing": "Missing",
    "connect.profilesCount": "Profiles",
    "connect.statsTitle": "Tunnel statistics",
    "connect.stats.rx": "Received",
    "connect.stats.tx": "Sent",
    "connect.stats.handshake": "Last handshake",
    "connect.stats.connectedFor": "Connected for",
    "connect.stats.na": "—",
    "connect.stats.handshakePending": "Waiting for handshake",
    "connect.ping": "Ping server",
    "connect.pingHint":
      "ICMP to the active profile’s endpoint host. Three probes; the value is average round-trip time.",
    "connect.pingRun": "Test",
    "connect.pingMs": "ms",
    "connect.pingFail": "No reply",
    "connect.pingOnlyWindows": "Ping is only available on Windows.",
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
    "profiles.pickFile": "Choose file…",
    "profiles.exportConf": "Export .conf",
    "profiles.exportFailed": "Export failed",
    "profiles.err.zod_name": "Profile name must be 1–80 characters.",
    "profiles.err.zod_conf": "Paste full .conf text (at least 20 characters).",
    "profiles.err.zod_invalid": "Check the import form fields.",
    "profiles.err.duplicate_name": "A profile with this name already exists. Choose another name.",
    "profiles.err.empty_conf": "Config is empty. Paste text or pick a .conf file.",
    "profiles.err.missing_private_key": "Missing PrivateKey under [Interface].",
    "profiles.err.missing_address": "Missing Address under [Interface].",
    "profiles.err.missing_endpoint": "Missing Endpoint under [Peer].",
    "profiles.err.missing_public_key": "Missing PublicKey under [Peer].",
    "profiles.saved": "Saved profiles",
    "profiles.empty": "No profiles yet. Import config above.",
    "profiles.active": "Active",
    "profiles.makeActive": "Set active",
    "profiles.mode": "Mode",
    "profiles.mode.full": "Full tunnel",
    "profiles.mode.split": "Split routes",
    "profiles.delete": "Delete",
    "profiles.routingTitle": "Routing and tunnel",
    "profiles.routingBody":
      "Which traffic uses the VPN is determined by AllowedIPs in your imported .conf — that value is what WireGuard applies when you connect.",
    "profiles.routingModesHint":
      "The Full tunnel / Split routes label is stored on the profile for clarity. Routes in Windows still follow AllowedIPs from the config; switching the label here does not rewrite your .conf automatically.",
    "profiles.routingAllowedIps": "AllowedIPs",
    "onboarding.title": "Welcome to WirePN",
    "onboarding.uac":
      "The app asks for administrator rights — WireGuard needs them to bring up a tunnel on Windows.",
    "onboarding.import":
      "Add a profile under Profiles: paste .conf text or pick a file from your server.",
    "onboarding.links": "Docs and installers:",
    "onboarding.readme": "README on GitHub",
    "onboarding.releases": "Releases",
    "onboarding.dismiss": "Got it",
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
    "settings.diagnosticsTitle": "Diagnostics",
    "settings.diagnosticsDesc":
      "WirePN version, runtime, and paths — useful for bug reports and support.",
    "settings.diagnosticsLoading": "Loading…",
    "settings.diagnosticsStaleHint":
      "Version info did not arrive from the app process. Rebuild and restart (npm run build) or reinstall.",
    "settings.copySupportInfo": "Copy support info",
    "settings.copied": "Copied",
    "settings.updatesTitle": "Updates",
    "settings.updatesDesc":
      "Check the latest GitHub release (no auto-install). Download the installer manually.",
    "settings.updatesCheck": "Check for updates",
    "settings.updatesChecking": "Checking…",
    "settings.updatesCurrent": "Current version",
    "settings.updatesAvailable": "A newer version is available",
    "settings.updatesNone": "You are up to date (or version compare was inconclusive).",
    "settings.updatesError": "Check failed",
    "settings.updatesDownload": "Open release download",
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

const runtimeErrRu: Record<string, string> = {
  [RuntimeErrorCode.NO_PROFILE_SELECTED]: "Профиль не выбран.",
  [RuntimeErrorCode.MISSING_WIREGUARD_GO]:
    "Не найден wireguard-go.exe. Положите файл в папку из второй строки ниже; см. runtime/bin/README.txt.",
  [RuntimeErrorCode.MISSING_WINTUN]:
    "Не найден wintun.dll. Положите файл в папку из второй строки ниже; см. wintun.net.",
  [RuntimeErrorCode.WINTUN_ADMIN]:
    "Нужны права администратора: Wintun не может создать адаптер. Запустите WirePN от имени администратора. В режиме разработки запустите терминал или IDE с правами администратора.",
  [RuntimeErrorCode.UAPI_PIPE_OWNER]:
    "Не удалось открыть UAPI pipe WireGuard (ошибка владельца). Пересоберите wireguard-go скриптом scripts/fetch-runtime.ps1 или запустите приложение с правами администратора.",
  [RuntimeErrorCode.WG_GO_EARLY_EXIT]: "Процесс wireguard-go завершился до готовности туннеля (код выхода на второй строке).",
  [RuntimeErrorCode.UAPI_PIPE_NOT_READY]: "Pipe UAPI WireGuard не готов. Подробности на второй строке.",
  [RuntimeErrorCode.UAPI_SET_TIMEOUT]: "Таймаут при настройке UAPI (set).",
  [RuntimeErrorCode.UAPI_SET_FAILED]: "Ошибка UAPI при настройке (set). Подробности на второй строке.",
  [RuntimeErrorCode.UAPI_CLOSED_NO_ERRNO]: "Соединение UAPI закрыто без ответа errno.",
  [RuntimeErrorCode.UAPI_GET_TIMEOUT]: "Таймаут при чтении статистики UAPI (get).",
  [RuntimeErrorCode.TUNNEL_ROUTE_DENIED]:
    "Windows не дала добавить маршруты или DNS (нужны права администратора). Иначе туннель может быть без нужных маршрутов. Подробности ниже.",
  [RuntimeErrorCode.TUNNEL_ROUTE_DUPLICATE]: "Конфликт маршрута при настройке туннеля. Подробности ниже.",
  [RuntimeErrorCode.TUNNEL_ADAPTER_NOT_FOUND]: "Не найден адаптер Wintun (ошибка 1168). Подробности ниже.",
  [RuntimeErrorCode.TUNNEL_POWERSHELL_FAILED]: "Ошибка PowerShell при настройке туннеля. Подробности ниже.",
  [RuntimeErrorCode.PROFILE_NOT_FOUND]: "Профиль не найден.",
  [RuntimeErrorCode.WG_PROCESS_EXITED]: "Процесс WireGuard завершился. Код на второй строке."
};

const runtimeErrEn: Record<string, string> = {
  [RuntimeErrorCode.NO_PROFILE_SELECTED]: "No profile selected.",
  [RuntimeErrorCode.MISSING_WIREGUARD_GO]:
    "wireguard-go.exe not found. Place it in the folder on the second line below; see runtime/bin/README.txt.",
  [RuntimeErrorCode.MISSING_WINTUN]: "wintun.dll not found. Place it in the folder on the second line below; see wintun.net.",
  [RuntimeErrorCode.WINTUN_ADMIN]:
    "Administrator rights are required: Wintun cannot create the adapter. Run WirePN as administrator. For development, run your terminal or IDE elevated.",
  [RuntimeErrorCode.UAPI_PIPE_OWNER]:
    "Could not open the WireGuard UAPI pipe (ownership error). Rebuild wireguard-go with scripts/fetch-runtime.ps1 or run the app as administrator.",
  [RuntimeErrorCode.WG_GO_EARLY_EXIT]: "wireguard-go exited before the tunnel was ready (exit code on the second line).",
  [RuntimeErrorCode.UAPI_PIPE_NOT_READY]: "WireGuard UAPI pipe is not ready. Details on the second line.",
  [RuntimeErrorCode.UAPI_SET_TIMEOUT]: "Timeout while configuring WireGuard UAPI (set).",
  [RuntimeErrorCode.UAPI_SET_FAILED]: "WireGuard UAPI configuration failed (set). Details on the second line.",
  [RuntimeErrorCode.UAPI_CLOSED_NO_ERRNO]: "UAPI connection closed without an errno response.",
  [RuntimeErrorCode.UAPI_GET_TIMEOUT]: "Timeout while reading WireGuard UAPI stats (get).",
  [RuntimeErrorCode.TUNNEL_ROUTE_DENIED]:
    "Windows blocked adding routes or DNS (administrator rights may be required). Traffic may bypass the tunnel. Details below.",
  [RuntimeErrorCode.TUNNEL_ROUTE_DUPLICATE]: "Route conflict while configuring the tunnel. Details below.",
  [RuntimeErrorCode.TUNNEL_ADAPTER_NOT_FOUND]: "Wintun adapter not found (error 1168). Details below.",
  [RuntimeErrorCode.TUNNEL_POWERSHELL_FAILED]: "PowerShell error while configuring the tunnel. Details below.",
  [RuntimeErrorCode.PROFILE_NOT_FOUND]: "Profile not found.",
  [RuntimeErrorCode.WG_PROCESS_EXITED]: "WireGuard process exited. Code on the second line."
};

const runtimeErrByLang: Record<UiLanguage, Record<string, string>> = {
  ru: runtimeErrRu,
  en: runtimeErrEn
};

export const t = (lang: UiLanguage, key: I18nKey): string => dict[lang][key];

/** Map main-process WIREPN_RUNTIME:* errors to the UI language; pass through unknown messages. */
export const mapRuntimeErrorString = (lang: UiLanguage, raw: string): string => {
  const lines = raw.split("\n");
  const code = lines[0]?.trim() ?? "";
  if (!code.startsWith("WIREPN_RUNTIME:")) {
    return raw;
  }
  const translated = runtimeErrByLang[lang][code] ?? runtimeErrByLang.en[code];
  if (!translated) {
    return raw;
  }
  const rest = lines.slice(1).join("\n").trim();
  return rest ? `${translated}\n\n${rest}` : translated;
};

export const mapRuntimeError = (lang: UiLanguage, err: unknown): string => {
  const raw = err instanceof Error ? err.message : String(err);
  return mapRuntimeErrorString(lang, raw);
};

const wirepnImportErrorCodes = [
  "zod_name",
  "zod_conf",
  "zod_invalid",
  "duplicate_name",
  "empty_conf",
  "missing_private_key",
  "missing_address",
  "missing_endpoint",
  "missing_public_key"
] as const;

export const mapWirepnImportError = (lang: UiLanguage, err: unknown): string => {
  const msg = err instanceof Error ? err.message : String(err);
  const m = /^WIREPN:(.+)$/.exec(msg);
  if (m) {
    const code = m[1];
    if ((wirepnImportErrorCodes as readonly string[]).includes(code)) {
      return t(lang, `profiles.err.${code}` as I18nKey);
    }
  }
  return `${t(lang, "profiles.importFailed")}: ${msg}`;
};

export const statusText = (lang: UiLanguage, status: RuntimeState["status"]): string => t(lang, `status.${status}` as I18nKey);
