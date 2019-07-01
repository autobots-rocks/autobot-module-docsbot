import { Command, CommandBase, CommandParser, Config, Event } from '@autobot/common';
import { RichEmbed }                                          from 'discord.js';
import * as fs                                                from 'fs';
import { Alias }                                              from '../_lib/Alias';
import { ListFilesCommand }                                   from './ListFilesCommand';

/**
 * Outputs help information.
 */
@Command
export class HelpCommand extends CommandBase {

    public constructor() {


        //
        // Set this commands configuration.
        //
        // super({
        //
        //     event: Event.MESSAGE,
        //     name: process.env.DOCSBOT_PREFIX_HELP,
        //     group: 'docs',
        //     requiredEnvVars: [
        //
        //         'DOCSBOT_PREFIX_HELP',
        //         'DOCSBOT_PREFIX_SEARCH',
        //         'DOCSBOT_SAVE_PATH',
        //         'DOCSBOT_ADMIN_ROLE_NAME',
        //         'DOCSBOT_PREFIX_UPDATE',
        //         'DOCSBOT_PREFIX_TERMS',
        //         'DOCSBOT_PREFIX_CHEAT'
        //
        //     ],
        //     roles: [
        //
        //         process.env.DOCSBOT_ADMIN_ROLE_NAME
        //
        //     ],
        //     description: 'Outputs help information.'
        //
        // });

        super({

            event: Event.MESSAGE,
            name: 'asdf',
            group: 'asdfasdf',
            description: 'asdfasdf'

        });
        console.log(12312313123);

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

            const embed = new RichEmbed().setTitle(`docsbot help`)
                                         .setDescription(`docsbot is a bot that searches devdocs.io and cheat.sh`)
                                         .setColor(3447003)
                                         .addField('searching', `use \`${ process.env.DOCSBOT_PREFIX_SEARCH }<language> <method>\` such as \`${ process.env.DOCSBOT_PREFIX_SEARCH }javascript async\``)
                                         .addField('seeing what terms there are', `use \`${ process.env.DOCSBOT_PREFIX_TERMS } <language>\` such as \`${ process.env.DOCSBOT_PREFIX_TERMS } javascript\`. this will output a list of all searchable terms.`)
                                         .addField('seeing what aliases there are', `use \`${ process.env.DOCSBOT_PREFIX_ALIAS_LIST }\`. this will output a list of all aliases.`);


            const aliases = Config.load<Alias>(process.env.DOCSBOT_ALIASES_CONFIG_PATH);

            for (let key in aliases) {

                embed.addField(key, aliases[ key ], true);

            }

            embed.addField('searchable languages list', result.filter(val => ListFilesCommand.BLOCKED_FILES.indexOf(val) === -1).join(', ').replace(/\.json/g, ''))
                 .addField('downloading new languages', `use \`${ process.env.DOCSBOT_PREFIX_UPDATE } <language>\` such as \`${ process.env.DOCSBOT_PREFIX_UPDATE } javascript\``)
                 .addField('searching shell commands', `use \`${ process.env.DOCSBOT_PREFIX_CHEAT } <command>\` such as \`${ process.env.DOCSBOT_PREFIX_CHEAT } grep\`. this will use https://cheat.sh to search for a shell command.`)
                 .setURL('https://github.com/autobots-rocks/autobot-docsbot')
                 .setFooter('https://github.com/autobots-rocks/autobot-docsbot');

            command.obj.channel.send(embed);

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('devdocs')
                                                    .setColor(15158332)
                                                    .setDescription(`Could not list commands directory!`));

        }

    }


}
