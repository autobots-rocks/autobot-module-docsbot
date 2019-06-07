import * as fs   from 'fs';
import * as Fuse from 'fuse.js';
import { Doc }   from './Doc';

const FuzzySet = require('fuzzyset.js');

export class JSONUtil {

    public static getByName(filename: string, name: string): Doc {

        if (filename.match(/^[a-z0-9-/~._]{2,32}$/i)) {


            if (fs.existsSync(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`)) {

                const json = require(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`);
                const objects = JSONUtil.getObjects(filename);

                if (objects && objects.length > 0) {

                    const fuse = new Fuse(objects, {

                        shouldSort: true,
                        threshold: 0.6,
                        location: 0,
                        distance: 100,
                        maxPatternLength: 32,
                        minMatchCharLength: 1,
                        keys: [ "name" ]

                    });

                    const result = fuse.search(name);

                    if (result && result.length > 0) {

                        const key = result[ 0 ].name;

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

    public static getObjects(filename: string): Array<{ name: string }> {

        if (fs.existsSync(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`)) {

            const objects: Array<{ name: string }> = [];

            const json = require(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`);

            if (json) {

                Object.keys(json).forEach(key => objects.push({ name: key }));

            }

            return objects;

        }

    }

}
