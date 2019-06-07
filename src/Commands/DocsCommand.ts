import { Command, CommandBase, CommandParser, Event } from '@autobot/common';
import { RichEmbed }                                  from 'discord.js';
import { Doc }                                        from '../_lib/Doc';
import { JSONUtil }                                   from '../_lib/JSONUtil';

const h2m = require('h2m');

/**
 *
 */
@Command
export class DocsCommand extends CommandBase {

    public static readonly PAGE_LENGTH: number = Number(process.env.DOCSBOT_LIMIT_CHARS);

    public static getEmbed(doc: Doc, page: number): RichEmbed {

        return new RichEmbed().setTitle(`devdocs: "${ doc.key }"`)
                              .setColor(3447003)
                              .addField('devdocs.io url', `https://devdocs.io/javascript/${ doc.key }`)
                              .setDescription(h2m(doc.doc).substr(DocsCommand.PAGE_LENGTH * page, DocsCommand.PAGE_LENGTH));

    }

    public static async addReactions(message: any, showPrev: boolean, showNext: boolean) {

        // @ts-ignore
        await message.clearReactions();

        // @ts-ignore
        await message.react('🗑');

        if (showPrev) {

            // @ts-ignore
            await message.react('⏪');

        }

        if (showNext) {

            // @ts-ignore
            await message.react('⏩');

        }

    }

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: '*',
            group: 'docs',
            requiredEnvVars: [ 'DOCSBOT_PREFIX_SEARCH', 'DOCSBOT_PREFIX_TERMS', 'DOCSBOT_SAVE_PATH', 'DOCSBOT_ADMIN_ROLE_NAME', 'DOCSBOT_LIMIT_CHARS' ],
            roles: [ process.env.DOCSBOT_ADMIN_ROLE_NAME ],
            description: ';language <search term>'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     *
     */
    public async run(command: CommandParser) {

        let currentPage: number = 0;

        const matches = command.obj.content.match(new RegExp('^' + process.env.DOCSBOT_PREFIX_SEARCH + '([a-z0-9-/~._]{2,32})\\s+([a-z0-9-/~._]{2,64})$'));

        if (matches && matches.length === 3) {

            const result = JSONUtil.getByName(matches[ 1 ], matches[ 2 ]);

            if (result) {

                const message = await command.obj.channel.send(DocsCommand.getEmbed(result, currentPage));

                const filter = (reaction: any, user: any) => {

                    // @ts-ignore
                    return [ '🗑', '⏪', '⏩' ].includes(reaction.emoji.name);

                };

                DocsCommand.addReactions(message, currentPage > 0, currentPage < result.pages);

                // @ts-ignore
                let collector = message.createReactionCollector(filter, { time: 999999 });

                // @ts-ignore
                collector.on('collect', async (reaction, collector) => {

                    if (reaction.users.size === 2 && reaction.me) {

                        if (reaction.emoji.name === '⏩') {

                            currentPage++;
                            reaction.message.edit(DocsCommand.getEmbed(result, currentPage));

                        } else if (reaction.emoji.name === '⏪') {

                            if (currentPage > 0) {

                                currentPage--;
                                reaction.message.edit(DocsCommand.getEmbed(result, currentPage));

                            }

                        } else if (reaction.emoji.name === '🗑') {

                            reaction.message.delete();

                        }

                        DocsCommand.addReactions(message, currentPage > 0, (currentPage + 1) < result.pages);

                    }

                });

            } else {

                command.obj.channel.send(new RichEmbed().setTitle('devdocs')
                                                        .setColor(15158332)
                                                        .setDescription(`Sorry, couldn't find the term "${ command.arguments[ 0 ].name }"\
                                                                          for the language "${ matches[ 1 ] }".
                                                                          To see a list of all possible terms, use the command \`${ process.env.DOCSBOT_PREFIX_TERMS } ${ matches [ 1 ] }\`.
                                                                         `));

            }

        }

    }

}
