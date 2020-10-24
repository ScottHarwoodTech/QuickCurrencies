import { Message, PermissionResolvable } from "discord.js";
import { SettingsStore } from "./stores/settingsStore";
import { ChallengeStore } from "./stores/challengeStore";
import { UserStore } from "./stores/userStore";
import { Settings } from "./models/settings";
import { Model, Document } from "mongoose";
export interface Stores {
  settingsStore: SettingsStore;
  challengeStore: ChallengeStore;
  userStore: UserStore;
}

export type CommandFunction = (
  argString: string,
  stores: Stores,
  message: Message,
  context: Context
) => Promise<void>;
export interface Command {
  description: string;
  usage: string;
  func: CommandFunction;
  permissions?: PermissionResolvable[];
  alias?: string[];
  requiresRole?: boolean;
  useIgnoreRole?: boolean;
}

export interface CommandSystem {
  [commandName: string]: Command;
}

export interface Context {
  settings: Document & Settings;
  guildId: string;
}
