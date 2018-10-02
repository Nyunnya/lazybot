/**
 * @typedef {object} CommandHandler
 * 
 * Handle a command through a callback function.
 */
module.exports = class CommandHandler {
    constructor(callback = undefined, error = undefined) {
        if (typeof callback === 'function') {
            this.callback = callback;
        }
        if (typeof error === 'function') {
            this.error = error;
        }
    }

    /**
     * Passes the error to the error handler if using one, otherwise passes
     * the error along like nothing changed.
     * 
     * @param {Error} err - The error.
     * @param {object} params - The parameters to pass to the callback function.
     */
    handleError(err, params) {
        // If no error handler, pass the error up.
        if (!this.error) {
            throw err;
        }

        // If the error handler isn't a function, throw.
        if (typeof this.error !== 'function') {
            throw new TypeError("Error must be a function.");
        }

        // Call the error handler.
        return this.error(err, params);
    }

    /**
     * Call the callback function.
     * 
     * @param {object} params - The parameters to pass to the callback function.
     * @param {object} command - The command.
     */
    run(params, command = undefined) {
        // If the callback function isn't a function, throw.
        if (typeof this.callback !== 'function') {
            throw new TypeError("Callback must be a function.");
        }

        // Call the callback function.
        return Promise.resolve()
        .then(() => this.callback(params))
        .catch(err => this.handleError(err, params));
    }
};