import { CommandFunction } from "../../types"

export const getOnline: CommandFunction = async (_, _2, msg) => {
  msg.channel.send(
    `<@${msg.member?.id}> ${
      msg.guild?.members.cache.filter((mmb) => mmb.presence.status === "online")
        .size
    }`
  )
}
