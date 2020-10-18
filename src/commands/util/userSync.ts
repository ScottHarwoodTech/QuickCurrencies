import { Member } from "../../models/member";
import { Stores, CommandFunction } from "../../types";
import { Message, MessageEmbed } from "discord.js";

export const userSync: CommandFunction = async (
  _1,
  _stores,
  msg,
  { settings, guildId }
) => {
  if (!msg.guild) {
    throw new Error("Guild unreachable");
  }
  const serverMembers = msg.guild.members.cache
    .filter((u) => !!u.roles.cache.find((r) => r.id === settings.ignoreRole))
    .map((u) => u.id);

  if (serverMembers && msg.guild) {
    const model = Member({ guildId });
    const dBids = (await model.find()).map((u) => u.memberId);

    const usersToSave = serverMembers
      .reduce((acc, serverMember) => {
        if (dBids.includes(serverMember)) {
          return [...acc];
        } else {
          return [...acc, serverMember];
        }
      }, [] as string[])
      .map((memberId) => ({ memberId, currency: 1000 }));

    const result = await model.insertMany(usersToSave);
    const deleteResult = await model.deleteMany({
      memberId: { $not: { $in: serverMembers } },
    });
    await msg.channel.send(
      new MessageEmbed().setTitle("User Sync").setDescription(`
    Inserted: ${usersToSave.length}
    Deleted: ${deleteResult.deletedCount}
    `)
    );
  } else {
    throw new Error("No Server Members ? HOw?!?!");
  }
};
