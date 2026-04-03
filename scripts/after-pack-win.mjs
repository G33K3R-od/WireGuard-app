import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rcedit } from "rcedit";

const projectDir = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * With `signAndEditExecutable: false`, electron-builder skips winCodeSign/rcedit (avoids symlink errors on Windows).
 * We still embed requireAdministrator + icon via the npm `rcedit` binary (no winCodeSign archive).
 */
export default async function afterPack(context) {
  if (context.electronPlatformName !== "win32") {
    return;
  }
  const exe = join(context.appOutDir, `${context.packager.appInfo.productFilename}.exe`);
  const icon = join(projectDir, "build", "icon.ico");
  await rcedit(exe, {
    "requested-execution-level": "requireAdministrator",
    icon
  });
}
