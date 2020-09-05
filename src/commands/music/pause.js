const { Command } = require('discord-akairo');

class PauseCommand extends Command {
	constructor() {
		super('pause', {
			aliases: ['pause'],
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			description: { content: 'Pauses the queue.' }
		});
	}

	async exec(message) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.channel.send('<:disagree:745003854017593354> You have to be in a voice channel.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		await queue.player.pause();

		return message.util.send(`**Paused** ${this.client.emojis.get('745003896522670100')}`);
	}
}

module.exports = PauseCommand;
