import { MessageEmbed } from "discord.js"
import logger from "../../logger"
import { CommandFunction } from "../../types"

export const donateToChallenge: CommandFunction = async (
  amount_name_str,
  { challengeStore, userStore },
  msg,
  { settings, guildId }
) => {
  const split = amount_name_str.split(" ")
  if (split.length >= 2 && msg.member) {
    const member = msg.member
    const amount = split[split.length - 1]
    const name = split.slice(0, split.length - 1).join(" ")
    const numAmount = parseInt(amount)
    if (isNaN(numAmount)) throw new Error("Invalid Number")
    if (numAmount > 0) {
      const b = await userStore.getMyBalance(member.id, guildId)
      if (b < numAmount) throw new Error("Insufficient funds")
      await challengeStore.addToChallenge(numAmount, name, guildId)
      await userStore.billAccount(
        member.id,
        numAmount,
        member.displayName,
        name,
        guildId
      )

      await msg.channel.send(
        new MessageEmbed()
          .setTitle(`Donation to the ${name} challenge fund!`)
          .setDescription(
            `<@${member.id}> just donated ${amount} ${settings.currencyName} to the ${name} challenge fund!`
          )
          .setImage(
            "https://media.giphy.com/media/xTiTnqUxyWbsAXq7Ju/giphy.gif"
          )
      )
      logger.info(
        `${member.displayName} donated ${amount} to: ${name} Challenge!`
      )
    }
  } else {
    throw new Error("Invalid format, use =dc <CHALLENGE NAME> <DONATE AMOUNT> ")
  }
}
