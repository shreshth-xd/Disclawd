import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and latency."),
  async execute(interaction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });

    // The difference between the time stamp of post command completion and the time of firing that command
    // is the latency of the command.
    const latency = sent.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply(`Pong! Latency: ${latency}ms`);
  },
};

