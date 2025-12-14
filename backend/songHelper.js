const path = require("path");
const fs = require("fs");

exports.readSongs = function (playlistId) {
	const playlistSongsPath = path.join(__dirname, "../database", "playlistSongs.json");
	const playlistSongs = JSON.parse(fs.readFileSync(playlistSongsPath, "utf8"));
	const songIds = playlistSongs
		.filter(playlistSong => playlistSong.playlistId === playlistId)
		.map(playlistSong => playlistSong.songId);

	const songsPath = path.join(__dirname, "../database", "songs.json");
	return JSON.parse(fs.readFileSync(songsPath, "utf8")).filter(song => songIds.includes(song.id));
};

exports.displaySongs = function (songs) {
	return songs.map(song => {
		const artistString = this.getArtistString(song);
		return [song.name, artistString, song.album.name];
	});
};

exports.getArtistString = function (song) {
	return song.artists.map(artist => artist.name).join(", ");
};
