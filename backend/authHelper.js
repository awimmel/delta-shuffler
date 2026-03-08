const axios = require("axios");
const path = require("path");
const fs = require("fs");

const getAppDataDir = require("../utilities/getAppDataDir.js");

const filePath = path.join(getAppDataDir(), "settings.json");

exports.getAccessToken = async function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	const accessToken = settings.accessToken;
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
			refresh_token: settings.refreshToken
		},
		{
			headers: {
				"content-type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${new Buffer.from(
					`${settings.clientId}:${settings.clientSecret}`
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
	settings.accessToken = newAccessToken;

	fs.writeFileSync(filePath, JSON.stringify(settings), err => {
		if (err) {
			console.error(err);
			return;
		}
	});

	return refreshResp.data.access_token;
};

exports.getState = function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return settings.state;
};

exports.setState = function (newState) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings.state = newState;
	fs.writeFileSync(filePath, JSON.stringify(settings), err => {
		throw new Error(err);
	});
};

exports.getClientId = function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return settings.clientId;
};

exports.setClientId = function (newClientId) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings.clientId = newClientId;
	fs.writeFileSync(filePath, JSON.stringify(settings), err => {
		throw new Error(err);
	});
};

exports.getClientSecret = function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return settings.clientSecret;
};

exports.setClientSecret = function (newClientSecret) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings.clientSecret = newClientSecret;
	fs.writeFileSync(filePath, JSON.stringify(settings), err => {
		throw new Error(err);
	});
};

exports.setTokens = function (accessToken, refreshToken) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));

	settings.accessToken = {
		value: accessToken,
		lastRefresh: new Date()
	};
	settings.refreshToken = refreshToken;

	fs.writeFileSync(filePath, JSON.stringify(settings), err => {
		throw new Error(err);
	});
};

exports.getUserId = function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return settings.userId;
};

exports.setUserId = function (newUserId) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings.userId = newUserId;
	fs.writeFileSync(filePath, JSON.stringify(settings), err => {
		throw new Error(err);
	});
};

exports.getRefreshToken = function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return settings.refreshToken;
};

exports.getRefreshing = function () {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	return settings.refreshing;
};

exports.setRefreshing = function (newRefreshing) {
	const settings = JSON.parse(fs.readFileSync(filePath, "utf8"));
	settings.refreshing = newRefreshing;
	fs.writeFileSync(filePath, JSON.stringify(settings), err => {
		throw new Error(err);
	});
};
