const axios = require("axios");
const authHelper = require("../backend/authHelper.js");

exports.spotifyLogin = async (req, res) => {
	try {
		const recState = decodeURIComponent(req?.query?.state);
		const state = authHelper.getState();
		authHelper.setState(null);
		if (state !== recState) {
			throw new Error(
				"Received state does not match expectations. Finish authentication in less than 30 seconds."
			);
		}

		const userCode = decodeURIComponent(req?.query?.code);
		const clientId = authHelper.getClientId();
		const clientSecret = authHelper.getClientSecret();

		const resp = await axios.post(
			"https://accounts.spotify.com/api/token",
			{
				grant_type: "authorization_code",
				code: userCode,
				redirect_uri: "http://127.0.0.1:3438/spotifyLogin"
			},
			{
				headers: {
					"content-type": "application/x-www-form-urlencoded",
					Authorization: `Basic ${new Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`
				}
			}
		);

		const accessToken = resp.data?.access_token;
		const refreshToken = resp.data?.refresh_token;
		if (!accessToken || !refreshToken) {
			throw new Error("Invalid tokens received from Spotify. Restart app and try again.");
		}
		authHelper.setTokens(accessToken, refreshToken);

		res.send("Authorization successful. Restart app to begin shuffling.");
		process.exit(0);
	} catch (error) {
		res.send(error.message);
		process.exit(0);
	}
};
