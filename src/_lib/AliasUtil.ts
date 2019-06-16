import { Config } from '@autobot/common';
import { Alias }  from './Alias';

export class AliasUtil {

    public static getKeyByValue(value: string): string {

        const aliases = Config.load<Alias>(process.env.DOCSBOT_ALIASES_CONFIG_PATH);

        console.log(aliases);

        for (let key in aliases) {

            if (aliases[ key ] == value) {

                return key;

            }

        }

    }

}
