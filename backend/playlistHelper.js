const path = require("path");
const fs = require("fs");
const algorithmHelper = require("./algorithmHelper.js");
const songHelper = require("./songHelper.js");
const { randomUUID } = require("crypto");

const filePath = path.join(__dirname, "../database", "playlists.json");

exports.readPlaylists = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

exports.writePlaylists = function (playlists) {
	fs.writeFile(filePath, JSON.stringify(playlists), err => {});
};

exports.displayPlaylists = function (playlists) {
	const formattedPlaylists = playlists.map(playlist => [
		playlist.name,
		playlist.songCount.toString()
	]);
	formattedPlaylists.sort((first, second) => first[0].localeCompare(second[0]));

	return formattedPlaylists;
};

exports.sortPlaylists = function (playlists) {
	return playlists.sort((first, second) => first.name.localeCompare(second.name));
};

exports.getPlaylistName = function (playlistId) {
	const playlists = this.readPlaylists();
	const matchingPlaylists = playlists.filter(playlist => playlist.id === playlistId);
	if (matchingPlaylists.length > 0) {
		return matchingPlaylists[0].name;
	} else {
		return "";
	}
};

exports.createAlgorithmPlaylist = function (playlistName, algorithm) {
	const playlistId = randomUUID();
	const sourcePlaylistSongs = songHelper.readSongs(algorithm.playlistId);
	const songs = algorithmHelper.filterSongs(sourcePlaylistSongs, algorithm.condition);
	const playlistSongs = songs.map(song => ({
		playlistId: playlistId,
		songId: song.id,
		addedAt: song.addedAt,
		addedRank: song.addedRank
	}));
	songHelper.addPlaylistSongs(playlistSongs);

	const existingPlaylists = JSON.parse(fs.readFileSync(filePath, "utf8"));
	const playlist = {
		id: playlistId,
		name: playlistName,
		algorithmId: algorithm.id,
		songCount: songs.length
	};
	algorithmHelper.createAndSaveDefaultAlgorithm(playlist);

	const playlists = [...existingPlaylists, playlist];
	this.writePlaylists(playlists);
	return playlists;
};

exports.algorithmPlaylistPresent = function (algorithmId) {
	return JSON.parse(fs.readFileSync(filePath, "utf8")).some(
		playlist => playlist.algorithmId === algorithmId
	);
};
