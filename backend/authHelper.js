const axios = require("axios");
const path = require("path");
const fs = require("fs");
const variables = require("../database/variables.json");

exports.getAccessToken = async function () {
	const accessToken = variables.accessToken;
	const lastRefresh = new Date(accessToken.lastRefresh);
	const currDate = new Date();
	const diff = currDate - lastRefresh;
	if (diff < 3600000) {
		return accessToken.value;
	}

	const refreshResp = await axios.post(
		"https://accounts.spotify.com/api/token",
		{
			grant_type: "refresh_token",
			refresh_token: variables.refreshToken
		},
		{
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${new Buffer.from(
					`${variables.clientId}:${variables.clientSecret}`
				).toString("base64")}`
			}
		}
	);
	if (refreshResp?.data?.access_token == null) {
		throw new Error("Refresh token request failed!");
	}

	const newAccessToken = {
		value: refreshResp.data.access_token,
		lastRefresh: currDate
	};
	variables.accessToken = newAccessToken;

	const targetPath = path.join(__dirname, "../database", "variables.json");
	fs.writeFile(targetPath, JSON.stringify(variables), err => {
		if (err) {
			console.error(err);
			return;
		}
	});

	return refreshResp.data.access_token;
};
