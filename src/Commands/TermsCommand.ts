import { Command, CommandBase, CommandParser, Event } from '@autobot/common';
import { RichEmbed }                                  from 'discord.js';
import { JSONUtil }                                   from '../_lib/JSONUtil';

/**
 * Outputs the searchable terms for a language.
 */
@Command
export class TermsCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: '#terms',
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS' ],
            roles: [

                process.env.DOCSBOT_ADMIN_ROLE_NAME

            ],
            description: 'Outputs the searchable terms for a language.'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     *
     */
    public async run(command: CommandParser) {

        const result = JSONUtil.getTerms(command.arguments[ 0 ].name);

        if (result) {

            const str = result.join(', ');

            for (let i = 0; i < str.length; i += 2048) {

                command.obj.channel.send(new RichEmbed().setTitle(`devdocs searchable for "${ command.arguments[ 0 ].name }"`)
                                                        .setColor(3447003)
                                                        .setDescription(result.join(', ').substring(i, 2048)));

            }

        } else {

            // command.obj.channel.send(new RichEmbed().setTitle('devdocs')
            //                                         .setColor(3447003)
            //                                         .setDescription(`Could not find any results for "${ command.arguments[ 0 ].name }`));

        }

    }


}
