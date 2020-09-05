const { Command } = require('discord-akairo');

class StartCommand extends Command {
	constructor() {
		super('start', {
			aliases: ['start'],
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'force',
					match: 'flag',
					flag: ['--force', '-f']
				}
			],
			description: {
				content: 'Joins and starts the queue.',
				usage: '[--force/-f]',
				examples: ['--force', '-f']
			}
		});
	}

	async exec(message, { force }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.channel.send(`You have to be in a voice channel ${this.client.emojis.get('745003854017593354')}`);
		} else if (!message.member.voice.channel.joinable) {
			return message.util.channel.send(`I don't have permission to enter this voice channel ${this.client.emojis.get('745003854017593354')}`);
		} else if (!message.member.voice.channel.speakable) {
			return message.util.channel.send(`I don't have permission to talk in this voice channel ${this.client.emojis.get('745003854017593354')}`);
		}
		const queue = this.client.music.queues.get(message.guild.id);
		if (!message.guild.me.voice || !message.guild.me.voice.channel || force) {
			await queue.player.join(message.member.voice.channel.id);
			message.util.send(`**Started** ${this.client.emojis.get('745003896522670100')}`);
		}
		if ((!queue.player.playing && !queue.player.paused) || force) await queue.start();
	}
}

module.exports = StartCommand;
