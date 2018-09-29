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

        this.on('message', message => this.commands.parse(message));
    }
};