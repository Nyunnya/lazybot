# lazybot

A simple wrapper for [Discord.js](https://github.com/discordjs/discord.js/) to quickly make a bot.

Adds a new `Commands` object to the `Client` object to handle parsing commands in channels or direct messages.

All other functionality remains untouched.

## Examples

Behaives exactly like Discord.js, except you now have a `commands` property on the `Client` object that allows you to hook commands to be handled by a callback function.

```javascript
const lazybot = require('lazybot');

var client = new lazybot.Client();

client.commands.hook("hello", (params) => {
    params.message.channel.send("hello, world!");
});

client.login("token");
```

Commands can be loaded from files to help organize your code better.

```javascript
const lazybot = require('lazybot');

var client = new lazybot.Client();

client.commands.load("./commands")
.then(() => {
    client.login("token");
});
```

## Contact

Add me on Discord: Alyanah#0001