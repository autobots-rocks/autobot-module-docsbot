import { Command, CommandBase, CommandParser, Config, Event } from '@autobot/common';
import { RichEmbed }                                          from 'discord.js';
import { Alias }                                              from '../_lib/Alias';
import { JSONUtil }                                           from '../_lib/JSONUtil';

const h2m = require('h2m');

/**
 * Adds an alias `;;alias javascript js`.
 */
@Command
export class AliasAddCommand extends CommandBase {

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: `${ process.env.DOCSBOT_PREFIX_ALIAS_ADD }`,
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_ALIASES_CONFIG_PATH', 'DOCSBOT_PREFIX_ALIAS_ADD' ],
            roles: [

                process.env.DOCSBOT_ADMIN_ROLE_NAME

            ],
            description: 'Adds an alias `;;aliasadd lanaguage=javascript,alias=js`.'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     *
     */
    public async run(command: CommandParser) {

        if (JSONUtil.getFile(command.namedarguments.language)) {

            let aliasesConfig = Config.load<Alias>(process.env.DOCSBOT_ALIASES_CONFIG_PATH, 'docsbot_aliases');

            console.log(aliasesConfig);

            if (!aliasesConfig[ 'aliases' ]) {

                aliasesConfig[ 'aliases' ] = {};

            }

            Config.write(process.env.DOCSBOT_ALIASES_CONFIG_PATH, command.namedarguments.language, command.namedarguments.alias);

            command.obj.channel.send(new RichEmbed().setTitle('docsbot alias add')
                                                    .setColor(3447003)
                                                    .addField('language', command.namedarguments.language, true)
                                                    .addField('new alias', command.namedarguments.alias, true)
                                                    .setDescription(`language "${ command.namedarguments.language }" successfuly aliased!`));

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('docbot alias add: error')
                                                    .setColor(15158332)
                                                    .setDescription(`
                                                    
                                                        Langauge pack "${ command.namedarguments.language }" could not be located.
                                                    
                                                        To load a language pack use \`;;update ${ command.namedarguments.language }\`
                                                    
                                                    `));
        }

    }

}
