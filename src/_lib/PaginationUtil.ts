export const paginationFilter = (reaction: any, user: any) => {

    // @ts-ignore
    return [ '🗑', '🔼', '🔽' ].includes(reaction.emoji.name);

};
