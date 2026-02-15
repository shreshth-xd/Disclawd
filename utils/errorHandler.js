/**
 * Centralized error handling for Disclawd.
 * Use this for command execution failures and process-level errors.
 */

import logger from "./logger.js";

const DEFAULT_USER_MESSAGE =
  "There was an error while executing this command. Please try again later.";

/**
 * Handle an error from a slash command execution.
 * Logs the error with context and replies to the interaction (ephemeral).
 * Safe to call even if interaction already replied/deferred.
 */
export async function handleCommandError(interaction, error) {
  const commandName = interaction?.commandName ?? "unknown";
  const userId = interaction?.user?.id ?? "unknown";
  const guildId = interaction?.guildId ?? "dm";

  logger.error(`Error executing command: ${commandName}`, {
    userId,
    guildId,
    error: error?.message ?? String(error),
    stack: error?.stack,
  });

  const replyPayload = {
    content: DEFAULT_USER_MESSAGE,
    ephemeral: true,
  };

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(replyPayload);
    } else {
      await interaction.reply(replyPayload);
    }
  } catch (replyError) {
    logger.error("Failed to send error reply to user", {
      commandName,
      replyError: replyError?.message ?? String(replyError),
    });
  }
}

/**
 * Register process-level error handlers (unhandledRejection, uncaughtException).
 * Call once at startup.
 */
export function registerProcessHandlers() {
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Rejection", {
      reason: reason?.message ?? String(reason),
      stack: reason?.stack,
    });
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception", {
      message: error?.message ?? String(error),
      stack: error?.stack,
    });
    process.exit(1);
  });
}
