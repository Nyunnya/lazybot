declare module 'lazybot' {
    import * as Discord from 'discord.js';

    type Command = {
        name: string;
        alias?: string;
        aliases?: Array;
        callback: Function;
    };

    export * from 'discord.js';

    class Commands {
        public prefix?: string;
        public data?: object;

        public hook(command: string, data: string | Function | Command): void;
        public parse(message: Discord.Message, line?: string): void;
        public unhook(command: string): void;
        public load(source: string): void;
    }

    export class Client extends Discord.Client {
        public commands: Commands;
    }
}