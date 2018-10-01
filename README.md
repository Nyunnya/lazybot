# lazybot

A simple wrapper for [Discord.js](https://github.com/discordjs/discord.js/) to quickly make a Discord bot.

Adds a new `Commands` object to the `Client` object to handle parsing commands in channels or direct messages.

All other functionality remains untouched.

## Usage

Behaives exactly like Discord.js.

```javascript
const lazybot = require('lazybot');

var client = new lazybot.Client();
```

Except you now have a `commands` property on the `Client` object that allows you to hook commands to be handled by a command handler.

```javascript
client.commands.hook("hello", (params) => {
    // Do stuff
});

client.login(token);
```

Commands can be loaded at runtime from separate files to help organize your code better.

```javascript
client.commands.load("./commands")
.then(() => {
    client.login(token);
});
```

You can set the command prefix for commands used in channels. It defaults to `!`.

```javascript
client.commands.prefix = "~";
```

You can pass data to the command handler when it's run.

```javascript
client.commands.data = {
    "db": database
};
```

The command handler is run with a `params` object:

- `params` (Object)
    - `client` (Object)

        The `Client` object that the command is hooked to.

    - `message` (Object)

        The `Message` object for the received message.

    - `displayName` (String)

        The nickname of the message author, or the username if no nickname.

    - `args` (Array)

        An array of `Argument` objects, one for each argument passed with the command.

    - `data` (Any)

        Optional data passed into the command.

```javascript
client.commands.hook("hello", new lazybot.CommandHandler((params) => {
    let {message, args} = params;

    message.channel.send("hello, world!");

    return Promise.resolve();
}));
```

The command handler must return a Promise. This is necessary to chain commands together using subcommands.

Command handlers can catch errors using an optional error handler.

```javascript
client.commands.hook("hello", new lazybot.CommandHandler((params) => {
    // ...
}, (params) => {
    console.log("An error occured: " + params.err);
});
```

Subcommands can be handled by hooking a subcommand handler in place of a command handler.

```javascript
client.commands.hook("user", new lazybot.SubCommandHandler({
    "info": new lazybot.CommandHandler((params) => {
        // ...
    }),
    "add": new lazybot.CommandHandler((params) => {
        // ...
    })
}));
```

## Examples

See [sample-bot](https://github.com/alyanah/sample-bot) for an example of this in use.

## Contact

Add me on Discord: Alyanah#0001