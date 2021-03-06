const { Command } = require('discord-akairo');

class PlaylistDeleteCommand extends Command {
	constructor() {
		super('playlist-delete', {
			category: 'music',
			description: {
				content: 'Deletes a playlist.',
				usage: '<playlist>'
			},
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					match: 'content',
					type: 'playlist',
					prompt: {
						start: 'what playlist do you want to delete?',
						retry: (msg, { phrase }) => `a playlist with the name **${phrase}** does not exist.`
					}
				}
			]
		});
	}

	async exec(message, { playlist }) {
		if (playlist.userID !== message.author.id) return message.util.reply('you can only delete your own playlists.');
		await playlist.destroy();
		return message.util.reply(`<:agree:745003896522670100> Successfully deleted **${playlist.name}**.`);
	}
}

module.exports = PlaylistDeleteCommand;
