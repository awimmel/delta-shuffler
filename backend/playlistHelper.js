const axios = require("axios");
const path = require("path");
const fs = require("fs");
const algorithmHelper = require("./algorithmHelper.js");
const authHelper = require("./authHelper.js");
const songHelper = require("./songHelper.js");

const spotifyApi = "https://api.spotify.com/v1";
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

exports.createAlgorithmPlaylist = async function (playlistName, algorithm) {
	const accessToken = await authHelper.getAccessToken();
	const userId = await authHelper.getUserId();
	const playlistResp = await axios.post(
		`${spotifyApi}/users/${userId}/playlists`,
		{
			name: playlistName,
			public: false
		},
		{
			headers: { Authorization: `Bearer ${accessToken}` }
		}
	);

	const playlistId = playlistResp.data.id;
	const sourcePlaylistSongs = songHelper.readSongs(algorithm.playlistId);
	const songs = algorithmHelper.filterSongs(sourcePlaylistSongs, algorithm.condition);

	const spotSongs = songs.map(song => `spotify:track:${song.id}`);
	let pos = 0;
	for (const chunk of chunkSongs(spotSongs)) {
		await axios.post(
			`${spotifyApi}/playlists/${playlistId}/tracks`,
			{
				uris: chunk,
				position: pos
			},
			{
				headers: { Authorization: `Bearer ${accessToken}` }
			}
		);
		pos += 100;
	}

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

exports.getAlgorithmPlaylists = function () {
	const playlists = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return playlists.filter(playlist => playlist.algorithmId);
};

exports.setPlaylistItems = async function (playlistId, songs) {
	const accessToken = await authHelper.getAccessToken();
	for (const chunk of chunkSongs(songs)) {
		await axios.put(
			`${spotifyApi}/playlists/${playlistId}/tracks`,
			{
				uris: chunk
			},
			{
				headers: { Authorization: `Bearer ${accessToken}` }
			}
		);
	}
};

function chunkSongs(songs) {
	const chunks = [];
	for (let chunk = 0; chunk < songs.length; chunk += 100) {
		chunks.push(songs.slice(chunk, chunk + 100));
	}
	return chunks;
}
