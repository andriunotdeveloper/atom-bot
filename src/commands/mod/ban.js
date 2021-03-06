const { Command } = require('discord-akairo');
const Base = require('../../util/Base');
const Case = require('../../models/Case');
const moment = require('moment');

class BanCommand extends Command {
	constructor() {
		super('ban', {
			aliases: ['ban'],
			category: 'mod',
			channel: 'guild',
			clientPermissions: ['MANAGE_ROLES', 'EMBED_LINKS'],
			ratelimit: 2,
			args: [
				{
					id: 'member',
					type: 'member',
					prompt: {
						start: 'what member do you want to ban?',
						retry: 'please mention a valid member.'
					}
				},
				{
					id: 'days',
					type: 'integer',
					match: 'option',
					flag: ['--days', '-d'],
					default: 7
				},
				{
					id: 'reason',
					match: 'rest',
					type: 'string',
					default: ''
				}
			],
			description: {
				content: 'Bans a member, duh.',
				usage: '<member> <...reason>',
				examples: ['@Suvajit', '444432489818357760']
			}
		});
	}

	userPermissions(message) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		const hasStaffRole = message.member.roles.has(staffRole);
		if (!hasStaffRole) return 'Moderator';
		return null;
	}

	async exec(message, { member, days, reason }) {
		const staffRole = this.client.settings.get(message.guild, 'modRole', undefined);
		if (member.id === message.author.id) {
			try {
				const done = await member.kick(`**${message.author.tag}** used a mod command on themselves.`);
				if (done) {
					await message.reply('you asked for it, ok?');
					await member.send('you asked for it, ok?');
				}
			} catch {} // eslint:disable-line
			return;
		}
		if (member.roles.has(staffRole)) {
			return message.send('<:disagree:745003854017593354> You know you can\'t do this.');
		}
		const key = `${message.guild.id}:${member.id}:BAN`;
		if (this.client.cached.has(key)) {
			return message.reply('<:disagree:745003854017593354> That user is currently being moderated by someone else.');
		}
		this.client.cached.add(key);

		const cases = await Case.findAll({ where: { targetID: member.id, guildID: message.guild.id } });
		const embed = Base.historyEmbed({ member, cases });
		await message.channel.send('You sure you want me to ban this [no gender specified]?', { embed });
		const responses = await message.channel.awaitMessages(msg => msg.author.id === message.author.id, {
			max: 1,
			time: 10000
		});

		if (!responses || responses.size !== 1) {
			this.client.cached.delete(key);
			return message.reply(':timer: Timed out. Cancelled ban.');
		}
		const response = responses.first();

		let sentMessage;
		if (/^y(?:e(?:a|s)?)?$/i.test(response.content)) {
			sentMessage = await message.channel.send(`Banning **${member.user.tag}**...`);
		} else {
			this.client.cached.delete(key);
			return message.reply('Cancelled ban.');
		}

		const totalCases = this.client.settings.get(message.guild, 'caseTotal', 0) + 1;

		try {
			try {
				await member.send([
					`**You have been banned from ${message.guild.name}**`,
					`${reason ? `\n**Reason:** ${reason}\n` : ''}`,
				]);
			} catch {} // eslint:disable-line
			await member.ban({ days, reason: `Banned by ${message.author.tag} | Case #${totalCases}` });
		} catch (error) {
			this.client.cached.delete(key);
			return message.reply(`<:disagree:745003854017593354> There was an error banning this member: \`${error}\``);
		}

		this.client.settings.set(message.guild, 'caseTotal', totalCases);

		if (!reason) {
			const prefix = this.handler.prefix(message);
			reason = `Use \`${prefix}reason ${totalCases} <...reason>\` to set a reason for this case`;
		}

		const modLogChannel = this.client.settings.get(message.guild, 'modLogChannel', undefined);
		let modMessage;
		if (modLogChannel) {
			const embed = Base.logEmbed({ message, member, action: 'Ban', caseNum: totalCases, reason }).setColor(Base.CONSTANTS.COLORS.BAN);
			modMessage = await this.client.channels.get(modLogChannel).send(embed);
		}

		await Case.create({
			caseID: totalCases,
			targetID: member.id,
			targetTag: member.user.tag,
			authorTag: message.author.tag,
			authorID: message.author.id,
			guildID: message.guild.id,
			messageID: modMessage ? modMessage.id : undefined,
			action: Base.CONSTANTS.ACTIONS.BAN,
			reason,
			createdAt: moment.utc().toDate()
		});

		return sentMessage.edit(`<:agree:745003896522670100> Successfully banned **${member.user.tag}**`);
	}
}

module.exports = BanCommand;
