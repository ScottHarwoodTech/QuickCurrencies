//TODO settings stuff

import { Stores, Context, CommandFunction } from "../types";
import { Message } from "discord.js";
import { commandParser, changeSuccessful } from "../util";
import logger from "../logger";
import {
  settingTypes,
  settingsSetterSchema,
  Settings,
} from "../models/settings";

export const settings: CommandFunction = async (
  argString,
  { settingsStore },
  msg,
  { settings, guildId }
) => {
  const clonedSettings = { ...settings };
  const [settingName, value] = commandParser(argString);
  logger.info(settingName);
  logger.info(value);

  if (Object.keys(settingsSetterSchema).find((v) => v === settingName)) {
    logger.info(typeof (settings as any)[settingName]);
    const settingType = settingsSetterSchema[settingName];
    const v = settingTypes[settingType].resolver(value);
    await Settings.updateOne({ _id: guildId }, { $set: { [settingName]: v } });

    await msg.channel.send(
      changeSuccessful(settingName, v, (clonedSettings as any)[settingName])
    );
  } else {
    throw new Error("Invalid Setting Name");
  }
};
