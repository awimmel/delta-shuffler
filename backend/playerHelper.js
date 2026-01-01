const axios = require("axios");
const authHelper = require("./authHelper.js");

const spotifyApi = "https://api.spotify.com/v1";

exports.queueSongs = async function (songs) {
	const accessToken = await authHelper.getAccessToken();

	const queuePromises = [];
	let counter = 0;
	while (counter < songs.length) {
		queuePromises.push(
			axios.post(`${spotifyApi}/me/player/queue`, null, {
				params: {
					uri: `spotify:track:${songs[counter]}`
				},
				headers: { Authorization: `Bearer ${accessToken}` }
			})
		);
		counter++;
	}
	await Promise.all(queuePromises);
};

exports.getCurrPlaying = async function () {
	const accessToken = await authHelper.getAccessToken();
	const resp = await axios.get(`${spotifyApi}/me/player/currently-playing`, {
		headers: { Authorization: `Bearer ${accessToken}` }
	});

	if (resp.data === "") {
		return "";
	}

	const song = resp.data.item.name;
	const artistStr = resp.data.item.artists.map(artist => artist.name).join(", ");
	return song + " - " + artistStr;
};
