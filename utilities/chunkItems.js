module.exports = function chunkItems(items, chunkSize) {
	const chunks = [];
	for (let chunk = 0; chunk < items.length; chunk += chunkSize) {
		chunks.push(items.slice(chunk, chunk + chunkSize));
	}
	return chunks;
};
