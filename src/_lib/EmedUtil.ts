import { RichEmbed } from "discord.js";

export class EmedUtil {

    /**
     * Helper for a creating a simple embedded message
     *
     * @param title Top of the message
     * @param color The corresponding Discord color value
     * @param description Body of the message
     *
     */
    public static getEmbedBasic(title: string, color: number, description: string): RichEmbed {

        return new RichEmbed().setTitle(title)
                              .setColor(color)
                              .setDescription(description);

    }

}