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
        return this.callback(params)
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