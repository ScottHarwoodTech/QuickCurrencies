import { MessageEmbed } from "discord.js";
import { CommandFunction } from "../types";

export const getSettings: CommandFunction = async (
  _args,
  _stores,
  msg,
  { settings }
) => {
  const clonedSettings = { ...settings.toJSON() };
  clonedSettings.role = `<@&${clonedSettings.role}>`;
  clonedSettings.emoji = `<:${clonedSettings.emoji}:>`;
  const embed = new MessageEmbed()
    .setTitle("Current QuickCurrency Settings:")
    .setColor("#e5ff00")
    .setDescription(JSON.stringify(clonedSettings, null, 2));
  msg.channel.send(embed);
};
