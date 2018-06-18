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

    get rawValue() {
        let value = this.toString();

        // If the argument contains spaces, wrap it in quotes.
        if (value.includes(" ")) {
            value = `"${value}"`;
        }

        return value;
    }
};