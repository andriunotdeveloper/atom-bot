const { Command } = require('discord-akairo');

class ToggleLogsCommand extends Command {
	constructor() {
		super('toggle-logs', {
			aliases: ['toggle-log', 'toggle-logs', 'disable'],
			category: 'config',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'memberlog',
					match: 'flag',
					flag: ['--memberlog', '--member']
				},
				{
					id: 'modlog',
					match: 'flag',
					flag: ['--mod', '--modlog']
				},
				{
					id: 'guildlog',
					match: 'flag',
					flag: ['--logs', '--guildlog']
				}
			],

			description: { content: 'Toggle logs features on the server.' }
		});
	}

	async exec(message, { memberlog, modlog, guildlog }) {
		if (memberlog) {
			this.client.settings.delete(message.guild, 'memberLog');
			return message.util.send('<:agree:745003896522670100> Successfully disabled \`member log channel\`.');
		}

		if (modlog) {
			this.client.settings.delete(message.guild, 'modLogChannel');
			return message.util.send('<:agree:745003896522670100> Successfully disabled \`mod log channel\`.');
		}

		if (guildlog) {
			this.client.settings.delete(message.guild, 'guildLog');
			return message.util.send('<:agree:745003896522670100> Successfully disabled \`guild log channel\`.');
		}
	}
}

module.exports = ToggleLogsCommand;
