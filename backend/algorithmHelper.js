const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");
const playerHelper = require("./playerHelper.js");
const songHelper = require("./songHelper.js");
const joinOperator = require("../utilities/joinOperator.js");
const displayString = require("../utilities/displayString.js");

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

exports.displayAlgorithms = function (algorithms, width) {
	return algorithms.map(algorithm => [
		displayString(algorithm.name, Math.floor(width * 0.3)),
		displayString(algorithm.condition, Math.floor(width * 0.7)),
		algorithm.matchingSongs.toString()
	]);
};

exports.filterAlgorithms = function (playlistId, algorithms) {
	return algorithms.filter(algorithm => algorithm.playlistId === playlistId);
};

exports.createDefaultAlgorithm = function (playlist) {
	return {
		id: `trueRandom-${playlist.id}`,
		name: "Completely Random",
		playlistId: playlist.id,
		condition: "true === true",
		matchingSongs: playlist.songCount
	};
};

exports.createAndSaveDefaultAlgorithm = function (playlist) {
	const defaultAlg = {
		id: `trueRandom-${playlist.id}`,
		name: "Completely Random",
		playlistId: playlist.id,
		condition: "true === true",
		matchingSongs: playlist.songCount
	};
	this.writeAlgorithms([...this.readAllAlgorithms(), defaultAlg]);
};

exports.writeAlgorithm = function (name, playlistId, conditionGroups) {
	const join = conditionGroups.length > 1 ? conditionGroups[1].joinDropdown.getSelectedItem() : "";
	const conditionString = conditionGroups
		.map(conditionGroup => `(${conditionGroup.toString()})`)
		.join(joinOperator(join));

	const songs = songHelper.readSongs(playlistId);
	const songCount = this.filterSongs(songs, conditionString).length;

	const newAlg = {
		id: randomUUID(),
		name: name,
		playlistId: playlistId,
		condition: conditionString,
		matchingSongs: songCount
	};

	const existingAlgs = this.readAllAlgorithms();
	this.writeAlgorithms([...existingAlgs, newAlg]);

	return newAlg;
};

exports.runAlgorithm = async function (algorithm, songs, queueCount) {
	const matchingSongsSource = this.filterSongs(songs, algorithm.condition).map(song => song.id);
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

	await playerHelper.queueSongs(songsToQueue);
};

exports.filterSongs = function (songs, condition) {
	const filterFunction = new Function("song", `return ${condition}`);
	return songs.filter(filterFunction);
};

function grabSong(songs) {
	const index = Math.floor(Math.random() * songs.length);
	return songs.splice(index, 1)[0];
}
