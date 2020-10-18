import { MessageEmbed } from "discord.js"
import { CommandFunction } from "../types"

export const myBalance: CommandFunction = async (
  _: string,
  { userStore },
  msg,
  { settings, guildId }
) => {
  if (msg.member) {
    const balance = await userStore.getMyBalance(msg.member.id, guildId)
    const embed = new MessageEmbed()
      .setTitle(`${msg.member.nickname || msg.member.displayName}'s Balance!`)
      .setDescription(
        `You currently have: \n${balance}\n ${settings.currencyName}`
      )
    msg.channel.send(embed)
  }
}
