const { Command } = require('discord-akairo');

class SetDJRoleCommand extends Command {
	constructor() {
		super('set-dj', {
			aliases: ['set-dj'],
			description: {
				content: 'Sets the DJ role many of the commands use for permission checking.',
				usage: '<role>',
				examples: ['dj @DJ', 'dj DJ']
			},
			category: 'music',
			channel: 'guild',
			userPermissions: ['MANAGE_GUILD'],
			ratelimit: 2,
			args: [
				{
					id: 'role',
					type: 'role',
					content: 'match',
					prompt: {
						start: 'what role you want to set?',
						retry: 'please provide a valid role.'
					}
				}
			]
		});
	}

	async exec(message, { role }) {
		await this.client.settings.set(message.guild, 'djRole', role.id);
		return message.util.channel.send(`<:agree:745003896522670100> Set \`DJ Role\` to **${role.name}**`);
	}
}

module.exports = SetDJRoleCommand;
