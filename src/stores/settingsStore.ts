import logger from "../logger";
import { Settings } from "../models/settings";
import { Db } from "mongodb";
import { Document } from "mongoose";
export class SettingsStore {
  public async getSettings(guildId: string): Promise<Settings & Document> {
    const s = await Settings.findById(guildId);
    if (!s) {
      throw new Error("Guild not found");
    }
    return s;
  }
  public async getAllSettings(): Promise<Settings[]> {
    return await Settings.find();
  }
}
