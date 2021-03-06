const { Argument, Command } = require('discord-akairo');
const { MessageEmbed } = require('discord.js');
const { paginate } = require('../../util/Base');

class SearchCommand extends Command {
	constructor() {
		super('search', {
			aliases: ['search', 'sh'],
			category: 'music',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'unshift',
					match: 'flag',
					flag: ['--soundcloud', '-sc']
				},
				{
					id: 'query',
					match: 'rest',
					type: Argument.compose('string', (_, str) => str ? str.replace(/<(.+)>/g, '$1') : ''),
					default: ''
				}
			],
			description: {
				content: 'Play a song from literally any source you can think of.',
				usage: '<link/search>',
				examples: ['justin bieber', '-cw justin bieber']
			}
		});
	}

	async exec(message, { query, unshift }) {
		if (!message.member.voice || !message.member.voice.channel) {
			return message.util.channel.send('<:disagree:745003854017593354> You have to be in a voice channel.');
		} else if (!message.member.voice.channel.joinable) {
			return message.util.channel.send('<:disagree:745003854017593354> I don\'t have permission to enter this voice channel.');
		} else if (!message.member.voice.channel.speakable) {
			return message.util.channel.send('<:disagree:745003854017593354> I don\'t have permission to talk in this voice channel.');
		}

		let res;

		if (unshift) {
			res = await this.client.music.load(`scsearch:${query}`);
		} else {
			res = await this.client.music.load(`ytsearch:${query}`);
		}

		const queue = this.client.music.queues.get(message.guild.id);
		if (!message.guild.me.voice.channel) await queue.player.join(message.member.voice.channel.id);

		const paginated = paginate({ items: res.tracks, page: 1, pageLength: 10 });
		let msg;
		let index = 0;
		if (['TRACK_LOADED', 'SEARCH_RESULT'].includes(res.loadType)) {
			const embed = new MessageEmbed().setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
				.addField('SEARCH RESULT', `${paginated.items.map(track => `**${++index}.** ${track.info.title}`).join('\n\n')}`)
				.setColor('invisible')
				.setFooter('Enter number only');
			const m = await message.channel.send(embed);

			const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id &&
				msg.content > 0 && msg.content < 11, {
				max: 1,
				time: 30000
			});

			if (!responses || responses.size !== 1) {
				return m.delete();
			}
			const response = responses.first();

			const input = parseInt(response.content); // eslint-disable-line

			await queue.add(res.tracks[input - 1].track);

			msg = res.tracks[input - 1].info.title;
			m.delete();
		} else {
			return message.util.send('<:disagree:745003854017593354> I couldn\'t find what you were looking for');
		}
		if (!queue.player.playing && !queue.player.paused) await queue.start();

		return message.util.send(`${this.client.emojis.get('745003896522670100')} **Queued up:** \`${msg}\``);
	}
}

module.exports = SearchCommand;
