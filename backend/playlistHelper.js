const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "../database", "playlists.json");

exports.readPlaylists = function () {
	return JSON.parse(fs.readFileSync(filePath, "utf8"));
};

exports.writePlaylists = function (playlists) {
	fs.writeFile(filePath, JSON.stringify(playlists), err => {});
};

exports.displayPlaylists = function (playlists) {
	const formattedPlaylists = playlists.map(playlist => [playlist.name, playlist.songCount.toString()]);
	formattedPlaylists.sort((first, second) => first[0].localeCompare(second[0]));

	return formattedPlaylists;
};

exports.sortPlaylists = function (playlists) {
	return playlists.sort((first, second) => first.name.localeCompare(second.name));
};
