const fs = require('fs');
const path = require('path');

const Argument = require('./argument');

const DEFAULT_PREFIX = "!";

function parseAlias(alias, args) {
    let message = "";

    for (let piece of alias.split(" ")) {
        let [, param] = piece.match(/^\$([0-9]+|\*)$/) || [];

        if (param) {
            if (param == "*") {
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

module.exports = class Commands {
    constructor(client) {
        this._commands = {};
        this._prefix = DEFAULT_PREFIX;

        this._data = {};

        this._client = client;
    }

    get prefix() {
        return this._prefix;
    }
    set prefix(value) {
        this._prefix = value;
    }

    get data() {
        return this._data;
    }
    set data(value) {
        this._data = value;
    }

    hook(command, data) {
        console.log(`Hook command '${command}'.`);

        if (typeof data === "string") {
            // Alias
            this._commands[command] = {
                "name": command,
                "alias": data
            };
        } else if (typeof data === "function") {
            // Callback function
            this._commands[command] = {
                "name": command,
                "callback": data
            };
        } else if (typeof data === "object") {
            // Raw object
            this._commands[command] = data;
        }
    }

    parse(message, line = "") {
        // Ignore messages from bots (including ourself).
        if (message.author.bot) {
            return;
        }

        // If line isn't defined, parse it from the message.
        if (!line) {
            if (message.channel.type == "text" && message.content.startsWith(this._prefix)) {
                // If the message is from a channel and starts with our prefix, parse it.
                line = message.content.slice(this._prefix.length);
            } else if (message.channel.type == "dm") {
                // If the message is from a dm, parse it.
                line = message.content;
            } else {
                // Ignore all other messages.
                return;
            }
        }

        // Extract command and args.
        let args = line.match(/"[^"]*"|\S+/g).map(a => a.replace(/^"?([^"]*)"?$/, "$1")) || [];

        let command = this._commands[args.shift().toLowerCase()];
        args = args.map(a => new Argument(a, message));

        // If the command doesn't exist, ignore.
        if (typeof command === "undefined") {
            return;
        }

        // If the command is an alias, fill it in and parse it.
        if (command.alias) {
            this.parse(message, parseAlias(command.alias, args));

            return;
        }

        // Run the command.
        if (command.callback) {
            command.callback({
                "client": this._client,
                "message": message,
                "displayName": message.member ? message.member.displayName : message.author.username,
                "permissions": (message.member ? message.member.permissions : undefined),
                "args": args,
                "data": this._data
            });
        }
    }

    unhook(command) {
        if (command in this._commands) {
            delete this._commands[command];

            console.log(`Unhook command '${command}'.`);
        }
    }

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

                    if (data && typeof data === 'object' && data.name) {
                        this.hook(data.name, data);

                        // Hook any aliases, if present.
                        if (data.aliases) {
                            for (let alias of data.aliases) {
                                this.hook(alias, data);
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