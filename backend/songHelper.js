const path = require("path");
const fs = require("fs");
const displayString = require("../utilities/displayString.js");

const songsPath = path.join(__dirname, "../database", "songs.json");
const playlistSongsPath = path.join(__dirname, "../database", "playlistSongs.json");

exports.readSongs = function (playlistId) {
	const playlistSongs = JSON.parse(fs.readFileSync(playlistSongsPath, "utf8"));
	const songIds = playlistSongs
		.filter(playlistSong => playlistSong.playlistId === playlistId)
		.map(playlistSong => playlistSong.songId);

	return JSON.parse(fs.readFileSync(songsPath, "utf8")).filter(song => songIds.includes(song.id));
};

exports.writeSongs = function (songs, playlistSongs) {
	fs.writeFile(songsPath, JSON.stringify(getUniqueSongs(songs)), err => {});
	fs.writeFile(playlistSongsPath, JSON.stringify(playlistSongs), err => {});
};

exports.displaySongs = function (songs, width) {
	return songs
		.sort((first, second) => new Date(second.added_at) - new Date(first.added_at))
		.map(song => {
			const artistString = this.getArtistString(song);
			return [displayString(song.name, Math.floor(0.4 * width)), displayString(artistString, Math.floor(0.2 * width)), displayString(song.album.name, Math.floor(0.4 * width))];
		});
};

exports.getArtistString = function (song) {
	return song.artists.map(artist => artist.name).join(", ");
};

function getUniqueSongs(songs) {
	return [...new Map(songs.map(song => [song.id, song])).values()];
}
