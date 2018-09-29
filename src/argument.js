/**
 * @typedef {object} Argument
 * 
 * A Command argument. If the argument is a reference to a member or a channel,
 * further expand that to its respective Discord.js objects.
 */
module.exports = class Argument extends String {
    constructor(arg, message) {
        super(arg);

        // If the message is in a guild, parse @mentions and #channels.
        if (message.guild) {
            let [, type, id] = arg.match(/^<([@#])!?(\d+)>$/) || [];

            if (type && id) {
                if (type == "@") {
                    this.member = message.guild.members.get(id);
                } else if (type == "#") {
                    this.channel = message.guild.channels.get(id);
                }
            }
        }
    }

    /**
     * Returns the raw value of the argument.
     * 
     * @returns {string} The raw value of the argument.
     */
    get rawValue() {
        let value = this.toString();

        // If the argument contains spaces, wrap it in quotes.
        if (value.includes(" ")) {
            value = `"${value}"`;
        }

        return value;
    }
};