import { Message, MessageEmbed } from "discord.js"
import { Stores, CommandFunction } from "../types"

export const randomPhoto: CommandFunction = async (
  _,
  { userStore },
  msg,
  { settings, guildId }
) => {
  if (msg.member) {
    const mem = msg.member

    const b = await userStore.getMyBalance(msg.member.id, guildId)
    if (b < settings.photoBill) {
      throw new Error("Insufficient funds")
    }
    const p = await userStore.getPhoto(guildId)
    await userStore.billAccount(
      mem.id,
      settings.photoBill,
      "Random Photo",
      mem.displayName,
      guildId
    )
    const embed = new MessageEmbed()
      .setTitle(p.text || "Look at this photograph!")
      .setImage(p.location)
    await msg.channel.send(embed)
  }
}
