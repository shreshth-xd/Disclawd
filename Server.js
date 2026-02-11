import express from "express";
import {Client, Events, GatewayIntentBits, Options } from 'discord.js';
import { REST, Routes } from 'discord.js';
import 'dotenv/config';

const app = express();
const port = 3000;
const BotToken = process.env.BOT_TOKEN;

// To parse JSON whenever needed
app.use(express.json());

// Creating a new "client" event emitter class, to manage the intents or perms that my Discord app have
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });



const commands = [
    {
        name: 'intro',
        description: 'Gives it\'s introduction in a short and crisp way',
    },{
        name:"warn",
        description: "Warns users whenever needed",
        options: [
            {
                name: "user",
                description: "User to be warned",
                type: 6,
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(BotToken);

try {
    console.log("Started refreshing application (/) commands.");
    await rest.put(Routes.applicationGuildCommands(process.env.ClientId, process.env.GuildId), { body: commands});
    console.log("Successfully reloaded application (/) commands.");
} catch (error) {
    console.error(error);
}

client.on("messageCreate", (message)=>{
    if (message.author.bot) return;
    message.reply({
        content:`Hello ${message.author.globalName}`
    })
})

client.on(Events.InteractionCreate, async (interaction)=>{
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName==="intro"){
        await interaction.reply("Hi folks, Disclawd here, I am here to automate your polls and event scheduling so that you don't have to.");
    }
    
    else if(interaction.commandName==="warn"){

        interaction.options.getUser("user");

        await interaction.reply({ content: "Warning issued", ephemeral: true });
        await interaction.channel.send(`${interaction.user}, don't try to lose your cool mate, else we would have to get you removed somehow.`);
        await interaction.user.send(`Strongly hoping that you won't be willing to do that again ${interaction.user}`);
    }    
})


client.login(BotToken);
