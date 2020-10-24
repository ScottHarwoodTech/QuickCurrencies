import logger from "../logger"
import { CommandFunction } from "../types"
import { givenMoney, memberIsIgnored, mentionHandler } from "../util"

export const giveMoney: CommandFunction = async (
  args,
  { settingsStore, userStore },
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

  if (person) {
    if (numAmount > 0) {
      if (msg.member) {
        const mem = msg.member
        const b = await userStore.getMyBalance(mem.id, guildId)
        if (!(b >= numAmount)) {
          throw new Error("Insufficient Funds")
        }

        await userStore.addBucks(
          person,
          numAmount,
          mem.displayName,
          person,
          guildId
        )

        await userStore.billAccount(
          mem.id,
          numAmount,
          person,
          mem.displayName,
          guildId
        )
        await msg.channel.send(
          givenMoney(numAmount, mem.id, person, settings.currencyName)
        )
      }
    }
  }
  return
}
