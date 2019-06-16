import { Command, CommandBase, CommandParser, Config, Event } from '@autobot/common';
import { RichEmbed }                                          from 'discord.js';

/**
 * Deletes an alias `;;aliasdelete javascript`.
 */
@Command
export class AliasDeleteCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: `${ process.env.DOCSBOT_PREFIX_ALIAS_DELETE }`,
            description: 'Adds an alias `;;aliasdelete javascript`.',
            group: 'docs',
            requiredEnvVars: [

                'DOCSBOT_ALIASES_CONFIG_PATH',
                'DOCSBOT_PREFIX_ALIAS_DELETE'

            ],
            roles: [

                process.env.DOCSBOT_ADMIN_ROLE_NAME

            ],
            params: [

                {

                    name: 'alias',
                    required: true

                }

            ]

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     */
    public async run(command: CommandParser) {

        if (Config.remove(process.env.DOCSBOT_ALIASES_CONFIG_PATH, command.namedarguments.alias)) {

            command.obj.channel.send(new RichEmbed().setTitle('docsbot alias delete: success')
                                                    .setColor(3447003)
                                                    .setDescription(`alias "${ command.namedarguments.alias }" successfuly deleted!`));

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('docbot alias delete: error')
                                                    .setColor(15158332)
                                                    .setDescription(`
                                                    
                                                        Alias "${ command.namedarguments.alias }" could not be located.
                                                        To view aliases use \`;;aliaslist\`.
                                                    
                                                    `));
        }

    }

}
