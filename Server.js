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

const app = express();
const port = 3000;
const BotToken = process.env.BOT_TOKEN;

// To parse JSON whenever needed
app.use(express.json());

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
      console.warn(
        `The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

const rest = new REST({ version: "10" }).setToken(BotToken);

try {
  console.log("Started refreshing application (/) commands.");
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.ClientId,
      process.env.GuildId,
    ),
    { body: commands },
  );
  console.log("Successfully reloaded application (/) commands.");
} catch (error) {
  console.error(error);
}

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  message.reply({
    content: `Hello ${message.author.globalName}`,
  });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing ${interaction.commandName}`, error);

    const replyPayload = {
      content: "There was an error while executing this command!",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload);
    } else {
      await interaction.reply(replyPayload);
    }
  }
});

client.login(BotToken);
