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

    public static getMessageEmbed(term: string, results: string): RichEmbed {

        return new RichEmbed().setTitle(`devdocs terms for "${ term }"`)
                              .setURL('https://github.com/autobots-rocks/autobot-module-docsbot')
                              .setColor(Colors.BLUE)
                              .setFooter('https://github.com/autobots-rocks/autobot-module-docsbot')
                              .setDescription(results);

    }

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

        let currentPage = 0;

        const termsPage = JSONUtil.getTermsPage(command.arguments[ 0 ].name, currentPage, 20);

        if (termsPage.results.length > 0) {

            const message = await command.obj.channel.send(TermsCommand.getMessageEmbed(command.arguments[ 0 ].name, termsPage.results.join(', ')));

            DocsCommand.addPaginationReactions(message, currentPage > 0, (currentPage + 1) < termsPage.pages);

            // @ts-ignore
            let collector = message.createReactionCollector(paginationFilter, { time: 999999 });

            // @ts-ignore
            collector.on('collect', async (reaction, collector) => {

                console.log(reaction.users.size);

                if (reaction.users.size >= 2 && reaction.me) {

                    if (reaction.emoji.name === '🔽') {

                        currentPage++;

                        const nextTermsPage = JSONUtil.getTermsPage(command.arguments[ 0 ].name, currentPage, 20);

                        reaction.message.edit(TermsCommand.getMessageEmbed(command.arguments[ 0 ].name, nextTermsPage.results.join(', ')));

                        DocsCommand.addPaginationReactions(message, currentPage > 0, currentPage < nextTermsPage.pages);

                    } else if (reaction.emoji.name === '🔼') {

                        currentPage--;

                        const nextTermsPage = JSONUtil.getTermsPage(command.arguments[ 0 ].name, currentPage, 20);

                        reaction.message.edit(TermsCommand.getMessageEmbed(command.arguments[ 0 ].name, nextTermsPage.results.join(', ')));

                        DocsCommand.addPaginationReactions(message, currentPage > 0, currentPage < nextTermsPage.pages);

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
