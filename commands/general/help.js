import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows a list of available commands."),
  async execute(interaction) {
    const commands = interaction.client.commands;

    const description =
      commands
        ?.map(
          (command) =>
            `\`/${command.data.name}\` - ${command.data.description ?? "No description"}`,
        )
        .join("\n") || "No commands are currently registered.";

    await interaction.reply({
      content: description,
      ephemeral: true,
    });
  },
};

