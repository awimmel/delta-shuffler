const axios = require("axios");
const authHelper = require("./authHelper.js");
const algorithmHelper = require("./algorithmHelper.js");
const playlistHelper = require("./playlistHelper.js");
const songHelper = require("./songHelper.js");
const orderSongs = require("../utilities/orderSongs.js");
const chunkItems = require("../utilities/chunkItems.js");

const spotifyApi = "https://api.spotify.com/v1";
const elementLimit = 50;

exports.getPlaylists = async function () {
	let offset = 0;
	let resp = await requestPlaylistBatch(offset);
	let next = resp["data"]["next"];
	const playlists = resp["data"]["items"];
	while (next !== null) {
		offset += elementLimit;
		resp = await requestPlaylistBatch(offset);
		playlists.push.apply(playlists, resp["data"]["items"]);
		next = resp["data"]["next"];
	}

	const hiddenPlaylists = playlistHelper.getHiddenPlaylists();
	const mappedPlayists = playlists
		.filter(playlist => playlist.collaborative || playlist.owner.id === authHelper.getUserId())
		.map(playlist => ({
			id: playlist.id,
			name: playlist.name,
			visible: !hiddenPlaylists.includes(playlist.id)
		}));
	return playlistHelper.sortPlaylists([
		...mappedPlayists,
		{
			id: "likedSongs",
			name: "Liked Songs",
			visible: !hiddenPlaylists.includes("likedSongs")
		}
	]);
};

exports.refresh = async function (screen, playlistsToRetrieve) {
	authHelper.setRefreshing(true);

	const playlistIds = playlistsToRetrieve.map(playlist => playlist.id);

	const algPlaylists = playlistHelper
		.getAlgorithmPlaylists()
		.filter(algPlaylist => playlistIds.includes(algPlaylist.id));
	const algPlaylistIds = algPlaylists.map(algPlaylist => algPlaylist.id);
	const playlistsToQuery = playlistsToRetrieve.filter(
		playlist => !algPlaylistIds.includes(playlist.id)
	);

	let algorithms = algorithmHelper.readAllAlgorithms();

	let songs = [];
	let songIds = [];
	let playlistSongs = [];
	let adjAlgs = [];
	let playlistSongMap = new Map();
	for (const playlist of playlistsToQuery) {
		const isPlaylist = playlist.id !== "likedSongs";
		const trackUrl = isPlaylist
			? `${spotifyApi}/playlists/${playlist["id"]}/items?offset=0&limit=50`
			: `${spotifyApi}/me/tracks?offset=0&limit=50`;
		const currSongs = await getTracks(trackUrl, isPlaylist);
		playlist.songCount = currSongs.length;
		playlistSongMap.set(
			playlist.id,
			currSongs.map(song => song.id)
		);

		const currPlaylistSongs = currSongs.map(song => {
			return {
				playlistId: playlist.id,
				songId: song.id,
				addedAt: song.addedAt,
				addedRank: song.addedRank
			};
		});
		playlistSongs = [...playlistSongs, ...currPlaylistSongs];

		const filteredSongs = currSongs
			.filter(song => !songIds.includes(song.id))
			.map(song => {
				const { addedAt, addedRank, ...adjSong } = song;
				return adjSong;
			});
		songs = [...songs, ...filteredSongs];
		songIds = [...songIds, ...filteredSongs.map(song => song.id)];
	}

	// const artistGenres = await grabGenres(songs);
	// const songsWithGenres = songs.map(song => {
	// 	for (const artist of song.artists) {
	// 		artist.genres = artistGenres.get(artist.id);
	// 	}
	// 	return song;
	// });

	/*
	 * Second iteration over playlistsToQuery. While obviously not ideal, this allows algorithms with genre conditions to be updated
	 * without introducing duplicate calls to Spotify's API for artist genres
	 */
	let algSongMap = new Map();
	for (const playlist of playlistsToQuery) {
		const playlistSongIds = playlistSongMap.get(playlist.id);
		const fullSongs = songs.filter(song => playlistSongIds.includes(song.id));
		const matchingAlgs = algorithmHelper.filterAlgorithms(playlist.id, algorithms);
		adjAlgs = [...adjAlgs, ...updateAlgorithms(matchingAlgs, playlist, fullSongs, algSongMap)];
	}

	const algPlaylistsUpdate = updateAlgorithmPlaylists(algPlaylists, algSongMap, algorithms);

	const playlists = [...playlistsToQuery, ...algPlaylistsUpdate.algPlaylists];
	playlistHelper.writePlaylists(playlists);
	algorithmHelper.writeAlgorithms([...adjAlgs, ...algPlaylistsUpdate.algPlaylistAlgs]);
	songHelper.writeSongs(songs, [...playlistSongs, ...algPlaylistsUpdate.algPlaylistSongs]);

	screen.setPlaylists(playlists.filter(playlist => playlist.visible));

	authHelper.setRefreshing(false);
};

