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
            requiredEnvVars: [ 'DOCSBOT_PREFIX_TERMS', 'DOCSBOT_TERMS_PAGE_LIMIT', 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS', 'DOCSBOT_LIMIT_CHARS' ],
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

        const termsPage = JSONUtil.getTermsPage(command.arguments[ 0 ].name, currentPage, Number(process.env.DOCSBOT_TERMS_PAGE_LIMIT));

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

                        const nextTermsPage = JSONUtil.getTermsPage(command.arguments[ 0 ].name, currentPage, Number(process.env.DOCSBOT_TERMS_PAGE_LIMIT));

                        reaction.message.edit(TermsCommand.getMessageEmbed(command.arguments[ 0 ].name, nextTermsPage.results.join(', ')));

                        DocsCommand.addPaginationReactions(message, currentPage > 0, currentPage < nextTermsPage.pages);

                    } else if (reaction.emoji.name === '🔼') {

                        currentPage--;

                        const nextTermsPage = JSONUtil.getTermsPage(command.arguments[ 0 ].name, currentPage, Number(process.env.DOCSBOT_TERMS_PAGE_LIMIT));

                        reaction.message.edit(TermsCommand.getMessageEmbed(command.arguments[ 0 ].name, nextTermsPage.results.join(', ')));

                        DocsCommand.addPaginationReactions(message, currentPage > 0, currentPage < nextTermsPage.pages);

                    } else if (reaction.users.has(command.obj.author.id) && reaction.emoji.name === '🗑') {

                        if (reaction.me) {

                            reaction.message.delete();

                        }

                    }

                }

            });

        }

    }

}
