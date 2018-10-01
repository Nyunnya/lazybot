declare module 'lazybot' {
    import * as Discord from 'discord.js';

    export * from 'discord.js';

    type CommandHandlerParams = {
        client: Client;
        message: Discord.Message;
        displayName: string;
        args: Argument[];
        data: { [key: string]: any };
    };

    type CommandHandlerCallback = (params: CommandHandlerParams) => Promise<boolean>;

    type CommandHandlerErrorHandler = (err: Error, params: CommandHandlerParams) => Promise<boolean>;

    class Argument extends String {
        public readonly member?: Discord.GuildMember;
        public readonly channel?: Discord.TextChannel;
        public readonly rawValue: string;
    }

    export class CommandHandler {
        constructor(callback: CommandHandlerCallback, error?: CommandHandlerErrorHandler);

        public callback: CommandHandlerCallback;

        public run(params: CommandHandlerParams);
    }

    export class SubCommandHandler extends CommandHandler {
        constructor();
        constructor(subcommands: { [key: string]: CommandHandler },
            prehandler?: CommandHandlerCallback, error?: CommandHandlerErrorHandler);
    }

    export class Command {
        constructor();
        constructor(name: string, alias: string);
        constructor(name: string, callback: CommandHandler);
        constructor(command: Command);

        public name: string;
        public alias?: string;
        public synonyms?: string[];
        public subcommands?: { [key: string]: CommandHandler };
        public handler: CommandHandler;
    }

    class Commands {
        public prefix?: string;
        public data?: object;

        public hook(name: string, data: string | CommandHandler | Command): void;
        public parse(message: Discord.Message, line?: string): void;
        public unhook(name: string): void;
        public load(source: string): void;
    }

    export class Client extends Discord.Client {
        public commands: Commands;
    }
}