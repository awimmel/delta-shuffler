const path = require("path");
const fs = require("fs");
// const { randomUUID } = require("crypto");
const queueHelper = require("./queueHelper.js");

const filePath = path.join(__dirname, "../database", "algorithms.json");

exports.readAllAlgorithms = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

exports.readAlgorithms = function (playlistId) {
	const algorithms = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return this.filterAlgorithms(playlistId, algorithms);
};

exports.writeAlgorithms = function (algorithms) {
	fs.writeFile(filePath, JSON.stringify(algorithms), err => {});
};

exports.displayAlgorithms = function (algorithms) {
	return algorithms.map(algorithm => [
		algorithm.name,
		algorithm.condition,
		algorithm.matchingSongs.toString()
	]);
};

exports.filterAlgorithms = function (playlistId, algorithms) {
	return algorithms.filter(algorithm => algorithm.playlistId === playlistId);
};

exports.createDefaultAlgorithm = function (playlist) {
	return {
		// id: randomUUID(),
		id: `trueRandom-${playlist.id}`,
		name: "Completely Random",
		playlistId: playlist.id,
		condition: "true === true",
		randomize: true,
		matchingSongs: playlist.songCount
	};
};

exports.runAlgorithm = async function (algorithm, songs, queueCount) {
	// Add support for non-random algorithms in future commit

	const filterFunction = new Function("song", `return ${algorithm.condition}`);
	const matchingSongsSource = songs.filter(filterFunction).map(song => song.id);
	let matchingSongs = [...matchingSongsSource];

	let counter = 0;
	let songsToQueue = [];
	while (counter < queueCount) {
		songsToQueue = [...songsToQueue, grabSong(matchingSongs)];

		if (matchingSongs.length === 0) {
			matchingSongs = matchingSongsSource;
		}

		counter++;
	}

	await queueHelper.queueSongs(songsToQueue);
};

function grabSong(songs) {
	const index = Math.floor(Math.random() * songs.length);
	return songs.splice(index, 1)[0];
}
