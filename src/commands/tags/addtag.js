const { Command } = require('discord-akairo');
const Tags = require('../../models/Tags');

class TagAddCommand extends Command {
	constructor() {
		super('tag-add', {
			aliases: ['tag-add'],
			category: 'tags',
			channel: 'guild',
			ratelimit: 2,
			args: [
				{
					id: 'name',
					type: 'existingTag',
					prompt: {
						start: 'what should the tag be named?',
						retry: (msg, { phrase }) => `a tag with the name **${phrase}** already exists.`
					}
				},
				{
					id: 'content',
					match: 'rest',
					type: 'tagContent',
					prompt: {
						start: 'what should the content of the tag be?'
					}
				},
				{
					id: 'hoist',
					match: 'flag',
					flag: ['--hoist', '--pin']
				}
			],
			description: {
				content: 'Adds a tag, usable for everyone on the server (Markdown can be used).',
				usage: '[--hoist] <tag> <content>',
				examples: ['Test Test', '--hoist "Test 2" Test2', '"Test 3" "Some more text" --hoist']
			}
		});
	}

	async exec(message, { name, content, hoist }) {
		if (name && name.length >= 256) {
			return message.util.channel.send('<:disagree:745003854017593354> Messages have a limit of 256 characters!');
		}
		if (content && content.length >= 1950) {
			return message.util.channel.send('<:disagree:745003854017593354> Messages have a limit of 2000 characters!');
		}
		const staffRole = message.member.roles.has(this.client.settings.get(message.guild, 'modRole', undefined));

		await Tags.create({
			name,
			content,
			hoisted: hoist && staffRole ? true : false,
			authorID: message.author.id,
			guildID: message.guild.id,
			last_modified: message.author.id,
			aliases: [name]
		});

		return message.util.channel.send(`<:agree:745003896522670100> A tag with the name **${name.substring(0, 256)}** has been added.`);
	}
}

module.exports = TagAddCommand;
