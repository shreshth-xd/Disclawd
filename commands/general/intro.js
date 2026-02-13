import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("intro")
    .setDescription("Introduces Disclawd in a short and crisp way."),
  async execute(interaction) {
    await interaction.reply(
      "Hi folks, Disclawd here, I am here to automate your polls and event scheduling so that you don't have to.",
    );
  },
};

