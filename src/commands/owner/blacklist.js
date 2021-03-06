const { Command } = require('discord-akairo');

class GlobalBlacklistCommand extends Command {
	constructor() {
		super('gloablblacklist', {
			aliases: ['block', 'unblock'],
			description: {
				content: 'Prohibit/Allow a user from using bot.',
				usage: '<user>',
				examples: ['@Suvajit', '81440962496172032']
			},
			category: 'util',
			ownerOnly: true,
			ratelimit: 2,
			args: [
				{
					id: 'user',
					match: 'content',
					type: 'user',
					prompt: {
						start: 'who would you like to blacklist/unblacklist?'
					}
				}
			]
		});
	}

	async exec(message, { user }) {
		const blacklist = this.client.settings.get('global', 'blacklist', []);
		if (blacklist.includes(user.id)) {
			const index = blacklist.indexOf(user.id);
			blacklist.splice(index, 1);
			if (blacklist.length === 0) this.client.settings.delete('global', 'blacklist');
			else this.client.settings.set('global', 'blacklist', blacklist);

			return message.util.send(`${user.tag}, have you realized ${this.client.user.username}'s greatness? You've got good eyes~`);
		}

		blacklist.push(user.id);
		this.client.settings.set('global', 'blacklist', blacklist);

		return message.util.send(`${user.tag}, you are not worthy of ${this.client.user.username}'s luck~`);
	}
}

module.exports = GlobalBlacklistCommand;
