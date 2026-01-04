const axios = require("axios");
const path = require("path");
const fs = require("fs");

const filePath = path.join(__dirname, "../database", "variables.json");

exports.getAccessToken = async function () {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
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

	fs.writeFileSync(filePath, JSON.stringify(variables), err => {
		if (err) {
			console.error(err);
			return;
		}
	});

	return refreshResp.data.access_token;
};

exports.getState = function () {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return variables.state;
};

exports.setState = function (newState) {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	variables.state = newState;
	fs.writeFileSync(filePath, JSON.stringify(variables), err => {
		throw new Error(err);
	});
};

exports.getClientId = function () {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return variables.clientId;
};

exports.setClientId = function (newClientId) {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	variables.clientId = newClientId;
	fs.writeFileSync(filePath, JSON.stringify(variables), err => {
		throw new Error(err);
	});
};

exports.getClientSecret = function () {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return variables.clientSecret;
};

exports.setClientSecret = function (newClientSecret) {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));
	variables.clientSecret = newClientSecret;
	fs.writeFileSync(filePath, JSON.stringify(variables), err => {
		throw new Error(err);
	});
};

exports.setTokens = function (accessToken, refreshToken) {
	const variables = JSON.parse(fs.readFileSync(filePath, "utf8"));

	variables.accessToken = {
		value: accessToken,
		lastRefresh: new Date()
	};
	variables.refreshToken = refreshToken;

	fs.writeFileSync(filePath, JSON.stringify(variables), err => {
		throw new Error(err);
	});
};
