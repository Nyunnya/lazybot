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

Except you now have a `commands` property on the `Client` object that allows you to hook commands to be handled by a callback function.

```javascript
client.commands.hook("hello", (params) => {
    // Do stuff
});

client.login(token);
```

Commands can be loaded at runtime from seperate files to help organize your code better.

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

You can pass data to the callback function when its called.

```javascript
client.commands.data = {
    "db": database
};
```

The callback function is called with a `params` object:

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
client.commands.hook("hello", (params) => {
    let {message, args} = params;

    message.channel.send("hello, world!");
});
```

## Examples

See [sample-bot](https://github.com/alyanah/sample-bot) for an example of this in use.

## Contact

Add me on Discord: Alyanah#0001