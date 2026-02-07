const axios = require("axios");
const authHelper = require("./authHelper.js");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const spotifyApi = "https://api.spotify.com/v1";
const imagePath = path.join(__dirname, "../tmp", `album_cover.png`);
let currPlayingId = "";

exports.queueSongs = async function (songs) {
	const accessToken = await authHelper.getAccessToken();

	const queuePromises = [];
	let counter = 0;
	while (counter < songs.length) {
		queuePromises.push(
			axios.post(`${spotifyApi}/me/player/queue`, null, {
				headers: { Authorization: `Bearer ${accessToken}` },
				params: {
					uri: `spotify:track:${songs[counter]}`
				}
			})
		);
		counter++;
	}

	try {
		await Promise.all(queuePromises);
	} catch {}
};

exports.getCurrPlaying = async function () {
	const accessToken = await authHelper.getAccessToken();
	const resp = await axios.get(`${spotifyApi}/me/player/currently-playing`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (resp.data === "") {
		return {
			playing: false,
			content: ""
		};
	}

	const song = resp.data.item;
	if (currPlayingId !== song.id) {
		const imageUrl = song.album.images.at(0);
		const response = await axios.get(imageUrl.url, { responseType: "arraybuffer" });
		await sharp(response.data).png().toFile(imagePath);
		currPlayingId = song.id;
	}

	const artistStr = song.artists.map(artist => artist.name).join(", ");
	return {
		playing: resp.data.is_playing,
		content: song.name + " - " + artistStr,
		songId: song.id,
		spot: resp.data.progress_ms,
		duration: resp.data.item.duration_ms
	};
};

exports.playSong = async function () {
	const accessToken = await authHelper.getAccessToken();
	try {
		await axios.put(`${spotifyApi}/me/player/play`, null, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		return true;
	} catch {
		return false;
	}
};

exports.pauseSong = async function () {
	const accessToken = await authHelper.getAccessToken();
	try {
		await axios.put(`${spotifyApi}/me/player/pause`, null, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		return true;
	} catch {
		return false;
	}
};

exports.skipSong = async function () {
	const accessToken = await authHelper.getAccessToken();
	try {
		await axios.post(`${spotifyApi}/me/player/next`, null, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
	} catch {}
};

exports.prevSong = async function () {
	const accessToken = await authHelper.getAccessToken();
	try {
		const resp = await axios.get(`${spotifyApi}/me/player`, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		const rewind = resp.data.progress_ms >= 3000;
		if (rewind) {
			await axios.put(`${spotifyApi}/me/player/seek`, null, {
				headers: { Authorization: `Bearer ${accessToken}` },
				params: {
					position_ms: 0
				}
			});
		} else {
			await axios.post(`${spotifyApi}/me/player/previous`, null, {
				headers: { Authorization: `Bearer ${accessToken}` }
			});
		}
	} catch {}
};

exports.reshuffleSongs = async function () {
	const accessToken = await authHelper.getAccessToken();
	await axios.put(`${spotifyApi}/me/player/shuffle?state=false`, null, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
	await axios.put(`${spotifyApi}/me/player/shuffle?state=true`, null, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});
};
