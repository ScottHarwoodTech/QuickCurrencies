import { CommandFunction } from "../../types"

export const showChallenges: CommandFunction = async (
  name,
  { challengeStore },
  msg,
  { guildId }
) => {
  if (name) {
    const challenge = await challengeStore.specificChallengeStatus(
      name,
      guildId
    )
    msg.channel.send(challenge)
  } else {
    await challengeStore.listChallenges(msg.channel, guildId)
  }
}
