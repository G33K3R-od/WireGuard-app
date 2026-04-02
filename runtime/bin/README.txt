В эту папку (рядом с package.json: apps/wirepn-windows/runtime/bin) положите:

1) wireguard-go.exe
   Рекомендуется собрать из исходников скриптом apps/wirepn-windows/scripts/fetch-runtime.ps1
   (патч ipc/uapi_windows.go: pipe без ProtectedPrefix, иначе без прав администратора часто
   ошибка «This security ID may not be assigned as the owner»).
   Имя файла должно быть именно wireguard-go.exe

2) wintun.dll
   Официальный драйвер/библиотека: https://www.wintun.net/
   Положите wintun.dll в эту же папку (рядом с wireguard-go.exe).

Без этих файлов кнопка Connect будет неактивна.

В собранном инсталляторе бинарники кладутся в resources/runtime/bin (см. electron-builder extraResources).
