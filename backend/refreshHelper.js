const axios = require("axios");
const authHelper = require("./authHelper.js");
const algorithmHelper = require("./algorithmHelper.js");
const playlistHelper = require("./playlistHelper.js");
const songHelper = require("./songHelper.js");

const spotifyApi = "https://api.spotify.com/v1";
const elementLimit = 50;

exports.refresh = async function (screen) {
	const accessToken = await authHelper.getAccessToken();
	const playlists = await getPlaylists(accessToken);
	let algorithms = algorithmHelper.readAllAlgorithms();

	let songs = [];
	let playlistSongs = [];
	let newAlg = false;
	for (const playlist of playlists) {
		const currSongs = await getPlaylistTracks(accessToken, playlist["id"]);
		songs = [...songs, ...currSongs];
		playlist.songCount = currSongs.length;

		const currPlaylistSongs = currSongs.map(song => {
			return {
				playlistId: playlist.id,
				songId: song.id
			};
		});
		playlistSongs = [...playlistSongs, ...currPlaylistSongs];

		const matchingAlgs = algorithmHelper.filterAlgorithms(playlist.id, algorithms);
		if (matchingAlgs.length === 0) {
			algorithms = [...algorithms, algorithmHelper.createDefaultAlgorithm(playlist)];
			newAlg = true;
		}
	}
	playlistHelper.writePlaylists(playlists);

	if (newAlg) {
		algorithmHelper.writeAlgorithms(algorithms);
	}

	songHelper.writeSongs(songs, playlistSongs);

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
