import { Document, model, Schema } from "mongoose";
import { emojiHandler, roleHandler } from "../util";
export type Role = string;
export interface Settings {
  role: Role;
  emoji: string;
  delim: string;
  currencyValue: number;
  currencyName: string;
  photoBill: number;
  backgroundAmount: number;
  guildId: string;
  ignoreRole: Role;
}

export enum SettingType {
  string = "string",
  number = "number",
  Role = "Role",
  Emote = "Emote",
}

export const settingTypes: {
  [key in SettingType]: { resolver: (stringValue: string) => any };
} = {
  string: {
    resolver: (v) => v,
  },
  number: {
    resolver: (value) => {
      const numPrice = parseInt(value);

      if (isNaN(numPrice)) {
        throw new Error(`Price "${value}" is not a valid number`);
      }
    },
  },
  Role: {
    resolver: (v) => {
      const role = roleHandler(v)[0];
      if (!role) {
        throw new Error("Role not found");
      }
      return role;
    },
  },
  Emote: {
    resolver: (v) => {
      const emote = emojiHandler(v);
      return emote;
    },
  },
};

export const settingsSetterSchema: { [key: string]: SettingType } = {
  role: SettingType.Role,
  emoji: SettingType.Emote,
  delim: SettingType.string,
  currencyValue: SettingType.number,
  currencyName: SettingType.string,
  photoBill: SettingType.number,
  backgroundAmount: SettingType.number,
  ignoreRole: SettingType.Role,
};

const settingsSchema = new Schema<Settings>({
  _id: { type: String, required: true },
  role: { type: String, default: "CHANGE_ME" },
  emoji: { type: String, default: "❤️" },
  delim: { type: String, default: "=" },
  currencyValue: { type: Number, default: 100 },
  currencyName: { type: String, default: "Muns" },
  photoBill: { type: Number, default: 1 },
  backgroundAmount: { type: Number, default: 1 },
  ignoreRole: { type: String, default: "CHANGE_ME" },
});

export const Settings = model<Settings & Document>("Settings", settingsSchema);
