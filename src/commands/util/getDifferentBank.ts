import { MessageEmbed } from "discord.js";
import { Member } from "../../models/member";
import { CommandFunction } from "../../types";

export const getDifferentBank: CommandFunction = async (
  memberId,
  _stores,
  msg,
  { guildId }
) => {
  const member = await Member({ guildId }).findOne({ memberId });
  console.log(member);
  if (!member) {
    throw new Error(`Member ${memberId} not found`);
  }

  await msg.channel.send(
    new MessageEmbed()
      .setTitle("Member details")
      .setDescription(JSON.stringify(member.toJSON(), null, 2))
  );
};
