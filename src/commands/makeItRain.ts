import { MessageEmbed } from "discord.js"
import { CommandFunction } from "../types"

export const makeItRain: CommandFunction = async (
  amount,
  { userStore },
  msg,
  { settings, guildId }
) => {
  const numAmount = parseInt(amount)
  if (isNaN(numAmount)) {
    throw new Error(`Cannot make it rain with ${amount}`)
  }
  if (msg.guild && msg.member) {
    await userStore.makeItRain(
      numAmount,
      msg.guild.members.cache
        .filter(
          (m) => !!m.roles.cache.find((r) => r.id === settings.ignoreRole)
        )
        .map((m) => m.id),
      msg.member.displayName,
      guildId
    )
    const embed = new MessageEmbed()
      .setTitle("Made it rain!")
      .setDescription(`<@${msg.member?.id}> made it rain with: ${amount}`)
      .setImage(
        "https://cdn.discordapp.com/attachments/710923737494716547/725745521683071000/image0.gif"
      )
    await msg.channel.send(embed)
  }
}
