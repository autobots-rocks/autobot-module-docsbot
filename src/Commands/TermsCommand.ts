import { Colors, Command, CommandBase, CommandParser, Event } from '@autobot/common';
import { RichEmbed }                                          from 'discord.js';
import { JSONUtil }                                           from '../_lib/JSONUtil';
import { paginationFilter }                                   from '../_lib/PaginationUtil';
import { DocsCommand }                                        from './DocsCommand';

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
            requiredEnvVars: [ 'DOCSBOT_PREFIX_TERMS', 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS', 'DOCSBOT_LIMIT_CHARS' ],
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

        let currentPage = 1;

        const results = JSONUtil.getTermsPage(command.arguments[ 0 ].name, currentPage, 20);

        if (results.length > 0) {

            const embed = new RichEmbed().setTitle(`devdocs terms for "${ command.arguments[ 0 ].name }"`)
                                         .setURL('https://github.com/autobots-rocks/autobot-module-docsbot')
                                         .setColor(Colors.BLUE)
                                         .setFooter('https://github.com/autobots-rocks/autobot-module-docsbot')
                                         .setDescription(results.join(', '));

            const message = await command.obj.channel.send(embed);

            // @ts-ignore
            let collector = message.createReactionCollector(paginationFilter, { time: 999999 });

            // @ts-ignore
            collector.on('collect', async (reaction, collector) => {

                if (reaction.users.size >= 2 && reaction.me) {

                    if (reaction.emoji.name === '🔽') {

                        currentPage++;
                        //     reaction.message.edit(new RichEmbed().setTitle(`devdocs: "${ doc.key }"`)
                        //                                          .setColor(3447003)
                        //                                          .addField('devdocs.io urls', `https://devdocs.io/${ actualTermOrAlias }/${ doc.key }`)
                        //                                          .setDescription(h2m(doc.doc).substr(DocsCommand.PAGE_LENGTH * page, DocsCommand.PAGE_LENGTH));
                        // );
                        //
                        //     DocsCommand.addPaginationReactions(message, currentPage > 0, (currentPage + 1) < result.pages);

                    } else if (reaction.emoji.name === '🔼') {

                        if (currentPage > 0) {

                            currentPage--;

                        }

                        DocsCommand.addPaginationReactions(message, currentPage > 0, true);

                    } else if (reaction.users.has(command.obj.author.id) && reaction.emoji.name === '🗑') {

                        if (reaction.me) {

                            reaction.message.delete();

                        }

                    }

                }

            });
            //
            // if (result) {
            //
            //     // const str = result.join(', ');
            //     //
            //     // for (let i = 0; i < str.length; i += 2000) {
            //     //
            //     //     command.obj.channel.send(new RichEmbed().setTitle(`devdocs searchable for "${ command.arguments[ 0 ].name }"`)
            //     //                                             .setColor(Colors.BLUE)
            //     //                                             .setDescription(result.join(', ').substr(i, 2000)));
            //     //
            //     // }
            //
            // } else {
            //
            //     command.obj.channel.send(new RichEmbed().setTitle('devdocs')
            //                                             .setColor(Colors.RED)
            //                                             .setDescription(`Could not find any terms for language "${ command.arguments[ 0 ].name }"`));
            //
            // }

        }

    }

}
