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
}
