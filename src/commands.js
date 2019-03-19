const fs = require('fs');
const path = require('path');

const Argument = require('./argument');
const Command = require('./command');
const CommandHandler = require('./handlers/commandhandler');

const DEFAULT_PREFIX = "!";

/**
 * Parse an alias, replacing argument references with actual arguments.
 * 
 * @param {string} alias - The alias to parse.
 * @param {Argument[]} args - The arguments to use in the replacement.
 * @returns {string} The new line after parsing is complete.
 */
function parseAlias(alias, args) {
    let message = "";

    for (let piece of alias.split(" ")) {
        let [, param] = piece.match(/^\$([0-9]+|\*)$/) || [];

        if (param) {
            if (param == "*") {
                if (!args.length) {
                    continue;
                }

                piece = args.map(a => a.rawValue).join(" ");
            } else {
                let i = parseInt(param);

                if (i === NaN || !args[(--i)]) {
                    continue;
                }

                piece = args[i];
            }
        }

        message += (message.length > 0 ? " " : "") + piece;
    }

    return message;
}

/**
 * @typedef {object} Commands
 * 
 * Handles parsing commands in channels or direct messages.
 */
module.exports = class Commands {
    constructor(client) {
        this._commands = {};
        this._client = client;

        this._prefix = DEFAULT_PREFIX;
        this._guildPrefixes = {};
        this._data = {};
    }

    /**
     * Returns the raw commands.
     * 
     * @returns {object} The raw commands.
     */
    get commands() {
        return Object.values(this._commands);
    }

    /**
     * Returns the command prefix for commands used in channels.
     * 
     * @returns {string} The command prefix.
     */
    get prefix() {
        return this._prefix;
    }

    /**
     * Sets the command prefix for commands used in channels.
     * 
     * @param {string} value - The command prefix.
     */
    set prefix(value) {
        this._prefix = value;
    }

    /**
     * Returns the optional data passed to the command handler when it's
     * called.
     * 
     * @returns {object} The optional data.
     */
    get data() {
        return this._data;
    }

    /**
     * Sets the optional data passed to the command handler when it's
     * called.
     * 
     * @param {object} value - The optional data.
     */
    set data(value) {
        this._data = value;
    }

    /**
     * Set the command prefix for commands used in the specified guild.
     * 
     * @param {string} guildId - The guild id to set the command prefix to.
     * @param {string} prefix  - The command prefix to set.
     */
    setGuildPrefix(guildId, prefix) {
        this._guildPrefixes[guildId] = prefix;
    }

    /**
     * Clear the command prefix for commands used in the specified guild, returning them to
     * the default.
     * 
     * @param {string} guildId - The guild id to clear the command prefix from.
     */
    clearGuildPrefix(guildId) {
        delete this._guildPrefixes[guildId];
    }

    /**
     * Hook a command to be parsed in channels or direct messages.
     * 
     * @param {string} name - The name of the command to hook.
     * @param {object} data - An alias, command handler, or existing command.
     */
    hook(name, data) {
        let command = data;

        // If an alias or command handler was passed, create a new command
        // from it.
        if (typeof data === 'string' || data instanceof CommandHandler) {
            command = new Command(name, data);
        }

        if (command instanceof Command) {
            this._client.emit('debug', `[commands] Hook command '${name}'.`);

            this._commands[name] = command;
        }
    }

    /**
     * Parse messages and if they contain one of the hooked commands then call
     * the command handler.
     * 
     * @param {object} message - The Discord.js Message object to parse.
     * @param {string} [line] - Overrides the line in the Message object.
     */
    parse(message, line = "") {
        // Ignore messages from bots (including ourself).
        if (message.author.bot) {
            return;
        }

        // If line isn't defined, parse it from the message.
        if (!line) {
            switch (message.channel.type) {
                // If the message is from a channel...
                case 'text': {
                    let prefix = this._guildPrefixes[message.guild.id] || this._prefix;

                    // ...and starts with our prefix, parse it.
                    if (message.content.startsWith(prefix) && message.content.length > prefix.length) {
                        line = message.content.slice(prefix.length);

                        break;
                    }
                    // ...and we're being mentioned, parse it.
                    if (message.isMentioned(this._client.user.id)) {
                        line = message.content.replace(`<@${this._client.user.id}>`, "");

                        break;
                    }

                    // Ignore all other messages.
                    return;
                }

                // If the message is from a dm...
                case 'dm': {
                    line = message.content;

                    break;
                }

                // Ignore all other messages.
                default: {
                    return;
                }
            }
        }

        // Extract command and args.
        let args = line.match(/("+)[^\1]*?\1|\S+/g) || [];

        let command = this._commands[args.shift().toLowerCase()];
        args = args.map(a => new Argument(a.replace(/^"?([^"]*)"?$/, "$1"), a, message));

        // If the command doesn't exist, ignore.
        if (!command) {
            return;
        }

        // If the command is an alias, fill it in and parse it.
        // This has to happen before the command handler check because aliases
        // won't have command handlers.
        if (command.alias) {
            this.parse(message, parseAlias(command.alias, args));

            return;
        }

        // If the command doesn't have a command handler, ignore.
        if (!(command.handler instanceof CommandHandler)) {
            return;
        }

        let params = {
            "client": this._client,
            "message": message,
            "displayName": message.member ? message.member.displayName : message.author.username,
            "args": args,
            "data": this._data
        };

        // Run the command.
        Promise.resolve()
        .then(() => command.handler.run(params, command))
        .catch(err => {
            console.log("Unhandled error: " + err.stack);
        });
    }

    /**
     * Unhook a command from parsing.
     * 
     * @param {string} name - The name of the command to unhook.
     */
    unhook(name) {
        if (name in this._commands) {
            delete this._commands[name];

            this._client.emit('debug', `[commands] Unhook command '${name}'.`);
        }
    }

    /**
     * Load commands from files contained in the source path. Searches
     * recursively loading commands from all subdirectories.
     * 
     * @param {string} source - The source path to load commands from.
     */
    load(source) {
        source = fs.realpathSync(source);

        if (fs.statSync(source).isDirectory()) {
            // Directory
            return Promise.all(fs.readdirSync(source).map(s => this.load(path.join(source, s))));
        } else {
            // File
            try {
                // Only load files ending in '.js' and hook them if they are an object with a 'name' property.
                if (path.extname(source) == ".js") {
                    let data = require(source);

                    if (data instanceof Command && data.name) {
                        this.hook(data.name, data);

                        // Hook any synonyms, if present.
                        if (data.synonyms) {
                            for (let synonym of data.synonyms) {
                                this.hook(synonym, `${data.name} $*`);
                            }
                        }
                    }
                }

                return Promise.resolve(true);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    }
};