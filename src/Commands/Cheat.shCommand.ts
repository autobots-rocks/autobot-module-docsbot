import { Command, CommandBase, CommandParser, Event } from '@autobot/common';
import axios                                          from 'axios';
import { RichEmbed }                                  from 'discord.js';

const h2m = require('h2m');

/**
 * Pings cheat.sh
 */
@Command
export class CheatShCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: '#cheat',
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS' ],
            roles: [

                process.env.DOCSBOT_ADMIN_ROLE_NAME

            ],
            description: 'Pings cheat.sh'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     *
     */
    public async run(command: CommandParser) {

        const result = await axios(`https://cheat.sh/${ command.arguments[ 0 ].name }?T`, { headers: { 'User-Agent': 'curl/7.55.1' } });

        if (result.data) {

            command.obj.channel.send(new RichEmbed().setTitle('cheat.sh')
                                                    .setColor(3447003)
                                                    .setDescription('```md' + "\n" + result.data.substring(0, Number(process.env.DOCSBOT_LIMIT_CHARS)) + "```")
                                                    .setURL(`https://cheat.sh/${ command.arguments[ 0 ].name }`));

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('cheat.sh')
                                                    .setColor(3447003)
                                                    .setDescription(`Could not find any results for "${ command.arguments[ 0 ].name }`));

        }

    }

}
