import { Colors, Command, CommandBase, CommandParser, Event } from '@autobot/common';
import axios                                                  from 'axios';
import { RichEmbed }                                          from 'discord.js';
import * as fs                                                from 'fs';

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
            name: `${ process.env.DOCSBOT_PREFIX_UPDATE }`,
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_PREFIX_UPDATE', 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS' ],
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

        let result;

        try {

            result = await axios(`https://docs.devdocs.io/${ command.arguments[ 0 ].name }/db.json`);

        } catch (error) {

            result = null;

        }

        if (result) {

            fs.writeFile(`${ process.env.DOCSBOT_SAVE_PATH }/${ command.arguments[ 0 ].name }.json`, JSON.stringify(result.data), { encoding: 'utf-8' }, (err) => {

                if (err) {

                    console.log(err);

                    command.obj.channel.send(new RichEmbed().setTitle('docsbot')
                                                            .setColor(Colors.RED)
                                                            .setDescription(`Could not write to the save path. Please check your configuration and try again!`));

                } else {


                    command.obj.channel.send(new RichEmbed().setTitle('docsbot update')
                                                            .setColor(Colors.BLUE)
                                                            .setDescription(`
                                                    
                                                                Successfuly downloaded https://docs.devdocs.io/${ command.arguments[ 0 ].name }/db.json!
                                                                This language is now available with \`${ process.env.DOCSBOT_PREFIX_TERMS }${ command.arguments[ 0 ].name } <search term>\`
                                                                    
                                                            `));

                }

            });

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('docsbot')
                                                    .setColor(Colors.RED)
                                                    .setDescription(`
                                                    
                                                        Could not find any language matching "${ command.arguments[ 0 ].name }" from devdocs.io!
                                                        Try checking out https://devdocs.io and see if you can find a matching variant perhaps.
                                                    
                                                    `));

        }

    }

}
