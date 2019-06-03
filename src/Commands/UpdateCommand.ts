import { Command, CommandBase, CommandParser, Event } from '@autobot/common';
import axios                                          from 'axios';
import { RichEmbed }                                  from 'discord.js';
import * as fs                                        from 'fs';

/**
 * Downloads the latest db.json file from devdocs.io with an !update <language>.
 */
@Command
export class UpdateCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: '#update',
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS' ],
            roles: [

                process.env.DOCSBOT_ADMIN_ROLE_NAME

            ],
            description: 'Downloads the latest db.json file from devdocs.io with an !update <language>'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     *
     */
    public async run(command: CommandParser) {

        const result = await axios(`https://docs.devdocs.io/${ command.arguments[ 0 ].name }/db.json`);

        if (result) {

            fs.writeFile(`${ process.env.DOCSBOT_SAVE_PATH }/${ command.arguments[ 0 ].name }.json`, JSON.stringify(result.data), { encoding: 'utf-8' }, (err) => {

                console.log(err);

            });

            command.obj.channel.send(new RichEmbed().setTitle('devdocs update')
                                                    .setColor(3447003)
                                                    .setDescription(`Downloaded https://docs.devdocs.io/${ command.arguments[ 0 ].name }/db.json!`));

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('devdocs')
                                                    .setColor(3447003)
                                                    .setDescription(`Could not find any results for "${ command.arguments[ 0 ].name }`));

        }

    }

}
