const { Command } = require('discord-akairo');
const Star = require('../../models/Stars');
const Starboard = require('../../struct/Starboard');

class StarInfoCommand extends Command {
	constructor() {
		super('starInfo', {
			aliases: ['star-info'],
			category: 'starboard',
			channel: 'guild',
			clientPermissions: ['EMBED_LINKS'],
			quoted: false,
			description: {
				content: 'Views the star information about a message.',
				usage: '<message id> [channel]',
				examples: ['396429741176913921', '396430734585233411 #OtherChannel']
			}
		});
	}

	*args() {
		const channel = yield {
			index: 1,
			type: 'textChannel',
			default: message => message.channel,
			prompt: {
				start: 'That channel could not be found. What channel is the message you are trying to view the info of in?',
				retry: 'Please provide a valid text channel.',
				optional: true
			}
		};
		const message = yield {
			index: 0,
			type: (msg, phrase) => {
				if (!phrase) return null;
				return channel.messages.fetch(phrase).catch(() => null);
			},
			prompt: {
				start: 'What is the ID of the message you would like to view the info of?',
				retry: `Please provide a valid message ID in ${channel}`
			}
		};
		return { message };
	}

	async exec(message, { message: msg }) {
		const starboard = this.client.starboards.get(message.guild.id);

		if (!starboard.channel) {
			const prefix = this.handler.prefix(message);
			return message.util.channel.send(`<:disagree:745003854017593354> There isn't a starboard channel to use. Set one using the \`${prefix}starboard\` command!`);
		}

		const star = await Star.findOne({ where: { messageID: msg.id } });
		if (!star) {
			return message.util.channel.send('<:disagree:745003854017593354> That message has not been starred.');
		}

		const emoji = Starboard.getStarEmoji(star.starredBy.length);

		const starredBy = [];
		const promises = [];
		for (const id of star.starredBy) {
			promises.push(this.client.users.fetch(id).then(user => {
				starredBy.push(user);
			}).catch(() => {
				starredBy.push(`<@${id}>`);
			}));
		}

		await Promise.all(promises);

		const embed = this.client.util.embed()
			.setColor("invisible")
			.addField('Author', msg.author, true)
			.addField('Channel', msg.channel, true)
			.addField('Starrers', starredBy.join(', '))
			.setThumbnail(msg.author.displayAvatarURL())
			.setTimestamp(msg.createdAt)
			.setFooter(`${emoji} ${star.starredBy.length} | ${msg.id}`);

		return message.util.send({ embed });
	}
}

module.exports = StarInfoCommand;
