const axios = require("axios");
const path = require("path");
const fs = require("fs");
const authHelper = require("./authHelper.js");
const playlistHelper = require("./playlistHelper.js");

const spotifyApi = "https://api.spotify.com/v1";
const elementLimit = 50;
exports.refresh = async function (screen) {
	const accessToken = await authHelper.getAccessToken();
	const playlists = await getPlaylists(accessToken);

	let songs = [];
	let playlistSongs = [];
	for (const playlist of playlists) {
		const currSongs = await getPlaylistTracks(accessToken, playlist["id"]);
		songs = [...songs, ...currSongs];
		playlist.songCount = songs.length;

		const currPlaylistSongs = currSongs.map(song => {
			return {
				playlistId: playlist.id,
				songId: song.id
			};
		});
		playlistSongs = [...playlistSongs, ...currPlaylistSongs];
	}
	const playlistPath = path.join(__dirname, "../database", "playlists.json");
	fs.writeFile(playlistPath, JSON.stringify(playlists), err => {});

	const songsPath = path.join(__dirname, "../database", "songs.json");
	fs.writeFile(songsPath, JSON.stringify(getUniqueSongs(songs)), err => {});

	const playlistSongsPath = path.join(__dirname, "../database", "playlistSongs.json");
	fs.writeFile(playlistSongsPath, JSON.stringify(playlistSongs), err => {});

	screen.setPlaylists(playlists);
};

async function getPlaylists(accessToken) {
	let offset = 0;
	let resp = await requestPlaylistBatch(accessToken, offset);
	let next = resp["data"]["next"];
	const playlists = resp["data"]["items"];
	while (next !== null) {
		offset += elementLimit;
		resp = await requestPlaylistBatch(accessToken, offset);
		playlists.push.apply(playlists, resp["data"]["items"]);
		next = resp["data"]["next"];
	}

	return playlists.map(playlist => ({
		id: playlist.id,
		name: playlist.name
	}));
}

function requestPlaylistBatch(accessToken, offset) {
	return axios.get(`${spotifyApi}/me/playlists`, {
		params: {
			limit: elementLimit,
			offset
		},
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});
}

async function getPlaylistTracks(accessToken, playlistId) {
	let trackResp = {
		data: { next: `${spotifyApi}/playlists/${playlistId}/tracks` }
	};
	let items = [];
	while (trackResp?.data?.next) {
		trackResp = await axios.get(trackResp.data.next, {
			params: {
				limit: 50,
				offset: 0
			},
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		items = items.concat(trackResp.data.items);
	}

	return items.map(item => ({
		id: item.track.id,
		name: item.track.name,
		artists: item.track.artists.map(artist => ({
			id: artist.id,
			name: artist.name
		})),
		album: {
			id: item.track.album.id,
			name: item.track.album.name,
			release_date: item.track.album.release_date
		},
		added_at: item.added_at
	}));
}

function getUniqueSongs(songs) {
	return [...new Map(songs.map(song => [song.id, song])).values()];
}
