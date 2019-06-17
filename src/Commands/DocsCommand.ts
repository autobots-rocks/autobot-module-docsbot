import { Command, CommandBase, CommandParser, Event } from '@autobot/common';
import { RichEmbed }                                  from 'discord.js';
import { AliasUtil }                                  from '../_lib/AliasUtil';
import { Doc }                                        from '../_lib/Doc';
import { EmedUtil }                                   from '../_lib/EmedUtil';
import { JSONUtil }                                   from '../_lib/JSONUtil';

const h2m = require('h2m');

/**
 *
 */
@Command
export class DocsCommand extends CommandBase {

    public static readonly PAGE_LENGTH: number = Number(process.env.DOCSBOT_LIMIT_CHARS);

    public static getEmbedDoc(doc: Doc, page: number, searchedFor: string): RichEmbed {

        searchedFor = searchedFor.replace(/\./g, '/');

        const actualTermOrAlias = AliasUtil.getKeyByValue(searchedFor) || searchedFor;

        return new RichEmbed().setTitle(`devdocs: "${ doc.key }"`)
                              .setColor(3447003)
                              .addField('devdocs.io urls', `https://devdocs.io/${ actualTermOrAlias }/${ doc.key }`)
                              .setDescription(h2m(doc.doc).substr(DocsCommand.PAGE_LENGTH * page, DocsCommand.PAGE_LENGTH));

    }

    public static async addReactions(message: any, showPrev: boolean, showNext: boolean) {

        // @ts-ignore
        await message.clearReactions();

        // @ts-ignore
        await message.react('🗑');

        if (showPrev) {

            // @ts-ignore
            await message.react('🔼');

        }

        if (showNext) {

            // @ts-ignore
            await message.react('🔽');

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
     * @param command Parsed out command
     *
     */
    public async run(command: CommandParser) {

        const matches = command.obj.content.match(new RegExp('^' + process.env.DOCSBOT_PREFIX_SEARCH + '([a-z0-9-/~._]{1,32})\\s+([a-z0-9-/~._]{1,64})$'));

        if (matches && matches.length === 3) {

            let result = JSONUtil.getByName(matches[ 1 ], matches[ 2 ]) || JSONUtil.getByName(AliasUtil.getKeyByValue(matches[ 1 ]), matches[ 2 ]);

            if (result) {

                if (result[ 0 ].key === matches[ 2 ]) {

                    DocsCommand.sendDoc(command, result[ 0 ], matches);

                } else {

                    DocsCommand.sendResults(command, result, matches);

                }

            } else {

                let description = `Sorry, couldn't find any search results for "${ command.arguments[ 0 ].name }"\
                                   in the language "${ matches[ 1 ] }".
                                   To see a list of all possible terms, use the command \`${ process.env.DOCSBOT_PREFIX_TERMS } ${ matches [ 1 ] }\`.
                                  `;

                command.obj.channel.send(EmedUtil.getEmbedBasic('devdocs', 15158332, description));

            }

        }

    }

    /**
     * Send a document, along with emojis
     *
     * @param command Parsed out command
     * @param result Document to send
     * @param matches Language and term names
     * @param message? If a message has already been sent, pass it here to overwrite instead
     *
     */
    public static async sendDoc(command: CommandParser, result: Doc, matches: string[], message?: any) {

        let messagePassed: boolean;
        let currentPage: number = 0;

        if (message) {

            message = await message.edit(DocsCommand.getEmbedDoc(result, currentPage, matches[ 1 ]));
            messagePassed = true;

        } else {

            message = await command.obj.channel.send(DocsCommand.getEmbedDoc(result, currentPage, matches[ 1 ]));
            messagePassed = false;

        }

        const filter = (reaction: any, user: any) => {

            // @ts-ignore
            return [ '🗑', '🔼', '🔽' ].includes(reaction.emoji.name);

        };

        DocsCommand.addReactions(message, currentPage > 0, currentPage < result.pages);

        // @ts-ignore
        let collector = message.createReactionCollector(filter, { time: 999999 });

        // @ts-ignore
        collector.on('collect', async (reaction, collector) => {

            if (reaction.users.size >= 2 && reaction.me) {

                if (reaction.emoji.name === '🔽') {

                    currentPage++;
                    reaction.message.edit(DocsCommand.getEmbedDoc(result, currentPage, matches[ 1 ]));

                    DocsCommand.addReactions(message, currentPage > 0, (currentPage + 1) < result.pages);

                } else if (reaction.emoji.name === '🔼') {

                    if (currentPage > 0) {

                        currentPage--;
                        reaction.message.edit(DocsCommand.getEmbedDoc(result, currentPage, matches[ 1 ]));

                    }

                    DocsCommand.addReactions(message, currentPage > 0, currentPage < result.pages);

                } else if (reaction.users.has(command.obj.author.id) && reaction.emoji.name === '🗑' && !messagePassed) {

                    if (reaction.me) {

                        reaction.message.delete();

                    }

                }

            }

        });

    }

    /**
     * Sends results from search, with emojis to choose which document
     *
     * @param command Parsed out command
     * @param results Document to send
     * @param matches Language and term names
     *
     */
    public static async sendResults(command: CommandParser, results: Doc[], matches: string[]) {

        const emojiNumbers = [ '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟' ].slice(0, results.length);

        const list = results.map((result, index) => emojiNumbers[ index ] + " **" + result.key + "**").join('\n');

        const description = `Sorry, an exact match for the term "${ matches[ 2 ] }", wasn't found.
            
                             Here are the closest matches:
                             ${ list }
                          
                             Select the correct term by reacting with the corresponding emoji. 
                            `;

        const message = await command.obj.channel.send(EmedUtil.getEmbedBasic('devdocs', 3447003, description));

        // @ts-ignore
        await message.react('🗑');

        for (let emoji of emojiNumbers) {

            // @ts-ignore
            await message.react(emoji);

        }

        const filter = (reaction: any, user: any) => {

            emojiNumbers.push('🗑');

            // @ts-ignore
            return emojiNumbers.includes(reaction.emoji.name);

        };

        // @ts-ignore
        let collector = message.createReactionCollector(filter, { time: 999999 });

        // @ts-ignore
        collector.on('collect', async (reaction, collector) => {

            if (reaction.users.has(command.obj.author.id)) {

                // @ts-ignore
                if (reaction.emoji.name === '🗑') {

                    reaction.message.delete();

                } else {

                    DocsCommand.sendDoc(command, results[ emojiNumbers.indexOf(reaction.emoji.name) ], matches, message);

                }

            }

        });

    }


}
