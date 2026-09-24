const mongoose = require('mongoose');

const reqString = {
	type: String,
	required: true,
};

const cookieSchema = new mongoose.Schema({
	receiverId: reqString,
	giverId: reqString,
	reason: reqString,
	guildId: reqString,
	date: { type: Date, default: Date.now },
});

if (process.env.NODE_ENV === 'test') {
	const cookies = [];

	module.exports = {
		create: async (payload) => {
			const record = {
				...payload,
				_id: new mongoose.Types.ObjectId(),
				id: undefined,
			};
			record.id = record._id.toString();
			cookies.push(record);
			return record;
		},
		find: () => {
			const results = cookies.map((cookie) => ({ ...cookie }));
			return {
				exec: async () => results,
				then: (resolve, reject) =>
					Promise.resolve(results).then(resolve, reject),
			};
		},
		deleteOne: async (query) => {
			const index = cookies.findIndex(
				(cookie) =>
					cookie._id.toString() === query._id || cookie.id === query._id
			);

			if (index === -1) {
				return { deletedCount: 0 };
			}

			cookies.splice(index, 1);
			return { deletedCount: 1 };
		},
	};
} else {
	module.exports = mongoose.model('cookie', cookieSchema);
}
