module.exports = function orderSongs(songs, addedProp, prioritizeFirst) {
	return songs
		.map((song, index) => [song, index])
		.sort(([first, firstIndex], [second, secondIndex]) => {
			const dateDiff = prioritizeFirst
				? new Date(first[addedProp]) - new Date(second[addedProp])
				: new Date(second[addedProp]) - new Date(first[addedProp]);
			const indexDiff = prioritizeFirst
				? firstIndex - secondIndex
				: secondIndex - firstIndex;
			return dateDiff !== 0 ? dateDiff : indexDiff;
		})
		.map(([song]) => song);
};
