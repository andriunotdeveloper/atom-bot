const { Argument, Command } = require('discord-akairo');

class RemoveCommand extends Command {
	constructor() {
		super('remove', {
			aliases: ['remove', 'rm'],
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'num',
					match: 'content',
					type: Argument.compose((_, str) => str.replace(/\s/g, ''), Argument.union('number', 'emojint'))
				}
			],
			description: {
				content: 'Removes a song from the queue.',
				usage: '[num]',
				examples: ['3', '6']
			}
		});
	}

	async exec(message, { num }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.channel.send('<:disagree:745003854017593354> You have to be in a voice channel.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		const tracks = await queue.tracks();

		try {
			num = num >= 1 ? num - 1 : tracks.length - (~num + 1);
			const decoded = await this.client.music.decode([tracks[num]]);
			queue.remove(tracks[num]);
			return message.util.send(`<:agree:745003896522670100> **Removed:** \`${decoded[0].info.title}\``);
		} catch (error) {}
	}
}

module.exports = RemoveCommand;
