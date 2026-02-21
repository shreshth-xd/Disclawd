import express from "express";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  REST,
  Routes,
} from "discord.js";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import logger from "./utils/logger.js";
import {
  handleCommandError,
  registerProcessHandlers,
} from "./utils/errorHandler.js";

registerProcessHandlers();

const app = express();
const port = process.env.PORT ?? 3000;
const BotToken = process.env.BOT_TOKEN;

let botReady = false;

// To parse JSON whenever needed
app.use(express.json());

app.get("/health", (req, res) => {
  if (botReady) {
    res.status(200).json({ status: "ok", bot: "ready" });
  } else {
    res.status(503).json({ status: "unavailable", bot: "connecting" });
  }
});

// Creating a new "client" event emitter class, to manage the intents or perms that my Discord app have
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];


// Load command files from the ./commands directory (grouped by category folders)
// The following is our pipeline to load the commands into the client.commands collection 
// using fs module to eventually receive the "data" and "execute" properties from the command files.

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath); //Sync methods does not return a promise

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const { default: command } = await import(pathToFileURL(filePath).href);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      logger.warn(
        `The command at ${filePath} is missing a required "data" or "execute" property.`,
        { filePath },
      );
    }
  }
}

const rest = new REST({ version: "10" }).setToken(BotToken);

try {
  logger.info("Started refreshing application (/) commands.");
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.ClientId,
      process.env.GuildId,
    ),
    { body: commands },
  );
  logger.info("Successfully reloaded application (/) commands.");
} catch (error) {
  logger.error("Failed to register slash commands", {
    error: error?.message ?? String(error),
    stack: error?.stack,
  });
}

// client.on("messageCreate", (message) => {
//   if (message.author.bot) return;
//   message.reply({
//     content: `Hello ${message.author.globalName}`,
//   });
// });

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    logger.error(`No command matching ${interaction.commandName} was found.`, {
      commandName: interaction.commandName,
      userId: interaction.user?.id,
      guildId: interaction.guildId,
    });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    await handleCommandError(interaction, error);
  }
});

client.on(Events.Error, (error) => {
  logger.error("Discord client error", {
    error: error?.message ?? String(error),
    stack: error?.stack,
  });
});

client.on("shardError", (error) => {
  logger.error("Discord shard error", {
    error: error?.message ?? String(error),
    stack: error?.stack,
  });
});

client.once(Events.ClientReady, () => {
  botReady = true;
  logger.info("Disclawd is ready.");
});

client.login(BotToken);

app.listen(port, () => {
  logger.info(`HTTP server listening on port ${port}; /health available.`);
});
