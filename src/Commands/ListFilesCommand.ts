import { Command, CommandBase, CommandParser, Event } from '@autobot/common';
import { RichEmbed }                                  from 'discord.js';
import * as fs                                        from 'fs';

/**
 * Outputs the filenames.
 */
@Command
export class ListFilesCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: '#list',
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS' ],
            roles: [

                process.env.DOCSBOT_ADMIN_ROLE_NAME

            ],
            description: 'Outputs the searchable languages.'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     *
     */
    public async run(command: CommandParser) {

        const result = fs.readdirSync(process.env.DOCSBOT_SAVE_PATH);

        if (result) {

            command.obj.channel.send(new RichEmbed().setTitle(`devdocs searchable languages list`)
                                                    .setColor(3447003)
                                                    .setDescription(result.join(', ').replace(/\.json/g, '')));

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('devdocs')
                                                    .setColor(3447003)
                                                    .setDescription(`Could not list commands directory!`));

        }

    }


}
