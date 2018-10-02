const Discord = require('discord.js');

Discord.Command = require('./src/command');
Discord.CommandHandler = require('./src/handlers/commandhandler');
Discord.SubCommandHandler = require('./src/handlers/subcommandhandler');
Discord.PropertyHandler = require('./src/handlers/propertyhandler');

Discord.Client = require('./src/client');

module.exports = Discord;