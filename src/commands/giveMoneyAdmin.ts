import { Message } from "discord.js"
import { mentionHandler, givenMoney, memberIsIgnored } from "../util"

import logger from "../logger"
import { Stores, CommandFunction } from "../types"

export const giveMoneyAdmin: CommandFunction = async (
  args,
  { userStore, settingsStore },
  msg,
  { settings, guildId }
) => {
  const arrayArgs = args.split(" ")
  const person = mentionHandler(arrayArgs[0])[0]
  memberIsIgnored(msg, person, settings.ignoreRole)

  const amount = arrayArgs[1]
  const numAmount = parseInt(amount)
  if (isNaN(numAmount)) {
    throw new Error("Invalid number")
  }
  logger.info(person, msg.content)

  if (person && msg.member) {
    await userStore.addBucks(person, numAmount, msg.member.id, person, guildId)
    await msg.channel.send(
      givenMoney(numAmount, msg.member.id, person, settings.currencyName)
    )
  }
}
