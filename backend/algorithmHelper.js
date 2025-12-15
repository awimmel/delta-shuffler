const path = require("path");
const fs = require("fs");
// const { randomUUID } = require("crypto");

const fileName = "algorithms.json";

exports.readAlgorithms = function () {
	const algorithmsPath = path.join(__dirname, "../database", fileName);
	return JSON.parse(fs.readFileSync(algorithmsPath, "utf8"));
};

exports.writeAlgorithms = function (algorithms) {
	const algorithmsPath = path.join(__dirname, "../database", fileName);
	fs.writeFile(algorithmsPath, JSON.stringify(algorithms), err => {});
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

// exports.runAlgorithm = function(algorithm, songs) {
// 	const filterFunction = new Function('song', `return ${algorithm.condition}`);
// 	const matchingSongs = songs.filter(filterFunction);
// }
