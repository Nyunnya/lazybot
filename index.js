const Discord = require('discord.js');

Discord.Command = require('./src/command');
Discord.CommandHandler = require('./src/commandhandler');
Discord.SubCommandHandler = require('./src/subcommandhandler');

Discord.Client = require('./src/client');

module.exports = Discord;