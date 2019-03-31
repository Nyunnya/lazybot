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

        // Use raw packets to fire events for all messages regardless of message cache.
        this.on('raw', packet => {
            // Ignore unrelated packets.
            if (packet.t !== "MESSAGE_REACTION_ADD" && packet.t !== "MESSAGE_REACTION_REMOVE" &&
                packet.t != "MESSAGE_DELETE") {
                return;
            }

            let channel = this.channels.get(packet.d.channel_id);

            // Fire the event.
            switch(packet.t) {
                case "MESSAGE_REACTION_ADD":
                case "MESSAGE_REACTION_REMOVE": {
                    Promise.resolve()
                    .then(() => {
                        // Use the message cache if possible, otherwise fetch the message.
                        if (channel.messages.has(packet.d.message_id)) {
                            return channel.messages.get(packet.d.message_id);
                        } else {
                            return channel.fetchMessage(packet.d.message_id);
                        }
                    })
                    .then(message => {
                        let emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
                        let reaction = message.reactions.get(emoji);
                        let user = this.users.get(packet.d.user_id);

                        if (packet.t === "MESSAGE_REACTION_ADD") {
                            this.emit('messageReactionAddRaw', reaction, user);
                        }
                        if (packet.t === "MESSAGE_REACTION_REMOVE") {
                            this.emit('messageReactionRemoveRaw', reaction, user);
                        }
                    });

                    break;
                }

                case "MESSAGE_DELETE": {
                    // messageDelete supplies a message object because it's cached. If the message
                    // isn't cached then all that can be supplied is the message id.
                    this.emit('messageDeleteRaw', packet.d.id);

                    break;
                }
            }
        });

        // Parse all messages.
        this.on('message', message => this.commands.parse(message));
    }

    /**
     * Current status of the client's connection to Discord.
     * 
     * Fix the issue with ws.connection being null causing an exception here.
     */
    get status() {
        return this.ws.connection ? this.ws.connection.status : undefined;
    }
};