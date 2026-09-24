const cookie = require('../../schemas/cookie-schema');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	getCookies,
	getAllCookies,
	...new SlashCommandBuilder()
		.setName('userinfo')
		.setDescription('Output info about a user.')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('user for information to be outputted.')
				.setRequired(true)
		),

	/**
	 *
	 * @param {Client} client
	 * @param {CommandInteraction} interaction
	 * @param {String[]} args
	 */

	run: async (client, interaction) => {
		const user = interaction.options.getUser('user');

		//const member = await interaction.guild.members.fetch(user);
		const member = interaction.guild.members.cache.get(user.id);
		const joinedTime = member.joinedAt;

		getCookies(user, interaction).then((cookies) => {
			const embed = new MessageEmbed()
				.setTitle(`${user.tag}`)
				.setColor('ORANGE')
				.setFooter({ text: `Called By: ${interaction.user.tag}` })
				.setURL(`${user.displayAvatarURL({ dynamic: true })}`)
				.setThumbnail(user.displayAvatarURL({ dynamic: true }))
				.setTimestamp()
				.setDescription(
					`- Known as: ${user}
				- Is user bot: ${user.bot ? 'Yes' : 'No'}`
				)

				.addFields(
					{
						name: 'Roles',
						value: `${member.roles.cache
							.map((r) => r)
							.join(' ')
							.replace('@everyone', ' ')}`,
					},
					{
						name: 'Joined',
						value: joinedTime ? time(joinedTime, 'R') : 'Unknown',
						inline: true,
					},
					{
						name: 'Created',
						value: user.createdAt ? time(user.createdAt, 'R') : 'Unknown ',
						inline: true,
					}
				)
				.setImage(user.displayAvatarURL({ dynamic: true }))
				.addField('\u200b', '\u200b')
				.addFields(
					{
						name: 'Sent cookies',
						value: `This server: ${cookies.localSentCookies}\nGlobally: ${cookies.globalSentCookies}`,
						inline: true,
					},
					{
						name: 'Received cookies',
						value: `This server: ${cookies.localGotCookies}\nGlobally: ${cookies.globalGotCookies}`,
						inline: true,
					}
				);
			interaction.reply({ embeds: [embed] });
		});
	},
};

async function getCookies(user, interaction) {
	return cookie
		.find()
		.exec()
		.then((results) => {
			if (results === null) {
				return null;
			}
			const globalGotCookies = results.filter((cookie) => {
				return cookie.receiverId === user.id;
			});
			const globalSentCookies = results.filter((cookie) => {
				return cookie.giverId === user.id;
			});
			const localGotCookies = globalGotCookies.filter((cookie) => {
				return cookie.guildId === interaction.guild.id;
			});
			const localSentCookies = globalSentCookies.filter((cookie) => {
				return cookie.guildId === interaction.guild.id;
			});
			return {
				globalGotCookies: globalGotCookies.length,
				globalSentCookies: globalSentCookies.length,
				localGotCookies: localGotCookies.length,
				localSentCookies: localSentCookies.length,
			};
		});
}

async function getAllCookies() {
	return cookie.find();
}
