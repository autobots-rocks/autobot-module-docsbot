import { Colors, Command, CommandBase, CommandParser, Event } from '@autobot/common';
import { RichEmbed }                                          from 'discord.js';
import { AliasUtil }                                          from '../_lib/AliasUtil';
import { JSONUtil }                                           from '../_lib/JSONUtil';

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
            name: `${ process.env.DOCSBOT_PREFIX_TERMS }`,
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_PREFIX_TERMS', 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS' ],
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

        const result = JSONUtil.getTerms(command.arguments[ 0 ].name) || JSONUtil.getTerms(AliasUtil.getKeyByValue(command.arguments[ 0 ].name));

        if (result) {

            const str = result.join(', ');

            for (let i = 0; i < str.length; i += 2000) {

                command.obj.channel.send(new RichEmbed().setTitle(`devdocs searchable for "${ command.arguments[ 0 ].name }"`)
                                                        .setColor(Colors.BLUE)
                                                        .setDescription(result.join(', ').substr(i, 2000)));

            }

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('devdocs')
                                                    .setColor(Colors.RED)
                                                    .setDescription(`Could not find any terms for language "${ command.arguments[ 0 ].name }"`));

        }

    }


}
