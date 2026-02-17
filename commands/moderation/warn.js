import {
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import logger from "../../utils/logger.js";

export default {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member in the server.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to be warned")
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),

  async execute(interaction) {
    // The specified user who is to be warned
    const target = interaction.options.getUser("user", true);

    await interaction.reply({
      content: `Warning issued to ${target.tag}.`,
      ephemeral: true,
    });

    if (interaction.channel) {
      await interaction.channel.send(
        `${target}, you've received a warning from ${interaction.user}.`,
      );
    }

    try {
      await target.send(
        `You have been warned in ${interaction.guild?.name ?? "this server"} by ${interaction.user.tag}.`,
      );
    } catch (error) {
      logger.warn("Failed to DM warned user", {
        targetId: target.id,
        error: error?.message ?? String(error),
      });
    }
  },
};

