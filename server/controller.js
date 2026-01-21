const axios = require("axios");
const fs = require("fs");
const path = require("path");
const authHelper = require("../backend/authHelper.js");
const variables = require("../database/variables.json");

const spotifyApi = "https://api.spotify.com/v1";
const authFailed = "Authorization Failed!";
const pagePath = path.join(__dirname, "./", "resp.html");
const backgroundPath = path.join(__dirname, "../assets", "background.png");

exports.spotifyLogin = async (req, res) => {
	try {
		const recState = decodeURIComponent(req?.query?.state);
		const state = authHelper.getState();
		authHelper.setState(null);

		if (state !== recState) {
			res.send(
				generateHtmlPage(
					authFailed,
					"Received state does not match expectations. Finish authentication in less than 30 seconds."
				)
			);
			setTimeout(() => process.exit(0), 100);
			return;
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
					Authorization: `Basic ${new Buffer.from(`${clientId}:${clientSecret}`).toString(
						"base64"
					)}`
				}
			}
		);

		const accessToken = resp.data?.access_token;
		const refreshToken = resp.data?.refresh_token;
		if (!accessToken || !refreshToken) {
			res.send(
				generateHtmlPage(
					authFailed,
					"Invalid tokens received from Spotify. Restart app and try again."
				)
			);
			setTimeout(() => process.exit(0), 100);
			return;
		}
		authHelper.setTokens(accessToken, refreshToken);

		const meResp = await axios.get(`${spotifyApi}/me`, {
			headers: { Authorization: `Bearer ${accessToken}` }
		});
		const userId = meResp.data.id;
		if (!userId) {
			res.send(
				generateHtmlPage(authFailed, "Unable to retrieve User ID. Restart app and try again.")
			);
			setTimeout(() => process.exit(0), 100);
			return;
		}
		authHelper.setUserId(userId);

		res.send(
			generateHtmlPage(
				"Authorization Successful!",
				"Close this window and return to the app to begin."
			)
		);
	} catch (error) {
		res.send(error.message);
	}
};

function generateHtmlPage(title, desc) {
	let respPage = fs.readFileSync(pagePath, "utf8");
	respPage = respPage.replace("{{TITLE}}", title);
	respPage = respPage.replace("{{DESC}}", desc);
	respPage = respPage.replace("\"{{TEXT_COLOR}}\"", variables.primaryColor);

	const imageBuffer = fs.readFileSync(backgroundPath);
	const base64Image = imageBuffer.toString("base64");
	const mimeType = "image/png";
	respPage = respPage.replace("{{BACKGROUND}}", `data:${mimeType};base64,${base64Image}`);

	return respPage;
}
