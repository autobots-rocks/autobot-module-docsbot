import { Command, CommandBase, CommandParser, Config, Event } from '@autobot/common';
import { RichEmbed }                                          from 'discord.js';
import { Alias }                                              from '../_lib/Alias';

const h2m = require('h2m');

/**
 * Lists all configured aliases with `;;aliaslist`.
 */
@Command
export class AliasListCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: `${ process.env.DOCSBOT_PREFIX_ALIAS_LIST }`,
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_ALIASES_CONFIG_PATH', 'DOCSBOT_PREFIX_ALIAS_LIST' ],
            roles: [

                process.env.DOCSBOT_ADMIN_ROLE_NAME

            ],
            description: 'Lists all configured aliases with `;;aliaslist`.'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     */
    public async run(command: CommandParser) {

        let aliases = Config.load<Alias>(process.env.DOCSBOT_ALIASES_CONFIG_PATH);

        if (aliases) {

            const embed = new RichEmbed().setTitle('docsbot list aliases')
                                         .setColor(3447003)
                                         .setDescription(`the following language aliases are availble:`)
                                         .setFooter('https://github.com/autobots-rocks/autobot-docsbot');

            for (let key in aliases) {

                embed.addField(key, aliases[ key ], true);

            }

            command.obj.channel.send(embed);

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('docbot alias list: error')
                                                    .setColor(15158332)
                                                    .setDescription(`
                                                    
                                                        No aliases could be found!                                                    
                                                        To add an alias use \`;;aliasadd language=javascript,alias=js\`
                                                    
                                                    `));

        }

    }

}
