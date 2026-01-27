const axios = require("axios");
const authHelper = require("./authHelper.js");
const algorithmHelper = require("./algorithmHelper.js");
const playlistHelper = require("./playlistHelper.js");
const songHelper = require("./songHelper.js");
const orderSongs = require("../utilities/orderSongs.js");
const chunkItems = require("../utilities/chunkItems.js");

const spotifyApi = "https://api.spotify.com/v1";
const elementLimit = 50;

exports.refresh = async function (screen) {
	authHelper.setRefreshing(true);

	const hiddenPlaylists = playlistHelper.getHiddenPlaylists();
	const allPlaylists = [
		...(await getPlaylists(hiddenPlaylists)),
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
	let songIds = [];
	let playlistSongs = [];
	let adjAlgs = [];
	let playlistSongMap = new Map();
	for (const playlist of playlistsToQuery) {
		const trackUrl =
			playlist.id === "likedSongs"
				? `${spotifyApi}/me/tracks?offset=0&limit=50`
				: `${spotifyApi}/playlists/${playlist["id"]}/tracks?offset=0&limit=50`;
		const currSongs = await getTracks(trackUrl);
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

	const artistGenres = await grabGenres(songs);
	const songsWithGenres = songs.map(song => {
		for (const artist of song.artists) {
			artist.genres = artistGenres.get(artist.id);
		}
		return song;
	});

	/*
	 * Second iteration over playlistsToQuery. While obviously not ideal, this allows algorithms with genre conditions to be updated
	 * without introducing duplicate calls to Spotify's API for artist genres
	 */
	let algSongMap = new Map();
	for (const playlist of playlistsToQuery) {
		const playlistSongIds = playlistSongMap.get(playlist.id);
		const fullSongs = songsWithGenres.filter(song => playlistSongIds.includes(song.id));
		const matchingAlgs = algorithmHelper.filterAlgorithms(playlist.id, algorithms);
		adjAlgs = [...adjAlgs, ...updateAlgorithms(matchingAlgs, playlist, fullSongs, algSongMap)];
	}

	const algPlaylistsUpdate = updateAlgorithmPlaylists(algPlaylists, algSongMap, algorithms);

	const playlists = [...playlistsToQuery, ...algPlaylistsUpdate.algPlaylists];
	playlistHelper.writePlaylists(playlists);
	algorithmHelper.writeAlgorithms([...adjAlgs, ...algPlaylistsUpdate.algPlaylistAlgs]);
	songHelper.writeSongs(songsWithGenres, [
		...playlistSongs,
		...algPlaylistsUpdate.algPlaylistSongs
	]);

	screen.setPlaylists(playlists.filter(playlist => playlist.visible));

	authHelper.setRefreshing(false);
};

async function getPlaylists(hiddenPlaylists) {
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

	const mappedPlayists = playlists.map(playlist => ({
		id: playlist.id,
		name: playlist.name,
		visible: !hiddenPlaylists.includes(playlist.id)
	}));
	return playlistHelper.sortPlaylists(mappedPlayists);
}

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

async function getTracks(initialUrl) {
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

	const songs = Array.from(items.reduce((map, item) => map.set(item.track.id, item), new Map()).values());
	return orderSongs(songs, "added_at", false)
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
	for (const artistChunk of chunkItems(artists, 50)) {
		const artistResp = await axios.get(`${spotifyApi}/artists`, {
			headers: {
				Authorization: `Bearer ${await authHelper.getAccessToken()}`
			},
			params: {
				ids: artistChunk.join(",")
			}
		});

		for (const artist of artistResp.data.artists) {
			artistGenreMap.set(artist.id, artist.genres);
		}
	}
	return artistGenreMap;
}

function updateAlgorithmPlaylists(algPlaylists, algSongMap, algorithms) {
	let algPlaylistSongs = [];
	let algPlaylistAlgs = [];
	for (const algPlaylist of algPlaylists) {
		const songs = algSongMap.get(algPlaylist.algorithmId);
		algPlaylist.songCount = songs.length;

		playlistHelper.setPlaylistItems(algPlaylist.id, songs);

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
