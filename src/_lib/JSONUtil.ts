import * as fs from 'fs';
import { Doc } from './Doc';

export class JSONUtil {

    public static getByName(filename: string, name: string): Doc {

        if (filename.match(/^[a-z0-9-~._]+$/i)) {

            if (fs.existsSync(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`)) {

                const json = require(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`);

                for (let key in json) {

                    console.log(key);

                    const split = key.split(/[\/.]/);

                    if (split[ split.length - 1 ] == name) {

                        let pages: number = 0;

                        if (json[ key ].length / Number(process.env.DOCSBOT_LIMIT_CHARS) > 0) {

                            pages = Math.floor(json[ key ].length / Number(process.env.DOCSBOT_LIMIT_CHARS)) - 1;

                        } else {

                            pages = 0;

                        }

                        return {

                            key,
                            name,
                            doc: json[ key ],
                            pages

                        };

                    }

                }

            }

        }

    }

    public static getTerms(filename: string): Array<string> {

        if (filename.match(/^[a-z0-9-~._]+$/i)) {

            if (fs.existsSync(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`)) {

                const terms = [];
                const json = require(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`);

                for (let key in json) {

                    const split = key.split(/[\/.]/);

                    if (terms.indexOf(split[ split.length - 1 ]) === -1) {

                        terms.push(split[ split.length - 1 ]);

                    }

                }

                return terms;

            }
            
        }

    }

}
