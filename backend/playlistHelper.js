const path = require("path");
const fs = require("fs");

exports.readPlaylists = function () {
	const playlistsPath = path.join(__dirname, "../database", "playlists.json");
	const playlists = JSON.parse(fs.readFileSync(playlistsPath, "utf8"));
	return playlists;
};

exports.displayPlaylists = function (playlists) {
	const formattedPlaylists = playlists.map(playlist => {
		return [playlist.name, playlist.songCount.toString()];
	});
	formattedPlaylists.sort((first, second) => first[0].localeCompare(second[0]));

	return formattedPlaylists;
};
