import * as fs       from 'fs';
import * as Fuse     from 'fuse.js';
import { AliasUtil } from './AliasUtil';
import { Doc }       from './Doc';
import { TermsPage } from './TermsPage';

export class JSONUtil {

    public static getByName(filename: string, name: string): Doc[] {

        if (filename.match(/^[a-z0-9-/~._]{1,64}$/i)) {

            if (fs.existsSync(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`)) {

                const json = require(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`);
                const objects = JSONUtil.getObjects(filename);

                if (objects && objects.length > 0) {

                    const fuse = new Fuse(objects, {

                        shouldSort: true,
                        threshold: 0.3,
                        location: 0,
                        distance: 100,
                        maxPatternLength: 32,
                        minMatchCharLength: 1,
                        keys: [ "name" ]

                    });

                    const results = fuse.search(name);

                    if (results && results.length > 0) {

                        const limit = Number(process.env.DOCSBOT_LIMIT_RESULTS);

                        let processedResults = results.slice(0, limit).map(result => {

                            const key = result.name;

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

                        });

                        return processedResults;

                    }

                }

            }

        }

    }

    public static getTerms(filename: string): Array<string> {

        if (filename.match(/^[a-z0-9-/~._]{1,64}$/i)) {

            if (fs.existsSync(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`)) {

                const terms = [];
                const json = require(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`);

                for (let key in json) {

                    const split = key.split(/[\/.]/);

                    if (terms.indexOf(split[ split.length - 1 ]) === -1) {

                        terms.push(split[ split.length - 1 ]);

                    }

                }

                return terms.sort();

            }

        }

    }

    public static getTermsPage(languageOrAlias: string, pageNumber: number, limit: number): TermsPage {

        const result = JSONUtil.getTerms(languageOrAlias) || JSONUtil.getTerms(AliasUtil.getKeyByValue(languageOrAlias));

        const temp = [];

        for (let i = 0; i < limit; i++) {

            console.log(1111, i);

            temp.push(result[ i + (pageNumber * limit) ]);

        }

        return new TermsPage(temp, Math.floor(result.length / limit));

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

    public static getFile(filename: string): any {

        if (fs.existsSync(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`)) {

            return require(`${ process.env.DOCSBOT_SAVE_PATH }/${ filename }.json`);

        }

    }

    public static getLanguages(): Array<string> {

        if (fs.existsSync('../conf/languages.json')) {

            return require('../conf/languages.json').languages;

        }

    }

    public static getLanguageExists(language: string): boolean {

        if (fs.existsSync('../conf/languages.json')) {

            const languages = require('../conf/languages.json').languages;

            for (let i = 0; i < languages.length; i++) {

                if (languages[ i ] == language) {

                    return true;

                }

            }

        }

    }

}
