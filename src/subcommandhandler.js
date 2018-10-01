const CommandHandler = require('./commandhandler');

/**
 * @typedef {object} SubCommandHandler
 * 
 * Handle parsing a subcommand and handling through a command handler. If no
 * subcommands defined, look for them on the command.
 */
module.exports = class SubCommandHandler extends CommandHandler {
    constructor(subcommands = undefined, prehandler = undefined, error = undefined) {
        super();

        if (typeof subcommands === 'object') {
            this.subcommands = subcommands;
        }
        if (typeof prehandler === 'function') {
            this.prehandler = prehandler;
        }
        if (typeof error === 'function') {
            this.error = error;
        }
    }

    /**
     * Parse the subcommand and handle through a command handler.
     * 
     * @param {object} params - The parameters to pass to the command handler.
     * @param {object} command - The command.
     */
    run(params, command = undefined) {
        // Use our subcommands, or if none, the command's subcommands.
        let subcommands = this.subcommands || command.subcommands;

        // If the subcommands aren't an object, throw.
        if (typeof subcommands !== 'object') {
            throw new TypeError("Subcommands must be an object or subcommands not defined.");
        }

        // If no subcommand was used, ignore.
        if (!params.args.length) {
            return Promise.resolve();
        }

        let handler = subcommands[params.args.shift().toLowerCase()];

        // If the subcommand doesn't exist, ignore.
        if (!handler) {
            return Promise.resolve();
        }

        // If the subcommand doesn't have a command handler, ignore.
        if (!(handler instanceof CommandHandler)) {
            throw new TypeError("Subcommand must be a CommandHandler.");
        }

        // Run the command handler.
        return handler.run(params, command)
        .catch(err => {
            // If no error handler, pass the error up.
            if (!this.error) {
                throw err;
            }

            // If the error handler isn't a function, throw.
            if (typeof this.error !== 'function') {
                throw new TypeError("Error must be a function.");
            }

            // Call the error handler.
            params.err = err;
            return this.error(params);
        });
    }
};