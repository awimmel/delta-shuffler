const axios = require("axios");
const authHelper = require("./authHelper.js");
const algorithmHelper = require("./algorithmHelper.js");
const playlistHelper = require("./playlistHelper.js");
const songHelper = require("./songHelper.js");

const spotifyApi = "https://api.spotify.com/v1";
const elementLimit = 50;

exports.refresh = async function (screen) {
	authHelper.setRefreshing(true);

	const accessToken = await authHelper.getAccessToken();
	const hiddenPlaylists = playlistHelper.getHiddenPlaylists();
	const allPlaylists = [
		...(await getPlaylists(accessToken, hiddenPlaylists)),
		{
			id: "likedSongs",
			name: "Liked Songs",
			visible: !hiddenPlaylists.includes("likedSongs")
		}
	];
	const playlistIds = allPlaylists.map(playlist => playlist.id);

	const algPlaylists = playlistHelper
		.getAlgorithmPlaylists()
		.filter(algPlaylist => playlistIds.includes(algPlaylist.id));
	const algPlaylistIds = algPlaylists.map(algPlaylist => algPlaylist.id);
	const playlistsToQuery = allPlaylists.filter(playlist => !algPlaylistIds.includes(playlist.id));

	let algorithms = algorithmHelper.readAllAlgorithms();

	let songs = [];
	let playlistSongs = [];
	let adjAlgs = [];
	let algSongMap = new Map();
	for (const playlist of playlistsToQuery) {
		const trackUrl =
			playlist.id === "likedSongs"
				? `${spotifyApi}/me/tracks?offset=0&limit=50`
				: `${spotifyApi}/playlists/${playlist["id"]}/tracks?offset=0&limit=50`;
		const currSongs = await getTracks(accessToken, trackUrl);
		playlist.songCount = currSongs.length;

		const currPlaylistSongs = currSongs.map(song => {
			return {
				playlistId: playlist.id,
				songId: song.id,
				addedAt: song.addedAt,
				addedRank: song.addedRank
			};
		});
		playlistSongs = [...playlistSongs, ...currPlaylistSongs];

		const filteredSongs = currSongs.map(song => {
			const { added_at, added_rank, ...adjSong } = song;
			return adjSong;
		});
		songs = [...songs, ...filteredSongs];

		const matchingAlgs = algorithmHelper.filterAlgorithms(playlist.id, algorithms);
		if (matchingAlgs.length === 0) {
			adjAlgs.push(algorithmHelper.createDefaultAlgorithm(playlist));
		} else {
			for (const alg of matchingAlgs) {
				const algSongs = algorithmHelper.filterSongs(currSongs, alg.condition);
				algSongMap.set(alg.id, algSongs);
				alg.matchingSongs = algSongs.length;
			}
			adjAlgs = [...adjAlgs, ...matchingAlgs];
		}
	}

	const algPlaylistsUpdate = updateAlgorithmPlaylists(algPlaylists, algSongMap);

	const playlists = [...playlistsToQuery, ...algPlaylistsUpdate.algPlaylists];
	playlistHelper.writePlaylists(playlists);
	algorithmHelper.writeAlgorithms(adjAlgs);
	songHelper.writeSongs(songs, [...playlistSongs, ...algPlaylistsUpdate.algPlaylistSongs]);

	screen.setPlaylists(playlists.filter(playlist => playlist.visible));

	authHelper.setRefreshing(false);
};

async function getPlaylists(accessToken, hiddenPlaylists) {
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

	const mappedPlayists = playlists.map(playlist => ({
		id: playlist.id,
		name: playlist.name,
		visible: !hiddenPlaylists.includes(playlist.id)
	}));
	return playlistHelper.sortPlaylists(mappedPlayists);
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

async function getTracks(accessToken, initialUrl) {
	let trackResp = {
		data: { next: initialUrl }
	};
	let items = [];
	while (trackResp?.data?.next) {
		trackResp = await axios.get(trackResp.data.next, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		items = items.concat(trackResp.data.items);
	}

	return items
		.sort((first, second) => new Date(second.added_at) - new Date(first.added_at))
		.map((item, index) => ({
			id: item.track.id,
			name: item.track.name,
			artists: item.track.artists.map(artist => ({
				id: artist.id,
				name: artist.name
			})),
			album: {
				id: item.track.album.id,
				name: item.track.album.name,
				release_date: item.track.album.release_date,
				release_year: item.track.album.release_date.split("-")[0]
			},
			addedAt: item.added_at,
			addedRank: index + 1
		}));
}

function updateAlgorithmPlaylists(algPlaylists, songsByPlaylistMap) {
	let algPlaylistSongs = [];
	for (const algPlaylist of algPlaylists) {
		const songs = songsByPlaylistMap.get(algPlaylist.algorithmId);
		algPlaylist.songCount = songs.length;

		playlistHelper.setPlaylistItems(
			algPlaylist.id,
			songs.map(song => `spotify:track:${song.id}`)
		);

		const currPlaylistSongs = songs.map(song => {
			return {
				playlistId: algPlaylist.id,
				songId: song.id,
				addedAt: song.addedAt,
				addedRank: song.addedRank
			};
		});
		algPlaylistSongs = [...algPlaylistSongs, ...currPlaylistSongs];
	}
	return {
		algPlaylists,
		algPlaylistSongs
	};
}
