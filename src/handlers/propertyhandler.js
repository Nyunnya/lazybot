const CommandHandler = require('./commandhandler');

/**
 * @typedef {object} PropertyHandler
 * 
 * Handle getting and setting a property through a getter callback function
 * and a setter callback function.
 */
module.exports = class PropertyHandler extends CommandHandler {
    constructor(key, getter, setter, error = undefined) {
        super(undefined, error);

        if (typeof key !== 'string') {
            throw new TypeError("Key must be a string.");
        }
        if (typeof getter !== 'function') {
            throw new TypeError("Getter must be a function.");
        }
        if (typeof setter !== 'function') {
            throw new TypeError("Setter must be a function.");
        }

        this.key = key;
        this.getter = getter;
        this.setter = setter;
    }

    /**
     * If no value specified (args is empty) call the getter callback function,
     * otherwise call the setter callback function.
     * 
     * @param {object} params 
     * @param {object} command 
     */
    run(params, command = undefined) {
        let {args} = params;

        return Promise.resolve()
        .then(() => {
            // If not setting a new value, call the getter callback function.
            if (!args.length) {
                return this.getter(this.key, params);
            }

            // Call the setter callback function.
            return this.setter(this.key, params);
        })
        .catch(err => this.handleError(err, params));
    }
};