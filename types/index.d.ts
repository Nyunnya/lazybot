declare module 'lazybot' {
    import * as Discord from 'discord.js';

    export * from 'discord.js';

    type Command = {
        name: string;
        alias?: string;
        synonyms?: string[];
        subcommands?: { [key: string]: CommandCallback };
        callback: CommandCallback;
        error?: CommandErrorFormatter;
    };

    type CommandCallback = (params: CommandCallbackParams) => Promise<boolean>;

    type CommandCallbackParams = {
        client: Client;
        message: Discord.Message;
        displayName: string;
        args: Argument[];
        data: { [key: string]: any };
    };

    type CommandErrorFormatter = (err: Error) => string;

    class Argument extends String {
        public readonly member?: Discord.GuildMember;
        public readonly channel?: Discord.TextChannel;
        public readonly rawValue: string;
    }

    class Commands {
        public prefix?: string;
        public data?: object;

        public hook(command: string, data: CommandCallback | string | Command): void;
        public parse(message: Discord.Message, line?: string): void;
        public unhook(command: string): void;
        public load(source: string): void;
    }

    export class Client extends Discord.Client {
        public commands: Commands;
    }
}