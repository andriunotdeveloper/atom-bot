const { Command } = require('discord-akairo');

class StopCommand extends Command {
	constructor() {
		super('stop', {
			aliases: ['stop'],
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			description: { content: 'Stops and clears the queue.' }
		});
	}

	async exec(message) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.channel.send('<:disagree:745003854017593354> You have to be in a voice channel.');
		}
		const DJ = message.member.roles.has(this.client.settings.get(message.guild.id, 'djRole', undefined));
		const queue = this.client.music.queues.get(message.guild.id);
		if (DJ) await queue.stop();
		else await queue.player.pause();
		return message.util.send(`<:agree:745003896522670100> **${DJ ? 'Stopped' : 'Paused'} queue.**`);
	}
}

module.exports = StopCommand;
