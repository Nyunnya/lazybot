const Discord = require('discord.js');

const Commands = require('./commands');

module.exports = class Client extends Discord.Client {
    constructor(options = {}) {
        super(options);

        this.commands = new Commands(this);

        this.on('message', message => this.commands.parse(message));
    }
};