async function requestPlaylistBatch(offset) {
	return axios.get(`${spotifyApi}/me/playlists`, {
		params: {
			limit: elementLimit,
			offset
		},
		headers: {
			Authorization: `Bearer ${await authHelper.getAccessToken()}`
		}
	});
}

async function getTracks(initialUrl, isPlaylist) {
	let trackResp = {
		data: { next: initialUrl }
	};
	let items = [];
	while (trackResp?.data?.next) {
		trackResp = await axios.get(trackResp.data.next, {
			headers: {
				Authorization: `Bearer ${await authHelper.getAccessToken()}`
			}
		});
		items = items.concat(trackResp.data.items);
	}

	const trackVar = isPlaylist ? "item" : "track";
	const songs = Array.from(
		items.reduce((map, item) => map.set(item[trackVar].id, item), new Map()).values()
	).filter(item => !isPlaylist || item[trackVar].track);
	return orderSongs(songs, "added_at", false).map((item, index) => {
		return {
			id: item[trackVar].id,
			name: item[trackVar].name,
			artists: item[trackVar].artists.map(artist => ({
				id: artist.id,
				name: artist.name
			})),
			album: {
				id: item[trackVar].album.id,
				name: item[trackVar].album.name,
				release_date: item[trackVar].album.release_date,
				release_year: item[trackVar].album.release_date.split("-")[0]
			},
			addedAt: item.added_at,
			addedRank: index + 1
		};
	});
}

function updateAlgorithms(matchingAlgs, playlist, currSongs, algSongMap) {
	let adjAlgs = [];
	if (matchingAlgs.length === 0) {
		adjAlgs.push(algorithmHelper.createDefaultAlgorithm(playlist));
	} else {
		for (const alg of matchingAlgs) {
			const algSongs = orderSongs(
				algorithmHelper.filterSongs(currSongs, alg.condition),
				"addedAt",
				true
			);
			alg.matchingSongs = algSongs.length;
			algSongMap.set(alg.id, algSongs);
			adjAlgs.push(alg);
		}
	}
	return adjAlgs;
}

async function grabGenres(songs) {
	const artists = [...new Set(songs.flatMap(song => song.artists.map(artist => artist.id)))];
	const artistGenreMap = new Map();
	for (const artist of artists) {
		const artistResp = await axios.get(`${spotifyApi}/artists/${artist}`, {
			headers: {
				Authorization: `Bearer ${await authHelper.getAccessToken()}`
			}
		});

		artistGenreMap.set(artistResp.id, artistResp.genres);
		// await new Promise(resolve => setTimeout(resolve, 100));
	}
	return artistGenreMap;
}

function updateAlgorithmPlaylists(algPlaylists, algSongMap, algorithms) {
	let algPlaylistSongs = [];
	let algPlaylistAlgs = [];
	for (const algPlaylist of algPlaylists) {
		const songs = algSongMap.get(algPlaylist.algorithmId);
		algPlaylist.songCount = songs.length;

		playlistHelper.setPlaylistItems(algPlaylist.id, songs.reverse());

		const currPlaylistSongs = orderSongs(songs, "addedAt", false).map((song, index) => {
			return {
				playlistId: algPlaylist.id,
				songId: song.id,
				addedAt: song.addedAt,
				addedRank: index + 1
			};
		});
		algPlaylistSongs = [...algPlaylistSongs, ...currPlaylistSongs];
		const matchingAlgs = algorithmHelper.filterAlgorithms(algPlaylist.id, algorithms);
		algPlaylistAlgs = [
			...algPlaylistAlgs,
			...updateAlgorithms(matchingAlgs, algPlaylist, songs, algSongMap)
		];
	}
	return {
		algPlaylists,
		algPlaylistSongs,
		algPlaylistAlgs
	};
}
