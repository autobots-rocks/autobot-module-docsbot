import { Command, CommandBase, CommandParser, Event } from '@autobot/common';
import { RichEmbed }                                  from 'discord.js';
import { Doc }                                        from '../_lib/Doc';
import { JSONUtil }                                   from '../_lib/JSONUtil';

const h2m = require('h2m');

/**
 *
 */
@Command
export class JavascriptCommand extends CommandBase {

    public static readonly PAGE_LENGTH: number = 1900;

    public static getEmbed(doc: Doc, page: number): RichEmbed {

        return new RichEmbed().setTitle(`devdocs: "${ doc.key }"`)
                              .setColor(3447003)
                              .addField('devdocs.io url', `https://devdocs.io/javascript/${ doc.key }`)
                              .setDescription("```md\n" + h2m(doc.doc).substr(JavascriptCommand.PAGE_LENGTH * page, JavascriptCommand.PAGE_LENGTH) + "...\n```");

    }

    public constructor() {

        //
        // Set this commands configuration.
        //
        super({

            event: Event.MESSAGE,
            name: '!js',
            group: 'docs',
            description: '!js <search term>'

        });

    }

    /**
     * Called when a command matches config.name.
     *
     * @param command Parsed out commamd
     *
     */
    public async run(command: CommandParser) {

        let currentPosition: number = 0;
        let currentLength = 0;

        const result = JSONUtil.getByName('strict_mode');

        if (result) {

            const message = await command.obj.channel.send(JavascriptCommand.getEmbed(result, 1));

            // @ts-ignore
            await message.react('🗑');
            // @ts-ignore
            await message.react('⏪');
            // @ts-ignore
            await message.react('⏩');

            const filter = (reaction: any, user: any) => {

                // @ts-ignore
                // return [ '🗑' ].includes(reaction.emoji.name && user.id !== message.author.id);
                return [ '🗑', '⏪', '⏩' ].includes(reaction.emoji.name);

            };

            // @ts-ignore
            message.awaitReactions(filter, { max: 1, time: 60000, errors: [ 'time' ] })

                   // @ts-ignore
                   .then(collected => {

                       const reaction = collected.first();

                       console.log(123123, reaction);

                       if (!reaction.me) {

                           if (reaction.emoji.name === '⏩') {

                               // @ts-ignore
                               message.reply('delete');

                           } else {
                               // @ts-ignore
                               message.reply('you reacted with a thumbs down.');

                           }

                       }


                   })
                   // @ts-ignore
                   .catch(collected => {

                       console.log(`After a minute, only ${ collected.size } out of 4 reacted.`);

                       // @ts-ignore
                       message.reply('you didn\'t react with neither a thumbs up, nor a thumbs down.');

                   });

        } else {

            command.obj.channel.send(new RichEmbed().setTitle('devdocs')
                                                    .setColor(3447003)
                                                    .setDescription(`Could not find any results for "${ command.arguments[ 0 ].name }`));

        }

        //
        // const embed = new RichEmbed().setTitle('Flip!')
        //                              .setColor(3447003);
        //
        // results.forEach(row => {
        //
        //     embed.addField(`❯ ${ row.total } points`, `<@${ row.to_userid }>`);
        //
        // });
        //
        // command.obj.channel.send(embed);

    }


}
