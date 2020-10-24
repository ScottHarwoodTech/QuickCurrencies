// TODO ADD THIS FILE

import { Stores, Context, CommandFunction } from "../types"
import { Message, MessageEmbed } from "discord.js"

export const addPhoto: CommandFunction = async (
  photoString,
  { userStore },
  msg,
  { guildId }
) => {
  if (!msg.guild) {
    throw new Error("Guild not found")
  }
  const space = photoString.indexOf(" ")
  let photoUrl
  let name
  if (space == -1) {
    photoUrl = photoString
  } else {
    photoUrl = photoString.substr(0, space)
    name = photoString.substr(space + 1)
  }
  await userStore.addPhoto(photoUrl, guildId, name)
  await msg.channel.send(
    new MessageEmbed().setTitle("Photo Added").setImage(photoUrl)
  )
}
