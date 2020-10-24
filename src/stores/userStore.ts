import logger from "../logger";
import { Member } from "../models/member";
import { Image } from "../models/image";

export class UserStore {
  public async addBucks(
    uid: string,
    amount: number,
    from: string,
    to: string,
    guildId: string
  ) {
    logger.info(
      await Member({ guildId }).updateOne(
        { _id: uid },
        { _id: uid, $inc: { currency: Math.round(amount) } },
        { upsert: true }
      )
    );

    logger.info(`${from} added ${amount} bucks to: ${to}`);
  }

  public async getTop(n: number, guildId: string): Promise<[string, number][]> {
    const docs = await Member({ guildId })
      .find()
      .sort({ currency: -1 })
      .limit(n);
    const status: [string, number][] = [];
    docs.forEach((m) => {
      status.push([m.id as string, m.currency]);
    });
    return status;
  }

  public async getMyBalance(id: string, guildId: string): Promise<number> {
    const m = await Member({ guildId }).findById(id);
    if (m) {
      return m.currency;
    }
    return 0;
  }

  public async makeItRain(
    amount: number,
    members: string[],
    from: string,
    guildId: string
  ) {
    const bpp = amount / members.length;
    await Member({ guildId }).updateMany(
      { _id: { $in: members } },
      {
        $inc: { currency: Math.round(bpp) },
      }
    );
  }

  public async getPhoto(guildId: string): Promise<Image> {
    return (
      await Image({ guildId }).aggregate<Image>([{ $sample: { size: 1 } }])
    )[0];
  }

  public async billAccount(
    id: string,
    amount: number,
    from: string,
    to: string,
    guildId: string
  ) {
    if (amount < 0) {
      throw new Error("Tried to bill negative");
    }
    await this.addBucks(id, -amount, from, to, guildId);
  }

  public async addPhoto(url: string, guildId: string, name?: string) {
    await new (Image({ guildId }))({ location: url, name }).save();
  }
}
