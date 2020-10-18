import discord, { Message, ReactionManager } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

import { SettingsStore } from "./stores/settingsStore";
import { UserStore } from "./stores/userStore";
import { ChallengeStore } from "./stores/challengeStore";
import logger from "./logger";

import { commandParser, givenMoney, errorEvent } from "./util";

import { commandsByAlias, prohibitedCommands } from "./commands";
import express from "express";
import { db } from "./dbConnection";
import { Member, TenantlessMember } from "./models/member";
import { Settings } from "./models/settings";
import { TenantlessChallenge } from "./models/challenge";
import { TenantlessImage } from "./models/image";

process.on("unhandledRejection", (reason) => {
  if (reason) {
    logger.error(reason);
  } else {
    logger.error("something really went wrong and idk what");
  }
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  logger.error(e); //send to logging first
  process.exit(1);
});

async function Main() {
  await db;
  const client = new discord.Client();

  const userStore = new UserStore();
  const challengeStore = new ChallengeStore();
  const settingsStore = new SettingsStore();

  client.on("message", async (msg) => {
    try {
      if (!msg.guild) {
        throw new Error("Guild Id");
      }
      const settings = await settingsStore.getSettings(msg.guild.id);

      const delim = settings.delim;
      const { content } = msg;

      if (content.startsWith(delim)) {
        const [fullCommand, body] = commandParser(content);
        // check if the command is in the prohibited routes (=\, =/, etc.)
        const cmd = fullCommand.substr(1);
        if (prohibitedCommands.includes(fullCommand)) {
          // if so, ignore
          return;
        }

        if (commandsByAlias[cmd]) {
          const command = commandsByAlias[cmd];

          if (
            command.requiresRole &&
            !msg.member?.roles.cache.find((r) => r.id === settings.role)
          ) {
            throw new Error("Unauthorized");
          }

          if (
            command.permissions &&
            command.permissions.length > 0 &&
            !command.permissions.every((p) => msg.member?.permissions.has(p))
          ) {
            throw new Error("Invalid Permissions");
          }

          if (
            command.useIgnoreRole &&
            msg.member?.roles.cache.find((r) => r.id === settings.ignoreRole)
          ) {
            logger.info("ignoring");
            return; //The bot ignores you
          }

          await command.func(
            body,
            { userStore, challengeStore, settingsStore },
            msg,
            { settings, guildId: msg.guild.id }
          );
        } else {
          throw new Error("Unknown command");
        }
      }
    } catch (e) {
      try {
        await msg.channel.send(errorEvent(e));
      } catch (badError) {
        logger.error(
          `A super bad error occured when trying to log: ${e.message} this error is: ${badError.message}`
        );
      }
    }
  });

  client.on("guildCreate", async (guild) => {
    logger.info("Joined New guild!");
    await Settings.create({ _id: guild.id } as any);
    await Member({ guildId: guild.id }).insertMany(
      guild.members.cache.map((m) => ({ memberId: m.id, currency: 1000 }))
    );
  });

  client.on("guildDelete", async (guild) => {
    logger.info(`Deleting guild: ${guild.id} AKA ${guild.name}`);
    try {
      console.log(await Settings.findByIdAndDelete(guild.id));
      console.log(await TenantlessChallenge.deleteMany({ guildId: guild.id }));
      console.log(await TenantlessImage.deleteMany({ guildId: guild.id }));
      console.log(await TenantlessMember.deleteMany({ guildId: guild.id }));

      logger.info("Deleted guild");
    } catch (e) {
      logger.error(`Failed to delete guild`);
    }
  });

  client.on("guildMemberAdd", async (member) => {
    if (!member.guild) {
      throw new Error("Guild not found");
    }

    logger.info(
      await Member({ guildId: member.guild.id }).updateOne(
        { _id: member.id },
        { _id: member.id, currency: 1000 },
        { upsert: true }
      )
    );
  });

  client.on("guildMemberRemove", async (member) => {
    if (!member.guild) {
      throw new Error("Guild not found");
    }
    logger.info(
      await Member({ guildId: member.guild.id }).deleteOne({ _id: member.id })
    );
  });

  client.on("messageReactionAdd", async (reaction, user) => {
    if (!reaction.message.guild) {
      throw new Error("Guild Not found");
    }
    const settings = await settingsStore.getSettings(reaction.message.guild.id);
    try {
      logger.info(settings.ignoreRole);
      if (
        reaction.message.member?.roles.cache.find(
          (r) => r.id === settings.ignoreRole
        )
      ) {
        logger.info("Ignoring");
        return;
      }
      logger.debug(reaction.emoji);
      const member = reaction.message.guild?.members.cache.find(
        (m) => m.id === user.id
      );
      const role = member?.roles.cache.find((r) => r.id === settings.role);

      logger.debug(reaction.emoji.id ? reaction.emoji.id : "wtf");
      logger.debug((reaction.emoji.id === settings.emoji).toString());
      if (role) {
        logger.debug(role);
      } else {
        logger.debug("no role");
      }
      if (
        (reaction.emoji.id === settings.emoji ||
          reaction.emoji.name === settings.emoji) &&
        role
      ) {
        if (reaction.message.member && member && reaction.message.guild) {
          userStore.addBucks(
            reaction.message.member.id,
            settings.currencyValue,
            member.displayName,
            reaction.message.member.displayName,
            reaction.message.guild.id
          );
          reaction.message.channel.send(
            givenMoney(
              settings.currencyValue,
              member.id,
              reaction.message.member.id,
              settings.currencyName
            )
          );
        }
      }
    } catch (e) {
      logger.error(e);
    }
  });

  client.login(process.env.DISCORD_TOKEN);

  const app = express();
  app.get("/", (req: any, res: any) => res.send("You have found the secret"));
  app.listen(process.env.PORT, () => logger.info("Working"));

  const bgTask = async () => {
    const guilds = await settingsStore.getAllSettings();
    await Promise.all(
      guilds.map(async ({ guildId, backgroundAmount, ignoreRole }) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) {
          const users = guild.members.cache
            .filter(
              (member) =>
                member.presence.status === "online" &&
                !member.roles.cache.find((r) => r.id === ignoreRole)
            )
            .map((u) => u.id);
          await Member({ guildId }).updateMany(
            { _id: { $in: users } },
            { $inc: { currency: backgroundAmount } }
          );

          logger.info("Background Task Ran");
        } else {
          logger.error(`Unknown guild: ${guildId}`);
        }
      })
    );
  };
  if (process.env.BACKGROUND_TASK_INTERVAL) {
    const bgTaskTime = parseInt(process.env.BACKGROUND_TASK_INTERVAL);
    if (isNaN(bgTaskTime)) {
      throw new Error(
        `${process.env.BACKGROUND_TASK_INTERVAL} is not a valid number you dumbo`
      );
    }
    setInterval(bgTask, bgTaskTime); //Give Money every 5 seconds
  } else {
    throw new Error("BACKGROUND_TASK_INTERVAL not set");
  }
}

Main();
