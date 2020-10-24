import { MessageEmbed } from "discord.js"
import { CommandFunction } from "../types"

export const leaderboard: CommandFunction = async (
  _,
  { userStore },
  msg,
  { guildId }
) => {
  const topTen = await userStore.getTop(10, guildId)
  const embed = new MessageEmbed()
    .setTitle("The richest people in the guild!")
    .setColor("#fc8c03")
    .setDescription(
      topTen.reduce(
        (curr, record) => curr + `\n <@${record[0]}> | ${record[1]}`,
        ""
      )
    )

  await msg.channel.send(embed)
}
