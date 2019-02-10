const Discord = require('discord.js');

const Commands = require('./commands');

/**
 * @typedef {object} Client
 * 
 * A Discord.js Client extended with a new Commands object to handle parsing
 * commands in channels or direct messages.
 */
module.exports = class Client extends Discord.Client {
    constructor(options = {}) {
        super(options);

        this.commands = new Commands(this);

        // Use raw packets to always fire messageReactionAdd and messageReactionRemove
        // events, regardless of message cache.
        this.on('raw', packet => {
            // Ignore unrelated packets.
            if (packet.t !== "MESSAGE_REACTION_ADD" && packet.t !== "MESSAGE_REACTION_REMOVE") {
                return;
            }

            let channel = this.channels.get(packet.d.channel_id);

            // If the message is already cached, it will fire the event.
            if (channel.messages.has(packet.d.message_id)) {
                return;
            }

            // Fetch the message and fire the event.
            channel.fetchMessage(packet.d.message_id)
            .then(message => {
                let emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                let reaction = message.reactions.get(emoji);
                let user = this.users.get(packet.d.user_id);

                if (packet.t === "MESSAGE_REACTION_ADD") {
                    this.emit('messageReactionAdd', reaction, user);
                }
                if (packet.t === "MESSAGE_REACTION_REMOVE") {
                    this.emit('messageReactionRemove', reaction, user);
                }
            });
        });

        // Parse all messages.
        this.on('message', message => this.commands.parse(message));
    }
};