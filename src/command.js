const CommandHandler = require('./handlers/commandhandler');

/**
 * @typedef {object} Command
 * 
 * A command.
 */
module.exports = class Command {
    constructor(params = undefined, handler = undefined) {
        this.name = undefined;
        this.alias = undefined;
        this.synonyms = undefined;
        this.handler = undefined;

        if (typeof params === 'string' && typeof handler === 'string') {
            // Alias
            this.name = params;
            this.alias = handler;
        } else if (typeof params === 'string' && handler instanceof CommandHandler) {
            // Command handler
            this.name = params;
            this.handler = handler;
        } else if (typeof params === 'object' && typeof params.name === 'string'
        && params.handler instanceof CommandHandler) {
            // Command
            Object.assign(this, params);
        }
    };
};