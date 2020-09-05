const { Command } = require('discord-akairo');
const Reputation = require('../../models/Reputations');

class ResetCommand extends Command {
	constructor() {
		super('reset', {
			aliases: ['reset'],
			category: 'general',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			quoted: false,
			description: {
				content: 'Resets the stars and/or reputations of the guild.',
				usage: '<mode>',
				examples: ['stars', 'reps', 'all']
			}
		});
	}

	*args() {
		const mode = yield {
			match: 'content',
			type: [['stars', 'star'], ['reps', 'rep'], 'all'],
			prompt: {
				start: 'Please choose an item to reset: `stars`, `reps`, `all`.',
				retry: 'Please provide a valid reset item, choose one of `stars`, `reps` or `all`'
			}
		};
		const confirm = yield {
			match: 'none',
			type: (msg, phrase) => {
				if (!phrase) return null;
				// Yes, yea, ye, or y
				if (/^y(?:e(?:a|s)?)?$/i.test(phrase)) return true;
				return false;
			},
			prompt: {
				start: {
					stars: 'Are you sure you want to reset all stars on this server? (**y/N**)',
					reps: 'Are you sure you want to reset all reputation points on this server? (**y/N**)',
					all: 'Are you sure you want to reset all stars and reputation points on this server? (**y/N**)'
				}[mode],
				retry: ''
			}
		};
		return { mode, confirm };
	}

	async exec(message, { mode, confirm }) {
		if (!confirm) {
			return message.util.send('<:disagree:745003854017593354> Reset has been cancelled.');
		}

		if (mode === 'stars' || mode === 'all') await this.client.starboards.get(message.guild.id).destroy();
		if (mode === 'reps' || mode === 'all') await Reputation.destroy({ where: { guildID: message.guild.id } });

		return message.util.send(`${message.author} **::** ${{
			stars: '<:agree:745003896522670100>	Successfully removed \`all starred messages\` on this server.',
			reps: '<:agree:745003896522670100> Successfully removed \`all reputation points\` on this server.',
			all: '<:agree:745003896522670100> Successfully removed \`all starred messages and reputation points\` on this server.'
		}[mode]}`);
	}
}

module.exports = ResetCommand;
