const { Argument, Command } = require('discord-akairo');

class PlaylistRemoveCommand extends Command {
	constructor() {
		super('playlist-remove', {
			description: {
				content: 'Removes a song from the playlist.',
				usage: '<playlist> <position>',
				examples: []
			},
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'playlist',
					type: 'playlist',
					prompt: {
						start: 'what playlist should this song/playlist be removed from?',
						retry: (msg, { phrase }) => `a playlist with the name **${phrase}** does not exist.`
					}
				},
				{
					id: 'position',
					match: 'rest',
					type: Argument.compose((_, str) => str.replace(/\s/g, ''), Argument.range(Argument.union('number', 'emojint'), 1, Infinity)),
					default: 1
				}
			]
		});
	}

	async exec(message, { playlist, position }) {
		if (playlist.userID !== message.author.id) return message.util.channel.send('<:disagree:745003854017593354> You can only remove songs from your own playlists.');
		position = position >= 1 ? position - 1 : playlist.songs.length - (~position + 1);
		const decoded = await this.client.music.decode([playlist.songs[position]]);

		const newTracks = await playlist.songs.filter(id => id !== decoded[0].track);
		await playlist.update({ songs: newTracks });

		return message.util.send(`<:agree:745003896522670100> **Removed:** \`${decoded[0].info.title}\``);
	}
}

module.exports = PlaylistRemoveCommand;
