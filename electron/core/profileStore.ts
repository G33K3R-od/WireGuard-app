import { app, safeStorage } from "electron";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ProfileMode, VpnProfile } from "../shared/types";
import { buildWireguardConfFile, parseWireguardConf } from "./confParser";

interface ProfileDb {
  activeProfileId?: string;
  profiles: VpnProfile[];
}

const DB_FILE = "profiles.json";

export class ProfileStore {
  private readonly filePath: string;
  private db: ProfileDb = { profiles: [] };

  constructor() {
    const dir = join(app.getPath("userData"), "wirepn");
    mkdirSync(dir, { recursive: true });
    this.filePath = join(dir, DB_FILE);
    this.load();
  }

  private encrypt(value: string): string {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(value).toString("base64");
    }
    return Buffer.from(value, "utf-8").toString("base64");
  }

  decrypt(value: string): string {
    const bin = Buffer.from(value, "base64");
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(bin);
    }
    return bin.toString("utf-8");
  }

  private load(): void {
    if (!existsSync(this.filePath)) {
      this.save();
      return;
    }
    this.db = JSON.parse(readFileSync(this.filePath, "utf-8")) as ProfileDb;
  }

  private save(): void {
    writeFileSync(this.filePath, JSON.stringify(this.db, null, 2), "utf-8");
  }

  importConf(name: string, conf: string): VpnProfile {
    const normalizedName = name.trim();
    if (this.db.profiles.some((p) => p.name.trim().toLowerCase() === normalizedName.toLowerCase())) {
      throw new Error("WIREPN:duplicate_name");
    }
    const parsed = parseWireguardConf(normalizedName, conf);
    const profile: VpnProfile = {
      id: parsed.id,
      name: parsed.name,
      endpoint: parsed.endpoint,
      address: parsed.address,
      dns: parsed.dns,
      allowedIps: parsed.allowedIps,
      mode: "full",
      publicKey: parsed.publicKey,
      privateKeyEncrypted: this.encrypt(parsed.privateKey),
      createdAt: new Date().toISOString()
    };

    this.db.profiles.push(profile);
    if (!this.db.activeProfileId) {
      this.db.activeProfileId = profile.id;
    }
    this.save();
    return profile;
  }

  list(): VpnProfile[] {
    return [...this.db.profiles];
  }

  getActiveProfile(): VpnProfile | undefined {
    return this.db.profiles.find((p) => p.id === this.db.activeProfileId);
  }

  setActiveProfile(profileId: string): VpnProfile {
    const profile = this.db.profiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    this.db.activeProfileId = profileId;
    this.save();
    return profile;
  }

  setProfileMode(profileId: string, mode: ProfileMode): VpnProfile {
    const profile = this.db.profiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    profile.mode = mode;
    this.save();
    return profile;
  }

  remove(profileId: string): void {
    this.db.profiles = this.db.profiles.filter((p) => p.id !== profileId);
    if (this.db.activeProfileId === profileId) {
      this.db.activeProfileId = this.db.profiles[0]?.id;
    }
    this.save();
  }

  exportConf(profileId: string): string {
    const profile = this.db.profiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    const priv = this.decrypt(profile.privateKeyEncrypted);
    return buildWireguardConfFile(profile, priv);
  }
}
