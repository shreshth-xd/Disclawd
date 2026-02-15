/**
 * Centralized logger for Disclawd.
 * Use this instead of console.log/console.error so all output is consistent
 * and can be extended later (e.g. file output, log levels).
 */

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL = process.env.LOG_LEVEL?.toLowerCase() || "info";
const MIN_LEVEL = LEVELS[LOG_LEVEL] ?? LEVELS.info;

// ISO: yyyy/mm/dd hh:mm:ss
function timestamp() {
  return new Date().toISOString();
}

// To format the log message with the timestamp, level and log message and context
function format(level, message, context = {}) {
  const parts = [timestamp(), `[${level.toUpperCase()}]`, message];
  if (Object.keys(context).length > 0) {
    parts.push(JSON.stringify(context));
  }
  return parts.join(" ");
}

// To prevent the debug logs from being spammed in the console
function shouldLog(level) {
  return LEVELS[level] >= MIN_LEVEL;
}

// The only function that gets used in all the functions being exported
function log(level, message, context = {}) {
  if (!shouldLog(level)) return;
  const formatted = format(level, message, context);
  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export default {
  debug(message, context = {}) {
    log("debug", message, context);
  },
  info(message, context = {}) {
    log("info", message, context);
  },
  warn(message, context = {}) {
    log("warn", message, context);
  },
  error(message, context = {}) {
    log("error", message, context);
  },
};
