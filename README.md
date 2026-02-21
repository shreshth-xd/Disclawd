# Disclawd
A starter Discord.js bot project to let admins automate and centrally manage event scheduling, moderation, thread/message management and economy games, all with just one bot.

---

**What we built** — A single-process Discord bot that serves slash commands and a lightweight HTTP health check. The bot discovers commands from category based command folders (`commands/general`, `commands/moderation`), registers them with the Discord API per guild (guild as in server), and runs a small Express server so external systems can probe readiness via `/health`.

**How it works** — `Server.js` spins up a Discord.js `Client` and an Express app: the client loads every `.js` file under `commands` dir that exports a `data` (SlashCommandBuilder) and `execute` function, then uses the REST API to push those commands to your dev guild. Interactions are handled in one place; failures are logged and surfaced to users via a shared `errorHandler`, with structured logging through a central `logger`. So you get one codebase, one deployable — moderation (warn, ban, kick, mute, deafen), general (help, ping, intro), and room to add scheduling, economy, and more.
