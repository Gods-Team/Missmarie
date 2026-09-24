import { Message } from 'discord.js';
import {
	getCookies,
	getAllCookies,
} from '../src/slashCommands/general/userinfo';
import { sendCookie, deleteCookie } from '../src/slashCommands/fun/givecookie';

const mongoose = require('mongoose');
beforeAll(async () => {
	await require('../src/index');
	const mongooseConnectionString = process.env.MONGOOSE;
	await mongoose
		.connect(mongooseConnectionString, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => {
			console.log('Connected to db');
		})
		.catch((err) => {
			console.log('Error occured:', err);
		});
});

afterAll(async () => {
	await mongoose.connection.close();
});

beforeEach(async () => {
	jest.clearAllMocks();
});

describe('Message handler', () => {
	const message = {
		channel: {
			send: jest.fn(),
		},
		content: '/givecookie',
		author: {
			bot: false,
		},
	} as unknown as Message;

	test('should send cookie', (done) => {
		message.channel.send('/givecookie');
		expect(message.channel.send).toHaveBeenCalledTimes(1);
		expect(message.channel.send).toHaveBeenCalledWith('/givecookie');
		done();
	});
});

describe('Add cookie and compare cookies before and after', () => {
	let interaction = {
		guildId: '1029430464710185104',
		guild: {
			id: '1029430464710185104',
		},
		user: {
			id: '526425475422224421',
			username: 'Richmond',
		},
		options: {
			user: {
				id: '531151955725385744',
				username: 'Duch',
			},
			string: 'toDelete',
		},
	};
	let senderCookies;
	let receiverCookies;
	it('should got cookies', async () => {
		senderCookies = await fetchCookies(interaction.user, interaction);

		expect(senderCookies?.globalGotCookies).toBeGreaterThanOrEqual(0);
		expect(senderCookies?.localGotCookies).toBeGreaterThanOrEqual(0);
		expect(senderCookies?.globalSentCookies).toBeGreaterThanOrEqual(0);
		expect(senderCookies?.localSentCookies).toBeGreaterThanOrEqual(0);

		receiverCookies = await fetchCookies(interaction.options.user, interaction);

		expect(receiverCookies?.globalGotCookies).toBeGreaterThanOrEqual(0);
		expect(receiverCookies?.localGotCookies).toBeGreaterThanOrEqual(0);
		expect(receiverCookies?.globalSentCookies).toBeGreaterThanOrEqual(0);
		expect(receiverCookies?.localSentCookies).toBeGreaterThanOrEqual(0);
	});

	it('should add cookie and sender should have 1 more sent cookie', async () => {
		await sendCookie(
			interaction.options.user,
			interaction,
			interaction.options.string
		);

		let newSenderCookies;
		newSenderCookies = await fetchCookies(interaction.user, interaction);

		expect(newSenderCookies.localSentCookies).toEqual(
			senderCookies.localSentCookies + 1
		);
		expect(newSenderCookies.globalSentCookies).toEqual(
			senderCookies.globalSentCookies + 1
		);
	});

	it('receiver should have 1 more cookie', async () => {
		let newReceiverCookies;
		newReceiverCookies = await fetchCookies(
			interaction.options.user,
			interaction
		);

		expect(newReceiverCookies.localGotCookies).toEqual(
			receiverCookies.localGotCookies + 1
		);
		expect(newReceiverCookies.globalGotCookies).toEqual(
			receiverCookies.globalGotCookies + 1
		);
	});

	it('should delete sent cookie', async () => {
		let allCookies;
		allCookies = await getAllCookies();

		let cookieToDelete = allCookies.filter((cookie) => {
			return (
				cookie.receiverId === interaction.options.user.id &&
				cookie.giverId === interaction.user.id &&
				cookie.reason === interaction.options.string &&
				cookie.guildId === interaction.guild.id
			);
		})[0];

		await deleteCookie(cookieToDelete.id);

		let afterDelete;
		afterDelete = await fetchCookies(interaction.user, interaction);

		expect(afterDelete.localSentCookies).toEqual(
			senderCookies.localSentCookies
		);
		expect(afterDelete.globalSentCookies).toEqual(
			senderCookies.globalSentCookies
		);
	});
	it('receiver should have 1 less cookie', async () => {
		let afterDeleteReceiverCookies;
		afterDeleteReceiverCookies = await fetchCookies(
			interaction.options.user,
			interaction
		);

		expect(afterDeleteReceiverCookies.localGotCookies).toEqual(
			receiverCookies.localGotCookies
		);
		expect(afterDeleteReceiverCookies.globalGotCookies).toEqual(
			receiverCookies.globalGotCookies
		);
	});
});

async function fetchCookies(user, interaction) {
	return new Promise((resolve) => {
		resolve(getCookies(user, interaction));
	});
}
