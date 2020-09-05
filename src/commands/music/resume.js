const { Command } = require('discord-akairo');

class ResumeCommand extends Command {
	constructor() {
		super('resume', {
			aliases: ['resume'],
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			description: { content: 'Resumes the queue.' }
		});
	}

	async exec(message) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.channel.send('<:disagree:745003854017593354> You have to be in a voice channel.');
		}
		const queue = this.client.music.queues.get(message.guild.id);
		await queue.player.pause(false);

		return message.util.send('<:agree:745003896522670100> **Resumed**');
	}
}

module.exports = ResumeCommand;
